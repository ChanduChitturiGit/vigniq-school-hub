from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from django.utils.timezone import now
from django.contrib.auth import authenticate,get_user_model
from school.models import School
from subscriptions.models import Subscription

User = get_user_model()
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'user_name'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['user_name'] = serializers.CharField()
        self.fields.pop('username', None)

    def validate(self, attrs):

        username = attrs.get('user_name')
        password = attrs.get('password')

        # Check if the user exists first
        try:
            user_obj = User.objects.get(user_name=username)
        except User.DoesNotExist:
            raise AuthenticationFailed("Invalid username or password. Please try again.")

        # Check active status before authenticating
        if not user_obj.is_active:
            raise AuthenticationFailed("Your account is inactive. Contact admin.")
        if user_obj.role and user_obj.role_id ==4:  # Student
            raise AuthenticationFailed("Students features are under development.")

        # Now authenticate credentials
        user = authenticate(
            request=self.context.get('request'),
            username=username,
            password=password
        )

        if not user:
            raise AuthenticationFailed("Invalid username or password. Please try again.")
        
        if not user.is_superuser:
            school_id = user.school_id
            if not school_id:
                raise AuthenticationFailed("User is not associated with any school. Please contact support.")
            
            school = School.objects.get(id=school_id)
            if not school.is_active:
                raise AuthenticationFailed("The school associated with this user is inactive. Please contact support.")

            subscription = Subscription.objects.filter(school_id=school_id, is_active=True)
            if not subscription.exists():
                raise AuthenticationFailed("Your school is not associated with any subscription. Please contact support or your school admin.")
            expiry_date = subscription.first().expiry_date
            if expiry_date < now().date():
                raise AuthenticationFailed("Your subscription has expired. Please contact support or your school admin.")

        data = super().validate(attrs)
        school_name = School.objects.get(id=user.school_id).name if user.school_id else None
        data['user'] = {
            'email': user.email,
            'user_name': user.user_name,
            'role': user.role.name,
            'last_login': user.last_login,
            'school_id' : user.school_id,
            'user_id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'school_name': school_name
        }
        self.user.last_login = now()
        self.user.save(update_fields=['last_login'])
        return data
