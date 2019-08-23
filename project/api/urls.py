from django.conf.urls import url
from django.contrib import admin

from .views import TaskDetailApiView
app_name = 'timesheet'

urlpatterns = [
    url(r'^(?P<task_group>[\w-]+)/$', TaskDetailApiView.as_view(), name='task'),
]