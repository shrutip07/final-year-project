// // import React, { useState, useEffect } from "react";
// // import { useNavigate } from "react-router-dom";
// // import axios from "axios";
// // import { useTranslation } from "react-i18next";

// // export default function Students() {
// //   const { t } = useTranslation();
// //   const navigate = useNavigate();
// //   const [students, setStudents] = useState([]);
// //   const [filtered, setFiltered] = useState([]);
// //   const [search, setSearch] = useState("");
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState("");
// //   const [selectedStudent, setSelectedStudent] = useState(null);
// //   const [modalType, setModalType] = useState(""); // "", "view", "edit", "add"
// //   const [form, setForm] = useState({});
// //   const [updating, setUpdating] = useState(false);

// //   // Academic year state
// //   const [academicYear, setAcademicYear] = useState("2024-25");

// //   useEffect(() => {
// //     const fetchStudents = async () => {
// //       try {
// //         const token = localStorage.getItem("token");
// //         if (!token) {
// //           navigate('/login');
// //           return;
// //         }
// //         const response = await axios.get(
// //           `http://localhost:5000/api/teacher/students?academic_year=${encodeURIComponent(academicYear)}`,
// //           { headers: { Authorization: `Bearer ${token}` } }
// //         );
// //         setStudents(response.data);
// //         setFiltered(response.data);
// //         setLoading(false);
// //       } catch (err) {
// //         setError(err.response?.data?.message || t("failed_load_students"));
// //         setLoading(false);
// //       }
// //     };
// //     fetchStudents();
// //   }, [navigate, t, academicYear]);

// //   function handleAcademicYearChange(e) {
// //     setAcademicYear(e.target.value);
// //   }

// //   function handleSearchChange(e) {
// //     const val = e.target.value.toLowerCase();
// //     setSearch(val);
// //     setFiltered(
// //       students.filter(
// //         s =>
// //           s.full_name.toLowerCase().includes(val) ||
// //           (s.roll_number && s.roll_number.toString().includes(val)) ||
// //           (s.standard && s.standard.toLowerCase().includes(val)) ||
// //           (s.division && s.division.toLowerCase().includes(val))
// //       )
// //     );
// //   }

// //   function handleView(student) {
// //     setSelectedStudent(student);
// //     setModalType("view");
// //   }

// //   function handleEdit(student) {
// //     setSelectedStudent(student);
// //     setForm({
// //       student_id: student.student_id || "",
// //       full_name: student.full_name || "",
// //       dob: student.dob || "",
// //       gender: student.gender || "",
// //       address: student.address || "",
// //       parent_name: student.parent_name || "",
// //       parent_phone: student.parent_phone || "",
// //       admission_date: student.admission_date || "",
// //       enrollment_id: student.enrollment_id || "",
// //       standard: student.standard || "",
// //       division: student.division || "",
// //       roll_number: student.roll_number || "",
// //       academic_year: student.academic_year || academicYear,
// //       passed: typeof student.passed === "boolean" ? student.passed : "" // boolean or empty
// //     });
// //     setModalType("edit");
// //   }

// //   function handleAddNew() {
// //     setForm({
// //       full_name: "",
// //       dob: "",
// //       gender: "",
// //       address: "",
// //       parent_name: "",
// //       parent_phone: "",
// //       admission_date: "",
// //       standard: "",
// //       division: "",
// //       roll_number: "",
// //       academic_year: academicYear,
// //       passed: ""
// //     });
// //     setModalType("add");
// //   }

// //   function closeModal() {
// //     setSelectedStudent(null);
// //     setModalType("");
// //     setForm({});
// //     setUpdating(false);
// //   }

// //   function handleFormChange(e) {
// //     const { name, value } = e.target;
// //     // For passed: transform dropdown "true"/"false" string to boolean
// //     if (name === "passed") {
// //       setForm({ ...form, passed: value === "" ? "" : value === "true" });
// //     } else {
// //       setForm({ ...form, [name]: value });
// //     }
// //   }

// //   async function handleUpdate(e) {
// //     e.preventDefault();
// //     setUpdating(true);
// //     const token = localStorage.getItem("token");
// //     try {
// //       // 1. Update student profile (students table)
// //       await axios.put(
// //         `http://localhost:5000/api/teacher/student/${form.student_id}`,
// //         {
// //           full_name: form.full_name,
// //           dob: form.dob,
// //           gender: form.gender,
// //           address: form.address,
// //           parent_name: form.parent_name,
// //           parent_phone: form.parent_phone,
// //           admission_date: form.admission_date
// //         },
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       // 2. Update student enrollment (enrollments table)
// //       await axios.put(
// //         `http://localhost:5000/api/teacher/enrollment/${form.enrollment_id}`,
// //         {
// //           standard: form.standard,
// //           division: form.division,
// //           roll_number: form.roll_number,
// //           academic_year: form.academic_year,
// //           passed: form.passed === "" ? null : form.passed // send null or boolean
// //         },
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       // Refresh table
// //       const response = await axios.get(
// //         `http://localhost:5000/api/teacher/students?academic_year=${encodeURIComponent(academicYear)}`,
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       setStudents(response.data);
// //       setFiltered(response.data);
// //       closeModal();
// //     } catch {
// //       alert(t("failed_update_student"));
// //       setUpdating(false);
// //     }
// //   }

// //   async function handleAddSubmit(e) {
// //     e.preventDefault();
// //     setUpdating(true);
// //     const token = localStorage.getItem("token");
// //     try {
// //       // First, fetch teacher profile (to get unit_id)
// //       const profileRes = await axios.get(
// //         "http://localhost:5000/api/teacher/me",
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       const unit_id = profileRes.data.unit_id;

// //       // 1. Add student profile
// //       const resProfile = await axios.post(
// //         "http://localhost:5000/api/teacher/student",
// //         {
// //           full_name: form.full_name,
// //           dob: form.dob,
// //           gender: form.gender,
// //           address: form.address,
// //           parent_name: form.parent_name,
// //           parent_phone: form.parent_phone,
// //           admission_date: form.admission_date,
// //           unit_id,
// //         },
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       const student_id = resProfile.data.student_id;

// //       // 2. Add enrollment (with passed value: default to false)
// //       await axios.post(
// //         "http://localhost:5000/api/teacher/enrollment",
// //         {
// //           student_id,
// //           standard: form.standard,
// //           division: form.division,
// //           roll_number: form.roll_number,
// //           academic_year: form.academic_year,
// //           passed: false
// //         },
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );

// //       // Refresh
// //       const response = await axios.get(
// //         `http://localhost:5000/api/teacher/students?academic_year=${encodeURIComponent(academicYear)}`,
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       setStudents(response.data);
// //       setFiltered(response.data);
// //       closeModal();
// //     } catch {
// //       alert(t("failed_add_student"));
// //       setUpdating(false);
// //     }
// //   }

// //   if (loading) return <div className="mt-3 text-center">{t("loading_students")}...</div>;
// //   if (error) return <div className="alert alert-danger mt-3">{error}</div>;

// //   return (
// //     <div className="container" style={{ maxWidth: 950 }}>
// //       <div className="d-flex align-items-center mb-4">
// //         <button
// //           className="btn btn-link"
// //           onClick={() => navigate('/teacher')}
// //         >
// //           <i className="bi bi-arrow-left"></i> {t("back_to_dashboard")}
// //         </button>
// //         <h2 className="mb-0 ms-3">{t("student_management")}</h2>
// //       </div>

// //       {/* Academic Year Selector */}
// //       <div className="mb-3">
// //         <label className="form-label">{t("academic_year")}</label>
// //         <input
// //           type="text"
// //           className="form-control"
// //           value={academicYear}
// //           onChange={handleAcademicYearChange}
// //           placeholder="YYYY-YY"
// //           style={{ maxWidth: 200 }}
// //         />
// //       </div>

