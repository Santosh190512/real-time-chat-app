from django.contrib import admin

from .models import ChatParticipant, ChatRoom

admin.site.register(ChatRoom)
admin.site.register(ChatParticipant)
