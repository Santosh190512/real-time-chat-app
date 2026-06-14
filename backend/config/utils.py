from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()


def get_token_from_scope(scope):
    query_string = scope.get("query_string", b"").decode()
    return parse_qs(query_string).get("token", [None])[0]


@database_sync_to_async
def get_user_from_token(token):
    if not token:
        return None

    try:
        access_token = AccessToken(token)
        return User.objects.get(id=access_token["user_id"])
    except Exception:
        return None
