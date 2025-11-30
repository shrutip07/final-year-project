

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useTranslation } from "react-i18next";
// import ChatWidget from "../../components/ChatWidget";
// import "./Dashboard.scss";

// function getCurrentAcademicYear() {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = now.getMonth();
//   if (month >= 3) {
//     return `${year}-${(year + 1).toString().slice(-2)}`;
//   } else {
//     return `${year - 1}-${year.toString().slice(-2)}`;
//   }
// }

// export default function Students() {
//   const { t } = useTranslation();
//   const navigate = useNavigate();
//   const currentYear = getCurrentAcademicYear();

//   const [studentsCurrentYear, setStudentsCurrentYear] = useState([]);
//   const [searchCurrentYear, setSearchCurrentYear] = useState("");
//   const [modalType, setModalType] = useState("");
//   const [form, setForm] = useState({});
//   const [updating, setUpdating] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [loadingCurrent, setLoadingCurrent] = useState(true);
//   const [error, setError] = useState("");

//   // Fetch students of current year on load
//   useEffect(() => {
//     fetchStudentsByYear(currentYear, true);
//     // eslint-disable-next-line
//   }, []);

//   async function fetchStudentsByYear(year, isCurrent) {
//     if (isCurrent) setLoadingCurrent(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         navigate('/login');
//         return;
//       }
//       const response = await axios.get(
//         `http://localhost:5000/api/teacher/students?academic_year=${encodeURIComponent(year)}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setStudentsCurrentYear(response.data);
//       setLoadingCurrent(false);
//     } catch (err) {
//       setError(err.response?.data?.message || t("failed_load_students"));
//       setLoadingCurrent(false);
//     }
//   }

//   function handleSearchChange(e) {
//     setSearchCurrentYear(e.target.value.toLowerCase());
//   }

//   function filteredStudents(studentsList, search) {
//     if (!search) return studentsList;
//     return studentsList.filter(s =>
//       s.full_name.toLowerCase().includes(search) ||
//       (s.roll_number && s.roll_number.toString().includes(search)) ||
//       (s.standard && s.standard.toLowerCase().includes(search)) ||
//       (s.division && s.division.toLowerCase().includes(search))
//     );
//   }

//   // Modal open functions (edit/add/view)
//   function handleView(student) {
//     setSelectedStudent(student);
//     setModalType("view");
//   }

//   function handleEdit(student) {
//     setSelectedStudent(student);
//     setForm({
//       student_id: student.student_id || "",
//       full_name: student.full_name || "",
//       dob: student.dob || "",
//       gender: student.gender || "",
//       address: student.address || "",
//       parent_name: student.parent_name || "",
//       parent_phone: student.parent_phone || "",
//       admission_date: student.admission_date || "",
//       enrollment_id: student.enrollment_id || "",
//       standard: student.standard || "",
//       division: student.division || "",
//       roll_number: student.roll_number || "",
//       academic_year: student.academic_year || currentYear,
//       passed: typeof student.passed === "boolean" ? student.passed : ""
//     });
//     setModalType("edit");
//   }

//   function handleAddNew() {
//     setForm({
//       full_name: "",
//       dob: "",
//       gender: "",
//       address: "",
//       parent_name: "",
//       parent_phone: "",
//       admission_date: "",
//       standard: "",
//       division: "",
//       roll_number: "",
//       academic_year: currentYear,
//       passed: ""
//     });
//     setModalType("add");
//   }

//   function closeModal() {
//     setSelectedStudent(null);
//     setModalType("");
//     setForm({});
//     setUpdating(false);
//   }

//   function handleFormChange(e) {
//     const { name, value } = e.target;
//     if (name === "passed") {
//       setForm({ ...form, passed: value === "" ? "" : value === "true" });
//     } else {
//       setForm({ ...form, [name]: value });
//     }
//   }

