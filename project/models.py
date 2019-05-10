from django.db import models
from django.template.defaultfilters import slugify
from current.countries import Countries
from django.core.exceptions import ObjectDoesNotExist


class teams(models.Model):
    """this table have all the team in the organization and
       the user leading the team."""
    team_name = models.CharField(max_length=20, primary_key=True)
    team_description = models.CharField(max_length=20)
    team_lead = models.CharField(max_length=20)
    team_location = models.CharField(max_length=30, choices=Countries.countries_list,
                                     default=Countries.countries_list[0][0])
    revenue_gen = models.BooleanField(default=True)
    slug = models.SlugField(max_length=20, unique=True, default=None)

    def __str__(self):
        return self.team_name


class task(models.Model):
    """this table have all the tasks open and the teams
       which can use the task to fill time entry."""
    Open = 'OP'
    Close = 'CL'
    status_choice = (
        (Open, 'Open'),
        (Close, 'Close'),
    )
    parent_choice = ()
    task_name = models.CharField(max_length=20, db_index=True)
    task_status = models.CharField(max_length=2, choices=status_choice, default=Open)
    task_group = models.CharField(max_length=20)
    is_billable = models.BooleanField(default=False)

    def __str__(self):
        return self.task_name


class leave(models.Model):
    leave_id = models.CharField(max_length=20, primary_key=True)
    leave_description = models.CharField(max_length=20)


class skill(models.Model):
    skill = models.CharField(max_length=20, primary_key=True)
    skill_description = models.CharField(max_length=20)


class role(models.Model):
    role = models.CharField(max_length=20, primary_key=True)
    role_description = models.CharField(max_length=20)

