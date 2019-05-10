from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from datetime import datetime, timedelta
from current.models import timesheet
from project.models import leave, teams
from current.views import fetch_timesheet
from userprofile.models import userprofile
from priortime.models import priorsheet
from django.contrib.auth.models import User, Group
import json
from django.http import JsonResponse
from django.http import Http404
from django.core import exceptions


@login_required(login_url='/login/')
def manager(request):
    user = request.user
    parms = dict()
    parms['current_user'] =  user
    parms['lastname'] = user.last_name
    parms['firstname'] = user.first_name
    parms['email'] = user.email
    parms['access'] = 0
    try:
        userdata = userprofile.objects.get(user_id__username=user.username)
    except:
        raise Http404("user profile is not created yet!!! Contact your manager or admin.")
    else:
        parms['role'] = userdata.user_role 
        if 'Manager' in userdata.user_role:
            parms['access'] = 1
        else:
            raise Http404("user not autheticated to view this page")

    return render(request,'template/managerpage.html',parms)


@login_required(login_url='/login/')
def approvetimesheet(request):
    user = request.user
    parms = {'current_user':user}
    try:
        userdata = userprofile.objects.get(user_id__username=user.username)
    except:
        raise Http404("user profile is not created yet!!! Contact your manager or admin.")
    else:
        parms['role'] = userdata.user_role 
        if 'Manager' in userdata.user_role:
            pass
        else:
            raise Http404("user not autheticated to view this page")
    if request.is_ajax():
        if request.GET:
            if request.GET['from'] == 'getUserSheet':
                forUser = request.GET['requestedUser']
                selectedWeek = request.GET['requestedDate']
                s = " ".join(selectedWeek.split(" ")[1:4])
                forDate = datetime.strptime(s, "%b %d %Y").date()
                timesheetdata = fetch_timesheet('',forDate,forUser)
                return JsonResponse(timesheetdata,safe=False)
        if request.POST:
            if request.POST['from'] == 'rejectSheet':
                forUser = request.POST['userid']
                selectedWeek = request.POST['sendDate']
                s = " ".join(selectedWeek.split(" ")[1:4])
                forDate = datetime.strptime(s, "%b %d %Y").date()
                vc = validate_request(forUser, forDate, user)
                if vc == "valid":
                    pass
                else:
                    return JsonResponse({'rc': vc, 'status': vc, 'forDate': forDate}, safe=False)
                rc = delete_timesheet(forUser, forDate)
                return JsonResponse({'rc': rc}, safe=False)
                
    userlist = userprofile.objects.values_list('user_id__username', flat=True).filter(manager_id=user.username)
    parms['userlist'] = list(set(userlist))
    u = userprofile.objects.get(user_id__username=user.username)
    parms['role'] = u.user_role
    return render(request,'template/approvetimesheet.html', parms)


@login_required(login_url='/login/')
def approveprior(request):
    user = request.user
    parms = {'current_user': user}
    try:
        userdata = userprofile.objects.get(user_id__username=user.username)
    except:
        raise Http404("user profile is not created yet!!! Contact your manager or admin.")
    else:
        parms['role'] = userdata.user_role 
        if 'Manager' in userdata.user_role:
            pass
        else:
            raise Http404("user not autheticated to view this page")
    if request.is_ajax():
        if request.GET:
            if request.GET['from'] == 'getUserSheet':
                requesteduser = request.GET['requesteduser']
                current = fetch_prior(requesteduser)
                return JsonResponse(current,safe=False)
        if request.POST:
            if request.POST['from'] == 'approveSheet':
                status = request.POST['status']
                forUser = request.POST['userid']
                selectedWeek = request.POST['sendDate']
                s = " ".join(selectedWeek.split(" ")[1:4])
                forDate = datetime.strptime(s, "%b %d %Y").date()
                vc = validate_request(forUser, forDate, user)
                if vc == "valid":
                    pass
                else:
                    return JsonResponse({'rc': vc, 'status': status, 'forDate': forDate}, safe=False)
                if status == "approve":
                    rc = approve_prior(forUser, forDate, user)
                elif status == "reject":
                    rc = delete_prior(forUser, forDate)
                else:
                    rc = "Unknown request"
                return JsonResponse({'rc': rc, 'status': status, 'forDate': forDate},safe=False)
                
    u = userprofile.objects.values_list('user_id__username', flat=True).filter(manager_id=user.username)
    userlist = priorsheet.objects.values_list('user', flat=True).filter(user__in=u)
    parms['userlist'] = list(set(userlist))
    u = userprofile.objects.get(user_id__username=user.username)
    parms['role'] = u.user_role
    return render(request, 'template/approveprior.html', parms)


