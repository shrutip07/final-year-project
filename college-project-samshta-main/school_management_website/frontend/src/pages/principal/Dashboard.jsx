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

import PrincipalLayout from "../../components/principal/PrincipalLayout";
import AdminCard from "../../components/admin/AdminCard";
import "./Dashboard.scss";

export default function PrincipalDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [sidebarTab, setSidebarTab] = useState("dashboard");
  const [dashboardData, setDashboardData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedFy, setSelectedFy] = useState("2024-25");
  const [fyMetrics, setFyMetrics] = useState(null);
  const [selectedOverviewFy, setSelectedOverviewFy] = useState("2024-25");
  const [overviewMetrics, setOverviewMetrics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAllData() {
      try {
        const token = localStorage.getItem("token");
        const [profileRes, studentsRes, dashboardRes, fyRes, overviewRes] =
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
              `http://localhost:5000/api/principal/finance-by-year?financial_year=${selectedFy}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            ),
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

        setProfile(profileRes.data);
        setStudents(studentsRes.data || []);
        setDashboardData(dashboardRes.data);
        setFyMetrics(fyRes.data);
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
  }, [navigate, t, selectedFy, selectedOverviewFy]);

  const renderDashboard = () => {
    if (!dashboardData) return null;

    const { principal, unit, teacherCount, studentCount } = dashboardData;
    const school = Array.isArray(unit) && unit.length > 0 ? unit[0] : {};
    const ratio = studentCount && teacherCount ? (studentCount / teacherCount).toFixed(1) : 0;

    return (
      <div className="principal-tab-content">
        <div className="principal-welcome-banner">
          <div className="welcome-text">
            <h2>Welcome, Principal 👋</h2>
            <p>MKSSS Dashboard</p>
          </div>
        </div>

        <div className="principal-metrics-grid">
          <div className="principal-metric-card teachers">
            <span className="metric-label">{t("teachers")}</span>
            <span className="metric-value">{teacherCount || 0}</span>
          </div>
          <div className="principal-metric-card students">
            <span className="metric-label">{t("students")}</span>
            <span className="metric-value">{studentCount || 0}</span>
          </div>
          <div className="principal-metric-card ratio">
            <span className="metric-label">{t("teacher_ratio")}</span>
            <span className="metric-value">{ratio}</span>
          </div>
          <div className="principal-metric-card budget">
            <span className="metric-label">Budget Status</span>
            <span className="metric-value">Active</span>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <div className="principal-admin-card">
              <div className="card-header">
                <h4>{t("principal_profile")}</h4>
                <i className="bi bi-person-badge text-primary"></i>
              </div>
              <div className="card-body">
                <div className="principal-details-grid single-column">
                  <div className="detail-item">
                    <span className="detail-key">{t("name")}</span>
                    <span className="detail-value">{principal?.full_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-key">{t("email")}</span>
                    <span className="detail-value">{principal?.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-key">{t("phone")}</span>
                    <span className="detail-value">{principal?.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-key">{t("qualification")}</span>
                    <span className="detail-value">{principal?.qualification}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="principal-admin-card">
              <div className="card-header">
                <h4>{t("headmistress_info")}</h4>
                <i className="bi bi-person-workspace text-accent"></i>
              </div>
              <div className="card-body">
                <div className="principal-details-grid single-column">
                  <div className="detail-item">
                    <span className="detail-key">{t("headmistress_name")}</span>
                    <span className="detail-value">{school.headmistress_name || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-key">{t("headmistress_email")}</span>
                    <span className="detail-value">{school.headmistress_email || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-key">{t("headmistress_phone")}</span>
                    <span className="detail-value">{school.headmistress_phone || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="principal-admin-card">
          <div className="card-header">
            <h4>{t("unit_details")}</h4>
            <i className="bi bi-building text-primary"></i>
          </div>
          <div className="card-body">
            <div className="principal-details-grid">
              <div className="detail-item">
                <span className="detail-key">{t("unit_name")}</span>
                <span className="detail-value">{school.unit_name || "-"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-key">SEMIS No</span>
                <span className="detail-value">{school.semis_no || "-"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-key">{t("school_shift")}</span>
                <span className="detail-value">{school.school_shift || "-"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-key">{t("standard_range")}</span>
                <span className="detail-value">{school.standard_range || "-"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-key">Management</span>
                <span className="detail-value">{school.type_of_management || "-"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-key">Jurisdiction</span>
                <span className="detail-value">{school.school_jurisdiction || "-"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderFinance = () => (
    <div className="principal-tab-content">
      <div className="principal-admin-card">
        <div className="card-header">
          <h4>Finance Insights</h4>
          <select
            value={selectedOverviewFy}
            onChange={(e) => setSelectedOverviewFy(e.target.value)}
            className="form-select form-select-sm w-auto"
          >
            <option value="2023-24">2023-24</option>
            <option value="2024-25">2024-25</option>
            <option value="2025-26">2025-26</option>
          </select>
        </div>
        <div className="card-body">
          <div className="principal-finance-grid">
            <div className="finance-card budget">
              <span className="label">Budget Summary</span>
              <span className="value">₹ {(overviewMetrics?.feesCollectedFy || 0).toLocaleString()}</span>
              <span className="sub">Expected Fees</span>
            </div>
            <div className="finance-card collected">
              <span className="label">Fees Collected</span>
              <span className="value">₹ {(overviewMetrics?.feesCollectedFy || 0).toLocaleString()}</span>
              <span className="sub">Actual Amount</span>
            </div>
            <div className="finance-card pending">
              <span className="label">Pending Fees</span>
              <span className="value">₹ {( (overviewMetrics?.feesCollectedFy || 0) * 0.1).toLocaleString()}</span>
              <span className="sub">To be Collected</span>
            </div>
            <div className="finance-card spent">
              <span className="label">Salary Spent</span>
              <span className="value">₹ {(overviewMetrics?.salarySpentFy || 0).toLocaleString()}</span>
              <span className="sub">Total Payroll</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfile = () => (
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

  const renderTeachers = () => (
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

  const renderStudents = () => (
    <div className="principal-tab-content">
      <div className="principal-admin-card">
        <div className="card-header">
          <h4>{t("students")}</h4>
        </div>
        <div className="card-body">
          <Students students={students} />
        </div>
      </div>
    </div>
  );

  const renderCharts = () => (
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

  const renderNotifications = () => (
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

  const renderContent = () => {
    switch (sidebarTab) {
      case "dashboard":
        return renderDashboard();
      case "profile":
        return renderProfile();
      case "teachers":
        return renderTeachers();
      case "students":
        return renderStudents();
      case "charts":
        return renderCharts();
      case "notifications":
        return renderNotifications();
      case "finance":
        return renderFinance();
      default:
        return renderDashboard();
    }
  };

  return (
    <PrincipalLayout
      activeSidebarTab={sidebarTab}
      onSidebarTabChange={setSidebarTab}
    >
      <div className="principal-dashboard-container">
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <div className="spinner-grow text-primary" role="status"></div>
            <span className="mt-3 text-muted fw-bold">Loading Principal Portal...</span>
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
    </PrincipalLayout>
  );
}
