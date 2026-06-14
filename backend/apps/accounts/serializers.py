from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Profile

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("id", "username", "email", "password")

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class PhoneLoginSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    phone_number = serializers.CharField(max_length=15)


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="first_name", required=False, allow_blank=True)
    phone_number = serializers.CharField(
        source="profile.phone_number",
        required=False,
        allow_blank=True,
        validators=[],
    )
    bio = serializers.CharField(source="profile.bio", required=False, allow_blank=True)
    profile_picture = serializers.ImageField(
        source="profile.profile_picture",
        required=False,
        allow_null=True,
    )

    class Meta:
        model = User
        fields = ("id", "username", "name", "email", "phone_number", "bio", "profile_picture")
        read_only_fields = ("id", "username", "email")

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", {})
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.save()

        profile, _ = Profile.objects.get_or_create(user=instance)
        profile.bio = profile_data.get("bio", profile.bio)
        phone_number = profile_data.get("phone_number", profile.phone_number)
        if phone_number != profile.phone_number:
            if User.objects.filter(profile__phone_number=phone_number).exclude(id=instance.id).exists():
                raise serializers.ValidationError({"phone_number": "This phone number is already registered."})
            profile.phone_number = phone_number
        if "profile_picture" in profile_data:
            profile.profile_picture = profile_data["profile_picture"]
        profile.save()
        return instance
