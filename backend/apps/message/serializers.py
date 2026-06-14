from rest_framework import serializers

from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.username", read_only=True)
    sender_display_name = serializers.SerializerMethodField()
    sender_phone_number = serializers.CharField(source="sender.profile.phone_number", read_only=True)
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = "__all__"
        read_only_fields = ("id", "room", "sender", "sender_name", "is_read", "created_at")

    def get_file_url(self, obj):
        request = self.context.get("request")
        if not obj.file:
            return None
        if request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url

    def get_sender_display_name(self, obj):
        phone_number = None
        if hasattr(obj.sender, "profile"):
            phone_number = obj.sender.profile.phone_number
        return obj.sender.first_name or phone_number or obj.sender.username
