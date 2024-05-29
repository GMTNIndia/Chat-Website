import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from rest_framework import viewsets
from .serializers import AgentEditSerializer, MessageSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from rest_framework.permissions import AllowAny, IsAuthenticated , IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from django.shortcuts import render, redirect
from .models import Room, Message
from Chat_app_2.models import User
from django.contrib.auth.decorators import login_required, user_passes_test
from rest_framework import generics, permissions
from .models import AdminandAgent
from .serializers import AdminandAgentSerializer



# Prasanth Senthilvel changes start
class AdminandAgentView(generics.CreateAPIView):
    queryset = AdminandAgent.objects.all()
    serializer_class = AdminandAgentSerializer
# Prasanth Senthilvel changes end
class AdminandAgentListView(generics.ListAPIView):
    queryset = AdminandAgent.objects.all()
    serializer_class = AdminandAgentSerializer

class MessageListCreate(generics.ListCreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]


class MessageDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]


@require_POST
def create_room(request, uuid):
    name = request.POST.get("name", "")
    url = request.POST.get("url", "")
    Room.objects.create(uuid=uuid, client=name, url=url)
    return JsonResponse({"message": "room created"})


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


# @login_required
# def admin(request):
#     rooms = Room.objects.all()
#     users = User.objects.filter(is_staff=True)

#     return render(request, 'chat/admin.html', {
#         'rooms': rooms,
#         'users': users
#     })


# @login_required
# def room (request, uuid):
#     room = Room.objects.get(uuid=uuid)
#     if room.status == Room. WAITING:
#         room.status = Room.ACTIVE
#         room.agent = request.user
#         room.save()
#     return render(request, 'chat/room.html', {
#     'room': room
#     })


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


@login_required
def room(request, uuid):
    room = Room.objects.get(uuid=uuid)

    # Check if the current user belongs to the 'Agent' group
    is_agent = request.user.groups.filter(name="agent").exists()

    # Check if the 'Chat Admin' button should be disabled
    chat_admin_disabled = False
    if is_agent:
        chat_admin_disabled = True

    # Check if the room status is waiting and update it to active if necessary
    if room.status == Room.WAITING:
        room.status = Room.ACTIVE
        room.agent = request.user
        room.save()

    # Render the room.html template with the appropriate context
    return render(
        request,
        "chat/room.html",
        {
            "room": room,
            "is_agent": is_agent,
            "chat_admin_disabled": chat_admin_disabled,
        },
    )


class RoomView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        # Check if the request contains the required data
        if "client" not in request.data or "uuid" not in request.data:
            return Response(
                {"error": "Client and UUID are required fields"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Extract data from the request
        client = request.data["client"]
        uuid = request.data["uuid"]

        # Example of additional validation
        if not isinstance(client, str) or not isinstance(uuid, str):
            return Response(
                {"error": "Client and UUID must be strings"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Perform any additional logic here (e.g., save data to database, process data, etc.)

        # Return a success response
        return Response(
            {"message": "Data received successfully"}, status=status.HTTP_200_OK
        )
class AgentSearchAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        query = request.GET.get('q', '')
        if query:
            agents = AdminandAgent.search(query)
            serializer = AdminandAgentSerializer(agents, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Query parameter 'q' is required."}, status=status.HTTP_400_BAD_REQUEST)

class AgentDetailUpdateView(generics.RetrieveUpdateAPIView):
    queryset = AdminandAgent.objects.all()
    serializer_class = AgentEditSerializer
    permission_classes = [IsAdminUser]
