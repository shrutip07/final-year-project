
// // // // // // // import React, { useState, useEffect } from "react";
// // // // // // // import { useNavigate } from "react-router-dom";
// // // // // // // import axios from "axios";
// // // // // // // import { useTranslation } from "react-i18next";
// // // // // // // import "./Dashboard.scss";
// // // // // // // import AdminCharts from "./Charts";

// // // // // // // // --- Notification Form component ---
// // // // // // // function AddNotificationForm({ onSuccess, onError }) {
// // // // // // //   const [title, setTitle] = useState("");
// // // // // // //   const [message, setMessage] = useState("");
// // // // // // //   const [loading, setLoading] = useState(false);

// // // // // // //   const handleSubmit = async e => {
// // // // // // //     e.preventDefault();
// // // // // // //     setLoading(true);
// // // // // // //     try {
// // // // // // //       const token = localStorage.getItem("token");
// // // // // // //       await axios.post(
// // // // // // //         "http://localhost:5000/api/notifications",
// // // // // // //         {
// // // // // // //           title,
// // // // // // //           message,
// // // // // // //           sender_role: "admin",
// // // // // // //           receiver_role: "principal"
// // // // // // //         },
// // // // // // //         { headers: { Authorization: `Bearer ${token}` } }
// // // // // // //       );
// // // // // // //       setTitle("");
// // // // // // //       setMessage("");
// // // // // // //       setLoading(false);
// // // // // // //       if (onSuccess) onSuccess();
// // // // // // //       alert("Notification sent to all principals!");
// // // // // // //     } catch (err) {
// // // // // // //       setLoading(false);
// // // // // // //       if (onError) onError(err);
// // // // // // //       alert("Failed to send notification: " + (err.response?.data?.error || err.message));
// // // // // // //     }
// // // // // // //   };

// // // // // // //   return (
// // // // // // //     <form onSubmit={handleSubmit} style={{ maxWidth: 440, marginBottom: 24, border: "1px solid #eee", padding: 18, borderRadius: 7, background: "#fafbff" }}>
// // // // // // //       <h5>Add New Principal Notification</h5>
// // // // // // //       <div className="mb-2">
// // // // // // //         <label className="form-label">Title</label>
// // // // // // //         <input className="form-control" value={title} required onChange={e => setTitle(e.target.value)} />
// // // // // // //       </div>
// // // // // // //       <div className="mb-2">
// // // // // // //         <label className="form-label">Message</label>
// // // // // // //         <textarea className="form-control" value={message} required onChange={e => setMessage(e.target.value)} />
// // // // // // //       </div>
// // // // // // //       <button className="btn btn-primary" disabled={loading}>
// // // // // // //         {loading ? "Sending..." : "Send Notification"}
// // // // // // //       </button>
// // // // // // //     </form>
// // // // // // //   );
// // // // // // // }

// // // // // // // // --- Main Dashboard ---
// // // // // // // export default function AdminDashboard() {
// // // // // // //   const { t } = useTranslation();
// // // // // // //   const [sidebarTab, setSidebarTab] = useState("dashboard");
// // // // // // //   const [units, setUnits] = useState([]);
// // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // //   const [error, setError] = useState("");
// // // // // // //   const [selectedUnit, setSelectedUnit] = useState(null);
// // // // // // //   const [unitDetails, setUnitDetails] = useState(null);
// // // // // // //   const [unitLoading, setUnitLoading] = useState(false);
// // // // // // //   const [teacherSearch, setTeacherSearch] = useState("");
// // // // // // //   const [studentSearch, setStudentSearch] = useState("");
// // // // // // //   const [teacherVisibleColumns, setTeacherVisibleColumns] = useState([
// // // // // // //     "staff_id", "full_name", "email", "phone", "qualification", "designation", "subject", "joining_date", "updatedat"
// // // // // // //   ]);
// // // // // // //   const [studentVisibleColumns, setStudentVisibleColumns] = useState([
// // // // // // //     "student_id", "full_name", "standard", "division", "roll_number", "academic_year", "passed",
// // // // // // //     "dob", "gender", "address", "parent_name", "parent_phone", "admission_date", "createdat", "updatedat"
// // // // // // //   ]);
// // // // // // //   const [teachersShowColDropdown, setTeachersShowColDropdown] = useState(false);
// // // // // // //   const [studentsShowColDropdown, setStudentsShowColDropdown] = useState(false);
// // // // // // //   const [studentsYear, setStudentsYear] = useState("");
// // // // // // //   const [notifications, setNotifications] = useState([]);
// // // // // // //   const [showNotifications, setShowNotifications] = useState(false);

// // // // // // //   const navigate = useNavigate();

// // // // // // //   const sidebarItems = [
// // // // // // //     { key: "dashboard", label: t("dashboard"), icon: "bi-speedometer2" },
// // // // // // //     { key: "tables", label: t("tables"), icon: "bi-table" },
// // // // // // //     { key: "charts", label: t("charts"), icon: "bi-bar-chart-fill" },
// // // // // // //     { key: "budgets", label: t("budgets"), icon: "bi-wallet2" },
// // // // // // //     { key: "notifications", label: t("notifications"), icon: "bi-bell-fill" }
// // // // // // //   ];

// // // // // // //   // Optionally fetch notifications from DB
// // // // // // //   const fetchNotifications = async () => {
// // // // // // //     try {
// // // // // // //       const token = localStorage.getItem("token");
// // // // // // //       const res = await axios.get(
// // // // // // //         "http://localhost:5000/api/notifications?role=admin",
// // // // // // //         { headers: { Authorization: `Bearer ${token}` } }
// // // // // // //       );
// // // // // // //       setNotifications(res.data.reverse());
// // // // // // //     } catch {
// // // // // // //       setNotifications([]);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   useEffect(() => {
// // // // // // //     fetchNotifications();
// // // // // // //   }, []);

// // // // // // //   useEffect(() => {
// // // // // // //     async function fetchUnits() {
// // // // // // //       try {
// // // // // // //         const token = localStorage.getItem("token");
// // // // // // //         const response = await axios.get("http://localhost:5000/api/admin/units", {
// // // // // // //           headers: { Authorization: `Bearer ${token}` }
// // // // // // //         });
// // // // // // //         setUnits(response.data);
// // // // // // //         setLoading(false);
// // // // // // //       } catch (err) {
// // // // // // //         setError(err.response?.data?.message || t("failed_load_units"));
// // // // // // //         setLoading(false);
// // // // // // //       }
// // // // // // //     }
// // // // // // //     fetchUnits();
// // // // // // //   }, [t]);

// // // // // // //   async function handleUnitCardClick(unitId) {
// // // // // // //     setUnitLoading(true);
// // // // // // //     setSelectedUnit(unitId);
// // // // // // //     setTeacherSearch("");
// // // // // // //     setStudentSearch("");
// // // // // // //     setStudentsYear("");
// // // // // // //     try {
// // // // // // //       const token = localStorage.getItem("token");
// // // // // // //       const res = await axios.get(`http://localhost:5000/api/admin/units/${unitId}`, {
// // // // // // //         headers: { Authorization: `Bearer ${token}` }
// // // // // // //       });
// // // // // // //       setUnitDetails(res.data);
// // // // // // //     } catch (err) {
// // // // // // //       setError(err.response?.data?.message || "Failed to load unit details");
// // // // // // //     }
// // // // // // //     setUnitLoading(false);
// // // // // // //   }

// // // // // // //   const teacherFields = [
// // // // // // //     ["staff_id", "Staff ID"], ["full_name", "Full Name"], ["email", "Email"], ["phone", "Phone"],
// // // // // // //     ["qualification", "Qualification"], ["designation", "Designation"],
// // // // // // //     ["subject", "Subject"], ["joining_date", "Joining Date"], ["updatedat", "Updated At"]
// // // // // // //   ];

// // // // // // //   const studentFields = [
// // // // // // //     ["student_id", "Student ID"], ["full_name", "Full Name"], ["standard", "Standard"], ["division", "Division"],
// // // // // // //     ["roll_number", "Roll Number"], ["academic_year", "Academic Year"], ["passed", "Passed"],
// // // // // // //     ["dob", "DOB"], ["gender", "Gender"], ["address", "Address"], ["parent_name", "Parent Name"],
// // // // // // //     ["parent_phone", "Parent Phone"], ["admission_date", "Admission Date"], ["createdat", "Created At"], ["updatedat", "Updated At"]
// // // // // // //   ];

// // // // // // //   const allStudentYears = unitDetails?.students
// // // // // // //     ? Array.from(new Set(unitDetails.students.map(s => s.academic_year).filter(Boolean))).sort().reverse()
// // // // // // //     : [];

// // // // // // //   const filteredTeachers = unitDetails?.teachers
// // // // // // //     ? unitDetails.teachers.filter(t =>
// // // // // // //         Object.values(t)
// // // // // // //           .join(" ")
// // // // // // //           .toLowerCase()
// // // // // // //           .includes(teacherSearch.toLowerCase())
// // // // // // //       )
// // // // // // //     : [];

// // // // // // //   function handleTeacherColumnToggle(key) {
// // // // // // //     setTeacherVisibleColumns(prev =>
// // // // // // //       prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
// // // // // // //     );
// // // // // // //   }

// // // // // // //   const filteredStudents = unitDetails?.students
// // // // // // //     ? unitDetails.students.filter(
// // // // // // //         s =>
// // // // // // //           (!studentsYear || s.academic_year === studentsYear) &&
// // // // // // //           Object.values(s)
// // // // // // //             .join(" ")
// // // // // // //             .toLowerCase()
// // // // // // //             .includes(studentSearch.toLowerCase())
// // // // // // //       )
// // // // // // //     : [];

// // // // // // //   function handleStudentColumnToggle(key) {
// // // // // // //     setStudentVisibleColumns(prev =>
// // // // // // //       prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
// // // // // // //     );
// // // // // // //   }

// // // // // // //   function DynamicDropdownTable({ tableName, data }) {
// // // // // // //     const [visibleCols, setVisibleCols] = useState(() =>
// // // // // // //       data.length ? Object.keys(data[0]) : []
// // // // // // //     );
// // // // // // //     const [selectShow, setSelectShow] = useState(false);

// // // // // // //     useEffect(() => {
// // // // // // //       if (data.length) setVisibleCols(Object.keys(data[0]));
// // // // // // //     }, [data]);

// // // // // // //     if (!data.length) return <div className="mb-4 text-muted">{tableName} not available</div>;

// // // // // // //     const cols = Object.keys(data[0]);
// // // // // // //     function handleToggle(col) {
// // // // // // //       setVisibleCols(prev =>
// // // // // // //         prev.includes(col)
// // // // // // //           ? prev.filter(c => c !== col)
// // // // // // //           : [...prev, col]
// // // // // // //       );
// // // // // // //     }

// // // // // // //     return (
// // // // // // //       <div style={{ overflowX: "auto", marginBottom: 32 }}>
// // // // // // //         <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
// // // // // // //           <span className="fw-bold">{tableName}</span>
// // // // // // //           <div className="dropdown" style={{ position: "relative" }}>
// // // // // // //             <button
// // // // // // //               className="btn btn-outline-secondary dropdown-toggle"
// // // // // // //               type="button"
// // // // // // //               onClick={() => setSelectShow(s => !s)}
// // // // // // //             >
// // // // // // //               Select Columns
// // // // // // //             </button>
// // // // // // //             {selectShow && (
// // // // // // //               <div className="dropdown-menu show p-2" style={{ maxHeight: 320, overflowY: "auto", right: 0, left: "auto" }}>
// // // // // // //                 {cols.map(col => (
// // // // // // //                   <div key={col} className="form-check">
// // // // // // //                     <input
// // // // // // //                       type="checkbox"
// // // // // // //                       className="form-check-input"
// // // // // // //                       id={`col-check-table-${tableName}-${col}`}
// // // // // // //                       checked={visibleCols.includes(col)}
// // // // // // //                       onChange={() => handleToggle(col)}
// // // // // // //                     />
// // // // // // //                     <label className="form-check-label" htmlFor={`col-check-table-${tableName}-${col}`}>
// // // // // // //                       {col}
// // // // // // //                     </label>
// // // // // // //                   </div>
// // // // // // //                 ))}
// // // // // // //               </div>
// // // // // // //             )}
// // // // // // //           </div>
// // // // // // //         </div>
// // // // // // //         <table className="table table-striped table-bordered">
// // // // // // //           <thead>
// // // // // // //             <tr>
// // // // // // //               {cols.filter(col => visibleCols.includes(col)).map(col =>
// // // // // // //                 <th key={col}>{col}</th>
// // // // // // //               )}
// // // // // // //             </tr>
// // // // // // //           </thead>
// // // // // // //           <tbody>
// // // // // // //             {data.map((row, i) =>
// // // // // // //               <tr key={tableName + "-row-" + i}>
// // // // // // //                 {cols.filter(col => visibleCols.includes(col)).map(col =>
// // // // // // //                   <td key={col}>
// // // // // // //                     {row[col] != null ? row[col].toString() : ""}
// // // // // // //                   </td>
// // // // // // //                 )}
// // // // // // //               </tr>
// // // // // // //             )}
// // // // // // //           </tbody>
// // // // // // //         </table>
// // // // // // //       </div>
// // // // // // //     );
// // // // // // //   }

// // // // // // //   const renderUnitDetails = () => (
// // // // // // //     <div>
// // // // // // //       <button className="btn btn-secondary mb-3" onClick={() => {
// // // // // // //         setSelectedUnit(null);
// // // // // // //         setUnitDetails(null);
// // // // // // //       }}>{t("back_to_units")}</button>
// // // // // // //       <h2>{unitDetails.kendrashala_name}</h2>
// // // // // // //       <div><strong>{t("total_staff")}:</strong> {unitDetails.teachers?.length ?? 0}</div>
// // // // // // //       <div><strong>{t("total_students")}:</strong> {unitDetails.students?.length ?? 0}</div>

// // // // // // //       <h4 className="mt-4">{t("school_details")}</h4>
// // // // // // //       <table className="table table-bordered mb-4">
// // // // // // //         <tbody>
// // // // // // //           {[
// // // // // // //             ["unit_id", "Unit ID"], ["semis_no", "SEMIS No"], ["dcf_no", "DCF No"],
// // // // // // //             ["nmms_no", "NMMS No"], ["scholarship_code", "Scholarship Code"],
// // // // // // //             ["first_grant_in_aid_year", "First Grant Year"], ["type_of_management", "Management Type"],
// // // // // // //             ["school_jurisdiction", "School Jurisdiction"], ["competent_authority_name", "Competent Authority"],
// // // // // // //             ["authority_number", "Authority Number"], ["authority_zone", "Authority Zone"],
// // // // // // //             ["kendrashala_name", "Kendrashala Name"], ["info_authority_name", "Info Authority"],
// // // // // // //             ["appellate_authority_name", "Appellate Authority"],
// // // // // // //             ["midday_meal_org_name", "Midday Meal Org"],
// // // // // // //             ["midday_meal_org_contact", "Midday Meal Contact"], ["standard_range", "Standard Range"],
// // // // // // //             ["headmistress_name", "Headmistress Name"], ["headmistress_phone", "Headmistress Phone"],
// // // // // // //             ["headmistress_email", "Headmistress Email"], ["school_shift", "School Shift"]
// // // // // // //           ].map(([key, label]) => (
// // // // // // //             <tr key={key}>
// // // // // // //               <th>{t(key)}</th>
// // // // // // //               <td>{unitDetails[key]}</td>
// // // // // // //             </tr>
// // // // // // //           ))}
// // // // // // //         </tbody>
// // // // // // //       </table>

// // // // // // //       <h4 className="mt-4">Teachers</h4>
// // // // // // //       <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
// // // // // // //         <input
// // // // // // //           type="text"
// // // // // // //           className="form-control"
// // // // // // //           style={{ maxWidth: 300 }}
// // // // // // //           placeholder="Search teachers by any field..."
// // // // // // //           value={teacherSearch}
// // // // // // //           onChange={e => setTeacherSearch(e.target.value)}
// // // // // // //         />
// // // // // // //         <div className="dropdown" style={{ position: "relative" }}>
// // // // // // //           <button
// // // // // // //             className="btn btn-outline-secondary dropdown-toggle"
// // // // // // //             type="button"
// // // // // // //             onClick={() => setTeachersShowColDropdown(s => !s)}
// // // // // // //           >
// // // // // // //             Select Columns
// // // // // // //           </button>
// // // // // // //           {teachersShowColDropdown && (
// // // // // // //             <div className="dropdown-menu show p-2" style={{ maxHeight: 300, overflowY: "auto", right: 0, left: "auto" }}>
// // // // // // //               {teacherFields.map(([key, label]) => (
// // // // // // //                 <div key={key} className="form-check">
// // // // // // //                   <input
// // // // // // //                     type="checkbox"
// // // // // // //                     className="form-check-input"
// // // // // // //                     id={`col-check-teacher-${key}`}
// // // // // // //                     checked={teacherVisibleColumns.includes(key)}
// // // // // // //                     onChange={() => handleTeacherColumnToggle(key)}
// // // // // // //                   />
// // // // // // //                   <label className="form-check-label" htmlFor={`col-check-teacher-${key}`}>
// // // // // // //                     {label}
// // // // // // //                   </label>
// // // // // // //                 </div>
// // // // // // //               ))}
// // // // // // //             </div>
// // // // // // //           )}
// // // // // // //         </div>
// // // // // // //       </div>
// // // // // // //       <div style={{ overflowX: "auto" }}>
// // // // // // //         <table className="table table-striped table-bordered">
// // // // // // //           <thead>
// // // // // // //             <tr>
// // // // // // //               {teacherFields.filter(([key]) => teacherVisibleColumns.includes(key)).map(([key, label]) => (
// // // // // // //                 <th key={key}>{label}</th>
// // // // // // //               ))}
// // // // // // //             </tr>
// // // // // // //           </thead>
// // // // // // //           <tbody>
// // // // // // //             {filteredTeachers.map(t => (
// // // // // // //               <tr key={t.staff_id}>
// // // // // // //                 {teacherFields.filter(([key]) => teacherVisibleColumns.includes(key)).map(([key]) =>
// // // // // // //                   <td key={key}>{t[key] != null ? t[key] : ""}</td>
// // // // // // //                 )}
// // // // // // //               </tr>
// // // // // // //             ))}
// // // // // // //             {filteredTeachers.length === 0 && (
// // // // // // //               <tr>
// // // // // // //                 <td colSpan={teacherVisibleColumns.length} className="text-center">No teachers found</td>
// // // // // // //               </tr>
// // // // // // //             )}
// // // // // // //           </tbody>
// // // // // // //         </table>
// // // // // // //       </div>

