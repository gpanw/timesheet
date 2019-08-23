from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from datetime import datetime, timedelta
from current.models import timesheet
from project.models import leave, teams, task
from userprofile.models import userprofile
from current.views import fetch_timesheet
from .models import priorsheet
from django.contrib.auth.models import User, Group
import json, re
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist


@login_required(login_url='/login/')
def priortime(request):
    user = request.user
    if request.is_ajax():
        if request.POST:
            if request.POST['from'] == 'addtimesheet':
                selectedWeek = request.POST['selectedWeek']
                s = " ".join(selectedWeek.split(" ")[1:4])
                selectDate = datetime.strptime(s, "%b %d %Y").date()
                hoursList = request.POST.getlist('hoursList[]')
                addedtask = request.POST.getlist('addedtask[]')
                taskJson = json.loads(addedtask[0])
                i = 0
                leave_list = [x.leave_id for x in leave.objects.all()]
                for t in taskJson:
                    hr = json.dumps(hoursList[7*i:7+7*i])
                    i = i+1
                    vc = validate_values(t, selectDate, hr, user, leave_list)
                    if vc == "success":
                        pass
                    else:
                        return JsonResponse({'rc': vc}, safe=False)
                i = 0
                for t in taskJson:
                    hours = json.dumps(hoursList[7*i:7+7*i])
                    i = i+1
                    rc = add_prior(t, selectDate, hours, user)
                return JsonResponse({'rc': rc}, safe=False)

        if request.GET:
            if request.GET['from'] == 'getTimeSheet':
                selectedWeek = request.GET['selectedWeek']
                s = " ".join(selectedWeek.split(" ")[1:4])
                selectDate = datetime.strptime(s, "%b %d %Y").date()
                current = fetch_prior('', selectDate, user)
                return JsonResponse(current, safe=False)
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
    u = userprofile.objects.get(user_id__username=user.username)
    task_list = task.objects.filter(task_group=u.project,
                                    task_status='OP')
    parms['is_manager'] = user.is_staff
    parms['task_list'] = task_list
    parms['teamlist'] = [n.team_name for n in teams.objects.all()]
    return render(request, 'template/priortime.html', parms)


def is_ajax():
    return META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest'


def fetch_prior(taskid, date, user):
    '''function to fetch data from priorsheet.
       used in - priortime.views
    '''
    kwargs = dict()
    args = ()
    jsonDec = json.decoder.JSONDecoder()
    kwargs['user'] = user
    if taskid:
        kwargs['taskid'] = taskid
    if date:
        kwargs['date'] = date

    kwargs['approved'] = 'N'
    sheetdata = priorsheet.objects.filter(*args, **kwargs).order_by('tstamp')
    if sheetdata:
        timesheetdata = []
        for val in sheetdata:
            JsonData = {'taskid': val.taskid,
                        'hours': jsonDec.decode(val.hours),
                        'approved': val.approved,
                        'sheet_date': val.date,
                        'is_billable': val.is_billable
                        }
            timesheetdata.append(JsonData)
        return timesheetdata
    else:
        timesheetdata = fetch_timesheet(taskid, date, user)
        if timesheetdata:
            return timesheetdata
        else:
            return 0
        
        
def add_prior(t, date, hours, user):
    task_name = t['taskid']
    is_billable = t['billable']
    addpriorsheet = priorsheet(taskid=task_name,
                               date=date,
                               hours=hours,
                               is_billable=is_billable,
                               user=user)
    try:
        addpriorsheet.save()
    except Exception as e:
        return e
    else:
        return 1


def validate_values(t, date, hours, user, leave_list):
    task_name = t['taskid']
    is_billable = t['billable']
    jsonDec = json.decoder.JSONDecoder()
    hr = jsonDec.decode(hours)
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
    return "success"

