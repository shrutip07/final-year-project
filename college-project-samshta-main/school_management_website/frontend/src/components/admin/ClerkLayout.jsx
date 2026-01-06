import React from 'react';
import DashboardLayout from './DashboardLayout';

export default function ClerkLayout(props) {
    const sidebarItems = [
      { key: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
      { key: "profile", label: "Profile", icon: "bi-person" },
      { key: "fees", label: "Student Fees", icon: "bi-cash-stack" },
      { key: "salaries", label: "Teacher Salaries", icon: "bi-wallet2" },
      { key: "addStudent", label: "Add Student", icon: "bi-person-plus" },
      { key: "fire-safety", label: "Fire Safety", icon: "bi-fire" },
      { key: "physical-safety", label: "Physical Safety", icon: "bi-shield" },
      { key: "notifications", label: "Notifications", icon: "bi-bell" },
    ];

    return (
      <DashboardLayout 
        {...props} 
        sidebarItems={sidebarItems} 
        portalName="Clerk Portal"
        portalIcon="bi-journal-check"
        customGreeting="Welcome, Clerk 👋"
      />
    );

}
