from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

from core.common_modules.password_validator import is_valid_password

class UserManager(BaseUserManager):
    def create_user(self, user_name, password=None, **extra_fields):
        if not user_name:
            raise ValueError("Users must have a user_name")

        role = extra_fields.pop('role', None)
        if isinstance(role, int):
            role = Role.objects.get(pk=role)

        user = self.model(user_name=user_name, role=role, **extra_fields)
        if not is_valid_password(password):
            raise ValueError("Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.")

                
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, user_name, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if not extra_fields.get("is_staff"):
            raise ValueError("Superuser must have is_staff=True.")
        if not extra_fields.get("is_superuser"):
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(user_name, password, **extra_fields)


class User(AbstractBaseUser,PermissionsMixin):

    email = models.EmailField()
    user_name = models.CharField(max_length=100,unique=True)
    role = models.ForeignKey('Role', on_delete=models.CASCADE,
                             related_name='users',
                             null=True,
                             blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    school_id = models.IntegerField(null=True, blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    full_name = models.CharField(max_length=255, null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'user_name'
    REQUIRED_FIELDS = ['email','role']

    class Meta:
        db_table = 'auth_user'

    def __str__(self):
        return self.user_name
    
class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = 'auth_role'

    def __str__(self):
        return self.name
