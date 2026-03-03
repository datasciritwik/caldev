from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException
from beanie import PydanticObjectId
from pydantic import BaseModel
from src.models.models import Task, Node, TaskStatus

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

class TaskCreateReq(BaseModel):
    node_id: PydanticObjectId
    assigned_to: PydanticObjectId
    due_date: datetime
    priority: Optional[int] = None

@router.post("/", response_model=Task)
async def create_task_from_node(req: TaskCreateReq):
    node = await Node.get(req.node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
        
    children = await Node.find(Node.parent_node_id == node.id).to_list()
    if len(children) > 0:
        raise HTTPException(status_code=400, detail="Cannot convert node with children to task")
        
    if node.task_id is not None:
        raise HTTPException(status_code=400, detail="Node is already converted to a task")
        
    new_task = Task(
        project_id=node.project_id,
        node_id=node.id,
        title=node.title,
        description=node.description,
        assigned_to=req.assigned_to,
        due_date=req.due_date,
        priority=req.priority
    )
    await new_task.insert()
    
    node.task_id = new_task.id
    await node.save()
    
    return new_task

@router.get("/calendar")
async def get_calendar_tasks(project_id: Optional[PydanticObjectId] = None):
    query = Task.find(Task.project_id == project_id) if project_id else Task.find_all()
    tasks = await query.to_list()
    
    calendar = {}
    for task in tasks:
        date_str = task.due_date.strftime("%Y-%m-%d")
        if date_str not in calendar:
            calendar[date_str] = []
        calendar[date_str].append(task.model_dump())
        
    return calendar

@router.get("/", response_model=List[Task])
async def list_tasks(project_id: Optional[PydanticObjectId] = None, assigned_to: Optional[PydanticObjectId] = None):
    query = {}
    if project_id:
        query["project_id"] = project_id
    if assigned_to:
        query["assigned_to"] = assigned_to
        
    return await Task.find(query).to_list()

class TaskUpdate(BaseModel):
    status: Optional[TaskStatus] = None
    due_date: Optional[datetime] = None

@router.put("/{id}", response_model=Task)
async def update_task(id: PydanticObjectId, update_data: TaskUpdate):
    task = await Task.get(id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await task.set(update_data.model_dump(exclude_unset=True))
    return task