// //       <button className="btn btn-success mb-3" onClick={handleAddNew}>
// //         {t("add_student")}
// //       </button>
// //       <input
// //         className="form-control mb-3"
// //         placeholder={t("search_placeholder")}
// //         value={search}
// //         onChange={handleSearchChange}
// //       />
// //       <div className="table-responsive">
// //         <table className="table table-bordered table-hover">
// //           <thead className="table-light">
// //             <tr>
// //               <th>{t("roll_no")}</th>
// //               <th>{t("full_name")}</th>
// //               <th>{t("standard")}</th>
// //               <th>{t("division")}</th>
// //               <th>{t("dob")}</th>
// //               <th>{t("gender")}</th>
// //               <th>{t("parent_name")}</th>
// //               <th>{t("parent_phone")}</th>
// //               <th>{t("address")}</th>
// //               <th>{t("admission_date")}</th>
// //               <th>{t("passed")}</th>
// //               <th>{t("actions")}</th>
// //             </tr>
// //           </thead>
// //           <tbody>
// //             {filtered.map(student => (
// //               <tr key={student.enrollment_id || (student.student_id + '-' + student.academic_year)}>
// //                 <td>{student.roll_number || ""}</td>
// //                 <td>{student.full_name || ""}</td>
// //                 <td>{student.standard || ""}</td>
// //                 <td>{student.division || ""}</td>
// //                 <td>{student.dob || ""}</td>
// //                 <td>{student.gender || ""}</td>
// //                 <td>{student.parent_name || ""}</td>
// //                 <td>{student.parent_phone || ""}</td>
// //                 <td>{student.address || ""}</td>
// //                 <td>{student.admission_date || ""}</td>
// //                 <td>
// //                   {student.passed === true ? t("yes") : student.passed === false ? t("no") : ""}
// //                 </td>
// //                 <td>
// //                   <button className="btn btn-sm btn-info me-2" onClick={() => handleView(student)}>
// //                     {t("view")}
// //                   </button>
// //                   <button className="btn btn-sm btn-primary" onClick={() => handleEdit(student)}>
// //                     {t("edit")}
// //                   </button>
// //                 </td>
// //               </tr>
// //             ))}
// //             {filtered.length === 0 && (
// //               <tr>
// //                 <td colSpan="12" className="text-center">
// //                   {t("no_students_found")}
// //                 </td>
// //               </tr>
// //             )}
// //           </tbody>
// //         </table>
// //       </div>

// //       {(modalType === "view" || modalType === "edit" || modalType === "add") && (
// //         <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
// //           <div className="modal-dialog">
// //             <div className="modal-content">
// //               <div className="modal-header">
// //                 <h5 className="modal-title">
// //                   {modalType === "view" ? t("student_details")
// //                     : modalType === "edit" ? t("edit_student")
// //                     : t("add_student")}
// //                 </h5>
// //                 <button type="button" className="btn-close" onClick={closeModal}></button>
// //               </div>
// //               <div className="modal-body">
// //                 {modalType === "view" ? (
// //                   <div>
// //                     <div><strong>{t("full_name")}:</strong> {selectedStudent.full_name}</div>
// //                     <div><strong>{t("roll_no")}:</strong> {selectedStudent.roll_number}</div>
// //                     <div><strong>{t("standard")}:</strong> {selectedStudent.standard}</div>
// //                     <div><strong>{t("division")}:</strong> {selectedStudent.division}</div>
// //                     <div><strong>{t("dob")}:</strong> {selectedStudent.dob}</div>
// //                     <div><strong>{t("gender")}:</strong> {selectedStudent.gender}</div>
// //                     <div><strong>{t("parent_name")}:</strong> {selectedStudent.parent_name}</div>
// //                     <div><strong>{t("parent_phone")}:</strong> {selectedStudent.parent_phone}</div>
// //                     <div><strong>{t("address")}:</strong> {selectedStudent.address}</div>
// //                     <div><strong>{t("admission_date")}:</strong> {selectedStudent.admission_date}</div>
// //                     <div><strong>{t("passed")}:</strong> 
// //                       {selectedStudent.passed === true ? t("yes") : selectedStudent.passed === false ? t("no") : ""}
// //                     </div>
// //                   </div>
// //                 ) : (
// //                   <form onSubmit={modalType === "add" ? handleAddSubmit : handleUpdate}>
// //                     <input
// //                       type="text"
// //                       className="form-control mb-2"
// //                       name="full_name"
// //                       value={form.full_name}
// //                       onChange={handleFormChange}
// //                       placeholder={t("full_name")}
// //                       required
// //                     />
// //                     <input
// //                       type="text"
// //                       className="form-control mb-2"
// //                       name="standard"
// //                       value={form.standard}
// //                       onChange={handleFormChange}
// //                       placeholder={t("standard")}
// //                       required
// //                     />
// //                     <input
// //                       type="text"
// //                       className="form-control mb-2"
// //                       name="division"
// //                       value={form.division}
// //                       onChange={handleFormChange}
// //                       placeholder={t("division")}
// //                       required
// //                     />
// //                     <input
// //                       type="number"
// //                       className="form-control mb-2"
// //                       name="roll_number"
// //                       value={form.roll_number}
// //                       onChange={handleFormChange}
// //                       placeholder={t("roll_no")}
// //                       required
// //                     />
// //                     <input
// //                       type="date"
// //                       className="form-control mb-2"
// //                       name="dob"
// //                       value={form.dob}
// //                       onChange={handleFormChange}
// //                     />
// //                     <input
// //                       type="text"
// //                       className="form-control mb-2"
// //                       name="gender"
// //                       value={form.gender}
// //                       onChange={handleFormChange}
// //                       placeholder={t("gender")}
// //                       required
// //                     />
// //                     <input
// //                       type="text"
// //                       className="form-control mb-2"
// //                       name="parent_name"
// //                       value={form.parent_name}
// //                       onChange={handleFormChange}
// //                       placeholder={t("parent_name")}
// //                     />
// //                     <input
// //                       type="text"
// //                       className="form-control mb-2"
// //                       name="parent_phone"
// //                       value={form.parent_phone}
// //                       onChange={handleFormChange}
// //                       placeholder={t("parent_phone")}
// //                     />
// //                     <input
// //                       type="text"
// //                       className="form-control mb-2"
// //                       name="address"
// //                       value={form.address}
// //                       onChange={handleFormChange}
// //                       placeholder={t("address")}
// //                     />
// //                     <input
// //                       type="date"
// //                       className="form-control mb-2"
// //                       name="admission_date"
// //                       value={form.admission_date || ""}
// //                       onChange={handleFormChange}
// //                       placeholder={t("admission_date")}
// //                     />
// //                     <input
// //                       type="text"
// //                       className="form-control mb-2"
// //                       name="academic_year"
// //                       value={form.academic_year}
// //                       onChange={handleFormChange}
// //                       placeholder={t("academic_year")}
// //                       required
// //                     />
// //                     {/* Passed dropdown */}
// //                     <div className="mb-2">
// //                       <label className="form-label">{t("passed")}</label>
// //                       <select
// //                         className="form-control"
// //                         name="passed"
// //                         value={form.passed === "" ? "" : form.passed ? "true" : "false"}
// //                         onChange={handleFormChange}
// //                         required={modalType === "edit"}
// //                       >
// //                         <option value="">{t("select_status")}</option>
// //                         <option value="true">{t("yes")}</option>
// //                         <option value="false">{t("no")}</option>
// //                       </select>
// //                     </div>
// //                     <button className="btn btn-primary mt-2" type="submit" disabled={updating}>
// //                       {updating
// //                         ? modalType === "add" ? t("adding") : t("saving")
// //                         : modalType === "add" ? t("add") : t("save")}
// //                     </button>
// //                   </form>
// //                 )}
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useTranslation } from "react-i18next";

// // Helper to compute current academic year string
// function getCurrentAcademicYear() {
//   const now = new Date();
//   const year = now.getFullYear();
//   const month = now.getMonth(); // 0-indexed
//   if (month >= 3) {
//     return `${year}-${(year + 1).toString().slice(-2)}`;
//   } else {
//     return `${year - 1}-${year.toString().slice(-2)}`;
//   }
// }

// export default function Students() {
//   const { t } = useTranslation();
//   const navigate = useNavigate();
//   const [students, setStudents] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [modalType, setModalType] = useState(""); // "", "view", "edit", "add"
//   const [form, setForm] = useState({});
//   const [updating, setUpdating] = useState(false);
//   const [allYears, setAllYears] = useState([]); // List of years for dropdown

//   const currentAcademicYear = getCurrentAcademicYear();
//   const [academicYear, setAcademicYear] = useState(currentAcademicYear);

//   // Fetch all academic years from students data
//   useEffect(() => {
//     // after initial or reload
//     if(students.length > 0){
//       const years = Array.from(new Set(students.map(s => s.academic_year))).sort().reverse();
//       setAllYears(years);
//     }
//   }, [students])

//   // Fetch students for selected year
//   useEffect(() => {
//     const fetchStudents = async () => {
//       setLoading(true);
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           navigate('/login');
//           return;
//         }
//         const response = await axios.get(
//           `http://localhost:5000/api/teacher/students?academic_year=${encodeURIComponent(academicYear)}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setStudents(response.data);
//         setFiltered(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError(err.response?.data?.message || t("failed_load_students"));
//         setLoading(false);
//       }
//     };
//     fetchStudents();
//   }, [navigate, t, academicYear]);

