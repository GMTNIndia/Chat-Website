from rest_framework import serializers
from .models import ChatRoom, Message, NewUser, Room
from .models import AdminandAgent


class AdminandAgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminandAgent
        fields = '__all__'


class AgentEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminandAgent
        fields = ["id", "email", "first_name", "last_name", "role"]


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'content', 'timestamp', 'sender_type']


class NewUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewUser
        fields = "__all__"


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ["room_id", "user", "status", "agent"]


class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = ["user", "started", "status", "page", "agent"]
