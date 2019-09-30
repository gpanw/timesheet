from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.db.models import Min, Count, Sum
from django.utils import timezone
from datetime import datetime, timedelta
from current.models import timesheet
from project.models import leave, teams, task, role, skill
from userprofile.models import userprofile
from priortime.models import priorsheet
from django.contrib.auth.models import User, Group
import json, re
from django.http import JsonResponse
from django.http import Http404
from current.views import fetch_timesheet, get_friday
from django.core.exceptions import ObjectDoesNotExist


@login_required(login_url='/login/')
def reports(request, team_id=None):
    user = request.user
    parms = {'current_user': user}
    u = userprofile.objects.get(user_id__username=user.username)
    if u:
        parms['is_manager'] = user.is_staff
    user_list = userprofile.objects.getuserlist(user.username)
    team_list = userprofile.objects.values_list('project', flat=True). \
        filter(user_id__username__in=user_list).distinct()
    team_object = teams.objects.filter(team_name__in=team_list).order_by('team_name')
    parms['team_list'] = team_object
    if team_id:
        if team_id == 'all':
            current_team = 'all'
            parms['slug'] = 'all'
            parms['team'] = current_team
        else:
            is_valid = teams.objects.get(slug=team_id)
            if is_valid:
                current_team = is_valid.team_name
                parms['slug'] = team_id
                parms['team'] = current_team
            else:
                raise Http404("team name is not valid!!!")
    else:
        current_team = team_object[0]
        return redirect('/reports/'+current_team.slug)
    if current_team == 'all':
        team_users = user_list
    else:
        team_users = userprofile.objects.values_list('user_id__username', flat=True).\
            filter(project=current_team).order_by('user_id__username')
    if request.is_ajax():
        if request.POST:
            pass
        if request.GET:
            if request.GET['from'] == 'getTimeSheetData':
                if request.GET['date'] == 'All':
                    get_year = request.GET['year']
                    get_month = request.GET['month']
                    time_string = get_year + ' ' + get_month + ' ' + 1
                    start_time_obj = get_friday(datetime.strptime(time_string, "%Y %m %d"))
                    get_month = str(int(get_month) + 1)
                    time_string = get_year + ' ' + get_month + ' ' + 1
                    end_time_obj = get_friday(datetime.strptime(time_string, "%Y %m %d"))
                    hour_sum = 0.0
                    billable_sum = 0.0
                    non_billable_sum = 0.0
                    start_time = start_time_obj
                    while start_time <= end_time_obj:
                        for user in team_users:
                            result = fetch_timesheet(None, start_time.date(), user)
                            for res in result:
                                if start_time == start_time_obj:
                                    hours = [float(i) for i in res['hours']]
                                    hour_sum = sum(hours[::-1][:start_time.day])
                                elif start_time == end_time_obj:
                                    hours = [float(i) for i in res['hours']]
                                    hour_sum = sum(hours[:7-start_time.day])
                                else:
                                    hour_sum = res['sum_hours']
                                if res['is_billable']:
                                    billable_sum += hour_sum
                                else:
                                    non_billable_sum += hour_sum
                        start_time = start_time + timedelta(7)
                else:
                    time_string = request.GET['year'] + ' ' + request.GET['month'] + ' ' + request.GET['date']
                    time_obj = datetime.strptime(time_string, "%Y %m %d")
                return JsonResponse({}, safe=False)

    parms['team_size'] = len(team_users)
    kwargs = dict()
    if current_team == 'all':
        kwargs['task_group__in'] = team_list
    else:
        kwargs['task_group'] = current_team
    current_date = datetime.now()
    if current_date.weekday() > 4:
        fetch_date = current_date + timedelta(4 - current_date.weekday() + 7)
    else:
        fetch_date = current_date + timedelta(4 - current_date.weekday())
    user_list = []
    user_hours = []
    billable_sum = 0.0
    non_billable_sum = 0.0
    for user in team_users:
        hour_sum = 0.0
        user_list.append(user)
        result = fetch_timesheet(None, fetch_date.date(), user)
        for res in result:
            hour_sum += res['sum_hours']
            if res['is_billable']:
                billable_sum += res['sum_hours']
            else:
                non_billable_sum += res['sum_hours']
        user_hours.append(hour_sum)
    parms['user_list'] = zip(user_list, user_hours)
    parms['billable'] = billable_sum
    parms['non_billable'] = non_billable_sum
    parms['user_hours'] = user_hours
    return render(request, 'template/reports.html', parms)


