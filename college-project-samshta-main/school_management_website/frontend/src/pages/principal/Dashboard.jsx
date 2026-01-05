// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import axios from "axios";

// import Profile from "./Profile";
// import Teachers from "./Teachers";
// import Students from "./Students";
// import Charts from "./Charts";
// import PrincipalNotificationsPage from "./PrincipalNotificationsPage";
// import ChatWidget from "../../components/ChatWidget";

// // ✅ Reuse the same UI components + styles as Admin
// import PageHeader from "../../components/admin/PageHeader";
// import AdminCard from "../../components/admin/AdminCard";
// import "../admin/Dashboard.scss"; 

// export default function PrincipalDashboard() {
//   const { t } = useTranslation();
//   const navigate = useNavigate();

//   // Sidebar state for internal tabs
//   const [sidebarTab, setSidebarTab] = useState("dashboard");

//   // Data loaded from backend
//   const [dashboardData, setDashboardData] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [students, setStudents] = useState([]);
//   const [selectedFy, setSelectedFy] = useState("2024-25");
//   const [fyMetrics, setFyMetrics] = useState(null);
//   const [selectedOverviewFy, setSelectedOverviewFy] = useState("2024-25");
//   const [overviewMetrics, setOverviewMetrics] = useState(null);

//   // Loading and error
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   // Sidebar items shown
//   const sidebarItems = [
//     { key: "dashboard", label: t("dashboard"), icon: "bi-speedometer2" },
//     { key: "profile", label: t("profile"), icon: "bi-person" },
//     { key: "teachers", label: t("teachers"), icon: "bi-people" },
//     { key: "students", label: t("students"), icon: "bi-person-lines-fill" },
//     { key: "charts", label: t("charts"), icon: "bi-bar-chart" },
//     { key: "notifications", label: t("notifications"), icon: "bi-bell" },
//   ];

//   useEffect(() => {
//     async function fetchAllData() {
//       try {
//         const token = localStorage.getItem("token");
//         const [
//           profileRes,
//           studentsRes,
//           dashboardRes,
//           fyRes,
//           overviewRes,
//         ] = await Promise.all([
//           axios.get("http://localhost:5000/api/principal/me", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get("http://localhost:5000/api/principal/students", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get("http://localhost:5000/api/principal/dashboard-data", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get(
//             `http://localhost:5000/api/principal/finance-by-year?financial_year=${selectedFy}`,
//             {
//               headers: { Authorization: `Bearer ${token}` },
//             }
//           ),
//           axios.get(
//             `http://localhost:5000/api/principal/finance-by-year?financial_year=${selectedOverviewFy}`,
//             {
//               headers: { Authorization: `Bearer ${token}` },
//             }
//           ),
//         ]);

//         // If profile is incomplete, navigate to onboarding
//         if (!profileRes.data.full_name) {
//           navigate("/principal/onboarding");
//           return;
//         }

//         setProfile(profileRes.data);
//         setStudents(studentsRes.data || []);
//         setDashboardData(dashboardRes.data);
//         setFyMetrics(fyRes.data);
//         setOverviewMetrics(overviewRes.data);
//       } catch (err) {
//         if (err.response?.status === 404) {
//           navigate("/principal/onboarding");
//         } else {
//           setError(err.response?.data?.message || t("failed_load_profile"));
//         }
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchAllData();
//   }, [navigate, t, selectedFy, selectedOverviewFy]);

//   // =========================
//   // DASHBOARD (Principal Home)
//   // =========================
//   const renderDashboard = () => {
//     if (!dashboardData) return null;

//     const { principal, unit, teacherCount, studentCount } =
//       dashboardData || {};

//     const school = Array.isArray(unit) && unit.length > 0 ? unit[0] : {};

//     const ratio =
//       studentCount && teacherCount
//         ? (studentCount / teacherCount).toFixed(1)
//         : 0;

//     return (
//       <div className="page-inner">
//         <PageHeader
//           title={t("principal_dashboard")}
//           subtitle={t("school_overview")}
//         />

//         {/* Top metrics strip (teachers / students / ratio) */}
//         <div className="unit-metrics-grid">
//           <div className="metric-card metric-card--teachers">
//             <div className="metric-label">{t("teachers")}</div>
//             <div className="metric-value">{teacherCount || 0}</div>
//           </div>
//           <div className="metric-card metric-card--students">
//             <div className="metric-label">{t("students")}</div>
//             <div className="metric-value">{studentCount || 0}</div>
//           </div>
//           <div className="metric-card metric-card--ratio">
//             <div className="metric-label">{t("teacher_ratio")}</div>
//             <div className="metric-value">{ratio}</div>
//           </div>
//         </div>

