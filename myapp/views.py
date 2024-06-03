from django.http import JsonResponse
from django.contrib.auth import authenticate
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from django.views.generic import View

from .models import AdminandAgent, ChatRoom, Message
from .serializers import *


# add agent and admin
class RegisterView(generics.CreateAPIView):
    queryset = AdminandAgent.objects.all()
    serializer_class = AdminandAgentSerializer


# login agent and admin

from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .serializers import AdminandAgentSerializer


class LoginView(generics.GenericAPIView):
    serializer_class = AdminandAgentSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")
        user = authenticate(email=email, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            role = user.role
            first_name = user.first_name
            return Response(
                {
                    "refresh": str(refresh),
                    "role": role,
                    "first_name": first_name,
                    "access": str(refresh.access_token),
                }
            )
        return Response(
            {"error": "Invalid Credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )


# get all agents and admins


class AdminandAgentListView(generics.ListAPIView):
    queryset = AdminandAgent.objects.all()
    serializer_class = AdminandAgentSerializer


# edit agent and admin by id
class AdminandAgentUpdateView(generics.RetrieveUpdateAPIView):
    queryset = AdminandAgent.objects.all()
    serializer_class = AgentEditSerializer
    permission_classes = [AllowAny]


# chat room details view
class CreateRoomView(APIView):
    def post(self, request):
        user_name = request.data.get("user_name")
        if not user_name:
            return Response(
                {"error": "User name is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        chat_room = ChatRoom(user_name=user_name)
        chat_room.save()  # The page_url is set during save method of the model
        serializer = ChatRoomSerializer(chat_room)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ListRoomsView(APIView):
    def get(self, request):
        rooms = ChatRoom.objects.all()
        serializer = ChatRoomSerializer(rooms, many=True)
        return Response(serializer.data)


class RoomDetailView(APIView):
    def get(self, request, room_id):
        try:
            room = ChatRoom.objects.get(room_id=room_id)
        except ChatRoom.DoesNotExist:
            return Response(
                {"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = ChatRoomSerializer(room)
        return Response(serializer.data)


class DeleteRoomView(generics.DestroyAPIView):
    queryset = ChatRoom.objects.all()
    lookup_field = "room_id"

    def delete(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except ChatRoom.DoesNotExist:
            return Response(
                {"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND
            )

        self.perform_destroy(instance)
        return Response(
            {"success": "Room deleted successfully"}, status=status.HTTP_200_OK
        )


class StoreMessageView(View):
    def post(self, request):
        message_data = request.POST.get("message")
        sender = request.POST.get("sender")
        room_id = request.POST.get("room_id")

        # Store the message in the database
        message = Message.objects.create(
            room_id=room_id, message=message_data, sender=sender
        )

        return JsonResponse({"success": True, "message_id": message.id})


class CreateMessageView(generics.CreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer


class CreateMessageView(generics.CreateAPIView):
    serializer_class = MessageSerializer

    def create(self, request, *args, **kwargs):
        room_id = self.kwargs.get("room_id")
        data = request.data.copy()
        data["room_id"] = room_id
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )


class MessageListView(generics.ListAPIView):
    serializer_class = MessageSerializer

    def get_queryset(self):
        room_id = self.kwargs["room_id"]
        return Message.objects.filter(room_id=room_id)