@login_required(login_url='/login/')
def approveprior(request, team_id=None):
    user = request.user
    parms = {'current_user': user}
    if team_id:
        if team_id == 'all':
            current_team = 'all'
            parms['slug'] = 'all'
            parms['team'] = current_team
        else:
            is_valid = teams.objects.get(slug=team_id)
            if is_valid:
                current_team = is_valid.team_name
                parms['slug'] = team_id
                parms['team'] = current_team
            else:
                raise Http404("team name is not valid!!!")
    else:
        raise Http404("team name is not given!!!")

    try:
        userdata = userprofile.objects.get(user_id__username=user.username)
    except ObjectDoesNotExist:
        raise Http404("user profile is not created yet!!! Contact your manager or admin.")
    else:
        parms['is_manager'] = user.is_staff
        if user.is_staff:
            pass
        else:
            raise Http404("user not autheticated to view this page")
    if request.is_ajax():
        if request.GET:
            if request.GET['from'] == 'getUserSheet':
                requesteduser = request.GET['requesteduser']
                current = fetch_prior(requesteduser)
                return JsonResponse(current, safe=False)
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
                return JsonResponse({'rc': rc, 'status': status, 'forDate': forDate}, safe=False)
    kwargs = dict()
    if team_id == 'all':
        pass
    else:
        kwargs['project'] = current_team
    u = userprofile.objects.values_list('user_id__username', flat=True).filter(**kwargs).distinct()
    if u:
        userlist = priorsheet.objects.values_list('user', flat=True).filter(user__in=u).\
            order_by('user').distinct()
    else:
        userlist = []
    parms['userlist'] = userlist
    u = userprofile.objects.get(user_id__username=user.username)
    parms['role'] = u.user_role
    return render(request, 'template/approveprior.html', parms)


@login_required(login_url='/login/')
def approvetimesheet(request, team_id=None):
    user = request.user
    parms = {'current_user': user}
    if team_id:
        if team_id == 'all':
            current_team = 'all'
            parms['slug'] = 'all'
            parms['team'] = current_team
        else:
            is_valid = teams.objects.get(slug=team_id)
            if is_valid:
                current_team = is_valid.team_name
                parms['slug'] = team_id
                parms['team'] = current_team
            else:
                raise Http404("team name is not valid!!!")
    else:
        raise Http404("team name is not given!!!")
    try:
        userdata = userprofile.objects.get(user_id__username=user.username)
    except ObjectDoesNotExist:
        raise Http404("user profile is not created yet!!! Contact your manager or admin.")
    else:
        parms['is_manager'] = user.is_staff
        if user.is_staff:
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
                timesheetdata = fetch_timesheet('', forDate, forUser)
                return JsonResponse(timesheetdata, safe=False)
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
    kwargs = dict()
    if team_id == 'all':
        pass
    else:
        kwargs['project'] = current_team
    userlist = userprofile.objects.values_list('user_id__username', flat=True).filter(**kwargs).\
        order_by('user_id__username').distinct()
    parms['userlist'] = userlist
    u = userprofile.objects.get(user_id__username=user.username)
    parms['role'] = u.user_role
    return render(request, 'template/approvetimesheet.html', parms)