//         {/* Principal Profile */}
//         {principal && (
//           <AdminCard header={t("principal_profile")} className="mt-3">
//             <div className="details-grid">
//               <div className="details-row">
//                 <div className="details-key">{t("name")}</div>
//                 <div className="details-value">{principal.full_name}</div>
//               </div>
//               <div className="details-row">
//                 <div className="details-key">{t("email")}</div>
//                 <div className="details-value">{principal.email}</div>
//               </div>
//               <div className="details-row">
//                 <div className="details-key">{t("phone")}</div>
//                 <div className="details-value">{principal.phone}</div>
//               </div>
//               <div className="details-row">
//                 <div className="details-key">{t("qualification")}</div>
//                 <div className="details-value">{principal.qualification}</div>
//               </div>
//             </div>
//           </AdminCard>
//         )}

//         {/* School / Unit details */}
//         {school && (
//           <AdminCard header={t("unit_details")} className="mt-3">
//             <div className="details-grid">
//               <div className="details-row">
//                 <div className="details-key">{t("unit_name")}</div>
//                 <div className="details-value">{school.unit_name || "-"}</div>
//               </div>
//               <div className="details-row">
//                 <div className="details-key">{t("school_shift")}</div>
//                 <div className="details-value">
//                   {school.school_shift || "-"}
//                 </div>
//               </div>

//               <div className="details-row">
//                 <div className="details-key">SEMIS No</div>
//                 <div className="details-value">{school.semis_no || "-"}</div>
//               </div>
//               <div className="details-row">
//                 <div className="details-key">DCF No</div>
//                 <div className="details-value">{school.dcf_no || "-"}</div>
//               </div>

//               <div className="details-row">
//                 <div className="details-key">NMMS No</div>
//                 <div className="details-value">{school.nmms_no || "-"}</div>
//               </div>
//               <div className="details-row">
//                 <div className="details-key">{t("standard_range")}</div>
//                 <div className="details-value">
//                   {school.standard_range || "-"}
//                 </div>
//               </div>

//               <div className="details-row">
//                 <div className="details-key">{t("type_of_management")}</div>
//                 <div className="details-value">
//                   {school.type_of_management || "-"}
//                 </div>
//               </div>
//               <div className="details-row">
//                 <div className="details-key">{t("school_jurisdiction")}</div>
//                 <div className="details-value">
//                   {school.school_jurisdiction || "-"}
//                 </div>
//               </div>

//               <div className="details-row">
//                 <div className="details-key">
//                   {t("competent_authority_name")}
//                 </div>
//                 <div className="details-value">
//                   {school.competent_authority_name || "-"}
//                 </div>
//               </div>
//               <div className="details-row">
//                 <div className="details-key">{t("authority_number")}</div>
//                 <div className="details-value">
//                   {school.authority_number || "-"}
//                 </div>
//               </div>

//               <div className="details-row">
//                 <div className="details-key">{t("authority_zone")}</div>
//                 <div className="details-value">
//                   {school.authority_zone || "-"}
//                 </div>
//               </div>
//               <div className="details-row">
//                 <div className="details-key">Scholarship Code</div>
//                 <div className="details-value">
//                   {school.scholarship_code || "-"}
//                 </div>
//               </div>

//               <div className="details-row">
//                 <div className="details-key">First Grant Year</div>
//                 <div className="details-value">
//                   {school.first_grant_in_aid_year || "-"}
//                 </div>
//               </div>
//               <div className="details-row">
//                 <div className="details-key">Kendrashala Name</div>
//                 <div className="details-value">
//                   {school.kendrashala_name || "-"}
//                 </div>
//               </div>

//               <div className="details-row">
//                 <div className="details-key">Info Authority</div>
//                 <div className="details-value">
//                   {school.info_authority_name || "-"}
//                 </div>
//               </div>
//               <div className="details-row">
//                 <div className="details-key">Appellate Authority</div>
//                 <div className="details-value">
//                   {school.appellate_authority_name || "-"}
//                 </div>
//               </div>

//               <div className="details-row">
//                 <div className="details-key">Midday Meal Org</div>
//                 <div className="details-value">
//                   {school.midday_meal_org_name || "-"}
//                 </div>
//               </div>
//               <div className="details-row">
//                 <div className="details-key">Midday Meal Contact</div>
//                 <div className="details-value">
//                   {school.midday_meal_org_contact || "-"}
//                 </div>
//               </div>
//             </div>
//           </AdminCard>
//         )}

