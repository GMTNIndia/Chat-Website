
from rest_framework import serializers
from .models import AdminandAgent, ChatRoom, Message

class AdminandAgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminandAgent
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = AdminandAgent.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            role=validated_data['role'],
            password=validated_data['password']
        )
        return user


class AgentEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdminandAgent
        fields = ["id", "email", "first_name", "last_name", "role"] 



class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = ['room_id', 'user_name', 'room_status', 'agent', 'started', 'page_url']


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
