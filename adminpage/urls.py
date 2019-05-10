from django.conf.urls import url
from . import views

urlpatterns = [
    #url(r'^$', views.loginpage, name='login'),
    url(r'^adminpage/$', views.adminpage, name='adminpage'),
]
