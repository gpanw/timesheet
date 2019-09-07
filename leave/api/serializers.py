import json
from rest_framework.validators import UniqueTogetherValidator
from rest_framework.serializers import (
    HyperlinkedIdentityField,
    ModelSerializer,
    SerializerMethodField,
    ValidationError
)

from leave.models import applyleave


class ApplyLeaveDetailSerializer(ModelSerializer):

    class Meta:
        model = applyleave
        fields = [
            'id',
            'leaveid',
            'date',
            'comment',
            'user',
        ]


class ApplyLeaveCreateSerializer(ModelSerializer):

    class Meta:
        model = applyleave
        fields = [
            'id',
            'leaveid',
            'date',
            'comment',
            'user',
        ]
        validators = [
            UniqueTogetherValidator(
                queryset = applyleave.objects.all(),
                fields=('leaveid', 'date', 'user',),
                message='Leve has already been added for this user and date'
            )
        ]







