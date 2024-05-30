"""
URL configuration for Chat_Project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)
from Chat_app.views import AgentMessageListView, ChatRoomDetailView, JoinChatRoomView, UserMessageListView


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("Chat_app.urls")),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/signin/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/auth/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("chatrooms/<str:room_id>/join/", JoinChatRoomView.as_view(), name="join-chat-room"),
    path("chatrooms/<str:room_id>/", ChatRoomDetailView.as_view(), name="chat-room-detail"),
    path('user-messages/', UserMessageListView.as_view(), name='user-message-list'),
    path('agent-messages/', AgentMessageListView.as_view(), name='agent-message-list'),
]
