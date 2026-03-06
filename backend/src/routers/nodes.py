from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from beanie import PydanticObjectId
from pydantic import BaseModel
from src.models.models import Node, Task, NodeStatus
from src.auth.security import get_current_user_id

router = APIRouter(prefix="/api/projects/{project_id}/nodes", tags=["Nodes"])

class NodeCreate(BaseModel):
    parent_node_id: Optional[PydanticObjectId] = None
    title: str
    description: Optional[str] = ""
    owner_id: Optional[PydanticObjectId] = None
    status: Optional[NodeStatus] = NodeStatus.NOT_STARTED
    checklist: Optional[List[dict]] = []

@router.get("")
async def get_project_nodes(project_id: PydanticObjectId, user_id: str = Depends(get_current_user_id)):
    nodes = await Node.find(Node.project_id == project_id).to_list()
    
    node_dict = {str(n.id): n.model_dump() for n in nodes}
    for n in node_dict.values():
        n["children"] = []
        n["id"] = str(n["_id"]) if "_id" in n else str(n["id"]) # Handle ObjectId serialization
        if n.get("parent_node_id"):
            n["parent_node_id"] = str(n["parent_node_id"])
        
    tree = []
    for n in nodes:
        n_id = str(n.id)
        parent_id = str(n.parent_node_id) if n.parent_node_id else None
        
        if parent_id and parent_id in node_dict:
            node_dict[parent_id]["children"].append(node_dict[n_id])
        else:
            tree.append(node_dict[n_id])
            
    return tree

@router.post("", response_model=Node)
async def create_node(project_id: PydanticObjectId, node: NodeCreate, user_id: str = Depends(get_current_user_id)):
    new_node = Node(project_id=project_id, **node.model_dump())
    await new_node.insert()
    return new_node

class NodeUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    owner_id: Optional[PydanticObjectId] = None
    status: Optional[NodeStatus] = None
    checklist: Optional[List[dict]] = None

@router.put("/{id}", response_model=Node)
async def update_node(project_id: PydanticObjectId, id: PydanticObjectId, update_data: NodeUpdate, user_id: str = Depends(get_current_user_id)):
    node = await Node.get(id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    await node.set(update_data.model_dump(exclude_unset=True))
    return node

@router.delete("/{id}")
async def delete_node(project_id: PydanticObjectId, id: PydanticObjectId, user_id: str = Depends(get_current_user_id)):
    node = await Node.get(id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
        
    async def delete_recursive(node_id: PydanticObjectId):
        children = await Node.find(Node.parent_node_id == node_id).to_list()
        for child in children:
            await delete_recursive(child.id)
            await child.delete()
            
    await delete_recursive(id)
    await node.delete()
    return {"message": "Node and all related children deleted"}
