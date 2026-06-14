from django.contrib.auth import get_user_model
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import PhoneLoginSerializer, RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class PhoneLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PhoneLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        name = serializer.validated_data["name"].strip()
        phone_number = serializer.validated_data["phone_number"].strip()

        profile = User.objects.filter(profile__phone_number=phone_number).first()
        if profile:
            user = profile
            if name and user.first_name != name:
                user.first_name = name
                user.save(update_fields=["first_name"])
        else:
            user = User.objects.create_user(username=phone_number, first_name=name)
            user.set_unusable_password()
            user.save()
            user.profile.phone_number = phone_number
            user.profile.save(update_fields=["phone_number"])

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            }
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by("username")
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]


class UserSearchView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get("q", "")
        return User.objects.filter(profile__phone_number__icontains=query).order_by("first_name", "username")


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({"detail": "Logged out."})