@login_required(login_url='/login/')
def useradmin(request, team_id=None):
    user = request.user
    parms = {'current_user': user}
    if team_id:
        user_list = userprofile.objects.getuserlist(user.username)
        if team_id == 'all':
            parms['slug'] = 'all'
            parms['team'] = 'All'
        else:
            team_values = teams.objects.values_list('team_lead', 'team_name').get(slug=team_id)
            team_lead = team_values[0]
            team_name = team_values[1]
            if team_lead in user_list:
                parms['slug'] = team_id
                parms['team'] = team_name
            else:
                raise Http404("team name is not valid!!!")
    else:
        raise Http404("team name is not given!!!")
    try:
        userdata = userprofile.objects.get(user_id__username=user.username)
    except ObjectDoesNotExist:
        raise Http404("user profile is not created yet!!! Contact your manager or admin.")
    else:
        parms['is_manager'] = user.is_staff
        if user.is_staff:
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
                kwargs['project'] = request.POST['project']
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
                except ObjectDoesNotExist:
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
                    res['skill'] = u.user_skill
                    res['mobile'] = u.user_mobile
                    res['manager_id'] = u.manager_id
                    res['project'] = u.project
                    res['joined'] = user.date_joined.strftime('%Y-%m-%d')
                return JsonResponse(res)

    userlist = []
    managerlist = []
    if team_id == 'all':
        userlist = user_list
    else:
        userlist = userprofile.objects.values_list('user_id__username', flat=True). \
            filter(project=team_name).order_by('user_id__username').distinct()
    try:
        managerlist = teams.objects.values_list('team_lead', flat=True)
    except ObjectDoesNotExist:
        pass
    parms['userlist'] = userlist
    parms['managerlist'] = managerlist
    parms['role_list'] = role.objects.values_list('role', flat=True)
    parms['skill_list'] = skill.objects.values_list('skill', flat=True)
    u = userprofile.objects.get(user_id__username=user.username)
    parms['role'] = u.user_role
    return render(request, 'template/useradmin.html', parms)


@login_required(login_url='/login/')
def pretimesheets(request, team_id=None):
    user = request.user
    parms = {'current_user': user}
    if team_id:
        user_list = userprofile.objects.getuserlist(user.username)
        if team_id == 'all':
            parms['slug'] = 'all'
            parms['team'] = 'All'
        else:
            team_values = teams.objects.values_list('team_lead', 'team_name').get(slug=team_id)
            team_lead = team_values[0]
            team_name = team_values[1]
            if team_lead in user_list:
                parms['slug'] = team_id
                parms['team'] = team_name
            else:
                raise Http404("team name is not valid!!!")
    else:
        raise Http404("team name is not given!!!")
    try:
        userdata = userprofile.objects.get(user_id__username=user.username)
    except ObjectDoesNotExist:
        raise Http404("user profile is not created yet!!! Contact your manager or admin.")
    else:
        parms['is_manager'] = user.is_staff
        if user.is_staff:
            pass
        else:
            raise Http404("user not autheticated to view this page")
    if request.is_ajax():
        if request.GET:
            if request.GET['from'] == 'getUserDate':
                requested_user = request.GET['requestedUser']
                min_time = timesheet.objects.filter(user=requested_user).aggregate(Min('date'))
                min_time['date__min'] = min_time['date__min'].strftime('%Y-%m-%d')
                res = dict()
                res['min_time'] = min_time
                return JsonResponse(res)
            if request.GET['from'] == 'getSheet':
                for_date = request.GET['forDate']
                for_user = request.GET['forUser']
                s = " ".join(for_date.split(" ")[1:4])
                min_time = timesheet.objects.filter(user=for_user).aggregate(Min('date'))
                end_date = datetime.strptime(s, "%b %d %Y").date()
                all_timesheets = []
                for i in range(12):
                    request_date = end_date - timedelta(i*7)
                    if request_date >= min_time['date__min']:
                        result = fetch_timesheet(None, request_date, for_user)
                        if len(result):
                            all_timesheets.append(result)
                return JsonResponse(all_timesheets, safe=False)

        if request.POST:
            pass
    if team_id == 'all':
        userlist = user_list
    else:
        userlist = userprofile.objects.values_list('user_id__username', flat=True). \
            filter(project=team_name).distinct().order_by('user_id__username')
    if userlist:
        parms['userlist'] = userlist
    else:
        parms['userlist'] = []
    u = userprofile.objects.get(user_id__username=user.username)
    parms['role'] = u.user_role
    return render(request, 'template/previoustimesheets.html', parms)


