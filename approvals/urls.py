from django.conf.urls import url
from . import views

urlpatterns = [
    #url(r'^$', views.loginpage, name='login'),
    url(r'^managerpage/approve-prior/$', views.approveprior, name='approveapprior'),
    url(r'^managerpage/approve-timesheet/$', views.approvetimesheet, name='approvetimesheet'),
]
