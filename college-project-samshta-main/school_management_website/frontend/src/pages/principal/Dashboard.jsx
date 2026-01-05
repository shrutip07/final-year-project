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

  // ========= DATA LOAD =========
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

  // ========= DASHBOARD (HOME) =========
  const renderDashboard = () => {
    if (!dashboardData) return null;

    const { principal, unit, teacherCount, studentCount } =
      dashboardData || {};

    const school = Array.isArray(unit) && unit.length > 0 ? unit[0] : {};

    const ratio =
      studentCount && teacherCount
        ? (studentCount / teacherCount).toFixed(1)
        : 0;

    return (
      <div className="principal-page-inner">
        <div className="principal-section-header">
          <h3>{t("principal_dashboard")}</h3>
          <p>{t("school_overview")}</p>
        </div>

        {/* HERO METRICS */}
        <div className="principal-metrics-grid">
          <div className="principal-metric-box principal-metric-teachers">
            <span className="principal-metric-label">{t("total_teachers")}</span>
            <span className="principal-metric-value">{teacherCount || 0}</span>
          </div>
            <div className="principal-metric-box principal-metric-students">
              <span className="principal-metric-label">{t("total_students")}</span>
              <span className="principal-metric-value">{studentCount || 0}</span>
            </div>
              <div className="principal-metric-box principal-metric-ratio">
                <span className="principal-metric-label">{t("teacher_student_ratio")}</span>
                <span className="principal-metric-value">{ratio}</span>
              </div>
            <div className="principal-metric-box principal-metric-finance">
            <span className="principal-metric-label">{t("budget_status")}</span>
            <span className="principal-metric-value">Healthy</span>
          </div>
        </div>

        <div className="principal-layout-grid">
            <div className="principal-card">
              <div className="principal-card-header">
                <h4>{t("institutional_details")}</h4>
                <i className="bi bi-building text-primary"></i>
              </div>
              <div className="principal-card-body">
                <div className="principal-details-grid">
                  <div className="principal-details-row">
                    <span className="principal-details-key">{t("unit_name")}</span>
                    <span className="principal-details-value">{school.unit_name || "-"}</span>
                  </div>
                  <div className="principal-details-row">
                    <span className="principal-details-key">SEMIS No</span>
                    <span className="principal-details-value">{school.semis_no || "-"}</span>
                  </div>
                  <div className="principal-details-row">
                    <span className="principal-details-key">{t("school_shift")}</span>
                    <span className="principal-details-value">{school.school_shift || "-"}</span>
                  </div>
                  <div className="principal-details-row">
                    <span className="principal-details-key">{t("standard_range")}</span>
                    <span className="principal-details-value">{school.standard_range || "-"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="principal-card">
              <div className="principal-card-header">
                <h4>{t("leadership_overview")}</h4>
                <i className="bi bi-person-workspace text-accent"></i>
              </div>
              <div className="principal-card-body">
                <div className="principal-details-grid">
                  <div className="principal-details-row">
                    <span className="principal-details-key">{t("principal")}</span>
                    <span className="principal-details-value">{principal?.full_name}</span>
                  </div>
                  <div className="principal-details-row">
                    <span className="principal-details-key">{t("headmistress")}</span>
                    <span className="principal-details-value">{school.headmistress_name || "-"}</span>
                  </div>
                  <div className="principal-details-row">
                    <span className="principal-details-key">{t("qualification")}</span>
                    <span className="principal-details-value">{principal?.qualification || "-"}</span>
                  </div>
                  <div className="principal-details-row">
                    <span className="principal-details-key">{t("status")}</span>
                    <span className="principal-details-value">
                        <span className="erp-badge badge-success">Active</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    );
  };

  const renderFinance = () => {
    if (!overviewMetrics) return null;
    const collected = overviewMetrics.feesCollectedFy || 0;
    const spent = overviewMetrics.salarySpentFy || 0;
    const pending = Math.floor(collected * 0.12); // Placeholder logic
    const budget = collected + pending;

    return (
      <div className="principal-page-inner">
        <div className="principal-section-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3>{t("financial_dashboard")}</h3>
              <p>{t("monitor_unit_finances")}</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="small fw-bold text-muted">{t("academic_year")}</span>
              <select
                value={selectedOverviewFy}
                onChange={(e) => setSelectedOverviewFy(e.target.value)}
                className="form-select form-select-sm"
                style={{ width: '130px' }}
              >
                <option value="2023-24">2023-24</option>
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
              </select>
            </div>
          </div>
        </div>

        <div className="principal-finance-grid">
          <div className="principal-finance-item budget">
            <span className="label">Budget Summary</span>
            <span className="value">₹ {budget.toLocaleString()}</span>
            <span className="sub">Annual Allocation</span>
          </div>
          <div className="principal-finance-item collected">
            <span className="label">Fees Collected</span>
            <span className="value">₹ {collected.toLocaleString()}</span>
            <span className="sub">Realized Revenue</span>
          </div>
          <div className="principal-finance-item pending">
            <span className="label">Pending Fees</span>
            <span className="value">₹ {pending.toLocaleString()}</span>
            <span className="sub">Expected Recovery</span>
          </div>
          <div className="principal-finance-item spent">
            <span className="label">Salary Spent</span>
            <span className="value">₹ {spent.toLocaleString()}</span>
            <span className="sub">Total Payroll</span>
          </div>
        </div>

        <div className="principal-card">
          <div className="principal-card-header">
            <h4>Fiscal Health Status</h4>
            <i className="bi bi-shield-check text-success"></i>
          </div>
          <div className="principal-card-body">
            <div className="principal-balance-strip">
              <span className="principal-balance-label">Current Net Balance</span>
              <span className={`principal-balance-value ${
                collected - spent >= 0 ? "principal-balance-positive" : "principal-balance-negative"
              }`}>
                ₹ {(collected - spent).toLocaleString()}
              </span>
            </div>
            
            <div className="mt-4">
                <p className="text-muted small">
                    <i className="bi bi-info-circle me-1"></i>
                    This financial snapshot is based on the selected academic year: <strong>{selectedOverviewFy}</strong>. 
                    All values are subject to audit and verification by the central MKSSS finance office.
                </p>
            </div>
          </div>
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
          <div className="principal-page-inner">
            <div className="principal-section-header">
              <h3>{t("principal_profile")}</h3>
              <p>{t("manage_personal_information")}</p>
            </div>
            <Profile />
          </div>
        );
      case "teachers":
        return (
          <div className="principal-page-inner">
            <div className="principal-section-header">
              <h3>{t("teachers")}</h3>
              <p>{t("staff_directory_management")}</p>
            </div>
            <Teachers />
          </div>
        );
      case "students":
        return (
          <div className="principal-page-inner">
            <div className="principal-section-header">
              <h3>{t("students")}</h3>
              <p>{t("student_enrollment_records")}</p>
            </div>
            <Students students={students} />
          </div>
        );
      case "finance":
        return renderFinance();
      case "charts":
        return (
          <div className="principal-page-inner">
            <div className="principal-section-header">
              <h3>{t("analytics_dashboard")}</h3>
              <p>{t("visualize_school_performance")}</p>
            </div>
            <Charts unitId={dashboardData?.principal?.unit_id} />
          </div>
        );
      case "notifications":
        return (
          <div className="principal-page-inner">
            <div className="principal-section-header">
              <h3>{t("official_notifications")}</h3>
              <p>{t("communication_hub")}</p>
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
      activeSidebarTab={sidebarTab}
      onSidebarTabChange={setSidebarTab}
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
