from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import *


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("agents/", AdminandAgentListView.as_view(), name="list-users"),
    path("agent/<int:pk>/", AdminandAgentUpdateView.as_view(), name="get_agent"),
    path("create-room/", CreateRoomView.as_view(), name="create-room"),
    path("rooms/", ListRoomsView.as_view(), name="list-rooms"),
    path("rooms/<uuid:room_id>/", RoomDetailView.as_view(), name="room-detail"),
    path("rooms/<uuid:room_id>/delete/", DeleteRoomView.as_view(), name="delete_room"),
    path("message/<uuid:room_id>/", CreateMessageView.as_view(), name="create_message"),
    path(
        "messages/<uuid:room_id>/",
        MessageListView.as_view(),
        name="get_messages_by_room",
    ),
]
