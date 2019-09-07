from django.db import models


class priorsheet(models.Model):
    taskid = models.CharField(max_length=20)
    date = models.DateField()
    hours = models.CharField(max_length=56, default=["0.0", "0.0", "0.0", "0.0", "0.0", "0.0", "0.0"])
    user = models.CharField(max_length=20)
    approved = models.CharField(max_length=1, default='N')
    tstamp = models.DateTimeField(auto_now_add=True, null=True)
    is_billable = models.BooleanField(default=True)
