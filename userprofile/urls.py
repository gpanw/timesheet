from django.conf.urls import url
from . import views

urlpatterns = [
    #url(r'^$', views.loginpage, name='login'),
    url(r'^profile/$', views.getprofile, name='userprofile'),
]