// // // // // // //       <h4 className="mt-4">Students</h4>
// // // // // // //       <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
// // // // // // //         <input
// // // // // // //           type="text"
// // // // // // //           className="form-control"
// // // // // // //           style={{ maxWidth: 300 }}
// // // // // // //           placeholder="Search students by any field..."
// // // // // // //           value={studentSearch}
// // // // // // //           onChange={e => setStudentSearch(e.target.value)}
// // // // // // //         />
// // // // // // //         <select
// // // // // // //           value={studentsYear}
// // // // // // //           onChange={e => setStudentsYear(e.target.value)}
// // // // // // //           className="form-control"
// // // // // // //           style={{ width: 160 }}
// // // // // // //         >
// // // // // // //           <option value="">All Years</option>
// // // // // // //           {allStudentYears.map(year => (
// // // // // // //             <option value={year} key={year}>{year}</option>
// // // // // // //           ))}
// // // // // // //         </select>
// // // // // // //         <div className="dropdown" style={{ position: "relative" }}>
// // // // // // //           <button
// // // // // // //             className="btn btn-outline-secondary dropdown-toggle"
// // // // // // //             type="button"
// // // // // // //             onClick={() => setStudentsShowColDropdown(s => !s)}
// // // // // // //           >
// // // // // // //             Select Columns
// // // // // // //           </button>
// // // // // // //           {studentsShowColDropdown && (
// // // // // // //             <div className="dropdown-menu show p-2" style={{ maxHeight: 320, overflowY: "auto", right: 0, left: "auto" }}>
// // // // // // //               {studentFields.map(([key, label]) => (
// // // // // // //                 <div key={key} className="form-check">
// // // // // // //                   <input
// // // // // // //                     type="checkbox"
// // // // // // //                     className="form-check-input"
// // // // // // //                     id={`col-check-student-${key}`}
// // // // // // //                     checked={studentVisibleColumns.includes(key)}
// // // // // // //                     onChange={() => handleStudentColumnToggle(key)}
// // // // // // //                   />
// // // // // // //                   <label className="form-check-label" htmlFor={`col-check-student-${key}`}>
// // // // // // //                     {label}
// // // // // // //                   </label>
// // // // // // //                 </div>
// // // // // // //               ))}
// // // // // // //             </div>
// // // // // // //           )}
// // // // // // //         </div>
// // // // // // //       </div>
// // // // // // //       <div style={{ overflowX: "auto" }}>
// // // // // // //         <table className="table table-striped table-bordered">
// // // // // // //           <thead>
// // // // // // //             <tr>
// // // // // // //               {studentFields.filter(([key]) => studentVisibleColumns.includes(key)).map(([key, label]) => (
// // // // // // //                 <th key={key}>{label}</th>
// // // // // // //               ))}
// // // // // // //             </tr>
// // // // // // //           </thead>
// // // // // // //           <tbody>
// // // // // // //             {filteredStudents.map(s => (
// // // // // // //               <tr key={s.student_id + "-" + s.roll_number + "-" + s.academic_year}>
// // // // // // //                 {studentFields.filter(([key]) => studentVisibleColumns.includes(key)).map(([key]) =>
// // // // // // //                   <td key={key}>
// // // // // // //                     {key === "passed"
// // // // // // //                       ? (s[key] ? "Yes" : "No")
// // // // // // //                       : (key === "dob" || key === "admission_date")
// // // // // // //                         ? (s[key] ? new Date(s[key]).toLocaleDateString() : "")
// // // // // // //                         : s[key] != null ? s[key] : ""}
// // // // // // //                   </td>
// // // // // // //                 )}
// // // // // // //               </tr>
// // // // // // //             ))}
// // // // // // //             {filteredStudents.length === 0 && (
// // // // // // //               <tr>
// // // // // // //                 <td colSpan={studentVisibleColumns.length} className="text-center">No students found</td>
// // // // // // //               </tr>
// // // // // // //             )}
// // // // // // //           </tbody>
// // // // // // //         </table>
// // // // // // //       </div>

// // // // // // //       <h4 className="mt-4">Unit Payments</h4>
// // // // // // //       <DynamicDropdownTable tableName="Payments" data={unitDetails.payments ?? []} />

// // // // // // //       <h4 className="mt-4">Unit Budgets</h4>
// // // // // // //       <DynamicDropdownTable tableName="Budgets" data={unitDetails.budgets ?? []} />

// // // // // // //       <h4 className="mt-4">Unit Banks</h4>
// // // // // // //       <DynamicDropdownTable tableName="Banks" data={unitDetails.banks ?? []} />

// // // // // // //       <h4 className="mt-4">Unit Cases</h4>
// // // // // // //       <DynamicDropdownTable tableName="Cases" data={unitDetails.cases ?? []} />
// // // // // // //     </div>
// // // // // // //   );

// // // // // // //   function NotificationBell() {
// // // // // // //     return (
// // // // // // //       <div className="notification-bell-container">
// // // // // // //         <button
// // // // // // //           className="btn btn-light position-relative me-3"
// // // // // // //           onClick={() => setShowNotifications(!showNotifications)}
// // // // // // //         >
// // // // // // //           <i className="bi bi-bell fs-5"></i>
// // // // // // //           {notifications.length > 0 && (
// // // // // // //             <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
// // // // // // //               {notifications.length}
// // // // // // //             </span>
// // // // // // //           )}
// // // // // // //         </button>
// // // // // // //         {showNotifications && (
// // // // // // //           <div
// // // // // // //             className="position-absolute bg-white shadow rounded p-2"
// // // // // // //             style={{ top: "60px", right: "20px", width: "250px", zIndex: 1000 }}
// // // // // // //           >
// // // // // // //             <h6 className="border-bottom pb-2 mb-2">{t("notifications")}</h6>
// // // // // // //             {notifications.length === 0 ? (
// // // // // // //               <p className="text-muted mb-0">{t("no_new_notifications")}</p>
// // // // // // //             ) : (
// // // // // // //               <ul className="list-unstyled mb-0">
// // // // // // //                 {notifications.map((n) => (
// // // // // // //                   <li key={n.id} className="mb-2">
// // // // // // //                     <i className="bi bi-dot text-primary"></i> {n.message}
// // // // // // //                   </li>
// // // // // // //                 ))}
// // // // // // //               </ul>
// // // // // // //             )}
// // // // // // //           </div>
// // // // // // //         )}
// // // // // // //       </div>
// // // // // // //     );
// // // // // // //   }

// // // // // // //   const renderContent = () => {
// // // // // // //     switch (sidebarTab) {
// // // // // // //       case "dashboard":
// // // // // // //         if (selectedUnit && unitDetails) return renderUnitDetails();
// // // // // // //         return (
// // // // // // //           <div>
// // // // // // //             <div className="page-header">
// // // // // // //               <h2>{t("school_overview")}</h2>
// // // // // // //               <p className="text-muted">{t("manage_monitor_all_schools")}</p>
// // // // // // //             </div>
// // // // // // //             <div className="row">
// // // // // // //               {units.map((unit, idx) => (
// // // // // // //                 <div key={unit.unit_id} className="col-md-4 col-lg-3 col-sm-6 mb-4">
// // // // // // //                   <div
// // // // // // //                     className="card shadow-sm text-center p-3"
// // // // // // //                     style={{ cursor: "pointer", borderRadius: 14 }}
// // // // // // //                     onClick={() => handleUnitCardClick(unit.unit_id)}
// // // // // // //                   >
// // // // // // //                     <div style={{ fontSize: "2rem", fontWeight: 700 }}>{idx + 1}</div>
// // // // // // //                     <div style={{ fontWeight: 600 }}>{unit.kendrashala_name}</div>
// // // // // // //                     <div>{t("total_staff")}: {unit.staff_count || 0}</div>
// // // // // // //                     <div>{t("total_students")}: {unit.student_count || 0}</div>
// // // // // // //                   </div>
// // // // // // //                 </div>
// // // // // // //               ))}
// // // // // // //             </div>
// // // // // // //           </div>
// // // // // // //         );
// // // // // // //       case "charts":
// // // // // // //         return <AdminCharts units={units} />;
// // // // // // //       case "notifications":
// // // // // // //         return (
// // // // // // //           <div style={{ padding: 24 }}>
// // // // // // //             <AddNotificationForm onSuccess={fetchNotifications} />
// // // // // // //             <h5>{t("notifications")}</h5>
// // // // // // //             {notifications.length === 0
// // // // // // //               ? <p>{t("no_new_notifications")}</p>
// // // // // // //               : <ul>
// // // // // // //                   {notifications.map(n => (
// // // // // // //                     <li key={n.id}>{n.title ? <b>{n.title}:</b> : null} {n.message}</li>
// // // // // // //                   ))}
// // // // // // //                 </ul>}
// // // // // // //           </div>
// // // // // // //         );
// // // // // // //       default:
// // // // // // //         return null;
// // // // // // //     }
// // // // // // //   };

// // // // // // //   return (
// // // // // // //     <div className="dashboard-container">
// // // // // // //       <div className="sidebar">
// // // // // // //         <div className="sidebar-header">
// // // // // // //           <div className="app-icon">
// // // // // // //             <i className="bi bi-buildings-fill"></i>
// // // // // // //           </div>
// // // // // // //           <h3>{t("admin_panel")}</h3>
// // // // // // //         </div>
// // // // // // //         <nav className="sidebar-nav">
// // // // // // //           {sidebarItems.map(item => (
// // // // // // //             <button
// // // // // // //               key={item.key}
// // // // // // //               className={`nav-link ${sidebarTab === item.key ? "active" : ""}`}
// // // // // // //               onClick={() => setSidebarTab(item.key)}
// // // // // // //             >
// // // // // // //               <i className={`bi ${item.icon}`}></i>
// // // // // // //               <span>{item.label}</span>
// // // // // // //             </button>
// // // // // // //           ))}
// // // // // // //         </nav>
// // // // // // //         <div className="sidebar-footer">
// // // // // // //           <button
// // // // // // //             className="nav-link"
// // // // // // //             onClick={() => {
// // // // // // //               localStorage.removeItem("token");
// // // // // // //               navigate("/login");
// // // // // // //             }}
// // // // // // //           >
// // // // // // //             <i className="bi bi-box-arrow-left"></i>
// // // // // // //             <span>{t("logout")}</span>
// // // // // // //           </button>
// // // // // // //         </div>
// // // // // // //       </div>
// // // // // // //       <div className="top-header d-flex justify-content-end align-items-center p-3 bg-white shadow-sm position-relative">
// // // // // // //         <NotificationBell />
// // // // // // //       </div>
// // // // // // //       <main className="main-content">
// // // // // // //         {loading ? (
// // // // // // //           <div className="loading-spinner">
// // // // // // //             <div className="spinner-border text-primary" role="status">
// // // // // // //               <span className="visually-hidden">{t("loading")}...</span>
// // // // // // //             </div>
// // // // // // //           </div>
// // // // // // //         ) : error ? (
// // // // // // //           <div className="alert alert-danger m-4">{error}</div>
// // // // // // //         ) : unitLoading ? (
// // // // // // //           <div className="loading-spinner">
// // // // // // //             <div className="spinner-border text-secondary" role="status">
// // // // // // //               <span className="visually-hidden">{t("loading")}...</span>
// // // // // // //             </div>
// // // // // // //           </div>
// // // // // // //         ) : (
// // // // // // //           renderContent()
// // // // // // //         )}
// // // // // // //       </main>
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // }


// // // // // // import React, { useState, useEffect } from "react";
// // // // // // import { useNavigate } from "react-router-dom";
// // // // // // import axios from "axios";
// // // // // // import { useTranslation } from "react-i18next";
// // // // // // import "./Dashboard.scss";
// // // // // // import AdminCharts from "./Charts";


// // // // // // export default function AdminDashboard() {
// // // // // //   const { t } = useTranslation();
// // // // // //   const [sidebarTab, setSidebarTab] = useState("dashboard");
// // // // // //   const [units, setUnits] = useState([]);
// // // // // //   const [loading, setLoading] = useState(true);
// // // // // //   const [error, setError] = useState("");
// // // // // //   const [selectedUnit, setSelectedUnit] = useState(null);
// // // // // //   const [unitDetails, setUnitDetails] = useState(null);
// // // // // //   const [unitLoading, setUnitLoading] = useState(false);
// // // // // //   const [teacherSearch, setTeacherSearch] = useState("");
// // // // // //   const [studentSearch, setStudentSearch] = useState("");
// // // // // //   const [teacherVisibleColumns, setTeacherVisibleColumns] = useState([
// // // // // //     "staff_id", "full_name", "email", "phone", "qualification", "designation", "subject", "joining_date", "updatedat"
// // // // // //   ]);
// // // // // //   const [studentVisibleColumns, setStudentVisibleColumns] = useState([
// // // // // //     "student_id", "full_name", "standard", "division", "roll_number", "academic_year", "passed",
// // // // // //     "dob", "gender", "address", "parent_name", "parent_phone", "admission_date", "createdat", "updatedat"
// // // // // //   ]);
// // // // // //   const [teachersShowColDropdown, setTeachersShowColDropdown] = useState(false);
// // // // // //   const [studentsShowColDropdown, setStudentsShowColDropdown] = useState(false);
// // // // // //   const [studentsYear, setStudentsYear] = useState("");
// // // // // //   const [notifications, setNotifications] = useState([]);
// // // // // //   const [showNotifications, setShowNotifications] = useState(false);


// // // // // //   const navigate = useNavigate();


// // // // // //   const sidebarItems = [
// // // // // //     { key: "dashboard", label: t("dashboard"), icon: "bi-speedometer2" },
// // // // // //     { key: "tables", label: t("tables"), icon: "bi-table" },
// // // // // //     { key: "charts", label: t("charts"), icon: "bi-bar-chart-fill" },
// // // // // //     { key: "budgets", label: t("budgets"), icon: "bi-wallet2" },
// // // // // //     { key: "notifications", label: t("notifications"), icon: "bi-bell-fill" }
// // // // // //   ];


// // // // // //   useEffect(() => {
// // // // // //     async function fetchUnits() {
// // // // // //       try {
// // // // // //         const token = localStorage.getItem("token");
// // // // // //         const response = await axios.get("http://localhost:5000/api/admin/units", {
// // // // // //           headers: { Authorization: `Bearer ${token}` }
// // // // // //         });
// // // // // //         setUnits(response.data);
// // // // // //         setLoading(false);
// // // // // //       } catch (err) {
// // // // // //         setError(err.response?.data?.message || t("failed_load_units"));
// // // // // //         setLoading(false);
// // // // // //       }
// // // // // //     }
// // // // // //     fetchUnits();
// // // // // //   }, [t]);


// // // // // //   async function handleUnitCardClick(unitId) {
// // // // // //     setUnitLoading(true);
// // // // // //     setSelectedUnit(unitId);
// // // // // //     setTeacherSearch("");
// // // // // //     setStudentSearch("");
// // // // // //     setStudentsYear("");
// // // // // //     try {
// // // // // //       const token = localStorage.getItem("token");
// // // // // //       const res = await axios.get(`http://localhost:5000/api/admin/units/${unitId}`, {
// // // // // //         headers: { Authorization: `Bearer ${token}` }
// // // // // //       });
// // // // // //       setUnitDetails(res.data);
// // // // // //     } catch (err) {
// // // // // //       setError(err.response?.data?.message || "Failed to load unit details");
// // // // // //     }
// // // // // //     setUnitLoading(false);
// // // // // //   }


// // // // // //   const teacherFields = [
// // // // // //     ["staff_id", "Staff ID"], ["full_name", "Full Name"], ["email", "Email"], ["phone", "Phone"],
// // // // // //     ["qualification", "Qualification"], ["designation", "Designation"],
// // // // // //     ["subject", "Subject"], ["joining_date", "Joining Date"], ["updatedat", "Updated At"]
// // // // // //   ];


// // // // // //   const studentFields = [
// // // // // //     ["student_id", "Student ID"], ["full_name", "Full Name"], ["standard", "Standard"], ["division", "Division"],
// // // // // //     ["roll_number", "Roll Number"], ["academic_year", "Academic Year"], ["passed", "Passed"],
// // // // // //     ["dob", "DOB"], ["gender", "Gender"], ["address", "Address"], ["parent_name", "Parent Name"],
// // // // // //     ["parent_phone", "Parent Phone"], ["admission_date", "Admission Date"], ["createdat", "Created At"], ["updatedat", "Updated At"]
// // // // // //   ];


// // // // // //   const allStudentYears = unitDetails?.students
// // // // // //     ? Array.from(new Set(unitDetails.students.map(s => s.academic_year).filter(Boolean))).sort().reverse()
// // // // // //     : [];


// // // // // //   const filteredTeachers = unitDetails?.teachers
// // // // // //     ? unitDetails.teachers.filter(t =>
// // // // // //         Object.values(t)
// // // // // //           .join(" ")
// // // // // //           .toLowerCase()
// // // // // //           .includes(teacherSearch.toLowerCase())
// // // // // //       )
// // // // // //     : [];


// // // // // //   function handleTeacherColumnToggle(key) {
// // // // // //     setTeacherVisibleColumns(prev =>
// // // // // //       prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
// // // // // //     );
// // // // // //   }


// // // // // //   const filteredStudents = unitDetails?.students
// // // // // //     ? unitDetails.students.filter(
// // // // // //         s =>
// // // // // //           (!studentsYear || s.academic_year === studentsYear) &&
// // // // // //           Object.values(s)
// // // // // //             .join(" ")
// // // // // //             .toLowerCase()
// // // // // //             .includes(studentSearch.toLowerCase())
// // // // // //       )
// // // // // //     : [];


// // // // // //   function handleStudentColumnToggle(key) {
// // // // // //     setStudentVisibleColumns(prev =>
// // // // // //       prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
// // // // // //     );
// // // // // //   }


// // // // // //   function DynamicDropdownTable({ tableName, data }) {
// // // // // //     const [visibleCols, setVisibleCols] = useState(() =>
// // // // // //       data.length ? Object.keys(data[0]) : []
// // // // // //     );
// // // // // //     const [selectShow, setSelectShow] = useState(false);


// // // // // //     useEffect(() => {
// // // // // //       if (data.length) setVisibleCols(Object.keys(data[0]));
// // // // // //     }, [data]);


// // // // // //     if (!data.length) return <div className="mb-4 text-muted">{tableName} not available</div>;