//         {/* Headmistress Info */}
//         {school && (
//           <AdminCard header={t("headmistress_info")} className="mt-3">
//             <div className="details-grid">
//               <div className="details-row">
//                 <div className="details-key">{t("headmistress_name")}</div>
//                 <div className="details-value">
//                   {school.headmistress_name || "-"}
//                 </div>
//               </div>
//               <div className="details-row">
//                 <div className="details-key">{t("headmistress_email")}</div>
//                 <div className="details-value">
//                   {school.headmistress_email || "-"}
//                 </div>
//               </div>
//               <div className="details-row">
//                 <div className="details-key">{t("headmistress_phone")}</div>
//                 <div className="details-value">
//                   {school.headmistress_phone || "-"}
//                 </div>
//               </div>
//             </div>
//           </AdminCard>
//         )}

//         {/* Finance Overview (same pattern as admin) */}
//         {overviewMetrics && (
//           <AdminCard
//             header={t("finance_overview")}
//             className="mt-3 section-card"
//           >
//             <div className="finance-header-row finance-header-colored">
//               <div className="finance-header-text">
//                 {t("financial_year")} &nbsp;
//                 <strong>{selectedOverviewFy}</strong>
//               </div>
//               <select
//                 value={selectedOverviewFy}
//                 onChange={(e) => setSelectedOverviewFy(e.target.value)}
//                 className="form-select form-select-sm fy-select"
//               >
//                 <option value="2023-24">2023-24</option>
//                 <option value="2024-25">2024-25</option>
//                 <option value="2025-26">2025-26</option>
//               </select>
//             </div>
//             <div className="finance-grid">
//               <div className="finance-card finance-card--budget">
//                 <div className="finance-label">{t("total_budget")}</div>
//                 <div className="finance-subtitle">
//                   {t("expected_fee_master")}
//                 </div>
//                 <div className="finance-value">
//                   ₹{" "}
//                   {(overviewMetrics.feesCollectedFy || 0).toLocaleString(
//                     "en-IN"
//                   )}
//                 </div>
//               </div>
//               <div className="finance-card finance-card--spent">
//                 <div className="finance-label">{t("total_spent")}</div>
//                 <div className="finance-subtitle">
//                   {t("teacher_salary_paid")}
//                 </div>
//                 <div className="finance-value">
//                   ₹{" "}
//                   {(overviewMetrics.salarySpentFy || 0).toLocaleString(
//                     "en-IN"
//                   )}
//                 </div>
//               </div>
//             </div>
//           </AdminCard>
//         )}

//         {/* Budget Summary */}
//         {overviewMetrics && (
//           <AdminCard
//             header={t("budget_summary")}
//             className="mt-3 section-card"
//           >
//             <div className="finance-header-row finance-header-colored">
//               <div className="finance-header-text">
//                 {t("financial_year")} &nbsp;
//                 <strong>{selectedOverviewFy}</strong>
//               </div>
//               <select
//                 value={selectedOverviewFy}
//                 onChange={(e) => setSelectedOverviewFy(e.target.value)}
//                 className="form-select form-select-sm fy-select"
//               >
//                 <option value="2023-24">2023-24</option>
//                 <option value="2024-25">2024-25</option>
//                 <option value="2025-26">2025-26</option>
//               </select>
//             </div>

//             <div className="finance-grid">
//               <div className="finance-card finance-card--positive">
//                 <div className="finance-label">{t("fees_collected")}</div>
//                 <div className="finance-subtitle">
//                   {t("actual_fees_collected")}
//                 </div>
//                 <div className="finance-value">
//                   ₹{" "}
//                   {(overviewMetrics.feesCollectedFy || 0).toLocaleString(
//                     "en-IN"
//                   )}
//                 </div>
//               </div>
//               <div className="finance-card finance-card--pending">
//                 <div className="finance-label">{t("pending_fees")}</div>
//                 <div className="finance-subtitle">
//                   {t("fees_yet_to_collect")}
//                 </div>
//                 <div className="finance-value">
//                   ₹{" "}
//                   {(
//                     (overviewMetrics.feesCollectedFy || 0) -
//                     (overviewMetrics.salarySpentFy || 0)
//                   ).toLocaleString("en-IN")}
//                 </div>
//               </div>
//             </div>

