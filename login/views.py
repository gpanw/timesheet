from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse


def loginpage(request):
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
    return render(request, 'template/login.html', {'error': error, 'userid': username})


def logoutpage(request):
    logout(request)
    return redirect('/login')

