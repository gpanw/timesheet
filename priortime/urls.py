from django.conf.urls import url
from . import views

urlpatterns = [
    #url(r'^$', views.loginpage, name='login'),
    url(r'^priortime/$', views.priortime, name='priortime'),
]
