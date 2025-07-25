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
    first_name = models.CharField(max_length=255, null=True, blank=True)
    last_name = models.CharField(max_length=255, null=True, blank=True)
    gender = models.CharField(max_length=10, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'user_name'
    REQUIRED_FIELDS = ['email','role']

    def full_name(self):
        return f"{self.first_name or ''} {self.last_name or ''}".strip()
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




###### Abstract models for Chapter, SubTopic, and Prerequisite
class AbstractChapter(models.Model):
    academic_year = models.ForeignKey('SchoolAcademicYear', on_delete=models.CASCADE)
    chapter_number = models.PositiveIntegerField()
    chapter_name = models.CharField(max_length=200)

    class Meta:
        abstract = True
        ordering = ['academic_year', 'chapter_number']

class AbstractSubTopic(models.Model):
    chapter = models.ForeignKey('Chapter', on_delete=models.CASCADE, related_name='sub_topics')
    name = models.CharField(max_length=200)

    class Meta:
        abstract = True
        ordering = ['chapter', 'name']

    def __str__(self):
        return self.name

class AbstractPrerequisite(models.Model):
    chapter = models.ForeignKey('Chapter', on_delete=models.CASCADE, related_name='prerequisites')
    topic = models.CharField(max_length=200)
    explanation = models.TextField()

    class Meta:
        abstract = True
        ordering = ['chapter', 'topic']

    def __str__(self):
        return self.topic

class AbstractAcademicYear(models.Model):
    start_year = models.IntegerField(null=True, blank=True)
    end_year = models.IntegerField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        abstract = True

    def __str__(self):
        return str(self.start_date) + ' - ' + str(self.end_date)

class AbstractSubject(models.Model):
    name = models.CharField(max_length=100, unique=True)
    class Meta:
        abstract = True