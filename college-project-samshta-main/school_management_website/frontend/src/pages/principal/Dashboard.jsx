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

        const [profileRes, dashboardRes, overviewRes] =
          await Promise.all([
            axios.get("http://localhost:5000/api/principal/me", {
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
              <div className="modern-profile-section hm-context">
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
                    {/* 1. Annual Performance Metrics (Top Section - 4 Cards) */}
                    <div className="finance-card-container performance-section">
                      <div className="finance-card-header">
                        <div className="header-left">
                          <i className="bi bi-graph-up-arrow"></i>
                          <h3>Annual Performance Metrics</h3>
                        </div>
                        <div className="fy-dropdown-wrap">
                          <label>Financial Year</label>
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
                        <div className="finance-card-body">
                          <div className="row g-3">
                            <div className="col-lg-3 col-md-6">
                              <div className="finance-stat-card budget-card h-100">
                                <div className="stat-icon"><i className="bi bi-wallet2"></i></div>
                                <div className="stat-info">
                                  <span className="stat-label">Total School Budget</span>
                                  <span className="stat-subtitle">Annual fee funds</span>
                                  <span className="stat-value">₹ {(dashboardData.finance?.totalBudget || 0).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-3 col-md-6">
                              <div className="finance-stat-card spent-card h-100">
                                <div className="stat-icon"><i className="bi bi-cash-stack"></i></div>
                                <div className="stat-info">
                                  <span className="stat-label">Total Salaries Paid</span>
                                  <span className="stat-subtitle">Teacher salaries</span>
                                  <span className="stat-value text-danger">₹ {(overviewMetrics?.salarySpentFy || 0).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-3 col-md-6">
                              <div className="finance-stat-card income-card h-100">
                                <div className="stat-icon"><i className="bi bi-piggy-bank"></i></div>
                                <div className="stat-info">
                                  <span className="stat-label">Annual Income (Fees)</span>
                                  <span className="stat-subtitle">FY fee collection</span>
                                  <span className="stat-value text-success">₹ {(overviewMetrics?.feesCollectedFy || 0).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="col-lg-3 col-md-6">
                              <div className="finance-stat-card expenditure-card h-100">
                                <div className="stat-icon"><i className="bi bi-calculator"></i></div>
                                <div className="stat-info">
                                  <span className="stat-label">Annual Expenditure</span>
                                  <span className="stat-subtitle">FY salary expenses</span>
                                  <span className="stat-value text-danger">₹ {(overviewMetrics?.salarySpentFy || 0).toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                    </div>
    
                    {/* 2. Budget Summary (Bottom Section) */}
                    <div className="finance-card-container summary-section">
                      <div className="finance-card-header">
                        <div className="header-left">
                          <i className="bi bi-calculator"></i>
                          <h3>Budget & Collections Summary</h3>
                        </div>
                      </div>
                      <div className="finance-card-body">
                        <div className="row g-4 mb-4">
                          <div className="col-md-6">
                            <div className="finance-stat-card collected-card h-100">
                              <div className="stat-icon"><i className="bi bi-check-circle-fill"></i></div>
                              <div className="stat-info">
                                <span className="stat-label">Fees Successfully Collected</span>
                                <span className="stat-subtitle">Actual payments received from students</span>
                                <span className="stat-value text-success">₹ {(overviewMetrics?.feesCollectedFy || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="finance-stat-card pending-card h-100">
                              <div className="stat-icon"><i className="bi bi-exclamation-octagon-fill"></i></div>
                              <div className="stat-info">
                                <span className="stat-label">Outstanding Fees</span>
                                <span className="stat-subtitle">Fees currently due and yet to be collected</span>
                                <span className="stat-value text-warning">₹ {(dashboardData.finance?.totalFeesPending || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      <div className="balance-strip-modern">
                        <div className="balance-label-group">
                          <i className="bi bi-safe2"></i>
                          <div className="label-text">
                            <span className="main-label">Net Surplus (Fees - Salaries)</span>
                            <span className="calc-formula">
                              ₹ {(overviewMetrics?.feesCollectedFy || 0).toLocaleString()} - ₹ {(overviewMetrics?.salarySpentFy || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="balance-result">
                          <span className="equals">=</span>
                          <span className="final-amount">
                            ₹ {((overviewMetrics?.feesCollectedFy || 0) - (overviewMetrics?.salarySpentFy || 0)).toLocaleString()}
                          </span>
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