//   function handleAcademicYearChange(e) {
//     setAcademicYear(e.target.value);
//   }

//   function handleSearchChange(e) {
//     const val = e.target.value.toLowerCase();
//     setSearch(val);
//     setFiltered(
//       students.filter(
//         s =>
//           s.full_name.toLowerCase().includes(val) ||
//           (s.roll_number && s.roll_number.toString().includes(val)) ||
//           (s.standard && s.standard.toLowerCase().includes(val)) ||
//           (s.division && s.division.toLowerCase().includes(val))
//       )
//     );
//   }

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
//       academic_year: student.academic_year || academicYear,
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
//       academic_year: academicYear,
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
//           admission_date: form.admission_date
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
//           passed: form.passed === "" ? null : form.passed
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       const response = await axios.get(
//         `http://localhost:5000/api/teacher/students?academic_year=${encodeURIComponent(academicYear)}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setStudents(response.data);
//       setFiltered(response.data);
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
//           academic_year: form.academic_year,
//           passed: false
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const response = await axios.get(
//         `http://localhost:5000/api/teacher/students?academic_year=${encodeURIComponent(academicYear)}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setStudents(response.data);
//       setFiltered(response.data);
//       closeModal();
//     } catch {
//       alert(t("failed_add_student"));
//       setUpdating(false);
//     }
//   }

//   if (loading) return <div className="mt-3 text-center">{t("loading_students")}...</div>;
//   if (error) return <div className="alert alert-danger mt-3">{error}</div>;

//   return (
//     <div className="container" style={{ maxWidth: 1050 }}>
//       <div className="d-flex align-items-center mb-4">
//         <button
//           className="btn btn-link"
//           onClick={() => navigate('/teacher')}
//         >
//           <i className="bi bi-arrow-left"></i> {t("back_to_dashboard")}
//         </button>
//         <h2 className="mb-0 ms-3">{t("student_management")}</h2>
//       </div>

//       {/* Academic Year Selector */}
//       <div className="mb-3">
//         <label className="form-label">{t("academic_year")}</label>
//         <select
//           value={academicYear}
//           onChange={handleAcademicYearChange}
//           className="form-control"
//           style={{ maxWidth: 200 }}
//         >
//           {/* Always show current year, plus any other years you collect from data */}
//           {[currentAcademicYear, ...allYears.filter(y=>y!==currentAcademicYear)].map((year, idx) =>
//             <option value={year} key={year}>{year}</option>
//           )}
//         </select>
//       </div>

//       {/* Show table for selected academic year */}
//       <input
//         className="form-control mb-3"
//         placeholder={t("search_placeholder")}
//         value={search}
//         onChange={handleSearchChange}
//       />
//       <div className="table-responsive">
//         <table className="table table-bordered table-hover">
//           <thead className="table-light">
//             <tr>
//               <th>{t("roll_no")}</th>
//               <th>{t("full_name")}</th>
//               <th>{t("standard")}</th>
//               <th>{t("division")}</th>
//               <th>{t("dob")}</th>
//               <th>{t("gender")}</th>
//               <th>{t("parent_name")}</th>
//               <th>{t("parent_phone")}</th>
//               <th>{t("address")}</th>
//               <th>{t("admission_date")}</th>
//               <th>{t("passed")}</th>
//               <th>{t("actions")}</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.map(student => (
//               <tr key={student.enrollment_id || (student.student_id + '-' + student.academic_year)}>
//                 <td>{student.roll_number || ""}</td>
//                 <td>{student.full_name || ""}</td>
//                 <td>{student.standard || ""}</td>
//                 <td>{student.division || ""}</td>
//                 <td>{student.dob || ""}</td>
//                 <td>{student.gender || ""}</td>
//                 <td>{student.parent_name || ""}</td>
//                 <td>{student.parent_phone || ""}</td>
//                 <td>{student.address || ""}</td>
//                 <td>{student.admission_date || ""}</td>
//                 <td>
//                   {student.passed === true ? t("yes") : student.passed === false ? t("no") : ""}
//                 </td>
//                 <td>
//                   <button className="btn btn-sm btn-info me-2" onClick={() => handleView(student)}>
//                     {t("view")}
//                   </button>
//                   {/* Only show edit for current academic year */}
//                   {academicYear === currentAcademicYear &&
//                     <button className="btn btn-sm btn-primary" onClick={() => handleEdit(student)}>
//                       {t("edit")}
//                     </button>
//                   }
//                 </td>
//               </tr>
//             ))}
//             {filtered.length === 0 && (
//               <tr>
//                 <td colSpan="12" className="text-center">
//                   {t("no_students_found")}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {(modalType === "view" || modalType === "edit" || modalType === "add") && (
//         <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">
//                   {modalType === "view" ? t("student_details")
//                     : modalType === "edit" ? t("edit_student")
//                     : t("add_student")}
//                 </h5>
//                 <button type="button" className="btn-close" onClick={closeModal}></button>
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
//                     <div><strong>{t("passed")}:</strong>
//                       {selectedStudent.passed === true ? t("yes") : selectedStudent.passed === false ? t("no") : ""}
//                     </div>
//                   </div>
//                 ) : (
//                   <form onSubmit={modalType === "add" ? handleAddSubmit : handleUpdate}>
//                     <input
//                       type="text"
//                       className="form-control mb-2"
//                       name="full_name"
//                       value={form.full_name}
//                       onChange={handleFormChange}
//                       placeholder={t("full_name")}
//                       required
//                     />
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
//                     <input
//                       type="date"
//                       className="form-control mb-2"
//                       name="dob"
//                       value={form.dob}
//                       onChange={handleFormChange}
//                     />
//                     <input
//                       type="text"
//                       className="form-control mb-2"
//                       name="gender"
//                       value={form.gender}
//                       onChange={handleFormChange}
//                       placeholder={t("gender")}
//                       required
//                     />
//                     <input
//                       type="text"
//                       className="form-control mb-2"
//                       name="parent_name"
//                       value={form.parent_name}
//                       onChange={handleFormChange}
//                       placeholder={t("parent_name")}
//                     />
//                     <input
//                       type="text"
//                       className="form-control mb-2"
//                       name="parent_phone"
//                       value={form.parent_phone}
//                       onChange={handleFormChange}
//                       placeholder={t("parent_phone")}
//                     />
//                     <input
//                       type="text"
//                       className="form-control mb-2"
//                       name="address"
//                       value={form.address}
//                       onChange={handleFormChange}
//                       placeholder={t("address")}
//                     />
//                     <input
//                       type="date"
//                       className="form-control mb-2"
//                       name="admission_date"
//                       value={form.admission_date || ""}
//                       onChange={handleFormChange}
//                       placeholder={t("admission_date")}
//                     />
//                     <input
//                       type="text"
//                       className="form-control mb-2"
//                       name="academic_year"
//                       value={form.academic_year}
//                       onChange={handleFormChange}
//                       placeholder={t("academic_year")}
//                       required
//                     />
//                     <div className="mb-2">
//                       <label className="form-label">{t("passed")}</label>
//                       <select
//                         className="form-control"
//                         name="passed"
//                         value={form.passed === "" ? "" : form.passed ? "true" : "false"}
//                         onChange={handleFormChange}
//                         required={modalType === "edit"}
//                         disabled={modalType === "edit" && academicYear !== currentAcademicYear}
//                       >
//                         <option value="">{t("select_status")}</option>
//                         <option value="true">{t("yes")}</option>
//                         <option value="false">{t("no")}</option>
//                       </select>
//                     </div>
//                     <button className="btn btn-primary mt-2" type="submit" disabled={updating || (modalType==="edit" && academicYear !== currentAcademicYear)}>
//                       {updating
//                         ? modalType === "add" ? t("adding") : t("saving")
//                         : modalType === "add" ? t("add") : t("save")}
//                     </button>
//                   </form>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
// //   );
// // }

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useTranslation } from "react-i18next";

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

//   const currentAcademicYear = getCurrentAcademicYear();

//   const [academicYear, setAcademicYear] = useState(currentAcademicYear);
//   const [allYears, setAllYears] = useState([]);

//   const [students, setStudents] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [modalType, setModalType] = useState("");
//   const [form, setForm] = useState({});
//   const [updating, setUpdating] = useState(false);

//   useEffect(() => {
//     // Fetch students for selected academic year
//     const fetchStudents = async () => {
//       setLoading(true);
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) {
//           navigate('/login');
//           return;
//         }
//         const response = await axios.get(
//           `http://localhost:5000/api/teacher/students?academic_year=${encodeURIComponent(academicYear)}`,
//           { headers: { Authorization: `Bearer ${token}` } }
//         );
//         setStudents(response.data);
//         setFiltered(response.data);

//         // Extract unique academic years for dropdown, including current
//         const yearsSet = new Set(response.data.map(s => s.academic_year));
//         yearsSet.add(currentAcademicYear);
//         setAllYears(Array.from(yearsSet).sort().reverse());

//         setLoading(false);
//       } catch (err) {
//         setError(err.response?.data?.message || t("failed_load_students"));
//         setLoading(false);
//       }
//     };
//     fetchStudents();
//   }, [navigate, t, academicYear]);

//   function handleAcademicYearChange(e) {
//     setAcademicYear(e.target.value);
//   }

//   function handleSearchChange(e) {
//     const val = e.target.value.toLowerCase();
//     setSearch(val);
//     setFiltered(
//       students.filter(s =>
//         s.full_name.toLowerCase().includes(val) ||
//         (s.roll_number && s.roll_number.toString().includes(val)) ||
//         (s.standard && s.standard.toLowerCase().includes(val)) ||
//         (s.division && s.division.toLowerCase().includes(val))
//       )
//     );
//   }

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
//       academic_year: student.academic_year || academicYear,
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
//       academic_year: currentAcademicYear,
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
//       // Update student profile
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

//       // Update enrollment profile
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

//       const response = await axios.get(
//         `http://localhost:5000/api/teacher/students?academic_year=${encodeURIComponent(academicYear)}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setStudents(response.data);
//       setFiltered(response.data);
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
//           academic_year: currentAcademicYear,
//           passed: false,
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       const response = await axios.get(
//         `http://localhost:5000/api/teacher/students?academic_year=${encodeURIComponent(academicYear)}`,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setStudents(response.data);
//       setFiltered(response.data);
//       closeModal();
//     } catch {
//       alert(t("failed_add_student"));
//       setUpdating(false);
//     }
//   }

//   if (loading) return <div className="mt-3 text-center">{t("loading_students")}...</div>;
//   if (error) return <div className="alert alert-danger mt-3">{error}</div>;

//   return (
//     <div className="container" style={{ maxWidth: 1050 }}>
//       <div className="d-flex align-items-center mb-4">
//         <button className="btn btn-link" onClick={() => navigate('/teacher')}>
//           <i className="bi bi-arrow-left"></i> {t("back_to_dashboard")}
//         </button>
//         <h2 className="mb-0 ms-3">{t("student_management")}</h2>
//       </div>

//       {/* Academic Year Selector */}
//       <div className="mb-3">
//         <label className="form-label">{t("academic_year")}</label>
//         <select
//           value={academicYear}
//           onChange={handleAcademicYearChange}
//           className="form-control"
//           style={{ maxWidth: 200 }}
//         >
//           {[currentAcademicYear, ...allYears.filter(y => y !== currentAcademicYear)].map((year) => (
//             <option value={year} key={year}>
//               {year}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Show Add Student for current academic year only */}
//       {academicYear === currentAcademicYear && (
//         <button className="btn btn-success mb-3" onClick={handleAddNew}>
//           {t("add_student")}
//         </button>
//       )}

//       <input
//         className="form-control mb-3"
//         placeholder={t("search_placeholder")}
//         value={search}
//         onChange={handleSearchChange}
//       />

//       <div className="table-responsive">
//         <table className="table table-bordered table-hover">
//           <thead className="table-light">
//             <tr>
//               <th>{t("roll_no")}</th>
//               <th>{t("full_name")}</th>
//               <th>{t("standard")}</th>
//               <th>{t("division")}</th>
//               <th>{t("dob")}</th>
//               <th>{t("gender")}</th>
//               <th>{t("parent_name")}</th>
//               <th>{t("parent_phone")}</th>
//               <th>{t("address")}</th>
//               <th>{t("admission_date")}</th>
//               <th>{t("passed")}</th>
//               <th>{t("actions")}</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.map((student) => (
//               <tr key={student.enrollment_id || student.student_id + "-" + student.academic_year}>
//                 <td>{student.roll_number || ""}</td>
//                 <td>{student.full_name || ""}</td>
//                 <td>{student.standard || ""}</td>
//                 <td>{student.division || ""}</td>
//                 <td>{student.dob || ""}</td>
//                 <td>{student.gender || ""}</td>
//                 <td>{student.parent_name || ""}</td>
//                 <td>{student.parent_phone || ""}</td>
//                 <td>{student.address || ""}</td>
//                 <td>{student.admission_date || ""}</td>
//                 <td>{student.passed === true ? t("yes") : student.passed === false ? t("no") : ""}</td>
//                 <td>
//                   <button className="btn btn-sm btn-info me-2" onClick={() => handleView(student)}>
//                     {t("view")}
//                   </button>
//                   {academicYear === currentAcademicYear && (
//                     <button className="btn btn-sm btn-primary" onClick={() => handleEdit(student)}>
//                       {t("edit")}
//                     </button>
//                   )}
//                 </td>
//               </tr>
//             ))}
//             {filtered.length === 0 && (
//               <tr>
//                 <td colSpan="12" className="text-center">
//                   {t("no_students_found")}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>

//       {(modalType === "view" || modalType === "edit" || modalType === "add") && (
//         <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">
//                   {modalType === "view"
//                     ? t("student_details")
//                     : modalType === "edit"
//                     ? t("edit_student")
//                     : t("add_student")}
//                 </h5>
//                 <button type="button" className="btn-close" onClick={closeModal} />
//               </div>
//               <div className="modal-body">
//                 {modalType === "view" ? (
//                   <div>
//                     <div>
//                       <strong>{t("full_name")}:</strong> {selectedStudent.full_name}
//                     </div>
//                     <div>
//                       <strong>{t("roll_no")}:</strong> {selectedStudent.roll_number}
//                     </div>
//                     <div>
//                       <strong>{t("standard")}:</strong> {selectedStudent.standard}
//                     </div>
//                     <div>
//                       <strong>{t("division")}:</strong> {selectedStudent.division}
//                     </div>
//                     <div>
//                       <strong>{t("dob")}:</strong> {selectedStudent.dob}
//                     </div>
//                     <div>
//                       <strong>{t("gender")}:</strong> {selectedStudent.gender}
//                     </div>
//                     <div>
//                       <strong>{t("parent_name")}:</strong> {selectedStudent.parent_name}
//                     </div>
//                     <div>
//                       <strong>{t("parent_phone")}:</strong> {selectedStudent.parent_phone}
//                     </div>
//                     <div>
//                       <strong>{t("address")}:</strong> {selectedStudent.address}
//                     </div>
//                     <div>
//                       <strong>{t("admission_date")}:</strong> {selectedStudent.admission_date}
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
//                   <form onSubmit={modalType === "add" ? handleAddSubmit : handleUpdate}>
//                     <input
//                       type="text"
//                       className="form-control mb-2"
//                       name="full_name"
//                       value={form.full_name}
//                       onChange={handleFormChange}
//                       placeholder={t("full_name")}
//                       required
//                     />
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
//                     <input
//                       type="date"
//                       className="form-control mb-2"
//                       name="dob"
//                       value={form.dob}
//                       onChange={handleFormChange}
//                     />
//                     <input
//                       type="text"
//                       className="form-control mb-2"
//                       name="gender"
//                       value={form.gender}
//                       onChange={handleFormChange}
//                       placeholder={t("gender")}
//                       required
//                     />
//                     <input
//                       type="text"
//                       className="form-control mb-2"
//                       name="parent_name"
//                       value={form.parent_name}
//                       onChange={handleFormChange}
//                       placeholder={t("parent_name")}
//                     />
//                     <input
//                       type="text"
//                       className="form-control mb-2"
//                       name="parent_phone"
//                       value={form.parent_phone}
//                       onChange={handleFormChange}
//                       placeholder={t("parent_phone")}
//                     />
//                     <input
//                       type="text"
//                       className="form-control mb-2"
//                       name="address"
//                       value={form.address}
//                       onChange={handleFormChange}
//                       placeholder={t("address")}
//                     />
//                     <input
//                       type="date"
//                       className="form-control mb-2"
//                       name="admission_date"
//                       value={form.admission_date || ""}
//                       onChange={handleFormChange}
//                       placeholder={t("admission_date")}
//                     />
//                     <input
//                       type="text"
//                       className="form-control mb-2"
//                       name="academic_year"
//                       value={form.academic_year}
//                       onChange={handleFormChange}
//                       placeholder={t("academic_year")}
//                       required
//                     />
//                     {/* Passed dropdown */}
//                     <div className="mb-2">
//                       <label className="form-label">{t("passed")}</label>
//                       <select
//                         className="form-control"
//                         name="passed"
//                         value={form.passed === "" ? "" : form.passed ? "true" : "false"}
//                         onChange={handleFormChange}
//                         required={modalType === "edit"}
//                         disabled={modalType === "edit" && academicYear !== currentAcademicYear}
//                       >
//                         <option value="">{t("select_status")}</option>
//                         <option value="true">{t("yes")}</option>
//                         <option value="false">{t("no")}</option>
//                       </select>
//                     </div>
//                     <button
//                       className="btn btn-primary mt-2"
//                       type="submit"
//                       disabled={updating || (modalType === "edit" && academicYear !== currentAcademicYear)}
//                     >
//                       {updating
//                         ? modalType === "add"
//                           ? t("adding")
//                           : t("saving")
//                         : modalType === "add"
//                         ? t("add")
//                         : t("save")}
//                     </button>
//                   </form>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useTranslation } from "react-i18next";

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
//   const [studentsSelectedYear, setStudentsSelectedYear] = useState([]);
//   const [searchCurrentYear, setSearchCurrentYear] = useState("");
//   const [searchSelectedYear, setSearchSelectedYear] = useState("");
//   const [modalType, setModalType] = useState(""); 
//   const [form, setForm] = useState({});
//   const [updating, setUpdating] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);

//   const [allYears, setAllYears] = useState([]);
//   const [selectedYear, setSelectedYear] = useState(currentYear);

//   const [loadingCurrent, setLoadingCurrent] = useState(true);
//   const [loadingSelected, setLoadingSelected] = useState(true);
//   const [error, setError] = useState("");

//   // Fetch students of current year on load
//   useEffect(() => {
//     fetchStudentsByYear(currentYear, true);
//   }, []);

//   // Fetch students for selectedYear changing
//   useEffect(() => {
//     if (selectedYear !== currentYear) {
//       fetchStudentsByYear(selectedYear, false);
//     }
//   }, [selectedYear]);

//   async function fetchStudentsByYear(year, isCurrent) {
//     if (isCurrent) setLoadingCurrent(true);
//     else setLoadingSelected(true);
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
//       if (year === currentYear) {
//         setStudentsCurrentYear(response.data);
//         setLoadingCurrent(false);
//       } else {
//         setStudentsSelectedYear(response.data);
//         setLoadingSelected(false);
//       }
//       const yearsSet = new Set([...allYears, ...response.data.map(s => s.academic_year), currentYear]);
//       setAllYears(Array.from(yearsSet).sort().reverse());
//     } catch (err) {
//       setError(err.response?.data?.message || t("failed_load_students"));
//       if (isCurrent) setLoadingCurrent(false);
//       else setLoadingSelected(false);
//     }
//   }

//   function handleSearchChange(e, isCurrent) {
//     const val = e.target.value.toLowerCase();
//     if (isCurrent) setSearchCurrentYear(val);
//     else setSearchSelectedYear(val);
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

//   // Modal open functions (edit/add/view same for current year)
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
//       fetchStudentsByYear(selectedYear, false);
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
//       fetchStudentsByYear(selectedYear, false);
//       closeModal();
//     } catch {
//       alert(t("failed_add_student"));
//       setUpdating(false);
//     }
//   }

//   if (loadingCurrent) return <div className="mt-3 text-center">{t("loading_students")}...</div>;
//   if (error) return <div className="alert alert-danger mt-3">{error}</div>;

//   return (
//     <div className="container" style={{ maxWidth: 1100 }}>
//       <h2>{t("student_management")} - {currentYear}</h2>

//       {/* Current Academic Year Student Table */}
//       <div className="mb-3">
//         {currentYear === currentYear && (
//           <button className="btn btn-success mb-3" onClick={handleAddNew}>
//             {t("add_student")}
//           </button>
//         )}

//         <input
//           className="form-control mb-3"
//           placeholder={t("search_placeholder")}
//           value={searchCurrentYear}
//           onChange={e => handleSearchChange(e, true)}
//         />
//         <div className="table-responsive mb-5">
//           <table className="table table-bordered table-hover">
//             <thead className="table-light">
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
//                     <button className="btn btn-sm btn-info me-2" onClick={() => handleView(st)}>
//                       {t("view")}
//                     </button>
//                     <button className="btn btn-sm btn-primary" onClick={() => handleEdit(st)}>
//                       {t("edit")}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {filteredStudents(studentsCurrentYear, searchCurrentYear).length === 0 && (
//                 <tr>
//                   <td colSpan="12" className="text-center">{t("no_students_found")}</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Past/Other Academic Year Student Table */}
//       <div>
//         <h3>{t("view_past_academic_year_students")}</h3>
//         <label>{t("select_academic_year")}</label>
//         <select
//           value={selectedYear}
//           onChange={e => setSelectedYear(e.target.value)}
//           className="form-control"
//           style={{ maxWidth: 220, marginBottom: 15 }}
//         >
//           {[currentYear, ...allYears.filter(y => y !== currentYear)].map(year => (
//             <option value={year} key={year}>
//               {year}
//             </option>
//           ))}
//         </select>

//         <input
//           className="form-control mb-3"
//           placeholder={t("search_placeholder")}
//           value={searchSelectedYear}
//           onChange={e => handleSearchChange(e, false)}
//         />
//         <div className="table-responsive">
//           <table className="table table-bordered table-hover">
//             <thead className="table-light">
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
//               {filteredStudents(studentsSelectedYear, searchSelectedYear).map(st => (
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
//                     <button className="btn btn-sm btn-info me-2" onClick={() => handleView(st)}>
//                       {t("view")}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {filteredStudents(studentsSelectedYear, searchSelectedYear).length === 0 && (
//                 <tr>
//                   <td colSpan="12" className="text-center">{t("no_students_found")}</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {(modalType === "view" || modalType === "edit" || modalType === "add") && (
//   <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
//     <div className="modal-dialog">
//       <div className="modal-content">
//         <div className="modal-header">
//           <h5 className="modal-title">
//             {modalType === "view"
//               ? t("student_details")
//               : modalType === "edit"
//               ? t("edit_student")
//               : t("add_student")}
//           </h5>
//           <button type="button" className="btn-close" onClick={closeModal}></button>
//         </div>
//         <div className="modal-body">
//           {modalType === "view" ? (
//             <div>
//               <div><strong>{t("full_name")}:</strong> {selectedStudent.full_name}</div>
//               <div><strong>{t("roll_no")}:</strong> {selectedStudent.roll_number}</div>
//               <div><strong>{t("standard")}:</strong> {selectedStudent.standard}</div>
//               <div><strong>{t("division")}:</strong> {selectedStudent.division}</div>
//               <div><strong>{t("dob")}:</strong> {selectedStudent.dob}</div>
//               <div><strong>{t("gender")}:</strong> {selectedStudent.gender}</div>
//               <div><strong>{t("parent_name")}:</strong> {selectedStudent.parent_name}</div>
//               <div><strong>{t("parent_phone")}:</strong> {selectedStudent.parent_phone}</div>
//               <div><strong>{t("address")}:</strong> {selectedStudent.address}</div>
//               <div><strong>{t("admission_date")}:</strong> {selectedStudent.admission_date}</div>
//               <div><strong>{t("passed")}:</strong> {selectedStudent.passed === true ? t("yes") : selectedStudent.passed === false ? t("no") : ""}</div>
//             </div>
//           ) : (
//             <form onSubmit={modalType === "add" ? handleAddSubmit : handleUpdate}>
//               <input type="text" className="form-control mb-2" name="full_name" value={form.full_name} onChange={handleFormChange} placeholder={t("full_name")} required />
//               <input type="text" className="form-control mb-2" name="standard" value={form.standard} onChange={handleFormChange} placeholder={t("standard")} required />
//               <input type="text" className="form-control mb-2" name="division" value={form.division} onChange={handleFormChange} placeholder={t("division")} required />
//               <input type="number" className="form-control mb-2" name="roll_number" value={form.roll_number} onChange={handleFormChange} placeholder={t("roll_no")} required />
//               <input type="date" className="form-control mb-2" name="dob" value={form.dob} onChange={handleFormChange} />
//               <input type="text" className="form-control mb-2" name="gender" value={form.gender} onChange={handleFormChange} placeholder={t("gender")} required />
//               <input type="text" className="form-control mb-2" name="parent_name" value={form.parent_name} onChange={handleFormChange} placeholder={t("parent_name")} />
//               <input type="text" className="form-control mb-2" name="parent_phone" value={form.parent_phone} onChange={handleFormChange} placeholder={t("parent_phone")} />
//               <input type="text" className="form-control mb-2" name="address" value={form.address} onChange={handleFormChange} placeholder={t("address")} />
//               <input type="date" className="form-control mb-2" name="admission_date" value={form.admission_date || ""} onChange={handleFormChange} placeholder={t("admission_date")} />
//               <input type="text" className="form-control mb-2" name="academic_year" value={form.academic_year} onChange={handleFormChange} placeholder={t("academic_year")} required />
//               <div className="mb-2">
//                 <label className="form-label">{t("passed")}</label>
//                 <select className="form-control" name="passed" value={form.passed === "" ? "" : form.passed ? "true" : "false"} onChange={handleFormChange} required={modalType === "edit"}>
//                   <option value="">{t("select_status")}</option>
//                   <option value="true">{t("yes")}</option>
//                   <option value="false">{t("no")}</option>
//                 </select>
//               </div>
//               <button className="btn btn-primary mt-2" type="submit" disabled={updating}>
//                 {updating ? (modalType === "add" ? t("adding") : t("saving")) : (modalType === "add" ? t("add") : t("save"))}
//               </button>
//             </form>
//           )}
//         </div>
//       </div>
//     </div>
//   </div>
// )}


//     </div>
//   );
// }

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useTranslation } from "react-i18next";

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
//   const [studentsSelectedYear, setStudentsSelectedYear] = useState([]);
//   const [searchCurrentYear, setSearchCurrentYear] = useState("");
//   const [searchSelectedYear, setSearchSelectedYear] = useState("");
//   const [modalType, setModalType] = useState(""); 
//   const [form, setForm] = useState({});
//   const [updating, setUpdating] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);

//   const [allYears, setAllYears] = useState([]);
//   const [selectedYear, setSelectedYear] = useState(currentYear);

//   const [loadingCurrent, setLoadingCurrent] = useState(true);
//   const [loadingSelected, setLoadingSelected] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchStudentsByYear(currentYear, true);
//   }, []);

//   useEffect(() => {
//     if (selectedYear !== currentYear) {
//       fetchStudentsByYear(selectedYear, false);
//     }
//   }, [selectedYear]);

//   async function fetchStudentsByYear(year, isCurrent) {
//     if (isCurrent) setLoadingCurrent(true);
//     else setLoadingSelected(true);
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
//       if (year === currentYear) {
//         setStudentsCurrentYear(response.data);
//         setLoadingCurrent(false);
//       } else {
//         setStudentsSelectedYear(response.data);
//         setLoadingSelected(false);
//       }
//       const yearsSet = new Set([...allYears, ...response.data.map(s => s.academic_year), currentYear]);
//       setAllYears(Array.from(yearsSet).sort().reverse());
//     } catch (err) {
//       setError(err.response?.data?.message || t("failed_load_students"));
//       if (isCurrent) setLoadingCurrent(false);
//       else setLoadingSelected(false);
//     }
//   }

//   function handleSearchChange(e, isCurrent) {
//     const val = e.target.value.toLowerCase();
//     if (isCurrent) setSearchCurrentYear(val);
//     else setSearchSelectedYear(val);
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
//       fetchStudentsByYear(selectedYear, false);
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
//       fetchStudentsByYear(selectedYear, false);
//       closeModal();
//     } catch {
//       alert(t("failed_add_student"));
//       setUpdating(false);
//     }
//   }

//   if (loadingCurrent) return <div className="mt-3 text-center">{t("loading_students")}...</div>;
//   if (error) return <div className="alert alert-danger mt-3">{error}</div>;

//   return (
//     <div className="container" style={{ maxWidth: 1100 }}>
//       <h2>{t("student_management")} - {currentYear}</h2>

//       {/* Current Academic Year Student Table */}
//       <div className="mb-3">
//         {currentYear === currentYear && (
//           <button className="btn btn-success mb-3" onClick={handleAddNew}>
//             {t("add_student")}
//           </button>
//         )}

//         <input
//           className="form-control mb-3"
//           placeholder={t("search_placeholder")}
//           value={searchCurrentYear}
//           onChange={e => handleSearchChange(e, true)}
//         />
//         <div className="table-responsive mb-5">
//           <table className="table table-bordered table-hover">
//             <thead className="table-light">
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
//                     <button className="btn btn-sm btn-info me-2" onClick={() => handleView(st)}>
//                       {t("view")}
//                     </button>
//                     <button className="btn btn-sm btn-primary" onClick={() => handleEdit(st)}>
//                       {t("edit")}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {filteredStudents(studentsCurrentYear, searchCurrentYear).length === 0 && (
//                 <tr>
//                   <td colSpan="12" className="text-center">{t("no_students_found")}</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Past/Other Academic Year Student Table */}
//       <div>
//         <h3>{t("view_past_academic_year_students")}</h3>
//         <label>{t("select_academic_year")}</label>
//         <select
//           value={selectedYear}
//           onChange={e => setSelectedYear(e.target.value)}
//           className="form-control"
//           style={{ maxWidth: 220, marginBottom: 15 }}
//         >
//           {[currentYear, ...allYears.filter(y => y !== currentYear)].map(year => (
//             <option value={year} key={year}>
//               {year}
//             </option>
//           ))}
//         </select>

//         <input
//           className="form-control mb-3"
//           placeholder={t("search_placeholder")}
//           value={searchSelectedYear}
//           onChange={e => handleSearchChange(e, false)}
//         />
//         <div className="table-responsive">
//           <table className="table table-bordered table-hover">
//             <thead className="table-light">
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
//               {filteredStudents(studentsSelectedYear, searchSelectedYear).map(st => (
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
//                     <button className="btn btn-sm btn-info me-2" onClick={() => handleView(st)}>
//                       {t("view")}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {filteredStudents(studentsSelectedYear, searchSelectedYear).length === 0 && (
//                 <tr>
//                   <td colSpan="12" className="text-center">{t("no_students_found")}</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {(modalType === "view" || modalType === "edit" || modalType === "add") && (
//         <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">
//                   {modalType === "view"
//                     ? t("student_details")
//                     : modalType === "edit"
//                     ? t("edit_student")
//                     : t("add_student")}
//                 </h5>
//                 <button type="button" className="btn-close" onClick={closeModal}></button>
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
//                     <button className="btn btn-primary mt-2" type="submit" disabled={updating}>
//                       {updating ? (modalType === "add" ? t("adding") : t("saving")) : (modalType === "add" ? t("add") : t("save"))}
//                     </button>
//                   </form>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useTranslation } from "react-i18next";

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
//   const [studentsSelectedYear, setStudentsSelectedYear] = useState([]);
//   const [searchCurrentYear, setSearchCurrentYear] = useState("");
//   const [searchSelectedYear, setSearchSelectedYear] = useState("");
//   const [modalType, setModalType] = useState("");
//   const [form, setForm] = useState({});
//   const [updating, setUpdating] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [allYears, setAllYears] = useState([]);
//   const [selectedYear, setSelectedYear] = useState(currentYear);
//   const [loadingCurrent, setLoadingCurrent] = useState(true);
//   const [loadingSelected, setLoadingSelected] = useState(true);
//   const [error, setError] = useState("");

//   // Fetch available academic years
//   useEffect(() => {
//     async function fetchYears() {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) return;
//         const res = await axios.get("http://localhost:5000/api/teacher/academic-years", {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setAllYears(res.data);
//         if (res.data.length && !res.data.includes(currentYear)) {
//           setAllYears([currentYear, ...res.data]);
//         }
//       } catch (err) {}
//     }
//     fetchYears();
//   }, [currentYear]);

//   // Fetch students of current year on load
//   useEffect(() => {
//     fetchStudentsByYear(currentYear, true);
//     // eslint-disable-next-line
//   }, []);

//   // Fetch students for selected year changing
//   useEffect(() => {
//     fetchStudentsByYear(selectedYear, false);
//     // eslint-disable-next-line
//   }, [selectedYear]);

//   async function fetchStudentsByYear(year, isCurrent) {
//     if (isCurrent) setLoadingCurrent(true);
//     else setLoadingSelected(true);
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
//       if (year === currentYear) {
//         setStudentsCurrentYear(response.data);
//         setLoadingCurrent(false);
//       } else {
//         setStudentsSelectedYear(response.data);
//         setLoadingSelected(false);
//       }
//       // Ensure year is in list if a new record is created mid-session
//       if (!allYears.includes(year)) {
//         setAllYears(prev => [year, ...prev]);
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || t("failed_load_students"));
//       if (isCurrent) setLoadingCurrent(false);
//       else setLoadingSelected(false);
//     }
//   }

