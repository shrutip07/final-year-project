import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import Profile from "./Profile";
import Teachers from "./Teachers";
import Students from "./Students";
import Charts from "./Charts";
import PrincipalNotificationsPage from "./PrincipalNotificationsPage";
import ChatWidget from "../../components/ChatWidget";
import PageHeader from "../../components/admin/PageHeader";
import AdminCard from "../../components/admin/AdminCard";
import "../admin/Dashboard.scss";

export default function PrincipalDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [sidebarTab, setSidebarTab] = useState("dashboard");
  const [dashboardSubTab, setDashboardSubTab] = useState("principal_profile0");
  const [dashboardData, setDashboardData] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedOverviewFy, setSelectedOverviewFy] = useState("2024-25");
  const [overviewMetrics, setOverviewMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sidebarItems = [
    { key: "dashboard", label: t("dashboard"), icon: "bi-speedometer2" },
    { key: "profile", label: t("profile"), icon: "bi-person-circle" },
    { key: "teachers", label: t("teachers"), icon: "bi-people" },
    { key: "students", label: t("students"), icon: "bi-mortarboard" },
    { key: "charts", label: t("charts"), icon: "bi-graph-up" },
    { key: "notifications", label: t("notifications"), icon: "bi-bell" },
  ];

  useEffect(() => {
    async function fetchAllData() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

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
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
          ]);

        if (!profileRes.data.full_name) {
          navigate("/principal/onboarding");
          return;
        }

        setStudents(studentsRes.data || []);
        setDashboardData(dashboardRes.data);
        setOverviewMetrics(overviewRes.data);
      } catch (err) {
        if (err.response?.status === 404) {
          navigate("/principal/onboarding");
        } else {
          setError(
            err.response?.data?.message || t("failed_load_profile")
          );
        }
      } finally {
        setLoading(false);
      }
    }

    fetchAllData();
  }, [navigate, t, selectedOverviewFy]);

  const renderDashboard = () => {
    if (!dashboardData) return null;

    const { principal, unit, teacherCount, studentCount } = dashboardData;
    const school =
      Array.isArray(unit) && unit.length > 0 ? unit[0] : {};
    const ratio =
      studentCount && teacherCount
        ? (studentCount / teacherCount).toFixed(1)
        : 0;

    const dashboardSubTabs = [
      { id: "principal_profile", label: "Principal Profile", icon: "bi-person-badge" },
      { id: "headmistress_info", label: "Headmistress Info", icon: "bi-person-workspace" },
      { id: "unit_details", label: "Unit Details", icon: "bi-building-check" },
      { id: "finance_overview", label: "Finance Overview", icon: "bi-cash-stack" },
    ];

    return (
      <div className="principal-tab-content">
        <div className="metrics-grid mb-4">
          <div className="metric-box metric-teachers-blue">
            <span className="label">{t("teachers")}</span>
            <span className="value">{teacherCount || 0}</span>
            <i className="bi bi-people-fill watermark"></i>
          </div>

          <div className="metric-box metric-students-green">
            <span className="label">{t("students")}</span>
            <span className="value">{studentCount || 0}</span>
            <i className="bi bi-mortarboard-fill watermark"></i>
          </div>

          <div className="metric-box metric-ratio-amber">
            <span className="label">{t("teacher_ratio")}</span>
            <span className="value">{ratio}</span>
            <i className="bi bi-pie-chart-fill watermark"></i>
          </div>

          <div className="metric-box metric-budget-teal">
            <span className="label">Budget Status</span>
            <span className="value">Active</span>
            <i className="bi bi-wallet2 watermark"></i>
          </div>
        </div>

        <div className="principal-tabs-container">
          <div className="tab-navigation-bar">
            {dashboardSubTabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-item ${
                  dashboardSubTab === tab.id ? "active" : ""
                }`}
                onClick={() => setDashboardSubTab(tab.id)}
              >
                <i className={`bi ${tab.icon}`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="principal-sub-content">
          {dashboardSubTab === "principal_profile" && (
            <div className="profile-card-wide">
              <div className="profile-left">
                <div className="profile-avatar-large">
                  {principal?.full_name ? principal.full_name.charAt(0).toUpperCase() : "P"}
                </div>
                <h3>{principal?.full_name || "Principal"}</h3>
                <span className="designation-badge">Senior Principal</span>
              </div>
              <div className="profile-right">
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">Email Address</span>
                    <span className="value">{principal?.email || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Phone Number</span>
                    <span className="value">{principal?.phone || "-"}</span>
                  </div>
                  <div className="divider" />
                  <div className="detail-item">
                    <span className="label">Education</span>
                    <span className="value">{principal?.qualification || "M.A. B.Ed"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Experience</span>
                    <span className="value">15+ Years</span>
                  </div>
                  <div className="divider" />
                  <div className="detail-item">
                    <span className="label">Joined Date</span>
                    <span className="value">{principal?.joining_date || "2015-06-15"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Assigned Unit</span>
                    <span className="value">{school.unit_name || "MKSSS Branch"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {dashboardSubTab === "headmistress_info" && (
            <div className="profile-card-wide">
              <div className="profile-left" style={{ background: "linear-gradient(135deg, #00A9A5 0%, #0057D9 100%)" }}>
                <div className="profile-avatar-large">
                  {school.headmistress_name ? school.headmistress_name.charAt(0).toUpperCase() : "H"}
                </div>
                <h3>{school.headmistress_name || "Headmistress"}</h3>
                <span className="designation-badge" style={{ background: "#FFC145", color: "#002E6D" }}>School Head</span>
              </div>
              <div className="profile-right">
                <div className="details-grid">
                  <div className="detail-item">
                    <span className="label">Designation</span>
                    <span className="value text-primary fw-bold">Headmistress</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Administrative Role</span>
                    <span className="value">Operational Lead</span>
                  </div>
                  <div className="divider" />
                  <div className="detail-item">
                    <span className="label">Full Name</span>
                    <span className="value">{school.headmistress_name || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Contact Info</span>
                    <span className="value">Available via Office</span>
                  </div>
                  <div className="divider" />
                  <div className="detail-item">
                    <span className="label">Branch Name</span>
                    <span className="value">{school.unit_name || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Unit ID</span>
                    <span className="value">{school.unit_id || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {dashboardSubTab === "unit_details" && (
            <AdminCard header="Institutional Unit Details">
              <div className="overview-info-strip">
                <div className="info-item">
                  <span className="label">Unit Name</span>
                  <span className="value">{school.unit_name || "-"}</span>
                </div>
                <div className="info-item">
                  <span className="label">SEMIS NO</span>
                  <span className="value">{school.semis_no || "-"}</span>
                </div>
                <div className="info-item">
                  <span className="label">Standard Range</span>
                  <span className="value">{school.standard_range || "-"}</span>
                </div>
                <div className="info-item">
                  <span className="label">School Shift</span>
                  <span className="value">{school.school_shift || "-"}</span>
                </div>
              </div>
              <div className="mt-4">
                 <div className="row">
                   <div className="col-md-6 mb-3">
                      <div className="p-3 border rounded bg-light">
                        <span className="d-block small text-muted fw-bold mb-1">KENDRA SHALA</span>
                        <span className="fw-bold">{school.kendrashala_name || "-"}</span>
                      </div>
                   </div>
                   <div className="col-md-6 mb-3">
                      <div className="p-3 border rounded bg-light">
                        <span className="d-block small text-muted fw-bold mb-1">FISCAL YEAR</span>
                        <span className="fw-bold">{school.fiscal_year || "2024-25"}</span>
                      </div>
                   </div>
                 </div>
              </div>
            </AdminCard>
          )}

          {dashboardSubTab === "finance_overview" && (
            <div className="finance-overview-section">
              <AdminCard 
                header={
                  <div className="finance-card-header">
                    <span>Finance Overview</span>
                    <select
                      value={selectedOverviewFy}
                      onChange={(e) => setSelectedOverviewFy(e.target.value)}
                      className="form-select form-select-sm"
                      style={{ width: '150px' }}
                    >
                      <option value="2023-24">2023-24</option>
                      <option value="2024-25">2024-25</option>
                      <option value="2025-26">2025-26</option>
                    </select>
                  </div>
                }
              >
                <div className="finance-grid-2">
                  <div className="finance-metric-card">
                    <span className="title">Total Budget</span>
                    <span className="subtitle">Expected sum from fee_master table</span>
                    <span className="amount">₹{(overviewMetrics?.feesCollectedFy || 0).toLocaleString()}</span>
                  </div>
                  <div className="finance-metric-card">
                    <span className="title">Total Spent</span>
                    <span className="subtitle">Teacher salaries paid this year</span>
                    <span className="amount">₹{(overviewMetrics?.salarySpentFy || 0).toLocaleString()}</span>
                  </div>
                </div>
              </AdminCard>

              <AdminCard 
                header={
                  <div className="finance-card-header">
                    <span>Budget Summary</span>
                  </div>
                }
              >
                <div className="finance-grid-2">
                  <div className="finance-metric-card">
                    <span className="title">Fees Collected</span>
                    <span className="subtitle">Actual fees received from students</span>
                    <span className="amount text-success">₹{(overviewMetrics?.feesCollectedFy || 0).toLocaleString()}</span>
                  </div>
                  <div className="finance-metric-card">
                    <span className="title">Pending Fees</span>
                    <span className="subtitle">Fees yet to be collected</span>
                    <span className="amount text-danger">₹{((overviewMetrics?.feesCollectedFy || 0) * 0.1).toLocaleString()}</span>
                  </div>
                </div>
                <div className="balance-strip">
                  <div className="d-flex flex-column">
                    <span className="text">Balance (Fees Collected minus Salary Spent)</span>
                    <span className="calculation">₹{(overviewMetrics?.feesCollectedFy || 0).toLocaleString()} - ₹{(overviewMetrics?.salarySpentFy || 0).toLocaleString()} =</span>
                  </div>
                  <span className="amount">₹{((overviewMetrics?.feesCollectedFy || 0) - (overviewMetrics?.salarySpentFy || 0)).toLocaleString()}</span>
                </div>
              </AdminCard>

              <AdminCard 
                header={
                  <div className="finance-card-header">
                    <span>Financial Year Metrics {selectedOverviewFy}</span>
                  </div>
                }
              >
                <div className="finance-grid-2">
                  <div className="finance-metric-card">
                    <span className="title">Fees Collected in FY</span>
                    <span className="amount">₹{(overviewMetrics?.feesCollectedFy || 0).toLocaleString()}</span>
                  </div>
                  <div className="finance-metric-card">
                    <span className="title">Salary Spent in FY</span>
                    <span className="amount">₹{(overviewMetrics?.salarySpentFy || 0).toLocaleString()}</span>
                  </div>
                </div>
              </AdminCard>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (sidebarTab) {
      case "dashboard":
        return renderDashboard();
      case "profile":
        return (
          <div className="principal-tab-content">
            <div className="principal-admin-card">
              <div className="card-header">
                <h4>{t("profile")}</h4>
              </div>
              <div className="card-body">
                <Profile />
              </div>
            </div>
          </div>
        );
      case "teachers":
        return (
          <div className="principal-tab-content">
            <div className="principal-admin-card">
              <div className="card-header">
                <h4>{t("teachers")}</h4>
              </div>
              <div className="card-body">
                <Teachers />
              </div>
            </div>
          </div>
        );
      case "students":
        return (
          <div className="principal-tab-content">
            <div className="principal-admin-card">
              <div className="card-header">
                <h4>{t("students")}</h4>
              </div>
              <div className="card-body">
                <Students />
              </div>
            </div>
          </div>
        );
      case "charts":
        return (
          <div className="principal-tab-content">
            <div className="principal-admin-card">
              <div className="card-header">
                <h4>{t("charts")}</h4>
              </div>
              <div className="card-body">
                <Charts unitId={dashboardData?.principal?.unit_id} />
              </div>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="principal-tab-content">
            <div className="principal-admin-card">
              <div className="card-header">
                <h4>{t("notifications")}</h4>
              </div>
              <div className="card-body">
                <PrincipalNotificationsPage />
              </div>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="dashboard-container d-flex">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="app-icon">
            <i className="bi bi-mortarboard-fill" />
          </div>
          <h3>{t("principal_portal")}</h3>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              className={`nav-link ${sidebarTab === item.key ? "active" : ""}`}
              onClick={() => setSidebarTab(item.key)}
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="nav-link logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            <i className="bi bi-box-arrow-left"></i>
            <span>{t("logout")}</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">{t("loading")}...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger m-4">{error}</div>
        ) : (
          renderContent()
        )}
      </main>

      <ChatWidget />
    </div>
  );
}
