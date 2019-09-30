from django.conf.urls import url

from .views import (
    TimesheetDetailApiView,
)
app_name = 'timesheet'

urlpatterns = [
    url(r'^$', TimesheetDetailApiView.as_view(), name='reports'),
    url(r'^(?P<user>[\w-]+)/$', TimesheetDetailApiView.as_view(), name='reports'),
]
