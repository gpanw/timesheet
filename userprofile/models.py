from django.db import models
from django.contrib.auth.models import Group, User
from current.countries import Countries
from project.models import skill, role, teams


class UserprofileManager(models.Manager):
    def getuserlist(self, userid):
        """manager function to return employee list for which userid is approver"""
        return_list = []
        u = User.objects.get(username=userid)
        if u.is_superuser:
            userlist = User.objects.values_list('username',
                                                flat=True).filter(is_staff=True)
        else:
            team_list = teams.objects.values_list('team_name',
                                                  flat=True).filter(team_lead=userid)
            userlist = self.values_list('user_id__username',
                                        flat=True).filter(project__in=team_list)
        prev = len(userlist)
        return_list += userlist
        while True:
            team_list = teams.objects.values_list('team_name',
                                                  flat=True).filter(team_lead__in=userlist)
            userlist = self.values_list('user_id__username',
                                        flat=True).filter(project__in=team_list)
            curr = len(userlist)
            if prev == curr:
                break
            else:
                prev = curr
                return_list += userlist
        if return_list:
            pass
        else:
            return_list = [userid]
        return_list.sort()
        return return_list


class userprofile(models.Model):
    user_id = models.OneToOneField(User, on_delete=models.CASCADE)
    earned_leave = models.DecimalField(max_digits=5, decimal_places=2)
    casual_leave = models.DecimalField(max_digits=4, decimal_places=2)
    user_role = models.CharField(max_length=20, default='',
                                 null=True, blank=True)
    user_skill = models.CharField(max_length=20, default='',
                                  null=True, blank=True)
    user_mobile = models.CharField(max_length=20, default='')
    project = models.CharField(max_length=20, null=True, blank=True)
    manager_id = models.CharField(max_length=20, null=True, blank=True)
    user_location = models.CharField(max_length=30, choices=Countries.countries_list,
                                     default=Countries.countries_list[0][0])
    profile_photo = models.ImageField(upload_to='profilepics/', default='/profilepics/images.png')
    objects = UserprofileManager()

    def save(self, *args, **kwargs):
        try:
            this = userprofile.objects.get(id=self.id)
            if this.profile_photo.name == self.profile_photo.name:
                pass
            else:
                this.profile_photo.delete(save=False)
        except:
            pass
        super(userprofile, self).save(*args, **kwargs)