@login_required(login_url='/login/')
def taskreports(request, team_id=None):
    user = request.user
    parms = {'current_user': user}
    if team_id:
        user_list = userprofile.objects.getuserlist(user.username)
        if team_id == 'all':
            team_list = userprofile.objects.values_list('project', flat=True). \
                filter(user_id__username__in=user_list).distinct()
            parms['slug'] = 'all'
            parms['team'] = 'All'
        else:
            team_values = teams.objects.values_list('team_lead', 'team_name').get(slug=team_id)
            team_lead = team_values[0]
            team_name = team_values[1]
            if team_lead in user_list:
                parms['slug'] = team_id
                parms['team'] = team_name
            else:
                raise Http404("team name is not valid!!!")
    else:
        raise Http404("team name is not given!!!")
    try:
        userdata = userprofile.objects.get(user_id__username=user.username)
    except ObjectDoesNotExist:
        raise Http404("user profile is not created yet!!! Contact your manager or admin.")
    else:
        parms['is_manager'] = user.is_staff
        if user.is_staff:
            pass
        else:
            raise Http404("user not autheticated to view this page")
    if request.is_ajax():
        if request.GET:
            if request.GET['from'] == 'getTaskInfo':
                task_id = request.GET['task_id']
                kwargs = dict()
                if task_id == 'all':
                    pass
                else:
                    kwargs['taskid'] = task_id
                if team_id == 'all':
                    kwargs['task_team__in'] = team_list
                else:
                    kwargs['task_team'] = team_name
                values = timesheet.objects.values('date') \
                    .annotate(week_sum=Sum('sum_hours')) \
                    .filter(**kwargs).order_by('date')
                print('g1111111', values)
                return_date_data = []
                if values:
                    init_date = values[0]['date']
                for val in values:
                    while init_date <= val['date']:
                        if init_date == val['date']:
                            json_data = {'week_sum': val['week_sum'],
                                         'week_date': val['date']}
                        else:
                            json_data = {'week_sum': 0.0,
                                         'week_date': init_date}
                        init_date = init_date + timedelta(days=7)
                        return_date_data.append(json_data)
                return_parms = {"date_data": return_date_data}
                values = timesheet.objects.values('task_sub') \
                    .annotate(week_sum=Sum('sum_hours')) \
                    .filter(**kwargs)
                return_subtask_data = []
                for val in values:
                    json_data = {'week_sum': val['week_sum'],
                                 'sub_task': val['task_sub']}
                    return_subtask_data.append(json_data)
                return_parms["subtask_data"] = return_subtask_data
                values = timesheet.objects.values('user') \
                    .annotate(week_sum=Sum('sum_hours')) \
                    .filter(**kwargs)
                return_subtask_data = []
                for val in values:
                    json_data = {'week_sum': val['week_sum'],
                                 'user': val['user']}
                    return_subtask_data.append(json_data)
                return_parms["user_data"] = return_subtask_data

                return JsonResponse(return_parms, safe=False)
        if request.POST:
            if request.POST['from'] == 'rejectSheet':
                pass

    kwargs = dict()
    todate = get_friday(timezone.now()).date()
    parms['todate'] = todate.strftime("%Y-%m-%d")
    fromdate = todate - timedelta(28)
    parms['fromdate'] = fromdate.strftime("%Y-%m-%d")
    u = userprofile.objects.get(user_id__username=user.username)
    parms['role'] = u.user_role
    return render(request, 'template/taskreport.html', parms)