// // // // // //     const cols = Object.keys(data[0]);
// // // // // //     function handleToggle(col) {
// // // // // //       setVisibleCols(prev =>
// // // // // //         prev.includes(col)
// // // // // //           ? prev.filter(c => c !== col)
// // // // // //           : [...prev, col]
// // // // // //       );
// // // // // //     }


// // // // // //     return (
// // // // // //       <div style={{ overflowX: "auto", marginBottom: 32 }}>
// // // // // //         <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
// // // // // //           <span className="fw-bold">{tableName}</span>
// // // // // //           <div className="dropdown" style={{ position: "relative" }}>
// // // // // //             <button
// // // // // //               className="btn btn-outline-secondary dropdown-toggle"
// // // // // //               type="button"
// // // // // //               onClick={() => setSelectShow(s => !s)}
// // // // // //             >
// // // // // //               Select Columns
// // // // // //             </button>
// // // // // //             {selectShow && (
// // // // // //               <div className="dropdown-menu show p-2" style={{ maxHeight: 320, overflowY: "auto", right: 0, left: "auto" }}>
// // // // // //                 {cols.map(col => (
// // // // // //                   <div key={col} className="form-check">
// // // // // //                     <input
// // // // // //                       type="checkbox"
// // // // // //                       className="form-check-input"
// // // // // //                       id={`col-check-table-${tableName}-${col}`}
// // // // // //                       checked={visibleCols.includes(col)}
// // // // // //                       onChange={() => handleToggle(col)}
// // // // // //                     />
// // // // // //                     <label className="form-check-label" htmlFor={`col-check-table-${tableName}-${col}`}>
// // // // // //                       {col}
// // // // // //                     </label>
// // // // // //                   </div>
// // // // // //                 ))}
// // // // // //               </div>
// // // // // //             )}
// // // // // //           </div>
// // // // // //         </div>
// // // // // //         <table className="table table-striped table-bordered">
// // // // // //           <thead>
// // // // // //             <tr>
// // // // // //               {cols.filter(col => visibleCols.includes(col)).map(col =>
// // // // // //                 <th key={col}>{col}</th>
// // // // // //               )}
// // // // // //             </tr>
// // // // // //           </thead>
// // // // // //           <tbody>
// // // // // //             {data.map((row, i) =>
// // // // // //               <tr key={tableName + "-row-" + i}>
// // // // // //                 {cols.filter(col => visibleCols.includes(col)).map(col =>
// // // // // //                   <td key={col}>
// // // // // //                     {row[col] != null ? row[col].toString() : ""}
// // // // // //                   </td>
// // // // // //                 )}
// // // // // //               </tr>
// // // // // //             )}
// // // // // //           </tbody>
// // // // // //         </table>
// // // // // //       </div>
// // // // // //     );
// // // // // //   }


// // // // // //   const renderUnitDetails = () => (
// // // // // //     <div>
// // // // // //       <button className="btn btn-secondary mb-3" onClick={() => {
// // // // // //         setSelectedUnit(null);
// // // // // //         setUnitDetails(null);
// // // // // //       }}>{t("back_to_units")}</button>
// // // // // //       <h2>{unitDetails.kendrashala_name}</h2>
// // // // // //       <div><strong>{t("total_staff")}:</strong> {unitDetails.teachers?.length ?? 0}</div>
// // // // // //       <div><strong>{t("total_students")}:</strong> {unitDetails.students?.length ?? 0}</div>


// // // // // //       <h4 className="mt-4">{t("school_details")}</h4>
// // // // // //       <table className="table table-bordered mb-4">
// // // // // //         <tbody>
// // // // // //           {[
// // // // // //             ["unit_id", "Unit ID"], ["semis_no", "SEMIS No"], ["dcf_no", "DCF No"],
// // // // // //             ["nmms_no", "NMMS No"], ["scholarship_code", "Scholarship Code"],
// // // // // //             ["first_grant_in_aid_year", "First Grant Year"], ["type_of_management", "Management Type"],
// // // // // //             ["school_jurisdiction", "School Jurisdiction"], ["competent_authority_name", "Competent Authority"],
// // // // // //             ["authority_number", "Authority Number"], ["authority_zone", "Authority Zone"],
// // // // // //             ["kendrashala_name", "Kendrashala Name"], ["info_authority_name", "Info Authority"],
// // // // // //             ["appellate_authority_name", "Appellate Authority"],
// // // // // //             ["midday_meal_org_name", "Midday Meal Org"],
// // // // // //             ["midday_meal_org_contact", "Midday Meal Contact"], ["standard_range", "Standard Range"],
// // // // // //             ["headmistress_name", "Headmistress Name"], ["headmistress_phone", "Headmistress Phone"],
// // // // // //             ["headmistress_email", "Headmistress Email"], ["school_shift", "School Shift"]
// // // // // //           ].map(([key, label]) => (
// // // // // //             <tr key={key}>
// // // // // //               <th>{t(key)}</th>
// // // // // //               <td>{unitDetails[key]}</td>
// // // // // //             </tr>
// // // // // //           ))}
// // // // // //         </tbody>
// // // // // //       </table>


// // // // // //       <h4 className="mt-4">Teachers</h4>
// // // // // //       <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
// // // // // //         <input
// // // // // //           type="text"
// // // // // //           className="form-control"
// // // // // //           style={{ maxWidth: 300 }}
// // // // // //           placeholder="Search teachers by any field..."
// // // // // //           value={teacherSearch}
// // // // // //           onChange={e => setTeacherSearch(e.target.value)}
// // // // // //         />
// // // // // //         <div className="dropdown" style={{ position: "relative" }}>
// // // // // //           <button
// // // // // //             className="btn btn-outline-secondary dropdown-toggle"
// // // // // //             type="button"
// // // // // //             onClick={() => setTeachersShowColDropdown(s => !s)}
// // // // // //           >
// // // // // //             Select Columns
// // // // // //           </button>
// // // // // //           {teachersShowColDropdown && (
// // // // // //             <div className="dropdown-menu show p-2" style={{ maxHeight: 300, overflowY: "auto", right: 0, left: "auto" }}>
// // // // // //               {teacherFields.map(([key, label]) => (
// // // // // //                 <div key={key} className="form-check">
// // // // // //                   <input
// // // // // //                     type="checkbox"
// // // // // //                     className="form-check-input"
// // // // // //                     id={`col-check-teacher-${key}`}
// // // // // //                     checked={teacherVisibleColumns.includes(key)}
// // // // // //                     onChange={() => handleTeacherColumnToggle(key)}
// // // // // //                   />
// // // // // //                   <label className="form-check-label" htmlFor={`col-check-teacher-${key}`}>
// // // // // //                     {label}
// // // // // //                   </label>
// // // // // //                 </div>
// // // // // //               ))}
// // // // // //             </div>
// // // // // //           )}
// // // // // //         </div>
// // // // // //       </div>
// // // // // //       <div style={{ overflowX: "auto" }}>
// // // // // //         <table className="table table-striped table-bordered">
// // // // // //           <thead>
// // // // // //             <tr>
// // // // // //               {teacherFields.filter(([key]) => teacherVisibleColumns.includes(key)).map(([key, label]) => (
// // // // // //                 <th key={key}>{label}</th>
// // // // // //               ))}
// // // // // //             </tr>
// // // // // //           </thead>
// // // // // //           <tbody>
// // // // // //             {filteredTeachers.map(t => (
// // // // // //               <tr key={t.staff_id}>
// // // // // //                 {teacherFields.filter(([key]) => teacherVisibleColumns.includes(key)).map(([key]) =>
// // // // // //                   <td key={key}>{t[key] != null ? t[key] : ""}</td>
// // // // // //                 )}
// // // // // //               </tr>
// // // // // //             ))}
// // // // // //             {filteredTeachers.length === 0 && (
// // // // // //               <tr>
// // // // // //                 <td colSpan={teacherVisibleColumns.length} className="text-center">No teachers found</td>
// // // // // //               </tr>
// // // // // //             )}
// // // // // //           </tbody>
// // // // // //         </table>
// // // // // //       </div>


// // // // // //       <h4 className="mt-4">Students</h4>
// // // // // //       <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
// // // // // //         <input
// // // // // //           type="text"
// // // // // //           className="form-control"
// // // // // //           style={{ maxWidth: 300 }}
// // // // // //           placeholder="Search students by any field..."
// // // // // //           value={studentSearch}
// // // // // //           onChange={e => setStudentSearch(e.target.value)}
// // // // // //         />
// // // // // //         <select
// // // // // //           value={studentsYear}
// // // // // //           onChange={e => setStudentsYear(e.target.value)}
// // // // // //           className="form-control"
// // // // // //           style={{ width: 160 }}
// // // // // //         >
// // // // // //           <option value="">All Years</option>
// // // // // //           {allStudentYears.map(year => (
// // // // // //             <option value={year} key={year}>{year}</option>
// // // // // //           ))}
// // // // // //         </select>
// // // // // //         <div className="dropdown" style={{ position: "relative" }}>
// // // // // //           <button
// // // // // //             className="btn btn-outline-secondary dropdown-toggle"
// // // // // //             type="button"
// // // // // //             onClick={() => setStudentsShowColDropdown(s => !s)}
// // // // // //           >
// // // // // //             Select Columns
// // // // // //           </button>
// // // // // //           {studentsShowColDropdown && (
// // // // // //             <div className="dropdown-menu show p-2" style={{ maxHeight: 320, overflowY: "auto", right: 0, left: "auto" }}>
// // // // // //               {studentFields.map(([key, label]) => (
// // // // // //                 <div key={key} className="form-check">
// // // // // //                   <input
// // // // // //                     type="checkbox"
// // // // // //                     className="form-check-input"
// // // // // //                     id={`col-check-student-${key}`}
// // // // // //                     checked={studentVisibleColumns.includes(key)}
// // // // // //                     onChange={() => handleStudentColumnToggle(key)}
// // // // // //                   />
// // // // // //                   <label className="form-check-label" htmlFor={`col-check-student-${key}`}>
// // // // // //                     {label}
// // // // // //                   </label>
// // // // // //                 </div>
// // // // // //               ))}
// // // // // //             </div>
// // // // // //           )}
// // // // // //         </div>
// // // // // //       </div>
// // // // // //       <div style={{ overflowX: "auto" }}>
// // // // // //         <table className="table table-striped table-bordered">
// // // // // //           <thead>
// // // // // //             <tr>
// // // // // //               {studentFields.filter(([key]) => studentVisibleColumns.includes(key)).map(([key, label]) => (
// // // // // //                 <th key={key}>{label}</th>
// // // // // //               ))}
// // // // // //             </tr>
// // // // // //           </thead>
// // // // // //           <tbody>
// // // // // //             {filteredStudents.map(s => (
// // // // // //               <tr key={s.student_id + "-" + s.roll_number + "-" + s.academic_year}>
// // // // // //                 {studentFields.filter(([key]) => studentVisibleColumns.includes(key)).map(([key]) =>
// // // // // //                   <td key={key}>
// // // // // //                     {key === "passed"
// // // // // //                       ? (s[key] ? "Yes" : "No")
// // // // // //                       : (key === "dob" || key === "admission_date")
// // // // // //                         ? (s[key] ? new Date(s[key]).toLocaleDateString() : "")
// // // // // //                         : s[key] != null ? s[key] : ""}
// // // // // //                   </td>
// // // // // //                 )}
// // // // // //               </tr>
// // // // // //             ))}
// // // // // //             {filteredStudents.length === 0 && (
// // // // // //               <tr>
// // // // // //                 <td colSpan={studentVisibleColumns.length} className="text-center">No students found</td>
// // // // // //               </tr>
// // // // // //             )}
// // // // // //           </tbody>
// // // // // //         </table>
// // // // // //       </div>


// // // // // //       <h4 className="mt-4">Unit Payments</h4>
// // // // // //       <DynamicDropdownTable tableName="Payments" data={unitDetails.payments ?? []} />


// // // // // //       <h4 className="mt-4">Unit Budgets</h4>
// // // // // //       <DynamicDropdownTable tableName="Budgets" data={unitDetails.budgets ?? []} />


// // // // // //       <h4 className="mt-4">Unit Banks</h4>
// // // // // //       <DynamicDropdownTable tableName="Banks" data={unitDetails.banks ?? []} />


// // // // // //       <h4 className="mt-4">Unit Cases</h4>
// // // // // //       <DynamicDropdownTable tableName="Cases" data={unitDetails.cases ?? []} />
// // // // // //     </div>
// // // // // //   );


// // // // // //   function NotificationBell() {
// // // // // //     return (
// // // // // //       <div className="notification-bell-container">
// // // // // //         <button
// // // // // //           className="btn btn-light position-relative me-3"
// // // // // //           onClick={() => setShowNotifications(!showNotifications)}
// // // // // //         >
// // // // // //           <i className="bi bi-bell fs-5"></i>
// // // // // //           {notifications.length > 0 && (
// // // // // //             <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
// // // // // //               {notifications.length}
// // // // // //             </span>
// // // // // //           )}
// // // // // //         </button>
// // // // // //         {showNotifications && (
// // // // // //           <div
// // // // // //             className="position-absolute bg-white shadow rounded p-2"
// // // // // //             style={{ top: "60px", right: "20px", width: "250px", zIndex: 1000 }}
// // // // // //           >
// // // // // //             <h6 className="border-bottom pb-2 mb-2">{t("notifications")}</h6>
// // // // // //             {notifications.length === 0 ? (
// // // // // //               <p className="text-muted mb-0">{t("no_new_notifications")}</p>
// // // // // //             ) : (
// // // // // //               <ul className="list-unstyled mb-0">
// // // // // //                 {notifications.map((n) => (
// // // // // //                   <li key={n.id} className="mb-2">
// // // // // //                     <i className="bi bi-dot text-primary"></i> {n.message}
// // // // // //                   </li>
// // // // // //                 ))}
// // // // // //               </ul>
// // // // // //             )}
// // // // // //           </div>
// // // // // //         )}
// // // // // //       </div>
// // // // // //     );
// // // // // //   }


// // // // // //   const renderContent = () => {
// // // // // //     switch (sidebarTab) {
// // // // // //       case "dashboard":
// // // // // //         if (selectedUnit && unitDetails) return renderUnitDetails();
// // // // // //         return (
// // // // // //           <div>
// // // // // //             <div className="page-header">
// // // // // //               <h2>{t("school_overview")}</h2>
// // // // // //               <p className="text-muted">{t("manage_monitor_all_schools")}</p>
// // // // // //             </div>
// // // // // //             <div className="row">
// // // // // //               {units.map((unit, idx) => (
// // // // // //                 <div key={unit.unit_id} className="col-md-4 col-lg-3 col-sm-6 mb-4">
// // // // // //                   <div
// // // // // //                     className="card shadow-sm text-center p-3"
// // // // // //                     style={{ cursor: "pointer", borderRadius: 14 }}
// // // // // //                     onClick={() => handleUnitCardClick(unit.unit_id)}
// // // // // //                   >
// // // // // //                     <div style={{ fontSize: "2rem", fontWeight: 700 }}>{idx + 1}</div>
// // // // // //                     <div style={{ fontWeight: 600 }}>{unit.kendrashala_name}</div>
// // // // // //                     <div>{t("total_staff")}: {unit.staff_count || 0}</div>
// // // // // //                     <div>{t("total_students")}: {unit.student_count || 0}</div>
// // // // // //                   </div>
// // // // // //                 </div>
// // // // // //               ))}
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         );
// // // // // //       case "charts":
// // // // // //         return <AdminCharts units={units} />;
// // // // // //       case "tables":
// // // // // //         // You may have another case to render your Tables view
// // // // // //         // return <Tables units={units} />;
// // // // // //         return null;
// // // // // //       case "budgets":
// // // // // //         // You may have another case to render your Budgets view
// // // // // //         // return <Budgets units={units} />;
// // // // // //         return null;
// // // // // //       default:
// // // // // //         return null;
// // // // // //     }
// // // // // //   };


