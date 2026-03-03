import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNav from './TopNav';
import './AppShell.css';

const AppShell = () => {
  return (
    <div className="app-shell">
      <TopNav />
      {/* 
        This is the Main Workspace container. 
        React Router will render the specific views (Projects, Planner, Calendar) 
        inside this Outlet based on the URL.
      */}
      <main className="workspace-container">
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
