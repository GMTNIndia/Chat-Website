from rest_framework import serializers
from .models import Message, Room
from .models import AdminandAgent


class AdminandAgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminandAgent
        fields = ["id","email", "first_name", "last_name", "role", "password"]


class AgentEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminandAgent
        fields = ["email", "first_name", "last_name", "role"]


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = "__all__"


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = "__all__"
