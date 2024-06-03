from django.contrib import admin
from .models import AdminandAgent, ChatRoom, Message

# Register your models here.

@admin.register(AdminandAgent)
class AdminandAgentAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_active', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    list_filter = ('role', 'is_active', 'is_staff')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name')}),
        ('Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
    )
    ordering = ('email',)
    filter_horizontal = ()

@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('room_id', 'user_name', 'room_status', 'agent', 'started', 'page_url')
    search_fields = ['user_name', 'room_status', 'agent']  # Changed to list
    list_filter = ['room_status']  # Changed to list
    readonly_fields = ('room_id', 'page_url')
    fieldsets = (
        (None, {'fields': ('room_id', 'user_name', 'room_status', 'agent', 'started')}),
        ('URL Info', {'fields': ('page_url',)}),
    )

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'room_id', 'message', 'sender', 'created_at')
    search_fields = ['message', 'sender']  # Changed to list
    list_filter = ['created_at']  # Changed to list
