from django.urls import path, include
from .views import AdminandAgentView, AgentDetailUpdateView, AgentSearchAPIView, AdminandAgentListView, MessageViewSet
from rest_framework.routers import DefaultRouter
from .views import NewUserViewSet, RoomViewSet


router = DefaultRouter()
router.register(r'newuser', NewUserViewSet)
router.register(r'rooms', RoomViewSet)
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
    path('add/', AdminandAgentView.as_view(), name='add-user'), # add Prasanth Senthilvel
    path('search/', AgentSearchAPIView.as_view(), name='agent_search'),
    path('agent/edit/<int:pk>/', AgentDetailUpdateView.as_view(), name='agent_edit'),
    path('agents/', AdminandAgentListView.as_view(), name='list-users'),
]