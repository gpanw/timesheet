from datetime import datetime
from datetime import timedelta
from rest_framework import status
from rest_framework.response import Response
from rest_framework.generics import (
    ListAPIView,
    CreateAPIView,
    DestroyAPIView,
)
from .serializers import (
    ApplyLeaveDetailSerializer,
    ApplyLeaveCreateSerializer)
from leave.models import applyleave
from userprofile.models import userprofile
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAdminUser,
    IsAuthenticatedOrReadOnly,
)
from current.api.permissions import IsOwnerOrReadOnly


class ApplyLeaveProjectListView(ListAPIView):
    serializer_class = ApplyLeaveDetailSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        user_list = userprofile.objects.values_list('user_id__username'). \
            filter(project=self.request.user.userprofile.project)
        return applyleave.objects.filter(user__in=user_list)


class ApplyLeaveUserListView(ListAPIView):
    serializer_class = ApplyLeaveDetailSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        user = self.kwargs['user']
        return applyleave.objects.filter(user=user)


class ApplyLeaveDateListView(ListAPIView):
    serializer_class = ApplyLeaveDetailSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrReadOnly]

    def get_queryset(self):
        input_date = self.kwargs['date']
        input_date = datetime.strptime(input_date, '%Y-%m-%d')
        user = self.kwargs['user']
        my_filter = dict()
        if user.upper() == 'ALL':
            pass
        else:
            my_filter['user'] = user
        my_filter['date'] = input_date.date()
        return applyleave.objects.filter(**my_filter)


class ApplyLeaveUserCreateView(CreateAPIView):
    queryset = applyleave.objects.all()
    serializer_class = ApplyLeaveCreateSerializer
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    def create(self, request, *args, **kwargs):
        t = dict()
        input_date = self.request.POST['Ldate']
        input_date = datetime.strptime(input_date, '%d %B %Y').date()
        t['leaveid'] = self.request.POST['leaveid']
        t['date'] = input_date
        t['user'] = self.request.POST['Lfor']
        t['comment'] = self.request.POST['Lcomment']
        new_item = ApplyLeaveCreateSerializer(data=t)
        if new_item.is_valid():
            self.perform_create(new_item)
            headers = self.get_success_headers(new_item.data)
        else:
            key = next(iter(new_item.errors))
            return Response({'rc': new_item.errors[key][0]})
        return Response(new_item.data, status=status.HTTP_201_CREATED, headers=headers)


class ApplyLeaveUserDeleteView(DestroyAPIView):
    queryset = applyleave.objects.all()
    serializer_class = ApplyLeaveDetailSerializer
    lookup_field = 'id'
    permission_classes = [IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