//             <div className="balance-strip">
//               <div className="balance-label">
//                 {t("balance")} ({t("collected_minus_spent")})
//               </div>
//               <div className="balance-equation">
//                 ₹
//                 {(overviewMetrics.feesCollectedFy || 0).toLocaleString(
//                   "en-IN"
//                 )}{" "}
//                 - ₹
//                 {(overviewMetrics.salarySpentFy || 0).toLocaleString(
//                   "en-IN"
//                 )}{" "}
//                 =
//               </div>
//               <div
//                 className={
//                   (overviewMetrics.feesCollectedFy || 0) -
//                     (overviewMetrics.salarySpentFy || 0) >=
//                   0
//                     ? "balance-value balance-value--positive"
//                     : "balance-value balance-value--negative"
//                 }
//               >
//                 ₹{" "}
//                 {(
//                   (overviewMetrics.feesCollectedFy || 0) -
//                   (overviewMetrics.salarySpentFy || 0)
//                 ).toLocaleString("en-IN")}
//               </div>
//             </div>
//           </AdminCard>
//         )}

//         {/* FY Metrics */}
//         {fyMetrics && (
//           <AdminCard
//             header={`${t("financial_year")} ${fyMetrics.financial_year}`}
//             className="mt-3 section-card"
//           >
//             <div className="finance-header-row finance-header-colored">
//               <div className="finance-header-text">
//                 {t("financial_year")} &nbsp;
//                 <strong>{selectedFy}</strong>
//               </div>
//               <select
//                 value={selectedFy}
//                 onChange={(e) => setSelectedFy(e.target.value)}
//                 className="form-select form-select-sm fy-select"
//               >
//                 <option value="2023-24">2023-24</option>
//                 <option value="2024-25">2024-25</option>
//                 <option value="2025-26">2025-26</option>
//               </select>
//             </div>
//             <div className="fy-metrics-grid">
//               <div className="fy-metric-card">
//                 <div className="fy-label">{t("fees_collected_in_fy")}</div>
//                 <div className="fy-value">
//                   ₹
//                   {Number(
//                     fyMetrics.feesCollectedFy || 0
//                   ).toLocaleString("en-IN")}
//                 </div>
//               </div>
//               <div className="fy-metric-card fy-metric-card--spent">
//                 <div className="fy-label">{t("salary_spent_in_fy")}</div>
//                 <div className="fy-value">
//                   ₹
//                   {Number(
//                     fyMetrics.salarySpentFy || 0
//                   ).toLocaleString("en-IN")}
//                 </div>
//               </div>
//             </div>
//           </AdminCard>
//         )}
//       </div>
//     );
//   };

//   // =========================
//   // STUDENTS PAGE
//   // =========================
//   const renderStudentsPage = () => (
//     <div className="page-inner">
//       <PageHeader
//         title={t("students")}
//         subtitle={t("all_students") || "All enrolled students"}
//       />
//       <AdminCard header={t("students")} className="section-card section-card--table">
//         <div className="table-responsive">
//           <table className="table table-striped table-bordered">
//             <thead>
//               <tr>
//                 <th>{t("roll_number")}</th>
//                 <th>{t("name")}</th>
//                 <th>{t("standard")}</th>
//                 <th>{t("division")}</th>
//                 <th>{t("parent_name")}</th>
//                 <th>{t("parent_phone")}</th>
//                 <th>{t("academic_year")}</th>
//                 <th>{t("passed")}</th>
//                 <th>{t("gender")}</th>
//               </tr>
//             </thead>
//             <tbody>
//               {students.map((student) => (
//                 <tr
//                   key={student.student_id + "-" + student.academic_year}
//                 >
//                   <td>{student.roll_number}</td>
//                   <td>{student.full_name}</td>
//                   <td>{student.standard}</td>
//                   <td>{student.division}</td>
//                   <td>{student.parent_name}</td>
//                   <td>{student.parent_phone}</td>
//                   <td>{student.academic_year}</td>
//                   <td>{student.passed ? t("yes") : t("no")}</td>
//                   <td>{student.gender}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </AdminCard>
//     </div>
//   );

