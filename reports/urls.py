from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^reports/(?P<team_id>[-\w]+)/$', views.reports, name='reports'),
    url(r'^reports/$', views.reports, name='reports'),
    url(r'^reports/(?P<team_id>[-\w]+)/approve-priortimesheet/$', views.approveprior, name='approveprior'),
    url(r'^reports/(?P<team_id>[-\w]+)/approve-timesheet/$', views.approvetimesheet, name='approvetimesheet'),
    url(r'^reports/(?P<team_id>[-\w]+)/useradmin/$', views.useradmin, name='useradmin'),
    url(r'^reports/(?P<team_id>[-\w]+)/previoustimesheets/$', views.pretimesheets, name='pretimesheets'),
    url(r'^reports/(?P<team_id>[-\w]+)/graphs/$', views.graphs, name='graphs'),
]
