"""timesheet URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin
from login import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^$', views.loginpage, name='home'),
    url(r'^contact', views.contactus, name='contactus'),
    url(r'^', include('login.urls')),
    url(r'^', include('current.urls')),
    url(r'^', include('priortime.urls')),
    url(r'^', include('leave.urls')),
    url(r'^', include('userprofile.urls')),
    url(r'^', include('managerpage.urls')),
    url(r'^', include('reports.urls')),
    url('^', include('django.contrib.auth.urls')),
    url(r'^api/timesheet/', include("current.api.urls", namespace='timesheet-api')),
    url(r'^api/tasks/', include("project.api.urls", namespace='task-api')),
    url(r'^api/priortime/', include("priortime.api.urls", namespace='priortime-api')),
    url(r'^api/leave/', include("leave.api.urls", namespace='leave-api')),
    url(r'^api/reports/', include("reports.api.urls", namespace='reports-api')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
