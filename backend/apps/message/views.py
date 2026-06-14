from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from apps.chat.models import ChatParticipant

from .models import Message
from .serializers import MessageSerializer


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        room_id = self.kwargs["room_id"]
        return Message.objects.filter(
            room_id=room_id,
            room__participants__user=self.request.user,
        ).select_related("sender", "room")

    def list(self, request, *args, **kwargs):
        room_id = self.kwargs["room_id"]
        response = super().list(request, *args, **kwargs)

        seen_ids = list(
            Message.objects.filter(room_id=room_id, room__participants__user=request.user)
            .exclude(sender=request.user)
            .exclude(status="seen")
            .values_list("id", flat=True)
        )

        if seen_ids:
            Message.objects.filter(id__in=seen_ids).update(status="seen", is_read=True)
            channel_layer = get_channel_layer()
            if channel_layer:
                for message_id in seen_ids:
                    async_to_sync(channel_layer.group_send)(
                        f"chat_{room_id}",
                        {
                            "type": "message_seen",
                            "message_id": message_id,
                        },
                    )

            queryset = self.filter_queryset(self.get_queryset())
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)

        return response

    def perform_create(self, serializer):
        room_id = self.kwargs["room_id"]
        if not ChatParticipant.objects.filter(room_id=room_id, user=self.request.user).exists():
            raise PermissionDenied("You are not a participant of this room.")
        message = serializer.save(
            sender=self.request.user,
            room_id=room_id,
            status="sent",
        )
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f"chat_{room_id}",
                {
                    "type": "chat_message",
                    "message": MessageSerializer(message, context={"request": self.request}).data,
                },
            )