//   async function handleUpdate(e) {
//     e.preventDefault();
//     setUpdating(true);
//     const token = localStorage.getItem("token");
//     try {
//       await axios.put(
//         `http://localhost:5000/api/teacher/student/${form.student_id}`,
//         {
//           full_name: form.full_name,
//           dob: form.dob,
//           gender: form.gender,
//           address: form.address,
//           parent_name: form.parent_name,
//           parent_phone: form.parent_phone,
//           admission_date: form.admission_date,
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       await axios.put(
//         `http://localhost:5000/api/teacher/enrollment/${form.enrollment_id}`,
//         {
//           standard: form.standard,
//           division: form.division,
//           roll_number: form.roll_number,
//           academic_year: form.academic_year,
//           passed: form.passed === "" ? null : form.passed,
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       fetchStudentsByYear(currentYear, true);
//       closeModal();
//     } catch {
//       alert(t("failed_update_student"));
//       setUpdating(false);
//     }
//   }

//   async function handleAddSubmit(e) {
//     e.preventDefault();
//     setUpdating(true);
//     const token = localStorage.getItem("token");
//     try {
//       const profileRes = await axios.get(
//         "http://localhost:5000/api/teacher/me",
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const unit_id = profileRes.data.unit_id;
//       const resProfile = await axios.post(
//         "http://localhost:5000/api/teacher/student",
//         {
//           full_name: form.full_name,
//           dob: form.dob,
//           gender: form.gender,
//           address: form.address,
//           parent_name: form.parent_name,
//           parent_phone: form.parent_phone,
//           admission_date: form.admission_date,
//           unit_id,
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const student_id = resProfile.data.student_id;
//       await axios.post(
//         "http://localhost:5000/api/teacher/enrollment",
//         {
//           student_id,
//           standard: form.standard,
//           division: form.division,
//           roll_number: form.roll_number,
//           academic_year: currentYear,
//           passed: false,
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       fetchStudentsByYear(currentYear, true);
//       closeModal();
//     } catch {
//       alert(t("failed_add_student"));
//       setUpdating(false);
//     }
//   }

//   if (loadingCurrent) return (
//     <div className="teacher-students-page">
//       <div className="teacher-main-content">
//         <div className="loading-state">{t("loading_students")}...</div>
//       </div>
//     </div>
//   );
  
//   if (error) return (
//     <div className="teacher-students-page">
//       <div className="teacher-main-content">
//         <div className="error-state">{error}</div>
//       </div>
//     </div>
//   );

//   return (
//     <div className="teacher-students-page">
//       <div className="teacher-main-content">
//         <div className="page-header">
//           <h2>{t("student_management")} - {currentYear}</h2>
//         </div>

//         <div className="teacher-students-card">
//           <div className="card-header">
//             <h3>{t("students")}</h3>
//             <div className="header-controls">
//               <button className="save-btn" onClick={handleAddNew}>
//                 <i className="bi bi-plus-circle"></i> {t("add_student")}
//               </button>
//             </div>
//           </div>
//           <div className="card-body">
//             <input
//               className="form-control mb-3"
//               placeholder={t("search_placeholder")}
//               value={searchCurrentYear}
//               onChange={handleSearchChange}
//               style={{ maxWidth: 400 }}
//             />
//             <div className="table-responsive">
//               <table>
//                 <thead>
//               <tr>
//                 <th>{t("roll_no")}</th>
//                 <th>{t("full_name")}</th>
//                 <th>{t("standard")}</th>
//                 <th>{t("division")}</th>
//                 <th>{t("dob")}</th>
//                 <th>{t("gender")}</th>
//                 <th>{t("parent_name")}</th>
//                 <th>{t("parent_phone")}</th>
//                 <th>{t("address")}</th>
//                 <th>{t("admission_date")}</th>
//                 <th>{t("passed")}</th>
//                 <th>{t("actions")}</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredStudents(studentsCurrentYear, searchCurrentYear).map(st => (
//                 <tr key={st.enrollment_id || st.student_id + "-" + st.academic_year}>
//                   <td>{st.roll_number || ""}</td>
//                   <td>{st.full_name || ""}</td>
//                   <td>{st.standard || ""}</td>
//                   <td>{st.division || ""}</td>
//                   <td>{st.dob || ""}</td>
//                   <td>{st.gender || ""}</td>
//                   <td>{st.parent_name || ""}</td>
//                   <td>{st.parent_phone || ""}</td>
//                   <td>{st.address || ""}</td>
//                   <td>{st.admission_date || ""}</td>
//                   <td>{st.passed === true ? t("yes") : st.passed === false ? t("no") : ""}</td>
//                   <td>
//                     <button className="btn-sm btn-info me-2" onClick={() => handleView(st)} style={{ padding: "6px 12px", borderRadius: "6px", border: "none", background: "#0B63E5", color: "white", cursor: "pointer" }}>
//                       {t("view")}
//                     </button>
//                     <button className="btn-sm btn-primary" onClick={() => handleEdit(st)} style={{ padding: "6px 12px", borderRadius: "6px", border: "none", background: "#1D9BF0", color: "white", cursor: "pointer" }}>
//                       {t("edit")}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {filteredStudents(studentsCurrentYear, searchCurrentYear).length === 0 && (
//                 <tr>
//                   <td colSpan="12" style={{ textAlign: "center", padding: "20px" }}>{t("no_students_found")}</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//         </div>
//       </div>
//     </div>

//       {(modalType === "view" || modalType === "edit" || modalType === "add") && (
//         <div className="modal show d-block" tabIndex="-1" style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
//           <div className="modal-dialog" style={{ maxWidth: "600px", width: "90%" }}>
//             <div className="modal-content" style={{ background: "white", borderRadius: "12px", padding: "24px" }}>
//               <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #E5E7EB" }}>
//                 <h5 className="modal-title" style={{ margin: 0, color: "#0A2540", fontSize: "20px", fontWeight: 600 }}>
//                   {modalType === "view"
//                     ? t("student_details")
//                     : modalType === "edit"
//                     ? t("edit_student")
//                     : t("add_student")}
//                 </h5>
//                 <button type="button" className="btn-close" onClick={closeModal} style={{ background: "none", border: "none", fontSize: "24px", cursor: "pointer" }}>×</button>
//               </div>
//               <div className="modal-body">
//                 {modalType === "view" ? (
//                   <div>
//                     <div><strong>{t("full_name")}:</strong> {selectedStudent.full_name}</div>
//                     <div><strong>{t("roll_no")}:</strong> {selectedStudent.roll_number}</div>
//                     <div><strong>{t("standard")}:</strong> {selectedStudent.standard}</div>
//                     <div><strong>{t("division")}:</strong> {selectedStudent.division}</div>
//                     <div><strong>{t("dob")}:</strong> {selectedStudent.dob}</div>
//                     <div><strong>{t("gender")}:</strong> {selectedStudent.gender}</div>
//                     <div><strong>{t("parent_name")}:</strong> {selectedStudent.parent_name}</div>
//                     <div><strong>{t("parent_phone")}:</strong> {selectedStudent.parent_phone}</div>
//                     <div><strong>{t("address")}:</strong> {selectedStudent.address}</div>
//                     <div><strong>{t("admission_date")}:</strong> {selectedStudent.admission_date}</div>
//                     <div><strong>{t("passed")}:</strong> {selectedStudent.passed === true ? t("yes") : selectedStudent.passed === false ? t("no") : ""}</div>
//                   </div>
//                 ) : (
//                   <form onSubmit={modalType === "add" ? handleAddSubmit : handleUpdate}>
//                     <input type="text" className="form-control mb-2" name="full_name" value={form.full_name} onChange={handleFormChange} placeholder={t("full_name")} required />
//                     <input type="text" className="form-control mb-2" name="standard" value={form.standard} onChange={handleFormChange} placeholder={t("standard")} required />
//                     <input type="text" className="form-control mb-2" name="division" value={form.division} onChange={handleFormChange} placeholder={t("division")} required />
//                     <input type="number" className="form-control mb-2" name="roll_number" value={form.roll_number} onChange={handleFormChange} placeholder={t("roll_no")} required />
//                     <input type="date" className="form-control mb-2" name="dob" value={form.dob} onChange={handleFormChange} />
//                     <input type="text" className="form-control mb-2" name="gender" value={form.gender} onChange={handleFormChange} placeholder={t("gender")} required />
//                     <input type="text" className="form-control mb-2" name="parent_name" value={form.parent_name} onChange={handleFormChange} placeholder={t("parent_name")} />
//                     <input type="text" className="form-control mb-2" name="parent_phone" value={form.parent_phone} onChange={handleFormChange} placeholder={t("parent_phone")} />
//                     <input type="text" className="form-control mb-2" name="address" value={form.address} onChange={handleFormChange} placeholder={t("address")} />
//                     <input type="date" className="form-control mb-2" name="admission_date" value={form.admission_date || ""} onChange={handleFormChange} placeholder={t("admission_date")} />
//                     <input type="text" className="form-control mb-2" name="academic_year" value={form.academic_year} onChange={handleFormChange} placeholder={t("academic_year")} required />
//                     <div className="mb-2">
//                       <label className="form-label">{t("passed")}</label>
//                       <select className="form-control" name="passed" value={form.passed === "" ? "" : form.passed ? "true" : "false"} onChange={handleFormChange} required={modalType === "edit"}>
//                         <option value="">{t("select_status")}</option>
//                         <option value="true">{t("yes")}</option>
//                         <option value="false">{t("no")}</option>
//                       </select>
//                     </div>
//                     <div className="form-actions" style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
//                       <button className="save-btn" type="submit" disabled={updating} style={{ padding: "10px 20px", borderRadius: "8px", background: "#0B63E5", color: "white", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 500 }}>
//                         {updating ? (modalType === "add" ? t("adding") : t("saving")) : (modalType === "add" ? t("add") : t("save"))}
//                       </button>
//                       <button type="button" className="cancel-btn" onClick={closeModal} style={{ padding: "10px 20px", borderRadius: "8px", background: "#F9FAFB", color: "#0A2540", border: "1px solid #E5E7EB", cursor: "pointer", fontSize: "14px", fontWeight: 500 }}>
//                         {t("cancel")}
//                       </button>
//                     </div>
//                   </form>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//       <ChatWidget />
//     </div>
//   );
// }

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useTranslation } from "react-i18next";
// import ChatWidget from "../../components/ChatWidget";
// import "./Dashboard.scss";

