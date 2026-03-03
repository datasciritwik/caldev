import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faUserCircle, faPlus, faProjectDiagram, faCalendarAlt, faUsers, faList } from '@fortawesome/free-solid-svg-icons';
import './TopNav.css';

const TopNav = () => {
  return (
    <header className="top-nav">
      
      {/* Left Zone: Context & Action */}
      <div className="top-nav-zone left-zone">
        <select className="project-selector" aria-label="Select Project">
          <option value="all">All Projects</option>
          <option value="p1">Project Alpha</option>
          <option value="p2">Project Beta</option>
        </select>
        
        <button className="new-project-btn">
          <FontAwesomeIcon icon={faPlus} className="icon-sm" />
          <span>New</span>
        </button>
      </div>

      {/* Center Zone: Main Navigation */}
      <nav className="top-nav-zone center-zone">
        <NavLink 
          to="/projects" 
          className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}
        >
          <FontAwesomeIcon icon={faList} className="nav-icon" />
          <span>Projects</span>
        </NavLink>
        <NavLink 
          to="/planner" 
          className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}
        >
          <FontAwesomeIcon icon={faProjectDiagram} className="nav-icon" />
          <span>Planner</span>
        </NavLink>
        <NavLink 
          to="/calendar" 
          className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}
        >
          <FontAwesomeIcon icon={faCalendarAlt} className="nav-icon" />
          <span>Calendar</span>
        </NavLink>
        <NavLink 
          to="/people" 
          className={({ isActive }) => isActive ? 'nav-tab active' : 'nav-tab'}
        >
          <FontAwesomeIcon icon={faUsers} className="nav-icon" />
          <span>People</span>
        </NavLink>
      </nav>

      {/* Right Zone: User & Alerts */}
      <div className="top-nav-zone right-zone">
        <button className="icon-btn notification-btn" aria-label="Notifications">
          <FontAwesomeIcon icon={faBell} />
          {/* Badge example */}
          <span className="notification-badge">3</span>
        </button>
        <button className="icon-btn profile-btn" aria-label="User Profile">
          <FontAwesomeIcon icon={faUserCircle} className="avatar-icon" />
        </button>
      </div>

    </header>
  );
};

export default TopNav;
