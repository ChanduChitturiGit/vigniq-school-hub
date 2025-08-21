from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist

User = get_user_model()

def get_user_from_jwt(token):
    try:
        access_token = AccessToken(token)
        user_id = access_token['user_id']
        return User.objects.get(id=user_id)
    except (ObjectDoesNotExist, Exception):
        return None