import React from 'react';
import { MOCK_PROJECTS } from '../utils/dummyData';
import './ProjectsView.css';

const ProjectsView = () => {
  return (
    <div className="projects-container">
      <div className="projects-header">
        <h1>Projects Dashboard</h1>
        <p className="subtitle">All active initiatives</p>
      </div>

      <div className="projects-grid">
        {MOCK_PROJECTS.map((project) => (
          <div key={project.id} className="project-card">
            <h2>{project.name}</h2>
            <p className="project-objective">{project.objective}</p>
            <div className="project-meta">
              <span className="date-badge">
                {project.start_date} → {project.target_date}
              </span>
            </div>
            <div className="project-actions">
              <button>Open Planner</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsView;