//   function handleSearchChange(e, isCurrent) {
//     const val = e.target.value.toLowerCase();
//     if (isCurrent) setSearchCurrentYear(val);
//     else setSearchSelectedYear(val);
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
//       fetchStudentsByYear(selectedYear, false);
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
//       fetchStudentsByYear(selectedYear, false);
//       closeModal();
//     } catch {
//       alert(t("failed_add_student"));
//       setUpdating(false);
//     }
//   }

//   if (loadingCurrent) return <div className="mt-3 text-center">{t("loading_students")}...</div>;
//   if (error) return <div className="alert alert-danger mt-3">{error}</div>;

//   return (
//     <div className="container" style={{ maxWidth: 1100 }}>
//       <h2>{t("student_management")} - {currentYear}</h2>

//       {/* Current Academic Year Student Table */}
//       <div className="mb-3">
//         {currentYear === currentYear && (
//           <button className="btn btn-success mb-3" onClick={handleAddNew}>
//             {t("add_student")}
//           </button>
//         )}

//         <input
//           className="form-control mb-3"
//           placeholder={t("search_placeholder")}
//           value={searchCurrentYear}
//           onChange={e => handleSearchChange(e, true)}
//         />
//         <div className="table-responsive mb-5">
//           <table className="table table-bordered table-hover">
//             <thead className="table-light">
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
//                     <button className="btn btn-sm btn-info me-2" onClick={() => handleView(st)}>
//                       {t("view")}
//                     </button>
//                     <button className="btn btn-sm btn-primary" onClick={() => handleEdit(st)}>
//                       {t("edit")}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {filteredStudents(studentsCurrentYear, searchCurrentYear).length === 0 && (
//                 <tr>
//                   <td colSpan="12" className="text-center">{t("no_students_found")}</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Past/Other Academic Year Student Table */}
//       <div>
//         <h3>{t("view_past_academic_year_students")}</h3>
//         <label>{t("select_academic_year")}</label>
//         <select
//           value={selectedYear}
//           onChange={e => setSelectedYear(e.target.value)}
//           className="form-control"
//           style={{ maxWidth: 220, marginBottom: 15 }}
//         >
//           {allYears.map(year => (
//             <option value={year} key={year}>
//               {year}
//             </option>
//           ))}
//         </select>

