from django.conf.urls import url

from .views import (
    TimesheetDetailApiView,
    TimesheetCreateApiView,
)
app_name = 'timesheet'

urlpatterns = [
    url(r'^(?P<date>[\w-]+)/$', TimesheetDetailApiView.as_view(), name='current'),
    url(r'^(?P<date>[\w-]+)/create/$', TimesheetCreateApiView.as_view(), name='create-timesheet'),
]