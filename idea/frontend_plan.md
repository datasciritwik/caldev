# Frontend Development Plan (React)

## 1. Tech Stack

- **Framework:** React (using Vite for fast local development)
- **Routing:** React Router DOM
- **State Management:** React Context API (with `useReducer` for complex trees, or a lightweight library like Zustand to avoid unnecessary re-renders)
- **Styling:** Vanilla CSS (or CSS Modules) for maximum flexibility, rich styling, and avoiding pre-defined framework bloat.
- **Data Fetching:** React Query (TanStack Query) to handle API state, declarative fetching, request deduplication, and caching structure limits on the heavy tree data.

## 2. Core Application Structure & Views

### A. App Shell

- `Sidebar / Navbar`: Global navigation switching between Projects, Calendar, and People views.
- `ProjectSelector`: Dropdown mapping to active `project_id`.

### B. Projects View

- `ProjectList`: Entry point, showing basic cards for all existing projects including the start/target dates.
- `ProjectFormModal`: A clean dialog to create or edit a project's Objective.

### C. Project Planning View (The Tree Mode)

- **Concept:** Visualize nodes as "Thinking Units".
- `RoadmapTree`: Container component. Implements recursive mapping.
- `NodeItem`:
  - Represents the tree layout.
  - Can recursively render its `children[]`.
  - Visuals: Connectors between parents and children (e.g., via CSS pseudo-elements `::before/::after`).
  - Interactions: Expand/Collapse toggle, Hover actions (Add Child, Delete, Convert to Task).
- `NodeForm`: Allows assigning an Owner (`person_id`), title, and description.
- _Conversion:_ Only "Leaf" nodes (no children) expose the "Convert to Task" button.

### D. Calendar View (The Execution Mode)

- **Concept:** Visualize tasks as "Execution Units" on a timeline.
- `MonthGrid`: Calculates out the weeks/days natively.
- `DayCell`: Cell for a specific date.
  - Lists inline `TaskItem` badges for `tasks` where `due_date == DayCell.date`.
  - Lists `MeetingItem` badges (integration hooks with Google Calendar).
- `OverduePanel`: Explicitly listing tasks where `due_date < today` and `status == Pending`.
- _Note:_ The Calendar must exclusively render `Tasks` and never generic `Nodes`.

### E. People View (Responsibility Mode)

- **Concept:** Overview for accountability.
- `PeopleGrid`: List showing each user's capacity.
- `PersonCard`:
  - Splits responsibilities into two column lists: Assigned Nodes (Thinking) and Assigned Tasks (Execution).
  - Fetched using specific API mappings (e.g., `/api/persons/{id}/responsibilities`).

## 3. Global State & Context Needed

- `AuthContext`: Tracks current logged-in user to stamp `owner_id` or `assigned_to` on actions.
- `ProjectContext`: Holds the active `Project` context so the Roadmap and Calendar know what to fetch.
- `DateContext`: Holds the active Month/Year for the calendar view navigation.

## 4. Key Design & UX Requirements

- **Visual Distinction:** Nodes (conceptual) and Tasks (actionable) must look fundamentally different—even while a node acts as the parent of a task. E.g., Nodes as rounded rectangles with branch lines, Tasks as distinct cards or checkboxes within calendar grids.
- **Premium Aesthetics:** Leverage smooth CSS transitions for expand/collapse, modal popups, and hover states. Utilize a refined color palette avoiding default generic web colors.
- **Drag and Drop (Future Phase):** Eventually supporting dragging nodes into other nodes, or dragging tasks across the calendar grid.

## 5. Phased Implementation Strategy

1. **Phase 1: Foundation:** Setup React + Vite, implement base Router, configure HTTP client, and establish the core CSS color palette and typographical variables.
2. **Phase 2: Skeleton & Routing:** Create the App Shell and placeholder views for Projects, Planning, Calendar, and People.
3. **Phase 3: The Planner (Tree):** Build the critical `RoadmapTree` component using mock recursive JSON data before hooking it up to real API requests.
4. **Phase 4: The Execution (Calendar):** Build `MonthGrid` logic natively, plot `Tasks` onto dates, and test overdue state logic.
5. **Phase 5: People & Final Polish:** Wire up the People View and link actual Auth workflows. Add premium micro-interactions.
