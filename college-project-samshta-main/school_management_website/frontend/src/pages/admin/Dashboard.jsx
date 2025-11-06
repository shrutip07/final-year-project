
// // import React, { useState, useEffect } from "react";
// // import { useNavigate } from "react-router-dom";
// // import axios from "axios";
// // import { useTranslation } from "react-i18next";
// // import "./Dashboard.scss";
// // import AdminCharts from "./Charts";

// // export default function AdminDashboard() {
// //   const { t } = useTranslation();
// //   const [sidebarTab, setSidebarTab] = useState("dashboard");
// //   const [units, setUnits] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState("");
// //   const [selectedUnit, setSelectedUnit] = useState(null);
// //   const [unitDetails, setUnitDetails] = useState(null);
// //   const [unitLoading, setUnitLoading] = useState(false);
// //   const [teacherSearch, setTeacherSearch] = useState("");
// //   const [studentSearch, setStudentSearch] = useState("");
// //   const [teacherVisibleColumns, setTeacherVisibleColumns] = useState([
// //     "staff_id", "full_name", "email", "phone", "qualification", "designation", "subject", "joining_date", "updatedat"
// //   ]);
// //   const [studentVisibleColumns, setStudentVisibleColumns] = useState([
// //     "student_id", "full_name", "standard", "division", "roll_number", "academic_year", "passed",
// //     "dob", "gender", "address", "parent_name", "parent_phone", "admission_date", "createdat", "updatedat"
// //   ]);
// //   const [teachersShowColDropdown, setTeachersShowColDropdown] = useState(false);
// //   const [studentsShowColDropdown, setStudentsShowColDropdown] = useState(false);
// //   const [studentsYear, setStudentsYear] = useState("");
// //   const navigate = useNavigate();

// //   const sidebarItems = [
// //     { key: "dashboard", label: t("dashboard"), icon: "bi-speedometer2" },
// //     { key: "tables", label: t("tables"), icon: "bi-table" },
// //     { key: "charts", label: t("charts"), icon: "bi-bar-chart-fill" },
// //     { key: "budgets", label: t("budgets"), icon: "bi-wallet2" }
// //   ];

// //   useEffect(() => {
// //     async function fetchUnits() {
// //       try {
// //         const token = localStorage.getItem("token");
// //         const response = await axios.get("http://localhost:5000/api/admin/units", {
// //           headers: { Authorization: `Bearer ${token}` }
// //         });
// //         setUnits(response.data);
// //         setLoading(false);
// //       } catch (err) {
// //         setError(err.response?.data?.message || t("failed_load_units"));
// //         setLoading(false);
// //       }
// //     }
// //     fetchUnits();
// //     // eslint-disable-next-line
// //   }, [t]);

// //   async function handleUnitCardClick(unitId) {
// //     setUnitLoading(true);
// //     setSelectedUnit(unitId);
// //     setTeacherSearch("");
// //     setStudentSearch("");
// //     setStudentsYear(""); // Clear filter
// //     try {
// //       const token = localStorage.getItem("token");
// //       const res = await axios.get(`http://localhost:5000/api/admin/units/${unitId}`, {
// //         headers: { Authorization: `Bearer ${token}` }
// //       });
// //       setUnitDetails(res.data);
// //     } catch (err) {
// //       setError(err.response?.data?.message || "Failed to load unit details");
// //     }
// //     setUnitLoading(false);
// //   }

// //   // Teaching staff columns
// //   const teacherFields = [
// //     ["staff_id", "Staff ID"], ["full_name", "Full Name"], ["email", "Email"], ["phone", "Phone"],
// //     ["qualification", "Qualification"], ["designation", "Designation"],
// //     ["subject", "Subject"], ["joining_date", "Joining Date"], ["updatedat", "Updated At"]
// //   ];

// //   // Students + enrollments columns
// //   const studentFields = [
// //     ["student_id", "Student ID"], ["full_name", "Full Name"], ["standard", "Standard"], ["division", "Division"],
// //     ["roll_number", "Roll Number"], ["academic_year", "Academic Year"], ["passed", "Passed"],
// //     ["dob", "DOB"], ["gender", "Gender"], ["address", "Address"], ["parent_name", "Parent Name"],
// //     ["parent_phone", "Parent Phone"], ["admission_date", "Admission Date"], ["createdat", "Created At"], ["updatedat", "Updated At"]
// //   ];

// //   // Academic years present in students, sorted descending
// //   const allStudentYears = unitDetails?.students
// //     ? Array.from(new Set(unitDetails.students.map(s => s.academic_year).filter(Boolean))).sort().reverse()
// //     : [];

// //   // Teachers table - search & column selector
// //   const filteredTeachers = unitDetails?.teachers
// //     ? unitDetails.teachers.filter(t =>
// //         Object.values(t)
// //           .join(" ")
// //           .toLowerCase()
// //           .includes(teacherSearch.toLowerCase())
// //       )
// //     : [];

// //   function handleTeacherColumnToggle(key) {
// //     setTeacherVisibleColumns(prev =>
// //       prev.includes(key)
// //         ? prev.filter(col => col !== key)
// //         : [...prev, key]
// //     );
// //   }

// //   // Students table - year filter, search & column selector
// //   const filteredStudents = unitDetails?.students
// //     ? unitDetails.students.filter(
// //         s =>
// //           (!studentsYear || s.academic_year === studentsYear) &&
// //           Object.values(s)
// //             .join(" ")
// //             .toLowerCase()
// //             .includes(studentSearch.toLowerCase())
// //       )
// //     : [];

// //   function handleStudentColumnToggle(key) {
// //     setStudentVisibleColumns(prev =>
// //       prev.includes(key)
// //         ? prev.filter(col => col !== key)
// //         : [...prev, key]
// //     );
// //   }

// //   // Dynamic table for payments, budgets, banks, cases
// //   function DynamicDropdownTable({ tableName, data }) {
// //     const [visibleCols, setVisibleCols] = useState(() =>
// //       data.length ? Object.keys(data[0]) : []
// //     );
// //     const [selectShow, setSelectShow] = useState(false);

// //     useEffect(() => {
// //       // When data changes (unit switch), reset all cols to visible
// //       if (data.length) setVisibleCols(Object.keys(data[0]));
// //     }, [data]);

// //     if (!data.length) return <div className="mb-4 text-muted">{tableName} not available</div>;

// //     const cols = Object.keys(data[0]);
// //     function handleToggle(col) {
// //       setVisibleCols(prev =>
// //         prev.includes(col)
// //           ? prev.filter(c => c !== col)
// //           : [...prev, col]
// //       );
// //     }

