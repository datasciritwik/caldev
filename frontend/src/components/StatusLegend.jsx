import React from 'react';
import './StatusLegend.css';

const StatusLegend = () => {
  return (
    <div className="status-legend-container">
      <div className="status-legend">
        <div className="legend-item">
          <span className="legend-dot status-not-started"></span>
          <span>Not Started</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot status-in-progress"></span>
          <span>In Progress</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot status-done"></span>
          <span>Done</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot status-overdue"></span>
          <span>Overdue / Blocked</span>
        </div>
      </div>
    </div>
  );
};

export default StatusLegend;
