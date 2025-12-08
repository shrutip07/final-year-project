

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

export default function PrincipalDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Sidebar state for internal tabs
  const [sidebarTab, setSidebarTab] = useState("dashboard");

  // Data loaded from backend
  const [dashboardData, setDashboardData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedFy, setSelectedFy] = useState("2024-25");
  const [fyMetrics, setFyMetrics] = useState(null);
  const [selectedOverviewFy, setSelectedOverviewFy] = useState("2024-25");
  const [overviewMetrics, setOverviewMetrics] = useState(null);

  // Loading and error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sidebar items shown
  const sidebarItems = [
    { key: "dashboard", label: t("dashboard"), icon: "bi-house" },
    { key: "profile", label: t("profile"), icon: "bi-person" },
    { key: "teachers", label: t("teachers"), icon: "bi-people" },
    { key: "students", label: t("students"), icon: "bi-person-lines-fill" },
    { key: "charts", label: t("charts"), icon: "bi-bar-chart" },
    { key: "notifications", label: t("notifications"), icon: "bi-bell" }
  ];

  useEffect(() => {
    async function fetchAllData() {
      try {
        const token = localStorage.getItem("token");
        const [profileRes, studentsRes, dashboardRes, fyRes, overviewRes] = await Promise.all([
          axios.get("http://localhost:5000/api/principal/me", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:5000/api/principal/students", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get("http://localhost:5000/api/principal/dashboard-data", {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/principal/finance-by-year?financial_year=${selectedFy}`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`http://localhost:5000/api/principal/finance-by-year?financial_year=${selectedOverviewFy}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        // If profile is incomplete, navigate to onboarding
        if (!profileRes.data.full_name) {
          navigate("/principal/onboarding");
          return;
        }

        setProfile(profileRes.data);
        setStudents(studentsRes.data);
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
    const { principal, unit, teacherCount, studentCount, finance } = dashboardData || {};

    return (
      <div>
        <h2>{t("principal_dashboard")}</h2>

        {/* Card 1: Principal Profile */}
        {principal && (
          <div style={{ 
            border: "1px solid #e0e0e0", 
            background: "#fff", 
            padding: 20, 
            marginBottom: 24, 
            borderRadius: 8,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 16, color: "#212b36" }}>{t("principal_profile")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <p><b>{t("name")}:</b> {principal.full_name}</p>
              <p><b>{t("email")}:</b> {principal.email}</p>
              <p><b>{t("phone")}:</b> {principal.phone}</p>
              <p><b>{t("qualification")}:</b> {principal.qualification}</p>
            </div>
          </div>
        )}

        {/* Card 2: Unit Details & Statistics */}
        {unit && (
          <div style={{ 
            border: "1px solid #e0e0e0", 
            background: "#fff", 
            padding: 20, 
            marginBottom: 24, 
            borderRadius: 8,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 16, color: "#212b36" }}>{t("unit_details")}</h3>
            
            {/* Key Statistics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div style={{ padding: 12, background: "#e3f2fd", borderRadius: 6, textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: 6 }}>{t("teachers")}</div>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: "#0066cc" }}>{teacherCount || 0}</div>
              </div>
              <div style={{ padding: 12, background: "#e8f5e9", borderRadius: 6, textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: 6 }}>{t("students")}</div>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: "#00aa00" }}>{studentCount || 0}</div>
              </div>
              <div style={{ padding: 12, background: "#f3e5f5", borderRadius: 6, textAlign: "center" }}>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: 6 }}>{t("teacher_ratio")}</div>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: "#7b1fa2" }}>
                  {studentCount && teacherCount ? (studentCount / teacherCount).toFixed(1) : 0}
                </div>
              </div>
            </div>

            {/* School Information */}
            <div style={{ borderTop: "1px solid #eee", paddingTop: 16 }}>
              <h4 style={{ marginTop: 0, marginBottom: 12, color: "#333", fontSize: "14px" }}>{t("school_information")}</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: "13px" }}>
                <div><b>{t("unit_name")}:</b> {unit[0]?.unit_name || "-"}</div>
                <div><b>{t("school_shift")}:</b> {unit[0]?.school_shift || "-"}</div>
                
                <div><b>SEMIS No:</b> {unit[0]?.semis_no || "-"}</div>
                <div><b>DCF No:</b> {unit[0]?.dcf_no || "-"}</div>
                
                <div><b>NMMS No:</b> {unit[0]?.nmms_no || "-"}</div>
                <div><b>{t("standard_range")}:</b> {unit[0]?.standard_range || "-"}</div>
                
                <div><b>{t("type_of_management")}:</b> {unit[0]?.type_of_management || "-"}</div>
                <div><b>{t("school_jurisdiction")}:</b> {unit[0]?.school_jurisdiction || "-"}</div>

                <div><b>{t("competent_authority")}:</b> {unit[0]?.competent_authority_name || "-"}</div>
                <div><b>{t("authority_number")}:</b> {unit[0]?.authority_number || "-"}</div>

                <div><b>{t("authority_zone")}:</b> {unit[0]?.authority_zone || "-"}</div>
                <div><b>Scholarship Code:</b> {unit[0]?.scholarship_code || "-"}</div>

                <div><b>First Grant Year:</b> {unit[0]?.first_grant_in_aid_year || "-"}</div>
                <div><b>Kendrashala Name:</b> {unit[0]?.kendrashala_name || "-"}</div>

                <div><b>Info Authority:</b> {unit[0]?.info_authority_name || "-"}</div>
                <div><b>Appellate Authority:</b> {unit[0]?.appellate_authority_name || "-"}</div>

                <div><b>Midday Meal Org:</b> {unit[0]?.midday_meal_org_name || "-"}</div>
                <div><b>Midday Meal Contact:</b> {unit[0]?.midday_meal_org_contact || "-"}</div>
              </div>
            </div>

            {/* Headmistress Information */}
            <div style={{ borderTop: "1px solid #eee", paddingTop: 16, marginTop: 16 }}>
              <h4 style={{ marginTop: 0, marginBottom: 12, color: "#333", fontSize: "14px" }}>{t("headmistress_info")}</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: "13px" }}>
                <div><b>{t("headmistress_name")}:</b> {unit[0]?.headmistress_name || "-"}</div>
                <div><b>{t("headmistress_email")}:</b> {unit[0]?.headmistress_email || "-"}</div>
                
                <div><b>{t("headmistress_phone")}:</b> {unit[0]?.headmistress_phone || "-"}</div>
              </div>
            </div>
          </div>
        )}

        {/* Card 3: Finance Overview - Selectable Financial Year */}
        {overviewMetrics && (
          <div style={{ 
            border: "1px solid #e0e0e0", 
            background: "#fff", 
            padding: 20, 
            marginBottom: 24, 
            borderRadius: 8,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ marginTop: 0, marginBottom: 0, color: "#212b36" }}>{t("finance_overview")}</h3>
              <select
                value={selectedOverviewFy}
                onChange={(e) => setSelectedOverviewFy(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  fontSize: "13px",
                  fontWeight: 500
                }}
              >
                <option value="2023-24">2023-24</option>
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ padding: 12, background: "#e8f5e9", borderRadius: 6 }}>
                <div style={{ fontSize: "13px", color: "#333", fontWeight: 500 }}>{t("total_budget")}</div>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: 6 }}>
                  {t("expected_fee_master")}
                </div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2e7d32" }}>
                  ₹ {(overviewMetrics.feesCollectedFy || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ padding: 12, background: "#fff3e0", borderRadius: 6 }}>
                <div style={{ fontSize: "13px", color: "#333", fontWeight: 500 }}>{t("total_spent")}</div>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: 6 }}>
                  {t("teacher_salary_paid")}
                </div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#f57c00" }}>
                  ₹ {(overviewMetrics.salarySpentFy || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Card 4: Finance - Balance & Collection Status (Selectable Year) */}
        {overviewMetrics && (
          <div style={{ 
            border: "1px solid #e0e0e0", 
            background: "#fff", 
            padding: 20, 
            marginBottom: 24, 
            borderRadius: 8,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ marginTop: 0, marginBottom: 0, color: "#212b36" }}>{t("budget_summary")}</h3>
              <select
                value={selectedOverviewFy}
                onChange={(e) => setSelectedOverviewFy(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  fontSize: "13px",
                  fontWeight: 500
                }}
              >
                <option value="2023-24">2023-24</option>
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ padding: 12, background: "#e8f7e6", borderRadius: 6 }}>
                <div style={{ fontSize: "13px", color: "#333", fontWeight: 500 }}>{t("fees_collected")}</div>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: 6 }}>
                  {t("actual_fees_collected")}
                </div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2e7d32" }}>
                  ₹ {(overviewMetrics.feesCollectedFy || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ padding: 12, background: "#f3e5f5", borderRadius: 6 }}>
                <div style={{ fontSize: "13px", color: "#333", fontWeight: 500 }}>{t("pending_fees")}</div>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: 6 }}>
                  {t("fees_yet_to_collect")}
                </div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#7b1fa2" }}>
                  ₹ {(overviewMetrics.salarySpentFy || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 16, padding: 12, background: "#f5f5f5", borderRadius: 6 }}>
              <div style={{ fontSize: "13px", fontWeight: 500, marginBottom: 6 }}>
                {t("balance")} ({t("collected_minus_spent")})
              </div>
              <div style={{ fontSize: "12px", color: "#666", marginBottom: 8 }}>
                ₹{(overviewMetrics.feesCollectedFy || 0).toLocaleString('en-IN')} - ₹{(overviewMetrics.salarySpentFy || 0).toLocaleString('en-IN')} = 
              </div>
              <div style={{ 
                fontSize: "28px", 
                fontWeight: "bold", 
                color: ((overviewMetrics.feesCollectedFy || 0) - (overviewMetrics.salarySpentFy || 0)) >= 0 ? "#2e7d32" : "#d32f2f"
              }}>
                ₹ {((overviewMetrics.feesCollectedFy || 0) - (overviewMetrics.salarySpentFy || 0)).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        )}

        {/* Card 5: Financial Year Metrics */}
        {fyMetrics && (
          <div style={{ 
            border: "1px solid #e0e0e0", 
            background: "#fff", 
            padding: 20, 
            marginBottom: 24, 
            borderRadius: 8,
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ marginTop: 0, marginBottom: 8, color: "#212b36" }}>
                {t("financial_year")} {fyMetrics.financial_year}
              </h4>
              <select
                value={selectedFy}
                onChange={(e) => setSelectedFy(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #ddd",
                  fontSize: "14px"
                }}
              >
                <option value="2023-24">2023-24</option>
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ padding: 16, background: "#e3f2fd", borderRadius: 8, flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: "14px", color: "#333", marginBottom: 8 }}>{t("fees_collected_in_fy")}</div>
                <div style={{ fontSize: "22px", fontWeight: "bold", color: "#1565c0" }}>
                  ₹{Number(fyMetrics.feesCollectedFy || 0).toLocaleString('en-IN')}
                </div>
              </div>
              <div style={{ padding: 16, background: "#fff3e0", borderRadius: 8, flex: 1, minWidth: 200 }}>
                <div style={{ fontSize: "14px", color: "#333", marginBottom: 8 }}>{t("salary_spent_in_fy")}</div>
                <div style={{ fontSize: "22px", fontWeight: "bold", color: "#f57c00" }}>
                  ₹{Number(fyMetrics.salarySpentFy || 0).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderStudents = () => (
    <div>
      <h3>{t("all_students")}</h3>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>{t("roll_number")}</th>
              <th>{t("name")}</th>
              <th>{t("standard")}</th>
              <th>{t("division")}</th>
              <th>{t("parent_name")}</th>
              <th>{t("parent_phone")}</th>
              <th>{t("academic_year")}</th>
              <th>{t("passed")}</th>
              <th>{t("gender")}</th>
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.student_id + "-" + student.academic_year}>
                <td>{student.roll_number}</td>
                <td>{student.full_name}</td>
                <td>{student.standard}</td>
                <td>{student.division}</td>
                <td>{student.parent_name}</td>
                <td>{student.parent_phone}</td>
                <td>{student.academic_year}</td>
                <td>{student.passed ? t("yes") : t("no")}</td>
                <td>{student.gender}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (sidebarTab) {
      case "dashboard": return renderDashboard();
      case "profile": return <Profile />;
      case "teachers": return <Teachers />;
      case "students": return renderStudents();
      case "charts": return <Charts unitId={dashboardData?.principal?.unit_id} />;
      case "notifications": return <PrincipalNotificationsPage />;
      default: return <div>{t("select_tab")}</div>;
    }
  };

  if (loading) return <div>{t("loading")}...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, backgroundColor: "#212b36", color: "white", paddingTop: 24 }}>
        <div style={{ paddingLeft: 16, paddingBottom: 12, fontWeight: "bold", fontSize: 18 }}>
          <i className="bi bi-grid-3x3-gap me-2" /> {t("principal_portal")}
        </div>
        <nav style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
          {sidebarItems.map(item => (
            <button
              key={item.key}
              onClick={() => setSidebarTab(item.key)}
              style={{
                background: sidebarTab === item.key ? "#2a3b4d" : "transparent",
                color: sidebarTab === item.key ? "#0dcaf0" : "#fff",
                textAlign: "left",
                padding: "12px 20px",
                fontSize: "1rem",
                border: "none",
                borderLeft: sidebarTab === item.key ? "4px solid #0dcaf0" : "none",
                cursor: "pointer"
              }}
            >
              <i className={`bi me-2 ${item.icon}`}></i> {item.label}
            </button>
          ))}
        </nav>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
          style={{ margin: 16, padding: 12, background: "transparent", color: "red", border: "none", cursor: "pointer", textAlign: "left", fontWeight: "bold" }}
        >
          <i className="bi bi-box-arrow-right me-2"></i> {t("logout")}
        </button>
        <div style={{ padding: "0 16px 16px 16px", fontSize: "12px", color: "#ccc" }}>
          © {new Date().getFullYear()} {t("school_principal")}
        </div>
      </aside>
      {/* Main Content */}
      <main style={{ flexGrow: 1, padding: 24, overflowY: "auto" }}>
        {renderContent()}
      </main>
      <ChatWidget />
    </div>
  );
}
