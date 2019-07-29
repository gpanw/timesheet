from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from datetime import datetime, timedelta
from .models import timesheet
from project.models import task, leave, teams
from userprofile.models import userprofile
from django.contrib.auth.models import User, Group
import json
from django.http import JsonResponse
from django.core.mail import send_mail
from django.core.exceptions import ObjectDoesNotExist


@login_required(login_url='/login/')
def current(request):
    user = request.user
    if request.is_ajax():
        if request.POST:
            if request.POST['from'] == 'addtimesheet':
                selected_week = request.POST['selectedWeek']
                s = " ".join(selected_week.split(" ")[1:4])
                select_date = datetime.strptime(s, "%b %d %Y").date()
                hours_list = request.POST.getlist('hoursList[]')
                added_task = request.POST.getlist('addedtask[]')
                task_json = json.loads(added_task[0])
                i = 0
                leave_list = [x.leave_id for x in leave.objects.all()]
                for t in task_json:
                    hr = json.dumps(hours_list[7*i:7+7*i])
                    i = i+1
                    vc = validate_values(t, select_date, hr, user, leave_list)
                    if vc == "success":
                        pass
                    else:
                        return JsonResponse({'rc': vc}, safe=False)
                i = 0
                for t in task_json:
                    hours = json.dumps(hours_list[7*i:7+7*i])
                    i = i+1
                    rc = add_timesheet(t, select_date, hours, user, leave_list)
                return JsonResponse({'rc': rc}, safe=False)

        if request.GET:
            if request.GET['from'] == 'getTimeSheet':
                selected_week = request.GET['selectedWeek']
                s = " ".join(selected_week.split(" ")[1:4])
                select_date = datetime.strptime(s, "%b %d %Y").date()
                current_sheet = fetch_timesheet('', select_date, user)
                return JsonResponse(current_sheet, safe=False)
            if request.GET['from'] == 'getTaskOtherTeam':
                team_name = request.GET['teamname']
                task_list = task.objects.filter(task_group=team_name,
                                                task_status='OP')
                task_data = []
                for val in task_list:
                    json_data = {'taskname': val.task_name,
                                 'is_billable': val.is_billable
                                 }
                    task_data.append(json_data)
                return JsonResponse(task_data, safe=False)

    parms = {'current_user': user}
    parms['leave_tasks'] = leave.objects.all()
    task_list = []
    u = userprofile.objects.get(user_id__username=user.username)
    task_list = task.objects.filter(task_group=u.project,
                                    task_status='OP')
    parms['is_manager'] = user.is_staff
    parms['task_list'] = task_list
    parms['teamlist'] = [n.team_name for n in teams.objects.all()]
    return render(request, 'template/timesheet.html', parms)


def is_ajax():
    return META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest'


# functions to fetch tasks from database
def fetch_task(task_filter=None):
    kwargs = dict()
    args = ()
    kwargs['task_group']=task_filter
    try:
        taskData = task.objects.filter(*args, **kwargs)
    except:
        print('fetch error')
    return taskData


def fetch_timesheet(taskid, date, user):
    """functions to fetch timesheet from database
       INPUT: taskid, date and user
    """
    kwargs = dict()
    args = ()
    jsonDec = json.decoder.JSONDecoder()
    kwargs['user'] = user
    if taskid:
        kwargs['taskid'] = taskid
    if date:
        kwargs['date'] = date
    try:
        sheetdata = timesheet.objects.filter(*args, **kwargs).order_by('tstamp')
    except ObjectDoesNotExist:
        return 0
    else:
        timesheetdata = []
        for val in sheetdata:
            JsonData = {'taskid': val.taskid,
                        'hours': jsonDec.decode(val.hours),
                        'approved': val.approved,
                        'approved_by': val.approved_by,
                        'sheet_date': val.date,
                        'is_billable': val.is_billable,
                        'sum_hours': val.sum_hours
                        }
            timesheetdata.append(JsonData)
        return timesheetdata


def update_timesheet(t, date, hours, user, leave_list=[]):
    kwargs = dict()
    args = ()
    task_name = t['taskid']
    is_billable = t['billable']
    kwargs['taskid'] = task_name
    kwargs['date'] = date
    kwargs['user'] = user.username
    kwargs['is_billable'] = is_billable
    try:
        updaterow = timesheet.objects.get(*args, **kwargs)
    except ObjectDoesNotExist:
        return 0
    else:
        if task_name.split(' - ')[0] in leave_list:
            previous_hours = updaterow.hours
            jsonDec = json.decoder.JSONDecoder()
            hr = jsonDec.decode(previous_hours)
            totalPre = sum([float(i) for i in hr])
            jsonDec = json.decoder.JSONDecoder()
            hr = jsonDec.decode(hours)
            totalCurr = sum([float(i) for i in hr])
            adjusted = totalCurr - totalPre
            update_userleave(user, task_name.split(' - ')[0], adjusted)
        updaterow.hours = hours
        updaterow.save()
        return 1


def add_timesheet(t, date, hours, user, leave_list=[]):
    update_return = update_timesheet(t, date, hours, user, leave_list)
    task_name = t['taskid']
    is_billable = t['billable']
    if update_return:
        return update_return
    else:
        addTimesheet = timesheet(taskid=task_name,
                                 date=date,
                                 hours=hours,
                                 user=user,
                                 is_billable=is_billable)
        try:
            addTimesheet.save()
        except Exception as e:
            return 0
        else:
            if task_name.split(' - ')[0] in leave_list:
                jsonDec = json.decoder.JSONDecoder()
                hr = jsonDec.decode(hours)
                totalCurr = sum([float(i) for i in hr])
                update_userleave(user, task_name.split(' - ')[0], totalCurr)
            return 1


def update_userleave(user, t, hour):
    u = userprofile.objects.get(user_id=user)
    if t == 'EL':
        u.earned_leave = str(float(u.earned_leave) - hour)
    if t == 'CL':
        u.casual_leave = str(float(u.casual_leave) - hour)
    u.save()


def validate_values(t, date, hours, user, leave_list):
    task_name = t['taskid']
    is_billable = t['billable']
    json_dec = json.decoder.JSONDecoder()
    hr = json_dec.decode(hours)
    if task_name.split(' - ')[0] in leave_list:
        u = userprofile.objects.get(user_id=user)
        if task_name == 'EL':
            if sum([float(x) for x in hr]) > u.earned_leave:
                return "earned leaves exceeded the limit"
        if task_name == 'CL':
            if sum([float(x) for x in hr]) > u.casual_leave:
                return "casual leaves exceeded the limit"
        return "success"
    try:
        get_task_id = task.objects.get(task_name=task_name,
                                       is_billable=is_billable)
    except ObjectDoesNotExist:
        return 'task ' + task_name + ' is not correct!!!'
  
    for h in hr:
        try:
            float(h)
        except:
            return "non integer hours"
        
    if date >= get_friday(timezone.now()).date():
        pass
    else:
        return "Previous week!!Do a Prior Time adjustment"
    return "success"
        

def get_friday(date):
    day = date.weekday()
    n = 4 - day
    if n >= 0:
        fridate = date + timedelta(n)
    else:
        fridate = date + timedelta(n) + timedelta(7)
    return fridate
    
    

