# Backend Development Plan (FastAPI)

## 1. Tech Stack

- **Framework:** FastAPI
- **Database:** MongoDB
- **ODM:** Beanie or Motor (for async MongoDB interactions)
- **Validation & Serialization:** Pydantic (tightly integrated with FastAPI)
- **Authentication:** OAuth2 with JWT tokens (as hinted in the Node Auth structure)

## 2. Database Schema (MongoDB Collections)

_Note: In MongoDB, relationships can be handled via references (ObjectIds). Given the recursive nature of the tree, references are appropriate for Nodes and Tasks._

### Project Collection

- `_id`: ObjectId
- `name`: String
- `objective`: String (1–2 month outcome statement)
- `start_date`: Date
- `target_date`: Date
- _Relationships:_ `team_member_ids` (List of ObjectIds referencing Person)

### Node Collection (Tree Element)

- `_id`: ObjectId
- `project_id`: ObjectId (Reference to Project)
- `parent_node_id`: ObjectId (Reference to Node, nullable for root nodes)
- `title`: String
- `description`: String (optional)
- `owner_id`: ObjectId (Reference to Person, optional)
- `status`: String (Enum: Not Started | In Progress | Done)
- `task_id`: ObjectId (Reference to Task, optional)

### Task Collection (Execution Unit)

- `_id`: ObjectId
- `project_id`: ObjectId (Reference to Project)
- `node_id`: ObjectId (Reference to Node)
- `title`: String
- `description`: String (optional)
- `assigned_to`: ObjectId (Reference to Person)
- `due_date`: Date
- `status`: String (Enum: Pending | Done)
- `priority`: Integer/String (optional)

### Person Collection

- `_id`: ObjectId
- `name`: String
- `role`: String

## 3. API Endpoints Structure

### Projects (`/api/projects`)

- `GET /` - List all projects
- `POST /` - Create a new project (name, objective, dates)
- `GET /{id}` - Get project details
- `PUT /{id}` - Update project config

### Nodes/Roadmap (`/api/projects/{proj_id}/nodes`)

- `GET /` - Get full tree/roadmap for a project. (Returns a nested JSON structure)
- `POST /` - Create a node (under project root or an existing parent_node_id)
- `PUT /{id}` - Update node details (status, owner, etc.)
- `DELETE /{id}` - Delete node (and its children recursively)

### Tasks (`/api/tasks`)

- `POST /` - Convert a leaf node to a task (requires node_id). Auto-inherits title/description.
- `GET /` - List tasks (filters: by project, by date range, by assignee)
- `PUT /{id}` - Update task status/due date
- `GET /calendar` - Special endpoint optimized to serve tasks grouped by due date for the calendar view.

### Persons (`/api/persons`)

- `GET /` - List all system users/persons
- `GET /{id}/responsibilities` - Fetch specific person's assigned tasks and nodes for the People View.

## 4. Core Business Logic & Constraints

- **Recursive Tree Logic:** Safely fetch and update nested nodes. Implement recursive status calculations if node status auto-calculation is enabled (e.g., if all children are Done, parent becomes Done).
- **Node to Task Rule:** Ensure only childless "leaf" nodes can be converted to Tasks. Once converted, bind the `task_id` strictly.
- **Calendar Consistency:** Ensure calendar extraction only surfaces `Task` items, completely ignoring the generic `Node` hierarchy.

## 5. Implementation Phases

1. **Phase 1: Setup & Database:** Initialize FastAPI app, configure MongoDB connection (Motor/Beanie), and define Pydantic/Beanie document models.
2. **Phase 2: Core CRUD:** Implement endpoints for Persons, Projects, and basic Tasks.
3. **Phase 3: The Thinking Tree:** Implement Node endpoints and serialization logic to return recursive trees using Pydantic.
4. **Phase 4: Linking Execution:** Implement Node-to-Task conversion logic.
5. **Phase 5: Refinement:** Add JWT Auth, tie endpoints to auth, write unit test suites for tree logic.