//   // =========================
//   // ROUTE TAB CONTENT
//   // =========================
//   const renderContent = () => {
//     switch (sidebarTab) {
//       case "dashboard":
//         return renderDashboard();
//       case "profile":
//         return (
//           <div className="page-inner">
//             <PageHeader
//               title={t("profile")}
//               subtitle={t("principal_profile")}
//             />
//             <Profile />
//           </div>
//         );
//       case "teachers":
//         return (
//           <div className="page-inner">
//             <PageHeader
//               title={t("teachers")}
//               subtitle={t("teacher_list") || ""}
//             />
//             <Teachers />
//           </div>
//         );
//       case "students":
//         return renderStudentsPage();
//       case "charts":
//         return (
//           <div className="page-inner">
//             <PageHeader
//               title={t("charts")}
//               subtitle={t("visualize_school_data")}
//             />
//             <Charts unitId={dashboardData?.principal?.unit_id} />
//           </div>
//         );
//       case "notifications":
//         return (
//           <div className="page-inner">
//             <PageHeader
//               title={t("notifications")}
//               subtitle={t("principal_notifications") || ""}
//             />
//             <PrincipalNotificationsPage />
//           </div>
//         );
//       default:
//         return (
//           <div className="page-inner">
//             <PageHeader title={t("dashboard")} />
//           </div>
//         );
//     }
//   };

//   return (
//     <div className="dashboard-container d-flex">
//       {/* SIDEBAR – same structure as admin, principal label */}
//       <div className="sidebar">
//         <div className="sidebar-header">
//           <div className="app-icon">
//             <i className="bi bi-mortarboard-fill" />
//           </div>
//           <h3>{t("principal_portal")}</h3>
//         </div>

//         <nav className="sidebar-nav">
//           {sidebarItems.map((item) => (
//             <button
//               key={item.key}
//               className={`nav-link ${
//                 sidebarTab === item.key ? "active" : ""
//               }`}
//               onClick={() => setSidebarTab(item.key)}
//             >
//               <i className={`bi ${item.icon}`} />
//               <span>{item.label}</span>
//             </button>
//           ))}
//         </nav>

//         <div className="sidebar-footer">
//           <button
//             className="nav-link logout-btn"
//             onClick={() => {
//               localStorage.removeItem("token");
//               navigate("/login");
//             }}
//           >
//             <i className="bi bi-box-arrow-left"></i>
//             <span>{t("logout")}</span>
//           </button>
//         </div>
//       </div>

//       {/* MAIN CONTENT – same as admin */}
//       <main className="main-content">
//         {loading ? (
//           <div className="loading-spinner">
//             <div className="spinner-border text-primary" role="status">
//               <span className="visually-hidden">{t("loading")}...</span>
//             </div>
//           </div>
//         ) : error ? (
//           <div className="alert alert-danger m-4">{error}</div>
//         ) : (
//           renderContent()
//         )}
//       </main>

