from django.db import models
from django.conf import settings


class Message(models.Model):
    MESSAGE_TYPES = (
        ("text", "Text"),
        ("image", "Image"),
        ("video", "Video"),
        ("document", "Document"),
    )

    STATUS_CHOICES = (
        ("sent", "Sent"),
        ("delivered", "Delivered"),
        ("seen", "Seen"),
    )

    room = models.ForeignKey(
        "chat.ChatRoom",
        on_delete=models.CASCADE,
        related_name="messages",
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_messages",
    )
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPES, default="text")
    content = models.TextField(blank=True, null=True)
    file = models.FileField(upload_to="chat_files/", blank=True, null=True)
    attachment = models.FileField(upload_to="attachments/", blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="sent")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("created_at",)

    def __str__(self):
        return (self.content or self.message_type)[:30]
