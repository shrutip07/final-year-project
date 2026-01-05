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
import "./Dashboard.scss";

export default function PrincipalDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [sidebarTab, setSidebarTab] = useState("dashboard");
  const [dashboardSubTab, setDashboardSubTab] = useState("principal_profile");
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
          setError(err.response?.data?.message || t("failed_load_profile"));
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
    const school = Array.isArray(unit) && unit.length > 0 ? unit[0] : {};
    const ratio = studentCount && teacherCount ? (studentCount / teacherCount).toFixed(1) : 0;

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
            <div className="metric-icon"><i className="bi bi-people-fill"></i></div>
            <div className="metric-info">
              <span className="metric-label">{t("teachers")}</span>
              <span className="metric-value">{teacherCount || 0}</span>
            </div>
          </div>
          <div className="principal-metric-card students">
            <div className="metric-icon"><i className="bi bi-mortarboard-fill"></i></div>
            <div className="metric-info">
              <span className="metric-label">{t("students")}</span>
              <span className="metric-value">{studentCount || 0}</span>
            </div>
          </div>
          <div className="principal-metric-card ratio">
            <div className="metric-icon"><i className="bi bi-pie-chart-fill"></i></div>
            <div className="metric-info">
              <span className="metric-label">{t("teacher_ratio")}</span>
              <span className="metric-value">{ratio}</span>
            </div>
          </div>
          <div className="principal-metric-card budget">
            <div className="metric-icon"><i className="bi bi-wallet2"></i></div>
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
              className={`principal-sub-tab ${dashboardSubTab === tab.id ? "active" : ""}`}
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
                    {principal?.full_name ? principal.full_name.charAt(0).toUpperCase() : "P"}
                  </div>
                  <div className="profile-name-block">
                    <h2>{principal?.full_name || "Principal"}</h2>
                    <span className="profile-badge">Senior Principal</span>
                    <p className="profile-location"><i className="bi bi-geo-alt"></i> {school.unit_name || "MKSSS Campus"}</p>
                  </div>
                </div>
                <div className="profile-quick-actions">
                  <button className="btn btn-outline-primary btn-sm"><i className="bi bi-pencil"></i> Edit Profile</button>
                </div>
              </div>

              <div className="profile-details-grid">
                <div className="detail-card">
                  <div className="detail-icon"><i className="bi bi-envelope-at"></i></div>
                  <div className="detail-text">
                    <label>Official Email</label>
                    <span>{principal?.email || "-"}</span>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon"><i className="bi bi-phone-vibrate"></i></div>
                  <div className="detail-text">
                    <label>Contact Number</label>
                    <span>{principal?.phone || "-"}</span>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon"><i className="bi bi-mortarboard"></i></div>
                  <div className="detail-text">
                    <label>Academic Qualification</label>
                    <span>{principal?.qualification || "-"}</span>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon"><i className="bi bi-building-gear"></i></div>
                  <div className="detail-text">
                    <label>Assigned Unit</label>
                    <span>{school.unit_name || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {dashboardSubTab === "headmistress_info" && (
            <div className="modern-profile-section">
              <div className="profile-header-card hm-theme">
                <div className="profile-main-info">
                  <div className="profile-avatar hm">
                    {school.headmistress_name ? school.headmistress_name.charAt(0).toUpperCase() : "H"}
                  </div>
                  <div className="profile-name-block">
                    <h2>{school.headmistress_name || "Headmistress"}</h2>
                    <span className="profile-badge hm">Headmistress</span>
                    <p className="profile-location"><i className="bi bi-shield-lock"></i> SEMIS: {school.semis_no || "-"}</p>
                  </div>
                </div>
              </div>

              <div className="profile-details-grid">
                <div className="detail-card">
                  <div className="detail-icon"><i className="bi bi-envelope"></i></div>
                  <div className="detail-text">
                    <label>Email Address</label>
                    <span>{school.headmistress_email || "-"}</span>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon"><i className="bi bi-telephone"></i></div>
                  <div className="detail-text">
                    <label>Phone Number</label>
                    <span>{school.headmistress_phone || "-"}</span>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon"><i className="bi bi-clock-history"></i></div>
                  <div className="detail-text">
                    <label>School Shift</label>
                    <span>{school.school_shift || "-"}</span>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon"><i className="bi bi-journal-text"></i></div>
                  <div className="detail-text">
                    <label>Management</label>
                    <span>{school.type_of_management || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="modern-info-strip">
                <div className="strip-box">
                  <label>Standard Range</label>
                  <span>{school.standard_range || "-"}</span>
                </div>
                <div className="divider"></div>
                <div className="strip-box">
                  <label>Jurisdiction</label>
                  <span>{school.school_jurisdiction || "-"}</span>
                </div>
                <div className="divider"></div>
                <div className="strip-box">
                  <label>Medium</label>
                  <span>{school.school_medium || "-"}</span>
                </div>
              </div>
            </div>
          )}

          {dashboardSubTab === "unit_details" && (
            <div className="modern-unit-grid">
              <div className="unit-card primary">
                <div className="unit-card-header">
                  <div className="icon-wrap"><i className="bi bi-info-square-fill"></i></div>
                  <h3>General Information</h3>
                </div>
                <div className="unit-card-body">
                  <div className="data-row">
                    <span className="label">Kendrashala</span>
                    <span className="value">{school.kendrashala_name || "-"}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">SEMIS No</span>
                    <span className="value highlight">{school.semis_no || "-"}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">DCF No</span>
                    <span className="value">{school.dcf_no || "-"}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">NMMS No</span>
                    <span className="value">{school.nmms_no || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="unit-card accent">
                <div className="unit-card-header">
                  <div className="icon-wrap"><i className="bi bi-shield-shaded"></i></div>
                  <h3>Authority Details</h3>
                </div>
                <div className="unit-card-body">
                  <div className="data-row">
                    <span className="label">Competent Auth</span>
                    <span className="value fw-bold">{school.competent_authority_name || "-"}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">Auth Number</span>
                    <span className="value">{school.competent_authority_no || "-"}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">Auth Zone</span>
                    <span className="value">{school.competent_authority_zone || "-"}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">Appellate Auth</span>
                    <span className="value">{school.appellate_authority || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="unit-card success">
                <div className="unit-card-header">
                  <div className="icon-wrap"><i className="bi bi-box2-heart-fill"></i></div>
                  <h3>Welfare & Grants</h3>
                </div>
                <div className="unit-card-body">
                  <div className="data-row">
                    <span className="label">Midday Meal Org</span>
                    <span className="value">{school.midday_meal_org || "-"}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">Meal Contact</span>
                    <span className="value">{school.midday_meal_contact || "-"}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">Scholarship Code</span>
                    <span className="value">{school.scholarship_code || "-"}</span>
                  </div>
                  <div className="data-row">
                    <span className="label">First Grant Year</span>
                    <span className="value">{school.first_grant_year || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {dashboardSubTab === "finance_overview" && (
            <div className="modern-finance-section">
              <div className="finance-top-bar">
                <div className="title-area">
                  <h3>Financial Analytics</h3>
                  <p>Comprehensive overview of school finances for {selectedOverviewFy}</p>
                </div>
                <div className="filter-area">
                  <label>Selected FY:</label>
                  <select
                    value={selectedOverviewFy}
                    onChange={(e) => setSelectedOverviewFy(e.target.value)}
                    className="form-select finance-select"
                  >
                    <option value="2023-24">2023-24</option>
                    <option value="2024-25">2024-25</option>
                    <option value="2025-26">2025-26</option>
                  </select>
                </div>
              </div>

              <div className="finance-main-grid">
                <div className="finance-stat-card primary">
                  <div className="stat-icon"><i className="bi bi-bank"></i></div>
                  <div className="stat-content">
                    <label>Total Budgeted</label>
                    <div className="stat-value">₹ {(dashboardData.finance?.totalBudget || 0).toLocaleString()}</div>
                    <div className="stat-progress">
                      <div className="progress-bar" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="finance-stat-card warning">
                  <div className="stat-icon"><i className="bi bi-cash-stack"></i></div>
                  <div className="stat-content">
                    <label>Fees Collected</label>
                    <div className="stat-value">₹ {(overviewMetrics?.feesCollectedFy || 0).toLocaleString()}</div>
                    <div className="stat-progress">
                      <div className="progress-bar" style={{ width: `${Math.min(100, (overviewMetrics?.feesCollectedFy / dashboardData.finance?.totalBudget) * 100 || 0)}%` }}></div>
                    </div>
                    <span className="stat-sub">{((overviewMetrics?.feesCollectedFy / dashboardData.finance?.totalBudget) * 100 || 0).toFixed(1)}% of total budget</span>
                  </div>
                </div>

                <div className="finance-stat-card danger">
                  <div className="stat-icon"><i className="bi bi-person-lines-fill"></i></div>
                  <div className="stat-content">
                    <label>Salary Expenditure</label>
                    <div className="stat-value">₹ {(overviewMetrics?.salarySpentFy || 0).toLocaleString()}</div>
                    <div className="stat-progress">
                      <div className="progress-bar" style={{ width: `${Math.min(100, (overviewMetrics?.salarySpentFy / overviewMetrics?.feesCollectedFy) * 100 || 0)}%` }}></div>
                    </div>
                    <span className="stat-sub">{((overviewMetrics?.salarySpentFy / overviewMetrics?.feesCollectedFy) * 100 || 0).toFixed(1)}% of collected fees</span>
                  </div>
                </div>
              </div>

              <div className="finance-summary-block">
                <div className="summary-card">
                  <h4>Net Balance Status</h4>
                  <div className="balance-display">
                    <div className="balance-item">
                      <label>Collected</label>
                      <span className="plus">+ ₹ {(overviewMetrics?.feesCollectedFy || 0).toLocaleString()}</span>
                    </div>
                    <div className="balance-operator"><i className="bi bi-dash-lg"></i></div>
                    <div className="balance-item">
                      <label>Spent (Salary)</label>
                      <span className="minus">- ₹ {(overviewMetrics?.salarySpentFy || 0).toLocaleString()}</span>
                    </div>
                    <div className="balance-operator"><i className="bi bi-pause-fill rotate-90"></i></div>
                    <div className="balance-item result">
                      <label>Net Surplus</label>
                      <span className="total">₹ {((overviewMetrics?.feesCollectedFy || 0) - (overviewMetrics?.salarySpentFy || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="summary-info-cards">
                  <div className="mini-card">
                    <i className="bi bi-hourglass-split"></i>
                    <div>
                      <label>Outstanding Fees</label>
                      <span>₹ {(dashboardData.finance?.totalFeesPending || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mini-card success">
                    <i className="bi bi-check2-all"></i>
                    <div>
                      <label>Budget Status</label>
                      <span>Balanced</span>
                    </div>
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
              <div className="card-header"><h4>{t("profile")}</h4></div>
              <div className="card-body"><Profile /></div>
            </div>
          </div>
        );
      case "teachers":
        return (
          <div className="principal-tab-content">
            <div className="principal-admin-card">
              <div className="card-header"><h4>{t("teachers")}</h4></div>
              <div className="card-body"><Teachers /></div>
            </div>
          </div>
        );
      case "students":
        return (
          <div className="principal-tab-content">
            <div className="principal-admin-card">
              <div className="card-header"><h4>{t("students")}</h4></div>
              <div className="card-body"><Students /></div>
            </div>
          </div>
        );
      case "charts":
        return (
          <div className="principal-tab-content">
            <div className="principal-admin-card">
              <div className="card-header"><h4>{t("charts")}</h4></div>
              <div className="card-body"><Charts unitId={dashboardData?.principal?.unit_id} /></div>
            </div>
          </div>
        );
      case "notifications":
        return (
          <div className="principal-tab-content">
            <div className="principal-admin-card">
              <div className="card-header"><h4>{t("notifications")}</h4></div>
              <div className="card-body"><PrincipalNotificationsPage /></div>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <PrincipalLayout activeSidebarTab={sidebarTab} onSidebarTabChange={setSidebarTab}>
      <div className="principal-dashboard-container">
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '400px' }}>
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
