import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from motor.motor_asyncio import AsyncIOMotorClient

from src.config import settings

@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

# Connect to the database specified in settings
from src.main import app
from src.database import init_db


@pytest.fixture(scope="session", autouse=True)
async def setup_test_db():
    # Session-wide initialization
    from src.database import init_db
    from src.config import settings
    from motor.motor_asyncio import AsyncIOMotorClient
    from urllib.parse import urlparse
    
    # Extract DB name for dropping
    parsed_uri = urlparse(settings.mongodb_uri)
    db_name = parsed_uri.path.lstrip('/') or "caldev"
    
    client = AsyncIOMotorClient(settings.mongodb_uri)
    await client.drop_database(db_name)
    await init_db()
    yield

    # We could drop here too, but leaving it for inspection if needed.
    # await client.drop_database("caldev_test")


@pytest.fixture(scope="session")
async def async_client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client

