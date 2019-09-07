from django.conf.urls import url
from django.contrib import admin

from .views import (
    ApplyLeaveProjectListView,
    ApplyLeaveUserListView,
    ApplyLeaveDateListView,
    ApplyLeaveUserCreateView,
    ApplyLeaveUserDeleteView,
)
app_name = 'applyleave'

urlpatterns = [
    url(r'^$', ApplyLeaveProjectListView.as_view(), name='projectleave'),
    url(r'^user/(?P<user>[\w]+)/$', ApplyLeaveUserListView.as_view(), name='userleave'),
    url(r'^user/(?P<user>[\w]+)/date/(?P<date>[\w-]+)$', ApplyLeaveDateListView.as_view(), name='dateleave'),
    url(r'^create/', ApplyLeaveUserCreateView.as_view(), name='createleave'),
    url(r'^delete/(?P<id>[\d]+)/$', ApplyLeaveUserDeleteView.as_view(), name='deleteleave'),
]