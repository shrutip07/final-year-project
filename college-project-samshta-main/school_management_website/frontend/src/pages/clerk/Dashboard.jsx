// // // // import React, { useState } from "react";
// // // // import { useNavigate } from "react-router-dom";
// // // // import ClerkProfile from "./Profile";
// // // // import AddStudent from "./AddStudent";
// // // // import StudentFees from "./StudentFees";
// // // // import TeacherSalaries from "./TeacherSalaries";
// // // // //import Students from "./Students";
// // // // //import Teachers from "./Teachers";
// // // // // import "./Dashboard.scss"; // Uncomment if you have clerk-specific styles

// // // // export default function ClerkDashboard() {
// // // //   const [tab, setTab] = useState("profile");
// // // //   const navigate = useNavigate();

// // // //   // Side panel links
// // // //   const menu = [
// // // //     { key: "profile", label: "Clerk Home" },
// // // //     { key: "addStudent", label: "Add Student" },
// // // //     { key: "studentFees", label: "Student Fees" },
// // // //     { key: "teacherSalaries", label: "Teacher Salaries" },
// // // //     { key: "students", label: "All Students" },
// // // //     { key: "teachers", label: "All Teachers" },
// // // //     { key: "logout", label: "Logout" },
// // // //   ];

// // // //   function handleMenuClick(key) {
// // // //     if (key === "logout") {
// // // //       localStorage.removeItem("token");
// // // //       navigate("/login");
// // // //     } else {
// // // //       setTab(key);
// // // //     }
// // // //   }

// // // //   return (
// // // //     <div className="dashboard-container d-flex">
// // // //       <aside className="sidebar">
// // // //         <h3>Clerk Panel</h3>
// // // //         <nav>
// // // //           {menu.map((item) => (
// // // //             <button
// // // //               key={item.key}
// // // //               className={`nav-link ${tab === item.key ? "active" : ""}`}
// // // //               onClick={() => handleMenuClick(item.key)}
// // // //             >
// // // //               {item.label}
// // // //             </button>
// // // //           ))}
// // // //         </nav>
// // // //       </aside>

// // // //       <main className="main-content" style={{ flex: 1, padding: 32 }}>
// // // //         {tab === "profile" && <ClerkProfile />}
// // // //         {tab === "addStudent" && <AddStudent />}
// // // //         {tab === "studentFees" && <StudentFees />}
// // // //         {tab === "teacherSalaries" && <TeacherSalaries />}
// // // //         {tab === "students" && <Students />}
// // // //         {tab === "teachers" && <Teachers />}
// // // //       </main>
// // // //     </div>
// // // //   );
// // // // }
// // // import React, { useState } from "react";
// // // import { useNavigate } from "react-router-dom";
// // // import ClerkProfile from "./Profile";
// // // import ClerkOnboarding from "./Onboarding";

// // // export default function ClerkDashboard() {
// // //   const [tab, setTab] = useState("profile");
// // //   const navigate = useNavigate();

// // //   const menu = [
// // //     { key: "profile", label: "Clerk Home" },
// // //     { key: "onboarding", label: "Onboarding" },
// // //     { key: "logout", label: "Logout" },
// // //   ];

// // //   function handleMenuClick(key) {
// // //     if (key === "logout") {
// // //       localStorage.removeItem("token");
// // //       navigate("/");
// // //     } else {
// // //       setTab(key);
// // //     }
// // //   }

// // //   return (
// // //     <div className="dashboard-container d-flex">
// // //       <aside className="sidebar">
// // //         <h3>Clerk Panel</h3>
// // //         <nav>
// // //           {menu.map((item) => (
// // //             <button
// // //               key={item.key}
// // //               className={`nav-link ${tab === item.key ? "active" : ""}`}
// // //               onClick={() => handleMenuClick(item.key)}
// // //             >
// // //               {item.label}
// // //             </button>
// // //           ))}
// // //         </nav>
// // //       </aside>
// // //       <main className="main-content" style={{ flex: 1, padding: 32 }}>
// // //         {tab === "profile" && <ClerkProfile />}
// // //         {tab === "onboarding" && <ClerkOnboarding />}
// // //       </main>
// // //     </div>
// // //   );
// // // }

// // // import React, { useState, useEffect } from "react";
// // // import { useNavigate } from "react-router-dom";
// // // import ClerkProfile from "./Profile";
// // // import ClerkFees from "./Fees"; // Placeholder – create as needed
// // // import TeacherSalaries from "./TeacherSalaries";
// // // import StudentFees from "./StudentFees"; // and so on

