from datetime import datetime
from utils.projectsutils import get_friday
from django.db.models import Min, Count, Sum
from rest_framework.generics import (
    ListAPIView,
    CreateAPIView,
)
from .serializers import (
    TimesheetDetailSerializer,
)
from current.models import timesheet
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAdminUser,
    IsAuthenticatedOrReadOnly,
)
from current.api.permissions import IsOwnerOrReadOnly
from rest_framework.response import Response
import json


class TimesheetDetailApiView(ListAPIView):
    serializer_class = TimesheetDetailSerializer
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        try:
            user = self.kwargs['user']
        except KeyError:
            user = self.request.user.username
        k = dict()
        if user.upper() == 'ALL':
            pass
        else:
            k['user'] = user
        k['date__year'] = datetime.now().year
        query_result = timesheet.objects.filter(**k) \
            .values('date__month', 'taskid', 'is_billable').order_by('date__month', 'taskid', 'is_billable') \
            .annotate(total=Sum('sum_hours'))
        return query_result



