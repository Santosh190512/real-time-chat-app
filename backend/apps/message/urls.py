from django.urls import path

from .views import MessageViewSet

message_list = MessageViewSet.as_view(
    {
        "get": "list",
        "post": "create",
    }
)
message_detail = MessageViewSet.as_view(
    {
        "get": "retrieve",
        "patch": "partial_update",
        "delete": "destroy",
    }
)

urlpatterns = [
    path("<int:room_id>/messages/", message_list, name="message-list"),
    path("<int:room_id>/messages/<int:pk>/", message_detail, name="message-detail"),
]
