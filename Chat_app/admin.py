from django.contrib import admin
from .models import AdminandAgent, ChatRoom, Message, Room, NewUser

@admin.register(AdminandAgent)
class AdminandAgentAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role')
    search_fields = ('first_name', 'last_name', 'email')
    list_filter = ('role',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'content', 'timestamp')
    search_fields = ('sender', 'receiver', 'content')
    list_filter = ('sender', 'receiver', 'timestamp')

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'room_id', 'user', 'status', 'agent', 'created_at')
    search_fields = ('room_id', 'user', 'status', 'agent__name')
    list_filter = ('status',)

@admin.register(NewUser)
class NewUserAdmin(admin.ModelAdmin):
    list_display = ('id', 'user',)
    search_fields = ('user',)


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('user', 'started', 'status', 'page', 'agent')
    list_filter = ('status', 'agent')
    search_fields = ('id', 'user', 'agent__username')
