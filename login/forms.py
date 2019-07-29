from django import forms


class WriteToUsForm(forms.Form):
    email_id = forms.EmailField(label='Your Email',
                                widget=forms.EmailInput(attrs={'class': 'form-control'}))
    subject = forms.CharField(label='Subject',
                              widget=forms.TextInput(attrs={'class': 'form-control'}))
    message = forms.CharField(label='Message',
                              widget=forms.Textarea(attrs={'class': 'form-control'}))
