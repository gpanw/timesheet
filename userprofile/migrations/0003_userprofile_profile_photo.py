# Generated by Django 2.2 on 2019-06-09 02:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('userprofile', '0002_userprofile_manager_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='profile_photo',
            field=models.ImageField(default='/profile/pics/images.png', upload_to='img/profilepics'),
        ),
    ]
