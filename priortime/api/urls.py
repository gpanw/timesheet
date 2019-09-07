from django.conf.urls import url
from django.contrib import admin

from .views import (
    PriorsheetDetailApiView,
    PriorsheetCreateApiView,
)
app_name = 'priortime'

urlpatterns = [
    url(r'^(?P<date>[\w-]+)/$', PriorsheetDetailApiView.as_view(), name='priortime'),
    url(r'^(?P<date>[\w-]+)/create/$', PriorsheetCreateApiView.as_view(), name='create-priortime'),
]