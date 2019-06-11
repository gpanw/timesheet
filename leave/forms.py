from django import forms
from project.models import leave
from django.contrib.auth.models import User, Group
from userprofile.models import userprofile
from django.contrib.admin.widgets import AdminDateWidget
from django.core.exceptions import ObjectDoesNotExist


class DateInput(forms.DateInput):
    input_type = 'date'


class applyleaveForm(forms.Form):
    user = 0

    def __init__(self, user, *args, **kwargs):
        self.user = user
        super(applyleaveForm, self).__init__(*args, **kwargs)

        self.fields['date'].widget.attrs['readonly'] = True
        us = userprofile.objects.get(user_id__username=user.username)
        userlist = userprofile.objects.filter(project=us.project)
        u = [(val.user_id.username, val.user_id.username) for val in userlist]
        self.fields['users'] = forms.ChoiceField(choices=tuple(u), initial=self.user)

    leaves = [(0, 'Select Value')]
    try:
        leaveobj = leave.objects.all().order_by('leave_id')
    except:
        pass
    else:
        for x in leaveobj:
            leaves.append((x.leave_id, x.leave_id + ' - ' + x.leave_description))
        
    leaveid = forms.ChoiceField(choices=tuple(leaves))
    date = forms.CharField(initial='select Date from Calendar')
    users = forms.ChoiceField()
    repeat = forms.IntegerField(min_value=0, initial=0, required=False)
    comment = forms.CharField(max_length=20, required=False)

