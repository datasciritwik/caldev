# SYSTEM: Project-Centric Planning + Execution Engine

---

## 1. CORE PHILOSOPHY

Planning is structural.
Execution is time-based.
Calendar is a projection of tasks.
Tree defines work. Time schedules it.

Flow:

Objective
   ↓
Roadmap (Tree)
   ↓
Tasks
   ↓
Calendar
   ↓
People Responsibility View

---

## 2. CORE ENTITIES

### 2.1 Project

Project
├── id
├── name
├── objective (1–2 month outcome statement)
├── start_date
├── target_date
├── team_members[]
└── roadmap_root_node

---

### 2.2 Node (Tree Element)

Node
├── id
├── project_id
├── parent_node_id (nullable)
├── title
├── description (optional)
├── owner_id (optional)
├── status (Not Started | In Progress | Done)
├── children[]
└── task_id (nullable)

Nodes are thinking units.
Leaf nodes may convert into Tasks.

---

### 2.3 Task (Execution Unit)

Task
├── id
├── project_id
├── node_id
├── title
├── description (optional)
├── assigned_to
├── due_date
├── status (Pending | Done)
└── priority (optional)

Tasks are time-bound execution units.
Tasks appear in Calendar.

---

### 2.4 Person

Person
├── id
├── name
├── role
└── assigned_tasks[]

---

## 3. APPLICATION STRUCTURE

APP
├── Projects View
├── Project Planning View (Tree)
├── Calendar View
└── People View

---

## 4. PROJECT PLANNING VIEW (Tree Mode)

Project
├── Objective
├── Timeline
├── Team Members
└── ROADMAP
     ├── Node (Frontend)
     │     ├── Node (Auth)
     │     │     └── Node (OAuth Flow)
     │     │            └── Task
     │     └── Node (Dashboard)
     │
     ├── Node (Backend)
     │     ├── Node (API Layer)
     │     └── Node (Database Schema)
     │
     └── Node (AI)
           └── Node (Model Inference)

Rules:
- Nodes can be nested infinitely.
- Only leaf nodes should convert into Tasks.
- Node status auto-calculates from child completion (optional).

---

## 5. CALENDAR VIEW (Execution Mode)

Calendar
├── Month Grid
│     ├── Date
│     │     ├── Tasks Due
│     │     └── Meetings (from Google Calendar)
│
└── Overdue Section

Calendar shows:
- Tasks with due dates
- Meeting indicators
- Overdue badge

Calendar does NOT show roadmap tree.

---

## 6. PEOPLE VIEW (Responsibility Mode)

People
├── Person A
│     ├── Assigned Nodes
│     └── Assigned Tasks
│
├── Person B
│     ├── Assigned Nodes
│     └── Assigned Tasks
│
└── Responsibility Snapshot

Purpose:
Manager overview of ownership.

---

## 7. SYSTEM FLOW (END-TO-END)

1. Create Project
2. Define Objective
3. Build Roadmap Tree
4. Break into Leaf Nodes
5. Convert Leaf Nodes into Tasks
6. Assign People
7. Set Due Dates
8. Calendar auto-populates
9. Track completion

---

## 8. WHAT IS NOT INCLUDED (Level Zero)

- No Kanban board
- No complex permissions
- No AI automation
- No document storage
- No chat
- No notifications engine
- No recurring task engine

---

## 9. VISUAL MENTAL MODEL

App
 └── Project
      └── Roadmap Tree
            └── Leaf Node
                  └── Task
                        └── Due Date
                              └── Calendar

Planning → Structure → Execution → Time

---

## 10. DESIGN PRINCIPLES

- Maximum 4 core entities
- Tree for thinking
- Tasks for execution
- Calendar for visibility
- People for accountability
- No duplicate systems
- No feature clutter