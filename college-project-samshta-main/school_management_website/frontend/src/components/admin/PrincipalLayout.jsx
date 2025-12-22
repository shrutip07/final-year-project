import React from 'react';
import DashboardLayout from './DashboardLayout';

export default function PrincipalLayout(props) {
  const sidebarItems = [
    { key: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { key: "profile", label: "Profile", icon: "bi-person" },
    { key: "teachers", label: "Teachers", icon: "bi-people" },
    { key: "students", label: "Students", icon: "bi-person-lines-fill" },
    { key: "charts", label: "Charts", icon: "bi-bar-chart" },
    { key: "notifications", label: "Notifications", icon: "bi-bell" },
  ];

  return (
    <DashboardLayout 
      {...props} 
      sidebarItems={sidebarItems} 
      portalName="Principal Portal"
      portalIcon="bi-mortarboard-fill"
    />
  );
}