//         <input
//           className="form-control mb-3"
//           placeholder={t("search_placeholder")}
//           value={searchSelectedYear}
//           onChange={e => handleSearchChange(e, false)}
//         />
//         <div className="table-responsive">
//           <table className="table table-bordered table-hover">
//             <thead className="table-light">
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
//               {filteredStudents(studentsSelectedYear, searchSelectedYear).map(st => (
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
//                     <button className="btn btn-sm btn-info me-2" onClick={() => handleView(st)}>
//                       {t("view")}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {filteredStudents(studentsSelectedYear, searchSelectedYear).length === 0 && (
//                 <tr>
//                   <td colSpan="12" className="text-center">{t("no_students_found")}</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {(modalType === "view" || modalType === "edit" || modalType === "add") && (
//         <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">
//                   {modalType === "view"
//                     ? t("student_details")
//                     : modalType === "edit"
//                     ? t("edit_student")
//                     : t("add_student")}
//                 </h5>
//                 <button type="button" className="btn-close" onClick={closeModal}></button>
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
//                     <button className="btn btn-primary mt-2" type="submit" disabled={updating}>
//                       {updating ? (modalType === "add" ? t("adding") : t("saving")) : (modalType === "add" ? t("add") : t("save"))}
//                     </button>
//                   </form>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { useTranslation } from "react-i18next";

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
//   const [studentsSelectedYear, setStudentsSelectedYear] = useState([]);
//   const [searchCurrentYear, setSearchCurrentYear] = useState("");
//   const [searchSelectedYear, setSearchSelectedYear] = useState("");
//   const [modalType, setModalType] = useState("");
//   const [form, setForm] = useState({});
//   const [updating, setUpdating] = useState(false);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [allYears, setAllYears] = useState([]);
//   const [selectedYear, setSelectedYear] = useState("");
//   const [loadingCurrent, setLoadingCurrent] = useState(true);
//   const [loadingSelected, setLoadingSelected] = useState(true);
//   const [error, setError] = useState("");

