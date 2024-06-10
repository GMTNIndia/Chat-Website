from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import *


urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path('logout/', LogoutView.as_view(), name='logout'),
    path("agents/", AdminandAgentListView.as_view(), name="list-users"),
    path("agent/<int:pk>/", AdminandAgentUpdateView.as_view(), name="get_agent"),
    path('agent/<str:email>/', AdminandAgentStatusView.as_view(), name='agent-status'),
    path("create-room/", CreateRoomView.as_view(), name="create-room"),
    path("rooms/", ListRoomsView.as_view(), name="list-rooms"),
    path("rooms/<uuid:room_id>/", RoomDetailView.as_view(), name="room-detail"),
    path("rooms/<uuid:room_id>/delete/", DeleteRoomView.as_view(), name="delete_room"),
    path('rooms/<uuid:room_id>/status/', update_room_status, name='update_room_status'),
    path("message/<uuid:room_id>/", CreateMessageView.as_view(), name="create_message"),
    path('agents/delete/<int:id>/', SoftDeleteAgentView.as_view(), name='soft-delete-agent'),

    path(
        "messages/<uuid:room_id>/",
        MessageListView.as_view(),
        name="get_messages_by_room",
    ),
]
