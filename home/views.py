from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from login.forms import WriteToUsForm


def home(request):
    username = ''
    error = ''
    if request.POST:
        username = request.POST["userid"]
        password = request.POST["password"]
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            if user.is_superuser:
                return redirect('/admin/')
            else:
                return redirect('/timesheet/')
        else:
            error = "Invalid userid or password!"
            userid = username
    parms = dict()
    parms['error'] = error
    parms['username'] = username
    parms['writeform'] = WriteToUsForm()
    return render(request, 'template/login.html', parms)


def contactus(request):
    return render(request, 'template/contactus.html')


def logoutpage(request):
    logout(request)
    return redirect('/login')
