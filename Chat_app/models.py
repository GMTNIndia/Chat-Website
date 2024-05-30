from django.db import models
from Chat_app_2.models import User


# Prasanth Senthilvel code changes start
# Create model for Admin and Agent creation
class AdminandAgent(models.Model):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("agent", "Agent"),
    )
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30)
    last_name = models.CharField(max_length=30)
    role = models.CharField(max_length=5, choices=ROLE_CHOICES)
    password = models.CharField(max_length=20)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.role})"

    # Prasanth Senthilvel code changes end

    @staticmethod
    def search(query):
        return AdminandAgent.objects.filter(
            models.Q(first_name__icontains=query) | models.Q(last_name__icontains=query)
        )


class Message(models.Model):
    sender = models.CharField(max_length=100)
    receiver = models.CharField(max_length=100)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    sender_type = models.CharField(max_length=50)  # Add this field


class NewUser(models.Model):
    user = models.CharField(max_length=100)

    def __str__(self):
        return self.user


class Room(models.Model):
    WAITING = "waiting"
    ACTIVE = "active"
    CLOSED = "closed"

    CHOICES_STATUS = (
        (WAITING, "Waiting"),
        (ACTIVE, "Active"),
        (CLOSED, "Closed"),
    )
    room_id = models.CharField(max_length=10, unique=True)
    user = models.CharField(max_length=50)
    agent = models.CharField(max_length=50)
    url = models.CharField(max_length=255, blank=True, null=True)
    status = models.CharField(max_length=20, choices=CHOICES_STATUS, default=WAITING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.room_id


class ChatRoom(models.Model):
    ACTIVE = "active"
    CLOSED = "closed"

    CHOICES_STATUS = (
        (ACTIVE, "Active"),
        (CLOSED, "Closed"),
    )
    id = models.CharField(max_length=10, primary_key=True)
    user = models.CharField(max_length=100)
    started = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=CHOICES_STATUS, default=ACTIVE)
    page = models.URLField()
    agent = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.user