@login_required(login_url='/login/')
def useradmin(request):
    user = request.user
    parms = {'current_user':user}
    try:
        userdata = userprofile.objects.get(user_id__username=user.username)
    except:
        raise Http404("user profile is not created yet!!! Contact your manager or admin.")
    else:
        parms['role'] = userdata.user_role 
        if 'Manager' in userdata.user_role:
            pass
        else:
            raise Http404("user not autheticated to view this page")
    if request.is_ajax():
        if request.POST:
            if request.POST['from'] == 'addUserInfo':
                kwargs = dict()
                kwargs['user'] = user
                kwargs['user_id'] = request.POST['user_id']
                kwargs['location'] = request.POST['location']
                kwargs['lastname'] = request.POST['lastname']
                kwargs['firstname'] = request.POST['firstname']
                kwargs['email'] = request.POST['email']
                kwargs['mobile'] = request.POST['mobile']
                kwargs['role'] = request.POST['role']
                kwargs['manager_id'] = request.POST['manager_id']
                kwargs['project'] = request.POST['project']
                kwargs['joined'] = request.POST['joined']
                vc = validate_userinfo(**kwargs)
                if vc == "valid":
                    pass
                else:
                    return JsonResponse({'rc': vc}, safe=False)
                rc = update_userinfo(**kwargs)
                return JsonResponse({'rc': rc}, safe=False)
        if request.GET:
            if request.GET['from'] == 'getUserInfo':
                userid = request.GET['userid']
                try:
                    u = userprofile.objects.get(user_id__username=userid)
                except:
                    pass
                else:
                    res = dict()
                    res['lastname'] = u.user_id.last_name
                    res['firstname'] = u.user_id.first_name
                    res['email'] = u.user_id.email
                    res['earned'] = u.earned_leave
                    res['casual'] = u.casual_leave
                    res['location'] = u.user_location
                    res['role'] = u.user_role
                    res['manager_id'] = u.manager_id
                    res['mobile'] = u.user_mobile
                    res['project'] = u.project
                    res['joined'] = u.joined_on
                return JsonResponse(res)

    userlist = []
    managerlist = []
    try:
        userlist = userprofile.objects.values_list('user_id__username', flat=True).filter(manager_id=user.username)
    except Exception as e:
        pass
    try:
        managerlist = userprofile.objects.values_list('user_id__username', flat=True).filter(user_role="Manager")
    except Exception as e:
        pass
    parms['userlist'] = userlist
    parms['managerlist'] = managerlist
    u = userprofile.objects.get(user_id__username=user.username)
    parms['role'] = u.user_role
    return render(request,'template/useradmin.html',parms)