// // // // // //   return (
// // // // // //     <div className="dashboard-container">
// // // // // //       <div className="sidebar">
// // // // // //         <div className="sidebar-header">
// // // // // //           <div className="app-icon">
// // // // // //             <i className="bi bi-buildings-fill"></i>
// // // // // //           </div>
// // // // // //           <h3>{t("admin_panel")}</h3>
// // // // // //         </div>
// // // // // //         <nav className="sidebar-nav">
// // // // // //           {sidebarItems.map(item => (
// // // // // //             <button
// // // // // //               key={item.key}
// // // // // //               className={`nav-link ${sidebarTab === item.key ? "active" : ""}`}
// // // // // //               onClick={() => {
// // // // // //                 if (item.key === "notifications") {
// // // // // //                   navigate("/admin/notifications");
// // // // // //                 } else {
// // // // // //                   setSidebarTab(item.key);
// // // // // //                 }
// // // // // //               }}
// // // // // //             >
// // // // // //               <i className={`bi ${item.icon}`}></i>
// // // // // //               <span>{item.label}</span>
// // // // // //             </button>
// // // // // //           ))}
// // // // // //         </nav>
// // // // // //         <div className="sidebar-footer">
// // // // // //           <button
// // // // // //             className="nav-link"
// // // // // //             onClick={() => {
// // // // // //               localStorage.removeItem("token");
// // // // // //               navigate("/login");
// // // // // //             }}
// // // // // //           >
// // // // // //             <i className="bi bi-box-arrow-left"></i>
// // // // // //             <span>{t("logout")}</span>
// // // // // //           </button>
// // // // // //         </div>
// // // // // //       </div>
// // // // // //       <div className="top-header d-flex justify-content-end align-items-center p-3 bg-white shadow-sm position-relative">
// // // // // //         <NotificationBell />
// // // // // //       </div>
// // // // // //       <main className="main-content">
// // // // // //         {loading ? (
// // // // // //           <div className="loading-spinner">
// // // // // //             <div className="spinner-border text-primary" role="status">
// // // // // //               <span className="visually-hidden">{t("loading")}...</span>
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         ) : error ? (
// // // // // //           <div className="alert alert-danger m-4">{error}</div>
// // // // // //         ) : unitLoading ? (
// // // // // //           <div className="loading-spinner">
// // // // // //             <div className="spinner-border text-secondary" role="status">
// // // // // //               <span className="visually-hidden">{t("loading")}...</span>
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         ) : (
// // // // // //           renderContent()
// // // // // //         )}
// // // // // //       </main>
// // // // // //     </div>
// // // // // //   );
// // // // // // }
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
// //   const [notifications, setNotifications] = useState([]);
// //   const [showNotifications, setShowNotifications] = useState(false);

// //   const navigate = useNavigate();

// //   const sidebarItems = [
// //     { key: "dashboard", label: t("dashboard"), icon: "bi-speedometer2" },
// //     { key: "tables", label: t("tables"), icon: "bi-table" },
// //     { key: "charts", label: t("charts"), icon: "bi-bar-chart-fill" },
// //     { key: "budgets", label: t("budgets"), icon: "bi-wallet2" },
// //     { key: "notifications", label: t("notifications"), icon: "bi-bell-fill" }
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
// //   }, [t]);

// //   async function handleUnitCardClick(unitId) {
// //     setUnitLoading(true);
// //     setSelectedUnit(unitId);
// //     setTeacherSearch("");
// //     setStudentSearch("");
// //     setStudentsYear("");
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

// //   const teacherFields = [
// //     ["staff_id", "Staff ID"], ["full_name", "Full Name"], ["email", "Email"], ["phone", "Phone"],
// //     ["qualification", "Qualification"], ["designation", "Designation"],
// //     ["subject", "Subject"], ["joining_date", "Joining Date"], ["updatedat", "Updated At"]
// //   ];

// //   const studentFields = [
// //     ["student_id", "Student ID"], ["full_name", "Full Name"], ["standard", "Standard"], ["division", "Division"],
// //     ["roll_number", "Roll Number"], ["academic_year", "Academic Year"], ["passed", "Passed"],
// //     ["dob", "DOB"], ["gender", "Gender"], ["address", "Address"], ["parent_name", "Parent Name"],
// //     ["parent_phone", "Parent Phone"], ["admission_date", "Admission Date"], ["createdat", "Created At"], ["updatedat", "Updated At"]
// //   ];

// //   const allStudentYears = unitDetails?.students
// //     ? Array.from(new Set(unitDetails.students.map(s => s.academic_year).filter(Boolean))).sort().reverse()
// //     : [];

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
// //       prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
// //     );
// //   }

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
// //       prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
// //     );
// //   }

// //   function DynamicDropdownTable({ tableName, data }) {
// //     const [visibleCols, setVisibleCols] = useState(() =>
// //       data.length ? Object.keys(data[0]) : []
// //     );
// //     const [selectShow, setSelectShow] = useState(false);

// //     useEffect(() => {
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

// //       <h4 className="mt-4">Unit Payments</h4>
// //       <DynamicDropdownTable tableName="Payments" data={unitDetails.payments ?? []} />

// //       <h4 className="mt-4">Unit Budgets</h4>
// //       <DynamicDropdownTable tableName="Budgets" data={unitDetails.budgets ?? []} />

// //       <h4 className="mt-4">Unit Banks</h4>
// //       <DynamicDropdownTable tableName="Banks" data={unitDetails.banks ?? []} />

// //       <h4 className="mt-4">Unit Cases</h4>
// //       <DynamicDropdownTable tableName="Cases" data={unitDetails.cases ?? []} />
// //     </div>
// //   );

// //   function NotificationBell() {
// //     return (
// //       <div className="notification-bell-container">
// //         <button
// //           className="btn btn-light position-relative me-3"
// //           onClick={() => setShowNotifications(!showNotifications)}
// //         >
// //           <i className="bi bi-bell fs-5"></i>
// //           {notifications.length > 0 && (
// //             <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
// //               {notifications.length}
// //             </span>
// //           )}
// //         </button>
// //         {showNotifications && (
// //           <div
// //             className="position-absolute bg-white shadow rounded p-2"
// //             style={{ top: "60px", right: "20px", width: "250px", zIndex: 1000 }}
// //           >
// //             <h6 className="border-bottom pb-2 mb-2">{t("notifications")}</h6>
// //             {notifications.length === 0 ? (
// //               <p className="text-muted mb-0">{t("no_new_notifications")}</p>
// //             ) : (
// //               <ul className="list-unstyled mb-0">
// //                 {notifications.map((n) => (
// //                   <li key={n.id} className="mb-2">
// //                     <i className="bi bi-dot text-primary"></i> {n.message}
// //                   </li>
// //                 ))}
// //               </ul>
// //             )}
// //           </div>
// //         )}
// //       </div>
// //     );
// //   }
// // }





// // // new
// // // import React, { useState, useEffect } from "react";
// // // import { useNavigate } from "react-router-dom";
// // // import axios from "axios";
// // // import { useTranslation } from "react-i18next";
// // // import "./Dashboard.scss";
// // // import AdminCharts from "./Charts";

// // // export default function AdminDashboard() {
// // //   const { t } = useTranslation();
// // //   const [sidebarTab, setSidebarTab] = useState("dashboard");
// // //   const [units, setUnits] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState("");
// // //   const [selectedUnit, setSelectedUnit] = useState(null);
// // //   const [unitDetails, setUnitDetails] = useState(null);
// // //   const [unitLoading, setUnitLoading] = useState(false);
// // //   const [teacherSearch, setTeacherSearch] = useState("");
// // //   const [studentSearch, setStudentSearch] = useState("");
// // //   const [teacherVisibleColumns, setTeacherVisibleColumns] = useState([
// // //     "staff_id", "full_name", "email", "phone", "qualification", "designation", "subject", "joining_date", "updatedat"
// // //   ]);
// // //   const [studentVisibleColumns, setStudentVisibleColumns] = useState([
// // //     "student_id", "full_name", "standard", "division", "roll_number", "academic_year", "passed",
// // //     "dob", "gender", "address", "parent_name", "parent_phone", "admission_date", "createdat", "updatedat"
// // //   ]);
// // //   const [teachersShowColDropdown, setTeachersShowColDropdown] = useState(false);
// // //   const [studentsShowColDropdown, setStudentsShowColDropdown] = useState(false);
// // //   const [studentsYear, setStudentsYear] = useState("");
// // //   const [notifications, setNotifications] = useState([]);
// // //   const [showNotifications, setShowNotifications] = useState(false);

// // //   const navigate = useNavigate();

// // //   // Add loading & error fallback UI at the top of the component.
// // //   if (loading) return <div style={{ padding: 32 }}>Loading...</div>;
// // //   if (error) return <div className="alert alert-danger" style={{ margin: 32 }}>{error}</div>;
// // //   // if (!Array.isArray(units) || units.length === 0) {
// // //   //   return <div className="alert alert-info" style={{ margin: 32 }}>No schools/units are registered for your admin account.</div>;
// // //   // }

// // //   useEffect(() => {
// // //     async function fetchUnits() {
// // //       try {
// // //         const token = localStorage.getItem("token");
// // //         const response = await axios.get("http://localhost:5000/api/admin/units", {
// // //           headers: { Authorization: `Bearer ${token}` }
// // //         });
// // //         console.log("Fetched units:", response.data);
// // //         setUnits(response.data);
// // //         setLoading(false);
// // //       } catch (err) {
// // //         setError(err.response?.data?.error || err.message || t("failed_load_units"));
// // //         setLoading(false);
// // //       }
// // //     }
// // //     fetchUnits();
// // //   }, [t]);

// // //   async function handleUnitCardClick(unitId) {
// // //     setUnitLoading(true);
// // //     setSelectedUnit(unitId);
// // //     setTeacherSearch("");
// // //     setStudentSearch("");
// // //     setStudentsYear("");
// // //     try {
// // //       const token = localStorage.getItem("token");
// // //       const res = await axios.get(`http://localhost:5000/api/admin/units/${unitId}`, {
// // //         headers: { Authorization: `Bearer ${token}` }
// // //       });
// // //       console.log("Fetched unit details:", res.data);
// // //       setUnitDetails(res.data);
// // //     } catch (err) {
// // //       setError(err.response?.data?.error || "Failed to load unit details");
// // //     }
// // //     setUnitLoading(false);
// // //   }

// // //   const teacherFields = [
// // //     ["staff_id", "Staff ID"], ["full_name", "Full Name"], ["email", "Email"], ["phone", "Phone"],
// // //     ["qualification", "Qualification"], ["designation", "Designation"],
// // //     ["subject", "Subject"], ["joining_date", "Joining Date"], ["updatedat", "Updated At"]
// // //   ];

// // //   const studentFields = [
// // //     ["student_id", "Student ID"], ["full_name", "Full Name"], ["standard", "Standard"], ["division", "Division"],
// // //     ["roll_number", "Roll Number"], ["academic_year", "Academic Year"], ["passed", "Passed"],
// // //     ["dob", "DOB"], ["gender", "Gender"], ["address", "Address"], ["parent_name", "Parent Name"],
// // //     ["parent_phone", "Parent Phone"], ["admission_date", "Admission Date"], ["createdat", "Created At"], ["updatedat", "Updated At"]
// // //   ];

// // //   const allStudentYears = unitDetails?.students
// // //     ? Array.from(new Set(unitDetails.students.map(s => s.academic_year).filter(Boolean))).sort().reverse()
// // //     : [];

// // //   const filteredTeachers = unitDetails?.teachers
// // //     ? unitDetails.teachers.filter(t =>
// // //         Object.values(t)
// // //           .join(" ")
// // //           .toLowerCase()
// // //           .includes(teacherSearch.toLowerCase())
// // //       )
// // //     : [];

// // //   function handleTeacherColumnToggle(key) {
// // //     setTeacherVisibleColumns(prev =>
// // //       prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
// // //     );
// // //   }

// // //   const filteredStudents = unitDetails?.students
// // //     ? unitDetails.students.filter(
// // //         s =>
// // //           (!studentsYear || s.academic_year === studentsYear) &&
// // //           Object.values(s)
// // //             .join(" ")
// // //             .toLowerCase()
// // //             .includes(studentSearch.toLowerCase())
// // //       )
// // //     : [];

// // //   function handleStudentColumnToggle(key) {
// // //     setStudentVisibleColumns(prev =>
// // //       prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
// // //     );
// // //   }

// // //   function DynamicDropdownTable({ tableName, data }) {
// // //     const [visibleCols, setVisibleCols] = useState(() =>
// // //       data.length ? Object.keys(data[0]) : []
// // //     );
// // //     const [selectShow, setSelectShow] = useState(false);

// // //     useEffect(() => {
// // //       if (data.length) setVisibleCols(Object.keys(data[0]));
// // //     }, [data]);

// // //     if (!data.length) return <div className="mb-4 text-muted">{tableName} not available</div>;

// // //     const cols = Object.keys(data[0]);
// // //     function handleToggle(col) {
// // //       setVisibleCols(prev =>
// // //         prev.includes(col)
// // //           ? prev.filter(c => c !== col)
// // //           : [...prev, col]
// // //       );
// // //     }

// // //     return (
// // //       <div style={{ overflowX: "auto", marginBottom: 32 }}>
// // //         <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
// // //           <span className="fw-bold">{tableName}</span>
// // //           <div className="dropdown" style={{ position: "relative" }}>
// // //             <button
// // //               className="btn btn-outline-secondary dropdown-toggle"
// // //               type="button"
// // //               onClick={() => setSelectShow(s => !s)}
// // //             >
// // //               Select Columns
// // //             </button>
// // //             {selectShow && (
// // //               <div className="dropdown-menu show p-2" style={{ maxHeight: 320, overflowY: "auto", right: 0, left: "auto" }}>
// // //                 {cols.map(col => (
// // //                   <div key={col} className="form-check">
// // //                     <input
// // //                       type="checkbox"
// // //                       className="form-check-input"
// // //                       id={`col-check-table-${tableName}-${col}`}
// // //                       checked={visibleCols.includes(col)}
// // //                       onChange={() => handleToggle(col)}
// // //                     />
// // //                     <label className="form-check-label" htmlFor={`col-check-table-${tableName}-${col}`}>
// // //                       {col}
// // //                     </label>
// // //                   </div>
// // //                 ))}
// // //               </div>
// // //             )}
// // //           </div>
// // //         </div>
// // //         <table className="table table-striped table-bordered">
// // //           <thead>
// // //             <tr>
// // //               {cols.filter(col => visibleCols.includes(col)).map(col =>
// // //                 <th key={col}>{col}</th>
// // //               )}
// // //             </tr>
// // //           </thead>
// // //           <tbody>
// // //             {data.map((row, i) =>
// // //               <tr key={tableName + "-row-" + i}>
// // //                 {cols.filter(col => visibleCols.includes(col)).map(col =>
// // //                   <td key={col}>
// // //                     {row[col] != null ? row[col].toString() : ""}
// // //                   </td>
// // //                 )}
// // //               </tr>
// // //             )}
// // //           </tbody>
// // //         </table>
// // //       </div>
// // //     );
// // //   }

// // //   const renderUnitDetails = () =>
// // //     unitDetails ? (
// // //       <div>
// // //         <button className="btn btn-secondary mb-3" onClick={() => {
// // //           setSelectedUnit(null);
// // //           setUnitDetails(null);
// // //         }}>{t("back_to_units")}</button>
// // //         <h2>{unitDetails.kendrashala_name}</h2>
// // //         <div><strong>{t("total_staff")}:</strong> {unitDetails.teachers?.length ?? 0}</div>
// // //         <div><strong>{t("total_students")}:</strong> {unitDetails.students?.length ?? 0}</div>

// // //         <h4 className="mt-4">{t("school_details")}</h4>
// // //         <table className="table table-bordered mb-4">
// // //           <tbody>
// // //             {[
// // //               ["unit_id", "Unit ID"], ["semis_no", "SEMIS No"], ["dcf_no", "DCF No"],
// // //               ["nmms_no", "NMMS No"], ["scholarship_code", "Scholarship Code"],
// // //               ["first_grant_in_aid_year", "First Grant Year"], ["type_of_management", "Management Type"],
// // //               ["school_jurisdiction", "School Jurisdiction"], ["competent_authority_name", "Competent Authority"],
// // //               ["authority_number", "Authority Number"], ["authority_zone", "Authority Zone"],
// // //               ["kendrashala_name", "Kendrashala Name"], ["info_authority_name", "Info Authority"],
// // //               ["appellate_authority_name", "Appellate Authority"],
// // //               ["midday_meal_org_name", "Midday Meal Org"],
// // //               ["midday_meal_org_contact", "Midday Meal Contact"], ["standard_range", "Standard Range"],
// // //               ["headmistress_name", "Headmistress Name"], ["headmistress_phone", "Headmistress Phone"],
// // //               ["headmistress_email", "Headmistress Email"], ["school_shift", "School Shift"]
// // //             ].map(([key, label]) => (
// // //               <tr key={key}>
// // //                 <th>{t(key)}</th>
// // //                 <td>{unitDetails[key]}</td>
// // //               </tr>
// // //             ))}
// // //           </tbody>
// // //         </table>

// // //         <h4 className="mt-4">Teachers</h4>
// // //         {/* ...rest of teachers & students table remains unchanged ... */}

// // //         <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
// // //           <input
// // //             type="text"
// // //             className="form-control"
// // //             style={{ maxWidth: 300 }}
// // //             placeholder="Search teachers by any field..."
// // //             value={teacherSearch}
// // //             onChange={e => setTeacherSearch(e.target.value)}
// // //           />
// // //           <div className="dropdown" style={{ position: "relative" }}>
// // //             <button
// // //               className="btn btn-outline-secondary dropdown-toggle"
// // //               type="button"
// // //               onClick={() => setTeachersShowColDropdown(s => !s)}
// // //             >
// // //               Select Columns
// // //             </button>
// // //             {teachersShowColDropdown && (
// // //               <div className="dropdown-menu show p-2" style={{ maxHeight: 300, overflowY: "auto", right: 0, left: "auto" }}>
// // //                 {teacherFields.map(([key, label]) => (
// // //                   <div key={key} className="form-check">
// // //                     <input
// // //                       type="checkbox"
// // //                       className="form-check-input"
// // //                       id={`col-check-teacher-${key}`}
// // //                       checked={teacherVisibleColumns.includes(key)}
// // //                       onChange={() => handleTeacherColumnToggle(key)}
// // //                     />
// // //                     <label className="form-check-label" htmlFor={`col-check-teacher-${key}`}>
// // //                       {label}
// // //                     </label>
// // //                   </div>
// // //                 ))}
// // //               </div>
// // //             )}
// // //           </div>
// // //         </div>
// // //         <div style={{ overflowX: "auto" }}>
// // //           <table className="table table-striped table-bordered">
// // //             <thead>
// // //               <tr>
// // //                 {teacherFields.filter(([key]) => teacherVisibleColumns.includes(key)).map(([key, label]) => (
// // //                   <th key={key}>{label}</th>
// // //                 ))}
// // //               </tr>
// // //             </thead>
// // //             <tbody>
// // //               {filteredTeachers.map(t => (
// // //                 <tr key={t.staff_id}>
// // //                   {teacherFields.filter(([key]) => teacherVisibleColumns.includes(key)).map(([key]) =>
// // //                     <td key={key}>{t[key] != null ? t[key] : ""}</td>
// // //                   )}
// // //                 </tr>
// // //               ))}
// // //               {filteredTeachers.length === 0 && (
// // //                 <tr>
// // //                   <td colSpan={teacherVisibleColumns.length} className="text-center">No teachers found</td>
// // //                 </tr>
// // //               )}
// // //             </tbody>
// // //           </table>
// // //         </div>

// // //         <h4 className="mt-4">Students</h4>
// // //         {/* ...rest of students section as previously, unchanged ... */}
// // //         <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
// // //           <input
// // //             type="text"
// // //             className="form-control"
// // //             style={{ maxWidth: 300 }}
// // //             placeholder="Search students by any field..."
// // //             value={studentSearch}
// // //             onChange={e => setStudentSearch(e.target.value)}
// // //           />
// // //           <select
// // //             value={studentsYear}
// // //             onChange={e => setStudentsYear(e.target.value)}
// // //             className="form-control"
// // //             style={{ width: 160 }}
// // //           >
// // //             <option value="">All Years</option>
// // //             {allStudentYears.map(year => (
// // //               <option value={year} key={year}>{year}</option>
// // //             ))}
// // //           </select>
// // //           <div className="dropdown" style={{ position: "relative" }}>
// // //             <button
// // //               className="btn btn-outline-secondary dropdown-toggle"
// // //               type="button"
// // //               onClick={() => setStudentsShowColDropdown(s => !s)}
// // //             >
// // //               Select Columns
// // //             </button>
// // //             {studentsShowColDropdown && (
// // //               <div className="dropdown-menu show p-2" style={{ maxHeight: 320, overflowY: "auto", right: 0, left: "auto" }}>
// // //                 {studentFields.map(([key, label]) => (
// // //                   <div key={key} className="form-check">
// // //                     <input
// // //                       type="checkbox"
// // //                       className="form-check-input"
// // //                       id={`col-check-student-${key}`}
// // //                       checked={studentVisibleColumns.includes(key)}
// // //                       onChange={() => handleStudentColumnToggle(key)}
// // //                     />
// // //                     <label className="form-check-label" htmlFor={`col-check-student-${key}`}>
// // //                       {label}
// // //                     </label>
// // //                   </div>
// // //                 ))}
// // //               </div>
// // //             )}
// // //           </div>
// // //         </div>
// // //         <div style={{ overflowX: "auto" }}>
// // //           <table className="table table-striped table-bordered">
// // //             <thead>
// // //               <tr>
// // //                 {studentFields.filter(([key]) => studentVisibleColumns.includes(key)).map(([key, label]) => (
// // //                   <th key={key}>{label}</th>
// // //                 ))}
// // //               </tr>
// // //             </thead>
// // //             <tbody>
// // //               {filteredStudents.map(s => (
// // //                 <tr key={s.student_id + "-" + s.roll_number + "-" + s.academic_year}>
// // //                   {studentFields.filter(([key]) => studentVisibleColumns.includes(key)).map(([key]) =>
// // //                     <td key={key}>
// // //                       {key === "passed"
// // //                         ? (s[key] ? "Yes" : "No")
// // //                         : (key === "dob" || key === "admission_date")
// // //                           ? (s[key] ? new Date(s[key]).toLocaleDateString() : "")
// // //                           : s[key] != null ? s[key] : ""}
// // //                     </td>
// // //                   )}
// // //                 </tr>
// // //               ))}
// // //               {filteredStudents.length === 0 && (
// // //                 <tr>
// // //                   <td colSpan={studentVisibleColumns.length} className="text-center">No students found</td>
// // //                 </tr>
// // //               )}
// // //             </tbody>
// // //           </table>
// // //         </div>

// // //         <h4 className="mt-4">Unit Payments</h4>
// // //         <DynamicDropdownTable tableName="Payments" data={unitDetails.payments ?? []} />

// // //         <h4 className="mt-4">Unit Budgets</h4>
// // //         <DynamicDropdownTable tableName="Budgets" data={unitDetails.budgets ?? []} />

// // //         <h4 className="mt-4">Unit Banks</h4>
// // //         <DynamicDropdownTable tableName="Banks" data={unitDetails.banks ?? []} />

// // //         <h4 className="mt-4">Unit Cases</h4>
// // //         <DynamicDropdownTable tableName="Cases" data={unitDetails.cases ?? []} />
// // //       </div>
// // //     ) : null;

// // //   function NotificationBell() {
// // //     return (
// // //       <div className="notification-bell-container">
// // //         <button
// // //           className="btn btn-light position-relative me-3"
// // //           onClick={() => setShowNotifications(!showNotifications)}
// // //         >
// // //           <i className="bi bi-bell fs-5"></i>
// // //           {notifications.length > 0 && (
// // //             <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
// // //               {notifications.length}
// // //             </span>
// // //           )}
// // //         </button>
// // //         {showNotifications && (
// // //           <div
// // //             className="position-absolute bg-white shadow rounded p-2"
// // //             style={{ top: "60px", right: "20px", width: "250px", zIndex: 1000 }}
// // //           >
// // //             <h6 className="border-bottom pb-2 mb-2">{t("notifications")}</h6>
// // //             {notifications.length === 0 ? (
// // //               <p className="text-muted mb-0">{t("no_new_notifications")}</p>
// // //             ) : (
// // //               <ul className="list-unstyled mb-0">
// // //                 {notifications.map((n) => (
// // //                   <li key={n.id} className="mb-2">
// // //                     <i className="bi bi-dot text-primary"></i> {n.message}
// // //                   </li>
// // //                 ))}
// // //               </ul>
// // //             )}
// // //           </div>
// // //         )}
// // //       </div>
// // //     );
// // //   }

// // //   // Main return: either cards for all units or details for a selected unit
// // //   return (
// // //     <div className="container-fluid">
// // //       <h2 className="my-4">{t("admin_dashboard")}</h2>
// // //       <div>
// // //         {!selectedUnit ? (
// // //           <div className="row">
// // //             {units.map(unit => (
// // //               <div className="col-md-4 mb-4" key={unit.unit_id}>
// // //                 <div
// // //                   className="card h-100 shadow-sm"
// // //                   style={{ cursor: "pointer" }}
// // //                   onClick={() => handleUnitCardClick(unit.unit_id)}
// // //                 >
// // //                   <div className="card-body">
// // //                     <h5 className="card-title">{unit.kendrashala_name || unit.unit_id}</h5>
// // //                     <p className="card-text">
// // //                       SEMIS: {unit.semis_no}<br />
// // //                       Staff: {unit.staff_count} | Students: {unit.student_count}
// // //                     </p>
// // //                   </div>
// // //                 </div>
// // //               </div>
// // //             ))}
// // //           </div>
// // //         ) : (
// // //           renderUnitDetails()
// // //         )}
// // //       </div>
// // //     </div>
// // //   );
// // // }

// // // // // import React, { useState, useEffect } from "react";
// // // // // import { useNavigate } from "react-router-dom";
// // // // // import axios from "axios";
// // // // // import { useTranslation } from "react-i18next";
// // // // // import "./Dashboard.scss";
// // // // // import AdminCharts from "./Charts";

// // // // // export default function AdminDashboard() {
// // // // //   const { t } = useTranslation();
// // // // //   const [sidebarTab, setSidebarTab] = useState("dashboard");
// // // // //   const [units, setUnits] = useState([]);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [error, setError] = useState("");
// // // // //   const [selectedUnit, setSelectedUnit] = useState(null);
// // // // //   const [unitDetails, setUnitDetails] = useState(null);
// // // // //   const [unitLoading, setUnitLoading] = useState(false);
// // // // //   const [teacherSearch, setTeacherSearch] = useState("");
// // // // //   const [studentSearch, setStudentSearch] = useState("");
// // // // //   const [teacherVisibleColumns, setTeacherVisibleColumns] = useState([
// // // // //     "staff_id", "full_name", "email", "phone", "qualification", "designation", "subject", "joining_date", "updatedat"
// // // // //   ]);
// // // // //   const [studentVisibleColumns, setStudentVisibleColumns] = useState([
// // // // //     "student_id", "full_name", "standard", "division", "roll_number", "academic_year", "passed",
// // // // //     "dob", "gender", "address", "parent_name", "parent_phone", "admission_date", "createdat", "updatedat"
// // // // //   ]);
// // // // //   const [teachersShowColDropdown, setTeachersShowColDropdown] = useState(false);
// // // // //   const [studentsShowColDropdown, setStudentsShowColDropdown] = useState(false);
// // // // //   const [studentsYear, setStudentsYear] = useState("");
// // // // //   const [notifications, setNotifications] = useState([]);
// // // // //   const [showNotifications, setShowNotifications] = useState(false);

// // // // //   const navigate = useNavigate();

// // // // //   useEffect(() => {
// // // // //     async function fetchUnits() {
// // // // //       try {
// // // // //         const token = localStorage.getItem("token");
// // // // //         const response = await axios.get("http://localhost:5000/api/admin/units", {
// // // // //           headers: { Authorization: `Bearer ${token}` }
// // // // //         });
// // // // //         setUnits(response.data);
// // // // //         setLoading(false);
// // // // //       } catch (err) {
// // // // //         setError(err.response?.data?.error || err.message || t("failed_load_units"));
// // // // //         setLoading(false);
// // // // //       }
// // // // //     }
// // // // //     fetchUnits();
// // // // //   }, [t]);

// // // // //   async function handleUnitCardClick(unitId) {
// // // // //     setUnitLoading(true);
// // // // //     setSelectedUnit(unitId);
// // // // //     setTeacherSearch("");
// // // // //     setStudentSearch("");
// // // // //     setStudentsYear("");
// // // // //     try {
// // // // //       const token = localStorage.getItem("token");
// // // // //       const res = await axios.get(`http://localhost:5000/api/admin/units/${unitId}`, {
// // // // //         headers: { Authorization: `Bearer ${token}` }
// // // // //       });
// // // // //       setUnitDetails(res.data);
// // // // //     } catch (err) {
// // // // //       setError(err.response?.data?.error || "Failed to load unit details");
// // // // //     }
// // // // //     setUnitLoading(false);
// // // // //   }

// // // // //   const teacherFields = [
// // // // //     ["staff_id", "Staff ID"], ["full_name", "Full Name"], ["email", "Email"], ["phone", "Phone"],
// // // // //     ["qualification", "Qualification"], ["designation", "Designation"],
// // // // //     ["subject", "Subject"], ["joining_date", "Joining Date"], ["updatedat", "Updated At"]
// // // // //   ];

// // // // //   const studentFields = [
// // // // //     ["student_id", "Student ID"], ["full_name", "Full Name"], ["standard", "Standard"], ["division", "Division"],
// // // // //     ["roll_number", "Roll Number"], ["academic_year", "Academic Year"], ["passed", "Passed"],
// // // // //     ["dob", "DOB"], ["gender", "Gender"], ["address", "Address"], ["parent_name", "Parent Name"],
// // // // //     ["parent_phone", "Parent Phone"], ["admission_date", "Admission Date"], ["createdat", "Created At"], ["updatedat", "Updated At"]
// // // // //   ];

// // // // //   const allStudentYears = unitDetails?.students
// // // // //     ? Array.from(new Set(unitDetails.students.map(s => s.academic_year).filter(Boolean))).sort().reverse()
// // // // //     : [];

// // // // //   const filteredTeachers = unitDetails?.teachers
// // // // //     ? unitDetails.teachers.filter(t =>
// // // // //         Object.values(t)
// // // // //           .join(" ")
// // // // //           .toLowerCase()
// // // // //           .includes(teacherSearch.toLowerCase())
// // // // //       )
// // // // //     : [];

// // // // //   function handleTeacherColumnToggle(key) {
// // // // //     setTeacherVisibleColumns(prev =>
// // // // //       prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
// // // // //     );
// // // // //   }

// // // // //   const filteredStudents = unitDetails?.students
// // // // //     ? unitDetails.students.filter(
// // // // //         s =>
// // // // //           (!studentsYear || s.academic_year === studentsYear) &&
// // // // //           Object.values(s)
// // // // //             .join(" ")
// // // // //             .toLowerCase()
// // // // //             .includes(studentSearch.toLowerCase())
// // // // //       )
// // // // //     : [];

// // // // //   function handleStudentColumnToggle(key) {
// // // // //     setStudentVisibleColumns(prev =>
// // // // //       prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
// // // // //     );
// // // // //   }

// // // // //   function DynamicDropdownTable({ tableName, data }) {
// // // // //     const [visibleCols, setVisibleCols] = useState(() =>
// // // // //       data.length ? Object.keys(data[0]) : []
// // // // //     );
// // // // //     const [selectShow, setSelectShow] = useState(false);

// // // // //     useEffect(() => {
// // // // //       if (data.length) setVisibleCols(Object.keys(data[0]));
// // // // //     }, [data]);

// // // // //     if (!data.length) return <div className="mb-4 text-muted">{tableName} not available</div>;

// // // // //     const cols = Object.keys(data[0]);
// // // // //     function handleToggle(col) {
// // // // //       setVisibleCols(prev =>
// // // // //         prev.includes(col)
// // // // //           ? prev.filter(c => c !== col)
// // // // //           : [...prev, col]
// // // // //       );
// // // // //     }

// // // // //     return (
// // // // //       <div style={{ overflowX: "auto", marginBottom: 32 }}>
// // // // //         <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
// // // // //           <span className="fw-bold">{tableName}</span>
// // // // //           <div className="dropdown" style={{ position: "relative" }}>
// // // // //             <button
// // // // //               className="btn btn-outline-secondary dropdown-toggle"
// // // // //               type="button"
// // // // //               onClick={() => setSelectShow(s => !s)}
// // // // //             >
// // // // //               Select Columns
// // // // //             </button>
// // // // //             {selectShow && (
// // // // //               <div className="dropdown-menu show p-2" style={{ maxHeight: 320, overflowY: "auto", right: 0, left: "auto" }}>
// // // // //                 {cols.map(col => (
// // // // //                   <div key={col} className="form-check">
// // // // //                     <input
// // // // //                       type="checkbox"
// // // // //                       className="form-check-input"
// // // // //                       id={`col-check-table-${tableName}-${col}`}
// // // // //                       checked={visibleCols.includes(col)}
// // // // //                       onChange={() => handleToggle(col)}
// // // // //                     />
// // // // //                     <label className="form-check-label" htmlFor={`col-check-table-${tableName}-${col}`}>
// // // // //                       {col}
// // // // //                     </label>
// // // // //                   </div>
// // // // //                 ))}
// // // // //               </div>
// // // // //             )}
// // // // //           </div>
// // // // //         </div>
// // // // //         <table className="table table-striped table-bordered">
// // // // //           <thead>
// // // // //             <tr>
// // // // //               {cols.filter(col => visibleCols.includes(col)).map(col =>
// // // // //                 <th key={col}>{col}</th>
// // // // //               )}
// // // // //             </tr>
// // // // //           </thead>
// // // // //           <tbody>
// // // // //             {data.map((row, i) =>
// // // // //               <tr key={tableName + "-row-" + i}>
// // // // //                 {cols.filter(col => visibleCols.includes(col)).map(col =>
// // // // //                   <td key={col}>
// // // // //                     {row[col] != null ? row[col].toString() : ""}
// // // // //                   </td>
// // // // //                 )}
// // // // //               </tr>
// // // // //             )}
// // // // //           </tbody>
// // // // //         </table>
// // // // //       </div>
// // // // //     );
// // // // //   }

// // // // //   const renderUnitDetails = () =>
// // // // //     unitDetails ? (
// // // // //       <div>
// // // // //         <button className="btn btn-secondary mb-3" onClick={() => {
// // // // //           setSelectedUnit(null);
// // // // //           setUnitDetails(null);
// // // // //         }}>{t("back_to_units")}</button>
// // // // //         <h2>{unitDetails.kendrashala_name}</h2>
// // // // //         <div><strong>{t("total_staff")}:</strong> {unitDetails.teachers?.length ?? 0}</div>
// // // // //         <div><strong>{t("total_students")}:</strong> {unitDetails.students?.length ?? 0}</div>

// // // // //         <h4 className="mt-4">{t("school_details")}</h4>
// // // // //         <table className="table table-bordered mb-4">
// // // // //           <tbody>
// // // // //             {[
// // // // //               ["unit_id", "Unit ID"], ["semis_no", "SEMIS No"], ["dcf_no", "DCF No"],
// // // // //               ["nmms_no", "NMMS No"], ["scholarship_code", "Scholarship Code"],
// // // // //               ["first_grant_in_aid_year", "First Grant Year"], ["type_of_management", "Management Type"],
// // // // //               ["school_jurisdiction", "School Jurisdiction"], ["competent_authority_name", "Competent Authority"],
// // // // //               ["authority_number", "Authority Number"], ["authority_zone", "Authority Zone"],
// // // // //               ["kendrashala_name", "Kendrashala Name"], ["info_authority_name", "Info Authority"],
// // // // //               ["appellate_authority_name", "Appellate Authority"],
// // // // //               ["midday_meal_org_name", "Midday Meal Org"],
// // // // //               ["midday_meal_org_contact", "Midday Meal Contact"], ["standard_range", "Standard Range"],
// // // // //               ["headmistress_name", "Headmistress Name"], ["headmistress_phone", "Headmistress Phone"],
// // // // //               ["headmistress_email", "Headmistress Email"], ["school_shift", "School Shift"]
// // // // //             ].map(([key, label]) => (
// // // // //               <tr key={key}>
// // // // //                 <th>{t(key)}</th>
// // // // //                 <td>{unitDetails[key]}</td>
// // // // //               </tr>
// // // // //             ))}
// // // // //           </tbody>
// // // // //         </table>

// // // // //         <h4 className="mt-4">Teachers</h4>
// // // // //         <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
// // // // //           <input
// // // // //             type="text"
// // // //             className="form-control"
// // // //             style={{ maxWidth: 300 }}
// // // //             placeholder="Search teachers by any field..."
// // // //             value={teacherSearch}
// // // //             onChange={e => setTeacherSearch(e.target.value)}
// // // //           />
// // // //           <div className="dropdown" style={{ position: "relative" }}>
// // // //             <button
// // // //               className="btn btn-outline-secondary dropdown-toggle"
// // // //               type="button"
// // // //               onClick={() => setTeachersShowColDropdown(s => !s)}
// // // //             >
// // // //               Select Columns
// // // //             </button>
// // // //             {teachersShowColDropdown && (
// // // //               <div className="dropdown-menu show p-2" style={{ maxHeight: 300, overflowY: "auto", right: 0, left: "auto" }}>
// // // //                 {teacherFields.map(([key, label]) => (
// // // //                   <div key={key} className="form-check">
// // // //                     <input
// // // //                       type="checkbox"
// // // //                       className="form-check-input"
// // // //                       id={`col-check-teacher-${key}`}
// // // //                       checked={teacherVisibleColumns.includes(key)}
// // // //                       onChange={() => handleTeacherColumnToggle(key)}
// // // //                     />
// // // //                     <label className="form-check-label" htmlFor={`col-check-teacher-${key}`}>
// // // //                       {label}
// // // //                     </label>
// // // //                   </div>
// // // //                 ))}
// // // //               </div>
// // // //             )}
// // // //           </div>
// // // //         </div>
// // // //         <div style={{ overflowX: "auto" }}>
// // // //           <table className="table table-striped table-bordered">
// // // //             <thead>
// // // //               <tr>
// // // //                 {teacherFields.filter(([key]) => teacherVisibleColumns.includes(key)).map(([key, label]) => (
// // // //                   <th key={key}>{label}</th>
// // // //                 ))}
// // // //               </tr>
// // // //             </thead>
// // // //             <tbody>
// // // //               {filteredTeachers.map(t => (
// // // //                 <tr key={t.staff_id}>
// // // //                   {teacherFields.filter(([key]) => teacherVisibleColumns.includes(key)).map(([key]) =>
// // // //                     <td key={key}>{t[key] != null ? t[key] : ""}</td>
// // // //                   )}
// // // //                 </tr>
// // // //               ))}
// // // //               {filteredTeachers.length === 0 && (
// // // //                 <tr>
// // // //                   <td colSpan={teacherVisibleColumns.length} className="text-center">No teachers found</td>
// // // //                 </tr>
// // // //               )}
// // // //             </tbody>
// // // //           </table>
// // // //         </div>

// // // //         <h4 className="mt-4">Students</h4>
// // // //         <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
// // // //           <input
// // // //             type="text"
// // // //             className="form-control"
// // // //             style={{ maxWidth: 300 }}
// // // //             placeholder="Search students by any field..."
// // // //             value={studentSearch}
// // // //             onChange={e => setStudentSearch(e.target.value)}
// // // //           />
// // // //           <select
// // // //             value={studentsYear}
// // // //             onChange={e => setStudentsYear(e.target.value)}
// // // //             className="form-control"
// // // //             style={{ width: 160 }}
// // // //           >
// // // //             <option value="">All Years</option>
// // // //             {allStudentYears.map(year => (
// // // //               <option value={year} key={year}>{year}</option>
// // // //             ))}
// // // //           </select>
// // // //           <div className="dropdown" style={{ position: "relative" }}>
// // // //             <button
// // // //               className="btn btn-outline-secondary dropdown-toggle"
// // // //               type="button"
// // // //               onClick={() => setStudentsShowColDropdown(s => !s)}
// // // //             >
// // // //               Select Columns
// // // //             </button>
// // // //             {studentsShowColDropdown && (
// // // //               <div className="dropdown-menu show p-2" style={{ maxHeight: 320, overflowY: "auto", right: 0, left: "auto" }}>
// // // //                 {studentFields.map(([key, label]) => (
// // // //                   <div key={key} className="form-check">
// // // //                     <input
// // // //                       type="checkbox"
// // // //                       className="form-check-input"
// // // //                       id={`col-check-student-${key}`}
// // // //                       checked={studentVisibleColumns.includes(key)}
// // // //                       onChange={() => handleStudentColumnToggle(key)}
// // // //                     />
// // // //                     <label className="form-check-label" htmlFor={`col-check-student-${key}`}>
// // // //                       {label}
// // // //                     </label>
// // // //                   </div>
// // // //                 ))}
// // // //               </div>
// // // //             )}
// // // //           </div>
// // // //         </div>
// // // //         <div style={{ overflowX: "auto" }}>
// // // //           <table className="table table-striped table-bordered">
// // // //             <thead>
// // // //               <tr>
// // // //                 {studentFields.filter(([key]) => studentVisibleColumns.includes(key)).map(([key, label]) => (
// // // //                   <th key={key}>{label}</th>
// // // //                 ))}
// // // //               </tr>
// // // //             </thead>
// // // //             <tbody>
// // // //               {filteredStudents.map(s => (
// // // //                 <tr key={s.student_id + "-" + s.roll_number + "-" + s.academic_year}>
// // // //                   {studentFields.filter(([key]) => studentVisibleColumns.includes(key)).map(([key]) =>
// // // //                     <td key={key}>
// // // //                       {key === "passed"
// // // //                         ? (s[key] ? "Yes" : "No")
// // // //                         : (key === "dob" || key === "admission_date")
// // // //                           ? (s[key] ? new Date(s[key]).toLocaleDateString() : "")
// // // //                           : s[key] != null ? s[key] : ""}
// // // //                     </td>
// // // //                   )}
// // // //                 </tr>
// // // //               ))}
// // // //               {filteredStudents.length === 0 && (
// // // //                 <tr>
// // // //                   <td colSpan={studentVisibleColumns.length} className="text-center">No students found</td>
// // // //                 </tr>
// // // //               )}
// // // //             </tbody>
// // // //           </table>
// // // //         </div>

// // // //         <h4 className="mt-4">Unit Payments</h4>
// // // //         <DynamicDropdownTable tableName="Payments" data={unitDetails.payments ?? []} />

// // // //         <h4 className="mt-4">Unit Budgets</h4>
// // // //         <DynamicDropdownTable tableName="Budgets" data={unitDetails.budgets ?? []} />

// // // //         <h4 className="mt-4">Unit Banks</h4>
// // // //         <DynamicDropdownTable tableName="Banks" data={unitDetails.banks ?? []} />

// // // //         <h4 className="mt-4">Unit Cases</h4>
// // // //         <DynamicDropdownTable tableName="Cases" data={unitDetails.cases ?? []} />
// // // //       </div>
// // // //     ) : null;

// // // //   function NotificationBell() {
// // // //     return (
// // // //       <div className="notification-bell-container">
// // // //         <button
// // // //           className="btn btn-light position-relative me-3"
// // // //           onClick={() => setShowNotifications(!showNotifications)}
// // // //         >
// // // //           <i className="bi bi-bell fs-5"></i>
// // // //           {notifications.length > 0 && (
// // // //             <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
// // // //               {notifications.length}
// // // //             </span>
// // // //           )}
// // // //         </button>
// // // //         {showNotifications && (
// // // //           <div
// // // //             className="position-absolute bg-white shadow rounded p-2"
// // // //             style={{ top: "60px", right: "20px", width: "250px", zIndex: 1000 }}
// // // //           >
// // // //             <h6 className="border-bottom pb-2 mb-2">{t("notifications")}</h6>
// // // //             {notifications.length === 0 ? (
// // // //               <p className="text-muted mb-0">{t("no_new_notifications")}</p>
// // // //             ) : (
// // // //               <ul className="list-unstyled mb-0">
// // // //                 {notifications.map((n) => (
// // // //                   <li key={n.id} className="mb-2">
// // // //                     <i className="bi bi-dot text-primary"></i> {n.message}
// // // //                   </li>
// // // //                 ))}
// // // //               </ul>
// // // //             )}
// // // //           </div>
// // // //         )}
// // // //       </div>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <div className="container-fluid">
// // // //       <h2 className="my-4">{t("admin_dashboard")}</h2>
// // // //       {loading ? (
// // // //         <div style={{ padding: 32 }}>Loading...</div>
// // // //       ) : error ? (
// // // //         <div className="alert alert-danger" style={{ margin: 32 }}>{error}</div>
// // // //       ) : (
// // // //         <div>
// // // //           {!selectedUnit ? (
// // // //             <div className="row">
// // // //               {units.length === 0 ? (
// // // //                 <div className="alert alert-info" style={{ margin: 32 }}>
// // // //                   No schools/units are registered for your admin account.
// // // //                 </div>
// // // //               ) : (
// // // //                 units.map(unit => (
// // // //                   <div className="col-md-4 mb-4" key={unit.unit_id}>
// // // //                     <div
// // // //                       className="card h-100 shadow-sm"
// // // //                       style={{ cursor: "pointer" }}
// // // //                       onClick={() => handleUnitCardClick(unit.unit_id)}
// // // //                     >
// // // //                       <div className="card-body">
// // // //                         <h5 className="card-title">{unit.kendrashala_name || unit.unit_id}</h5>
// // // //                         <p className="card-text">
// // // //                           SEMIS: {unit.semis_no}<br />
// // // //                           Staff: {unit.staff_count} | Students: {unit.student_count}
// // // //                         </p>
// // // //                       </div>
// // // //                     </div>
// // // //                   </div>
// // // //                 ))
// // // //               )}
// // // //             </div>
// // // //           ) : (
// // // //             renderUnitDetails()
// // // //           )}
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // }




// // import React, { useState, useEffect } from "react";
// // import { useNavigate } from "react-router-dom";
// // import axios from "axios";
// // import { useTranslation } from "react-i18next";
// // import "./Dashboard.scss";
// // import AdminCharts from "./Charts";

// // const NOTIF_API = "http://localhost:5000/api/notifications";
// // const FORM_API = "http://localhost:5000/api/forms";

// // // --- Notification and Form components ---

// // function AddNotificationForm({ onSuccess }) {
// //   const [title, setTitle] = useState("");
// //   const [message, setMessage] = useState("");
// //   const [receiverRole, setReceiverRole] = useState("principal");
// //   const [loading, setLoading] = useState(false);

// //   async function handleSubmit(e) {
// //     e.preventDefault();
// //     setLoading(true);
// //     const token = localStorage.getItem("token");
// //     try {
// //       await axios.post(
// //         NOTIF_API,
// //         {
// //           title,
// //           message,
// //           receiver_role: receiverRole,
// //           sender_role: "admin"
// //         },
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       setTitle("");
// //       setMessage("");
// //       setReceiverRole("principal");
// //       setLoading(false);
// //       onSuccess && onSuccess();
// //       alert("Notification sent!");
// //     } catch (err) {
// //       setLoading(false);
// //       alert("Failed to send notification: " + (err.response?.data?.error || err.message));
// //     }
// //   }

// //   return (
// //     <form onSubmit={handleSubmit} style={{ maxWidth: 480, marginBottom: 24, border: "1px solid #eee", padding: 18, borderRadius: 7, background: "#fafbff" }}>
// //       <h5>Add New Notification</h5>
// //       <div className="mb-2">
// //         <label className="form-label">Title</label>
// //         <input className="form-control" value={title} required onChange={e => setTitle(e.target.value)} />
// //       </div>
// //       <div className="mb-2">
// //         <label className="form-label">Message</label>
// //         <textarea className="form-control" value={message} required onChange={e => setMessage(e.target.value)} />
// //       </div>
// //       <div className="mb-2">
// //         <label className="form-label">Send To</label>
// //         <select className="form-select" value={receiverRole} onChange={e => setReceiverRole(e.target.value)}>
// //           <option value="principal">Principal</option>
// //           <option value="teacher">Teacher</option>
// //           <option value="student">Student</option>
// //         </select>
// //       </div>
// //       <button className="btn btn-primary" disabled={loading}>
// //         {loading ? "Sending..." : "Send Notification"}
// //       </button>
// //     </form>
// //   );
// // }

// // function AddFormAndNotify({ onSuccess }) {
// //   const [formTitle, setFormTitle] = useState("");
// //   const [formDesc, setFormDesc] = useState("");
// //   const [formDeadline, setFormDeadline] = useState("");
// //   const [formQuestions, setFormQuestions] = useState([
// //     { question_text: "", question_type: "text", options: "" }
// //   ]);
// //   const [receiverRole, setReceiverRole] = useState("principal");
// //   const [loading, setLoading] = useState(false);

// //   const token = localStorage.getItem("token");

// //   function handleQuestionChange(idx, field, value) {
// //     setFormQuestions(qs =>
// //       qs.map((q, i) => i === idx ? { ...q, [field]: value } : q)
// //     );
// //   }
// //   function addQuestion() {
// //     setFormQuestions(qs => [...qs, { question_text: "", question_type: "text", options: "" }]);
// //   }
// //   function removeQuestion(idx) {
// //     setFormQuestions(qs => qs.filter((_, i) => i !== idx));
// //   }

// //   async function handleFormSubmit(e) {
// //     e.preventDefault();
// //     setLoading(true);
// //     const payload = {
// //       title: formTitle,
// //       description: formDesc,
// //       receiver_role: receiverRole,
// //       deadline: formDeadline,
// //       questions: formQuestions.map(q => ({
// //         question_text: q.question_text,
// //         question_type: q.question_type,
// //         options: q.options ? q.options : null
// //       }))
// //     };
// //     try {
// //       const formRes = await axios.post(`${FORM_API}/create`, payload, {
// //         headers: { Authorization: `Bearer ${token}` }
// //       });
// //       const formId = formRes.data.form.id;
// //       const formLink = `http://localhost:3000/forms/${formId}`;
// //       await axios.post(
// //         NOTIF_API,
// //         {
// //           title: `New Form: ${formTitle}`,
// //           message: `Please fill this form before deadline: ${formLink}`,
// //           receiver_role: receiverRole,
// //           sender_role: "admin"
// //         },
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       setFormTitle("");
// //       setFormDesc("");
// //       setFormDeadline("");
// //       setFormQuestions([{ question_text: "", question_type: "text", options: "" }]);
// //       setLoading(false);
// //       onSuccess && onSuccess();
// //       alert("Form Created and Notification Sent!");
// //     } catch (err) {
// //       setLoading(false);
// //       alert("Failed to create/send form: " + (err.response?.data?.error || err.message));
// //     }
// //   }

// //   return (
// //     <form onSubmit={handleFormSubmit} style={{ maxWidth: 580, marginBottom: 32, border: "1px solid #eee", padding: 18, borderRadius: 7, background: "#f9fafe" }}>
// //       <h5>Add New Form & Notify</h5>
// //       <div className="mb-2">
// //         <label className="form-label">Form Title</label>
// //         <input className="form-control" value={formTitle} required onChange={e => setFormTitle(e.target.value)} />
// //       </div>
// //       <div className="mb-2">
// //         <label className="form-label">Description</label>
// //         <textarea className="form-control" value={formDesc} onChange={e => setFormDesc(e.target.value)} />
// //       </div>
// //       <div className="mb-2">
// //         <label className="form-label">Deadline</label>
// //         <input className="form-control" type="date" value={formDeadline} onChange={e => setFormDeadline(e.target.value)} />
// //       </div>
// //       <div className="mb-2">
// //         <label className="form-label">Send To</label>
// //         <select className="form-select" value={receiverRole} onChange={e => setReceiverRole(e.target.value)}>
// //           <option value="principal">Principal</option>
// //           <option value="teacher">Teacher</option>
// //         </select>
// //       </div>
// //       <div>
// //         {formQuestions.map((q, idx) => (
// //           <div key={idx} className="border rounded mb-2 p-2">
// //             <label>Question {idx + 1}</label>
// //             <input className="form-control mb-1" value={q.question_text} required onChange={e => handleQuestionChange(idx, "question_text", e.target.value)} />
// //             <select className="form-control mb-1" value={q.question_type} onChange={e => handleQuestionChange(idx, "question_type", e.target.value)}>
// //               <option value="text">Text</option>
// //               <option value="mcq">MCQ</option>
// //             </select>
// //             {q.question_type === "mcq" && (
// //               <input className="form-control mb-1" placeholder="Comma separated options" value={q.options} onChange={e => handleQuestionChange(idx, "options", e.target.value)} />
// //             )}
// //             <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuestion(idx)} disabled={formQuestions.length === 1}>Remove</button>
// //           </div>
// //         ))}
// //         <button type="button" className="btn btn-secondary" onClick={addQuestion}>Add Question</button>
// //       </div>
// //       <button className="btn btn-primary mt-2" disabled={loading}>
// //         {loading ? "Creating..." : "Create Form & Notify"}
// //       </button>
// //     </form>
// //   );
// // }

// // export default function AdminDashboard() {
// //   const { t } = useTranslation();
// //   const [sidebarTab, setSidebarTab] = useState("dashboard");
// //   const [units, setUnits] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState("");
// //   const [notifications, setNotifications] = useState([]);
// //   const [forms, setForms] = useState([]);
// //   const [selectedUnit, setSelectedUnit] = useState(null);
// //   const [unitDetails, setUnitDetails] = useState(null);
// //   const [unitLoading, setUnitLoading] = useState(false);

// //   const navigate = useNavigate();

// //   const sidebarItems = [
// //     { key: "dashboard", label: t("dashboard"), icon: "bi-speedometer2" },
// //     { key: "charts", label: t("charts"), icon: "bi-bar-chart-fill" },
// //     { key: "notifications", label: t("notifications"), icon: "bi-bell-fill" }
// //   ];

// //   // -------- Unit load ---------
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
// //         setError(err.response?.data?.error || err.message || t("failed_load_units"));
// //         setLoading(false);
// //       }
// //     }
// //     fetchUnits();
// //   }, [t]);

// //   // -------- Notifications/Forms load ----------
// //   const fetchNotifications = async () => {
// //     try {
// //       const token = localStorage.getItem("token");
// //       const res = await axios.get(NOTIF_API, {
// //         headers: { Authorization: `Bearer ${token}` }
// //       });
// //       setNotifications(res.data.reverse());
// //     } catch {
// //       setNotifications([]);
// //     }
// //   };

// //   const fetchForms = async () => {
// //     try {
// //       const token = localStorage.getItem("token");
// //       const res = await axios.get(`${FORM_API}/active?role=principal`, {
// //         headers: { Authorization: `Bearer ${token}` }
// //       });
// //       setForms(res.data);
// //     } catch {
// //       setForms([]);
// //     }
// //   };

// //   useEffect(() => {
// //     if (sidebarTab === "notifications") {
// //       fetchNotifications();
// //       fetchForms();
// //     }
// //   }, [sidebarTab]);

// //   // -------- Main render logic --------
// //   const renderContent = () => {
// //     switch (sidebarTab) {
// //       case "dashboard":
// //         return (
// //           <div>
// //             <div className="page-header">
// //               <h2>{t("school_overview")}</h2>
// //             </div>
// //             <div className="row">
// //               {units.map((unit, idx) => (
// //                 <div key={unit.unit_id} className="col-md-4 col-lg-3 col-sm-6 mb-4">
// //                   <div className="card shadow-sm text-center p-3"
// //                        style={{ cursor: "pointer", borderRadius: 14 }}
// //                        onClick={() => setSelectedUnit(unit.unit_id)}>
// //                     <div style={{ fontSize: "2rem", fontWeight: 700 }}>{idx + 1}</div>
// //                     <div style={{ fontWeight: 600 }}>{unit.kendrashala_name}</div>
// //                     <div>{t("total_staff")}: {unit.staff_count || 0}</div>
// //                     <div>{t("total_students")}: {unit.student_count || 0}</div>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           </div>
// //         );
// //       case "charts":
// //         return <AdminCharts units={units} />;
// //       case "notifications":
// //         return (
// //           <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
// //             <AddNotificationForm onSuccess={fetchNotifications} />
// //             <AddFormAndNotify onSuccess={() => { fetchForms(); fetchNotifications(); }} />
// //             <h5>Recent Notifications</h5>
// //             {notifications.length === 0
// //               ? <p>{t("no_new_notifications")}</p>
// //               : <ul>
// //                   {notifications.map(n => (
// //                     <li key={n.id}>
// //                       <b>{n.title ? n.title + ":" : ""}</b> {n.message}
// //                     </li>
// //                   ))}
// //                 </ul>}
// //             <h5 className="mt-5">Active Forms</h5>
// //             {forms.length === 0
// //               ? <p>No active forms</p>
// //               : <ul>
// //                   {forms.map(f => (
// //                     <li key={f.id || f._id}>
// //                       <b>{f.title}:</b> {f.description} | Deadline: {f.deadline && (new Date(f.deadline)).toLocaleDateString()}
// //                       {f.link &&
// //                         <a href={f.link} className="ms-2" target="_blank" rel="noopener noreferrer">Open form</a>
// //                       }
// //                     </li>
// //                   ))}
// //                 </ul>}
// //           </div>
// //         );
// //       default:
// //         return null;
// //     }
// //   };

// //   // -------- Layout/UI root ---------
// //   return (
// //     <div className="dashboard-container d-flex">
// //       <div className="sidebar">
// //         <div className="sidebar-header">
// //           <div className="app-icon" style={{ padding: 16 }}>
// //             <i className="bi bi-buildings-fill"></i>
// //             <span style={{ marginLeft: 12 }}>School Admin</span>
// //           </div>
// //         </div>
// //         <ul className="nav flex-column">
// //           {sidebarItems.map(item => (
// //             <li className="nav-item" key={item.key}>
// //               <button
// //                 className={`btn nav-link text-start w-100 ${sidebarTab === item.key ? "active fw-bold" : ""}`}
// //                 style={{ border: "none", background: "none" }}
// //                 onClick={() => setSidebarTab(item.key)}
// //               >
// //                 <i className={`bi ${item.icon} me-2`}></i>{item.label}
// //               </button>
// //             </li>
// //           ))}
// //           <li>
// //             <button
// //               onClick={() => {
// //                 localStorage.removeItem("token");
// //                 navigate("/login");
// //               }}
// //               className="btn nav-link text-start w-100"
// //               style={{ border: "none", background: "none" }}
// // //             >
// // //               <i className="bi bi-box-arrow-left me-2"></i> Logout
// // //             </button>
// // //           </li>
// // //         </ul>
// // //       </div>
// // //       <main className="main-content" style={{ flex: 1 }}>
// // //         {loading ? (
// // //           <div className="loading-spinner">
// // //             <div className="spinner-border text-primary" role="status">
// // //               <span className="visually-hidden">{t("loading")}...</span>
// // //             </div>
// // //           </div>
// // //         ) : error ? (
// // //           <div className="alert alert-danger m-4">{error}</div>
// // //         ) : unitLoading ? (
// // //           <div className="loading-spinner">
// // //             <div className="spinner-border text-secondary" role="status">
// // //               <span className="visually-hidden">{t("loading")}...</span>
// // //             </div>
// // //           </div>
// // //         ) : (
// // //           renderContent()
// // //         )}
// // //       </main>
// // //     </div>
// // //   );
// // // }
// // //admin/Dashboard.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useTranslation } from "react-i18next";
// import "./Dashboard.scss";
// import AdminCharts from "./Charts";


// export default function AdminDashboard() {
//   const { t } = useTranslation();
//   const [sidebarTab, setSidebarTab] = useState("dashboard");
//   const [units, setUnits] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [selectedUnit, setSelectedUnit] = useState(null);
//   const [unitDetails, setUnitDetails] = useState(null);
//   const [unitLoading, setUnitLoading] = useState(false);
//   const [teacherSearch, setTeacherSearch] = useState("");
//   const [studentSearch, setStudentSearch] = useState("");
//   const [teacherVisibleColumns, setTeacherVisibleColumns] = useState([
//     "staff_id", "full_name", "email", "phone", "qualification", "designation", "subject", "joining_date", "updatedat"
//   ]);
//   const [studentVisibleColumns, setStudentVisibleColumns] = useState([
//     "student_id", "full_name", "standard", "division", "roll_number", "academic_year", "passed",
//     "dob", "gender", "address", "parent_name", "parent_phone", "admission_date", "createdat", "updatedat"
//   ]);
//   const [teachersShowColDropdown, setTeachersShowColDropdown] = useState(false);
//   const [studentsShowColDropdown, setStudentsShowColDropdown] = useState(false);
//   const [studentsYear, setStudentsYear] = useState("");
//   const [notifications, setNotifications] = useState([]);
//   const [showNotifications, setShowNotifications] = useState(false);


//   const navigate = useNavigate();


//   const sidebarItems = [
//     { key: "dashboard", label: t("dashboard"), icon: "bi-speedometer2" },
//     { key: "tables", label: t("tables"), icon: "bi-table" },
//     { key: "charts", label: t("charts"), icon: "bi-bar-chart-fill" },
//     { key: "budgets", label: t("budgets"), icon: "bi-wallet2" },
//     { key: "notifications", label: t("notifications"), icon: "bi-bell-fill" }
//   ];


//   useEffect(() => {
//     async function fetchUnits() {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await axios.get("http://localhost:5000/api/admin/units", {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setUnits(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError(err.response?.data?.message || t("failed_load_units"));
//         setLoading(false);
//       }
//     }
//     fetchUnits();
//   }, [t]);


//   async function handleUnitCardClick(unitId) {
//     setUnitLoading(true);
//     setSelectedUnit(unitId);
//     setTeacherSearch("");
//     setStudentSearch("");
//     setStudentsYear("");
//     try {
//       const token = localStorage.getItem("token");
//       const res = await axios.get(`http://localhost:5000/api/admin/units/${unitId}`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setUnitDetails(res.data);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to load unit details");
//     }
//     setUnitLoading(false);
//   }


//   const teacherFields = [
//     ["staff_id", "Staff ID"], ["full_name", "Full Name"], ["email", "Email"], ["phone", "Phone"],
//     ["qualification", "Qualification"], ["designation", "Designation"],
//     ["subject", "Subject"], ["joining_date", "Joining Date"], ["updatedat", "Updated At"]
//   ];


//   const studentFields = [
//     ["student_id", "Student ID"], ["full_name", "Full Name"], ["standard", "Standard"], ["division", "Division"],
//     ["roll_number", "Roll Number"], ["academic_year", "Academic Year"], ["passed", "Passed"],
//     ["dob", "DOB"], ["gender", "Gender"], ["address", "Address"], ["parent_name", "Parent Name"],
//     ["parent_phone", "Parent Phone"], ["admission_date", "Admission Date"], ["createdat", "Created At"], ["updatedat", "Updated At"]
//   ];


//   const allStudentYears = unitDetails?.students
//     ? Array.from(new Set(unitDetails.students.map(s => s.academic_year).filter(Boolean))).sort().reverse()
//     : [];


//   const filteredTeachers = unitDetails?.teachers
//     ? unitDetails.teachers.filter(t =>
//         Object.values(t)
//           .join(" ")
//           .toLowerCase()
//           .includes(teacherSearch.toLowerCase())
//       )
//     : [];


//   function handleTeacherColumnToggle(key) {
//     setTeacherVisibleColumns(prev =>
//       prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
//     );
//   }


//   const filteredStudents = unitDetails?.students
//     ? unitDetails.students.filter(
//         s =>
//           (!studentsYear || s.academic_year === studentsYear) &&
//           Object.values(s)
//             .join(" ")
//             .toLowerCase()
//             .includes(studentSearch.toLowerCase())
//       )
//     : [];


//   function handleStudentColumnToggle(key) {
//     setStudentVisibleColumns(prev =>
//       prev.includes(key) ? prev.filter(col => col !== key) : [...prev, key]
//     );
//   }


//   function DynamicDropdownTable({ tableName, data }) {
//     const [visibleCols, setVisibleCols] = useState(() =>
//       data.length ? Object.keys(data[0]) : []
//     );
//     const [selectShow, setSelectShow] = useState(false);


//     useEffect(() => {
//       if (data.length) setVisibleCols(Object.keys(data[0]));
//     }, [data]);


//     if (!data.length) return <div className="mb-4 text-muted">{tableName} not available</div>;


//     const cols = Object.keys(data[0]);
//     function handleToggle(col) {
//       setVisibleCols(prev =>
//         prev.includes(col)
//           ? prev.filter(c => c !== col)
//           : [...prev, col]
//       );
//     }


//     return (
//       <div style={{ overflowX: "auto", marginBottom: 32 }}>
//         <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
//           <span className="fw-bold">{tableName}</span>
//           <div className="dropdown" style={{ position: "relative" }}>
//             <button
//               className="btn btn-outline-secondary dropdown-toggle"
//               type="button"
//               onClick={() => setSelectShow(s => !s)}
//             >
//               Select Columns
//             </button>
//             {selectShow && (
//               <div className="dropdown-menu show p-2" style={{ maxHeight: 320, overflowY: "auto", right: 0, left: "auto" }}>
//                 {cols.map(col => (
//                   <div key={col} className="form-check">
//                     <input
//                       type="checkbox"
//                       className="form-check-input"
//                       id={`col-check-table-${tableName}-${col}`}
//                       checked={visibleCols.includes(col)}
//                       onChange={() => handleToggle(col)}
//                     />
//                     <label className="form-check-label" htmlFor={`col-check-table-${tableName}-${col}`}>
//                       {col}
//                     </label>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//         <table className="table table-striped table-bordered">
//           <thead>
//             <tr>
//               {cols.filter(col => visibleCols.includes(col)).map(col =>
//                 <th key={col}>{col}</th>
//               )}
//             </tr>
//           </thead>
//           <tbody>
//             {data.map((row, i) =>
//               <tr key={tableName + "-row-" + i}>
//                 {cols.filter(col => visibleCols.includes(col)).map(col =>
//                   <td key={col}>
//                     {row[col] != null ? row[col].toString() : ""}
//                   </td>
//                 )}
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     );
//   }


