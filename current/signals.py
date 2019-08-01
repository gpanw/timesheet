from django.dispatch import receiver
from django.db.models.signals import post_save
from .models import timesheet
from userprofile.models import userprofile


@receiver(post_save, sender=timesheet)
def handling_leaves_on_new_time_entry(sender, instance, created, **kwargs):
    if created:
        adjusted = instance.sum_hours
    else:
        adjusted = instance.sum_hours - instance.current_sum_hours
    t = instance.taskid.split(' - ')
    u = userprofile.objects.get(user_id__username=instance.user)
    if t[0] == 'EL':
        u.earned_leave = str(float(u.earned_leave) - adjusted)
    if t[0] == 'CL':
        u.casual_leave = str(float(u.casual_leave) - adjusted)
    u.save()
