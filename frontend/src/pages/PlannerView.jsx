import React, { useMemo, useState } from 'react';
import { MOCK_NODES, MOCK_USERS, buildNodeTree } from '../utils/dummyData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faProjectDiagram, faEdit, faSave, faTimes, faPlus, faUser, faFolderOpen, faChevronRight, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import './PlannerView.css';

// Build a quick lookup: id -> username
const userMap = {};
MOCK_USERS.forEach(u => { userMap[u.id] = u.username; });

const getUserName = (id) => userMap[id] || 'Unassigned';

// Helper: flatten tree into a list with depth for dropdowns
const flattenTree = (nodes, depth = 0) => {
  let result = [];
  nodes.forEach(n => {
    result.push({ id: n.id, title: n.title, depth });
    if (n.children && n.children.length > 0) {
      result = result.concat(flattenTree(n.children, depth + 1));
    }
  });
  return result;
};

// Recursive tree node with collapse/expand + inline add-child
const NodeItem = ({ node, onSelect, onAddChild, selectedId, depth = 0 }) => {
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;
  const [expanded, setExpanded] = useState(true);

  const handleToggle = (e) => {
    e.stopPropagation();
    setExpanded(prev => !prev);
  };

  const handleAddChild = (e) => {
    e.stopPropagation();
    onAddChild(node);
  };

  return (
    <div className={`node-item depth-${Math.min(depth, 4)}`}>
      <div className="node-row">
        {/* Expand / Collapse Toggle */}
        <button
          className={`node-toggle ${hasChildren ? '' : 'invisible'}`}
          onClick={handleToggle}
          tabIndex={-1}
        >
          <FontAwesomeIcon icon={expanded ? faChevronDown : faChevronRight} />
        </button>

        {/* The card itself */}
        <div
          className={`node-card status-${node.status.toLowerCase().replace(/\s+/g, '-')} ${isSelected ? 'selected' : ''}`}
          onClick={() => onSelect(node)}
        >
          <div className="node-card-content">
            <span className="node-title">{node.title}</span>
            <div className="node-meta">
              <span className={`node-status-badge st-${node.status.toLowerCase().replace(/\s+/g, '-')}`}>{node.status}</span>
              <span className="node-owner-tag">
                <FontAwesomeIcon icon={faUser} />
                {getUserName(node.owner_id)}
              </span>
              <button className="add-child-btn" onClick={handleAddChild} title="Add child node">
                <FontAwesomeIcon icon={faPlus} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="node-children">
          {node.children.map(child => (
            <NodeItem
              key={child.id}
              node={child}
              onSelect={onSelect}
              onAddChild={onAddChild}
              selectedId={selectedId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const PlannerView = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNodeData, setNewNodeData] = useState({ title: '', status: 'Not Started', owner_id: '', parent_node_id: '' });

  const treeData = useMemo(() => buildNodeTree(MOCK_NODES, 'p1'), []);

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    setEditFormData({ ...node });
    setShowCreateForm(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    console.log('Saving node data:', editFormData);
    alert('Changes saved successfully (Simulation)');
  };

  const handleNewNodeChange = (e) => {
    const { name, value } = e.target;
    setNewNodeData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateNode = (e) => {
    e.preventDefault();
    const parentLabel = newNodeData.parent_node_id
      ? flatNodes.find(n => n.id === newNodeData.parent_node_id)?.title || 'Unknown'
      : 'Root';
    console.log('Creating new node:', newNodeData);
    alert(`Node "${newNodeData.title}" created under "${parentLabel}" (Simulation)`);
    setNewNodeData({ title: '', status: 'Not Started', owner_id: '', parent_node_id: '' });
    setShowCreateForm(false);
  };

  const openCreateForm = (parentNode = null) => {
    setShowCreateForm(true);
    setSelectedNode(null);
    setEditFormData(null);
    setNewNodeData({ title: '', status: 'Not Started', owner_id: '', parent_node_id: parentNode?.id || '' });
  };

  // Flat list of all nodes for use in the parent dropdown
  const flatNodes = useMemo(() => flattenTree(treeData), [treeData]);

  const treeIsEmpty = treeData.length === 0;

  return (
    <div className="planner-page-container">
      <header className="planner-view-header">
        <div className="header-title-area">
          <FontAwesomeIcon icon={faProjectDiagram} className="header-icon" />
          <div>
            <h1>Tree Planner</h1>
            <p className="subtitle">Project Alpha — Hierarchy</p>
          </div>
        </div>
      </header>

      <div className="planner-split-view">
        {/* Left Pane: Tree Preview */}
        <aside className="tree-preview-pane">
          <div className="pane-header">
            <h3>Hierarchy</h3>
            <button className="add-node-btn" onClick={openCreateForm} title="Add new node">
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>

          <div className="tree-canvas">
            {treeIsEmpty ? (
              <div className="empty-tree-state">
                <FontAwesomeIcon icon={faFolderOpen} className="empty-tree-icon" />
                <p>No nodes yet</p>
                <span>Click <strong>+</strong> above to create your first node</span>
              </div>
            ) : (
              treeData.map(rootNode => (
                <NodeItem
                  key={rootNode.id}
                  node={rootNode}
                  onSelect={handleNodeSelect}
                  onAddChild={openCreateForm}
                  selectedId={selectedNode?.id}
                  depth={0}
                />
              ))
            )}
          </div>
        </aside>

        {/* Right Pane: Edit / Create Panel */}
        <main className="edit-panel-pane">
          <div className="pane-header">
            <h3>{showCreateForm ? 'Create Node' : 'Node Details'}</h3>
          </div>

          <div className="edit-form-container">
            {showCreateForm ? (
              /* ---- CREATE FORM ---- */
              <form className="node-edit-form" onSubmit={handleCreateNode}>
                <div className="form-section">
                  <label>Node Title</label>
                  <input
                    type="text"
                    name="title"
                    value={newNodeData.title}
                    onChange={handleNewNodeChange}
                    placeholder="e.g. Backend API"
                    autoFocus
                  />
                </div>

                <div className="form-section">
                  <label>Parent Node</label>
                  <select name="parent_node_id" value={newNodeData.parent_node_id} onChange={handleNewNodeChange}>
                    <option value="">(Root — no parent)</option>
                    {flatNodes.map(n => (
                      <option key={n.id} value={n.id}>{'—'.repeat(n.depth)} {n.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-section">
                    <label>Status</label>
                    <select name="status" value={newNodeData.status} onChange={handleNewNodeChange}>
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div className="form-section">
                    <label>Owner</label>
                    <select name="owner_id" value={newNodeData.owner_id} onChange={handleNewNodeChange}>
                      <option value="">Select owner…</option>
                      {MOCK_USERS.map(u => (
                        <option key={u.id} value={u.id}>{u.username}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn">
                    <FontAwesomeIcon icon={faPlus} />
                    Create Node
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => setShowCreateForm(false)}>
                    <FontAwesomeIcon icon={faTimes} />
                    Cancel
                  </button>
                </div>
              </form>
            ) : selectedNode ? (
              /* ---- EDIT FORM ---- */
              <form className="node-edit-form" onSubmit={handleSave}>
                <div className="form-section">
                  <label>Node Title</label>
                  <input
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleFormChange}
                    placeholder="e.g. Design Phase"
                  />
                </div>

                <div className="form-row">
                  <div className="form-section">
                    <label>Status</label>
                    <select name="status" value={editFormData.status} onChange={handleFormChange}>
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div className="form-section">
                    <label>Owner</label>
                    <select name="owner_id" value={editFormData.owner_id} onChange={handleFormChange}>
                      <option value="">Select owner…</option>
                      {MOCK_USERS.map(u => (
                        <option key={u.id} value={u.id}>{u.username}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-section">
                  <label>Parent Node</label>
                  <input
                    type="text"
                    value={editFormData.parent_node_id || '(Root Node)'}
                    disabled
                    className="disabled-input"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn">
                    <FontAwesomeIcon icon={faSave} />
                    Save Changes
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => { setSelectedNode(null); setEditFormData(null); }}>
                    <FontAwesomeIcon icon={faTimes} />
                    Close
                  </button>
                </div>
              </form>
            ) : (
              /* ---- EMPTY STATE ---- */
              <div className="empty-selection-state">
                <FontAwesomeIcon icon={faEdit} className="empty-icon" />
                <p>Select a node to view and edit its details</p>
                <button className="create-prompt-btn" onClick={openCreateForm}>
                  <FontAwesomeIcon icon={faPlus} />
                  Or create a new node
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlannerView;
