from django.shortcuts import render, redirect
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.utils import timezone
from datetime import datetime, timedelta, date
from project.models import leave
from .models import applyleave
from .forms import applyleaveForm
from django.contrib.auth.models import User
from userprofile.models import userprofile
from calendar import monthrange
from .mycalendar import leaveCalendar
from django.utils.safestring import mark_safe
from django.http import JsonResponse
from django.core.exceptions import ObjectDoesNotExist


@login_required(login_url='/login/')
def leavetrack(request, yyyy='', mm=''):
    user = request.user
    if yyyy == '' or mm == '':
        now = timezone.now()
    else:
        now = timezone.now()
        d = yyyy + ' ' + mm + ' ' + '01'
        now = datetime.strptime(d, "%Y %m %d")
    parms = getCalendar(request, now.year, now.month)
    u = userprofile.objects.get(user_id__username=user.username)
    parms['is_manager'] = user.is_staff
    parms['current_user'] = user
    return render(request, 'template/leave.html', parms)


@login_required(login_url='/login/')
def manageleave(request, yyyy='', mm=''):
    user = request.user
    if request.is_ajax():
        if request.POST:
            if request.POST['from'] == 'addleave':
                Ldate = datetime.strptime(request.POST['Ldate'], "%d %B %Y")
                Lfor = request.POST['Lfor']
                Lrepeat = request.POST['Lrepeat']
                Lcomment = request.POST['Lcomment']
                leaveid = request.POST['leaveid']
                returnValue=[]
                returnVal = add_applyleave(leaveid, Ldate, Lfor, Lrepeat, Lcomment)
                if returnVal:
                    returnValue.append(returnVal)
                    for i in range(0, int(Lrepeat)):
                        Ldate = Ldate + timedelta(1)
                        returnVal = add_applyleave(leaveid, Ldate, Lfor, Lrepeat, Lcomment)
                        if returnVal:
                            returnValue.append(returnVal)
                        else:
                            returnValue.append(returnVal)
                            break
                return JsonResponse(returnValue,safe=False)
            if request.POST['from'] == 'deleteleave':
                del_id = request.POST['del_id']
                return_id = del_applyleave(del_id)
                return JsonResponse({'return_id': return_id}, safe=False)
            
        if request.GET:
            if request.GET['from'] == 'getleave':
                Ldate = datetime.strptime(request.GET['Ldate'], "%d %B %Y")
                us = userprofile.objects.get(user_id__username=user.username)
                userlist = userprofile.objects.filter(project=us.project)
                u = [val.user_id.username for val in userlist]
                kwargs = dict()
                kwargs['user'] = u
                kwargs['date'] = Ldate
                leavelist = fetch_applyleave(u, Ldate)
                return JsonResponse(leavelist, safe=False)
    if yyyy == '' or mm == '':
        now = timezone.now()
    else:
        d = yyyy + ' ' + mm + ' ' + '01'
        now = datetime.strptime(d, "%Y %m %d")
    parms = getCalendar(request, now.year, now.month, False)
    u = userprofile.objects.get(user_id__username=user.username)
    parms['is_manager'] = user.is_staff
    parms['current_user'] = user
    parms['form'] = applyleaveForm(user)
    return render(request, 'template/manageleave.html', parms)


def is_ajax():
    return META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest'


def getCalendar(request, myYear, myMonth, getValues=True):
    user = request.user
    myYear = int(myYear)
    myMonth = int(myMonth)
    myCalendarFromMonth = datetime(myYear, myMonth, 1)
    myCalendarToMonth = datetime(myYear, myMonth, monthrange(myYear, myMonth)[1])
    if getValues:
        us = userprofile.objects.get(user_id__username=user.username)
        userlist = userprofile.objects.filter(project=us.project)
        u = [val.user_id.username for val in userlist]
        LeaveEvents = applyleave.objects.filter(date__gte=myCalendarFromMonth,
                                                date__lte=myCalendarToMonth,
                                                user__in=u)
    else:
        LeaveEvents = []
    myCalendar = leaveCalendar(LeaveEvents).formatmonth(myYear, myMonth)
    myPreviousYear = myYear
    myPreviousMonth = myMonth - 1
    if myPreviousMonth == 0:
        myPreviousMonth = 12
        myPreviousYear = myYear - 1
    myNextYear = myYear
    myNextMonth = myMonth + 1
    if myNextMonth == 13:
        myNextMonth = 1
        myNextYear = myYear + 1
    myYearAfterThis = myYear + 1
    myYearBeforeThis = myYear - 1
    parms = {'calendar': mark_safe(myCalendar),
             'Month': myMonth,
             'MonthName': named_month(myMonth),
             'Year': myYear,
             'PreviousMonth': myPreviousMonth,
             'PreviousMonthName': named_month(myPreviousMonth),
             'PreviousYear': myPreviousYear,
             'NextMonth': myNextMonth,
             'NextMonthName': named_month(myNextMonth),
             'NextYear': myNextYear,
             'YearBeforeThis': myYearBeforeThis,
             'YearAfterThis': myYearAfterThis,
             }
    return parms


def named_month(pMonthNumber):
    """
    Return the name of the month, given the month number
    """
    return date(1900, pMonthNumber, 1).strftime('%B')


def add_applyleave(leaveid, Ldate, Lfor, Lrepeat, Lcomment):
    Tdate = datetime.strftime(Ldate,"%Y-%m-%d")
    val = applyleave(leaveid=leaveid,
                     date=Tdate,
                     comment=Lcomment,
                     user=Lfor)
    try:
        val.save()
    except Exception as e:
        Jsondata = {'leaveid': val.leaveid,
                    'leavedate': val.date,
                    'leavecomment': val.comment,
                    'leaveuser': val.user,
                    'id': None}
        return Jsondata
    else:
        Jsondata = {'leaveid': val.leaveid,
                    'leavedate': val.date,
                    'leavecomment': val.comment,
                    'leaveuser': val.user,
                    'id': val.pk}
        return Jsondata


def fetch_applyleave(userlist, Ldate):
    kwargs=dict()
    kwargs['user__in']=userlist
    kwargs['date']=Ldate
    try:
        leavelist = applyleave.objects.filter(**kwargs)
    except ObjectDoesNotExist:
        return 0
    else:
        leavedata =[]
        for val in leavelist:
            Jsondata = {'leaveid': val.leaveid,
                        'leavedate': val.date,
                        'leavecomment': val.comment,
                        'leaveuser': val.user,
                        'id': val.pk}
            leavedata.append(Jsondata)
        return leavedata


def del_applyleave(del_id):
    try:
        delete_row = applyleave.objects.get(pk=del_id)
    except:
        return_id = None
    else:
        try:
            return_id = delete_row.pk
            delete_row.delete()
        except:
            return_id = None

    return return_id
    
