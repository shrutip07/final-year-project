import React from 'react';
import DashboardLayout from '../admin/DashboardLayout';

export default function TeacherLayout(props) {
  const sidebarItems = [
    { key: "dashboard", label: "Dashboard", icon: "bi-speedometer2", path: "/teacher" },
    { key: "profile", label: "Profile", icon: "bi-person", path: "/teacher/profile" },
    { key: "students", label: "Students", icon: "bi-people", path: "/teacher/students" },
    { key: "charts", label: "Charts", icon: "bi-bar-chart", path: "/teacher/charts" },
    { key: "notifications", label: "Notifications", icon: "bi-bell", path: "/teacher/notifications" }
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
