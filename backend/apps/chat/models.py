from django.db import models
from django.conf import settings


class ChatRoom(models.Model):
    ROOM_TYPES = (
        ("private", "Private"),
        ("group", "Group"),
    )

    name = models.CharField(max_length=255, blank=True, null=True)
    avatar = models.ImageField(upload_to="groups/", blank=True, null=True)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPES, default="private")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_rooms",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name or f"Room {self.id}"


class ChatParticipant(models.Model):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("member", "Member"),
    )

    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name="participants",
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="member")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("room", "user")

    def __str__(self):
        return f"{self.user.username} - {self.room.id}"