@login_required(login_url='/login/')
def graphs(request, team_id=None):
    user = request.user
    parms = {'current_user': user}
    try:
        userdata = userprofile.objects.get(user_id__username=user.username)
    except ObjectDoesNotExist:
        raise Http404("user profile is not created yet!!! Contact your manager or admin.")
    else:
        parms['is_manager'] = user.is_staff
        if user.is_staff:
            pass
        else:
            raise Http404("user not autheticated to view this page")
    if team_id:
        user_list = userprofile.objects.getuserlist(user.username)
        if team_id == 'all':
            team_list = userprofile.objects.values_list('project', flat=True). \
                filter(user_id__username__in=user_list).distinct()
            parms['slug'] = 'all'
            parms['team'] = 'All'
        else:
            team_values = teams.objects.values_list('team_lead', 'team_name').get(slug=team_id)
            team_lead = team_values[0]
            team_name = team_values[1]
            if team_lead in user_list:
                parms['slug'] = team_id
                parms['team'] = team_name
            else:
                raise Http404("team name is not valid!!!")
    if request.is_ajax():
        if request.GET:
            if request.GET['from'] == 'clientcount':
                return_dict = dict()
                total_emp = userprofile.objects.count()
                team_list = teams.objects.values_list('team_name', flat=True).filter(revenue_gen=True)
                client_emp = userprofile.objects.filter(project__in=team_list).count()
                support_emp = userprofile.objects.exclude(project__in=team_list).count()
                return_dict['total'] = total_emp
                return_dict['client'] = client_emp
                return_dict['support'] = support_emp
                values = userprofile.objects.values('project') \
                    .filter(project__in=team_list).annotate(total=Count('project')).order_by('-total')
                return_task_data = list()
                for val in values:
                    json_data = {'total': val['total'],
                                 'project': val['project']}
                    return_task_data.append(json_data)
                return_dict['client_emp'] = return_task_data
                values = userprofile.objects.values('project') \
                    .exclude(project__in=team_list).annotate(total=Count('project')).order_by('-total')
                return_task_data = list()
                for val in values:
                    json_data = {'total': val['total'],
                                 'project': val['project']}
                    return_task_data.append(json_data)
                return_dict['support_emp'] = return_task_data
                return JsonResponse(return_dict, safe=False)
            if request.GET['from'] == 'projectpie':
                group_by = request.GET['groupby']
                kwargs = dict()
                show_all = True
                if group_by == 'lessproject':
                    group_by = 'project'
                    show_all = False
                if team_id == 'all':
                    kwargs['project__in'] = team_list
                else:
                    kwargs['project'] = team_name
                values = userprofile.objects.values(group_by) \
                    .filter(**kwargs).annotate(total=Count(group_by)).order_by('-total')
                if show_all:
                    pass
                else:
                    values = values[:12]
                return_task_data = []
                for val in values:
                    json_data = {'total': val['total'],
                                 'project': val[group_by]}
                    return_task_data.append(json_data)
                return_parms = {"project_data": return_task_data}
                return JsonResponse(return_parms, safe=False)
            if request.GET['from'] == 'billablegraph':
                jsonDec = json.decoder.JSONDecoder()
                billable_year = request.GET['year']
                billable_user = request.GET['user']
                kwargs = dict()
                if team_id == 'all':
                    kwargs['user__in'] = user_list
                else:
                    kwargs['user__in'] = userprofile.objects.values_list('user_id__username', flat=True). \
                        filter(project=team_name)
                if billable_user == 'All':
                    pass
                else:
                    kwargs['user__in'] = [billable_user]
                return_dict = dict()
                for i in range(1, 12):
                    return_dict[i] = [0, 0]
                    time_string = billable_year + ' ' + str(i) + ' ' + '1'
                    start_time_obj = get_friday(datetime.strptime(time_string, "%Y %m %d"))
                    time_string = billable_year + ' ' + str(i+1) + ' ' + '1'
                    end_time_obj = get_friday(datetime.strptime(time_string, "%Y %m %d"))
                    kwargs['date__range'] = [start_time_obj.date(), end_time_obj.date()]
                    timesheet_obj = timesheet.objects.filter(**kwargs)
                    for t in timesheet_obj:
                        if t.date == start_time_obj.date():
                            temp_hours = jsonDec.decode(t.hours)[::-1][:t.date.day]
                            sum_hours = sum([float(j) for j in temp_hours])
                        elif t.date == end_time_obj.date():
                            temp_hours = jsonDec.decode(t.hours)[:7-t.date.day]
                            sum_hours = sum([float(j) for j in temp_hours])
                            sum_hours = sum_hours
                        else:
                            sum_hours = t.sum_hours
                        if t.is_billable:
                            return_dict[i][0] += sum_hours
                        else:
                            return_dict[i][1] += sum_hours
                return_dict[12] = [0, 0]
                time_string = billable_year + ' ' + '12' + ' ' + '1'
                start_time_obj = get_friday(datetime.strptime(time_string, "%Y %m %d"))
                billable_year = str(int(billable_year) + 1)
                time_string = billable_year + ' ' + '1' + ' ' + '1'
                end_time_obj = get_friday(datetime.strptime(time_string, "%Y %m %d"))
                kwargs['date__range'] = [start_time_obj.date(), end_time_obj.date()]
                timesheet_obj = timesheet.objects.filter(**kwargs)
                for t in timesheet_obj:
                    if t.date == start_time_obj.date():
                        temp_hours = jsonDec.decode(t.hours)[::-1][:t.date.day]
                        sum_hours = sum([float(i) for i in temp_hours])
                    elif t.date == end_time_obj.date():
                        temp_hours = jsonDec.decode(t.hours)[:7 - t.date.day]
                        sum_hours = sum([float(i) for i in temp_hours])
                        sum_hours = sum_hours
                    else:
                        sum_hours = t.sum_hours
                    if t.is_billable:
                        return_dict[12][0] += sum_hours
                    else:
                        return_dict[12][1] += sum_hours
                return JsonResponse(return_dict, safe=False)
            if request.GET['from'] == 'skillgraph' or request.GET['from'] == 'rolegraph':
                kwargs = dict()
                if team_id == 'all':
                    kwargs['user__in'] = user_list
                else:
                    kwargs['user__in'] = userprofile.objects.values_list('user_id__username', flat=True). \
                        filter(project=team_name)
                if request.GET['date'] == 'all':
                    jsonDec = json.decoder.JSONDecoder()
                    get_year = request.GET['year']
                    month = request.GET['month']
                    if month == 'all':
                        get_month = '1'
                    else:
                        get_month = month
                    time_string = get_year + ' ' + get_month + ' ' + '1'
                    start_time_obj = get_friday(datetime.strptime(time_string, "%Y %m %d"))
                    if month == 'all':
                        time_string = str(int(get_year)+1) + ' ' + '1' + ' ' + '1'
                    else:
                        get_month = str(int(get_month) + 1)
                        time_string = get_year + ' ' + get_month + ' ' + '1'
                    end_time_obj = get_friday(datetime.strptime(time_string, "%Y %m %d"))
                    kwargs['date__range'] = [start_time_obj.date(), end_time_obj.date()]
                    timesheet_obj = timesheet.objects.filter(**kwargs)
                    skill_billable = dict()
                    skill_nonbillable = dict()
                    for t in timesheet_obj:
                        if request.GET['from'] == 'skillgraph':
                            groupby = t.user_skill
                        if request.GET['from'] == 'rolegraph':
                            groupby = t.user_role
                        if groupby in skill_billable:
                            pass
                        else:
                            skill_billable[groupby] = 0
                            skill_nonbillable[groupby] = 0
                        if t.date == start_time_obj.date():
                            temp_hours = jsonDec.decode(t.hours)[::-1][:t.date.day]
                            sum_hours = sum([float(i) for i in temp_hours])
                        elif t.date == end_time_obj.date():
                            temp_hours = jsonDec.decode(t.hours)[:7-t.date.day]
                            sum_hours = sum([float(i) for i in temp_hours])
                            sum_hours = sum_hours
                        else:
                            sum_hours = t.sum_hours
                        if t.is_billable:
                            skill_billable[groupby] += sum_hours
                        else:
                            skill_nonbillable[groupby] += sum_hours
                    return JsonResponse([skill_billable, skill_nonbillable], safe=False)
                else:
                    time_string = request.GET['year'] + ' ' + request.GET['month'] + ' ' + request.GET['date']
                    time_obj = datetime.strptime(time_string, "%Y %m %d")
                    kwargs['date'] = time_obj.date()
                    timesheet_obj = timesheet.objects.filter(**kwargs)
                    skill_billable = dict()
                    skill_nonbillable = dict()
                    for t in timesheet_obj:
                        if request.GET['from'] == 'skillgraph':
                            groupby = t.user_skill
                        if request.GET['from'] == 'rolegraph':
                            groupby = t.user_role
                        if groupby in skill_billable:
                            pass
                        else:
                            skill_billable[groupby] = 0
                            skill_nonbillable[groupby] = 0
                        if t.is_billable:
                            skill_billable[groupby] += t.sum_hours
                        else:
                            skill_nonbillable[groupby] += t.sum_hours
                    return JsonResponse([skill_billable, skill_nonbillable], safe=False)

        if request.POST:
            pass
    kwargs = dict()
    if team_id == 'all':
        kwargs['project__in'] = team_list
    else:
        kwargs['project'] = team_name
    userlist = userprofile.objects.values_list('user_id__username', flat=True).filter(**kwargs). \
        order_by('user_id__username')
    parms['userlist'] = userlist
    now = datetime.now()
    now_year = now.year
    year_list = [now_year, now_year-1, now_year-2]
    parms['year_list'] = year_list
    u = userprofile.objects.get(user_id__username=user.username)
    parms['role'] = u.user_role
    return render(request, 'template/graphs.html', parms)


