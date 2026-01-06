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
        <div className="principal-metrics-grid">
          <div className="principal-metric-card teachers">
            <div className="metric-icon">
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="metric-info">
              <span className="metric-label">{t("teachers")}</span>
              <span className="metric-value">{teacherCount || 0}</span>
            </div>
          </div>

          <div className="principal-metric-card students">
            <div className="metric-icon">
              <i className="bi bi-mortarboard-fill"></i>
            </div>
            <div className="metric-info">
              <span className="metric-label">{t("students")}</span>
              <span className="metric-value">{studentCount || 0}</span>
            </div>
          </div>

          <div className="principal-metric-card ratio">
            <div className="metric-icon_ratio">
              <i className="bi bi-pie-chart-fill"></i>
            </div>
            <div className="metric-info">
              <span className="metric-label">{t("teacher_ratio")}</span>
              <span className="metric-value">{ratio}</span>
            </div>
          </div>

          <div className="principal-metric-card budget">
            <div className="metric-icon">
              <i className="bi bi-wallet2"></i>
            </div>
            <div className="metric-info">
              <span className="metric-label">Budget Status</span>
              <span className="metric-value text-success">Active</span>
            </div>
          </div>
        </div>

        <div className="principal-sub-tabs">
          {dashboardSubTabs.map((tab) => (
            <button
              key={tab.id}
              className={`principal-sub-tab ${
                dashboardSubTab === tab.id ? "active" : ""
              }`}
              onClick={() => setDashboardSubTab(tab.id)}
            >
              <i className={`bi ${tab.icon}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="principal-sub-content">
          {dashboardSubTab === "principal_profile" && (
            <div className="modern-profile-section">
              <div className="profile-header-card">
                <div className="profile-main-info">
                  <div className="profile-avatar">
                    {principal?.full_name
                      ? principal.full_name.charAt(0).toUpperCase()
                      : "P"}
                  </div>
                  <div className="profile-name-block">
                    <h2>{principal?.full_name || "Principal"}</h2>
                    <span className="profile-badge">Senior Principal</span>
                    <p className="profile-location">
                      <i className="bi bi-geo-alt"></i>{" "}
                      {school.unit_name || "MKSSS Campus"}
                    </p>
                  </div>
                </div>
              </div>
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
    <PrincipalLayout
      activeSidebarTab={sidebarTab}
      onSidebarTabChange={setSidebarTab}
    >
      <div className="principal-dashboard-container">
        {loading ? (
          <div
            className="d-flex flex-column align-items-center justify-content-center py-5"
            style={{ minHeight: "400px" }}
          >
            <div className="spinner-grow text-primary" role="status"></div>
            <span className="mt-3 text-muted fw-bold">
              Loading Principal Portal...
            </span>
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
