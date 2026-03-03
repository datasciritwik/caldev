import React from 'react';
import { MOCK_TASKS } from '../utils/dummyData';
import './CalendarView.css';

const CalendarView = () => {
  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>Execution Calendar</h1>
        <p className="subtitle">All tasks mapping to deadlines</p>
      </div>

      <div className="task-list">
        {MOCK_TASKS.map(task => (
           <div key={task.id} className={`task-card status-${task.status.toLowerCase()}`}>
              <div className="task-meta">
                <span className="task-due text-sm font-bold bg-gray-100 rounded px-2">{task.due_date}</span>
                <span className="task-status">{task.status}</span>
              </div>
              <h3 className="task-title">{task.title}</h3>
              <p className="task-assigned">Assigned to: {task.assigned_to}</p>
           </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