@login_required(login_url='/login/')
def task_admin(request):
    user = request.user
    parms = {'current_user': user}
    user_data = userprofile.objects.get(user_id__username=user.username)
    if user_data:
        parms['role'] = user_data.user_role
        if 'Manager' in user_data.user_role:
            pass
        else:
            raise Http404("user doesn't have access to view this page")
    else:
        raise Http404("User profile is not created yet!!! Contact your manager or admin.")

    if request.is_ajax():
        if request.GET:
            if request.GET['from'] == 'getSuggestions':
                tasks = []
                searchStr = request.GET['searchStr']
                user_project = user_data.project
                task_data = task.objects.filter(task_name__icontains=searchStr,
                                                task_group=user_project,
                                                task_type='TS')
                for t in task_data:
                    json_data = {'taskName': t.task_name,
                                 'taskDescription': t.task_description,
                                 'taskStatus': t.get_task_status_display()}
                    tasks.append(json_data)
                return JsonResponse(tasks, safe=False)
            if request.GET['from'] == 'getSubTask':
                task_name = request.GET['taskid']
                user_project = user_data.project
                sub_task_list = task.objects.values_list('task_name', flat=True).filter(parent_task=task_name,
                                                                                        task_group=user_project)
                for sub_task in sub_task_list:
                    sheet_list = timesheet.objects.filter(task_sub=sub_task, task_team=user_project)
                    for h in sheet_list:
                        hours = sheet_list.hours
                        print('g1', hours)
                return JsonResponse(list(sub_task_list), safe=False)

            if request.GET['from'] == 'getTeams':
                team_list = teams.objects.values_list('team_name', flat=True).filter(team_lead=user.username)
                if team_list:
                    return JsonResponse(list(team_list), safe=False)

        if request.POST:
            if request.POST['from'] == 'updateTaskInfo':
                taskid = request.POST['taskid']
                value = request.POST['value']
                taskdata = task.objects.get(task_no=taskid)
                if str(user.username) == taskdata.task_group.team_lead:
                    taskdata.task_description = value
                    taskdata.save()
                    return JsonResponse({'rc': 1}, safe=False)
                else:
                    rc = "User is not authorized!!"
                    return JsonResponse({'rc': rc}, safe=False)
    user_project = user_data.project
    project_list = task.objects.filter(task_group=user_project, task_type='TS').distinct()
    task_list = [x for x in project_list]
    parms['tasklist'] = task_list
    return render(request, 'template/taskadmin.html', parms)


def is_ajax():
    return META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest'


def validate_userinfo(*args, **kwargs):
    try:
        u = userprofile.objects.get(user_id__username=kwargs['user_id'])
    except:
        return "invalid user"
    else:
        if u.manager_id == str(kwargs['user']):
            pass
        else:
            return "You are not authorized to change this user id"
    return "valid"


def update_userinfo(*args,**kwargs):
    try:
        u = userprofile.objects.get(user_id__username=kwargs['user_id'])
    except Exception as e:
        return "Error! not saved"
    else:
        u.user_location = kwargs['location']
        u.user_role = kwargs['role']
        u.user_mobile = kwargs['mobile']
        u.manager_id = kwargs['manager_id']
        u.project = kwargs['project']
        u.joined_on = kwargs['joined']
        u.save()
        try:
            us = User.objects.get(username=kwargs['user_id'])
        except Exception as e:
            return "Error! not saved"
        else:
            us.last_name = kwargs['lastname']
            us.first_name = kwargs['firstname']
            us.email = kwargs['email']
            us.save()
            return 1


def fetch_prior(user):
    '''function to fetch data from priorsheet.
       used in - managerpage.views
    '''
    kwargs = dict()
    args = ()
    jsonDec = json.decoder.JSONDecoder()
    kwargs['user'] = user
    kwargs['approved'] = 'N'
    try:
        sheetdata = priorsheet.objects.filter(*args,**kwargs).order_by('tstamp')
    except Exception as e:
        return 0
    else:
        timesheetdata = []
        for val in sheetdata:
            JsonData = {'taskid': val.taskid,
                        'subtask': val.task_sub,
                        'hours': jsonDec.decode(val.hours),
                        'approved': val.approved,
                        'taskTeam': val.task_team,
                        'sheetdate': val.date
                }
            timesheetdata.append(JsonData)
        return timesheetdata


