from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from urllib.parse import urlparse
from src.config import settings
from src.models.models import Project, Node, Task, User

async def init_db():
    client = AsyncIOMotorClient(settings.mongodb_uri)
    
    # Safely parse the database name from the complex mongo uri
    parsed_uri = urlparse(settings.mongodb_uri)
    db_name = parsed_uri.path.lstrip('/')
    if not db_name:
        db_name = "caldev" # Fallback if no db specified in URI
        
    db = client[db_name]
    await init_beanie(
        database=db,
        document_models=[Project, Node, Task, User]
    )