def is_ajax():
    return META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest'


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
        sheetdata = priorsheet.objects.filter(*args, **kwargs).order_by('tstamp')
    except ObjectDoesNotExist:
        return 0
    else:
        timesheetdata = []
        for val in sheetdata:
            JsonData = {'taskid': val.taskid,
                        'hours': jsonDec.decode(val.hours),
                        'approved': val.approved,
                        'sheetdate': val.date,
                        'is_billable': val.is_billable,
                        }
            timesheetdata.append(JsonData)
        return timesheetdata


def validate_request(forUser, forDate, user):
    try:
        userdata = userprofile.objects.get(user_id__username=forUser)
    except ObjectDoesNotExist:
        return "Invalid user"
    else:
        user_manager = teams.objects.get(team_name=userdata.project).team_lead
        if str(user_manager) == user.username:
            pass
        else:
            return "you are not authorized to perform task for this user"
        return "valid"


def delete_prior(forUser, forDate):
    kwargs = dict()
    args = ()
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
    rc = None
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
            sheetdata.delete()

        for val in priorsheetdata:
            taskid = val.taskid
            is_billable = val.is_billable
            selectDate = val.date
            hours = val.hours
            rc = add_timesheet(taskid, selectDate, hours, forUser, user, is_billable)
            if not rc:
                break
        if rc:
            priorsheetdata.delete()
        else:
            return "Server Error"
        return 1


