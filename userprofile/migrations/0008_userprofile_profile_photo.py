# Generated by Django 2.2 on 2019-06-09 03:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('userprofile', '0007_remove_userprofile_profile_photo'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='profile_photo',
            field=models.ImageField(default='/profilepics/images.png', upload_to='profilepics/'),
        ),
    ]