// // // // Then restrict usage to <TeacherSalaries /> not <ClerkSalaries />


// // // export default function ClerkDashboard() {
// // //   const [tab, setTab] = useState("dashboard");
// // //   const [unit, setUnit] = useState(null);
// // //   const [loading, setLoading] = useState(true);
// // //   const navigate = useNavigate();

// // //   // Fetch school/unit info for dashboard display
// // //   useEffect(() => {
// // //     async function fetchUnit() {
// // //       try {
// // //         const token = localStorage.getItem("token");
// // //         // Modify API as needed, here /api/clerk/unit
// // //         const res = await fetch("http://localhost:5000/api/clerk/unit", { headers: { Authorization: `Bearer ${token}` }});
// // //         setUnit(await res.json());
// // //       } finally {
// // //         setLoading(false);
// // //       }
// // //     }
// // //     fetchUnit();
// // //   }, []);

// // //   const sidebar = [
// // //     { key: "dashboard", label: "Dashboard", icon: "bi-house" },
// // //     { key: "profile", label: "Profile", icon: "bi-person" },
// // //     { key: "students", label: "Students", icon: "bi-people" },
// // //     { key: "fees", label: "Fees", icon: "bi-cash" },
// // //     { key: "salaries", label: "Teacher Salaries", icon: "bi-currency-dollar" },
// // //     { key: "logout", label: "Logout", icon: "bi-box-arrow-right" }
// // //   ];

// // //   function handleMenu(key) {
// // //     if (key === "logout") {
// // //       localStorage.removeItem("token");
// // //       navigate("/");
// // //     } else {
// // //       setTab(key);
// // //     }
// // //   }

// // //   if (loading) return <div>Loading...</div>;

// // //   return (
// // //     <div style={{ display: "flex", minHeight: "100vh" }}>
// // //       {/* Sidebar */}
// // //       <aside style={{ width: 220, background: "#212b36", color: "#fff", paddingTop: 30 }}>
// // //         <div style={{ paddingLeft: 24, fontWeight: "bold" }}>Clerk Panel</div>
// // //         <nav style={{ marginTop: 25 }}>
// // //           {sidebar.map((item) => (
// // //             <button key={item.key}
// // //               className="nav-link"
// // //               style={{
// // //                 background: tab === item.key ? "#2a3b4d" : "transparent",
// // //                 color: tab === item.key ? "#0dcaf0" : "#fff",
// // //                 border: "none",
// // //                 width: "100%",
// // //                 padding: 12,
// // //                 textAlign: "left",
// // //                 cursor: "pointer"
// // //               }}
// // //               onClick={() => handleMenu(item.key)}
// // //             >
// // //               <i className={`bi me-2 ${item.icon}`}></i>
// // //               {item.label}
// // //             </button>
// // //           ))}
// // //         </nav>
// // //       </aside>
// // //       {/* Main content */}
// // //       <main style={{ flex: 1, padding: 32 }}>
// // //         {tab === "dashboard" && (
// // //           <div>
// // //             <h2>School Unit Details</h2>
// // //             {unit 
// // //               ? (<table className="table">
// // //                   <tbody>
// // //                     <tr><th>Unit Name</th><td>{unit.unit_name}</td></tr>
// // //                     <tr><th>Location</th><td>{unit.location}</td></tr>
// // //                     <tr><th>Contact</th><td>{unit.contact}</td></tr>
// // //                     {/* Add more fields as per your schema */}
// // //                   </tbody>
// // //                 </table>
// // //                 )
// // //               : <div>No unit info found.</div>}
// // //           </div>
// // //         )}
// // //         {tab === "profile" && <ClerkProfile />}
// // //         {tab === "students" && <ClerkStudents />}
// // //         {tab === "fees" && <ClerkFees />}
// // //         {tab === "salaries" && <ClerkSalaries />}
// // //       </main>
// // //     </div>
// // //   );
// // // }

// // import React, { useState, useEffect } from "react";
// // import { useNavigate } from "react-router-dom";
// // import ClerkProfile from "./Profile";
// // import StudentFees from "./StudentFees";
// // import TeacherSalaries from "./TeacherSalaries";

// // export default function ClerkDashboard() {
// //   const [tab, setTab] = useState("dashboard");
// //   const [unit, setUnit] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const navigate = useNavigate();

