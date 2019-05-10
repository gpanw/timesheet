from django.conf.urls import url
from . import views

urlpatterns = [
    #url(r'^$', views.loginpage, name='login'),
    url(r'^leave/$', views.leavetrack, name='leavetrack'),
    url(r'^leave/(?P<yyyy>(\d+))-(?P<mm>(\d+))/$', views.leavetrack, name='leavetrack'),
    url(r'^manageleave/$', views.manageleave, name='manageleave'),
    url(r'^manageleave/(?P<yyyy>(\d+))-(?P<mm>(\d+))/$', views.manageleave, name='manageleave'),
]