// //     return (
// //       <div style={{ overflowX: "auto", marginBottom: 32 }}>
// //         <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
// //           <span className="fw-bold">{tableName}</span>
// //           <div className="dropdown" style={{ position: "relative" }}>
// //             <button
// //               className="btn btn-outline-secondary dropdown-toggle"
// //               type="button"
// //               onClick={() => setSelectShow(s => !s)}
// //             >
// //               Select Columns
// //             </button>
// //             {selectShow && (
// //               <div className="dropdown-menu show p-2" style={{ maxHeight: 320, overflowY: "auto", right: 0, left: "auto" }}>
// //                 {cols.map(col => (
// //                   <div key={col} className="form-check">
// //                     <input
// //                       type="checkbox"
// //                       className="form-check-input"
// //                       id={`col-check-table-${tableName}-${col}`}
// //                       checked={visibleCols.includes(col)}
// //                       onChange={() => handleToggle(col)}
// //                     />
// //                     <label className="form-check-label" htmlFor={`col-check-table-${tableName}-${col}`}>
// //                       {col}
// //                     </label>
// //                   </div>
// //                 ))}
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //         <table className="table table-striped table-bordered">
// //           <thead>
// //             <tr>
// //               {cols.filter(col => visibleCols.includes(col)).map(col =>
// //                 <th key={col}>{col}</th>
// //               )}
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {data.map((row, i) =>
// //               <tr key={tableName + "-row-" + i}>
// //                 {cols.filter(col => visibleCols.includes(col)).map(col =>
// //                   <td key={col}>
// //                     {row[col] != null ? row[col].toString() : ""}
// //                   </td>
// //                 )}
// //               </tr>
// //             )}
// //           </tbody>
// //         </table>
// //       </div>
// //     );
// //   }

// //   const renderUnitDetails = () => (
// //     <div>
// //       <button className="btn btn-secondary mb-3" onClick={() => {
// //         setSelectedUnit(null);
// //         setUnitDetails(null);
// //       }}>{t("back_to_units")}</button>
// //       <h2>{unitDetails.kendrashala_name}</h2>
// //       <div><strong>{t("total_staff")}:</strong> {unitDetails.teachers?.length ?? 0}</div>
// //       <div><strong>{t("total_students")}:</strong> {unitDetails.students?.length ?? 0}</div>

// //       {/* Unit Table */}
// //       <h4 className="mt-4">{t("school_details")}</h4>
// //       <table className="table table-bordered mb-4">
// //         <tbody>
// //           {[
// //             ["unit_id", "Unit ID"], ["semis_no", "SEMIS No"], ["dcf_no", "DCF No"],
// //             ["nmms_no", "NMMS No"], ["scholarship_code", "Scholarship Code"],
// //             ["first_grant_in_aid_year", "First Grant Year"], ["type_of_management", "Management Type"],
// //             ["school_jurisdiction", "School Jurisdiction"], ["competent_authority_name", "Competent Authority"],
// //             ["authority_number", "Authority Number"], ["authority_zone", "Authority Zone"],
// //             ["kendrashala_name", "Kendrashala Name"], ["info_authority_name", "Info Authority"],
// //             ["appellate_authority_name", "Appellate Authority"],
// //             ["midday_meal_org_name", "Midday Meal Org"],
// //             ["midday_meal_org_contact", "Midday Meal Contact"], ["standard_range", "Standard Range"],
// //             ["headmistress_name", "Headmistress Name"], ["headmistress_phone", "Headmistress Phone"],
// //             ["headmistress_email", "Headmistress Email"], ["school_shift", "School Shift"]
// //           ].map(([key, label]) => (
// //             <tr key={key}>
// //               <th>{t(key)}</th>
// //               <td>{unitDetails[key]}</td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>

// //       {/* Teachers Table */}
// //       <h4 className="mt-4">Teachers</h4>
// //       <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
// //         <input
// //           type="text"
// //           className="form-control"
// //           style={{ maxWidth: 300 }}
// //           placeholder="Search teachers by any field..."
// //           value={teacherSearch}
// //           onChange={e => setTeacherSearch(e.target.value)}
// //         />
// //         <div className="dropdown" style={{ position: "relative" }}>
// //           <button
// //             className="btn btn-outline-secondary dropdown-toggle"
// //             type="button"
// //             onClick={() => setTeachersShowColDropdown(s => !s)}
// //           >
// //             Select Columns
// //           </button>
// //           {teachersShowColDropdown && (
// //             <div className="dropdown-menu show p-2" style={{ maxHeight: 300, overflowY: "auto", right: 0, left: "auto" }}>
// //               {teacherFields.map(([key, label]) => (
// //                 <div key={key} className="form-check">
// //                   <input
// //                     type="checkbox"
// //                     className="form-check-input"
// //                     id={`col-check-teacher-${key}`}
// //                     checked={teacherVisibleColumns.includes(key)}
// //                     onChange={() => handleTeacherColumnToggle(key)}
// //                   />
// //                   <label className="form-check-label" htmlFor={`col-check-teacher-${key}`}>
// //                     {label}
// //                   </label>
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //       <div style={{ overflowX: "auto" }}>
// //         <table className="table table-striped table-bordered">
// //           <thead>
// //             <tr>
// //               {teacherFields.filter(([key]) => teacherVisibleColumns.includes(key)).map(([key, label]) => (
// //                 <th key={key}>{label}</th>
// //               ))}
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {filteredTeachers.map(t => (
// //               <tr key={t.staff_id}>
// //                 {teacherFields.filter(([key]) => teacherVisibleColumns.includes(key)).map(([key]) =>
// //                   <td key={key}>{t[key] != null ? t[key] : ""}</td>
// //                 )}
// //               </tr>
// //             ))}
// //             {filteredTeachers.length === 0 && (
// //               <tr>
// //                 <td colSpan={teacherVisibleColumns.length} className="text-center">No teachers found</td>
// //               </tr>
// //             )}
// //           </tbody>
// //         </table>
// //       </div>

// //       {/* Students Table */}
// //       <h4 className="mt-4">Students</h4>
// //       <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
// //         <input
// //           type="text"
// //           className="form-control"
// //           style={{ maxWidth: 300 }}
// //           placeholder="Search students by any field..."
// //           value={studentSearch}
// //           onChange={e => setStudentSearch(e.target.value)}
// //         />
// //         <select
// //           value={studentsYear}
// //           onChange={e => setStudentsYear(e.target.value)}
// //           className="form-control"
// //           style={{ width: 160 }}
// //         >
// //           <option value="">All Years</option>
// //           {allStudentYears.map(year => (
// //             <option value={year} key={year}>{year}</option>
// //           ))}
// //         </select>
// //         <div className="dropdown" style={{ position: "relative" }}>
// //           <button
// //             className="btn btn-outline-secondary dropdown-toggle"
// //             type="button"
// //             onClick={() => setStudentsShowColDropdown(s => !s)}
// //           >
// //             Select Columns
// //           </button>
// //           {studentsShowColDropdown && (
// //             <div className="dropdown-menu show p-2" style={{ maxHeight: 320, overflowY: "auto", right: 0, left: "auto" }}>
// //               {studentFields.map(([key, label]) => (
// //                 <div key={key} className="form-check">
// //                   <input
// //                     type="checkbox"
// //                     className="form-check-input"
// //                     id={`col-check-student-${key}`}
// //                     checked={studentVisibleColumns.includes(key)}
// //                     onChange={() => handleStudentColumnToggle(key)}
// //                   />
// //                   <label className="form-check-label" htmlFor={`col-check-student-${key}`}>
// //                     {label}
// //                   </label>
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //       <div style={{ overflowX: "auto" }}>
// //         <table className="table table-striped table-bordered">
// //           <thead>
// //             <tr>
// //               {studentFields.filter(([key]) => studentVisibleColumns.includes(key)).map(([key, label]) => (
// //                 <th key={key}>{label}</th>
// //               ))}
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {filteredStudents.map(s => (
// //               <tr key={s.student_id + "-" + s.roll_number + "-" + s.academic_year}>
// //                 {studentFields.filter(([key]) => studentVisibleColumns.includes(key)).map(([key]) =>
// //                   <td key={key}>
// //                     {key === "passed" 
// //                       ? (s[key] ? "Yes" : "No")
// //                       : (key === "dob" || key === "admission_date")
// //                         ? (s[key] ? new Date(s[key]).toLocaleDateString() : "")
// //                         : s[key] != null ? s[key] : ""}
// //                   </td>
// //                 )}
// //               </tr>
// //             ))}
// //             {filteredStudents.length === 0 && (
// //               <tr>
// //                 <td colSpan={studentVisibleColumns.length} className="text-center">No students found</td>
// //               </tr>
// //             )}
// //           </tbody>
// //         </table>
// //       </div>

// //       {/* Payments Table */}
// //       <h4 className="mt-4">Unit Payments</h4>
// //       <DynamicDropdownTable
// //         tableName="Payments"
// //         data={unitDetails.payments ?? []}
// //       />
// //       {/* Budgets Table */}
// //       <h4 className="mt-4">Unit Budgets</h4>
// //       <DynamicDropdownTable
// //         tableName="Budgets"
// //         data={unitDetails.budgets ?? []}
// //       />
// //       {/* Banks Table */}
// //       <h4 className="mt-4">Unit Banks</h4>
// //       <DynamicDropdownTable
// //         tableName="Banks"
// //         data={unitDetails.banks ?? []}
// //       />
// //       {/* Cases Table */}
// //       <h4 className="mt-4">Unit Cases</h4>
// //       <DynamicDropdownTable
// //         tableName="Cases"
// //         data={unitDetails.cases ?? []}
// //       />

// //     </div>
// //   );

// //   const renderContent = () => {
// //   switch (sidebarTab) {
// //     case "dashboard":
// //       if (selectedUnit && unitDetails) return renderUnitDetails();
// //       return (
// //         <div>
// //           <div className="page-header">
// //             <h2>{t("school_overview")}</h2>
// //             <p className="text-muted">{t("manage_monitor_all_schools")}</p>
// //           </div>
// //           <div className="row">
// //             {units.map((unit, idx) => (
// //               <div key={unit.unit_id} className="col-md-4 col-lg-3 col-sm-6 mb-4">
// //                 <div
// //                   className="card shadow-sm text-center p-3"
// //                   style={{ cursor: "pointer", borderRadius: 14 }}
// //                   onClick={() => handleUnitCardClick(unit.unit_id)}
// //                 >
// //                   <div style={{ fontSize: "2rem", fontWeight: 700 }}>{idx + 1}</div>
// //                   <div style={{ fontWeight: 600 }}>{unit.kendrashala_name}</div>
// //                   <div>{t("total_staff")}: {unit.staff_count || 0}</div>
// //                   <div>{t("total_students")}: {unit.student_count || 0}</div>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       );
// //     case "charts":
// //       // Display the admin charts page with unit selection
// //       return <AdminCharts units={units} />;
// //     default:
// //       return null;
// //   }
// // };

// //   // Main render block
// //   return (
// //     <div className="dashboard-container">
// //       <div className="sidebar">
// //         {/* ...sidebar code as before... */}
// //         <div className="sidebar-header">
// //           <div className="app-icon">
// //             <i className="bi bi-buildings-fill"></i>
// //           </div>
// //           <h3>{t("admin_panel")}</h3>
// //         </div>
// //         <nav className="sidebar-nav">
// //           {sidebarItems.map(item => (
// //             <button
// //               key={item.key}
// //               className={`nav-link ${sidebarTab === item.key ? "active" : ""}`}
// //               onClick={() => setSidebarTab(item.key)}
// //             >
// //               <i className={`bi ${item.icon}`}></i>
// //               <span>{item.label}</span>
// //             </button>
// //           ))}
// //         </nav>
// //         <div className="sidebar-footer">
// //           <button
// //             className="nav-link"
// //             onClick={() => {
// //               localStorage.removeItem("token");
// //               navigate("/login");
// //             }}
// //           >
// //             <i className="bi bi-box-arrow-left"></i>
// //             <span>{t("logout")}</span>
// //           </button>
// //         </div>
// //       </div>
// //       <main className="main-content">
// //         {loading ? (
// //           <div className="loading-spinner">
// //             <div className="spinner-border text-primary" role="status">
// //               <span className="visually-hidden">{t("loading")}...</span>
// //             </div>
// //           </div>
// //         ) : error ? (
// //           <div className="alert alert-danger m-4">{error}</div>
// //         ) : unitLoading ? (
// //           <div className="loading-spinner">
// //             <div className="spinner-border text-secondary" role="status">
// //               <span className="visually-hidden">{t("loading")}...</span>
// //             </div>
// //           </div>
// //         ) : (
// //           renderContent()
// //         )}
// //       </main>
// //     </div>
// //   );
// // }


// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useTranslation } from "react-i18next";
// import "./Dashboard.scss";
// import AdminCharts from "./Charts";

// export default function AdminDashboard() {
//   const { t } = useTranslation();
//   const [sidebarTab, setSidebarTab] = useState("dashboard");
//   const [units, setUnits] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [selectedUnit, setSelectedUnit] = useState(null);
//   const [unitDetails, setUnitDetails] = useState(null);
//   const [unitLoading, setUnitLoading] = useState(false);
//   const [teacherSearch, setTeacherSearch] = useState("");
//   const [studentSearch, setStudentSearch] = useState("");
//   const [teacherVisibleColumns, setTeacherVisibleColumns] = useState([
//     "staff_id", "full_name", "email", "phone", "qualification", "designation", "subject", "joining_date", "updatedat"
//   ]);
//   const [studentVisibleColumns, setStudentVisibleColumns] = useState([
//     "student_id", "full_name", "standard", "division", "roll_number", "academic_year", "passed",
//     "dob", "gender", "address", "parent_name", "parent_phone", "admission_date", "createdat", "updatedat"
//   ]);
//   const [teachersShowColDropdown, setTeachersShowColDropdown] = useState(false);
//   const [studentsShowColDropdown, setStudentsShowColDropdown] = useState(false);
//   const [studentsYear, setStudentsYear] = useState("");
//   const [notifications, setNotifications] = useState([]);
//   const [showNotifications, setShowNotifications] = useState(false);

//   const navigate = useNavigate();

//   const sidebarItems = [
//     { key: "dashboard", label: t("dashboard"), icon: "bi-speedometer2" },
//     { key: "tables", label: t("tables"), icon: "bi-table" },
//     { key: "charts", label: t("charts"), icon: "bi-bar-chart-fill" },
//     { key: "budgets", label: t("budgets"), icon: "bi-wallet2" },
//     { key: "notifications", label: t("notifications"), icon: "bi-bell-fill" }
//   ];

//   // Dummy notifications for demo/testing
//   useEffect(() => {
//     setNotifications([
//       { id: 1, message: "New school added" },
//       { id: 2, message: "Budget updated" },
//     ]);
//   }, []);

//   useEffect(() => {
//     async function fetchUnits() {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await axios.get("http://localhost:5000/api/admin/units", {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setUnits(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError(err.response?.data?.message || t("failed_load_units"));
//         setLoading(false);
//       }
//     }
//     fetchUnits();
//   }, [t]);

//   async function handleUnitCardClick(unitId) {
//     setUnitLoading(true);
//     setSelectedUnit(unitId);
//     setTeacherSearch("");
//     setStudentSearch("");
//     setStudentsYear("");
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.get(`http://localhost:5000/api/admin/units/${unitId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setUnitDetails(res.data);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to load unit details");
//     }
//     setUnitLoading(false);
//   }

//   const teacherFields = [
//     ["staff_id", "Staff ID"], ["full_name", "Full Name"], ["email", "Email"], ["phone", "Phone"],
//     ["qualification", "Qualification"], ["designation", "Designation"],
//     ["subject", "Subject"], ["joining_date", "Joining Date"], ["updatedat", "Updated At"]
//   ];

//   const studentFields = [
//     ["student_id", "Student ID"], ["full_name", "Full Name"], ["standard", "Standard"], ["division", "Division"],
//     ["roll_number", "Roll Number"], ["academic_year", "Academic Year"], ["passed", "Passed"],
//     ["dob", "DOB"], ["gender", "Gender"], ["address", "Address"], ["parent_name", "Parent Name"],
//     ["parent_phone", "Parent Phone"], ["admission_date", "Admission Date"], ["createdat", "Created At"], ["updatedat", "Updated At"]
//   ];

//   const allStudentYears = unitDetails?.students
//     ? Array.from(new Set(unitDetails.students.map(s => s.academic_year).filter(Boolean))).sort().reverse()
//     : [];

//   const filteredTeachers = unitDetails?.teachers
//     ? unitDetails.teachers.filter(t =>
//         Object.values(t)
//           .join(" ")
//           .toLowerCase()
//           .includes(teacherSearch.toLowerCase())
//       )
//     : [];

//   function handleTeacherColumnToggle(key) {
//     setTeacherVisibleColumns(prev =>
//       prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
//     );
//   }

//   const filteredStudents = unitDetails?.students
//     ? unitDetails.students.filter(
//         s =>
//           (!studentsYear || s.academic_year === studentsYear) &&
//           Object.values(s)
//             .join(" ")
//             .toLowerCase()
//             .includes(studentSearch.toLowerCase())
//       )
//     : [];

//   function handleStudentColumnToggle(key) {
//     setStudentVisibleColumns(prev =>
//       prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
//     );
//   }

//   function DynamicDropdownTable({ tableName, data }) {
//     const [visibleCols, setVisibleCols] = useState(() =>
//       data.length ? Object.keys(data[0]) : []
//     );
//     const [selectShow, setSelectShow] = useState(false);

//     useEffect(() => {
//       if (data.length) setVisibleCols(Object.keys(data[0]));
//     }, [data]);

//     if (!data.length) return <div className="mb-4 text-muted">{tableName} not available</div>;

//     const cols = Object.keys(data[0]);
//     function handleToggle(col) {
//       setVisibleCols(prev =>
//         prev.includes(col)
//           ? prev.filter(c => c !== col)
//           : [...prev, col]
//       );
//     }

//     return (
//       <div style={{ overflowX: "auto", marginBottom: 32 }}>
//         <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
//           <span className="fw-bold">{tableName}</span>
//           <div className="dropdown" style={{ position: "relative" }}>
//             <button
//               className="btn btn-outline-secondary dropdown-toggle"
//               type="button"
//               onClick={() => setSelectShow(s => !s)}
//             >
//               Select Columns
//             </button>
//             {selectShow && (
//               <div className="dropdown-menu show p-2" style={{ maxHeight: 320, overflowY: "auto", right: 0, left: "auto" }}>
//                 {cols.map(col => (
//                   <div key={col} className="form-check">
//                     <input
//                       type="checkbox"
//                       className="form-check-input"
//                       id={`col-check-table-${tableName}-${col}`}
//                       checked={visibleCols.includes(col)}
//                       onChange={() => handleToggle(col)}
//                     />
//                     <label className="form-check-label" htmlFor={`col-check-table-${tableName}-${col}`}>
//                       {col}
//                     </label>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//         <table className="table table-striped table-bordered">
//           <thead>
//             <tr>
//               {cols.filter(col => visibleCols.includes(col)).map(col =>
//                 <th key={col}>{col}</th>
//               )}
//             </tr>
//           </thead>
//           <tbody>
//             {data.map((row, i) =>
//               <tr key={tableName + "-row-" + i}>
//                 {cols.filter(col => visibleCols.includes(col)).map(col =>
//                   <td key={col}>
//                     {row[col] != null ? row[col].toString() : ""}
//                   </td>
//                 )}
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     );
//   }

//   const renderUnitDetails = () => (
//     <div>
//       <button className="btn btn-secondary mb-3" onClick={() => {
//         setSelectedUnit(null);
//         setUnitDetails(null);
//       }}>{t("back_to_units")}</button>
//       <h2>{unitDetails.kendrashala_name}</h2>
//       <div><strong>{t("total_staff")}:</strong> {unitDetails.teachers?.length ?? 0}</div>
//       <div><strong>{t("total_students")}:</strong> {unitDetails.students?.length ?? 0}</div>

//       <h4 className="mt-4">{t("school_details")}</h4>
//       <table className="table table-bordered mb-4">
//         <tbody>
//           {[
//             ["unit_id", "Unit ID"], ["semis_no", "SEMIS No"], ["dcf_no", "DCF No"],
//             ["nmms_no", "NMMS No"], ["scholarship_code", "Scholarship Code"],
//             ["first_grant_in_aid_year", "First Grant Year"], ["type_of_management", "Management Type"],
//             ["school_jurisdiction", "School Jurisdiction"], ["competent_authority_name", "Competent Authority"],
//             ["authority_number", "Authority Number"], ["authority_zone", "Authority Zone"],
//             ["kendrashala_name", "Kendrashala Name"], ["info_authority_name", "Info Authority"],
//             ["appellate_authority_name", "Appellate Authority"],
//             ["midday_meal_org_name", "Midday Meal Org"],
//             ["midday_meal_org_contact", "Midday Meal Contact"], ["standard_range", "Standard Range"],
//             ["headmistress_name", "Headmistress Name"], ["headmistress_phone", "Headmistress Phone"],
//             ["headmistress_email", "Headmistress Email"], ["school_shift", "School Shift"]
//           ].map(([key, label]) => (
//             <tr key={key}>
//               <th>{t(key)}</th>
//               <td>{unitDetails[key]}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <h4 className="mt-4">Teachers</h4>
//       <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
//         <input
//           type="text"
//           className="form-control"
//           style={{ maxWidth: 300 }}
//           placeholder="Search teachers by any field..."
//           value={teacherSearch}
//           onChange={e => setTeacherSearch(e.target.value)}
//         />
//         <div className="dropdown" style={{ position: "relative" }}>
//           <button
//             className="btn btn-outline-secondary dropdown-toggle"
//             type="button"
//             onClick={() => setTeachersShowColDropdown(s => !s)}
//           >
//             Select Columns
//           </button>
//           {teachersShowColDropdown && (
//             <div className="dropdown-menu show p-2" style={{ maxHeight: 300, overflowY: "auto", right: 0, left: "auto" }}>
//               {teacherFields.map(([key, label]) => (
//                 <div key={key} className="form-check">
//                   <input
//                     type="checkbox"
//                     className="form-check-input"
//                     id={`col-check-teacher-${key}`}
//                     checked={teacherVisibleColumns.includes(key)}
//                     onChange={() => handleTeacherColumnToggle(key)}
//                   />
//                   <label className="form-check-label" htmlFor={`col-check-teacher-${key}`}>
//                     {label}
//                   </label>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//       <div style={{ overflowX: "auto" }}>
//         <table className="table table-striped table-bordered">
//           <thead>
//             <tr>
//               {teacherFields.filter(([key]) => teacherVisibleColumns.includes(key)).map(([key, label]) => (
//                 <th key={key}>{label}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {filteredTeachers.map(t => (
//               <tr key={t.staff_id}>
//                 {teacherFields.filter(([key]) => teacherVisibleColumns.includes(key)).map(([key]) =>
//                   <td key={key}>{t[key] != null ? t[key] : ""}</td>
//                 )}
//               </tr>
//             ))}
//             {filteredTeachers.length === 0 && (
//               <tr>
//                 <td colSpan={teacherVisibleColumns.length} className="text-center">No teachers found</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       <h4 className="mt-4">Students</h4>
//       <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
//         <input
//           type="text"
//           className="form-control"
//           style={{ maxWidth: 300 }}
//           placeholder="Search students by any field..."
//           value={studentSearch}
//           onChange={e => setStudentSearch(e.target.value)}
//         />
//         <select
//           value={studentsYear}
//           onChange={e => setStudentsYear(e.target.value)}
//           className="form-control"
//           style={{ width: 160 }}
//         >
//           <option value="">All Years</option>
//           {allStudentYears.map(year => (
//             <option value={year} key={year}>{year}</option>
//           ))}
//         </select>
//         <div className="dropdown" style={{ position: "relative" }}>
//           <button
//             className="btn btn-outline-secondary dropdown-toggle"
//             type="button"
//             onClick={() => setStudentsShowColDropdown(s => !s)}
//           >
//             Select Columns
//           </button>
//           {studentsShowColDropdown && (
//             <div className="dropdown-menu show p-2" style={{ maxHeight: 320, overflowY: "auto", right: 0, left: "auto" }}>
//               {studentFields.map(([key, label]) => (
//                 <div key={key} className="form-check">
//                   <input
//                     type="checkbox"
//                     className="form-check-input"
//                     id={`col-check-student-${key}`}
//                     checked={studentVisibleColumns.includes(key)}
//                     onChange={() => handleStudentColumnToggle(key)}
//                   />
//                   <label className="form-check-label" htmlFor={`col-check-student-${key}`}>
//                     {label}
//                   </label>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//       <div style={{ overflowX: "auto" }}>
//         <table className="table table-striped table-bordered">
//           <thead>
//             <tr>
//               {studentFields.filter(([key]) => studentVisibleColumns.includes(key)).map(([key, label]) => (
//                 <th key={key}>{label}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {filteredStudents.map(s => (
//               <tr key={s.student_id + "-" + s.roll_number + "-" + s.academic_year}>
//                 {studentFields.filter(([key]) => studentVisibleColumns.includes(key)).map(([key]) =>
//                   <td key={key}>
//                     {key === "passed"
//                       ? (s[key] ? "Yes" : "No")
//                       : (key === "dob" || key === "admission_date")
//                         ? (s[key] ? new Date(s[key]).toLocaleDateString() : "")
//                         : s[key] != null ? s[key] : ""}
//                   </td>
//                 )}
//               </tr>
//             ))}
//             {filteredStudents.length === 0 && (
//               <tr>
//                 <td colSpan={studentVisibleColumns.length} className="text-center">No students found</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       <h4 className="mt-4">Unit Payments</h4>
//       <DynamicDropdownTable tableName="Payments" data={unitDetails.payments ?? []} />

//       <h4 className="mt-4">Unit Budgets</h4>
//       <DynamicDropdownTable tableName="Budgets" data={unitDetails.budgets ?? []} />

//       <h4 className="mt-4">Unit Banks</h4>
//       <DynamicDropdownTable tableName="Banks" data={unitDetails.banks ?? []} />

//       <h4 className="mt-4">Unit Cases</h4>
//       <DynamicDropdownTable tableName="Cases" data={unitDetails.cases ?? []} />
//     </div>
//   );

//   function NotificationBell() {
//     return (
//       <div className="notification-bell-container">
//         <button
//           className="btn btn-light position-relative me-3"
//           onClick={() => setShowNotifications(!showNotifications)}
//         >
//           <i className="bi bi-bell fs-5"></i>
//           {notifications.length > 0 && (
//             <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
//               {notifications.length}
//             </span>
//           )}
//         </button>
//         {showNotifications && (
//           <div
//             className="position-absolute bg-white shadow rounded p-2"
//             style={{ top: "60px", right: "20px", width: "250px", zIndex: 1000 }}
//           >
//             <h6 className="border-bottom pb-2 mb-2">{t("notifications")}</h6>
//             {notifications.length === 0 ? (
//               <p className="text-muted mb-0">{t("no_new_notifications")}</p>
//             ) : (
//               <ul className="list-unstyled mb-0">
//                 {notifications.map((n) => (
//                   <li key={n.id} className="mb-2">
//                     <i className="bi bi-dot text-primary"></i> {n.message}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         )}
//       </div>
//     );
//   }

//   const renderContent = () => {
//     switch (sidebarTab) {
//       case "dashboard":
//         if (selectedUnit && unitDetails) return renderUnitDetails();
//         return (
//           <div>
//             <div className="page-header">
//               <h2>{t("school_overview")}</h2>
//               <p className="text-muted">{t("manage_monitor_all_schools")}</p>
//             </div>
//             <div className="row">
//               {units.map((unit, idx) => (
//                 <div key={unit.unit_id} className="col-md-4 col-lg-3 col-sm-6 mb-4">
//                   <div
//                     className="card shadow-sm text-center p-3"
//                     style={{ cursor: "pointer", borderRadius: 14 }}
//                     onClick={() => handleUnitCardClick(unit.unit_id)}
//                   >
//                     <div style={{ fontSize: "2rem", fontWeight: 700 }}>{idx + 1}</div>
//                     <div style={{ fontWeight: 600 }}>{unit.kendrashala_name}</div>
//                     <div>{t("total_staff")}: {unit.staff_count || 0}</div>
//                     <div>{t("total_students")}: {unit.student_count || 0}</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         );
//       case "charts":
//         return <AdminCharts units={units} />;
//       case "notifications":
//         return (
//           <div style={{ padding: 24 }}>
//             <h5>{t("notifications")}</h5>
//             {notifications.length === 0
//               ? <p>{t("no_new_notifications")}</p>
//               : <ul>
//                   {notifications.map(n => (
//                     <li key={n.id}>{n.message}</li>
//                   ))}
//                 </ul>}
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       <div className="sidebar">
//         <div className="sidebar-header">
//           <div className="app-icon">
//             <i className="bi bi-buildings-fill"></i>
//           </div>
//           <h3>{t("admin_panel")}</h3>
//         </div>
//         <nav className="sidebar-nav">
//           {sidebarItems.map(item => (
//             <button
//               key={item.key}
//               className={`nav-link ${sidebarTab === item.key ? "active" : ""}`}
//               onClick={() => setSidebarTab(item.key)}
//             >
//               <i className={`bi ${item.icon}`}></i>
//               <span>{item.label}</span>
//             </button>
//           ))}
//         </nav>
//         <div className="sidebar-footer">
//           <button
//             className="nav-link"
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
//       <div className="top-header d-flex justify-content-end align-items-center p-3 bg-white shadow-sm position-relative">
//         <NotificationBell />
//       </div>
//       <main className="main-content">
//         {loading ? (
//           <div className="loading-spinner">
//             <div className="spinner-border text-primary" role="status">
//               <span className="visually-hidden">{t("loading")}...</span>
//             </div>
//           </div>
//         ) : error ? (
//           <div className="alert alert-danger m-4">{error}</div>
//         ) : unitLoading ? (
//           <div className="loading-spinner">
//             <div className="spinner-border text-secondary" role="status">
//               <span className="visually-hidden">{t("loading")}...</span>
//             </div>
//           </div>
//         ) : (
//           renderContent()
//         )}
//       </main>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "./Dashboard.scss";
import AdminCharts from "./Charts";

// --- Notification Form component ---
function AddNotificationForm({ onSuccess, onError }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/notifications",
        {
          title,
          message,
          sender_role: "admin",
          receiver_role: "principal"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      setMessage("");
      setLoading(false);
      if (onSuccess) onSuccess();
      alert("Notification sent to all principals!");
    } catch (err) {
      setLoading(false);
      if (onError) onError(err);
      alert("Failed to send notification: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 440, marginBottom: 24, border: "1px solid #eee", padding: 18, borderRadius: 7, background: "#fafbff" }}>
      <h5>Add New Principal Notification</h5>
      <div className="mb-2">
        <label className="form-label">Title</label>
        <input className="form-control" value={title} required onChange={e => setTitle(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="form-label">Message</label>
        <textarea className="form-control" value={message} required onChange={e => setMessage(e.target.value)} />
      </div>
      <button className="btn btn-primary" disabled={loading}>
        {loading ? "Sending..." : "Send Notification"}
      </button>
    </form>
  );
}

// --- Main Dashboard ---
export default function AdminDashboard() {
  const { t } = useTranslation();
  const [sidebarTab, setSidebarTab] = useState("dashboard");
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitDetails, setUnitDetails] = useState(null);
  const [unitLoading, setUnitLoading] = useState(false);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherVisibleColumns, setTeacherVisibleColumns] = useState([
    "staff_id", "full_name", "email", "phone", "qualification", "designation", "subject", "joining_date", "updatedat"
  ]);
  const [studentVisibleColumns, setStudentVisibleColumns] = useState([
    "student_id", "full_name", "standard", "division", "roll_number", "academic_year", "passed",
    "dob", "gender", "address", "parent_name", "parent_phone", "admission_date", "createdat", "updatedat"
  ]);
  const [teachersShowColDropdown, setTeachersShowColDropdown] = useState(false);
  const [studentsShowColDropdown, setStudentsShowColDropdown] = useState(false);
  const [studentsYear, setStudentsYear] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const navigate = useNavigate();

  const sidebarItems = [
    { key: "dashboard", label: t("dashboard"), icon: "bi-speedometer2" },
    { key: "tables", label: t("tables"), icon: "bi-table" },
    { key: "charts", label: t("charts"), icon: "bi-bar-chart-fill" },
    { key: "budgets", label: t("budgets"), icon: "bi-wallet2" },
    { key: "notifications", label: t("notifications"), icon: "bi-bell-fill" }
  ];

  // Optionally fetch notifications from DB
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/notifications?role=admin",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(res.data.reverse());
    } catch {
      setNotifications([]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    async function fetchUnits() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/admin/units", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnits(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || t("failed_load_units"));
        setLoading(false);
      }
    }
    fetchUnits();
  }, [t]);

  async function handleUnitCardClick(unitId) {
    setUnitLoading(true);
    setSelectedUnit(unitId);
    setTeacherSearch("");
    setStudentSearch("");
    setStudentsYear("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/admin/units/${unitId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUnitDetails(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load unit details");
    }
    setUnitLoading(false);
  }

  const teacherFields = [
    ["staff_id", "Staff ID"], ["full_name", "Full Name"], ["email", "Email"], ["phone", "Phone"],
    ["qualification", "Qualification"], ["designation", "Designation"],
    ["subject", "Subject"], ["joining_date", "Joining Date"], ["updatedat", "Updated At"]
  ];

  const studentFields = [
    ["student_id", "Student ID"], ["full_name", "Full Name"], ["standard", "Standard"], ["division", "Division"],
    ["roll_number", "Roll Number"], ["academic_year", "Academic Year"], ["passed", "Passed"],
    ["dob", "DOB"], ["gender", "Gender"], ["address", "Address"], ["parent_name", "Parent Name"],
    ["parent_phone", "Parent Phone"], ["admission_date", "Admission Date"], ["createdat", "Created At"], ["updatedat", "Updated At"]
  ];

  const allStudentYears = unitDetails?.students
    ? Array.from(new Set(unitDetails.students.map(s => s.academic_year).filter(Boolean))).sort().reverse()
    : [];

  const filteredTeachers = unitDetails?.teachers
    ? unitDetails.teachers.filter(t =>
        Object.values(t)
          .join(" ")
          .toLowerCase()
          .includes(teacherSearch.toLowerCase())
      )
    : [];

  function handleTeacherColumnToggle(key) {
    setTeacherVisibleColumns(prev =>
      prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
    );
  }

  const filteredStudents = unitDetails?.students
    ? unitDetails.students.filter(
        s =>
          (!studentsYear || s.academic_year === studentsYear) &&
          Object.values(s)
            .join(" ")
            .toLowerCase()
            .includes(studentSearch.toLowerCase())
      )
    : [];

  function handleStudentColumnToggle(key) {
    setStudentVisibleColumns(prev =>
      prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
    );
  }

  function DynamicDropdownTable({ tableName, data }) {
    const [visibleCols, setVisibleCols] = useState(() =>
      data.length ? Object.keys(data[0]) : []
    );
    const [selectShow, setSelectShow] = useState(false);

    useEffect(() => {
      if (data.length) setVisibleCols(Object.keys(data[0]));
    }, [data]);

    if (!data.length) return <div className="mb-4 text-muted">{tableName} not available</div>;

    const cols = Object.keys(data[0]);
    function handleToggle(col) {
      setVisibleCols(prev =>
        prev.includes(col)
          ? prev.filter(c => c !== col)
          : [...prev, col]
      );
    }

    return (
      <div style={{ overflowX: "auto", marginBottom: 32 }}>
        <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
          <span className="fw-bold">{tableName}</span>
          <div className="dropdown" style={{ position: "relative" }}>
            <button
              className="btn btn-outline-secondary dropdown-toggle"
              type="button"
              onClick={() => setSelectShow(s => !s)}
            >
              Select Columns
            </button>
            {selectShow && (
              <div className="dropdown-menu show p-2" style={{ maxHeight: 320, overflowY: "auto", right: 0, left: "auto" }}>
                {cols.map(col => (
                  <div key={col} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`col-check-table-${tableName}-${col}`}
                      checked={visibleCols.includes(col)}
                      onChange={() => handleToggle(col)}
                    />
                    <label className="form-check-label" htmlFor={`col-check-table-${tableName}-${col}`}>
                      {col}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              {cols.filter(col => visibleCols.includes(col)).map(col =>
                <th key={col}>{col}</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) =>
              <tr key={tableName + "-row-" + i}>
                {cols.filter(col => visibleCols.includes(col)).map(col =>
                  <td key={col}>
                    {row[col] != null ? row[col].toString() : ""}
                  </td>
                )}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  const renderUnitDetails = () => (
    <div>
      <button className="btn btn-secondary mb-3" onClick={() => {
        setSelectedUnit(null);
        setUnitDetails(null);
      }}>{t("back_to_units")}</button>
      <h2>{unitDetails.kendrashala_name}</h2>
      <div><strong>{t("total_staff")}:</strong> {unitDetails.teachers?.length ?? 0}</div>
      <div><strong>{t("total_students")}:</strong> {unitDetails.students?.length ?? 0}</div>

      <h4 className="mt-4">{t("school_details")}</h4>
      <table className="table table-bordered mb-4">
        <tbody>
          {[
            ["unit_id", "Unit ID"], ["semis_no", "SEMIS No"], ["dcf_no", "DCF No"],
            ["nmms_no", "NMMS No"], ["scholarship_code", "Scholarship Code"],
            ["first_grant_in_aid_year", "First Grant Year"], ["type_of_management", "Management Type"],
            ["school_jurisdiction", "School Jurisdiction"], ["competent_authority_name", "Competent Authority"],
            ["authority_number", "Authority Number"], ["authority_zone", "Authority Zone"],
            ["kendrashala_name", "Kendrashala Name"], ["info_authority_name", "Info Authority"],
            ["appellate_authority_name", "Appellate Authority"],
            ["midday_meal_org_name", "Midday Meal Org"],
            ["midday_meal_org_contact", "Midday Meal Contact"], ["standard_range", "Standard Range"],
            ["headmistress_name", "Headmistress Name"], ["headmistress_phone", "Headmistress Phone"],
            ["headmistress_email", "Headmistress Email"], ["school_shift", "School Shift"]
          ].map(([key, label]) => (
            <tr key={key}>
              <th>{t(key)}</th>
              <td>{unitDetails[key]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 className="mt-4">Teachers</h4>
      <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: 300 }}
          placeholder="Search teachers by any field..."
          value={teacherSearch}
          onChange={e => setTeacherSearch(e.target.value)}
        />
        <div className="dropdown" style={{ position: "relative" }}>
          <button
            className="btn btn-outline-secondary dropdown-toggle"
            type="button"
            onClick={() => setTeachersShowColDropdown(s => !s)}
          >
            Select Columns
          </button>
          {teachersShowColDropdown && (
            <div className="dropdown-menu show p-2" style={{ maxHeight: 300, overflowY: "auto", right: 0, left: "auto" }}>
              {teacherFields.map(([key, label]) => (
                <div key={key} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`col-check-teacher-${key}`}
                    checked={teacherVisibleColumns.includes(key)}
                    onChange={() => handleTeacherColumnToggle(key)}
                  />
                  <label className="form-check-label" htmlFor={`col-check-teacher-${key}`}>
                    {label}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              {teacherFields.filter(([key]) => teacherVisibleColumns.includes(key)).map(([key, label]) => (
                <th key={key}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.map(t => (
              <tr key={t.staff_id}>
                {teacherFields.filter(([key]) => teacherVisibleColumns.includes(key)).map(([key]) =>
                  <td key={key}>{t[key] != null ? t[key] : ""}</td>
                )}
              </tr>
            ))}
            {filteredTeachers.length === 0 && (
              <tr>
                <td colSpan={teacherVisibleColumns.length} className="text-center">No teachers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h4 className="mt-4">Students</h4>
      <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
        <input
          type="text"
          className="form-control"
          style={{ maxWidth: 300 }}
          placeholder="Search students by any field..."
          value={studentSearch}
          onChange={e => setStudentSearch(e.target.value)}
        />
        <select
          value={studentsYear}
          onChange={e => setStudentsYear(e.target.value)}
          className="form-control"
          style={{ width: 160 }}
        >
          <option value="">All Years</option>
          {allStudentYears.map(year => (
            <option value={year} key={year}>{year}</option>
          ))}
        </select>
        <div className="dropdown" style={{ position: "relative" }}>
          <button
            className="btn btn-outline-secondary dropdown-toggle"
            type="button"
            onClick={() => setStudentsShowColDropdown(s => !s)}
          >
            Select Columns
          </button>
          {studentsShowColDropdown && (
            <div className="dropdown-menu show p-2" style={{ maxHeight: 320, overflowY: "auto", right: 0, left: "auto" }}>
              {studentFields.map(([key, label]) => (
                <div key={key} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`col-check-student-${key}`}
                    checked={studentVisibleColumns.includes(key)}
                    onChange={() => handleStudentColumnToggle(key)}
                  />
                  <label className="form-check-label" htmlFor={`col-check-student-${key}`}>
                    {label}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              {studentFields.filter(([key]) => studentVisibleColumns.includes(key)).map(([key, label]) => (
                <th key={key}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(s => (
              <tr key={s.student_id + "-" + s.roll_number + "-" + s.academic_year}>
                {studentFields.filter(([key]) => studentVisibleColumns.includes(key)).map(([key]) =>
                  <td key={key}>
                    {key === "passed"
                      ? (s[key] ? "Yes" : "No")
                      : (key === "dob" || key === "admission_date")
                        ? (s[key] ? new Date(s[key]).toLocaleDateString() : "")
                        : s[key] != null ? s[key] : ""}
                  </td>
                )}
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={studentVisibleColumns.length} className="text-center">No students found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h4 className="mt-4">Unit Payments</h4>
      <DynamicDropdownTable tableName="Payments" data={unitDetails.payments ?? []} />

      <h4 className="mt-4">Unit Budgets</h4>
      <DynamicDropdownTable tableName="Budgets" data={unitDetails.budgets ?? []} />

      <h4 className="mt-4">Unit Banks</h4>
      <DynamicDropdownTable tableName="Banks" data={unitDetails.banks ?? []} />

      <h4 className="mt-4">Unit Cases</h4>
      <DynamicDropdownTable tableName="Cases" data={unitDetails.cases ?? []} />
    </div>
  );

  function NotificationBell() {
    return (
      <div className="notification-bell-container">
        <button
          className="btn btn-light position-relative me-3"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <i className="bi bi-bell fs-5"></i>
          {notifications.length > 0 && (
            <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
              {notifications.length}
            </span>
          )}
        </button>
        {showNotifications && (
          <div
            className="position-absolute bg-white shadow rounded p-2"
            style={{ top: "60px", right: "20px", width: "250px", zIndex: 1000 }}
          >
            <h6 className="border-bottom pb-2 mb-2">{t("notifications")}</h6>
            {notifications.length === 0 ? (
              <p className="text-muted mb-0">{t("no_new_notifications")}</p>
            ) : (
              <ul className="list-unstyled mb-0">
                {notifications.map((n) => (
                  <li key={n.id} className="mb-2">
                    <i className="bi bi-dot text-primary"></i> {n.message}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  }

  const renderContent = () => {
    switch (sidebarTab) {
      case "dashboard":
        if (selectedUnit && unitDetails) return renderUnitDetails();
        return (
          <div>
            <div className="page-header">
              <h2>{t("school_overview")}</h2>
              <p className="text-muted">{t("manage_monitor_all_schools")}</p>
            </div>
            <div className="row">
              {units.map((unit, idx) => (
                <div key={unit.unit_id} className="col-md-4 col-lg-3 col-sm-6 mb-4">
                  <div
                    className="card shadow-sm text-center p-3"
                    style={{ cursor: "pointer", borderRadius: 14 }}
                    onClick={() => handleUnitCardClick(unit.unit_id)}
                  >
                    <div style={{ fontSize: "2rem", fontWeight: 700 }}>{idx + 1}</div>
                    <div style={{ fontWeight: 600 }}>{unit.kendrashala_name}</div>
                    <div>{t("total_staff")}: {unit.staff_count || 0}</div>
                    <div>{t("total_students")}: {unit.student_count || 0}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case "charts":
        return <AdminCharts units={units} />;
      case "notifications":
        return (
          <div style={{ padding: 24 }}>
            <AddNotificationForm onSuccess={fetchNotifications} />
            <h5>{t("notifications")}</h5>
            {notifications.length === 0
              ? <p>{t("no_new_notifications")}</p>
              : <ul>
                  {notifications.map(n => (
                    <li key={n.id}>{n.title ? <b>{n.title}:</b> : null} {n.message}</li>
                  ))}
                </ul>}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="app-icon">
            <i className="bi bi-buildings-fill"></i>
          </div>
          <h3>{t("admin_panel")}</h3>
        </div>
        <nav className="sidebar-nav">
          {sidebarItems.map(item => (
            <button
              key={item.key}
              className={`nav-link ${sidebarTab === item.key ? "active" : ""}`}
              onClick={() => setSidebarTab(item.key)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button
            className="nav-link"
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
      <div className="top-header d-flex justify-content-end align-items-center p-3 bg-white shadow-sm position-relative">
        <NotificationBell />
      </div>
      <main className="main-content">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">{t("loading")}...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger m-4">{error}</div>
        ) : unitLoading ? (
          <div className="loading-spinner">
            <div className="spinner-border text-secondary" role="status">
              <span className="visually-hidden">{t("loading")}...</span>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
}