def add_timesheet(taskid, selectDate, hours, forUser, user, is_billable):
    addTimesheet = timesheet(taskid=taskid,
                             date=selectDate,
                             hours=hours,
                             user=forUser,
                             approved_by=user,
                             is_billable=is_billable)
    try:
        addTimesheet.save()
    except Exception as e:
        return 0
    else:
        return 1


def delete_timesheet(forUser, forDate):
    kwargs = dict()
    args = ()
    kwargs["user"] = forUser
    kwargs["date"] = forDate
    jsonDec = json.decoder.JSONDecoder()
    leave_list = [x.leave_id for x in leave.objects.all()]
    try:
        sheetdata = timesheet.objects.filter(*args, **kwargs)
    except Exception as e:
        return "Server Error"
    else:
        sheetdata.delete()
        return 1


def validate_userinfo(*args, **kwargs):
    try:
        u = userprofile.objects.get(user_id__username=kwargs['user_id'])
    except ObjectDoesNotExist:
        return "invalid user"
    else:
        manager_id = u.manager_id
        if manager_id == str(kwargs['user']):
            pass
        else:
            return "You are not authorized to change this user id"
    return "valid"


def update_userinfo(*args, **kwargs):
    try:
        u = userprofile.objects.get(user_id__username=kwargs['user_id'])
    except ObjectDoesNotExist:
        return "Error! not saved"
    else:
        u.user_location = kwargs['location']
        u.user_role = kwargs['role']
        u.user_mobile = kwargs['mobile']
        u.project = kwargs['project']
        u.joined_on = kwargs['joined']
        u.save()
        try:
            us = User.objects.get(username=kwargs['user_id'])
        except ObjectDoesNotExist:
            return "Error! not saved"
        else:
            us.last_name = kwargs['lastname']
            us.first_name = kwargs['firstname']
            us.email = kwargs['email']
            us.save()
            return 1
