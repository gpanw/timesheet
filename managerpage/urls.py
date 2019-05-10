from django.conf.urls import url
from . import views

urlpatterns = [
    #url(r'^$', views.loginpage, name='login'),
    url(r'^managerpage/$', views.manager, name='manager'),
    url(r'^managerpage/approve-prior/$', views.approveprior, name='approveapprior'),
    url(r'^managerpage/approve-timesheet/$', views.approvetimesheet, name='approvetimesheet'),
    url(r'^managerpage/useradmin/$', views.useradmin, name='useradmin'),
    url(r'^managerpage/taskadmin/$', views.task_admin, name='taskadmin'),
]
