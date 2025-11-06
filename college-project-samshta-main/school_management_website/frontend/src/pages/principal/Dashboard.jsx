

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";
// import axios from "axios";
// import Profile from "./Profile";
// import Teachers from "./Teachers";
// import Students from "./Students";

// import Charts from "./Charts";

// export default function PrincipalDashboard() {
//   const { t } = useTranslation();
//   const navigate = useNavigate();
//   const [dashboardData, setDashboardData] = useState(null);
//   const [sidebarTab, setSidebarTab] = useState("dashboard");
//   const [profile, setProfile] = useState(null);
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const sidebarItems = [
//     { key: "dashboard", label: t("dashboard"), icon: "bi-house" },
//     { key: "profile", label: t("profile"), icon: "bi-person" },
//     { key: "teachers", label: t("teachers"), icon: "bi-people" },
//     { key: "students", label: t("students"), icon: "bi-person-lines-fill" },
//     { key: "charts", label: t("charts"), icon: "bi-bar-chart" } // NEW
//   ];

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await axios.get("http://localhost:5000/api/principal/me", {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setProfile(response.data);
//       } catch (err) {
//         if (err.response?.status === 404) {
//           navigate("/principal/onboarding");
//         } else {
//           setError(err.response?.data?.message || t("failed_load_profile"));
//         }
//       }
//     };

//     const fetchDashboard = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await axios.get("http://localhost:5000/api/principal/dashboard-data", {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setDashboardData(res.data);
//       } catch (err) {
//         if (err.response?.status === 404) {
//           navigate("/principal/onboarding");
//         } else {
//           setError(err.response?.data?.message || t("failed_load_dashboard"));
//         }
//       }
//     };

//     // Fetch students JOIN enrollments!
//     const fetchStudents = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await axios.get("http://localhost:5000/api/principal/students", {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setStudents(response.data);
//       } catch (err) {
//         setError(err.response?.data?.message || t("failed_load_students"));
//       }
//     };

//     Promise.all([fetchProfile(), fetchStudents(), fetchDashboard()]).finally(
//       () => setLoading(false)
//     );
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [navigate, t]);

//   // dashboard
//   const renderDashboard = () => {
//     if (!dashboardData) return null;
//     const { principal, unit, teacherCount, studentCount } = dashboardData;
//     return (
//       <div>
//         <h2>{t("principal_dashboard")}</h2>
//         {/* Principal section */}
//         <div
//           style={{
//             border: "1px solid #ccc",
//             background: "#fafafa",
//             padding: "18px",
//             marginBottom: 24,
//             borderRadius: 6
//           }}
//         >
//           <h3>{t("principal_profile")}</h3>
//           {principal && (
//             <div style={{ marginTop: 8 }}>
//               <b>{t("name")}:</b> {principal.full_name} <br />
//               <b>{t("email")}:</b> {principal.email} <br />
//               <b>{t("phone")}:</b> {principal.phone} <br />
//               <b>{t("qualification")}:</b> {principal.qualification} <br />
//               <b>{t("unit_id")}:</b> {principal.unit_id}
//             </div>
//           )}
//         </div>
//         {/* Unit section */}
//         {unit && (
//           <div
//             style={{
//               border: "1px solid #ccc",
//               background: "#fafafa",
//               padding: "18px",
//               marginBottom: 24,
//               borderRadius: 6
//             }}
//           >
//             <h3>{t("unit_details")}</h3>
//             <div style={{ columns: 2 }}>
//               {Object.entries(unit).map(([key, value]) => (
//                 <div key={key} style={{ marginBottom: 6 }}>
//                   <b>{t(key)}:</b> {value !== null ? value.toString() : "-"}
//                 </div>
//               ))}
//             </div>
//             <div
//               style={{
//                 display: "flex",
//                 gap: "24px",
//                 fontSize: "1.1rem",
//                 marginTop: 18
//               }}
//             >
//               <div
//                 style={{
//                   background: "#fff",
//                   border: "1px solid #ddd",
//                   borderRadius: 5,
//                   padding: "10px 30px",
//                   minWidth: 90,
//                   textAlign: "center"
//                 }}
//               >
//                 {t("teachers")}
//                 <br />
//                 <span style={{ fontWeight: 700, fontSize: "1.2em" }}>
//                   {teacherCount}
//                 </span>
//               </div>
//               <div
//                 style={{
//                   background: "#fff",
//                   border: "1px solid #ddd",
//                   borderRadius: 5,
//                   padding: "10px 30px",
//                   minWidth: 90,
//                   textAlign: "center"
//                 }}
//               >
//                 {t("students")}
//                 <br />
//                 <span style={{ fontWeight: 700, fontSize: "1.2em" }}>
//                   {studentCount}
//                 </span>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   // students
//   const renderStudents = () => (
//     <div>
//       <h3>{t("all_students")}</h3>
//       <div className="table-responsive">
//         <table className="table table-striped">
//           <thead>
//             <tr>
//               <th>{t("roll_number")}</th>
//               <th>{t("name")}</th>
//               <th>{t("standard")}</th>
//               <th>{t("division")}</th>
//               <th>{t("parent_name")}</th>
//               <th>{t("parent_phone")}</th>
//               <th>{t("academic_year")}</th>
//               <th>{t("passed")}</th>
//               <th>{t("gender")}</th>
//             </tr>
//           </thead>
//           <tbody>
//             {students.map(student => (
//               <tr key={student.student_id + "-" + student.academic_year}>
//                 <td>{student.roll_number}</td>
//                 <td>{student.full_name}</td>
//                 <td>{student.standard}</td>
//                 <td>{student.division}</td>
//                 <td>{student.parent_name}</td>
//                 <td>{student.parent_phone}</td>
//                 <td>{student.academic_year}</td>
//                 <td>{student.passed ? t("yes") : t("no")}</td>
//                 <td>{student.gender}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );

//   // Render content for tab
//   const renderContent = () => {
//     switch (sidebarTab) {
//       case "dashboard":
//         return renderDashboard();
//       case "profile":
//         return <Profile />;
//       case "teachers":
//         return <Teachers />;
//       case "students":
//   return <Students />;

//      case "charts":
//         return <Charts unitId={dashboardData?.principal?.unit_id} />;

//       default:
//         return <div>{t("select_tab")}</div>;
//     }
//   };

//   if (loading) return <div>{t("loading")}...</div>;
//   if (error) return <div style={{ color: "red" }}>{error}</div>;

//   return (
//     <div style={{ display: "flex", minHeight: "100vh" }}>
//       <aside
//         style={{
//           width: 220,
//           backgroundColor: "#212b36",
//           color: "white",
//           paddingTop: 24,
//           borderRight: "1px solid #e3e7ed",
//           display: "flex",
//           flexDirection: "column"
//         }}
//       >
//         <div
//           style={{
//             paddingLeft: 16,
//             paddingBottom: 12,
//             fontWeight: "bold",
//             fontSize: 18
//           }}
//         >
//           <i className="bi bi-grid-3x3-gap me-2" /> {t("principal_portal")}
//         </div>
//         <nav style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
//           {sidebarItems.map(item => (
//             <button
//               key={item.key}
//               onClick={() => setSidebarTab(item.key)}
//               style={{
//                 background: sidebarTab === item.key ? "#2a3b4d" : "transparent",
//                 color: sidebarTab === item.key ? "#0dcaf0" : "#fff",
//                 textAlign: "left",
//                 padding: "12px 20px",
//                 fontSize: "1rem",
//                 border: "none",
//                 borderLeft:
//                   sidebarTab === item.key ? "4px solid #0dcaf0" : "none",
//                 cursor: "pointer"
//               }}
//             >
//               <i className={`bi me-2 ${item.icon}`}></i>
//               {item.label}
//             </button>
//           ))}
//         </nav>
//         <button
//           onClick={() => {
//             localStorage.removeItem("token");
//             navigate("/login");
//           }}
//           style={{
//             margin: "16px",
//             padding: "12px 20px",
//             background: "transparent",
//             color: "red",
//             border: "none",
//             cursor: "pointer",
//             textAlign: "left",
//             fontWeight: "bold"
//           }}
//         >
//           <i className="bi bi-box-arrow-right me-2"></i> {t("logout")}
//         </button>
//         <div
//           style={{
//             padding: "0 16px 16px 16px",
//             fontSize: "12px",
//             color: "#ccc"
//           }}
//         >
//           © {new Date().getFullYear()} {t("school_principal")}
//         </div>
//       </aside>
//       <main style={{ flexGrow: 1, padding: "24px", overflowY: "auto" }}>
//         {renderContent()}
//       </main>
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

export default function PrincipalDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [sidebarTab, setSidebarTab] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);

  const sidebarItems = [
    { key: "dashboard", label: t("dashboard"), icon: "bi-house" },
    { key: "profile", label: t("profile"), icon: "bi-person" },
    { key: "teachers", label: t("teachers"), icon: "bi-people" },
    { key: "students", label: t("students"), icon: "bi-person-lines-fill" },
    { key: "charts", label: t("charts"), icon: "bi-bar-chart" },
    { key: "notifications", label: t("notifications"), icon: "bi-bell" }
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/principal/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data);
        if (!response.data.full_name) {
          navigate("/principal/onboarding");
          return;
        }
      } catch (err) {
        if (err.response?.status === 404) {
          navigate("/principal/onboarding");
        } else {
          setError(err.response?.data?.message || t("failed_load_profile"));
        }
      }
    };

    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/principal/dashboard-data", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDashboardData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || t("failed_load_dashboard"));
      }
    };

    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/principal/students", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudents(response.data);
      } catch (err) {
        setError(err.response?.data?.message || t("failed_load_students"));
      }
    };

    Promise.all([fetchProfile(), fetchStudents(), fetchDashboard()]).finally(() => setLoading(false));

  }, [navigate, t]);

  const renderDashboard = () => {
    if (!dashboardData) return null;
    const { principal, unit, teacherCount, studentCount } = dashboardData;

    return (
      <div>
        <h2>{t("principal_dashboard")}</h2>
        {/* Principal Section */}
        {principal && (
          <div style={{ border: "1px solid #ccc", background: "#fafafa", padding: 18, marginBottom: 24, borderRadius: 6 }}>
            <h3>{t("principal_profile")}</h3>
            <p><b>{t("name")}:</b> {principal.full_name}</p>
            <p><b>{t("email")}:</b> {principal.email}</p>
            <p><b>{t("phone")}:</b> {principal.phone}</p>
            <p><b>{t("qualification")}:</b> {principal.qualification}</p>
            <p><b>{t("unit_id")}:</b> {principal.unit_id}</p>
          </div>
        )}
        {/* Unit Section */}
        {unit && (
          <div style={{ border: "1px solid #ccc", background: "#fafafa", padding: 18, marginBottom: 24, borderRadius: 6 }}>
            <h3>{t("unit_details")}</h3>
            <div style={{ display: "flex", gap: 20 }}>
              <div>{t("teachers")}: <strong>{teacherCount}</strong></div>
              <div>{t("students")}: <strong>{studentCount}</strong></div>
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
      case "dashboard":
        return renderDashboard();
      case "profile":
        return <Profile />;
      case "teachers":
        return <Teachers />;
      case "students":
        return renderStudents();
      case "charts":
        return <Charts unitId={dashboardData?.principal?.unit_id} />;
      case "notifications":
        return <PrincipalNotificationsPage />;
      default:
        return <div>{t("select_tab")}</div>;
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
            <button key={item.key} onClick={() => setSidebarTab(item.key)}
              style={{
                background: sidebarTab === item.key ? "#2a3b4d" : "transparent",
                color: sidebarTab === item.key ? "#0dcaf0" : "#fff",
                textAlign: "left",
                padding: "12px 20px",
                fontSize: "1rem",
                border: "none",
                borderLeft: sidebarTab === item.key ? "4px solid #0dcaf0" : "none",
                cursor: "pointer"
              }}>
              <i className={`bi me-2 ${item.icon}`}></i> {item.label}
            </button>
          ))}
        </nav>

        <button onClick={() => {
          localStorage.removeItem("token");
          navigate("/login");
        }} style={{ margin: 16, padding: 12, background: "transparent", color: "red", border: "none", cursor: "pointer", textAlign: "left", fontWeight: "bold" }}>
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
    </div>
  );
}
