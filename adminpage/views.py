from django.shortcuts import render
from django.contrib.auth.models import User, Group
from current.models import teams
from django.http import Http404
from django.http import JsonResponse
from userprofile.models import userprofile
from django.db.models import Q
from django.contrib.auth.decorators import login_required
import datetime


@login_required(login_url='/login/')
def adminpage(request):
    if request.user.is_superuser:
        pass
    else:
        raise Http404(request.user, " is not autheticated to view this page")
    if request.is_ajax():
        if request.GET:
            if request.GET['from'] == "getSuggestions":
                searchStr = request.GET['searchStr']
                split = searchStr.split(' ')
                first, last = split[0], split[-1]
                user_list = User.objects.filter(Q(username__icontains=searchStr) |
                                                Q(last_name__icontains=first) |
                                                Q(first_name__icontains=first) |
                                                Q(first_name__icontains=last) |
                                                Q(last_name__icontains=last)).exclude(username=request.user.username).order_by('username')
                userdata = []
                for val in user_list:
                    Jsondata = {'username': val.username,'last_name':val.last_name,'first_name':val.first_name}
                    userdata.append(Jsondata)
                return JsonResponse(userdata, safe=False)
            if request.GET['from'] == "getTeams":
                team = fetch_teams()
                return JsonResponse(team, safe=False)
            if request.GET['from'] == "getUserInfo":
                searchUser = request.GET['userid']
                val = getUserInfo(searchUser)
                return JsonResponse(val)
        if request.POST:
            if request.POST['from'] == "adduser":
                userid = request.POST["userid"]
                email = request.POST["email"]
                role = request.POST["role"]
                manager = request.POST["manager"]
                project = request.POST["project"]
                location = request.POST["location"]
                joined = request.POST["joined"]
                password = request.POST["password"]
                lastname = request.POST["lastname"]
                firstname = request.POST["firstname"]
                mobile = request.POST["mobile"]
                res = addUser(userid, email, role, manager, project, location, joined, password, lastname, firstname, mobile)
                return JsonResponse(res,safe=False)
            if request.POST['from'] == "deleteuser":
                userid = request.POST["userid"]
                res = deleteUser(userid)
                return JsonResponse(res,safe=False)
                
    parms = dict()
    parms = {'current_user': request.user}
    user_list = User.objects.all().exclude(username=request.user.username).order_by('username')
    parms['userlist'] = user_list
    return render(request, 'template/adminpage.html', parms)


def fetch_teams(**kwargs):
    try:
        teamData = teams.objects.filter(**kwargs)
    except Exception as e:
        return 0
    else:
        teamDataList = []
        for val in teamData:
            JsonData = {"team_name":val.team_name,
                        "team_lead": val.team_lead,}
            teamDataList.append(JsonData)
        return teamDataList


def validateAddUser(userid, email, role, manager, project, location, joined, password):
    if '@' in email:
        pass
    else:
        return 'invalid email id'
    if role == 'Employee' or role == 'Manager':
        pass
    else:
        return 'Invalid role'
    try:
        val = userprofile.objects.filter(user_id__username=manager, user_role='Manager')
    except Exception as e:
        return 'Database Error!!!'
    else:
        if val:
            pass
        else:
            return manager + ' - Invalid managerid!!'
    return 1


def addUser(userid, email, role, manager, project, location, joined, password, lastname, firstname, mobile):
    res = validateAddUser(userid, email, role, manager, project, location, joined, password)
    if res == 1: pass
    else: return res
    addUserData = User(username=userid,
                       email=email,
                       first_name=firstname,
                       last_name=lastname,
                       is_staff=False)
    try:
        addUserData.validate_unique()
    except:
        return 'user already exsists'
    try:
        addUserData.set_password(password)
        addUserData.save()
    except Exception as e:
        return 'Database Error!!!'
    else:
        try:
            addProfile = userprofile(user_id=addUserData,
                                     user_role=role,
                                     earned_leave=9, casual_leave=0,
                                     user_location=location,
                                     user_mobile=mobile,
                                     manager_id=manager,
                                     project=project,
                                     joined_on=joined)
            addProfile.save()
        except Exception as e:
            addUserData.delete()
            return 'Database Error!!!'
    return 1


def deleteUser(userid):
    try:
        deluser = User.objects.get(username=userid)
    except Exception as e:
        return userid + " doesn't exsist"
    try:
        deluser.delete()
    except Exception as e:
        return 'Database Error!!! User has not been deleted'
    else:
        return 1

def getUserInfo(userVal):
    try:
        u = userprofile.objects.get(user_id__username=userVal)
    except Exception as e:
        return "DataBase Error!!!"
    else:
        res = dict()
        res['userid'] = userVal
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
    return res
    
        
    
    
    
    
    
    
