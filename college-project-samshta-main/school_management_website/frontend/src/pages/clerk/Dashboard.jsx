// src/pages/clerk/ClerkDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import ClerkProfile from "./Profile";
import StudentFees from "./StudentFees";
import TeacherSalaries from "./TeacherSalaries";
import ClerkAddStudent from "./StudentAdd";
import FireSafety from "./FireSafety";
import PhysicalSafety from "./PhysicalSafety";

import ChatWidget from "../../components/ChatWidget";
import "./Dashboard.scss";

export default function ClerkDashboard() {
  const [sidebarTab, setSidebarTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingProfile, setCheckingProfile] = useState(true);

  const navigate = useNavigate();

  const sidebarItems = [
    { key: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { key: "profile", label: "Profile", icon: "bi-person" },
    { key: "fees", label: "Student Fees", icon: "bi-cash-stack" },
    { key: "salaries", label: "Teacher Salaries", icon: "bi-wallet2" },
    { key: "addStudent", label: "Add Student", icon: "bi-person-plus" },
    { key: "fire-safety", label: "Fire Safety", icon: "bi-fire" },
    { key: "physical-safety", label: "Physical Safety", icon: "bi-shield" },
  ];

  /* -------------------- PROFILE CHECK -------------------- */
  useEffect(() => {
    async function checkProfile() {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/clerk/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 404) {
          navigate("/clerk/onboarding", { replace: true });
        } else {
          setCheckingProfile(false);
        }
      } catch {
        setCheckingProfile(false);
      }
    }

    checkProfile();
  }, [navigate]);

  /* -------------------- DASHBOARD DATA -------------------- */
  useEffect(() => {
    if (checkingProfile) return;

    async function fetchDashboard() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/clerk/unit", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDashboard(data);
      } catch {
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, [checkingProfile]);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  /* -------------------- RENDER HELPERS -------------------- */
  function renderDashboardCard() {
    return (
      <div className="clerk-main-inner">
        <div className="page-header page-header-tight">
          <h2>School Unit Details</h2>
        </div>

        <div className="clerk-unit-card">
          {dashboard?.unit ? (
            <div className="table-responsive">
              <table className="clerk-unit-table">
                <tbody>
                  {Object.entries(dashboard.unit).map(([key, value]) => (
                    <tr key={key}>
                      <th>{key.replace(/_/g, " ")}</th>
                      <td>{value || "-"}</td>
                    </tr>
                  ))}
                  <tr>
                    <th>Teacher Count</th>
                    <td>{dashboard.teacherCount ?? "-"}</td>
                  </tr>
                  <tr>
                    <th>Student Count</th>
                    <td>{dashboard.studentCount ?? "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-muted">No unit information found.</div>
          )}
        </div>
      </div>
    );
  }

  function renderContent() {
    switch (sidebarTab) {
      case "dashboard":
        return renderDashboardCard();

      case "profile":
        return (
          <div className="clerk-main-inner">
            <div className="page-header page-header-tight">
              <h2>Clerk Profile</h2>
            </div>
            <ClerkProfile />
          </div>
        );

      case "fees":
        return (
          <div className="clerk-main-inner">
            <div className="page-header page-header-tight">
              <h2>Student Fees</h2>
            </div>
            <StudentFees />
          </div>
        );

      case "salaries":
        return (
          <div className="clerk-main-inner">
            <div className="page-header page-header-tight">
              <h2>Teacher Salaries</h2>
            </div>
            <TeacherSalaries />
          </div>
        );

      case "addStudent":
        return (
          <div className="clerk-main-inner">
            <div className="page-header page-header-tight">
              <h2>Add Student</h2>
            </div>
            <ClerkAddStudent />
          </div>
        );

      case "fire-safety":
        return <FireSafety />;

      case "physical-safety":
        return <PhysicalSafety />;

      default:
        return null;
    }
  }

  if (checkingProfile) return <div className="loading-state">Checking profile…</div>;
  if (loading) return <div className="loading-state">Loading…</div>;

  /* -------------------- JSX -------------------- */
  return (
    <div className="clerk-dashboard-container">
      {/* SIDEBAR */}
      <aside className="clerk-sidebar">
        <div className="clerk-sidebar-header">
          <i className="bi bi-journal-check" />
          <h3>Clerk Portal</h3>
        </div>

        <nav className="clerk-sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              className={`clerk-nav-link ${
                sidebarTab === item.key ? "active" : ""
              }`}
              onClick={() => setSidebarTab(item.key)}
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="clerk-sidebar-footer">
          <button className="clerk-nav-link logout-btn" onClick={handleLogout}>
            <i className="bi bi-box-arrow-left" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="clerk-main-content">
        {renderContent()}
        <ChatWidget />
      </main>
    </div>
  );
}
