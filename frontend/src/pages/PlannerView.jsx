import React, { useMemo, useState } from 'react';
import { useNodes, useUsers } from '../hooks/usePlanner';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faProjectDiagram, faEdit, faSave, faTimes, faPlus, faUser, 
  faFolderOpen, faChevronRight, faChevronDown, faTrash, 
  faCheckSquare, faSquare, faFileAlt, faListUl 
} from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './PlannerView.css';

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
const NodeItem = ({ node, onSelect, onAddChild, selectedId, users, depth = 0 }) => {
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;
  const [expanded, setExpanded] = useState(true);

  const getUserName = (id) => {
    const user = users?.find(u => u.id === id || u._id === id);
    return user ? user.username : 'Unassigned';
  };

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
          className={`node-card status-${(node.status || 'not-started').toLowerCase().replace(/\s+/g, '-')} ${isSelected ? 'selected' : ''}`}
          onClick={() => onSelect(node)}
        >
          <div className="node-card-content">
            <span className="node-title">{node.title}</span>
            <div className="node-meta">
              <span className={`node-status-badge st-${(node.status || 'not-started').toLowerCase().replace(/\s+/g, '-')}`}>{node.status || 'Not Started'}</span>
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
              users={users}
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
  const [newNodeData, setNewNodeData] = useState({ title: '', status: 'Not Started', owner_id: null, parent_node_id: null, description: '', checklist: [] });
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'description', 'checklist'
  const [newItemText, setNewItemText] = useState('');

  const projectId = '507f1f77bcf86cd799439011'; // Example valid ObjectId
  const { data: treeData = [], isLoading: nodesLoading, createNode, updateNode, deleteNode } = useNodes(projectId);
  const { data: users = [], isLoading: usersLoading } = useUsers();

  const handleNodeSelect = (node) => {
    setSelectedNode(node);
    setEditFormData({ 
      ...node, 
      owner_id: node.owner_id || null, 
      description: node.description || '', 
      checklist: node.checklist || [] 
    });
    setShowCreateForm(false);
    setActiveTab('details');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: (name === 'owner_id' || name === 'parent_node_id') && value === '' ? null : value }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      await updateNode.mutateAsync({ 
        id: editFormData.id, 
        title: editFormData.title, 
        status: editFormData.status, 
        owner_id: editFormData.owner_id,
        description: editFormData.description,
        checklist: editFormData.checklist
      });
      // Optionally don't clear selection on save to allow continuous editing
    } catch (err) {
      alert("Failed to save: " + err.message);
    }
  };

  // Checklist Helpers
  const addChecklistItem = () => {
    if (!newItemText.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      completed: false
    };
    setEditFormData(prev => ({
      ...prev,
      checklist: [...(prev.checklist || []), newItem]
    }));
    setNewItemText('');
  };

  const toggleChecklistItem = (id) => {
    setEditFormData(prev => ({
      ...prev,
      checklist: prev.checklist.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    }));
  };

  const removeChecklistItem = (id) => {
    setEditFormData(prev => ({
      ...prev,
      checklist: prev.checklist.filter(item => item.id !== id)
    }));
  };

  const handleNewNodeChange = (e) => {
    const { name, value } = e.target;
    setNewNodeData(prev => ({ ...prev, [name]: (name === 'owner_id' || name === 'parent_node_id') && value === '' ? null : value }));
  };

  const handleCreateNode = async (e) => {
    e.preventDefault();
    try {
      await createNode.mutateAsync({
        title: newNodeData.title,
        status: newNodeData.status,
        owner_id: newNodeData.owner_id || null,
        parent_node_id: newNodeData.parent_node_id || null,
        description: newNodeData.description || '',
        checklist: newNodeData.checklist || []
      });
      setNewNodeData({ title: '', status: 'Not Started', owner_id: null, parent_node_id: null, description: '', checklist: [] });
      setShowCreateForm(false);
    } catch (err) {
      alert("Failed to create: " + err.message);
    }
  };

  const handleDeleteNode = async (nodeId) => {
    if (window.confirm("Are you sure? This will delete all sub-nodes as well.")) {
      try {
        await deleteNode.mutateAsync(nodeId);
        setSelectedNode(null);
        setEditFormData(null);
      } catch (err) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const openCreateForm = (parentNode = null) => {
    setShowCreateForm(true);
    setSelectedNode(null);
    setEditFormData(null);
    setNewNodeData({ 
      title: '', 
      status: 'Not Started', 
      owner_id: null, 
      parent_node_id: parentNode?.id || null,
      description: '',
      checklist: []
    });
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
            <p className="subtitle">Visual Hierarchy & Roadmap</p>
          </div>
        </div>
      </header>

      <div className="planner-split-view">
        {/* Left Pane: Tree Preview */}
        <aside className="tree-preview-pane">
          <div className="pane-header">
            <h3>Hierarchy</h3>
            <button className="add-node-btn" onClick={() => openCreateForm()} title="Add root node">
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </div>

          <div className="tree-canvas">
            {nodesLoading ? (
              <div className="loading-state">Loading hierarchy...</div>
            ) : treeIsEmpty ? (
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
                  users={users}
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
            {!showCreateForm && selectedNode && (
              <div className="tab-switcher">
                <button 
                  className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                  onClick={() => setActiveTab('details')}
                  title="Basic Details"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                  onClick={() => setActiveTab('description')}
                  title="Markdown Description"
                >
                  <FontAwesomeIcon icon={faFileAlt} />
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'checklist' ? 'active' : ''}`}
                  onClick={() => setActiveTab('checklist')}
                  title="Task Checklist"
                >
                  <FontAwesomeIcon icon={faListUl} />
                </button>
              </div>
            )}
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
                    required
                  />
                </div>

                <div className="form-section">
                  <label>Parent Node</label>
                  <select name="parent_node_id" value={newNodeData.parent_node_id || ''} onChange={handleNewNodeChange}>
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
                    <select name="owner_id" value={newNodeData.owner_id || ''} onChange={handleNewNodeChange}>
                      <option value="">Select owner…</option>
                      {users.map(u => (
                        <option key={u.id || u._id} value={u.id || u._id}>{u.username}</option>
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
              /* ---- EDIT VIEW ---- */
              <div className="node-details-view">
                {activeTab === 'details' && (
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
                        <select name="owner_id" value={editFormData.owner_id || ''} onChange={handleFormChange}>
                          <option value="">Select owner…</option>
                          {users.map(u => (
                            <option key={u.id || u._id} value={u.id || u._id}>{u.username}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="save-btn">
                        <FontAwesomeIcon icon={faSave} />
                        Save Changes
                      </button>
                      <button type="button" className="delete-btn" onClick={() => handleDeleteNode(editFormData.id)}>
                        <FontAwesomeIcon icon={faTrash} />
                        Delete
                      </button>
                    </div>
                  </form>
                )}

                {activeTab === 'description' && (
                  <div className="description-tab">
                    <div className="markdown-editor-container">
                      <label>Description (Markdown)</label>
                      <textarea
                        name="description"
                        value={editFormData.description}
                        onChange={handleFormChange}
                        placeholder="Add some details about this node using Markdown..."
                        rows={10}
                      />
                    </div>
                    <div className="markdown-preview">
                      <label>Preview</label>
                      <div className="preview-content">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {editFormData.description || "*No description provided.*"}
                        </ReactMarkdown>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button onClick={handleSave} className="save-btn">
                        <FontAwesomeIcon icon={faSave} />
                        Save Description
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'checklist' && (
                  <div className="checklist-tab">
                    <label>Task Checklist</label>
                    <div className="checklist-tracker">
                      <div className="checklist-items">
                        {editFormData.checklist?.length > 0 ? (
                          editFormData.checklist.map(item => (
                            <div key={item.id} className="checklist-item">
                              <button 
                                className={`item-toggle ${item.completed ? 'completed' : ''}`}
                                onClick={() => toggleChecklistItem(item.id)}
                              >
                                <FontAwesomeIcon icon={item.completed ? faCheckSquare : faSquare} />
                              </button>
                              <span className={item.completed ? 'strikethrough' : ''}>{item.text}</span>
                              <button className="item-delete" onClick={() => removeChecklistItem(item.id)}>
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="empty-checklist">No tasks added yet.</div>
                        )}
                      </div>
                      <div className="add-item-row">
                        <input 
                          type="text" 
                          placeholder="Add new task..." 
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                        />
                        <button onClick={addChecklistItem}>
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                    </div>
                    <div className="form-actions">
                      <button onClick={handleSave} className="save-btn">
                        <FontAwesomeIcon icon={faSave} />
                        Save Checklist
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ---- EMPTY STATE ---- */
              <div className="empty-selection-state">
                <FontAwesomeIcon icon={faEdit} className="empty-icon" />
                <p>Select a node to view its hierarchy, description, and tasks</p>
                <button className="create-prompt-btn" onClick={() => openCreateForm()}>
                  <FontAwesomeIcon icon={faPlus} />
                  Or create a new root node
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
