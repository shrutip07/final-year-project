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
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedFy, setSelectedFy] = useState("2024-25");
  const [selectedOverviewFy, setSelectedOverviewFy] = useState("2024-25");
  const [overviewMetrics, setOverviewMetrics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      { id: "finance_overview", label: "Finance Overview", icon: "bi-cash-stack" },
      { id: "unit_details", label: "Unit Details", icon: "bi-building-check" },
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
              <span className="metric-value">Active</span>
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
            <div className="principal-info-section">
              <div className="info-header">
                <div className="info-avatar">
                  {principal?.full_name ? principal.full_name.charAt(0).toUpperCase() : "P"}
                </div>
                <div className="info-title">
                  <h3>{principal?.full_name || "Principal"}</h3>
                  <span className="role-badge">Principal</span>
                </div>
              </div>
              <div className="info-cards-grid">
                <div className="info-card">
                  <div className="info-card-icon"><i className="bi bi-envelope-fill"></i></div>
                  <div className="info-card-content">
                    <span className="info-label">Email Address</span>
                    <span className="info-value">{principal?.email || "-"}</span>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-card-icon"><i className="bi bi-telephone-fill"></i></div>
                  <div className="info-card-content">
                    <span className="info-label">Phone Number</span>
                    <span className="info-value">{principal?.phone || "-"}</span>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-card-icon"><i className="bi bi-award-fill"></i></div>
                  <div className="info-card-content">
                    <span className="info-label">Qualification</span>
                    <span className="info-value">{principal?.qualification || "-"}</span>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-card-icon"><i className="bi bi-building"></i></div>
                  <div className="info-card-content">
                    <span className="info-label">Unit Name</span>
                    <span className="info-value">{school.unit_name || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {dashboardSubTab === "headmistress_info" && (
            <div className="principal-info-section">
              <div className="info-header">
                <div className="info-avatar hm">
                  {school.headmistress_name ? school.headmistress_name.charAt(0).toUpperCase() : "H"}
                </div>
                <div className="info-title">
                  <h3>{school.headmistress_name || "Headmistress"}</h3>
                  <span className="role-badge hm">Headmistress</span>
                </div>
              </div>
              <div className="info-cards-grid">
                <div className="info-card hm">
                  <div className="info-card-icon"><i className="bi bi-envelope-fill"></i></div>
                  <div className="info-card-content">
                    <span className="info-label">Email Address</span>
                    <span className="info-value">{school.headmistress_email || "-"}</span>
                  </div>
                </div>
                <div className="info-card hm">
                  <div className="info-card-icon"><i className="bi bi-telephone-fill"></i></div>
                  <div className="info-card-content">
                    <span className="info-label">Phone Number</span>
                    <span className="info-value">{school.headmistress_phone || "-"}</span>
                  </div>
                </div>
                <div className="info-card hm">
                  <div className="info-card-icon"><i className="bi bi-hash"></i></div>
                  <div className="info-card-content">
                    <span className="info-label">SEMIS No</span>
                    <span className="info-value">{school.semis_no || "-"}</span>
                  </div>
                </div>
                <div className="info-card hm">
                  <div className="info-card-icon"><i className="bi bi-clock-fill"></i></div>
                  <div className="info-card-content">
                    <span className="info-label">School Shift</span>
                    <span className="info-value">{school.school_shift || "-"}</span>
                  </div>
                </div>
              </div>

              <div className="school-details-strip">
                <div className="strip-item">
                  <span className="strip-label">Standard Range</span>
                  <span className="strip-value">{school.standard_range || "-"}</span>
                </div>
                <div className="strip-item">
                  <span className="strip-label">Management Type</span>
                  <span className="strip-value">{school.type_of_management || "-"}</span>
                </div>
                <div className="strip-item">
                  <span className="strip-label">Jurisdiction</span>
                  <span className="strip-value">{school.school_jurisdiction || "-"}</span>
                </div>
              </div>
            </div>
          )}

          {dashboardSubTab === "unit_details" && (
            <div className="principal-info-section">
              <div className="info-header">
                <div className="info-avatar">
                  <i className="bi bi-building-check"></i>
                </div>
                <div className="info-title">
                  <h3>{school.unit_name || "Unit Details"}</h3>
                  <span className="role-badge">Institution Info</span>
                </div>
              </div>
              
              <div className="unit-details-grid">
                <div className="unit-section">
                  <div className="section-title">General Information</div>
                  <div className="detail-row">
                    <span className="label">Kendrashala Name</span>
                    <span className="value">{school.kendrashala_name || "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">SEMIS No</span>
                    <span className="value">{school.semis_no || "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">DCF No</span>
                    <span className="value">{school.dcf_no || "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">NMMS No</span>
                    <span className="value">{school.nmms_no || "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">School Jurisdiction</span>
                    <span className="value">{school.school_jurisdiction || "-"}</span>
                  </div>
                </div>

                <div className="unit-section">
                  <div className="section-title">Authority Details</div>
                  <div className="detail-row">
                    <span className="label">Competent Authority</span>
                    <span className="value">{school.competent_authority_name || "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Authority Number</span>
                    <span className="value">{school.competent_authority_no || "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Authority Zone</span>
                    <span className="value">{school.competent_authority_zone || "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Info Authority</span>
                    <span className="value">{school.info_authority || "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Appellate Authority</span>
                    <span className="value">{school.appellate_authority || "-"}</span>
                  </div>
                </div>

                <div className="unit-section">
                  <div className="section-title">Midday Meal & Scholarship</div>
                  <div className="detail-row">
                    <span className="label">Midday Meal Org</span>
                    <span className="value">{school.midday_meal_org || "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Midday Meal Contact</span>
                    <span className="value">{school.midday_meal_contact || "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Scholarship Code</span>
                    <span className="value">{school.scholarship_code || "-"}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">First Grant Year</span>
                    <span className="value">{school.first_grant_year || "-"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {dashboardSubTab === "finance_overview" && (
            <div className="principal-finance-section">
              <div className="finance-section-card">
                <div className="finance-header">
                  <h4>Finance Overview</h4>
                  <div className="header-right">
                    <span className="fy-label">Financial Year</span>
                    <select
                      value={selectedOverviewFy}
                      onChange={(e) => setSelectedOverviewFy(e.target.value)}
                      className="form-select form-select-sm"
                    >
                      <option value="2023-24">2023-24</option>
                      <option value="2024-25">2024-25</option>
                      <option value="2025-26">2025-26</option>
                    </select>
                  </div>
                </div>
                <div className="finance-cards-row">
                  <div className="finance-card budget">
                    <div className="finance-icon"><i className="bi bi-wallet2"></i></div>
                    <div className="finance-info">
                      <span className="finance-label">Total Budget</span>
                      <span className="finance-value">₹ {(dashboardData.finance.total_budget || 0).toLocaleString()}</span>
                      <span className="finance-sub">Expected sum from fee_master table</span>
                    </div>
                  </div>
                  <div className="finance-card spent">
                    <div className="finance-icon"><i className="bi bi-credit-card-fill"></i></div>
                    <div className="finance-info">
                      <span className="finance-label">Total Spent</span>
                      <span className="finance-value">₹ {(dashboardData.finance.total_spent || 0).toLocaleString()}</span>
                      <span className="finance-sub">Teacher salaries paid this year</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="finance-section-card mt-4">
                <div className="finance-header">
                  <h4>Budget Summary</h4>
                  <select
                    value={selectedOverviewFy}
                    onChange={(e) => setSelectedOverviewFy(e.target.value)}
                    className="form-select form-select-sm"
                  >
                    <option value="2023-24">2023-24</option>
                    <option value="2024-25">2024-25</option>
                    <option value="2025-26">2025-26</option>
                  </select>
                </div>
                <div className="finance-cards-row">
                  <div className="finance-card collected">
                    <div className="finance-icon"><i className="bi bi-check-circle-fill"></i></div>
                    <div className="finance-info">
                      <span className="finance-label">Fees Collected</span>
                      <span className="finance-value">₹ {(overviewMetrics?.feesCollectedFy || 0).toLocaleString()}</span>
                      <span className="finance-sub">Actual fees received from students</span>
                    </div>
                  </div>
                  <div className="finance-card pending">
                    <div className="finance-icon"><i className="bi bi-hourglass-split"></i></div>
                    <div className="finance-info">
                      <span className="finance-label">Pending Fees</span>
                      <span className="finance-value">₹ {(dashboardData.finance.totalFeesPending || 0).toLocaleString()}</span>
                      <span className="finance-sub">Fees yet to be collected</span>
                    </div>
                  </div>
                </div>
                <div className="finance-balance-strip mt-3">
                  <div className="balance-calc">
                    <span className="calc-label">Balance (Fees Collected minus Salary Spent)</span>
                    <span className="calc-details">
                      ₹ {(overviewMetrics?.feesCollectedFy || 0).toLocaleString()} - ₹ {(overviewMetrics?.salarySpentFy || 0).toLocaleString()} = 
                    </span>
                  </div>
                  <span className="balance-result">
                    ₹ {((overviewMetrics?.feesCollectedFy || 0) - (overviewMetrics?.salarySpentFy || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="finance-section-card mt-4">
                <div className="finance-header">
                  <h4>Financial Year {selectedOverviewFy}</h4>
                  <select
                    value={selectedOverviewFy}
                    onChange={(e) => setSelectedOverviewFy(e.target.value)}
                    className="form-select form-select-sm"
                  >
                    <option value="2023-24">2023-24</option>
                    <option value="2024-25">2024-25</option>
                    <option value="2025-26">2025-26</option>
                  </select>
                </div>
                <div className="finance-cards-row">
                  <div className="finance-card collected-fy">
                    <div className="finance-icon"><i className="bi bi-calendar-check"></i></div>
                    <div className="finance-info">
                      <span className="finance-label">Fees Collected in FY</span>
                      <span className="finance-value">₹ {(overviewMetrics?.feesCollectedFy || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="finance-card spent-fy">
                    <div className="finance-icon"><i className="bi bi-cash-stack"></i></div>
                    <div className="finance-info">
                      <span className="finance-label">Salary Spent in FY</span>
                      <span className="finance-value">₹ {(overviewMetrics?.salarySpentFy || 0).toLocaleString()}</span>
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
            <div className="finance-cards-grid">
              <div className="finance-card budget">
                <div className="finance-icon"><i className="bi bi-piggy-bank-fill"></i></div>
                <div className="finance-info">
                  <span className="finance-label">Budget Summary</span>
                  <span className="finance-value">₹ {(overviewMetrics?.feesCollectedFy || 0).toLocaleString()}</span>
                  <span className="finance-sub">Expected Fees</span>
                </div>
              </div>
              <div className="finance-card collected">
                <div className="finance-icon"><i className="bi bi-check-circle-fill"></i></div>
                <div className="finance-info">
                  <span className="finance-label">Fees Collected</span>
                  <span className="finance-value">₹ {(overviewMetrics?.feesCollectedFy || 0).toLocaleString()}</span>
                  <span className="finance-sub">Actual Amount</span>
                </div>
              </div>
              <div className="finance-card pending">
                <div className="finance-icon"><i className="bi bi-hourglass-split"></i></div>
                <div className="finance-info">
                  <span className="finance-label">Pending Fees</span>
                  <span className="finance-value">₹ {((overviewMetrics?.feesCollectedFy || 0) * 0.1).toLocaleString()}</span>
                  <span className="finance-sub">To be Collected</span>
                </div>
              </div>
              <div className="finance-card spent">
                <div className="finance-icon"><i className="bi bi-credit-card-fill"></i></div>
                <div className="finance-info">
                  <span className="finance-label">Salary Spent</span>
                  <span className="finance-value">₹ {(overviewMetrics?.salarySpentFy || 0).toLocaleString()}</span>
                  <span className="finance-sub">Total Payroll</span>
                </div>
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