//   const renderUnitDetails = () => (
//     <div>
//       <button className="btn btn-secondary mb-3" onClick={() => {
//         setSelectedUnit(null);
//         setUnitDetails(null);
//       }}>{t("back_to_units")}</button>
//       <h2>{unitDetails.kendrashala_name}</h2>
//       <div><strong>{t("total_staff")}:</strong> {unitDetails.teachers?.length ?? 0}</div>
//       <div><strong>{t("total_students")}:</strong> {unitDetails.students?.length ?? 0}</div>


//       <h4 className="mt-4">{t("school_details")}</h4>
//       <table className="table table-bordered mb-4">
//         <tbody>
//           {[
//             ["unit_id", "Unit ID"], ["semis_no", "SEMIS No"], ["dcf_no", "DCF No"],
//             ["nmms_no", "NMMS No"], ["scholarship_code", "Scholarship Code"],
//             ["first_grant_in_aid_year", "First Grant Year"], ["type_of_management", "Management Type"],
//             ["school_jurisdiction", "School Jurisdiction"], ["competent_authority_name", "Competent Authority"],
//             ["authority_number", "Authority Number"], ["authority_zone", "Authority Zone"],
//             ["kendrashala_name", "Kendrashala Name"], ["info_authority_name", "Info Authority"],
//             ["appellate_authority_name", "Appellate Authority"],
//             ["midday_meal_org_name", "Midday Meal Org"],
//             ["midday_meal_org_contact", "Midday Meal Contact"], ["standard_range", "Standard Range"],
//             ["headmistress_name", "Headmistress Name"], ["headmistress_phone", "Headmistress Phone"],
//             ["headmistress_email", "Headmistress Email"], ["school_shift", "School Shift"]
//           ].map(([key, label]) => (
//             <tr key={key}>
//               <th>{t(key)}</th>
//               <td>{unitDetails[key]}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>


