from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import userprofile
from django.core.exceptions import ObjectDoesNotExist


@login_required(login_url='/login/')
def getprofile(request):
    user = request.user
    parms = {'current_user': user}
    parms['lastname'] = user.last_name
    parms['firstname'] = user.first_name
    parms['email'] = user.email
    parms['is_manager'] = user.is_staff
    try:
        userdata = userprofile.objects.get(user_id__username=user.username)
    except ObjectDoesNotExist:
        pass
    else:
        parms['earned'] = userdata.earned_leave
        parms['casual'] = userdata.casual_leave
        parms['role'] = userdata.user_role
        parms['skill'] = userdata.user_skill
        parms['manager_id'] = userdata.manager_id
        parms['mobile'] = userdata.user_mobile
        parms['project'] = userdata.project
        parms['location'] = userdata.user_location
        parms['joined'] = user.date_joined.strftime('%Y-%m-%d')
    
    return render(request, 'template/userprofile.html', parms)


def is_ajax():
    return META.get('HTTP_X_REQUESTED_WITH') == 'XMLHttpRequest'