//       <ChatWidget />
//     </div>
//   );
// }
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
// 👇 use the correct relative path to your admin Dashboard.scss
import "../admin/Dashboard.scss";

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

  const sidebarItems = [
    { key: "dashboard", label: t("dashboard"), icon: "bi-speedometer2" },
    { key: "profile", label: t("profile"), icon: "bi-person" },
    { key: "teachers", label: t("teachers"), icon: "bi-people" },
    { key: "students", label: t("students"), icon: "bi-person-lines-fill" },
    { key: "charts", label: t("charts"), icon: "bi-bar-chart" },
    { key: "notifications", label: t("notifications"), icon: "bi-bell" },
  ];

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

    const initials = principal?.full_name
      ? principal.full_name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "PR";

    return (
      <div className="page-inner principal-page">
        <PageHeader
          title={t("principal_dashboard")}
          subtitle={t("school_overview")}
        />

        {/* ===== HERO CARD: principal + quick stats ===== */}
        <AdminCard className="principal-hero-card">
          <div className="principal-hero-body">
            <div className="principal-hero-left">
  <div className="principal-avatar">
    <span>{initials}</span>
  </div>

  <div className="principal-hero-text">
    {/* Name */}
    <h2 className="principal-name">
      {principal?.full_name || t("principal")}
    </h2>

    {/* Line 1: role */}
    <div className="principal-line principal-line--role">
      <span>
        <i className="bi bi-mortarboard-fill me-1" />
        {t("school_principal")}
      </span>
    </div>

    {/* Line 2: email, phone, qualification */}
    <div className="principal-line">
      {principal?.email && (
        <span>
          <i className="bi bi-envelope me-1" />
          {principal.email}
        </span>
      )}
      {principal?.phone && (
        <span>
          <i className="bi bi-telephone me-1" />
          {principal.phone}
        </span>
      )}
      {principal?.qualification && (
        <span>
          <i className="bi bi-patch-check me-1" />
          {principal.qualification}
        </span>
      )}
    </div>

    {/* Line 3: school, shift, management */}
    <div className="principal-line principal-line--school">
      {school.kendrashala_name && (
        <span>
          <i className="bi bi-building me-1" />
          {school.kendrashala_name}
        </span>
      )}
      {school.school_shift && (
        <span>
          <i className="bi bi-sunrise me-1" />
          {school.school_shift}
        </span>
      )}
      {school.type_of_management && (
        <span>
          <i className="bi bi-diagram-3 me-1" />
          {school.type_of_management}
        </span>
      )}
    </div>
  </div>
</div>

            
            {/* <div className="principal-hero-left">
              <div className="principal-avatar">
                <span>{initials}</span>
              </div>
              <div>
                <h2 className="principal-name">
                  {principal?.full_name || t("principal")}
                </h2>
                <div className="principal-role-chip">
                  <i className="bi bi-mortarboard-fill me-1" />
                  {t("school_principal")}
                </div>

                <div className="principal-meta">
                  {principal?.email && (
                    <span>
                      <i className="bi bi-envelope" />
                      {principal.email}
                    </span>
                  )}
                  {principal?.phone && (
                    <span>
                      <i className="bi bi-telephone" />
                      {principal.phone}
                    </span>
                  )}
                  {principal?.qualification && (
                    <span>
                      <i className="bi bi-patch-check" />
                      {principal.qualification}
                    </span>
                  )}
                </div>

                <div className="principal-tags">
                  {school.kendrashala_name && (
                    <span className="pill">
                      <i className="bi bi-building me-1" />
                      {school.kendrashala_name}
                    </span>
                  )}
                  {school.school_shift && (
                    <span className="pill">
                      <i className="bi bi-sunrise me-1" />
                      {school.school_shift}
                    </span>
                  )}
                  {school.type_of_management && (
                    <span className="pill">
                      <i className="bi bi-diagram-3 me-1" />
                      {school.type_of_management}
                    </span>
                  )}
                </div>
              </div>
            </div> */}

            <div className="principal-hero-right unit-metrics-grid">
              <div className="metric-card metric-card--teachers">
                <div className="metric-label">{t("teachers")}</div>
                <div className="metric-value">{teacherCount || 0}</div>
              </div>
              <div className="metric-card metric-card--students">
                <div className="metric-label">{t("students")}</div>
                <div className="metric-value">{studentCount || 0}</div>
              </div>
              <div className="metric-card metric-card--ratio">
                <div className="metric-label">{t("teacher_ratio")}</div>
                <div className="metric-value">{ratio}</div>
              </div>
            </div>
          </div>
        </AdminCard>

        {/* ===== SCHOOL INFO + HEADMISTRESS SIDE BY SIDE ===== */}
        <div className="principal-layout-grid">
          <AdminCard
            header={t("unit_details_school_info") || "Unit Details (School Info)"}
            className="section-card"
          >
            <div className="details-grid details-grid--comfortable">
              <div className="details-row">
                <div className="details-key">{t("unit_name")}</div>
                <div className="details-value">{school.unit_name || "-"}</div>
              </div>
              <div className="details-row">
                <div className="details-key">{t("school_shift")}</div>
                <div className="details-value">
                  {school.school_shift || "-"}
                </div>
              </div>

              <div className="details-row">
                <div className="details-key">SEMIS No</div>
                <div className="details-value">{school.semis_no || "-"}</div>
              </div>
              <div className="details-row">
                <div className="details-key">DCF No</div>
                <div className="details-value">{school.dcf_no || "-"}</div>
              </div>

              <div className="details-row">
                <div className="details-key">NMMS No</div>
                <div className="details-value">{school.nmms_no || "-"}</div>
              </div>
              <div className="details-row">
                <div className="details-key">{t("standard_range")}</div>
                <div className="details-value">
                  {school.standard_range || "-"}
                </div>
              </div>

              <div className="details-row">
                <div className="details-key">{t("type_of_management")}</div>
                <div className="details-value">
                  {school.type_of_management || "-"}
                </div>
              </div>
              <div className="details-row">
                <div className="details-key">{t("school_jurisdiction")}</div>
                <div className="details-value">
                  {school.school_jurisdiction || "-"}
                </div>
              </div>

              <div className="details-row">
                <div className="details-key">
                  {t("competent_authority_name")}
                </div>
                <div className="details-value">
                  {school.competent_authority_name || "-"}
                </div>
              </div>
              <div className="details-row">
                <div className="details-key">{t("authority_number")}</div>
                <div className="details-value">
                  {school.authority_number || "-"}
                </div>
              </div>

              <div className="details-row">
                <div className="details-key">{t("authority_zone")}</div>
                <div className="details-value">
                  {school.authority_zone || "-"}
                </div>
              </div>
              <div className="details-row">
                <div className="details-key">Scholarship Code</div>
                <div className="details-value">
                  {school.scholarship_code || "-"}
                </div>
              </div>

              <div className="details-row">
                <div className="details-key">First Grant Year</div>
                <div className="details-value">
                  {school.first_grant_in_aid_year || "-"}
                </div>
              </div>
              <div className="details-row">
                <div className="details-key">Kendrashala Name</div>
                <div className="details-value">
                  {school.kendrashala_name || "-"}
                </div>
              </div>

              <div className="details-row">
                <div className="details-key">Info Authority</div>
                <div className="details-value">
                  {school.info_authority_name || "-"}
                </div>
              </div>
              <div className="details-row">
                <div className="details-key">Appellate Authority</div>
                <div className="details-value">
                  {school.appellate_authority_name || "-"}
                </div>
              </div>

              <div className="details-row">
                <div className="details-key">Midday Meal Org</div>
                <div className="details-value">
                  {school.midday_meal_org_name || "-"}
                </div>
              </div>
              <div className="details-row">
                <div className="details-key">Midday Meal Contact</div>
                <div className="details-value">
                  {school.midday_meal_org_contact || "-"}
                </div>
              </div>
            </div>
          </AdminCard>

          <AdminCard
            header={t("headmistress_info") || "Headmistress Information"}
            className="section-card principal-headmistress-card"
          >
            <div className="details-grid details-grid--single">
              <div className="details-row">
                <div className="details-key">{t("headmistress_name")}</div>
                <div className="details-value">
                  {school.headmistress_name || "-"}
                </div>
              </div>
              <div className="details-row">
                <div className="details-key">{t("headmistress_email")}</div>
                <div className="details-value">
                  {school.headmistress_email || "-"}
                </div>
              </div>
              <div className="details-row">
                <div className="details-key">{t("headmistress_phone")}</div>
                <div className="details-value">
                  {school.headmistress_phone || "-"}
                </div>
              </div>
            </div>

            <div className="headmistress-note">
              <i className="bi bi-info-circle me-1" />
              {t("headmistress_support_note") ||
                "Use this section to quickly reach your headmistress for approvals and escalations."}
            </div>
          </AdminCard>
        </div>

        {/* ===== FINANCE OVERVIEW ===== */}
        {overviewMetrics && (
          <AdminCard
            header={t("finance_overview")}
            className="mt-3 section-card"
          >
            <div className="finance-header-row finance-header-colored">
              <div className="finance-header-text">
                {t("financial_year")} &nbsp;
                <strong>{selectedOverviewFy}</strong>
              </div>
              <select
                value={selectedOverviewFy}
                onChange={(e) => setSelectedOverviewFy(e.target.value)}
                className="form-select form-select-sm fy-select"
              >
                <option value="2023-24">2023-24</option>
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
              </select>
            </div>
            <div className="finance-grid">
              <div className="finance-card finance-card--budget">
                <div className="finance-label">{t("total_budget")}</div>
                <div className="finance-subtitle">
                  {t("expected_fee_master")}
                </div>
                <div className="finance-value">
                  ₹{" "}
                  {(overviewMetrics.feesCollectedFy || 0).toLocaleString(
                    "en-IN"
                  )}
                </div>
              </div>
              <div className="finance-card finance-card--spent">
                <div className="finance-label">{t("total_spent")}</div>
                <div className="finance-subtitle">
                  {t("teacher_salary_paid")}
                </div>
                <div className="finance-value">
                  ₹{" "}
                  {(overviewMetrics.salarySpentFy || 0).toLocaleString(
                    "en-IN"
                  )}
                </div>
              </div>
            </div>
          </AdminCard>
        )}

        {/* ===== BUDGET SUMMARY ===== */}
        {overviewMetrics && (
          <AdminCard
            header={t("budget_summary")}
            className="mt-3 section-card"
          >
            <div className="finance-header-row finance-header-colored">
              <div className="finance-header-text">
                {t("financial_year")} &nbsp;
                <strong>{selectedOverviewFy}</strong>
              </div>
              <select
                value={selectedOverviewFy}
                onChange={(e) => setSelectedOverviewFy(e.target.value)}
                className="form-select form-select-sm fy-select"
              >
                <option value="2023-24">2023-24</option>
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
              </select>
            </div>

            <div className="finance-grid">
              <div className="finance-card finance-card--positive">
                <div className="finance-label">{t("fees_collected")}</div>
                <div className="finance-subtitle">
                  {t("actual_fees_collected")}
                </div>
                <div className="finance-value">
                  ₹{" "}
                  {(overviewMetrics.feesCollectedFy || 0).toLocaleString(
                    "en-IN"
                  )}
                </div>
              </div>
              <div className="finance-card finance-card--pending">
                <div className="finance-label">{t("pending_fees")}</div>
                <div className="finance-subtitle">
                  {t("fees_yet_to_collect")}
                </div>
                <div className="finance-value">
                  ₹{" "}
                  {(
                    (overviewMetrics.feesCollectedFy || 0) -
                    (overviewMetrics.salarySpentFy || 0)
                  ).toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div className="balance-strip">
              <div className="balance-label">
                {t("balance")} ({t("collected_minus_spent")})
              </div>
              <div className="balance-equation">
                ₹
                {(overviewMetrics.feesCollectedFy || 0).toLocaleString(
                  "en-IN"
                )}{" "}
                - ₹
                {(overviewMetrics.salarySpentFy || 0).toLocaleString(
                  "en-IN"
                )}{" "}
                =
              </div>
              <div
                className={
                  (overviewMetrics.feesCollectedFy || 0) -
                    (overviewMetrics.salarySpentFy || 0) >=
                  0
                    ? "balance-value balance-value--positive"
                    : "balance-value balance-value--negative"
                }
              >
                ₹{" "}
                {(
                  (overviewMetrics.feesCollectedFy || 0) -
                  (overviewMetrics.salarySpentFy || 0)
                ).toLocaleString("en-IN")}
              </div>
            </div>
          </AdminCard>
        )}

        {/* ===== FY METRICS ===== */}
        {fyMetrics && (
          <AdminCard
            header={`${t("financial_year")} ${fyMetrics.financial_year}`}
            className="mt-3 section-card"
          >
            <div className="finance-header-row finance-header-colored">
              <div className="finance-header-text">
                {t("financial_year")} &nbsp;
                <strong>{selectedFy}</strong>
              </div>
              <select
                value={selectedFy}
                onChange={(e) => setSelectedFy(e.target.value)}
                className="form-select form-select-sm fy-select"
              >
                <option value="2023-24">2023-24</option>
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
              </select>
            </div>
            <div className="fy-metrics-grid">
              <div className="fy-metric-card">
                <div className="fy-label">{t("fees_collected_in_fy")}</div>
                <div className="fy-value">
                  ₹
                  {Number(
                    fyMetrics.feesCollectedFy || 0
                  ).toLocaleString("en-IN")}
                </div>
              </div>
              <div className="fy-metric-card fy-metric-card--spent">
                <div className="fy-label">{t("salary_spent_in_fy")}</div>
                <div className="fy-value">
                  ₹
                  {Number(
                    fyMetrics.salarySpentFy || 0
                  ).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </AdminCard>
        )}
      </div>
    );
  };

  // ========= STUDENTS PAGE =========
  const renderStudentsPage = () => (
    <div className="page-inner">
      <PageHeader
        title={t("students")}
        subtitle={t("all_students") || "All enrolled students"}
      />
      <AdminCard
        header={t("students")}
        className="section-card section-card--table"
      >
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
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
              {students.map((student) => (
                <tr
                  key={student.student_id + "-" + student.academic_year}
                >
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
      </AdminCard>
    </div>
  );

  // ========= ROUTE TAB CONTENT =========
  const renderContent = () => {
    switch (sidebarTab) {
      case "dashboard":
        return renderDashboard();
      case "profile":
        return (
          <div className="page-inner">
            <PageHeader
              title={t("profile")}
              subtitle={t("principal_profile")}
            />
            <Profile />
          </div>
        );
      case "teachers":
        return (
          <div className="page-inner">
            <PageHeader
              title={t("teachers")}
              subtitle={t("teacher_list") || ""}
            />
            <Teachers />
          </div>
        );
      case "students":
        return renderStudentsPage();
      case "charts":
        return (
          <div className="page-inner">
            <PageHeader
              title={t("charts")}
              subtitle={t("visualize_school_data")}
            />
            <Charts unitId={dashboardData?.principal?.unit_id} />
          </div>
        );
      case "notifications":
        return (
          <div className="page-inner">
            <PageHeader
              title={t("notifications")}
              subtitle={t("principal_notifications") || ""}
            />
            <PrincipalNotificationsPage />
          </div>
        );
      default:
        return (
          <div className="page-inner">
            <PageHeader title={t("dashboard")} />
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container d-flex">
      {/* SIDEBAR – same structure as admin, principal label */}
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
              className={`nav-link ${
                sidebarTab === item.key ? "active" : ""
              }`}
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