// //   // Fetch school/unit info for dashboard display (implement /api/clerk/unit backend if needed)
// //   useEffect(() => {
// //     async function fetchUnit() {
// //       try {
// //         const token = localStorage.getItem("token");
// //         // If no API is ready for this, set manually or skip for now.
// //         const res = await fetch("http://localhost:5000/api/clerk/unit", { headers: { Authorization: `Bearer ${token}` }});
// //         setUnit(await res.json());
// //       } catch {
// //         setUnit(null);
// //       } finally {
// //         setLoading(false);
// //       }
// //     }
// //     fetchUnit();
// //   }, []);

// //   const sidebar = [
// //     { key: "dashboard", label: "Dashboard", icon: "bi-house" },
// //     { key: "profile", label: "Profile", icon: "bi-person" },
// //     { key: "fees", label: "Student Fees", icon: "bi-cash" },
// //     { key: "salaries", label: "Teacher Salaries", icon: "bi-currency-dollar" },
// //     { key: "logout", label: "Logout", icon: "bi-box-arrow-right" }
// //   ];

// //   function handleMenu(key) {
// //     if (key === "logout") {
// //       localStorage.removeItem("token");
// //       navigate("/");
// //     } else {
// //       setTab(key);
// //     }
// //   }

// //   if (loading) return <div>Loading...</div>;

// //   return (
// //     <div style={{ display: "flex", minHeight: "100vh" }}>
// //       {/* Sidebar */}
// //       <aside style={{ width: 220, background: "#212b36", color: "#fff", paddingTop: 30 }}>
// //         <div style={{ paddingLeft: 24, fontWeight: "bold" }}>Clerk Panel</div>
// //         <nav style={{ marginTop: 25 }}>
// //           {sidebar.map((item) => (
// //             <button key={item.key}
// //               className="nav-link"
// //               style={{
// //                 background: tab === item.key ? "#2a3b4d" : "transparent",
// //                 color: tab === item.key ? "#0dcaf0" : "#fff",
// //                 border: "none",
// //                 width: "100%",
// //                 padding: 12,
// //                 textAlign: "left",
// //                 cursor: "pointer"
// //               }}
// //               onClick={() => handleMenu(item.key)}
// //             >
// //               <i className={`bi me-2 ${item.icon}`}></i>
// //               {item.label}
// //             </button>
// //           ))}
// //         </nav>
// //       </aside>
// //       {/* Main content */}
// //       <main style={{ flex: 1, padding: 32 }}>
// //         {tab === "dashboard" && (
// //           <div>
// //             <h2>School Unit Details</h2>
// //             {unit 
// //               ? (<table className="table">
// //                   <tbody>
// //                     <tr><th>Unit Name</th><td>{unit.unit_name}</td></tr>
// //                     <tr><th>Location</th><td>{unit.location}</td></tr>
// //                     <tr><th>Contact</th><td>{unit.contact}</td></tr>
// //                     {/* Add more fields as per your schema */}
// //                   </tbody>
// //                 </table>
// //                 )
// //               : <div>No unit info found.</div>}
// //           </div>
// //         )}
// //         {tab === "profile" && <ClerkProfile />}
// //         {tab === "fees" && <StudentFees />}
// //         {tab === "salaries" && <TeacherSalaries />}
// //       </main>
// //     </div>
// //   );
// // }

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import ClerkProfile from "./Profile";
// import StudentFees from "./StudentFees";
// import TeacherSalaries from "./TeacherSalaries";

// export default function ClerkDashboard() {
//   const [tab, setTab] = useState("dashboard");
//   const [dashboard, setDashboard] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     async function fetchDashboard() {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await fetch("http://localhost:5000/api/clerk/unit", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setDashboard(await res.json());
//       } catch {
//         setDashboard(null);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchDashboard();
//   }, []);

//   const sidebar = [
//     { key: "dashboard", label: "Dashboard", icon: "bi-house" },
//     { key: "profile", label: "Profile", icon: "bi-person" },
//     { key: "fees", label: "Student Fees", icon: "bi-cash" },
//     { key: "salaries", label: "Teacher Salaries", icon: "bi-currency-dollar" },
//     { key: "logout", label: "Logout", icon: "bi-box-arrow-right" },
//   ];

//   function handleMenu(key) {
//     if (key === "logout") {
//       localStorage.removeItem("token");
//       navigate("/");
//     } else {
//       setTab(key);
//     }
//   }

//   if (loading) return <div>Loading...</div>;

