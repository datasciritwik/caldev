from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from beanie import PydanticObjectId
from pydantic import BaseModel
from src.models.models import Project
from src.auth.security import get_current_user_id

router = APIRouter(prefix="/api/projects", tags=["Projects"])

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    objective: Optional[str] = None
    start_date: Optional[datetime] = None
    target_date: Optional[datetime] = None
    team_member_ids: Optional[List[PydanticObjectId]] = None

@router.get("/", response_model=List[Project])
async def list_projects(user_id: str = Depends(get_current_user_id)):
    return await Project.find_all().to_list()

@router.post("/", response_model=Project)
async def create_project(project: Project, user_id: str = Depends(get_current_user_id)):
    await project.insert()
    return project

@router.get("/{id}", response_model=Project)
async def get_project(id: PydanticObjectId, user_id: str = Depends(get_current_user_id)):
    project = await Project.get(id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

@router.put("/{id}", response_model=Project)
async def update_project(id: PydanticObjectId, update_data: ProjectUpdate, user_id: str = Depends(get_current_user_id)):
    project = await Project.get(id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    await project.set(update_data.model_dump(exclude_unset=True))
    return project
