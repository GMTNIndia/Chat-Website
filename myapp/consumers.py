import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import ChatRoom

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        sender = text_data_json.get('sender', 'user')

        if sender == 'agent':
            try:
                chat_room = ChatRoom.objects.get(room_id=self.room_id)
                chat_room.agent = 'Agent Name'
                chat_room.room_status = 'Agent joined'
                chat_room.save()
            except ChatRoom.DoesNotExist:
                pass

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'sender': sender
            }
        )

    async def chat_message(self, event):
        message = event['message']
        sender = event.get('sender', 'user')

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'sender': sender
        }))
