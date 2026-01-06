import React from 'react';
import DashboardLayout from './DashboardLayout';

export default function AdminLayout(props) {
    const sidebarItems = [
      { key: "dashboard", label: "Dashboard", icon: "bi-speedometer2", path: "/admin" },
      { key: "tables", label: "Tables", icon: "bi-table", path: "/admin/tables" },
      { key: "charts", label: "Charts", icon: "bi-bar-chart-fill", path: "/admin/charts" },
      { key: "notifications", label: "Notifications", icon: "bi-bell-fill", path: "/admin/notifications" },
    ];

  return (
    <DashboardLayout 
      {...props} 
      sidebarItems={sidebarItems} 
      portalName="Admin Panel"
      portalIcon="bi-buildings-fill"
    />
  );
}
