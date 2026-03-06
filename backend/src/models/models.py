from enum import Enum
from typing import List, Optional
from datetime import datetime
from beanie import Document, PydanticObjectId
from pydantic import Field

class NodeStatus(str, Enum):
    NOT_STARTED = "Not Started"
    IN_PROGRESS = "In Progress"
    DONE = "Done"

class TaskStatus(str, Enum):
    PENDING = "Pending"
    DONE = "Done"

class User(Document):
    firebase_uid: str = Field(json_schema_extra={"unique": True, "index": True})
    email: str = Field(json_schema_extra={"unique": True, "index": True})
    username: str = Field(json_schema_extra={"unique": True, "index": True})
    avatar_url: Optional[str] = None
    role: Optional[str] = None

    class Settings:
        name = "users"

class Project(Document):
    name: str
    objective: str
    start_date: datetime
    target_date: datetime
    owner_ids: List[PydanticObjectId] = []
    team_member_ids: List[PydanticObjectId] = []

    class Settings:
        name = "projects"

class Task(Document):
    project_id: PydanticObjectId
    node_id: PydanticObjectId
    title: str
    description: Optional[str] = None
    assigned_to: PydanticObjectId  # References User
    due_date: datetime
    status: TaskStatus = TaskStatus.PENDING
    priority: Optional[int] = None

    class Settings:
        name = "tasks"

class Node(Document):
    project_id: PydanticObjectId
    parent_node_id: Optional[PydanticObjectId] = None
    title: str
    description: Optional[str] = ""
    owner_id: Optional[PydanticObjectId] = None  # References User
    status: Optional[NodeStatus] = NodeStatus.NOT_STARTED
    checklist: Optional[List[dict]] = []  # List of {id, text, completed}
    task_id: Optional[PydanticObjectId] = None

    class Settings:
        name = "nodes"

