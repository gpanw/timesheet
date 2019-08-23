import json
from rest_framework.serializers import (
    HyperlinkedIdentityField,
    ModelSerializer,
    SerializerMethodField,
    ValidationError
)

from project.models import task


class TaskDetailSerializer(ModelSerializer):
    class Meta:
        model = task
        fields = [
            'task_name',
            'is_billable',
            'task_group',
        ]


class TaskListSerializer(ModelSerializer):
    class Meta:
        model = task
        fields = [
            'task_name',
            'is_billable',
            'task_group',
        ]
