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
import TabNavigation from "../../components/admin/TabNavigation";
import "../admin/Dashboard.scss";

import PrincipalLayout from "../../components/principal/PrincipalLayout";

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
          <div className="metric-box metric-teachers-blue text-center">
            <span className="label fw-bold text-uppercase">{t("teachers")}</span>
            <span className="value d-block my-2">{teacherCount || 0}</span>
            <i className="bi bi-people-fill watermark"></i>
          </div>

          <div className="metric-box metric-students-green text-center">
            <span className="label fw-bold text-uppercase">{t("students")}</span>
            <span className="value d-block my-2">{studentCount || 0}</span>
            <i className="bi bi-mortarboard-fill watermark"></i>
          </div>

          <div className="metric-box metric-ratio-amber text-center">
            <span className="label fw-bold text-uppercase">{t("teacher_ratio")}</span>
            <span className="value d-block my-2">{ratio}</span>
            <i className="bi bi-pie-chart-fill watermark"></i>
          </div>

          <div className="metric-box metric-budget-teal text-center">
            <span className="label fw-bold text-uppercase">Budget Status</span>
            <span className="value d-block my-2">Active</span>
            <i className="bi bi-wallet2 watermark"></i>
          </div>
        </div>

        <div className="principal-tabs-container mb-4">
          <TabNavigation
            tabs={dashboardSubTabs}
            activeTab={dashboardSubTab}
            onTabChange={setDashboardSubTab}
          />
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
                    <span className="label text-muted small text-uppercase">Email Address</span>
                    <span className="value fw-bold text-dark">{principal?.email || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label text-muted small text-uppercase">Phone Number</span>
                    <span className="value fw-bold text-dark">{principal?.phone || "-"}</span>
                  </div>
                  <div className="divider" />
                  <div className="detail-item">
                    <span className="label text-muted small text-uppercase">Education</span>
                    <span className="value fw-bold text-dark">{principal?.qualification || "M.A. B.Ed"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label text-muted small text-uppercase">Experience</span>
                    <span className="value fw-bold text-dark">15+ Years</span>
                  </div>
                  <div className="divider" />
                  <div className="detail-item">
                    <span className="label text-muted small text-uppercase">Joined Date</span>
                    <span className="value fw-bold text-dark">{principal?.joining_date || "2015-06-15"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label text-muted small text-uppercase">Assigned Unit</span>
                    <span className="value fw-bold text-dark">{school.unit_name || "MKSSS Branch"}</span>
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
                    <span className="label text-muted small text-uppercase">Designation</span>
                    <span className="value fw-bold text-primary">Headmistress</span>
                  </div>
                  <div className="detail-item">
                    <span className="label text-muted small text-uppercase">Administrative Role</span>
                    <span className="value fw-bold text-dark">Operational Lead</span>
                  </div>
                  <div className="divider" />
                  <div className="detail-item">
                    <span className="label text-muted small text-uppercase">Full Name</span>
                    <span className="value fw-bold text-dark">{school.headmistress_name || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label text-muted small text-uppercase">Contact Info</span>
                    <span className="value fw-bold text-dark">Available via Office</span>
                  </div>
                  <div className="divider" />
                  <div className="detail-item">
                    <span className="label text-muted small text-uppercase">Branch Name</span>
                    <span className="value fw-bold text-dark">{school.unit_name || "-"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label text-muted small text-uppercase">Unit ID</span>
                    <span className="value fw-bold text-dark">{school.unit_id || "-"}</span>
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
                    <div className="finance-card-header d-flex align-items-center justify-content-between w-100">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-wallet2 me-2 text-primary"></i>
                        <span className="fw-bold">Institutional Finance Overview</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted small fw-bold">Financial Year:</span>
                        <select
                          value={selectedOverviewFy}
                          onChange={(e) => setSelectedOverviewFy(e.target.value)}
                          className="form-select form-select-sm"
                          style={{ width: '120px', borderRadius: '8px' }}
                        >
                          <option value="2023-24">2023-24</option>
                          <option value="2024-25">2024-25</option>
                          <option value="2025-26">2025-26</option>
                        </select>
                      </div>
                    </div>
                  }
                >
                  <div className="finance-grid-3">
                    <div className="finance-metric-card finance-blue">
                      <div className="metric-icon">
                        <i className="bi bi-piggy-bank"></i>
                      </div>
                      <div className="metric-info">
                        <span className="title">Total Budget</span>
                        <span className="amount">₹{(overviewMetrics?.feesCollectedFy || 0).toLocaleString()}</span>
                        <span className="subtitle">Expected Annual Revenue</span>
                      </div>
                    </div>
                    <div className="finance-metric-card finance-red">
                      <div className="metric-icon">
                        <i className="bi bi-cash-stack"></i>
                      </div>
                      <div className="metric-info">
                        <span className="title">Total Spent</span>
                        <span className="amount">₹{(overviewMetrics?.salarySpentFy || 0).toLocaleString()}</span>
                        <span className="subtitle">Staff Salary Expenditure</span>
                      </div>
                    </div>
                    <div className="finance-metric-card finance-green">
                      <div className="metric-icon">
                        <i className="bi bi-graph-up-arrow"></i>
                      </div>
                      <div className="metric-info">
                        <span className="title">Current Balance</span>
                        <span className="amount">₹{((overviewMetrics?.feesCollectedFy || 0) - (overviewMetrics?.salarySpentFy || 0)).toLocaleString()}</span>
                        <span className="subtitle">Net Surplus/Deficit</span>
                      </div>
                    </div>
                  </div>
                </AdminCard>
  
                <AdminCard 
                  header={
                    <div className="finance-card-header d-flex align-items-center">
                      <i className="bi bi-pie-chart me-2 text-primary"></i>
                      <span className="fw-bold">Fee Collection Summary</span>
                    </div>
                  }
                >
                  <div className="finance-grid-2 mb-4">
                    <div className="finance-metric-card finance-teal">
                      <div className="metric-icon">
                        <i className="bi bi-check2-circle"></i>
                      </div>
                      <div className="metric-info">
                        <span className="title">Fees Collected</span>
                        <span className="amount">₹{(overviewMetrics?.feesCollectedFy || 0).toLocaleString()}</span>
                        <span className="subtitle">Actual amount received</span>
                      </div>
                    </div>
                    <div className="finance-metric-card finance-amber">
                      <div className="metric-icon">
                        <i className="bi bi-clock-history"></i>
                      </div>
                      <div className="metric-info">
                        <span className="title">Pending Fees</span>
                        <span className="amount">₹{((overviewMetrics?.feesCollectedFy || 0) * 0.1).toLocaleString()}</span>
                        <span className="subtitle">Estimated outstanding</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="balance-strip-professional">
                    <div className="strip-left">
                      <div className="formula-badge">Net Institutional Balance</div>
                      <div className="formula-text">
                        <span>Total Fees Collected</span>
                        <i className="bi bi-dash mx-2"></i>
                        <span>Total Salary Spent</span>
                      </div>
                    </div>
                    <div className="strip-center">
                       <div className="values">
                         ₹{(overviewMetrics?.feesCollectedFy || 0).toLocaleString()} - ₹{(overviewMetrics?.salarySpentFy || 0).toLocaleString()}
                       </div>
                    </div>
                    <div className="strip-right">
                      <div className="equals-sign">=</div>
                      <div className="final-amount">
                        ₹{((overviewMetrics?.feesCollectedFy || 0) - (overviewMetrics?.salarySpentFy || 0)).toLocaleString()}
                      </div>
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
            <Profile isSubComponent={true} />
          </div>
        );
      case "teachers":
        return (
          <div className="principal-tab-content">
            <Teachers isSubComponent={true} />
          </div>
        );
      case "students":
        return (
          <div className="principal-tab-content">
            <Students isSubComponent={true} />
          </div>
        );
      case "charts":
        return (
          <div className="principal-tab-content">
            <Charts isSubComponent={true} unitId={dashboardData?.principal?.unit_id} />
          </div>
        );
      case "notifications":
        return (
          <div className="principal-tab-content">
            <PrincipalNotificationsPage isSubComponent={true} />
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
      <div className="dashboard-wrapper">
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <div className="spinner-grow text-primary" role="status"></div>
            <span className="mt-3 text-muted fw-bold">Syncing Dashboard Data...</span>
          </div>
        ) : error ? (
          <div className="alert alert-custom-danger d-flex align-items-center m-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-3 fs-3"></i>
            <div>
              <div className="fw-bold">Configuration Error</div>
              {error}
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </div>
      <ChatWidget />
    </PrincipalLayout>
  );
}
