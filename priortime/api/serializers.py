import json
from rest_framework.serializers import (
    HyperlinkedIdentityField,
    ModelSerializer,
    SerializerMethodField,
    ValidationError
)

from priortime.models import priorsheet
from userprofile.models import userprofile
from project.models import leave, task
from django.utils import timezone
from django.core.exceptions import ObjectDoesNotExist
from utils.projectsutils import get_friday


class PriorsheetDetailSerializer(ModelSerializer):
    hours = SerializerMethodField()

    class Meta:
        model = priorsheet
        fields = [
            'date',
            'taskid',
            'is_billable',
            'hours',
            'approved',
        ]

    def get_hours(self, obj):
        jsonDec = json.decoder.JSONDecoder()
        return jsonDec.decode(obj.hours)


class PriorsheetCreateUpdateSerializer(ModelSerializer):
    class Meta:
        model = priorsheet
        fields = [
            'user',
            'taskid',
            'is_billable',
            'date',
            'hours'
        ]

    def create(self, validated_data):
        try:
            obj = priorsheet.objects.get(taskid=validated_data['taskid'],
                                         date=validated_data['date'],
                                         is_billable=validated_data['is_billable'],
                                         user=validated_data['user'])
        except ObjectDoesNotExist:
            obj = priorsheet(taskid=validated_data['taskid'],
                             date=validated_data['date'],
                             hours=validated_data['hours'],
                             user=validated_data['user'],
                             is_billable=validated_data['is_billable'])
            super(PriorsheetCreateUpdateSerializer, self).create(validated_data)
        else:
            obj.hours = validated_data['hours']
            self.update(obj, validated_data)
        return obj

    def validate(self, data):
        task_name = data['taskid']
        is_billable = data['is_billable']
        user = data['user']
        leave_list = [x.leave_id for x in leave.objects.all()]
        json_dec = json.decoder.JSONDecoder()
        hr = json_dec.decode(data['hours'])
        if task_name.split(' - ')[0] in leave_list:
            u = userprofile.objects.get(user_id__username=user)
            if task_name.split(' - ')[0] == 'EL':
                if sum([float(x) for x in hr]) > u.earned_leave:
                    raise ValidationError("You do not have enough Earned Leave!!!")
            if task_name.split(' - ')[0] == 'CL':
                if sum([float(x) for x in hr]) > u.casual_leave:
                    raise ValidationError("You do not have enough Casual Leaves!!!")
        else:
            try:
                get_task_id = task.objects.get(task_name=task_name,
                                               is_billable=is_billable)
            except ObjectDoesNotExist:
                raise ValidationError('task ' + task_name + ' is not correct!!!')
        return data

    def validate_hours(self, hours):
        json_dec = json.decoder.JSONDecoder()
        hr = json_dec.decode(hours)
        for h in hr:
            try:
                float(h)
            except ValueError:
                raise ValidationError("Non-Integers values in hours!!!")
        return hours