//   return (
//     <div style={{ display: "flex", minHeight: "100vh" }}>
//       {/* Sidebar */}
//       <aside style={{ width: 220, background: "#212b36", color: "#fff", paddingTop: 30 }}>
//         <div style={{ paddingLeft: 24, fontWeight: "bold" }}>Clerk Panel</div>
//         <nav style={{ marginTop: 25 }}>
//           {sidebar.map((item) => (
//             <button key={item.key}
//               className="nav-link"
//               style={{
//                 background: tab === item.key ? "#2a3b4d" : "transparent",
//                 color: tab === item.key ? "#0dcaf0" : "#fff",
//                 border: "none",
//                 width: "100%",
//                 padding: 12,
//                 textAlign: "left",
//                 cursor: "pointer"
//               }}
//               onClick={() => handleMenu(item.key)}
//             >
//               <i className={`bi me-2 ${item.icon}`}></i>
//               {item.label}
//             </button>
//           ))}
//         </nav>
//       </aside>
//       {/* Main content */}
//       <main style={{ flex: 1, padding: 32 }}>
//         {tab === "dashboard" && (
//           <div>
//             <h2>School Unit Details</h2>
//             {dashboard?.unit ? (
//               <table className="table">
//                 <tbody>
//                   <tr><th>Unit Name</th><td>{dashboard.unit.unit_name}</td></tr>
//                   <tr><th>Location</th><td>{dashboard.unit.location}</td></tr>
//                   <tr><th>Contact</th><td>{dashboard.unit.contact}</td></tr>
//                   <tr><th>Number of Teachers</th><td>{dashboard.teacherCount}</td></tr>
//                   <tr><th>Number of Students</th><td>{dashboard.studentCount}</td></tr>
//                 </tbody>
//               </table>
//             ) : (
//               <div>No unit info found.</div>
//             )}
//           </div>
//         )}
//         {tab === "profile" && <ClerkProfile />}
//         {tab === "fees" && <StudentFees />}
//         {tab === "salaries" && <TeacherSalaries />}
//       </main>
//     </div>
//   );
// }

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import ClerkProfile from "./Profile";
// import StudentFees from "./StudentFees";
// import TeacherSalaries from "./TeacherSalaries";

// export default function ClerkDashboard() {
//   const [tab, setTab] = useState("dashboard");
//   const [dashboard, setDashboard] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [checkingProfile, setCheckingProfile] = useState(true);
//   const navigate = useNavigate();

//   // Step 1: Check if clerk profile exists before loading dashboard
//   useEffect(() => {
//     async function checkProfile() {
//       const token = localStorage.getItem("token");
//       try {
//         const res = await fetch("http://localhost:5000/api/clerk/me", {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         if (res.status === 404) {
//           // Redirect to onboarding if profile is missing
//           navigate("/clerk/onboarding", { replace: true });
//         } else {
//           setCheckingProfile(false); // Profile exists!
//         }
//       } catch {
//         setCheckingProfile(false); // Still try dashboard for network errors
//       }
//     }
//     checkProfile();
//   }, [navigate]);

//   // Step 2: Only fetch dashboard after profile check completes and succeeds
//   useEffect(() => {
//     if (checkingProfile) return;
//     async function fetchDashboard() {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await fetch("http://localhost:5000/api/clerk/unit", {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         setDashboard(await res.json());
//       } catch {
//         setDashboard(null);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchDashboard();
//   }, [checkingProfile]);

//   const sidebar = [
//     { key: "dashboard", label: "Dashboard", icon: "bi-house" },
//     { key: "profile", label: "Profile", icon: "bi-person" },
//     { key: "fees", label: "Student Fees", icon: "bi-cash" },
//     { key: "salaries", label: "Teacher Salaries", icon: "bi-currency-dollar" },
//     { key: "logout", label: "Logout", icon: "bi-box-arrow-right" },
//   ];

//   function handleMenu(key) {
//     if (key === "logout") {
//       localStorage.removeItem("token");
//       navigate("/");
//     } else {
//       setTab(key);
//     }
//   }

//   if (checkingProfile) return <div>Checking profile...</div>;
//   if (loading) return <div>Loading...</div>;

