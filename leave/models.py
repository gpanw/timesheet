from django.db import models


class applyleave(models.Model):
    leaveid = models.CharField(max_length=20, default='EL')
    date = models.DateField()
    comment = models.CharField(max_length=20, null=True, blank=True)
    user = models.CharField(max_length=20, default=' ')

    class Meta:
        unique_together = ['leaveid', 'date', 'user']
