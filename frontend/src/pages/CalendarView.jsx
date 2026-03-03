import React, { useState } from 'react';
import { MOCK_TASKS } from '../utils/dummyData';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronLeft, 
  faChevronRight, 
  faPlus, 
  faCalendarCheck, 
  faFilter,
  faCircle
} from '@fortawesome/free-solid-svg-icons';
import './CalendarView.css';

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 1)); // Starting at March 2026 as per mock data

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper functions for calendar grid
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate the days for the grid
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  // Previous month padding
  const daysInPrevMonth = getDaysInMonth(year, month - 1);
  const prevMonthPadding = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    prevMonthPadding.push({
      day: daysInPrevMonth - i,
      month: month - 1,
      year: year,
      isCurrentMonth: false,
    });
  }

  // Current month days
  const currentMonthDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentMonthDays.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true,
    });
  }

  // Next month padding
  const totalSlots = 42; // 6 rows of 7 days
  const nextMonthPadding = [];
  const remainingSlots = totalSlots - prevMonthPadding.length - currentMonthDays.length;
  for (let i = 1; i <= remainingSlots; i++) {
    nextMonthPadding.push({
      day: i,
      month: month + 1,
      year: year,
      isCurrentMonth: false,
    });
  }

  const allDays = [...prevMonthPadding, ...currentMonthDays, ...nextMonthPadding];

  // Map tasks to dates
  const getTasksForDate = (d, m, y) => {
    const dateString = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return MOCK_TASKS.filter(task => task.due_date === dateString);
  };

  return (
    <div className="calendar-page-container">
      {/* Main Calendar Content */}
      <main className="calendar-main">
        <header className="calendar-grid-header">
          <div className="header-left">
            <button className="today-btn" onClick={goToToday}>Today</button>
            <div className="nav-controls">
              <button className="nav-btn" onClick={prevMonth}>
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              <button className="nav-btn" onClick={nextMonth}>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
            <h2 className="current-month-display">
              {monthNames[month]} {year}
            </h2>
          </div>
          <div className="header-right">
             <div className="view-selector">
                <span className="active">Month</span>
                <span>Week</span>
                <span>Day</span>
             </div>
          </div>
        </header>

        <div className="calendar-grid-container">
          {/* Days of week header */}
          <div className="days-header">
            {daysOfWeek.map(day => (
              <div key={day} className="day-name">{day}</div>
            ))}
          </div>

          {/* Month Grid */}
          <div className="month-grid">
            {allDays.map((dateObj, index) => {
              const tasks = getTasksForDate(dateObj.day, dateObj.month, dateObj.year);
              const isToday = new Date().toDateString() === new Date(dateObj.year, dateObj.month, dateObj.day).toDateString();

              return (
                <div 
                  key={index} 
                  className={`day-cell ${!dateObj.isCurrentMonth ? 'other-month' : ''} ${isToday ? 'is-today' : ''}`}
                >
                  <div className="day-number-container">
                    <span className="day-number">{dateObj.day}</span>
                  </div>
                  <div className="day-tasks">
                    {tasks.map(task => (
                      <div 
                        key={task.id} 
                        className={`calendar-task-badge status-${task.status.toLowerCase()}`}
                        title={`${task.title} - ${task.status}`}
                      >
                        <span className="task-dot"></span>
                        <span className="task-text">{task.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CalendarView;
