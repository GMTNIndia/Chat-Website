import shortuuid
from rest_framework import viewsets
from .serializers import (
    AdminandAgentSerializer,
    AgentEditSerializer,
    ChatRoomSerializer,
    MessageSerializer,
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.shortcuts import render
from .models import ChatRoom, NewUser, Room, Message
from Chat_app_2.models import User
from django.contrib.auth.decorators import login_required, user_passes_test
from rest_framework import generics
from .models import AdminandAgent
from .serializers import NewUserSerializer, RoomSerializer


# Prasanth Senthilvel changes start
class AdminandAgentView(generics.CreateAPIView):
    queryset = AdminandAgent.objects.all()
    serializer_class = AdminandAgentSerializer


# Prasanth Senthilvel changes end
class AdminandAgentListView(generics.ListAPIView):
    queryset = AdminandAgent.objects.all()
    serializer_class = AdminandAgentSerializer


class AgentDetailUpdateView(generics.RetrieveUpdateAPIView):
    queryset = AdminandAgent.objects.all()
    serializer_class = AgentEditSerializer
    permission_classes = [IsAuthenticated]


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def get_queryset(self):
        user = self.request.user  # Assuming authentication is implemented
        return Message.objects.filter(receiver=user.email)


class UserMessageListView(generics.ListAPIView):
    queryset = Message.objects.filter(sender_type='user')
    serializer_class = MessageSerializer

class AgentMessageListView(generics.ListAPIView):
    queryset = Message.objects.filter(sender_type='agent')
    serializer_class = MessageSerializer


class TokenObtainPairView(APIView):
    permission_classes = [AllowAny]  # Allow any user to obtain token

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                }
            )
        else:
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )


# Check if the user is an admin
def is_admin(user):
    return user.is_staff


# Check if the user is an agent
def is_agent(user):
    return not user.is_staff


@login_required
@user_passes_test(is_admin)
def admin(request):
    rooms = Room.objects.all()
    users = User.objects.filter(is_staff=True)

    return render(request, "chat/admin.html", {"rooms": rooms, "users": users})


@login_required
@user_passes_test(is_agent)
def agent(request):
    rooms = Room.objects.all()  # Adjust this query based on what agents should see
    users = User.objects.filter(is_staff=False)  # Assuming agents are non-staff users

    return render(request, "chat/agent.html", {"rooms": rooms, "users": users})


class AgentSearchAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        query = request.GET.get("q", "")
        if query:
            agents = AdminandAgent.search(query)
            serializer = AdminandAgentSerializer(agents, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Query parameter 'q' is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )


class NewUserViewSet(viewsets.ModelViewSet):
    queryset = NewUser.objects.all()
    serializer_class = NewUserSerializer
    permission_classes = [AllowAny] 

    def perform_create(self, serializer):
        new_user = serializer.save()

        # Automatically create a room when a new user is created
        room_id = shortuuid.uuid()  # You can generate a unique room ID here
        room_name = new_user.user  # Use the username as the room name
        room_status = "waiting"  # Set the initial status of the room

        # Assuming you want to associate the room with the newly created user
        Room.objects.create(
            room_id=room_id, user=room_name, status=room_status, agent="Not yet..."
        )


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer


class JoinChatRoomView(generics.UpdateAPIView):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer

    def update(self, request, *args, **kwargs):
        chat_room = self.get_object()
        room_id = kwargs.get("pk")
        Room = Room.objects.get(room_id=room_id)

        # Perform any necessary checks before joining the room
        # For example, you can check if the room status is 'waiting'

        # Now, update the chat room's fields
        chat_room.user = Room.user
        chat_room.status = Room.status
        chat_room.started = Room.started
        chat_room.page = Room.page
        chat_room.agent = Room.agent
        chat_room.save()

        serializer = self.get_serializer(chat_room)
        return Response(serializer.data)


class ChatRoomDetailView(generics.RetrieveAPIView):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [IsAuthenticated]


class ChatRoomListView(generics.ListAPIView):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
