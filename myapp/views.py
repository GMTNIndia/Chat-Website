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
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status


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
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import logout


class LoginView(APIView):
    serializer_class = AdminandAgentSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")
        user = authenticate(email=email, password=password)
        if user.is_deleted == False:
            if user:
                refresh = RefreshToken.for_user(user)
                role = user.role
                first_name = user.first_name

                # Update agent status to active upon login
                if role == "agent":
                    try:
                        agent = AdminandAgent.objects.get(email=email)
                        agent.status = "active"
                        agent.save()
                    except AdminandAgent.DoesNotExist:
                        pass

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


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            if user.role == "agent":
                agent = AdminandAgent.objects.get(email=user.email)
                agent.status = "inactive"
                agent.save()
            return Response(
                {"detail": "Successfully logged out."}, status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# get all agents and admins


class AdminandAgentStatusView(generics.RetrieveAPIView):
    queryset = AdminandAgent.objects.all()
    serializer_class = AdminandAgentSerializer
    lookup_field = "email"  # Assuming email is used as the identifier for agents

    def get(self, request, *args, **kwargs):
        instance = self.get_object()
        data = {"name": instance.first_name, "status": instance.status}
        return Response(data)


class AdminandAgentListView(generics.ListAPIView):
    serializer_class = AdminandAgentSerializer

    def get_queryset(self):
        return AdminandAgent.objects.filter(is_deleted=False)


# edit agent and admin by id
class AdminandAgentUpdateView(generics.RetrieveUpdateAPIView):
    queryset = AdminandAgent.objects.all()
    serializer_class = AgentEditSerializer
    permission_classes = [AllowAny]


# delete agent and admin
class SoftDeleteAgentView(generics.UpdateAPIView):
    queryset = AdminandAgent.objects.all()
    lookup_field = "id"

    def delete(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
        except AdminandAgent.DoesNotExist:
            return Response(
                {"error": "Agent not found"}, status=status.HTTP_404_NOT_FOUND
            )

        instance.is_deleted = True  # Mark the agent as deleted
        instance.save()
        return Response(
            {"success": "Agent marked as deleted"}, status=status.HTTP_200_OK
        )


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


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_room_status(request, room_id):
    try:
        room = ChatRoom.objects.get(room_id=room_id)
        room_status = request.data.get("status")
        if room_status:
            room.room_status = room_status
            room.save()
            return Response(
                {"success": True, "status": room.room_status}, status=status.HTTP_200_OK
            )
        return Response(
            {"error": "No status provided"}, status=status.HTTP_400_BAD_REQUEST
        )
    except ChatRoom.DoesNotExist:
        return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
