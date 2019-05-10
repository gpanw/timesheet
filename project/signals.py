from django.dispatch import receiver
from django.db.models.signals import post_save
from .models import teams, task
from django.core.exceptions import ObjectDoesNotExist


@receiver(post_save, sender=teams)
def build_task_on_team_creation(sender, instance, created, **kwargs):
    if created:
        try:
            is_available = task.objects.get(task_name=instance.team_name,
                                            task_status='OP',
                                            task_group=instance.team_name,
                                            is_billable=False)
        except ObjectDoesNotExist:
            addtask = task(task_name=instance.team_name,
                           task_status='OP',
                           task_group=instance.team_name,
                           is_billable=False).save()
        if instance.revenue_gen:
            try:
                is_available = task.objects.get(task_name=instance.team_name,
                                                task_status='OP',
                                                task_group=instance.team_name,
                                                is_billable=True)
            except ObjectDoesNotExist:
                addtask = task(task_name=instance.team_name,
                               task_status='OP',
                               task_group=instance.team_name,
                               is_billable=True).save()
    else:
        if instance.revenue_gen:
            try:
                is_available = task.objects.get(task_name=instance.team_name,
                                                task_status='OP',
                                                task_group=instance.team_name,
                                                is_billable=True)
            except ObjectDoesNotExist:
                addtask = task(task_name=instance.team_name,
                               task_status='OP',
                               task_group=instance.team_name,
                               is_billable=True).save()
        else:
            try:
                is_available = task.objects.get(task_name=instance.team_name,
                                                task_status='OP',
                                                task_group=instance.team_name,
                                                is_billable=True)
                is_available.delete()
            except ObjectDoesNotExist:
                pass