from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwnerOrReadOnly(BasePermission):
    message = 'You are not owner of this thread'

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user.username

