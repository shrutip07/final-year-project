import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Clerk Components
import ClerkProfile from "./Profile";
import StudentFees from "./StudentFees";
import TeacherSalaries from "./TeacherSalaries";
import ClerkAddStudent from "./StudentAdd";
import FireSafety from "./FireSafety";
import PhysicalSafety from "./PhysicalSafety";
import ManageRetirements from "./ManageRetirements";
import CapacityManager from "./CapacityManager";

// Shared Components
import ClerkLayout from "../../components/admin/ClerkLayout";
import TabNavigation from "../../components/admin/TabNavigation";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import EmptyState from "../../components/admin/EmptyState";
import ChatWidget from "../../components/ChatWidget";

import "./Dashboard.scss";

export default function ClerkDashboard() {
  const [sidebarTab, setSidebarTab] = useState("dashboard");
  const [activeSubTab, setActiveSubTab] = useState("enrollment");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      setIsRefreshing(true);
      try {
        const token = localStorage.getItem("token");
        const q = selectedYear ? `?academic_year=${encodeURIComponent(selectedYear)}` : "";
        const [dashboardRes, notificationsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/clerk/unit${q}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/notifications", {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        setDashboard(dashboardRes.data);
        if (!selectedYear) setSelectedYear(dashboardRes.data.academic_year);
        setNotifications(notificationsRes.data);
      } catch (err) {
        console.error("Failed to load clerk data", err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    }

    fetchData();
  }, [checkingProfile, selectedYear]);

  /* -------------------- DYNAMIC YEARS -------------------- */
  const availableYears = React.useMemo(() => {
    const years = new Set();
    if (dashboard?.academic_year) years.add(dashboard.academic_year);
    
    // Derive from upcoming retirements (assuming they represent calendar years that can start academic years)
    dashboard?.upcomingRetirements?.forEach(ret => {
      const y = ret.year;
      // We can infer YYYY-YY format. If 2026 is a retirement year, 2025-26 and 2026-27 are relevant.
      // To be safe and dynamic, we just follow the start-year pattern.
      years.add(`${y}-${String(y + 1).slice(-2)}`);
      // Also add the year before if it looks like the current year
      const prevY = y - 1;
      years.add(`${prevY}-${String(prevY + 1).slice(-2)}`);
    });
    
    return Array.from(years).sort().reverse();
  }, [dashboard]);

  /* -------------------- RENDER HELPERS -------------------- */
  
    const renderDashboardMain = () => (
      <div className="dashboard-main-view">
        <div className="section-header-pro mb-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div className="d-flex align-items-center gap-3">
              <div className="header-icon-box">
                <i className="bi bi-grid-fill text-primary"></i>
              </div>
              <div>
                <h3 className="mb-1">Institutional Overview</h3>
                <p className="text-muted small mb-0">Unit-level management for student records, financial compliance, and safety standards.</p>
              </div>
            </div>

            {/* Academic Year Selector */}
            <div className="academic-year-selector shadow-sm border rounded-pill px-3 py-2 bg-white d-flex align-items-center gap-2 transition-all">
              <i className="bi bi-calendar3 text-primary"></i>
              <span className="text-muted small fw-bold text-uppercase me-1" style={{ fontSize: '0.7rem' }}>Academic Year</span>
              <select 
                className="form-select form-select-sm border-0 bg-transparent fw-bold text-dark p-0" 
                style={{ width: 'auto', outline: 'none', boxShadow: 'none', fontSize: '0.85rem', cursor: 'pointer' }}
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
  
        <div className={`metrics-grid mb-5 transition-all ${isRefreshing ? 'opacity-50' : ''}`}>
          <div className="metric-box metric-students">
            <div className="metric-icon">
              <i className="bi bi-people"></i>
            </div>
            <div className="metric-info">
              <span className="label">TOTAL STUDENTS</span>
              <span className="value">{dashboard?.studentCount || 0}</span>
              <span className="sub-label">Unit Strength</span>
            </div>
          </div>
          <div className="metric-box metric-staff">
            <div className="metric-icon">
              <i className="bi bi-person-badge"></i>
            </div>
            <div className="metric-info">
              <span className="label">TOTAL STAFF</span>
              <span className="value">{dashboard?.teacherCount || 0}</span>
              <span className="sub-label">Faculty & Staff</span>
            </div>
          </div>
          <div className="metric-box metric-ratio">
            <div className="metric-icon">
              <i className="bi bi-calendar-check"></i>
            </div>
            <div className="metric-info">
              <span className="label">ENROLLED AY {dashboard?.academic_year}</span>
              <span className="value">{dashboard?.totals?.enrolled || 0}</span>
              <span className="sub-label">Active Admissions</span>
            </div>
          </div>
          <div className="metric-box metric-fees highlight">
            <div className="metric-icon">
              <i className="bi bi-bookmark-plus"></i>
            </div>
            <div className="metric-info">
              <span className="label">SEATS REMAINING</span>
              <span className="value">{dashboard?.totals?.seatsRemaining || 0}</span>
              <span className="sub-label">Available Capacity</span>
            </div>
          </div>
        </div>
  
        <TabNavigation
          tabs={[
            { id: "enrollment", label: "Class Enrollment Statistics", icon: "bi-table" },
            { id: "retirements", label: "Upcoming Retirements", icon: "bi-calendar3" },
          ]}
          activeTab={activeSubTab}
          onTabChange={setActiveSubTab}
        />

        <div className="tab-pane-container mt-4">
          {activeSubTab === "enrollment" && (
            <div className="row">
              <div className="col-12">
                <AdminCard header={
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-table text-primary"></i>
                    <span>Class Enrollment Statistics</span>
                  </div>
                }>
                  <TableContainer title="">
                    <div className="table-responsive professional-table">
                      <table className="table align-middle table-hover mb-0">
                        <thead>
                          <tr>
                            <th className="ps-3">Standard</th>
                            <th>Division</th>
                            <th>Capacity</th>
                            <th>Enrolled</th>
                            <th className="text-end pe-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dashboard?.classStats?.length > 0 ? (
                            dashboard.classStats.map((stat, i) => (
                              <tr key={i}>
                                <td className="ps-3 fw-bold text-dark">STD {stat.standard}</td>
                                <td><span className="badge bg-light text-dark border">{stat.division || "ALL"}</span></td>
                                <td>{stat.capacity}</td>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <span className="fw-semibold text-primary">{stat.enrolled}</span>
                                    <div className="progress flex-grow-1" style={{ height: '6px', maxWidth: '60px' }}>
                                      <div 
                                        className="progress-bar bg-primary" 
                                        style={{ width: `${(stat.enrolled / stat.capacity) * 100}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-end pe-3">
                                  <span className={`erp-badge ${stat.seatsRemaining > 0 ? 'badge-success' : 'badge-danger'}`}>
                                    {stat.seatsRemaining} Left
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center py-5 text-muted">
                                <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                                No enrollment data found for current academic year.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TableContainer>
                </AdminCard>
              </div>
            </div>
          )}

          {activeSubTab === "retirements" && (
            <div className="row">
              <div className="col-lg-8">
                <AdminCard header={
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-calendar3 text-primary"></i>
                    <span>Upcoming Retirements</span>
                  </div>
                }>
                  <div className="retirement-list p-1">
                    {dashboard?.upcomingRetirements?.length > 0 ? (
                      dashboard.upcomingRetirements.map((ret, i) => (
                        <div key={i} className="retirement-item d-flex justify-content-between align-items-center mb-3 p-3 rounded-4 border-start border-4 border-primary shadow-sm bg-white">
                          <div>
                            <span className="d-block fw-bold text-dark mb-1">Financial Year {ret.year}</span>
                            <div className="d-flex align-items-center gap-2">
                              <span className="badge bg-soft-primary text-primary">{ret.count} Staff Members</span>
                              <span className="small text-muted">Projected</span>
                            </div>
                          </div>
                          <div className="icon-circle bg-light text-primary">
                            <i className="bi bi-person-x"></i>
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptyState title="No Records" description="No upcoming retirements found in database." />
                    )}
                  </div>
                  <div className="mt-4 p-3 bg-soft-info rounded-3">
                    <p className="small text-info mb-0">
                      <i className="bi bi-info-circle me-1"></i>
                      Note: Retirement projections are based on service record data.
                    </p>
                  </div>
                </AdminCard>
              </div>
            </div>
          )}
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

      case "retirements":
        return <ManageRetirements />;

      case "addStudent":
        return <ClerkAddStudent />;

      case "capacity":
        return <CapacityManager />;

      case "fire-safety":
        return <FireSafety />;

      case "physical-safety":
        return <PhysicalSafety />;

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
