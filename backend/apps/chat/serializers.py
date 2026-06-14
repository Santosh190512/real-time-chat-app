from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import ChatParticipant, ChatRoom

User = get_user_model()


class ChatParticipantSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    name = serializers.CharField(source="user.first_name", read_only=True)
    phone_number = serializers.CharField(source="user.profile.phone_number", read_only=True)
    user_id = serializers.IntegerField(source="user.id", read_only=True)

    class Meta:
        model = ChatParticipant
        fields = ("id", "user_id", "username", "name", "phone_number", "role", "joined_at")


class ChatRoomSerializer(serializers.ModelSerializer):
    participants = ChatParticipantSerializer(many=True, read_only=True)
    participant_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
    )
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = (
            "id",
            "name",
            "avatar",
            "room_type",
            "created_by",
            "participants",
            "participant_ids",
            "last_message",
            "created_at",
        )
        read_only_fields = ("id", "created_by", "created_at")

    def get_last_message(self, obj):
        message = obj.messages.order_by("-created_at").first()
        if not message:
            return None
        return {
            "id": message.id,
            "content": message.content,
            "sender": message.sender_id,
            "sender_name": message.sender.first_name or getattr(message.sender.profile, "phone_number", None) or message.sender.username,
            "created_at": message.created_at,
        }

    def validate_participant_ids(self, value):
        existing_ids = set(User.objects.filter(id__in=value).values_list("id", flat=True))
        missing_ids = set(value) - existing_ids
        if missing_ids:
            raise serializers.ValidationError(f"Users not found: {sorted(missing_ids)}")
        return value

    def create(self, validated_data):
        participant_ids = validated_data.pop("participant_ids", [])
        request = self.context["request"]
        room = ChatRoom.objects.create(created_by=request.user, **validated_data)

        user_ids = set(participant_ids)
        user_ids.add(request.user.id)
        ChatParticipant.objects.bulk_create(
            [ChatParticipant(room=room, user_id=user_id) for user_id in user_ids],
            ignore_conflicts=True,
        )

        return room


class PrivateChatSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()

    def validate_user_id(self, value):
        request = self.context["request"]
        if value == request.user.id:
            raise serializers.ValidationError("You cannot chat with yourself.")
        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("User not found.")
        return value


class StartChatSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=15)

    def validate_phone_number(self, value):
        request = self.context["request"]
        target = User.objects.filter(profile__phone_number=value).first()
        if target is None:
            raise serializers.ValidationError("Phone number is not registered.")
        if target == request.user:
            raise serializers.ValidationError("You cannot chat with yourself.")
        return value
