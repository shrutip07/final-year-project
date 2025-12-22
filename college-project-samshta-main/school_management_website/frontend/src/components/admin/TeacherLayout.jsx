import React from 'react';
import DashboardLayout from './DashboardLayout';

export default function TeacherLayout(props) {
  const sidebarItems = [
    { key: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { key: "profile", label: "Profile", icon: "bi-person" },
    { key: "students", label: "Students", icon: "bi-people" },
    { key: "charts", label: "Charts", icon: "bi-bar-chart" },
    { key: "notifications", label: "Notifications", icon: "bi-bell" }
  ];

  return (
    <DashboardLayout 
      {...props} 
      sidebarItems={sidebarItems} 
      portalName="Teacher Portal"
      portalIcon="bi-person-workspace"
    />
  );
}
