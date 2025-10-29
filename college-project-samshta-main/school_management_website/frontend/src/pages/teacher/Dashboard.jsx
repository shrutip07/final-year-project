// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "./Dashboard.scss";

// export default function TeacherDashboard() {
//   const navigate = useNavigate();
//   const [sidebarTab, setSidebarTab] = useState("dashboard");
//   const [profile, setProfile] = useState(null);
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const sidebarItems = [
//     { key: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
//     { key: "profile", label: "Profile", icon: "bi-person" },
//     { key: "students", label: "Students", icon: "bi-people" },
//   ];

//   useEffect(() => {
//     const checkProfile = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await axios.get("http://localhost:5000/api/teacher/me", {
//           headers: { Authorization: `Bearer ${token}` },
//         });

//         if (!response.data) {
//           navigate("/teacher/onboarding");
//           return;
//         }

//         setProfile(response.data);
//         setLoading(false);
//       } catch (err) {
//         if (err.response?.status === 404) {
//           // Profile not found, redirect to onboarding
//           navigate("/teacher/onboarding");
//         } else {
//           setError(err.response?.data?.message || "Failed to load profile");
//           setLoading(false);
//         }
//       }
//     };

//     checkProfile();
//   }, [navigate]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         // Fetch teacher profile and students in parallel
//         const [profileRes, studentsRes] = await Promise.all([
//           axios.get("http://localhost:5000/api/teacher/me", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//           axios.get("http://localhost:5000/api/teacher/students", {
//             headers: { Authorization: `Bearer ${token}` },
//           }),
//         ]);

//         setProfile(profileRes.data);
//         setStudents(studentsRes.data);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching data:", err);
//         setError(err.response?.data?.message || "Failed to load data");
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const renderContent = () => {
//     switch (sidebarTab) {
//       case "dashboard":
//         return (
//           <div>
//             <h2>Teacher Dashboard</h2>
//             {profile && (
//               <div className="card mb-4">
//                 <div className="card-header">
//                   <h3>Teacher Profile</h3>
//                 </div>
//                 <div className="card-body">
//                   <div className="row">
//                     <div className="col-md-6">
//                       <h4>Welcome, {profile.full_name}</h4>
//                       <p>
//                         <strong>Email:</strong> {profile.email}
//                       </p>
//                       <p>
//                         <strong>Phone:</strong> {profile.phone}
//                       </p>
//                       <p>
//                         <strong>Subject:</strong> {profile.subject}
//                       </p>
//                       <p>
//                         <strong>Designation:</strong> {profile.designation}
//                       </p>
//                       <p>
//                         <strong>Qualification:</strong> {profile.qualification}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="card">
//               <div className="card-header">
//                 <h3>My Students</h3>
//               </div>
//               <div className="card-body">
//                 <div className="table-responsive">
//                   <table className="table table-striped">
//                     <thead>
//                       <tr>
//                         <th>Roll Number</th>
//                         <th>Name</th>
//                         <th>Standard</th>
//                         <th>Division</th>
//                         <th>Parent Name</th>
//                         <th>Parent Phone</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {students.map((student) => (
//                         <tr key={student.student_id}>
//                           <td>{student.roll_number}</td>
//                           <td>{student.full_name}</td>
//                           <td>{student.standard}</td>
//                           <td>{student.division}</td>
//                           <td>{student.parent_name}</td>
//                           <td>{student.parent_phone}</td>
//                         </tr>
//                       ))}
//                       {students.length === 0 && (
//                         <tr>
//                           <td colSpan="6" className="text-center">
//                             No students found
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       case "profile":
//         navigate("/teacher/profile");
//         return null;
//       case "students":
//         navigate("/teacher/students");
//         return null;
//       default:
//         return <div>Select a tab</div>;
//     }
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div className="alert alert-danger">{error}</div>;

//   return (
//     <div style={{ display: "flex" }}>
//       {/* Sidebar */}
//       <div
//         style={{
//           width: "250px",
//           minHeight: "100vh",
//           backgroundColor: "#333",
//           padding: "20px",
//           color: "white",
//         }}
//       >
//         <h3>Teacher Portal</h3>
//         <div style={{ marginTop: "20px" }}>
//           {sidebarItems.map((item) => (
//             <button
//               key={item.key}
//               onClick={() => setSidebarTab(item.key)}
//               style={{
//                 display: "block",
//                 width: "100%",
//                 padding: "10px",
//                 marginBottom: "10px",
//                 backgroundColor:
//                   sidebarTab === item.key ? "#555" : "transparent",
//                 border: "none",
//                 color: "white",
//                 textAlign: "left",
//                 cursor: "pointer",
//               }}
//             >
//               <i className={`bi ${item.icon}`}></i> {item.label}
//             </button>
//           ))}
//           <button
//             onClick={() => {
//               localStorage.removeItem("token");
//               navigate("/login");
//             }}
//             style={{
//               display: "block",
//               width: "100%",
//               padding: "10px",
//               marginTop: "20px",
//               backgroundColor: "transparent",
//               border: "none",
//               color: "white",
//               textAlign: "left",
//               cursor: "pointer",
//             }}
//           >
//             <i className="bi bi-box-arrow-left"></i> Logout
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div style={{ flex: 1, padding: "20px" }}>{renderContent()}</div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "./Dashboard.scss";

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sidebarTab, setSidebarTab] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const sidebarItems = [
    { key: "dashboard", label: t("dashboard"), icon: "bi-speedometer2" },
    { key: "profile", label: t("profile"), icon: "bi-person" },
    { key: "students", label: t("students"), icon: "bi-people" }
  ];

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/teacher/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.data) {
          navigate("/teacher/onboarding");
          return;
        }

        setProfile(response.data);
        setLoading(false);
      } catch (err) {
        if (err.response?.status === 404) {
          navigate("/teacher/onboarding");
        } else {
          setError(err.response?.data?.message || t("failed_load_profile"));
          setLoading(false);
        }
      }
    };
    checkProfile();
    // eslint-disable-next-line
  }, [navigate, t]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [profileRes, studentsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/teacher/me", { headers: { Authorization: `Bearer ${token}` } }),
          axios.get("http://localhost:5000/api/teacher/students", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setProfile(profileRes.data);
        setStudents(studentsRes.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || t("failed_load_data"));
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [t]);

  const renderContent = () => {
    switch (sidebarTab) {
      case "dashboard":
        return (
          <div>
            <h2>{t("teacher_dashboard")}</h2>
            {profile && (
              <div className="card mb-4">
                <div className="card-header">
                  <h3>{t("teacher_profile")}</h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h4>{t("welcome")}, {profile.full_name}</h4>
                      <p>
                        <strong>{t("email")}:</strong> {profile.email}
                      </p>
                      <p>
                        <strong>{t("phone")}:</strong> {profile.phone}
                      </p>
                      <p>
                        <strong>{t("subject")}:</strong> {profile.subject}
                      </p>
                      <p>
                        <strong>{t("designation")}:</strong> {profile.designation}
                      </p>
                      <p>
                        <strong>{t("qualification")}:</strong> {profile.qualification}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <h3>{t("my_students")}</h3>
              </div>
              <div className="card-body">
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
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.student_id}>
                          <td>{student.roll_number}</td>
                          <td>{student.full_name}</td>
                          <td>{student.standard}</td>
                          <td>{student.division}</td>
                          <td>{student.parent_name}</td>
                          <td>{student.parent_phone}</td>
                        </tr>
                      ))}
                      {students.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center">
                            {t("no_students_found")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      case "profile":
        navigate("/teacher/profile");
        return null;
      case "students":
        navigate("/teacher/students");
        return null;
      default:
        return <div>{t("select_tab")}</div>;
    }
  };

  if (loading) return <div>{t("loading")}...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          minHeight: "100vh",
          backgroundColor: "#333",
          padding: "20px",
          color: "white"
        }}
      >
        <h3>{t("teacher_portal")}</h3>
        <div style={{ marginTop: "20px" }}>
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setSidebarTab(item.key)}
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginBottom: "10px",
                backgroundColor: sidebarTab === item.key ? "#555" : "transparent",
                border: "none",
                color: "white",
                textAlign: "left",
                cursor: "pointer"
              }}
            >
              <i className={`bi ${item.icon}`}></i> {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "20px",
              backgroundColor: "transparent",
              border: "none",
              color: "white",
              textAlign: "left",
              cursor: "pointer"
            }}
          >
            <i className="bi bi-box-arrow-left"></i> {t("logout")}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px" }}>{renderContent()}</div>
    </div>
  );
}
