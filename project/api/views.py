from rest_framework.generics import (
    ListAPIView,
    CreateAPIView,
    RetrieveAPIView,
)
from .serializers import TaskDetailSerializer
from project.models import task
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
    IsAdminUser,
    IsAuthenticatedOrReadOnly,
)


class TaskDetailApiView(ListAPIView):
    queryset = task.objects.all()
    serializer_class = TaskDetailSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'task_group'

    def get_queryset(self):
        task_group = self.kwargs['task_group']
        print('g11111', task.objects.filter(task_group=task_group))
        return task.objects.filter(task_group=task_group)




