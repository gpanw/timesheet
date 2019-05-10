from django.db import models
from django.forms import ModelForm, DateInput


class applyleave(models.Model):
    leaveid = models.CharField(max_length=20, null=True, blank=True)
    date = models.DateField()
    comment = models.CharField(max_length=20, null=True, blank=True)
    user = models.CharField(max_length=20, null=True, blank=True)
