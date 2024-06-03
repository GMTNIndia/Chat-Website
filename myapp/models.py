from uuid import uuid4
from django.contrib.auth.models import (AbstractBaseUser, BaseUserManager, PermissionsMixin)
from django.db import models


class AdminandAgentManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, role, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, first_name=first_name, last_name=last_name, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, role, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, first_name, last_name, role, password, **extra_fields)

class AdminandAgent(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("agent", "Agent"),
    )
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    role = models.CharField(max_length=5, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = AdminandAgentManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'role']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"
    

#chat room model

class ChatRoom(models.Model):
    room_id = models.UUIDField(default=uuid4, primary_key=True, editable=False, unique=True)
    user_name = models.CharField(max_length=255)
    room_status = models.CharField(max_length=50, default='Waiting...')
    agent = models.CharField(max_length=255, default='Not yet joined')
    started = models.DateTimeField(auto_now_add=True)
    page_url = models.URLField(max_length=200)

    def save(self, *args, **kwargs):
        if not self.page_url:
            self.page_url = f'http://127.0.0.1:8000/chat/{self.room_id}/'
        super().save(*args, **kwargs)

    def __str__(self):
        return str(self.room_id)
    



class Message(models.Model):
    ROLE_CHOICES = [
        ('user','User'),
        ('agent', 'Agent'),
        ('system', 'System'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    room_id = models.UUIDField()
    message = models.TextField()
    sender = models.CharField(max_length=100)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message {self.id} in Room {self.room_id} by {self.sender} ({self.role})"