//   // Fetch valid academic years from backend, set default to latest
//   useEffect(() => {
//     async function fetchYears() {
//       try {
//         const token = localStorage.getItem("token");
//         if (!token) return;
//         const res = await axios.get("http://localhost:5000/api/teacher/academic-years", {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setAllYears(res.data);
//         if (res.data.length > 0) {
//           setSelectedYear(res.data[0]);
//         }
//       } catch (err) {}
//     }
//     fetchYears();
//   }, []);

//   // Fetch students of current year on load
//   useEffect(() => {
//     fetchStudentsByYear(currentYear, true);
//     // eslint-disable-next-line
//   }, []);

//   // Fetch students for selected year changing (only when selectedYear changes)
//   useEffect(() => {
//     if (!selectedYear) return;
//     fetchStudentsByYear(selectedYear, false);
//     // eslint-disable-next-line
//   }, [selectedYear]);

//   async function fetchStudentsByYear(year, isCurrent) {
//     if (isCurrent) setLoadingCurrent(true);
//     else setLoadingSelected(true);
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
//       if (year === currentYear) {
//         setStudentsCurrentYear(response.data);
//         setLoadingCurrent(false);
//       } else {
//         setStudentsSelectedYear(response.data);
//         setLoadingSelected(false);
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || t("failed_load_students"));
//       if (isCurrent) setLoadingCurrent(false);
//       else setLoadingSelected(false);
//     }
//   }