//       <h4 className="mt-4">Teachers</h4>
//       <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
//         <input
//           type="text"
//           className="form-control"
//           style={{ maxWidth: 300 }}
//           placeholder="Search teachers by any field..."
//           value={teacherSearch}
//           onChange={e => setTeacherSearch(e.target.value)}
//         />
//         <div className="dropdown" style={{ position: "relative" }}>
//           <button
//             className="btn btn-outline-secondary dropdown-toggle"
//             type="button"
//             onClick={() => setTeachersShowColDropdown(s => !s)}
//           >
//             Select Columns
//           </button>
//           {teachersShowColDropdown && (
//             <div className="dropdown-menu show p-2" style={{ maxHeight: 300, overflowY: "auto", right: 0, left: "auto" }}>
//               {teacherFields.map(([key, label]) => (
//                 <div key={key} className="form-check">
//                   <input
//                     type="checkbox"
//                     className="form-check-input"
//                     id={`col-check-teacher-${key}`}
//                     checked={teacherVisibleColumns.includes(key)}
//                     onChange={() => handleTeacherColumnToggle(key)}
//                   />
//                   <label className="form-check-label" htmlFor={`col-check-teacher-${key}`}>
//                     {label}
//                   </label>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//       <div style={{ overflowX: "auto" }}>
//         <table className="table table-striped table-bordered">
//           <thead>
//             <tr>
//               {teacherFields.filter(([key]) => teacherVisibleColumns.includes(key)).map(([key, label]) => (
//                 <th key={key}>{label}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {filteredTeachers.map(t => (
//               <tr key={t.staff_id}>
//                 {teacherFields.filter(([key]) => teacherVisibleColumns.includes(key)).map(([key]) =>
//                   <td key={key}>{t[key] != null ? t[key] : ""}</td>
//                 )}
//               </tr>
//             ))}
//             {filteredTeachers.length === 0 && (
//               <tr>
//                 <td colSpan={teacherVisibleColumns.length} className="text-center">No teachers found</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>


