# Frontend Design & Features (Non-Traditional UI)

## 1. Core Concept & Aesthetic

- **Clean Minimalist Interface:** Avoid standard row-based tables, navbars, and clunky sidebars. The workspace should feel clean, simple, and highly focused on the content rather than chrome.
- **Simplicity First:** Do not use complex 3D spaces, infinite whiteboards, or heavy node-graph libraries (like React Flow), as these complicate responsive design and mobile views. The UI must be lightweight, fast, and easily fit into standard web grid layouts.
- **Fluid Layout:** Moving between "Thinking" (Tree) and "Execution" (Time) should be intuitive and seamless, utilizing sliding panels or elegant transitions rather than harsh page reloads.

## 2. Feature Breakdown

### A. The "Thinking" Layer (Project Planning / Structure)

- **Central Objective Hub:** A clean, prominent display of the project's 1-2 month outcome.
- **Nested List / Accordion Tree:** Instead of a complex literal mind-map canvas, use an elegant, deeply nested, accordion or indented list style to show hierarchy. This ensures the tree stays readable and usable on mobile devices.
- **Inline Branching:** Users can intuitively add a child node directly inline under any existing node without opening heavy modals, keeping flow uninterrupted.
- **Leaf Node Morphing:** A simple toggle or inline action where the lowest-level generic node ("leaf") is officially "converted" to a Task.

### B. The "Time" Dimension (Calendar / Execution)

- **Task-Only Timeline / List:** A view that strips away all structural nodes and _only_ plots the assigned Tasks chronologically. This can be a simple date-grouped list or a clean grid.
- **Seamless Pivot:** Easily switching context from the structural tree list into a chronological execution list.
- **Overdue Visuals:** High-contrast warnings or distinct text colors for tasks that missed their due dates.
- **Meeting Integration:** Simple text or badge markers indicating external temporal anchors (like Google Calendar imports) existing alongside tasks.

### C. The "Accountability" Lens (People / Responsibility)

- **Person Filtering:** Selecting a user instantly visually filters the view to highlight exactly what that specific person owns, fading out the rest.
- **Split Responsibility View:** A clean layout splitting their roles:
  1. **Assigned Nodes** (What they are _Thinking_ about / Managing)
  2. **Assigned Tasks** (What they must _Execute_ and when)

### 3. Constraints & What to Exclude

- _No_ Kanban boards or swimlanes.
- _No_ traditional top navbars that distract from the main canvas.
- _No_ chat panels or bloated document storage interfaces.
- Strictly keep it to: Goal → Breakdown → Tasks → Dates → Accountability.
