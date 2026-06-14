from rest_framework.permissions import BasePermission

from .models import ChatParticipant


class IsChatParticipant(BasePermission):
    def has_object_permission(self, request, view, obj):
        return ChatParticipant.objects.filter(room=obj, user=request.user).exists()