// function getCurrentAcademicYear() {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = now.getMonth();
//   if (month >= 3) {
//     return `${year}-${(year + 1).toString().slice(-2)}`;
//   } else {
//     return `${year - 1}-${year.toString().slice(-2)}`;
//   }
// }

// export default function Students() {
//   const { t } = useTranslation();
//   const navigate = useNavigate();
//   const currentYear = getCurrentAcademicYear();

//   const [studentsCurrentYear, setStudentsCurrentYear] = useState([]);
//   const [searchCurrentYear, setSearchCurrentYear] = useState("");
//   const [modalType, setModalType] = useState("");
//   const [form, setForm] = useState({});
//   const [updating, setUpdating] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [loadingCurrent, setLoadingCurrent] = useState(true);
//   const [error, setError] = useState("");

//   // Fetch students of current year on load
//   useEffect(() => {
//     fetchStudentsByYear(currentYear, true);
//     // eslint-disable-next-line
//   }, []);

//   async function fetchStudentsByYear(year, isCurrent) {
//     if (isCurrent) setLoadingCurrent(true);
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         navigate("/login");
//         return;
//       }
//       const response = await axios.get(
//         `http://localhost:5000/api/teacher/students?academic_year=${encodeURIComponent(
//           year
//         )}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setStudentsCurrentYear(response.data);
//       setLoadingCurrent(false);
//     } catch (err) {
//       setError(err.response?.data?.message || t("failed_load_students"));
//       setLoadingCurrent(false);
//     }
//   }

