import React, { useMemo } from 'react';
import { MOCK_NODES, buildNodeTree } from '../utils/dummyData';
import './PlannerView.css';

// A simple recursive component just to prove the data works
const NodeItem = ({ node }) => {
  return (
    <div className="node-item">
      <div className={`node-card status-${node.status.toLowerCase().replace(' ', '-')}`}>
        <h4>{node.title}</h4>
        <span className="node-status">{node.status}</span>
      </div>
      
      {node.children && node.children.length > 0 && (
        <div className="node-children">
          {node.children.map(child => (
            <NodeItem key={child.id} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

const PlannerView = () => {
  // Using 'p1' explicitly for the dummy data demo
  const treeData = useMemo(() => buildNodeTree(MOCK_NODES, 'p1'), []);

  return (
    <div className="planner-container">
      <div className="planner-header">
        <h1>Tree Planner</h1>
        <p className="subtitle">Project Alpha (p1) Hierarchy</p>
      </div>

      <div className="tree-canvas">
        {treeData.map(rootNode => (
          <NodeItem key={rootNode.id} node={rootNode} />
        ))}
      </div>
    </div>
  );
};

export default PlannerView;