//       <h4 className="mt-4">Students</h4>
//       <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
//         <input
//           type="text"
//           className="form-control"
//           style={{ maxWidth: 300 }}
//           placeholder="Search students by any field..."
//           value={studentSearch}
//           onChange={e => setStudentSearch(e.target.value)}
//         />
//         <select
//           value={studentsYear}
//           onChange={e => setStudentsYear(e.target.value)}
//           className="form-control"
//           style={{ width: 160 }}
//         >
//           <option value="">All Years</option>
//           {allStudentYears.map(year => (
//             <option value={year} key={year}>{year}</option>
//           ))}
//         </select>
//         <div className="dropdown" style={{ position: "relative" }}>
//           <button
//             className="btn btn-outline-secondary dropdown-toggle"
//             type="button"
//             onClick={() => setStudentsShowColDropdown(s => !s)}
//           >
//             Select Columns
//           </button>
//           {studentsShowColDropdown && (
//             <div className="dropdown-menu show p-2" style={{ maxHeight: 320, overflowY: "auto", right: 0, left: "auto" }}>
//               {studentFields.map(([key, label]) => (
//                 <div key={key} className="form-check">
//                   <input
//                     type="checkbox"
//                     className="form-check-input"
//                     id={`col-check-student-${key}`}
//                     checked={studentVisibleColumns.includes(key)}
//                     onChange={() => handleStudentColumnToggle(key)}
//                   />
//                   <label className="form-check-label" htmlFor={`col-check-student-${key}`}>
//                     {label}
//                   </label>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//       <div style={{ overflowX: "auto" }}>
//         <table className="table table-striped table-bordered">
//           <thead>
//             <tr>
//               {studentFields.filter(([key]) => studentVisibleColumns.includes(key)).map(([key, label]) => (
//                 <th key={key}>{label}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {filteredStudents.map(s => (
//               <tr key={s.student_id + "-" + s.roll_number + "-" + s.academic_year}>
//                 {studentFields.filter(([key]) => studentVisibleColumns.includes(key)).map(([key]) =>
//                   <td key={key}>
//                     {key === "passed"
//                       ? (s[key] ? "Yes" : "No")
//                       : (key === "dob" || key === "admission_date")
//                         ? (s[key] ? new Date(s[key]).toLocaleDateString() : "")
//                         : s[key] != null ? s[key] : ""}
//                   </td>
//                 )}
//               </tr>
//             ))}
//             {filteredStudents.length === 0 && (
//               <tr>
//                 <td colSpan={studentVisibleColumns.length} className="text-center">No students found</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>


//       <h4 className="mt-4">Unit Payments</h4>
//       <DynamicDropdownTable tableName="Payments" data={unitDetails.payments ?? []} />


//       <h4 className="mt-4">Unit Budgets</h4>
//       <DynamicDropdownTable tableName="Budgets" data={unitDetails.budgets ?? []} />


//       <h4 className="mt-4">Unit Banks</h4>
//       <DynamicDropdownTable tableName="Banks" data={unitDetails.banks ?? []} />


//       <h4 className="mt-4">Unit Cases</h4>
//       <DynamicDropdownTable tableName="Cases" data={unitDetails.cases ?? []} />
//     </div>
//   );


//   function NotificationBell() {
//     return (
//       <div className="notification-bell-container">
//         <button
//           className="btn btn-light position-relative me-3"
//           onClick={() => setShowNotifications(!showNotifications)}
//         >
//           <i className="bi bi-bell fs-5"></i>
//           {notifications.length > 0 && (
//             <span className="badge bg-danger position-absolute top-0 start-100 translate-middle">
//               {notifications.length}
//             </span>
//           )}
//         </button>
//         {showNotifications && (
//           <div
//             className="position-absolute bg-white shadow rounded p-2"
//             style={{ top: "60px", right: "20px", width: "250px", zIndex: 1000 }}
//           >
//             <h6 className="border-bottom pb-2 mb-2">{t("notifications")}</h6>
//             {notifications.length === 0 ? (
//               <p className="text-muted mb-0">{t("no_new_notifications")}</p>
//             ) : (
//               <ul className="list-unstyled mb-0">
//                 {notifications.map((n) => (
//                   <li key={n.id} className="mb-2">
//                     <i className="bi bi-dot text-primary"></i> {n.message}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>
//         )}
//       </div>
//     );
//   }


//   const renderContent = () => {
//     switch (sidebarTab) {
//       case "dashboard":
//         if (selectedUnit && unitDetails) return renderUnitDetails();
//         return (
//           <div>
//             <div className="page-header">
//               <h2>{t("school_overview")}</h2>
//               <p className="text-muted">{t("manage_monitor_all_schools")}</p>
//             </div>
//             <div className="row">
//               {units.map((unit, idx) => (
//                 <div key={unit.unit_id} className="col-md-4 col-lg-3 col-sm-6 mb-4">
//                   <div
//                     className="card shadow-sm text-center p-3"
//                     style={{ cursor: "pointer", borderRadius: 14 }}
//                     onClick={() => handleUnitCardClick(unit.unit_id)}
//                   >
//                     <div style={{ fontSize: "2rem", fontWeight: 700 }}>{idx + 1}</div>
//                     <div style={{ fontWeight: 600 }}>{unit.kendrashala_name}</div>
//                     <div>{t("total_staff")}: {unit.staff_count || 0}</div>
//                     <div>{t("total_students")}: {unit.student_count || 0}</div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         );
//       case "charts":
//         return <AdminCharts units={units} />;
//       case "tables":
//         // You may have another case to render your Tables view
//         // return <Tables units={units} />;
//         return null;
//       case "budgets":
//         // You may have another case to render your Budgets view
//         // return <Budgets units={units} />;
//         return null;
//       default:
//         return null;
//     }
//   };


