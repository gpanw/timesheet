from django.db import models
from django.contrib.auth.models import Group, User
from project.models import teams
import json


class timesheet(models.Model):
    taskid = models.CharField(max_length=20)
    date = models.DateField()
    hours = models.CharField(max_length=56, default=["0.0", "0.0", "0.0", "0.0", "0.0", "0.0", "0.0"])
    sum_hours = models.PositiveSmallIntegerField(default=0)
    user = models.CharField(max_length=20)
    user_role = models.CharField(max_length=20, null=True, blank=True)
    user_skill = models.CharField(max_length=20, null=True, blank=True)
    approved = models.CharField(max_length=1, default='Y')
    approved_by = models.CharField(max_length=20, null=True, blank=True)
    tstamp = models.DateTimeField(auto_now_add=True, null=True)
    is_billable = models.BooleanField(default=True)

    def save(self, *args, **kwargs):
        jsonDec = json.decoder.JSONDecoder()
        self.sum_hours = sum([float(i) for i in jsonDec.decode(self.hours)])
        u = User.objects.get(username=self.user)
        self.approved_by = u.userprofile.manager_id
        self.user_skill = u.userprofile.user_skill
        self.user_role = u.userprofile.user_role
        super(timesheet, self).save(*args, **kwargs)