//   function handleSearchChange(e, isCurrent) {
//     const val = e.target.value.toLowerCase();
//     if (isCurrent) setSearchCurrentYear(val);
//     else setSearchSelectedYear(val);
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
//       fetchStudentsByYear(selectedYear, false);
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
//       fetchStudentsByYear(selectedYear, false);
//       closeModal();
//     } catch {
//       alert(t("failed_add_student"));
//       setUpdating(false);
//     }
//   }

//   if (loadingCurrent) return <div className="mt-3 text-center">{t("loading_students")}...</div>;
//   if (error) return <div className="alert alert-danger mt-3">{error}</div>;

//   return (
//     <div className="container" style={{ maxWidth: 1100 }}>
//       <h2>{t("student_management")} - {currentYear}</h2>

//       {/* Current Academic Year Student Table */}
//       <div className="mb-3">
//         {currentYear === currentYear && (
//           <button className="btn btn-success mb-3" onClick={handleAddNew}>
//             {t("add_student")}
//           </button>
//         )}

//         <input
//           className="form-control mb-3"
//           placeholder={t("search_placeholder")}
//           value={searchCurrentYear}
//           onChange={e => handleSearchChange(e, true)}
//         />
//         <div className="table-responsive mb-5">
//           <table className="table table-bordered table-hover">
//             <thead className="table-light">
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
//                     <button className="btn btn-sm btn-info me-2" onClick={() => handleView(st)}>
//                       {t("view")}
//                     </button>
//                     <button className="btn btn-sm btn-primary" onClick={() => handleEdit(st)}>
//                       {t("edit")}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {filteredStudents(studentsCurrentYear, searchCurrentYear).length === 0 && (
//                 <tr>
//                   <td colSpan="12" className="text-center">{t("no_students_found")}</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Past/Other Academic Year Student Table */}
//       <div>
//         <h3>{t("view_past_academic_year_students")}</h3>
//         <label>{t("select_academic_year")}</label>
//         <select
//           value={selectedYear}
//           onChange={e => setSelectedYear(e.target.value)}
//           className="form-control"
//           style={{ maxWidth: 220, marginBottom: 15 }}
//         >
//           {allYears.map(year => (
//             <option value={year} key={year}>
//               {year}
//             </option>
//           ))}
//         </select>

