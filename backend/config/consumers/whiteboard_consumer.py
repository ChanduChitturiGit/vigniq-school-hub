import json
import redis
import sys
import asyncio
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async

MAX_CHUNK_SIZE_BYTES = 5 * 1024 * 1024
r = redis.StrictRedis(host='localhost', port=6379, db=0)
logger = logging.getLogger(__name__)

class WhiteboardConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        from core.common_modules.jwt_utils import get_user_from_jwt
        from core.common_modules.common_functions import CommonFunctions
        # Extract token
        self.session_id = None
        self.school_name = None
        query_params = dict(qc.split("=") for qc in self.scope["query_string"].decode().split("&") if "=" in qc)
        token = query_params.get("token")
        school_id = query_params.get("school_id")
        self.flush_task = asyncio.create_task(self.periodic_flush())

        self.user = await sync_to_async(get_user_from_jwt)(token)
        if not self.user:
            await self.close(code=4001)
            return
        logger.info(f"User {self.user.id} connected to whiteboard")
        self.session_id = self.scope['url_route']['kwargs']['session_id']
        self.school_name = await sync_to_async(CommonFunctions.get_school_db_name)(school_id)
        if not self.school_name:
            await self.close(code=4002)
            return

        await self.accept()
        await self.send(text_data=json.dumps({
            "type": "whiteboard_update",
            "data": {"session_id": self.session_id, "message": "Connected to whiteboard"}
        }))

    async def receive(self, text_data):
        data = json.loads(text_data)
        key = f"whiteboard:{self.session_id}"

        # Push to Redis
        r.set(key, json.dumps(data))
    
    async def periodic_flush(self):
        while True:
            await asyncio.sleep(10)
            logger.info(f"Periodic flush for session {self.session_id} started")
            await self.flush_to_db()

    async def disconnect(self, close_code):
        logger.info(f"User {self.user.id} disconnected from whiteboard with code {close_code}")
        self.flush_task.cancel()
        await self.flush_to_db()


    @sync_to_async
    def flush_to_db(self):
        from syllabus.models import WhiteboardSession, WhiteboardDataChunk
        if not self.session_id:
            return
        key = f"whiteboard:{self.session_id}"
        if not r.exists(key):
            return

        strokes = json.loads(r.get(key))
        r.delete(key)

        # Get or create session
        session, _ = WhiteboardSession.objects.using(self.school_name).get_or_create(session_id=self.session_id)

        # Get latest chunk
        latest_chunk = WhiteboardDataChunk.objects.using(self.school_name).filter(session=session).order_by("-chunk_index").first()

        if not latest_chunk:
            # Create first chunk
            chunk_index = 1
            WhiteboardDataChunk.objects.using(self.school_name).create(
                session=session, chunk_index=chunk_index, data=strokes
            )
            return

        # # Check current size
        # current_size = sys.getsizeof(json.dumps(latest_chunk.data))

        # if current_size + sys.getsizeof(json.dumps(strokes)) > MAX_CHUNK_SIZE_BYTES:
        #     # Create new chunk
        #     new_index = latest_chunk.chunk_index + 1
        #     WhiteboardDataChunk.objects.using(self.school_name).create(
        #         session=session, chunk_index=new_index, data=strokes
        #     )
        # else:
        #     # Append to current chunk
        latest_chunk.data = strokes
        latest_chunk.save(using=self.school_name)
