from django import forms
from .models import userprofile


class UserprofileForm(forms.ModelForm):
    profile_photo = forms.ImageField(label='')
    class Meta:
        model = userprofile
        fields = ['profile_photo']
