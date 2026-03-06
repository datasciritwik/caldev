from typing import List
from fastapi import APIRouter, HTTPException, Depends
from beanie import PydanticObjectId
from src.auth.security import get_current_user_id
from src.models.models import User, Task, Node

router = APIRouter(prefix="/api/users", tags=["Users"])

@router.get("/me", response_model=User)
async def get_me(user_id: str = Depends(get_current_user_id)):
    user = await User.get(PydanticObjectId(user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/search", response_model=List[User])
async def search_users(q: str, user_id: str = Depends(get_current_user_id)):
    # Case insensitive search on username or email
    users = await User.find({
        "$or": [
            {"username": {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}}
        ]
    }).to_list()

    return users

@router.get("/{id}/responsibilities")
async def get_user_responsibilities(id: PydanticObjectId, user_id: str = Depends(get_current_user_id)):
    user = await User.get(id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    assigned_tasks = await Task.find(Task.assigned_to == id).to_list()
    assigned_nodes = await Node.find(Node.owner_id == id).to_list()
    
    return {
        "user": user,
        "assigned_nodes": assigned_nodes,
        "assigned_tasks": assigned_tasks
    }