//   function handleSearchChange(e) {
//     setSearchCurrentYear(e.target.value.toLowerCase());
//   }

//   function filteredStudents(studentsList, search) {
//     if (!search) return studentsList;
//     return studentsList.filter(
//       s =>
//         s.full_name.toLowerCase().includes(search) ||
//         (s.roll_number && s.roll_number.toString().includes(search)) ||
//         (s.standard && s.standard.toLowerCase().includes(search)) ||
//         (s.division && s.division.toLowerCase().includes(search))
//     );
//   }

//   // Modal open functions
//   function handleView(student) {
//     setSelectedStudent(student);
//     setModalType("view");
//   }

//   function handleEdit(student) {
//     setSelectedStudent(student);
//     setForm({
//       student_id: student.student_id || "",
//       full_name: student.full_name || "",
//       dob: student.dob || "",
//       gender: student.gender || "",
//       address: student.address || "",
//       parent_name: student.parent_name || "",
//       parent_phone: student.parent_phone || "",
//       admission_date: student.admission_date || "",
//       enrollment_id: student.enrollment_id || "",
//       standard: student.standard || "",
//       division: student.division || "",
//       roll_number: student.roll_number || "",
//       academic_year: student.academic_year || currentYear,
//       passed: typeof student.passed === "boolean" ? student.passed : ""
//     });
//     setModalType("edit");
//   }

//   function closeModal() {
//     setSelectedStudent(null);
//     setModalType("");
//     setForm({});
//     setUpdating(false);
//   }

//   function handleFormChange(e) {
//     const { name, value } = e.target;
//     if (name === "passed") {
//       setForm({ ...form, passed: value === "" ? "" : value === "true" });
//     } else {
//       setForm({ ...form, [name]: value });
//     }
//   }

//   async function handleUpdate(e) {
//     e.preventDefault();
//     setUpdating(true);
//     const token = localStorage.getItem("token");
//     try {
//       // Update enrollment (class + pass/fail)
//       await axios.put(
//         `http://localhost:5000/api/teacher/enrollment/${form.enrollment_id}`,
//         {
//           standard: form.standard,
//           division: form.division,
//           roll_number: form.roll_number,
//           passed: form.passed === "" ? null : form.passed
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       await fetchStudentsByYear(currentYear, true);
//       closeModal();
//     } catch {
//       alert(t("failed_update_student"));
//       setUpdating(false);
//     }
//   }

//   if (loadingCurrent)
//     return (
//       <div className="teacher-students-page">
//         <div className="teacher-main-content">
//           <div className="loading-state">{t("loading_students")}...</div>
//         </div>
//       </div>
//     );

//   if (error)
//     return (
//       <div className="teacher-students-page">
//         <div className="teacher-main-content">
//           <div className="error-state">{error}</div>
//         </div>
//       </div>
//     );

//   return (
//     <div className="teacher-students-page">
//       <div className="teacher-main-content">
//         <div className="page-header">
//           <h2>
//             {t("student_management")} - {currentYear}
//           </h2>
//         </div>

