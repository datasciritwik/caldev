// src/utils/dummyData.js

export const MOCK_USERS = [
    { id: 'u1', username: 'alice', email: 'alice@example.com', role: 'admin' },
    { id: 'u2', username: 'bob', email: 'bob@example.com', role: 'member' },
    { id: 'u3', username: 'charlie', email: 'charlie@example.com', role: 'member' },
];

export const MOCK_PROJECTS = [
    {
        id: 'p1',
        name: 'Launch Landing Page',
        objective: 'Redesign and deploy the main marketing site before Q3.',
        start_date: '2026-06-01',
        target_date: '2026-07-15',
        owner_ids: ['u1'],
    },
    {
        id: 'p2',
        name: 'Mobile App V2 MVP',
        objective: 'Ship core functionality for iOS including offline mode.',
        start_date: '2026-06-15',
        target_date: '2026-09-01',
        owner_ids: ['u1', 'u2'],
    }
];

export const MOCK_NODES = [
    // P1 Nodes
    { id: 'n1', project_id: 'p1', parent_node_id: null, title: 'Design System', status: 'Done', owner_id: 'u1' },
    { id: 'n2', project_id: 'p1', parent_node_id: 'n1', title: 'Color Palette', status: 'Done', owner_id: 'u1' },
    { id: 'n3', project_id: 'p1', parent_node_id: 'n1', title: 'Typography', status: 'In Progress', owner_id: 'u2' },
    { id: 'n4', project_id: 'p1', parent_node_id: null, title: 'Frontend Implementation', status: 'In Progress', owner_id: 'u2' },
    { id: 'n5', project_id: 'p1', parent_node_id: 'n4', title: 'Hero Section', status: 'Done', owner_id: 'u2' },
    { id: 'n6', project_id: 'p1', parent_node_id: 'n4', title: 'Pricing Table', status: 'Not Started', owner_id: 'u3' },

    // P2 Nodes
    { id: 'n7', project_id: 'p2', parent_node_id: null, title: 'Database Schema', status: 'In Progress', owner_id: 'u1' }
];

export const MOCK_TASKS = [
    { id: 't1', project_id: 'p1', node_id: 'n3', title: 'Find replacement for Roboto font', assigned_to: 'u2', due_date: '2026-03-05', status: 'Pending' },
    { id: 't2', project_id: 'p1', node_id: 'n5', title: 'Implement particle animation on Hero', assigned_to: 'u2', due_date: '2026-03-04', status: 'Done' },
    { id: 't3', project_id: 'p1', node_id: 'n6', title: 'Draft CSS Grid for pricing tiers', assigned_to: 'u3', due_date: '2026-03-10', status: 'Pending' },
    { id: 't4', project_id: 'p2', node_id: 'n7', title: 'Write migration scripts', assigned_to: 'u1', due_date: '2026-03-01', status: 'Pending' } // Intentionally overdue
];

// Helper to build a nested tree structure from flat node array
export const buildNodeTree = (nodes, projectId) => {
    const projectNodes = nodes.filter(n => n.project_id === projectId);
    const nodeMap = {};
    const roots = [];

    // Initialize map
    projectNodes.forEach(node => {
        nodeMap[node.id] = { ...node, children: [] };
    });

    // Build tree
    projectNodes.forEach(node => {
        if (node.parent_node_id) {
            if (nodeMap[node.parent_node_id]) {
                nodeMap[node.parent_node_id].children.push(nodeMap[node.id]);
            }
        } else {
            roots.push(nodeMap[node.id]);
        }
    });

    return roots;
};