//   return (
//     <div className="dashboard-container">
//       <div className="sidebar">
//         <div className="sidebar-header">
//           <div className="app-icon">
//             <i className="bi bi-buildings-fill"></i>
//           </div>
//           <h3>{t("admin_panel")}</h3>
//         </div>
//         <nav className="sidebar-nav">
//           {sidebarItems.map(item => (
//             <button
//               key={item.key}
//               className={`nav-link ${sidebarTab === item.key ? "active" : ""}`}
//               onClick={() => {
//                 if (item.key === "notifications") {
//                   navigate("/admin/notifications");
//                 } else {
//                   setSidebarTab(item.key);
//                 }
//               }}
//             >
//               <i className={`bi ${item.icon}`}></i>
//               <span>{item.label}</span>
//             </button>
//           ))}
//         </nav>
//         <div className="sidebar-footer">
//           <button
//             className="nav-link"
//             onClick={() => {
//               localStorage.removeItem("token");
//               navigate("/login");
//             }}
//           >
//             <i className="bi bi-box-arrow-left"></i>
//             <span>{t("logout")}</span>
//           </button>
//         </div>
//       </div>
//       <div className="top-header d-flex justify-content-end align-items-center p-3 bg-white shadow-sm position-relative">
//         <NotificationBell />
//       </div>
//       <main className="main-content">
//         {loading ? (
//           <div className="loading-spinner">
//             <div className="spinner-border text-primary" role="status">
//               <span className="visually-hidden">{t("loading")}...</span>
//             </div>
//           </div>
//         ) : error ? (
//           <div className="alert alert-danger m-4">{error}</div>
//         ) : unitLoading ? (
//           <div className="loading-spinner">
//             <div className="spinner-border text-secondary" role="status">
//               <span className="visually-hidden">{t("loading")}...</span>
//             </div>
//           </div>
//         ) : (
//           renderContent()
//         )}
//       </main>
//     </div>
//   );
// }









import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "./Dashboard.scss";
import AdminCharts from "./Charts";

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
  const [teacherVisibleColumns, setTeacherVisibleColumns] = useState(["staff_id","full_name","email","phone","qualification","designation","subject","joining_date","updatedat"]);
  const [studentVisibleColumns, setStudentVisibleColumns] = useState(["student_id","full_name","standard","division","roll_number","academic_year","passed","dob","gender","address","parent_name","parent_phone","admission_date","createdat","updatedat"]);
  const [teachersShowColDropdown, setTeachersShowColDropdown] = useState(false);
  const [studentsShowColDropdown, setStudentsShowColDropdown] = useState(false);
  const [studentsYear, setStudentsYear] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [forms, setForms] = useState([]);

  // Notification State
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  const [notifRole, setNotifRole] = useState("principal");
  const [notifLoading, setNotifLoading] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formRole, setFormRole] = useState("principal");
  const [formQuestions, setFormQuestions] = useState([{ question_text: "", question_type: "text", options: "" }]);
  const [formLoading, setFormLoading] = useState(false);

  const navigate = useNavigate();

  const sidebarItems = [
    { key: "dashboard", label: t("dashboard"), icon: "bi-speedometer2" },
    { key: "tables", label: t("tables"), icon: "bi-table" },
    { key: "charts", label: t("charts"), icon: "bi-bar-chart-fill" },
    { key: "budgets", label: t("budgets"), icon: "bi-wallet2" },
    { key: "notifications", label: t("notifications"), icon: "bi-bell-fill" },
  ];

  useEffect(() => {
    async function fetchUnits() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/admin/units", {
          headers: { Authorization: `Bearer ${token}` },
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

  useEffect(() => {
    if (sidebarTab === "notifications") {
      loadNotifications();
      loadForms();
    }
    // eslint-disable-next-line
  }, [sidebarTab, notifRole, formRole]);

  // ---- Notifications page methods and handlers ----
  const loadNotifications = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch {
      setNotifications([]);
    }
  };

  const loadForms = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `http://localhost:5000/api/forms/active?role=${formRole}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForms(res.data);
    } catch {
      setForms([]);
    }
  };

  const addNotification = async (e) => {
    e.preventDefault();
    setNotifLoading(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:5000/api/notifications",
        {
          title: notifTitle,
          message: notifMsg,
          receiver_role: notifRole,
          sender_role: "admin",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifTitle("");
      setNotifMsg("");
      setNotifLoading(false);
      loadNotifications();
      alert("Notification Sent ✅");
    } catch {
      setNotifLoading(false);
      alert("Failed to send notification");
    }
  };

  const addForm = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    const token = localStorage.getItem("token");
    const questionsPayload = formQuestions.map((q) => ({
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options ? q.options : null,
    }));
    try {
      const formRes = await axios.post(
        "http://localhost:5000/api/forms/create",
        {
          title: formTitle,
          description: formDesc,
          receiver_role: formRole,
          deadline: formDeadline,
          questions: questionsPayload,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const formId = formRes.data.form.id;
      const formLink = `http://localhost:3000/forms/${formId}`;
      await axios.post(
        "http://localhost:5000/api/notifications",
        {
          title: `New Form: ${formTitle}`,
          message: `Please fill this form before deadline: ${formLink}`,
          receiver_role: formRole,
          sender_role: "admin",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormTitle("");
      setFormDesc("");
      setFormDeadline("");
      setFormQuestions([{ question_text: "", question_type: "text", options: "" }]);
      setFormLoading(false);
      loadForms();
      alert("Form Created and Notification Sent ✅");
    } catch {
      setFormLoading(false);
      alert("Failed to create/send form");
    }
  };

  const handleQuestionChange = (idx, field, value) => {
    setFormQuestions((qs) =>
      qs.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );
  };

  const addFormQuestion = () => {
    setFormQuestions((qs) => [...qs, { question_text: "", question_type: "text", options: "" }]);
  };

  const removeFormQuestion = (idx) => {
    setFormQuestions((qs) => qs.filter((_, i) => i !== idx));
  };
  // ------------------------------------------------

  async function handleUnitCardClick(unitId) {
    setUnitLoading(true);
    setSelectedUnit(unitId);
    setTeacherSearch("");
    setStudentSearch("");
    setStudentsYear("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/admin/units/${unitId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnitDetails(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load unit details");
    }
    setUnitLoading(false);
  }

  const teacherFields = [
    ["staff_id", "Staff ID"],["full_name", "Full Name"],["email", "Email"],["phone", "Phone"],
    ["qualification", "Qualification"],["designation", "Designation"],["subject", "Subject"],
    ["joining_date", "Joining Date"],["updatedat", "Updated At"]
  ];

  const studentFields = [
    ["student_id", "Student ID"],["full_name", "Full Name"],["standard", "Standard"],["division", "Division"],
    ["roll_number", "Roll Number"],["academic_year", "Academic Year"],["passed", "Passed"],
    ["dob", "DOB"],["gender", "Gender"],["address", "Address"],["parent_name", "Parent Name"],
    ["parent_phone", "Parent Phone"],["admission_date", "Admission Date"],["createdat", "Created At"],["updatedat", "Updated At"]
  ];

  const allStudentYears = unitDetails?.students
    ? Array.from(new Set(unitDetails.students.map((s) => s.academic_year).filter(Boolean))).sort().reverse()
    : [];

  const filteredTeachers = unitDetails?.teachers
    ? unitDetails.teachers.filter((t) =>
        Object.values(t).join(" ").toLowerCase().includes(teacherSearch.toLowerCase())
      )
    : [];

  function handleTeacherColumnToggle(key) {
    setTeacherVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]
    );
  }

  const filteredStudents = unitDetails?.students
    ? unitDetails.students.filter(
        (s) =>
          (!studentsYear || s.academic_year === studentsYear) &&
          Object.values(s).join(" ").toLowerCase().includes(studentSearch.toLowerCase())
      )
    : [];

  function handleStudentColumnToggle(key) {
    setStudentVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]
    );
  }

  function DynamicDropdownTable({ tableName, data }) {
    const [visibleCols, setVisibleCols] = useState(() => (data.length ? Object.keys(data[0]) : []));
    const [selectShow, setSelectShow] = useState(false);

    useEffect(() => {
      if (data.length) setVisibleCols(Object.keys(data[0]));
    }, [data]);

    if (!data.length) return <div className="mb-4 text-muted">{tableName} not available</div>;

    const cols = Object.keys(data[0]);
    function handleToggle(col) {
      setVisibleCols((prev) => (prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]));
    }

    return (
      <div style={{ overflowX: "auto", marginBottom: 32 }}>
        <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
          <span className="fw-bold">{tableName}</span>
          <div className="dropdown" style={{ position: "relative" }}>
            <button className="btn btn-outline-secondary dropdown-toggle" type="button" onClick={() => setSelectShow((s) => !s)}>
              Select Columns
            </button>
            {selectShow && (
              <div className="dropdown-menu show p-2" style={{ maxHeight: 320, overflowY: "auto", right: 0, left: "auto" }}>
                {cols.map((col) => (
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
              {cols.filter((col) => visibleCols.includes(col)).map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={tableName + "-row-" + i}>
                {cols.filter((col) => visibleCols.includes(col)).map((col) => (
                  <td key={col}>{row[col] != null ? row[col].toString() : ""}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const renderUnitDetails = () =>
    unitDetails ? (
      <div>
        <button
          className="btn btn-secondary mb-3"
          onClick={() => {
            setSelectedUnit(null);
            setUnitDetails(null);
          }}
        >
          {t("back_to_units")}
        </button>
        <h2>{unitDetails.kendrashala_name}</h2>
        <div>
          <strong>{t("total_staff")}:</strong> {unitDetails.teachers?.length ?? 0}
        </div>
        <div>
          <strong>{t("total_students")}:</strong> {unitDetails.students?.length ?? 0}
        </div>
        <h4 className="mt-4">{t("school_details")}</h4>
        <table className="table table-bordered mb-4">
          <tbody>
            {[
              ["unit_id", "Unit ID"],["semis_no", "SEMIS No"],["dcf_no", "DCF No"],["nmms_no", "NMMS No"],["scholarship_code", "Scholarship Code"],
              ["first_grant_in_aid_year", "First Grant Year"],["type_of_management", "Management Type"],["school_jurisdiction", "School Jurisdiction"],
              ["competent_authority_name", "Competent Authority"],["authority_number", "Authority Number"],["authority_zone", "Authority Zone"],
              ["kendrashala_name", "Kendrashala Name"],["info_authority_name", "Info Authority"],["appellate_authority_name", "Appellate Authority"],
              ["midday_meal_org_name", "Midday Meal Org"],["midday_meal_org_contact", "Midday Meal Contact"],["standard_range", "Standard Range"],
              ["headmistress_name", "Headmistress Name"],["headmistress_phone", "Headmistress Phone"],["headmistress_email", "Headmistress Email"],["school_shift", "School Shift"],
            ].map(([key, label]) => (
              <tr key={key}>
                <th>{t(key)}</th>
                <td>{unitDetails[key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Teachers */}
        <h4 className="mt-4">Teachers</h4>
        <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: 300 }}
            placeholder="Search teachers by any field..."
            value={teacherSearch}
            onChange={(e) => setTeacherSearch(e.target.value)}
          />
          <div className="dropdown" style={{ position: "relative" }}>
            <button className="btn btn-outline-secondary dropdown-toggle" type="button" onClick={() => setTeachersShowColDropdown((s) => !s)}>
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
              {filteredTeachers.map((t) => (
                <tr key={t.staff_id}>
                  {teacherFields.filter(([key]) => teacherVisibleColumns.includes(key)).map(([key]) => (
                    <td key={key}>{t[key] != null ? t[key] : ""}</td>
                  ))}
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
        {/* Students */}
        <h4 className="mt-4">Students</h4>
        <div className="d-flex align-items-center mb-2" style={{ gap: 16 }}>
          <input
            type="text"
            className="form-control"
            style={{ maxWidth: 300 }}
            placeholder="Search students by any field..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
          />
          <select
            value={studentsYear}
            onChange={(e) => setStudentsYear(e.target.value)}
            className="form-control"
            style={{ width: 160 }}
          >
            <option value="">All Years</option>
            {allStudentYears.map((year) => (
              <option value={year} key={year}>
                {year}
              </option>
            ))}
          </select>
          <div className="dropdown" style={{ position: "relative" }}>
            <button className="btn btn-outline-secondary dropdown-toggle" type="button" onClick={() => setStudentsShowColDropdown((s) => !s)}>
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
              {filteredStudents.map((s) => (
                <tr key={s.student_id + "-" + s.roll_number + "-" + s.academic_year}>
                  {studentFields.filter(([key]) => studentVisibleColumns.includes(key)).map(([key]) => (
                    <td key={key}>
                      {key === "passed"
                        ? s[key] ? "Yes" : "No"
                        : key === "dob" || key === "admission_date"
                        ? s[key] ? new Date(s[key]).toLocaleDateString() : ""
                        : s[key] != null ? s[key] : ""}
                    </td>
                  ))}
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
        {/* Other Unit detail tables */}
        <h4 className="mt-4">Unit Payments</h4>
        <DynamicDropdownTable tableName="Payments" data={unitDetails.payments ?? []} />
        <h4 className="mt-4">Unit Budgets</h4>
        <DynamicDropdownTable tableName="Budgets" data={unitDetails.budgets ?? []} />
        <h4 className="mt-4">Unit Banks</h4>
        <DynamicDropdownTable tableName="Banks" data={unitDetails.banks ?? []} />
        <h4 className="mt-4">Unit Cases</h4>
        <DynamicDropdownTable tableName="Cases" data={unitDetails.cases ?? []} />
      </div>
    ) : null;

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
                  <div className="card shadow-sm text-center p-3" style={{ cursor: "pointer", borderRadius: 14 }} onClick={() => handleUnitCardClick(unit.unit_id)}>
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
      // ---- NOTIFICATIONS PAGE ----
      case "notifications":
        return (
          <div style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
            <h2 style={{ marginBottom: 6 }}>Admin Notification Panel + Form Creator</h2>
            <div style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>
              Send Notifications or Create &amp; Send Forms
            </div>
            {/* Send Notification Box */}
            <div style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 7,
              boxShadow: "0 0 6px 0 #e0e0e0",
              marginBottom: 24,
              padding: 16
            }}>
              <h4 style={{ fontSize: 18, marginBottom: 14 }}>Send Notification</h4>
              <form onSubmit={addNotification}>
                <label className="form-label" style={{ fontWeight: 500 }}>Send To:</label>
                <select
                  className="form-select mb-2"
                  value={notifRole}
                  onChange={(e) => setNotifRole(e.target.value)}>
                  <option value="principal">Principal</option>
                  <option value="teacher">Teacher</option>
                </select>
                <label className="form-label">Title:</label>
                <input
                  type="text"
                  className="form-control mb-2"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  required
                />
                <label className="form-label">Message:</label>
                <textarea
                  className="form-control mb-2"
                  value={notifMsg}
                  onChange={(e) => setNotifMsg(e.target.value)}
                  required
                />
                <button className="btn btn-primary w-100" disabled={notifLoading} type="submit">
                  Send&nbsp;{notifLoading ? <span className="spinner-border spinner-border-sm"></span> : <span>&#x2705;</span>}
                </button>
              </form>
            </div>
            {/* Create Form Box */}
            <div style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 7,
              boxShadow: "0 0 6px 0 #e0e0e0",
              marginBottom: 24,
              padding: 16
            }}>
              <h4 style={{ fontSize: 18, marginBottom: 14 }}>Create and Send Form</h4>
              <form onSubmit={addForm}>
                <label className="form-label" style={{ fontWeight: 500 }}>Send To:</label>
                <select
                  className="form-select mb-2"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}>
                  <option value="principal">Principal</option>
                  <option value="teacher">Teacher</option>
                </select>
                <label className="form-label">Form Title:</label>
                <input
                  type="text"
                  className="form-control mb-2"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                />
                <label className="form-label">Description (optional):</label>
                <textarea
                  className="form-control mb-2"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
                <label className="form-label">Deadline:</label>
                <input
                  type="datetime-local"
                  className="form-control mb-2"
                  value={formDeadline}
                  onChange={(e) => setFormDeadline(e.target.value)}
                />
                <label className="form-label">Questions:</label>
                {formQuestions.map((q, idx) => (
                  <div key={idx} style={{ marginBottom: 10, background: "#f8f8fb", borderRadius: 4, padding: 10 }}>
                    <input
                      placeholder="Question text"
                      className="form-control mb-1"
                      value={q.question_text}
                      required
                      onChange={e => handleQuestionChange(idx, "question_text", e.target.value)}
                    />
                    <select
                      className="form-select mb-1"
                      value={q.question_type}
                      onChange={e => handleQuestionChange(idx, "question_type", e.target.value)}
                    >
                      <option value="text">Text</option>
                      <option value="mcq">MCQ</option>
                    </select>
                    {q.question_type === "mcq" && (
                      <input
                        placeholder="Comma separated options"
                        className="form-control mb-1"
                        value={q.options}
                        onChange={e => handleQuestionChange(idx, "options", e.target.value)}
                      />
                    )}
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removeFormQuestion(idx)} disabled={formQuestions.length === 1}>Remove</button>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary mb-2" onClick={addFormQuestion}>
                  Add Question
                </button>
                <button className="btn btn-success w-100" disabled={formLoading} type="submit">
                  Create Form &amp; Send Notification&nbsp;{formLoading ? <span className="spinner-border spinner-border-sm"></span> : <span>&#x2705;</span>}
                </button>
              </form>
            </div>
            {/* Notifications List */}
            <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 7, boxShadow: "0 0 6px #e0e0e0", marginBottom: 24, padding: 16 }}>
              <h4 style={{ fontSize: 16, marginBottom: 12 }}>Received Notifications</h4>
              {notifications.length === 0 ? (
                <div>No notifications received</div>
              ) : (
                <ul>{notifications.map(n=>(
                  <li key={n.id}><b>{n.title}:</b> {n.message}</li>
                ))}</ul>
              )}
            </div>
            {/* Active Forms */}
            <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 7, boxShadow: "0 0 6px #e0e0e0", padding: 16 }}>
              <h4 style={{ fontSize: 16, marginBottom: 12 }}>Active Forms ({forms.length})</h4>
              {forms.length === 0 ? (
                <div>No active forms</div>
              ) : (
                <div>
                  {forms.map(f => (
                    <div key={f.id||f._id} style={{ border: "1px solid #eee", borderRadius: 5, padding: 12, marginBottom: 12 }}>
                      <b style={{ fontSize: 15 }}>{f.title}</b>
                      <div>Deadline: {f.deadline && new Date(f.deadline).toLocaleString()}</div>
                      {f.link && <a href={f.link} rel="noopener noreferrer" target="_blank">Fill Form Link</a>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  function NotificationBell() {
    return null;
  }

  return (
    <div className="dashboard-container d-flex">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="app-icon">
            <i className="bi bi-buildings-fill"></i>
          </div>
          <h3>{t("admin_panel")}</h3>
        </div>
        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
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
      <main className="main-content" style={{ flex: 1 }}>
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