//         <div className="teacher-students-card">
//           <div className="card-header">
//             <h3>{t("students")}</h3>
//           </div>
//           <div className="card-body">
//             <input
//               className="form-control mb-3"
//               placeholder={t("search_placeholder")}
//               value={searchCurrentYear}
//               onChange={handleSearchChange}
//               style={{ maxWidth: 400 }}
//             />
//             <div className="table-responsive">
//               <table>
//                 <thead>
//                   <tr>
//                     <th>{t("roll_no")}</th>
//                     <th>{t("full_name")}</th>
//                     <th>{t("standard")}</th>
//                     <th>{t("division")}</th>
//                     <th>{t("dob")}</th>
//                     <th>{t("gender")}</th>
//                     <th>{t("parent_name")}</th>
//                     <th>{t("parent_phone")}</th>
//                     <th>{t("address")}</th>
//                     <th>{t("admission_date")}</th>
//                     <th>{t("passed")}</th>
//                     <th>{t("actions")}</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredStudents(
//                     studentsCurrentYear,
//                     searchCurrentYear
//                   ).map(st => (
//                     <tr
//                       key={
//                         st.enrollment_id ||
//                         st.student_id + "-" + st.academic_year
//                       }
//                     >
//                       <td>{st.roll_number || ""}</td>
//                       <td>{st.full_name || ""}</td>
//                       <td>{st.standard || ""}</td>
//                       <td>{st.division || ""}</td>
//                       <td>{st.dob || ""}</td>
//                       <td>{st.gender || ""}</td>
//                       <td>{st.parent_name || ""}</td>
//                       <td>{st.parent_phone || ""}</td>
//                       <td>{st.address || ""}</td>
//                       <td>{st.admission_date || ""}</td>
//                       <td>
//                         {st.passed === true
//                           ? t("yes")
//                           : st.passed === false
//                           ? t("no")
//                           : ""}
//                       </td>
//                       <td>
//                         <button
//                           className="btn-sm btn-info me-2"
//                           onClick={() => handleView(st)}
//                           style={{
//                             padding: "6px 12px",
//                             borderRadius: "6px",
//                             border: "none",
//                             background: "#0B63E5",
//                             color: "white",
//                             cursor: "pointer"
//                           }}
//                         >
//                           {t("view")}
//                         </button>
//                         <button
//                           className="btn-sm btn-primary"
//                           onClick={() => handleEdit(st)}
//                           style={{
//                             padding: "6px 12px",
//                             borderRadius: "6px",
//                             border: "none",
//                             background: "#1D9BF0",
//                             color: "white",
//                             cursor: "pointer"
//                           }}
//                         >
//                           {t("edit")}
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                   {filteredStudents(
//                     studentsCurrentYear,
//                     searchCurrentYear
//                   ).length === 0 && (
//                     <tr>
//                       <td
//                         colSpan="12"
//                         style={{ textAlign: "center", padding: "20px" }}
//                       >
//                         {t("no_students_found")}
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>

//       {(modalType === "view" || modalType === "edit") && (
//         <div
//           className="modal show d-block"
//           tabIndex="-1"
//           style={{
//             position: "fixed",
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             background: "rgba(0,0,0,0.5)",
//             zIndex: 1000,
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center"
//           }}
//         >
//           <div
//             className="modal-dialog"
//             style={{ maxWidth: "600px", width: "90%" }}
//           >
//             <div
//               className="modal-content"
//               style={{
//                 background: "white",
//                 borderRadius: "12px",
//                 padding: "24px"
//               }}
//             >
//               <div
//                 className="modal-header"
//                 style={{
//                   display: "flex",
//                   justifyContent: "space-between",
//                   alignItems: "center",
//                   marginBottom: "20px",
//                   paddingBottom: "16px",
//                   borderBottom: "1px solid #E5E7EB"
//                 }}
//               >
//                 <h5
//                   className="modal-title"
//                   style={{
//                     margin: 0,
//                     color: "#0A2540",
//                     fontSize: "20px",
//                     fontWeight: 600
//                   }}
//                 >
//                   {modalType === "view"
//                     ? t("student_details")
//                     : t("edit_student")}
//                 </h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={closeModal}
//                   style={{
//                     background: "none",
//                     border: "none",
//                     fontSize: "24px",
//                     cursor: "pointer"
//                   }}
//                 >
//                   ×
//                 </button>
//               </div>
//               <div className="modal-body">
//                 {modalType === "view" ? (
//                   <div>
//                     <div>
//                       <strong>{t("full_name")}:</strong>{" "}
//                       {selectedStudent.full_name}
//                     </div>
//                     <div>
//                       <strong>{t("roll_no")}:</strong>{" "}
//                       {selectedStudent.roll_number}
//                     </div>
//                     <div>
//                       <strong>{t("standard")}:</strong>{" "}
//                       {selectedStudent.standard}
//                     </div>
//                     <div>
//                       <strong>{t("division")}:</strong>{" "}
//                       {selectedStudent.division}
//                     </div>
//                     <div>
//                       <strong>{t("dob")}:</strong> {selectedStudent.dob}
//                     </div>
//                     <div>
//                       <strong>{t("gender")}:</strong>{" "}
//                       {selectedStudent.gender}
//                     </div>
//                     <div>
//                       <strong>{t("parent_name")}:</strong>{" "}
//                       {selectedStudent.parent_name}
//                     </div>
//                     <div>
//                       <strong>{t("parent_phone")}:</strong>{" "}
//                       {selectedStudent.parent_phone}
//                     </div>
//                     <div>
//                       <strong>{t("address")}:</strong>{" "}
//                       {selectedStudent.address}
//                     </div>
//                     <div>
//                       <strong>{t("admission_date")}:</strong>{" "}
//                       {selectedStudent.admission_date}
//                     </div>
//                     <div>
//                       <strong>{t("passed")}:</strong>{" "}
//                       {selectedStudent.passed === true
//                         ? t("yes")
//                         : selectedStudent.passed === false
//                         ? t("no")
//                         : ""}
//                     </div>
//                   </div>
//                 ) : (
//                   <form onSubmit={handleUpdate}>
//                     <input
//                       type="text"
//                       className="form-control mb-2"
//                       name="standard"
//                       value={form.standard}
//                       onChange={handleFormChange}
//                       placeholder={t("standard")}
//                       required
//                     />
//                     <input
//                       type="text"
//                       className="form-control mb-2"
//                       name="division"
//                       value={form.division}
//                       onChange={handleFormChange}
//                       placeholder={t("division")}
//                       required
//                     />
//                     <input
//                       type="number"
//                       className="form-control mb-2"
//                       name="roll_number"
//                       value={form.roll_number}
//                       onChange={handleFormChange}
//                       placeholder={t("roll_no")}
//                       required
//                     />
//                     <div className="mb-2">
//                       <label className="form-label">{t("passed")}</label>
//                       <select
//                         className="form-control"
//                         name="passed"
//                         value={
//                           form.passed === ""
//                             ? ""
//                             : form.passed
//                             ? "true"
//                             : "false"
//                         }
//                         onChange={handleFormChange}
//                       >
//                         <option value="">{t("select_status")}</option>
//                         <option value="true">{t("yes")}</option>
//                         <option value="false">{t("no")}</option>
//                       </select>
//                     </div>
//                     <div
//                       className="form-actions"
//                       style={{
//                         marginTop: "24px",
//                         display: "flex",
//                         gap: "12px"
//                       }}
//                     >
//                       <button
//                         className="save-btn"
//                         type="submit"
//                         disabled={updating}
//                         style={{
//                           padding: "10px 20px",
//                           borderRadius: "8px",
//                           background: "#0B63E5",
//                           color: "white",
//                           border: "none",
//                           cursor: "pointer",
//                           fontSize: "14px",
//                           fontWeight: 500
//                         }}
//                       >
//                         {updating ? t("saving") : t("save")}
//                       </button>
//                       <button
//                         type="button"
//                         className="cancel-btn"
//                         onClick={closeModal}
//                         style={{
//                           padding: "10px 20px",
//                           borderRadius: "8px",
//                           background: "#F9FAFB",
//                           color: "#0A2540",
//                           border: "1px solid #E5E7EB",
//                           cursor: "pointer",
//                           fontSize: "14px",
//                           fontWeight: 500
//                         }}
//                       >
//                         {t("cancel")}
//                       </button>
//                     </div>
//                   </form>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//       <ChatWidget />
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import ChatWidget from "../../components/ChatWidget";
import "./Dashboard.scss";

function getCurrentAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 3) {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
}

export default function Students() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentYear = getCurrentAcademicYear();

  const [studentsCurrentYear, setStudentsCurrentYear] = useState([]);
  const [searchCurrentYear, setSearchCurrentYear] = useState("");
  const [modalType, setModalType] = useState("");
  const [form, setForm] = useState({});
  const [updating, setUpdating] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [error, setError] = useState("");
  const [yearFilter, setYearFilter] = useState(currentYear);
  const [allYears, setAllYears] = useState([]);

  // Fetch academic years on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("http://localhost:5000/api/teacher/academic-years", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        const yearsArray = Array.from(res.data || []).sort().reverse();
        setAllYears(yearsArray);
      })
      .catch(() => {});
  }, []);

  // Fetch students of selected year on load and when yearFilter changes
  useEffect(() => {
    fetchStudentsByYear(yearFilter, true);
    // eslint-disable-next-line
  }, [yearFilter]);

  async function fetchStudentsByYear(year, isCurrent) {
    if (isCurrent) setLoadingCurrent(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(
        `http://localhost:5000/api/teacher/students?academic_year=${encodeURIComponent(
          year
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudentsCurrentYear(response.data);
      setLoadingCurrent(false);
    } catch (err) {
      setError(err.response?.data?.message || t("failed_load_students"));
      setLoadingCurrent(false);
    }
  }

  function handleSearchChange(e) {
    setSearchCurrentYear(e.target.value.toLowerCase());
  }

  function filteredStudents(studentsList, search) {
    if (!search) return studentsList;
    return studentsList.filter(
      s =>
        s.full_name.toLowerCase().includes(search) ||
        (s.roll_number && s.roll_number.toString().includes(search)) ||
        (s.standard && s.standard.toLowerCase().includes(search)) ||
        (s.division && s.division.toLowerCase().includes(search))
    );
  }

  // Modal open functions
  function handleView(student) {
    setSelectedStudent(student);
    setModalType("view");
  }

  function handleEdit(student) {
    setSelectedStudent(student);
    setForm({
      student_id: student.student_id || "",
      full_name: student.full_name || "",
      dob: student.dob || "",
      gender: student.gender || "",
      address: student.address || "",
      parent_name: student.parent_name || "",
      parent_phone: student.parent_phone || "",
      admission_date: student.admission_date || "",
      enrollment_id: student.enrollment_id || "",
      standard: student.standard || "",
      division: student.division || "",
      roll_number: student.roll_number || "",
      academic_year: student.academic_year || currentYear,
      passed: typeof student.passed === "boolean" ? student.passed : "",
      percentage: student.percentage || ""
    });
    setModalType("edit");
  }

  function closeModal() {
    setSelectedStudent(null);
    setModalType("");
    setForm({});
    setUpdating(false);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    if (name === "passed") {
      setForm({ ...form, passed: value === "" ? "" : value === "true" });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setUpdating(true);
    const token = localStorage.getItem("token");
    try {
      // Convert passed to boolean or null
      let passedValue = null;
      if (form.passed === true || form.passed === false) {
        passedValue = form.passed;
      } else if (form.passed === "true") {
        passedValue = true;
      } else if (form.passed === "false") {
        passedValue = false;
      } else {
        passedValue = null;
      }

      await axios.put(
        `http://localhost:5000/api/teacher/enrollment/${form.enrollment_id}`,
        {
          standard: form.standard,
          division: form.division,
          roll_number: form.roll_number,
          passed: passedValue,
          percentage: form.percentage === "" ? null : Number(form.percentage)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchStudentsByYear(yearFilter, true);
      closeModal();
    } catch {
      alert(t("failed_update_student"));
      setUpdating(false);
    }
  }

  if (loadingCurrent)
    return (
      <div className="teacher-students-page">
        <div className="teacher-main-content">
          <div className="loading-state">{t("loading_students")}...</div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="teacher-students-page">
        <div className="teacher-main-content">
          <div className="error-state">{error}</div>
        </div>
      </div>
    );

  return (
    <div className="teacher-students-page">
      <div className="teacher-main-content">
        <div className="page-header">
          <h2>
            {t("student_management")} - {yearFilter}
          </h2>
        </div>

        <div className="teacher-students-card">
          <div className="card-header">
            <h3>{t("students")}</h3>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", gap: "12px", marginBottom: "12px", alignItems: "center" }}>
              <select
                className="form-control"
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                style={{ maxWidth: "200px" }}
              >
                {allYears.length === 0 && (
                  <option value="">{t("loading")}</option>
                )}
                {allYears.map(year => (
                  <option value={year} key={year}>
                    {year}
                  </option>
                ))}
              </select>
              <input
                className="form-control"
                placeholder={t("search_placeholder")}
                value={searchCurrentYear}
                onChange={handleSearchChange}
                style={{ maxWidth: 400 }}
              />
            </div>
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>{t("roll_no")}</th>
                    <th>{t("full_name")}</th>
                    <th>{t("standard")}</th>
                    <th>{t("division")}</th>
                    <th>{t("dob")}</th>
                    <th>{t("gender")}</th>
                    <th>{t("parent_name")}</th>
                    <th>{t("parent_phone")}</th>
                    <th>{t("address")}</th>
                    <th>{t("admission_date")}</th>
                    <th>{t("percentage")}</th>
                    <th>{t("passed")}</th>
                    <th>{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents(
                    studentsCurrentYear,
                    searchCurrentYear
                  ).map(st => (
                    <tr
                      key={
                        st.enrollment_id ||
                        st.student_id + "-" + st.academic_year
                      }
                    >
                      <td>{st.roll_number || ""}</td>
                      <td>{st.full_name || ""}</td>
                      <td>{st.standard || ""}</td>
                      <td>{st.division || ""}</td>
                      <td>{st.dob || ""}</td>
                      <td>{st.gender || ""}</td>
                      <td>{st.parent_name || ""}</td>
                      <td>{st.parent_phone || ""}</td>
                      <td>{st.address || ""}</td>
                      <td>{st.admission_date || ""}</td>
                      <td>{st.percentage ?? ""}</td>
                      <td>
                        {st.passed === true
                          ? t("yes")
                          : st.passed === false
                          ? t("no")
                          : ""}
                      </td>
                      <td>
                        <button
                          className="btn-sm btn-info me-2"
                          onClick={() => handleView(st)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#0B63E5",
                            color: "white",
                            cursor: "pointer"
                          }}
                        >
                          {t("view")}
                        </button>
                        <button
                          className="btn-sm btn-primary"
                          onClick={() => handleEdit(st)}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "none",
                            background: "#1D9BF0",
                            color: "white",
                            cursor: "pointer"
                          }}
                        >
                          {t("edit")}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents(
                    studentsCurrentYear,
                    searchCurrentYear
                  ).length === 0 && (
                    <tr>
                      <td
                        colSpan="12"
                        style={{ textAlign: "center", padding: "20px" }}
                      >
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

      {(modalType === "view" || modalType === "edit") && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            className="modal-dialog"
            style={{ maxWidth: "600px", width: "90%" }}
          >
            <div
              className="modal-content"
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "24px"
              }}
            >
              <div
                className="modal-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid #E5E7EB"
                }}
              >
                <h5
                  className="modal-title"
                  style={{
                    margin: 0,
                    color: "#0A2540",
                    fontSize: "20px",
                    fontWeight: 600
                  }}
                >
                  {modalType === "view"
                    ? t("student_details")
                    : t("edit_student")}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer"
                  }}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                {modalType === "view" ? (
                  <div>
                    <div>
                      <strong>{t("full_name")}:</strong>{" "}
                      {selectedStudent.full_name}
                    </div>
                    <div>
                      <strong>{t("roll_no")}:</strong>{" "}
                      {selectedStudent.roll_number}
                    </div>
                    <div>
                      <strong>{t("standard")}:</strong>{" "}
                      {selectedStudent.standard}
                    </div>
                    <div>
                      <strong>{t("division")}:</strong>{" "}
                      {selectedStudent.division}
                    </div>
                    <div>
                      <strong>{t("dob")}:</strong> {selectedStudent.dob}
                    </div>
                    <div>
                      <strong>{t("gender")}:</strong>{" "}
                      {selectedStudent.gender}
                    </div>
                    <div>
                      <strong>{t("parent_name")}:</strong>{" "}
                      {selectedStudent.parent_name}
                    </div>
                    <div>
                      <strong>{t("parent_phone")}:</strong>{" "}
                      {selectedStudent.parent_phone}
                    </div>
                    <div>
                      <strong>{t("address")}:</strong>{" "}
                      {selectedStudent.address}
                    </div>
                    <div>
                      <strong>{t("admission_date")}:</strong>{" "}
                      {selectedStudent.admission_date}
                    </div>
                    <div>
                      <strong>{t("passed")}:</strong>{" "}
                      {selectedStudent.passed === true
                        ? t("yes")
                        : selectedStudent.passed === false
                        ? t("no")
                        : ""}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdate}>
                    <input
                      type="text"
                      className="form-control mb-2"
                      name="standard"
                      value={form.standard}
                      readOnly
                    />
                    <input
                      type="text"
                      className="form-control mb-2"
                      name="division"
                      value={form.division}
                      readOnly
                    />
                    <input
                      type="number"
                      className="form-control mb-2"
                      name="roll_number"
                      value={form.roll_number}
                      readOnly
                    />
                    <input
                      type="number"
                      step="0.01"
                      className="form-control mb-2"
                      name="percentage"
                      value={form.percentage}
                      onChange={handleFormChange}
                      placeholder={t("percentage")}
                    />
                    <div className="mb-2">
                      <label className="form-label">{t("passed")}</label>
                      <select
                        className="form-control"
                        name="passed"
                        value={
                          form.passed === ""
                            ? ""
                            : form.passed
                            ? "true"
                            : "false"
                        }
                        onChange={handleFormChange}
                      >
                        <option value="">{t("select_status")}</option>
                        <option value="true">{t("yes")}</option>
                        <option value="false">{t("no")}</option>
                      </select>
                    </div>
                    <div
                      className="form-actions"
                      style={{
                        marginTop: "24px",
                        display: "flex",
                        gap: "12px"
                      }}
                    >
                      <button
                        className="save-btn"
                        type="submit"
                        disabled={updating}
                        style={{
                          padding: "10px 20px",
                          borderRadius: "8px",
                          background: "#0B63E5",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: 500
                        }}
                      >
                        {updating ? t("saving") : t("save")}
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={closeModal}
                        style={{
                          padding: "10px 20px",
                          borderRadius: "8px",
                          background: "#F9FAFB",
                          color: "#0A2540",
                          border: "1px solid #E5E7EB",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: 500
                        }}
                      >
                        {t("cancel")}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <ChatWidget />
    </div>
  );
}
