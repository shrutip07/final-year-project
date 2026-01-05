import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

// Components
import Profile from "./Profile";
import Teachers from "./Teachers";
import Students from "./Students";
import Charts from "./Charts";
import PrincipalNotificationsPage from "./PrincipalNotificationsPage";
import ChatWidget from "../../components/ChatWidget";

import PrincipalLayout from "../../components/principal/PrincipalLayout";
import AdminCard from "../../components/admin/AdminCard";
import "./Dashboard.scss";

export default function PrincipalDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSubTab, setActiveSubTab] = useState("principal_profile");
  
  const [dashboardData, setDashboardData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedOverviewFy, setSelectedOverviewFy] = useState("2024-25");
  const [overviewMetrics, setOverviewMetrics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========= DATA LOAD =========
  useEffect(() => {
    async function fetchAllData() {
      try {
        const token = localStorage.getItem("token");
        const [profileRes, studentsRes, dashboardRes, overviewRes] =
          await Promise.all([
            axios.get("http://localhost:5000/api/principal/me", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:5000/api/principal/students", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get("http://localhost:5000/api/principal/dashboard-data", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(
              `http://localhost:5000/api/principal/finance-by-year?financial_year=${selectedOverviewFy}`,
              { headers: { Authorization: `Bearer ${token}` } }
            ),
          ]);

        if (!profileRes.data.full_name) {
          navigate("/principal/onboarding");
          return;
        }

        setProfile(profileRes.data);
        setStudents(studentsRes.data || []);
        setDashboardData(dashboardRes.data);
        setOverviewMetrics(overviewRes.data);
      } catch (err) {
        if (err.response?.status === 404) {
          navigate("/principal/onboarding");
        } else {
          setError(err.response?.data?.message || t("failed_load_profile"));
        }
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, [navigate, t, selectedOverviewFy]);

  // ========= DASHBOARD SUB-TABS RENDERERS =========

  const renderPrincipalProfile = () => {
    const { principal } = dashboardData || {};
    return (
      <div className="sub-tab-content">
        <AdminCard header="Principal Profile">
          <div className="profile-modern-card">
            <div className="profile-avatar-large">
              {principal?.full_name?.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info-grid">
              <div className="profile-item">
                <div className="label">Name</div>
                <div className="value">{principal?.full_name || "-"}</div>
              </div>
              <div className="profile-item">
                <div className="label">Email</div>
                <div className="value">{principal?.email || "-"}</div>
              </div>
              <div className="profile-item">
                <div className="label">Phone</div>
                <div className="value">{principal?.phone || "-"}</div>
              </div>
              <div className="profile-item">
                <div className="label">Qualification</div>
                <div className="value">{principal?.qualification || "-"}</div>
              </div>
            </div>
          </div>
        </AdminCard>
      </div>
    );
  };

  const renderHeadmistressInfo = () => {
    const { unit } = dashboardData || {};
    const school = Array.isArray(unit) && unit.length > 0 ? unit[0] : {};
    return (
      <div className="sub-tab-content">
        <AdminCard header="Headmistress Information">
          <div className="profile-modern-card" style={{ borderLeft: '5px solid #0057D9' }}>
            <div className="profile-avatar-large" style={{ backgroundColor: '#0057D9' }}>
              {school.headmistress_name?.charAt(0).toUpperCase() || "H"}
            </div>
            <div className="profile-info-grid">
              <div className="profile-item">
                <div className="label">Headmistress Name</div>
                <div className="value">{school.headmistress_name || "-"}</div>
              </div>
              <div className="profile-item">
                <div className="label">Headmistress Email</div>
                <div className="value">{school.headmistress_email || "-"}</div>
              </div>
              <div className="profile-item">
                <div className="label">Headmistress Phone</div>
                <div className="value">{school.headmistress_phone || "-"}</div>
              </div>
              <div className="profile-item">
                <div className="label">Designation</div>
                <div className="value">Headmistress</div>
              </div>
            </div>
          </div>
        </AdminCard>
      </div>
    );
  };

  const renderUnitDetails = () => {
    const { unit } = dashboardData || {};
    const school = Array.isArray(unit) && unit.length > 0 ? unit[0] : {};
    return (
      <div className="sub-tab-content">
        <AdminCard header="Unit Details">
          <div className="unit-details-modern-grid">
            <div className="info-tile blue">
              <div className="info-label">Unit Name</div>
              <div className="info-value">{school.unit_name || "-"}</div>
            </div>
            <div className="info-tile indigo">
              <div className="info-label">SEMIS No</div>
              <div className="info-value">{school.semis_no || "-"}</div>
            </div>
            <div className="info-tile teal">
              <div className="info-label">School Shift</div>
              <div className="info-value">{school.school_shift || "-"}</div>
            </div>
            <div className="info-tile violet">
              <div className="info-label">Management</div>
              <div className="info-value">{school.management || "MKSSS"}</div>
            </div>
            <div className="info-tile amber">
              <div className="info-label">Standard Range</div>
              <div className="info-value">{school.standard_range || "-"}</div>
            </div>
            <div className="info-tile green">
              <div className="info-label">Jurisdiction</div>
              <div className="info-value">{school.jurisdiction || "-"}</div>
            </div>
          </div>
        </AdminCard>
      </div>
    );
  };

  const renderFinanceOverview = () => {
    if (!overviewMetrics) return null;
    const collected = overviewMetrics.feesCollectedFy || 0;
    const spent = overviewMetrics.salarySpentFy || 0;
    const pending = Math.floor(collected * 0.12);
    const budget = collected + pending;

    return (
      <div className="sub-tab-content">
        <AdminCard 
          header={
            <div className="d-flex justify-content-between align-items-center w-100">
              <span>Finance Overview</span>
              <div className="d-flex align-items-center gap-2">
                <span className="small fw-bold text-muted">FY:</span>
                <select
                  value={selectedOverviewFy}
                  onChange={(e) => setSelectedOverviewFy(e.target.value)}
                  className="form-select form-select-sm"
                  style={{ width: '110px' }}
                >
                  <option value="2023-24">2023-24</option>
                  <option value="2024-25">2024-25</option>
                  <option value="2025-26">2025-26</option>
                </select>
              </div>
            </div>
          }
        >
          <div className="finance-overview-grid">
            <div className="finance-card-pro budget">
              <div className="fin-label">Total Budget</div>
              <div className="fin-value">₹ {budget.toLocaleString()}</div>
              <div className="fin-sub">Annual Allocation</div>
            </div>
            <div className="finance-card-pro collected">
              <div className="fin-label">Fees Collected</div>
              <div className="fin-value">₹ {collected.toLocaleString()}</div>
              <div className="fin-sub">Realized Revenue</div>
            </div>
            <div className="finance-card-pro pending">
              <div className="fin-label">Balance / Pending</div>
              <div className="fin-value">₹ {pending.toLocaleString()}</div>
              <div className="fin-sub">Expected Recovery</div>
            </div>
            <div className="finance-card-pro spent">
              <div className="fin-label">Total Spent</div>
              <div className="fin-value">₹ {spent.toLocaleString()}</div>
              <div className="fin-sub">Total Expenses</div>
            </div>
          </div>
        </AdminCard>
      </div>
    );
  };

  // ========= MAIN RENDERER =========

  const renderDashboard = () => {
    if (!dashboardData) return null;

    const { teacherCount, studentCount } = dashboardData;
    const ratio = studentCount && teacherCount ? (studentCount / teacherCount).toFixed(1) : 0;

    return (
      <div className="principal-page-inner">
        <div className="section-header-pro">
          <h3>Dashboard Overview</h3>
          <p>School metrics and administrative highlights</p>
        </div>

        {/* HERO METRICS - Colorful and Admin-style */}
        <div className="metrics-grid-modern">
          <div className="metric-card teachers">
            <span className="metric-label">Total Teachers</span>
            <span className="metric-value">{teacherCount || 0}</span>
            <i className="bi bi-people metric-icon"></i>
          </div>
          <div className="metric-card students">
            <span className="metric-label">Total Students</span>
            <span className="metric-value">{studentCount || 0}</span>
            <i className="bi bi-mortarboard metric-icon"></i>
          </div>
          <div className="metric-card ratio">
            <span className="metric-label">Teacher-Student Ratio</span>
            <span className="metric-value">{ratio}</span>
            <i className="bi bi-graph-up-arrow metric-icon"></i>
          </div>
          <div className="metric-card status">
            <span className="metric-label">Budget Status</span>
            <span className="metric-value">Healthy</span>
            <i className="bi bi-check-circle metric-icon"></i>
          </div>
        </div>

        {/* DASHBOARD SUB-TABS */}
        <div className="sub-tabs-nav">
          <button 
            className={`sub-tab-item ${activeSubTab === "principal_profile" ? "active" : ""}`}
            onClick={() => setActiveSubTab("principal_profile")}
          >
            <i className="bi bi-person-badge"></i> Principal Profile
          </button>
          <button 
            className={`sub-tab-item ${activeSubTab === "headmistress_info" ? "active" : ""}`}
            onClick={() => setActiveSubTab("headmistress_info")}
          >
            <i className="bi bi-person-workspace"></i> Headmistress Information
          </button>
          <button 
            className={`sub-tab-item ${activeSubTab === "unit_details" ? "active" : ""}`}
            onClick={() => setActiveSubTab("unit_details")}
          >
            <i className="bi bi-building"></i> Unit Details
          </button>
          <button 
            className={`sub-tab-item ${activeSubTab === "finance_overview" ? "active" : ""}`}
            onClick={() => setActiveSubTab("finance_overview")}
          >
            <i className="bi bi-cash-stack"></i> Finance Overview
          </button>
        </div>

        <div className="sub-tab-container">
          {activeSubTab === "principal_profile" && renderPrincipalProfile()}
          {activeSubTab === "headmistress_info" && renderHeadmistressInfo()}
          {activeSubTab === "unit_details" && renderUnitDetails()}
          {activeSubTab === "finance_overview" && renderFinanceOverview()}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "profile":
        return (
          <div className="principal-page-inner">
            <div className="section-header-pro">
              <h3>Principal Profile</h3>
              <p>Manage your personal and professional information</p>
            </div>
            <Profile />
          </div>
        );
      case "teachers":
        return (
          <div className="principal-page-inner">
            <div className="section-header-pro">
              <h3>Staff Directory</h3>
              <p>Comprehensive list of all teachers in this unit</p>
            </div>
            <Teachers />
          </div>
        );
      case "students":
        return (
          <div className="principal-page-inner">
            <div className="section-header-pro">
              <h3>Student Registry</h3>
              <p>Official enrollment records for the current academic cycle</p>
            </div>
            <Students students={students} />
          </div>
        );
      case "charts":
        return (
          <div className="principal-page-inner">
            <div className="section-header-pro">
              <h3>Analytics Dashboard</h3>
              <p>Visual representation of school performance and trends</p>
            </div>
            <Charts unitId={dashboardData?.principal?.unit_id} />
          </div>
        );
      case "notifications":
        return (
          <div className="principal-page-inner">
            <div className="section-header-pro">
              <h3>Official Notifications</h3>
              <p>Internal communication and announcements hub</p>
            </div>
            <PrincipalNotificationsPage />
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <PrincipalLayout
      activeSidebarTab={activeTab}
      onSidebarTabChange={setActiveTab}
    >
      <div className="principal-portal-redesign">
        <div className="principal-dashboard-wrapper">
          {loading ? (
            <div className="d-flex flex-column align-items-center justify-content-center py-5">
              <div className="spinner-grow text-primary" role="status"></div>
              <span className="mt-3 text-muted fw-bold">Syncing Principal Portal...</span>
            </div>
          ) : error ? (
            <div className="alert alert-danger m-4" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          ) : (
            renderContent()
          )}
        </div>
        <ChatWidget />
      </div>
    </PrincipalLayout>
  );
}
