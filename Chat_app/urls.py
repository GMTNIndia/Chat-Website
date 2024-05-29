from django.urls import path, include
from .views import AdminandAgentView, AgentDetailUpdateView, AgentSearchAPIView, create_room, AdminandAgentListView
# from rest_framework.routers import DefaultRouter
from . import views
# from .views import MessageViewSet

# router = DefaultRouter()
# router.register(r'messages', MessageViewSet)

urlpatterns = [
    # path('', include(router.urls)),
    path('api/create-room/<str:uuid>/', views.create_room, name='create-room'),
    path('chat-admin/', views. admin, name='admin'),
    path('chat-admin/<str:uuid>/', views.room, name='room'),
    path('add/', AdminandAgentView.as_view(), name='add-user'), # add Prasanth Senthilvel
    path('search/', AgentSearchAPIView.as_view(), name='agent_search'),
    path('agent/<int:pk>/edit/', AgentDetailUpdateView.as_view(), name='agent_edit'),
    path('agents/', AdminandAgentListView.as_view(), name='list-users'),
]