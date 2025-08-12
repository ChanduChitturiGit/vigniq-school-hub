from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from django.utils.timezone import now
from django.contrib.auth import authenticate

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'user_name'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['user_name'] = serializers.CharField()
        self.fields.pop('username', None)

    def validate(self, attrs):
        user = authenticate(
            request=self.context.get('request'),
            username=attrs.get('user_name'),
            password=attrs.get('password')
        )

        if not user:
            raise AuthenticationFailed("Invalid username or password. Please try again.")
        elif user and not user.is_active:
            raise AuthenticationFailed("Your account is inactive. Contact admin.")

        data = super().validate(attrs)
        data['user'] = {
            'email': user.email,
            'user_name': user.user_name,
            'role': user.role.name,
            'last_login': user.last_login,
            'school_id' : user.school_id,
            'user_id': user.id
        }
        self.user.last_login = now()
        self.user.save(update_fields=['last_login'])
        return data
