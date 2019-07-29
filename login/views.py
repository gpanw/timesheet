from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from .forms import WriteToUsForm
from django.core.mail import send_mail


def loginpage(request):
    username = ''
    error = ''
    if request.POST:
        if 'writetous' in request.POST:
            form = WriteToUsForm(request.POST)
            if form.is_valid():
                from_email = form.cleaned_data['email_id']
                subject = form.cleaned_data['subject']
                message = form.cleaned_data['message']
                send_mail(subject, message, from_email, ['gorav.panwar@gmail.com'])
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

