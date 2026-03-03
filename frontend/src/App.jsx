import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import ProjectsView from './pages/ProjectsView';
import PlannerView from './pages/PlannerView';
import CalendarView from './pages/CalendarView';
import PeopleView from './pages/PeopleView';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/projects" replace />} />
          <Route path="projects" element={<ProjectsView />} />
          <Route path="planner" element={<PlannerView />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="people" element={<PeopleView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