def validate_request(forUser, forDate, user):
    try:
        userdata = userprofile.objects.get(user_id__username=forUser)
    except Exception as e:
        return "Invalid user"
    else:
        user_manager = userdata.manager_id
        if str(user_manager) == user.username:
            pass
        else:
            return "you are not authorized to perform task for this user"
        return "valid"


def delete_prior(forUser, forDate):
    kwargs = dict()
    args=()
    kwargs["user"] = forUser
    kwargs["date"] = forDate
    try:
        sheetdata = priorsheet.objects.filter(*args, **kwargs)
    except Exception as e:
        return "Server Error"
    else:
        try:
            sheetdata.delete()
        except Exception as e:
            return "Server Error"
        else:
            return 1


def approve_prior(forUser, forDate, user):
    kwargs = dict()
    args = ()
    kwargs["user"] = forUser
    kwargs["date"] = forDate
    try:
        priorsheetdata = priorsheet.objects.filter(*args, **kwargs)
    except ObjectDoesNotExist:
        return "Time sheet has already been approved or rejected"
    else:
        leave_list = [x.leave_id for x in leave.objects.all()]
        try:
            sheetdata = timesheet.objects.filter(*args, **kwargs)
        except ObjectDoesNotExist:
            pass
        else:
            for val in sheetdata:
                taskid = val.taskid
                hours = val.hours
                t = taskid.split('-')[0].replace(' ', '')
                if t in leave_list:
                    jsonDec = json.decoder.JSONDecoder()
                    hr = jsonDec.decode(hours)
                    totalCurr = sum([float(i) for i in hr])
                    update_userleave(forUser, t, totalCurr*-1)
            sheetdata.delete()
        
        for val in priorsheetdata:
            taskid = val.taskid
            subtask = val.task_sub
            task_team = val.task_team
            selectDate = val.date
            hours = val.hours
            rc = add_timesheet(taskid, subtask, task_team, selectDate, hours, forUser, user, leave_list)
            if not rc:
                break
        if rc:
            priorsheetdata.delete()
        else:
            return "Server Error"
        return 1


def add_timesheet(taskid, subtask, task_team, selectDate, hours, forUser, user, leave_list=None):
    t = taskid.split('-')[0].replace(' ','')
    addTimesheet = timesheet(taskid=taskid,
                             task_sub=subtask,
                             task_team=task_team,
                             date=selectDate,
                             hours=hours,
                             user=forUser,
                             approved_by=user)
    try:
        addTimesheet.save()
    except Exception as e:
        return 0
    else:
        if t in leave_list:
            jsonDec = json.decoder.JSONDecoder()
            hr = jsonDec.decode(hours)
            totalCurr = sum([float(i) for i in hr])
            update_userleave(forUser, t, totalCurr)
        return 1


def delete_timesheet(forUser, forDate):
    kwargs = dict()
    args=()
    kwargs["user"] = forUser
    kwargs["date"] = forDate
    jsonDec = json.decoder.JSONDecoder()
    leave_list = [x.leave_id for x in leave.objects.all()]
    try:
        sheetdata = timesheet.objects.filter(*args, **kwargs)
    except Exception as e:
        return "Server Error"
    else:
        for val in sheetdata:
            taskid = val.taskid
            hours = val.hours
            t = taskid.split('-')[0].replace(' ', '')
            if t in leave_list:
                hr = jsonDec.decode(hours)
                totalCurr = sum([float(i) for i in hr])
                update_userleave(forUser, t, totalCurr*-1)
        sheetdata.delete()
        return 1


def update_userleave(user, t, hour):
    u = userprofile.objects.get(user_id__username=user)
    if t == 'EL':
        u.earned_leave = str(float(u.earned_leave) - hour)
    if t == 'CL':
        u.casual_leave = str(float(u.casual_leave) - hour)
    u.save()
