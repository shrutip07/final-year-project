import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Clerk Components
import ClerkProfile from "./Profile";
import StudentFees from "./StudentFees";
import TeacherSalaries from "./TeacherSalaries";
import ClerkAddStudent from "./StudentAdd";
import FireSafety from "./FireSafety";
import PhysicalSafety from "./PhysicalSafety";

// Shared Components
import ClerkLayout from "../../components/admin/ClerkLayout";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import EmptyState from "../../components/admin/EmptyState";
import ChatWidget from "../../components/ChatWidget";

import "./Dashboard.scss";

export default function ClerkDashboard() {
  const [sidebarTab, setSidebarTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();

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

    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        const [dashboardRes, notificationsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/clerk/unit", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/notifications", {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        setDashboard(dashboardRes.data);
        setNotifications(notificationsRes.data);
      } catch (err) {
        console.error("Failed to load clerk data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [checkingProfile]);

  /* -------------------- RENDER HELPERS -------------------- */
  
  const renderDashboardMain = () => (
    <div className="dashboard-main-view">
      <div className="section-header-pro">
        <h3>Institutional Overview</h3>
        <p>Manage unit-level student records, fees, and safety compliance</p>
      </div>

      <div className="metrics-grid mb-4">
        <div className="metric-box metric-students">
          <span className="label">TOTAL STUDENTS</span>
          <span className="value">{dashboard?.studentCount || 0}</span>
          <span className="sub-label">Registered in Unit</span>
        </div>
        <div className="metric-box metric-staff">
          <span className="label">TOTAL STAFF</span>
          <span className="value">{dashboard?.teacherCount || 0}</span>
          <span className="sub-label">Teaching & Non-Teaching</span>
        </div>
        <div className="metric-box metric-ratio">
          <span className="label">ENROLLED (AY {dashboard?.academic_year})</span>
          <span className="value">{dashboard?.totals?.enrolled || 0}</span>
          <span className="sub-label">Active Enrollments</span>
        </div>
        <div className="metric-box metric-fees highlight">
          <span className="label">SEATS REMAINING</span>
          <span className="value">{dashboard?.totals?.seatsRemaining || 0}</span>
          <span className="sub-label">Across all Standards</span>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <AdminCard header="Enrollment Statistics by Class">
            <TableContainer title="">
              <div className="table-responsive professional-table">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Standard</th>
                      <th>Division</th>
                      <th>Capacity</th>
                      <th>Enrolled</th>
                      <th>Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard?.classStats?.length > 0 ? (
                      dashboard.classStats.map((stat, i) => (
                        <tr key={i}>
                          <td className="fw-bold text-primary">STD {stat.standard}</td>
                          <td>{stat.division || "ALL"}</td>
                          <td>{stat.capacity}</td>
                          <td>
                            <span className="fw-semibold text-success">{stat.enrolled}</span>
                          </td>
                          <td>
                            <span className={`erp-badge ${stat.seatsRemaining > 0 ? 'badge-success' : 'badge-danger'}`}>
                              {stat.seatsRemaining} Seats
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-muted">
                          No class statistics available for current year.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TableContainer>
          </AdminCard>
        </div>
        <div className="col-lg-4">
          <AdminCard header="Upcoming Retirements">
            <div className="retirement-list">
              {dashboard?.upcomingRetirements?.length > 0 ? (
                dashboard.upcomingRetirements.map((ret, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded-3">
                    <div>
                      <span className="d-block fw-bold text-dark">Year {ret.year}</span>
                      <span className="small text-muted">{ret.count} staff members</span>
                    </div>
                    <i className="bi bi-calendar-event text-primary fs-4"></i>
                  </div>
                ))
              ) : (
                <EmptyState title="No Records" description="No upcoming retirements found." />
              )}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="notifications-module">
      <AdminCard header="Institutional Notifications">
        <div className="list-group list-group-flush professional-list">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div key={n.id} className="list-group-item py-4">
                <div className="d-flex w-100 justify-content-between align-items-center mb-2">
                  <h6 className="mb-0 fw-bold text-dark">{n.title}</h6>
                  <span className="badge bg-soft-primary text-primary px-3 py-2">ANNOUNCEMENT</span>
                </div>
                <p className="mb-2 text-muted small lh-lg">{n.message}</p>
                <div className="d-flex gap-3 small text-muted">
                  <span><i className="bi bi-person me-1"></i> From: {n.sender_role}</span>
                  <span><i className="bi bi-clock me-1"></i> {new Date(n.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : (
            <EmptyState title="No Notifications" description="You have no recent messages." />
          )}
        </div>
      </AdminCard>
    </div>
  );

  const renderContent = () => {
    switch (sidebarTab) {
      case "dashboard":
        return renderDashboardMain();

      case "profile":
        return <ClerkProfile />;

      case "fees":
        return <StudentFees />;

      case "salaries":
        return <TeacherSalaries />;

      case "addStudent":
        return <ClerkAddStudent />;

      case "fire-safety":
        return <FireSafety />;

      case "physical-safety":
        return <PhysicalSafety />;

      case "notifications":
        return renderNotifications();

      default:
        return renderDashboardMain();
    }
  };

  if (checkingProfile || loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 bg-light">
        <div className="spinner-grow text-primary" role="status"></div>
        <span className="mt-3 text-muted fw-bold">Syncing Clerk Portal...</span>
      </div>
    );
  }

  return (
    <ClerkLayout
      activeSidebarTab={sidebarTab}
      onSidebarTabChange={setSidebarTab}
      portalName="Clerk Portal"
    >
      <div className="dashboard-wrapper">
        {renderContent()}
      </div>
      <ChatWidget />
    </ClerkLayout>
  );
}
