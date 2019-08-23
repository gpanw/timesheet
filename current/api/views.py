from datetime import datetime
from utils.projectsutils import get_friday
from rest_framework.generics import (
    ListAPIView,
    CreateAPIView,
)
from .serializers import (
    TimesheetDetailSerializer,
    TimesheetCreateUpdateSerializer,
)
from current.models import timesheet
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAdminUser,
    IsAuthenticatedOrReadOnly,
)
from .permissions import IsOwnerOrReadOnly
from rest_framework.response import Response
import json


class TimesheetDetailApiView(ListAPIView):
    serializer_class = TimesheetDetailSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        input_date = self.kwargs['date']
        input_date = datetime.strptime(input_date, "%Y-%m-%d").date()
        input_date = get_friday(input_date)
        return timesheet.objects.filter(user=self.request.user,
                                        date=input_date)


class TimesheetCreateApiView(CreateAPIView):
    queryset = timesheet.objects.all()
    serializer_class = TimesheetCreateUpdateSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def create(self, request, *args, **kwargs):
        tasks = json.loads(request.data['addedtask[]'])
        for t in tasks:
            t['date'] = kwargs['date']
            t['hours'] = json.dumps(t['hours'])
            t['user'] = self.request.user.username
            new_item = TimesheetCreateUpdateSerializer(data=t)
            if new_item.is_valid():
                new_item.save()
            else:
                key = next(iter(new_item.errors))
                return Response({'rc': new_item.errors[key][0]})
        return Response({'rc': 1})
