import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopGreetingBar from './TopGreetingBar';
import './AdminLayout.scss'; // Keeping the CSS file name or rename if preferred

export default function DashboardLayout({ 
  children, 
  schoolName, 
  semisId, 
  activeSidebarTab, 
  onSidebarTabChange,
  sidebarItems,
  portalName,
  portalIcon = "bi-buildings-fill"
}) {
  const navigate = useNavigate();

  const handleNavClick = (item) => {
    if (onSidebarTabChange) {
      onSidebarTabChange(item.key);
    }
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="app-icon"><i className={`bi ${portalIcon}`}></i></div>
          <h3>{portalName}</h3>
        </div>
        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              className={`nav-link ${activeSidebarTab === item.key ? "active" : ""}`}
              onClick={() => handleNavClick(item)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
          </nav>
        </aside>
        <div className="layout-content">

        <TopGreetingBar schoolName={schoolName} semisId={semisId} />
        <main className="main-viewport">
          {children}
        </main>
      </div>
    </div>
  );
}
