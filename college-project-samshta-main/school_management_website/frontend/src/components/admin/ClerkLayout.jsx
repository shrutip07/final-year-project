import React from 'react';
import DashboardLayout from './DashboardLayout';

export default function ClerkLayout(props) {
      const sidebarItems = [
        { key: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
        { key: "profile", label: "Profile", icon: "bi-person" },
        { key: "fees", label: "Student Fees", icon: "bi-cash-stack" },
        { key: "salaries", label: "Teacher Salaries", icon: "bi-wallet2" },
        { key: "retirements", label: "Retirements", icon: "bi-person-x" },
        { key: "addStudent", label: "Add Student", icon: "bi-person-plus" },
        { key: "capacity", label: "Capacity", icon: "bi-building-up" },
        { key: "fire-safety", label: "Fire Safety", icon: "bi-fire" },
        { key: "physical-safety", label: "Physical Safety", icon: "bi-shield-check" },
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