//         <input
//           className="form-control mb-3"
//           placeholder={t("search_placeholder")}
//           value={searchSelectedYear}
//           onChange={e => handleSearchChange(e, false)}
//         />
//         <div className="table-responsive">
//           <table className="table table-bordered table-hover">
//             <thead className="table-light">
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
//               {filteredStudents(studentsSelectedYear, searchSelectedYear).map(st => (
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
//                     <button className="btn btn-sm btn-info me-2" onClick={() => handleView(st)}>
//                       {t("view")}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {filteredStudents(studentsSelectedYear, searchSelectedYear).length === 0 && (
//                 <tr>
//                   <td colSpan="12" className="text-center">{t("no_students_found")}</td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {(modalType === "view" || modalType === "edit" || modalType === "add") && (
//         <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
//           <div className="modal-dialog">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">
//                   {modalType === "view"
//                     ? t("student_details")
//                     : modalType === "edit"
//                     ? t("edit_student")
//                     : t("add_student")}
//                 </h5>
//                 <button type="button" className="btn-close" onClick={closeModal}></button>
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
//                     <button className="btn btn-primary mt-2" type="submit" disabled={updating}>
//                       {updating ? (modalType === "add" ? t("adding") : t("saving")) : (modalType === "add" ? t("add") : t("save"))}
//                     </button>
//                   </form>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

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

  // Fetch students of current year on load
  useEffect(() => {
    fetchStudentsByYear(currentYear, true);
    // eslint-disable-next-line
  }, []);

  async function fetchStudentsByYear(year, isCurrent) {
    if (isCurrent) setLoadingCurrent(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get(
        `http://localhost:5000/api/teacher/students?academic_year=${encodeURIComponent(year)}`,
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
    return studentsList.filter(s =>
      s.full_name.toLowerCase().includes(search) ||
      (s.roll_number && s.roll_number.toString().includes(search)) ||
      (s.standard && s.standard.toLowerCase().includes(search)) ||
      (s.division && s.division.toLowerCase().includes(search))
    );
  }

  // Modal open functions (edit/add/view)
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
      passed: typeof student.passed === "boolean" ? student.passed : ""
    });
    setModalType("edit");
  }

  function handleAddNew() {
    setForm({
      full_name: "",
      dob: "",
      gender: "",
      address: "",
      parent_name: "",
      parent_phone: "",
      admission_date: "",
      standard: "",
      division: "",
      roll_number: "",
      academic_year: currentYear,
      passed: ""
    });
    setModalType("add");
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
      await axios.put(
        `http://localhost:5000/api/teacher/student/${form.student_id}`,
        {
          full_name: form.full_name,
          dob: form.dob,
          gender: form.gender,
          address: form.address,
          parent_name: form.parent_name,
          parent_phone: form.parent_phone,
          admission_date: form.admission_date,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await axios.put(
        `http://localhost:5000/api/teacher/enrollment/${form.enrollment_id}`,
        {
          standard: form.standard,
          division: form.division,
          roll_number: form.roll_number,
          academic_year: form.academic_year,
          passed: form.passed === "" ? null : form.passed,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStudentsByYear(currentYear, true);
      closeModal();
    } catch {
      alert(t("failed_update_student"));
      setUpdating(false);
    }
  }

  async function handleAddSubmit(e) {
    e.preventDefault();
    setUpdating(true);
    const token = localStorage.getItem("token");
    try {
      const profileRes = await axios.get(
        "http://localhost:5000/api/teacher/me",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const unit_id = profileRes.data.unit_id;
      const resProfile = await axios.post(
        "http://localhost:5000/api/teacher/student",
        {
          full_name: form.full_name,
          dob: form.dob,
          gender: form.gender,
          address: form.address,
          parent_name: form.parent_name,
          parent_phone: form.parent_phone,
          admission_date: form.admission_date,
          unit_id,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const student_id = resProfile.data.student_id;
      await axios.post(
        "http://localhost:5000/api/teacher/enrollment",
        {
          student_id,
          standard: form.standard,
          division: form.division,
          roll_number: form.roll_number,
          academic_year: currentYear,
          passed: false,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchStudentsByYear(currentYear, true);
      closeModal();
    } catch {
      alert(t("failed_add_student"));
      setUpdating(false);
    }
  }

  if (loadingCurrent) return <div className="mt-3 text-center">{t("loading_students")}...</div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="container" style={{ maxWidth: 1100 }}>
      <h2>{t("student_management")} - {currentYear}</h2>

      {/* Current Academic Year Student Table */}
      <div className="mb-3">
        {currentYear === currentYear && (
          <button className="btn btn-success mb-3" onClick={handleAddNew}>
            {t("add_student")}
          </button>
        )}

        <input
          className="form-control mb-3"
          placeholder={t("search_placeholder")}
          value={searchCurrentYear}
          onChange={handleSearchChange}
        />
        <div className="table-responsive mb-5">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
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
                <th>{t("passed")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents(studentsCurrentYear, searchCurrentYear).map(st => (
                <tr key={st.enrollment_id || st.student_id + "-" + st.academic_year}>
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
                  <td>{st.passed === true ? t("yes") : st.passed === false ? t("no") : ""}</td>
                  <td>
                    <button className="btn btn-sm btn-info me-2" onClick={() => handleView(st)}>
                      {t("view")}
                    </button>
                    <button className="btn btn-sm btn-primary" onClick={() => handleEdit(st)}>
                      {t("edit")}
                    </button>
                  </td>
                </tr>
              ))}
              {filteredStudents(studentsCurrentYear, searchCurrentYear).length === 0 && (
                <tr>
                  <td colSpan="12" className="text-center">{t("no_students_found")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(modalType === "view" || modalType === "edit" || modalType === "add") && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalType === "view"
                    ? t("student_details")
                    : modalType === "edit"
                    ? t("edit_student")
                    : t("add_student")}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                {modalType === "view" ? (
                  <div>
                    <div><strong>{t("full_name")}:</strong> {selectedStudent.full_name}</div>
                    <div><strong>{t("roll_no")}:</strong> {selectedStudent.roll_number}</div>
                    <div><strong>{t("standard")}:</strong> {selectedStudent.standard}</div>
                    <div><strong>{t("division")}:</strong> {selectedStudent.division}</div>
                    <div><strong>{t("dob")}:</strong> {selectedStudent.dob}</div>
                    <div><strong>{t("gender")}:</strong> {selectedStudent.gender}</div>
                    <div><strong>{t("parent_name")}:</strong> {selectedStudent.parent_name}</div>
                    <div><strong>{t("parent_phone")}:</strong> {selectedStudent.parent_phone}</div>
                    <div><strong>{t("address")}:</strong> {selectedStudent.address}</div>
                    <div><strong>{t("admission_date")}:</strong> {selectedStudent.admission_date}</div>
                    <div><strong>{t("passed")}:</strong> {selectedStudent.passed === true ? t("yes") : selectedStudent.passed === false ? t("no") : ""}</div>
                  </div>
                ) : (
                  <form onSubmit={modalType === "add" ? handleAddSubmit : handleUpdate}>
                    <input type="text" className="form-control mb-2" name="full_name" value={form.full_name} onChange={handleFormChange} placeholder={t("full_name")} required />
                    <input type="text" className="form-control mb-2" name="standard" value={form.standard} onChange={handleFormChange} placeholder={t("standard")} required />
                    <input type="text" className="form-control mb-2" name="division" value={form.division} onChange={handleFormChange} placeholder={t("division")} required />
                    <input type="number" className="form-control mb-2" name="roll_number" value={form.roll_number} onChange={handleFormChange} placeholder={t("roll_no")} required />
                    <input type="date" className="form-control mb-2" name="dob" value={form.dob} onChange={handleFormChange} />
                    <input type="text" className="form-control mb-2" name="gender" value={form.gender} onChange={handleFormChange} placeholder={t("gender")} required />
                    <input type="text" className="form-control mb-2" name="parent_name" value={form.parent_name} onChange={handleFormChange} placeholder={t("parent_name")} />
                    <input type="text" className="form-control mb-2" name="parent_phone" value={form.parent_phone} onChange={handleFormChange} placeholder={t("parent_phone")} />
                    <input type="text" className="form-control mb-2" name="address" value={form.address} onChange={handleFormChange} placeholder={t("address")} />
                    <input type="date" className="form-control mb-2" name="admission_date" value={form.admission_date || ""} onChange={handleFormChange} placeholder={t("admission_date")} />
                    <input type="text" className="form-control mb-2" name="academic_year" value={form.academic_year} onChange={handleFormChange} placeholder={t("academic_year")} required />
                    <div className="mb-2">
                      <label className="form-label">{t("passed")}</label>
                      <select className="form-control" name="passed" value={form.passed === "" ? "" : form.passed ? "true" : "false"} onChange={handleFormChange} required={modalType === "edit"}>
                        <option value="">{t("select_status")}</option>
                        <option value="true">{t("yes")}</option>
                        <option value="false">{t("no")}</option>
                      </select>
                    </div>
                    <button className="btn btn-primary mt-2" type="submit" disabled={updating}>
                      {updating ? (modalType === "add" ? t("adding") : t("saving")) : (modalType === "add" ? t("add") : t("save"))}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
