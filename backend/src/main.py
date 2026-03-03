from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.database import init_db
from src.routers import projects, nodes, tasks, auth, users

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize Database and Beanie ODM on startup
    await init_db()
    yield
    # Cleanup on shutdown

app = FastAPI(title="CalDev Backend", lifespan=lifespan)

# Setup CORS for local frontend testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(projects.router)
app.include_router(nodes.router)
app.include_router(tasks.router)

@app.get("/")
async def root():
    return {"message": "CalDev API Running"}
