from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from .forms import WriteToUsForm


def loginpage(request):
    username = ''
    error = ''
    if request.POST:
        if 'writetous' in request.POST:
            form = WriteToUsForm(request.POST)
            if form.is_valid():
                print('g1111111', request.POST)
        else:
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


def logoutpage(request):
    logout(request)
    return redirect('/login')


def contactus(request):
    return render(request, 'template/contactus.html')

