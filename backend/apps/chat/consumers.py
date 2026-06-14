import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from apps.chat.models import ChatParticipant, ChatRoom
from apps.message.models import Message
from apps.message.serializers import MessageSerializer
from apps.notifications.models import Notification
from config.utils import get_token_from_scope, get_user_from_token


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"chat_{self.room_id}"
        token = get_token_from_scope(self.scope)
        self.user = await get_user_from_token(token)

        if self.user is None:
            await self.close(code=4001)
            return

        is_participant = await self.is_room_participant()
        if not is_participant:
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        seen_message_ids = await self.mark_room_messages_seen()
        for message_id in seen_message_ids:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "message_seen",
                    "message_id": message_id,
                },
            )

    async def disconnect(self, close_code):
        if hasattr(self, "room_group_name"):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        if not text_data:
            return

        try:
            payload = json.loads(text_data)
        except json.JSONDecodeError:
            return

        event_type = payload.get("type", "chat_message")

        if event_type == "typing":
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "typing",
                    "username": self.user.username,
                    "user_id": self.user.id,
                },
            )
            return

        if event_type == "read_receipt":
            message_id = payload.get("message_id")
            await self.mark_message_seen(message_id)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "message_seen",
                    "message_id": message_id,
                },
            )
            return

        if event_type == "delivered_receipt":
            message_id = payload.get("message_id")
            await self.mark_message_delivered(message_id)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "message_delivered",
                    "message_id": message_id,
                },
            )
            return

        content = payload.get("content") or payload.get("message") or ""
        content = content.strip()
        if not content:
            return

        message = await self.create_message(content)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
            },
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event["message"]))

    async def typing(self, event):
        await self.send(text_data=json.dumps({"type": "typing", **event}))

    async def message_seen(self, event):
        await self.send(text_data=json.dumps({"type": "message_seen", **event}))

    async def message_delivered(self, event):
        await self.send(text_data=json.dumps({"type": "message_delivered", **event}))

    @database_sync_to_async
    def is_room_participant(self):
        return ChatParticipant.objects.filter(
            room_id=self.room_id,
            user=self.user,
        ).exists()

    @database_sync_to_async
    def create_message(self, content):
        room = ChatRoom.objects.get(id=self.room_id)
        message = Message.objects.create(
            room=room,
            sender=self.user,
            content=content,
        )

        receivers = ChatParticipant.objects.filter(room=room).exclude(user=self.user)
        Notification.objects.bulk_create(
            [
                Notification(
                    receiver=participant.user,
                    title=f"New message from {self.user.username}",
                    body=content[:255],
                    notification_type="message",
                    data={"room_id": room.id, "message_id": message.id},
                )
                for participant in receivers
            ]
        )

        return MessageSerializer(message).data

    @database_sync_to_async
    def mark_message_seen(self, message_id):
        Message.objects.filter(id=message_id, room_id=self.room_id).exclude(sender=self.user).update(
            status="seen",
            is_read=True,
        )

    @database_sync_to_async
    def mark_room_messages_seen(self):
        message_ids = list(
            Message.objects.filter(room_id=self.room_id)
            .exclude(sender=self.user)
            .exclude(status="seen")
            .values_list("id", flat=True)
        )
        Message.objects.filter(id__in=message_ids).update(status="seen", is_read=True)
        return message_ids

    @database_sync_to_async
    def mark_message_delivered(self, message_id):
        Message.objects.filter(id=message_id, room_id=self.room_id, status="sent").update(status="delivered")
