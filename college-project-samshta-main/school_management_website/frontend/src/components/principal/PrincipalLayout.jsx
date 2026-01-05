import React from 'react';
import DashboardLayout from '../admin/DashboardLayout';

export default function PrincipalLayout(props) {
    const sidebarItems = [
      { key: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
      { key: "profile", label: "Profile", icon: "bi-person" },
      { key: "teachers", label: "Teachers", icon: "bi-people" },
      { key: "students", label: "Students", icon: "bi-mortarboard" },
      { key: "charts", label: "Charts", icon: "bi-bar-chart-fill" },
      { key: "notifications", label: "Notifications", icon: "bi-bell-fill" },
    ];

  return (
    <DashboardLayout 
      {...props} 
      sidebarItems={sidebarItems} 
      portalName="Principal Portal"
      portalIcon="bi-mortarboard-fill"
      customGreeting="Welcome, Principal 👋"
    />
  );
}
