import json
from rest_framework.serializers import (
    HyperlinkedIdentityField,
    ModelSerializer,
    SerializerMethodField,
    ValidationError
)

from rest_framework import serializers

from current.models import timesheet


class TimesheetDetailSerializer(ModelSerializer):
    total = serializers.IntegerField()
    date__month = serializers.CharField()

    class Meta:
        model = timesheet
        fields = [
            'taskid',
            'is_billable',
            'date__month',
            'total',
        ]