//   return (
//     <div style={{ display: "flex", minHeight: "100vh" }}>
//       {/* Sidebar */}
//       <aside style={{ width: 220, background: "#212b36", color: "#fff", paddingTop: 30 }}>
//         <div style={{ paddingLeft: 24, fontWeight: "bold" }}>Clerk Panel</div>
//         <nav style={{ marginTop: 25 }}>
//           {sidebar.map((item) => (
//             <button key={item.key}
//               className="nav-link"
//               style={{
//                 background: tab === item.key ? "#2a3b4d" : "transparent",
//                 color: tab === item.key ? "#0dcaf0" : "#fff",
//                 border: "none",
//                 width: "100%",
//                 padding: 12,
//                 textAlign: "left",
//                 cursor: "pointer"
//               }}
//               onClick={() => handleMenu(item.key)}
//             >
//               <i className={`bi me-2 ${item.icon}`}></i>
//               {item.label}
//             </button>
//           ))}
//         </nav>
//       </aside>
//       {/* Main content */}
//       <main style={{ flex: 1, padding: 32 }}>
//         {tab === "dashboard" && (
//           <div>
//             <h2>School Unit Details</h2>
//             {dashboard?.unit ? (
//               <table className="table">
//                 <tbody>
//                   <tr><th>Unit Name</th><td>{dashboard.unit.unit_name}</td></tr>
//                   <tr><th>Location</th><td>{dashboard.unit.location}</td></tr>
//                   <tr><th>Contact</th><td>{dashboard.unit.contact}</td></tr>
//                   <tr><th>Number of Teachers</th><td>{dashboard.teacherCount}</td></tr>
//                   <tr><th>Number of Students</th><td>{dashboard.studentCount}</td></tr>
//                 </tbody>
//               </table>
//             ) : (
//               <div>No unit info found.</div>
//             )}
//           </div>
//         )}
//         {tab === "profile" && <ClerkProfile />}
//         {tab === "fees" && <StudentFees />}
//         {tab === "salaries" && <TeacherSalaries />}
//       </main>
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ClerkProfile from "./Profile";
import StudentFees from "./StudentFees";
import TeacherSalaries from "./TeacherSalaries";
import ChatWidget from "../../components/ChatWidget";

export default function ClerkDashboard() {
  const [tab, setTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkProfile() {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:5000/api/clerk/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 404) {
          navigate("/clerk/onboarding", { replace: true });
        } else {
          setCheckingProfile(false);
        }
      } catch {
        setCheckingProfile(false);
      }
    }
    checkProfile();
  }, [navigate]);

  useEffect(() => {
    if (checkingProfile) return;
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/clerk/unit", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboard(await res.json());
      } catch {
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [checkingProfile]);

  const sidebar = [
    { key: "dashboard", label: "Dashboard", icon: "bi-house" },
    { key: "profile", label: "Profile", icon: "bi-person" },
    { key: "fees", label: "Student Fees", icon: "bi-cash" },
    { key: "salaries", label: "Teacher Salaries", icon: "bi-currency-dollar" },
    { key: "logout", label: "Logout", icon: "bi-box-arrow-right" },
  ];

  function handleMenu(key) {
    if (key === "logout") {
      localStorage.removeItem("token");
      navigate("/");
    } else {
      setTab(key);
    }
  }

  if (checkingProfile) return <div>Checking profile...</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: "#212b36", color: "#fff", paddingTop: 30 }}>
        <div style={{ paddingLeft: 24, fontWeight: "bold" }}>Clerk Panel</div>
        <nav style={{ marginTop: 25 }}>
          {sidebar.map((item) => (
            <button key={item.key}
              className="nav-link"
              style={{
                background: tab === item.key ? "#2a3b4d" : "transparent",
                color: tab === item.key ? "#0dcaf0" : "#fff",
                border: "none",
                width: "100%",
                padding: 12,
                textAlign: "left",
                cursor: "pointer"
              }}
              onClick={() => handleMenu(item.key)}
            >
              <i className={`bi me-2 ${item.icon}`}></i>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main content */}
      <main style={{ flex: 1, padding: 32 }}>
        {tab === "dashboard" && (
          <div>
            <h2>School Unit Details</h2>
            {dashboard?.unit ? (
              <table className="table">
                <tbody>
                  {/* Dynamically loop through all columns/values */}
                  {Object.entries(dashboard.unit).map(([key, value]) => (
                    <tr key={key}>
                      <th style={{ textTransform: "capitalize" }}>{key.replace(/_/g, " ")}</th>
                      <td>{value !== null ? value : "-"}</td>
                    </tr>
                  ))}
                  <tr>
                    <th>Teacher Count</th>
                    <td>{dashboard.teacherCount}</td>
                  </tr>
                  <tr>
                    <th>Student Count</th>
                    <td>{dashboard.studentCount}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div>No unit info found.</div>
            )}
          </div>
        )}
        {tab === "profile" && <ClerkProfile />}
        {tab === "fees" && <StudentFees />}
        {tab === "salaries" && <TeacherSalaries />}
      </main>
      <ChatWidget />
    </div>
  );
}
