from django.contrib.auth import get_user_model
from django.db.models import Count
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import ChatParticipant, ChatRoom
from .permissions import IsChatParticipant
from .serializers import ChatRoomSerializer, PrivateChatSerializer, StartChatSerializer

User = get_user_model()


class ChatRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            ChatRoom.objects.filter(participants__user=self.request.user)
            .select_related("created_by")
            .prefetch_related("participants__user", "messages__sender")
            .distinct()
            .order_by("-created_at")
        )

    def get_permissions(self):
        if self.action in ("retrieve", "update", "partial_update", "destroy"):
            return [IsAuthenticated(), IsChatParticipant()]
        return [IsAuthenticated()]

    @action(detail=False, methods=["post"], url_path="private")
    def private(self, request):
        serializer = PrivateChatSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        other_user = User.objects.get(id=serializer.validated_data["user_id"])
        room = (
            ChatRoom.objects.filter(room_type="private", participants__user=request.user)
            .filter(participants__user=other_user)
            .annotate(participant_count=Count("participants"))
            .filter(participant_count=2)
            .first()
        )

        if room is None:
            room = ChatRoom.objects.create(room_type="private", created_by=request.user)
            ChatParticipant.objects.bulk_create(
                [
                    ChatParticipant(room=room, user=request.user),
                    ChatParticipant(room=room, user=other_user),
                ],
                ignore_conflicts=True,
            )

        data = self.get_serializer(room).data
        return Response(data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="start")
    def start(self, request):
        serializer = StartChatSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        phone_number = serializer.validated_data["phone_number"]
        other_user = User.objects.get(profile__phone_number=phone_number)

        room = (
            ChatRoom.objects.filter(room_type="private", participants__user=request.user)
            .filter(participants__user=other_user)
            .annotate(participant_count=Count("participants"))
            .filter(participant_count=2)
            .first()
        )

        if room is None:
            room = ChatRoom.objects.create(room_type="private", created_by=request.user)
            ChatParticipant.objects.bulk_create(
                [
                    ChatParticipant(room=room, user=request.user),
                    ChatParticipant(room=room, user=other_user),
                ],
                ignore_conflicts=True,
            )

        return Response(self.get_serializer(room).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["post"], url_path="create_group")
    def create_group(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        room = serializer.save(room_type="group")

        ChatParticipant.objects.update_or_create(
            room=room,
            user=request.user,
            defaults={"role": "admin"},
        )

        return Response(self.get_serializer(room).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="add_member")
    def add_member(self, request, pk=None):
        room = self.get_object()
        user_id = request.data.get("user_id")
        if not self._is_admin(room, request.user):
            return Response({"detail": "Only group admins can add members."}, status=403)

        ChatParticipant.objects.get_or_create(room=room, user_id=user_id)
        return Response({"success": True})

    @action(detail=True, methods=["post"], url_path="remove_member")
    def remove_member(self, request, pk=None):
        room = self.get_object()
        user_id = request.data.get("user_id")
        if not self._is_admin(room, request.user):
            return Response({"detail": "Only group admins can remove members."}, status=403)

        ChatParticipant.objects.filter(room=room, user_id=user_id).delete()
        return Response({"success": True})

    @action(detail=True, methods=["post"], url_path="leave_group")
    def leave_group(self, request, pk=None):
        room = self.get_object()
        ChatParticipant.objects.filter(room=room, user=request.user).delete()
        return Response({"success": True})

    def _is_admin(self, room, user):
        return ChatParticipant.objects.filter(room=room, user=user, role="admin").exists()
