import pytest
from unittest.mock import patch
from datetime import datetime
from httpx import AsyncClient
from src.models.models import User

@pytest.fixture(scope="session")
async def auth_headers(async_client: AsyncClient):
    # Mock Firebase verification to return a dummy user info
    from src.auth.security import create_access_token
    from src.models.models import User
    
    # 1. Ensure a test user exists
    user = await User.find_one(User.firebase_uid == "test_uid")
    if not user:
        user = User(
            firebase_uid="test_uid",
            email="test@example.com",
            username="testuser"
        )
        await user.insert()
    
    # 2. Create JWT token
    token = create_access_token(data={"sub": str(user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.mark.asyncio
async def test_auth_token_exchange(async_client: AsyncClient):
    with patch("src.auth.security.verify_firebase_token") as mock_verify:
        mock_verify.return_value = {
            "uid": "new_firebase_uid",
            "email": "new@example.com",
            "name": "New User"
        }
        
        response = await async_client.post("/api/auth/token", json={"id_token": "fake_firebase_token"})
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "new@example.com"

@pytest.mark.asyncio
async def test_create_and_fetch_project(async_client: AsyncClient, auth_headers: dict):
    response = await async_client.post("/api/projects/", json={
        "name": "Test Project",
        "objective": "Build a test app",
        "start_date": "2026-03-01T00:00:00",
        "target_date": "2026-04-01T00:00:00",
        "team_member_ids": []
    }, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Project"
    
    project_id = data["_id"]
    
    # Update project
    update_resp = await async_client.put(f"/api/projects/{project_id}", json={
        "objective": "New Objective"
    }, headers=auth_headers)
    assert update_resp.status_code == 200
    assert update_resp.json()["objective"] == "New Objective"

    # Fetch it back
    get_resp = await async_client.get(f"/api/projects/{project_id}", headers=auth_headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["name"] == "Test Project"

@pytest.mark.asyncio
async def test_user_search(async_client: AsyncClient, auth_headers: dict):
    # Ensure some users exist
    uid = "search_test_uid"
    user_data = {"firebase_uid": uid, "email": "search_test@example.com", "username": "SearchTestUser"}
    user = await User.find_one(User.firebase_uid == uid)
    if not user:
        user = User(**user_data)
        await user.insert()
    
    # Search by username (case insensitive)
    response = await async_client.get("/api/users/search?q=searchtest", headers=auth_headers)
    assert response.status_code == 200
    results = response.json()
    assert len(results) >= 1
    assert any("SearchTestUser" in u["username"] for u in results)

    # Search by email
    response = await async_client.get("/api/users/search?q=search_test@example.com", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1


@pytest.mark.asyncio
async def test_recursive_node_deletion(async_client: AsyncClient, auth_headers: dict):
    # 1. Setup project
    proj_info = {
        "name": "Deletion Proj",
        "objective": "Test",
        "start_date": "2026-03-01T00:00:00Z",
        "target_date": "2026-03-30T00:00:00Z"
    }
    proj_resp = await async_client.post("/api/projects/", json=proj_info, headers=auth_headers)
    project_id = proj_resp.json()["_id"]

    # 2. Create Parent
    parent_resp = await async_client.post(f"/api/projects/{project_id}/nodes/", json={"title": "Parent"}, headers=auth_headers)
    parent_id = parent_resp.json()["_id"]

    # 3. Create Child
    child_resp = await async_client.post(f"/api/projects/{project_id}/nodes/", json={
        "parent_node_id": parent_id,
        "title": "Child"
    }, headers=auth_headers)

    # 4. Delete Parent
    del_resp = await async_client.delete(f"/api/projects/{project_id}/nodes/{parent_id}", headers=auth_headers)
    assert del_resp.status_code == 200

    # 5. Verify both are gone from the tree
    tree_resp = await async_client.get(f"/api/projects/{project_id}/nodes/", headers=auth_headers)
    assert len(tree_resp.json()) == 0

@pytest.mark.asyncio
async def test_core_planning_to_execution_flow(async_client: AsyncClient, auth_headers: dict):
    # Get current user info from token
    me_resp = await async_client.get("/api/users/me", headers=auth_headers)
    user_id = me_resp.json()["_id"]

    # 1. Create a Project
    proj_resp = await async_client.post("/api/projects/", json={
        "name": "Flow Proj",
        "objective": "Test",
        "start_date": "2026-03-01T00:00:00Z",
        "target_date": "2026-03-30T00:00:00Z",
        "owner_ids": [user_id]
    }, headers=auth_headers)
    project_id = proj_resp.json()["_id"]

    # 2. Create a Root Node
    root_node_resp = await async_client.post(f"/api/projects/{project_id}/nodes/", json={
        "title": "Backend",
        "description": "All backend work",
        "owner_id": user_id
    }, headers=auth_headers)
    assert root_node_resp.status_code == 200
    root_node_id = root_node_resp.json()["_id"]

    # 3. Create a Leaf Node (child)
    leaf_node_resp = await async_client.post(f"/api/projects/{project_id}/nodes/", json={
        "parent_node_id": root_node_id,
        "title": "Setup DB",
        "description": "Configure MongoDB",
        "owner_id": user_id
    }, headers=auth_headers)
    assert leaf_node_resp.status_code == 200
    leaf_node_id = leaf_node_resp.json()["_id"]

    # 4. Fetch Full Tree
    tree_resp = await async_client.get(f"/api/projects/{project_id}/nodes/", headers=auth_headers)
    tree = tree_resp.json()
    assert len(tree) == 1
    assert tree[0]["title"] == "Backend"
    assert len(tree[0]["children"]) == 1
    assert tree[0]["children"][0]["title"] == "Setup DB"

    # 5. Convert Leaf Node to Task
    task_resp = await async_client.post("/api/tasks/", json={
        "node_id": leaf_node_id,
        "assigned_to": user_id,
        "due_date": "2026-03-10T00:00:00Z"
    }, headers=auth_headers)
    assert task_resp.status_code == 200
    task_data = task_resp.json()
    assert task_data["title"] == "Setup DB"
    assert task_data["node_id"] == leaf_node_id

    # 6. Check Calendar Endpoint
    cal_resp = await async_client.get("/api/tasks/calendar", headers=auth_headers)
    calendar = cal_resp.json()
    assert "2026-03-10" in calendar
    tasks_on_day = calendar["2026-03-10"]
    assert len(tasks_on_day) == 1
    assert tasks_on_day[0]["title"] == "Setup DB"

    # 7. Check People Responsibility Endpoint
    resp_resp = await async_client.get(f"/api/users/{user_id}/responsibilities", headers=auth_headers)
    responsibilities = resp_resp.json()
    assert len(responsibilities["assigned_nodes"]) == 2 
    assert len(responsibilities["assigned_tasks"]) == 1


