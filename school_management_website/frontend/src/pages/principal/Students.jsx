// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useTranslation } from "react-i18next";

// export default function Students() {
//   const { t } = useTranslation();
//   const [students, setStudents] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchStudents = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await axios.get("http://localhost:5000/api/principal/students", {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setStudents(response.data);
//         setFiltered(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError(
//           err.response?.data?.error ||
//             err.message ||
//             t("failed_load_students")
//         );
//         setLoading(false);
//       }
//     };

//     fetchStudents();
//     // eslint-disable-next-line
//   }, []);

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

//   if (loading) return <div className="mt-3 text-center">{t("loading_students")}...</div>;
//   if (error) return <div className="alert alert-danger mt-3">{error}</div>;

//   return (
//     <div className="container-fluid p-4">
//       <h2 className="mb-4">{t("students_directory")}</h2>
//       <input
//         className="form-control mb-3"
//         placeholder={t("search_by_details")}
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
//               <th>{t("address")}</th>
//               <th>{t("parent_name")}</th>
//               <th>{t("parent_phone")}</th>
//               <th>{t("admission_date")}</th>
//               <th>{t("created_at")}</th>
//               <th>{t("updated_at")}</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.map(student => (
//               <tr key={student.student_id}>
//                 <td>{student.roll_number}</td>
//                 <td>{student.full_name}</td>
//                 <td>{student.standard}</td>
//                 <td>{student.division}</td>
//                 <td>{student.dob ? new Date(student.dob).toLocaleDateString() : "-"}</td>
//                 <td>{student.gender}</td>
//                 <td>{student.address}</td>
//                 <td>{student.parent_name}</td>
//                 <td>{student.parent_phone}</td>
//                 <td>{student.admission_date}</td>
//                 <td>{student.createdat ? new Date(student.createdat).toLocaleString() : "-"}</td>
//                 <td>{student.updatedat ? new Date(student.updatedat).toLocaleString() : "-"}</td>
//               </tr>
//             ))}
//             {filtered.length === 0 && (
//               <tr>
//                 <td colSpan="11" className="text-center">
//                   {t("no_students_found")}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useTranslation } from "react-i18next";

// // Adjust columns according to your API/DB response
// const COLUMNS = [
//   { key: "student_id", label: "Student ID" },
//   { key: "full_name", label: "Full Name" },
//   { key: "dob", label: "DOB" },
//   { key: "gender", label: "Gender" },
//   { key: "address", label: "Address" },
//   { key: "parent_name", label: "Parent Name" },
//   { key: "parent_phone", label: "Parent Phone" },
//   { key: "admission_date", label: "Admission Date" },
//   { key: "unit_id", label: "Unit ID" },
//   { key: "enrollment_id", label: "Enrollment ID" },
//   { key: "standard", label: "Standard" },
//   { key: "division", label: "Division" },
//   { key: "roll_number", label: "Roll Number" },
//   { key: "academic_year", label: "Academic Year" },
//   { key: "passed", label: "Passed" },
// ];

// export default function Students() {
//   const { t } = useTranslation();
//   const [students, setStudents] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [allYears, setAllYears] = useState([]);
//   const [academicYear, setAcademicYear] = useState("");
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [visibleColumns, setVisibleColumns] = useState(COLUMNS.map(c => c.key));
//   const [showColDropdown, setShowColDropdown] = useState(false);

//   // Fetch all students on mount to get years
//   useEffect(() => {
//     async function fetchAll() {
//       try {
//         const token = localStorage.getItem("token");
//         const res = await axios.get("http://localhost:5000/api/principal/students", {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setStudents(res.data);
//         setFiltered(res.data);
//         // Gather all academic_year values present
//         const years = Array.from(new Set(res.data.map(s => s.academic_year).filter(Boolean))).sort().reverse();
//         setAllYears(years);
//         if (!academicYear && years.length) setAcademicYear(years[0]);
//         setLoading(false);
//       } catch (err) {
//         setError(
//           err.response?.data?.message ||
//             err.response?.data?.error ||
//             err.message ||
//             t("failed_load_students")
//         );
//         setLoading(false);
//       }
//     }
//     fetchAll();
//     // eslint-disable-next-line
//   }, []);

//   // Filter students on academic year change
//   useEffect(() => {
//     if (!academicYear) { setFiltered(students); return; }
//     setFiltered(
//       students.filter(s => s.academic_year === academicYear)
//     );
//   }, [academicYear, students]);

//   // Apply search filter
//   useEffect(() => {
//     if (!search) {
//       setFiltered(students.filter(s => !academicYear || s.academic_year === academicYear));
//       return;
//     }
//     setFiltered(
//       students.filter(
//         s =>
//           (!academicYear || s.academic_year === academicYear) &&
//           (
//             (s.full_name && s.full_name.toLowerCase().includes(search)) ||
//             (s.roll_number && s.roll_number.toString().includes(search)) ||
//             (s.standard && s.standard.toLowerCase().includes(search)) ||
//             (s.division && s.division.toLowerCase().includes(search))
//           )
//       )
//     );
//     // eslint-disable-next-line
//   }, [search]);

//   function handleColumnToggle(key) {
//     setVisibleColumns(prev =>
//       prev.includes(key)
//         ? prev.filter(col => col !== key)
//         : [...prev, key]
//     );
//   }

//   function handleSearchChange(e) {
//     setSearch(e.target.value.toLowerCase());
//   }

//   return (
//     <div className="container-fluid p-4">
//       <h2 className="mb-4">{t("students_directory") || "My Students"}</h2>
//       <div className="d-flex mb-3 align-items-center" style={{ gap: 16 }}>
//         <input
//           className="form-control"
//           style={{ maxWidth: 300 }}
//           placeholder={t("search_by_details") || "Search..."}
//           value={search}
//           onChange={handleSearchChange}
//         />
//         <div className="dropdown" style={{ position: "relative" }}>
//           <button
//             className="btn btn-outline-secondary dropdown-toggle"
//             type="button"
//             onClick={() => setShowColDropdown((s) => !s)}
//           >
//             Select Columns
//           </button>
//           {showColDropdown && (
//             <div className="dropdown-menu show p-2" style={{ maxHeight: 300, overflowY: "auto", right: 0, left: "auto" }}>
//               {COLUMNS.map(col => (
//                 <div key={col.key} className="form-check">
//                   <input
//                     type="checkbox"
//                     className="form-check-input"
//                     id={`col-check-${col.key}`}
//                     checked={visibleColumns.includes(col.key)}
//                     onChange={() => handleColumnToggle(col.key)}
//                   />
//                   <label className="form-check-label" htmlFor={`col-check-${col.key}`}>
//                     {col.label}
//                   </label>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//         <select
//           value={academicYear}
//           onChange={e => setAcademicYear(e.target.value)}
//           className="form-control"
//           style={{ width: 160 }}
//         >
//           {allYears.length === 0 && <option value="">{t("loading") || "Loading"}</option>}
//           {allYears.map(year => (
//             <option value={year} key={year}>{year}</option>
//           ))}
//         </select>
//       </div>
//       <div className="table-responsive">
//         <table className="table table-striped table-bordered">
//           <thead>
//             <tr>
//               {COLUMNS.filter(col => visibleColumns.includes(col.key)).map(col => (
//                 <th key={col.key}>{col.label}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {filtered.map(student => (
//               <tr key={student.student_id + "-" + student.academic_year}>
//                 {COLUMNS.filter(col => visibleColumns.includes(col.key)).map(col => (
//                   <td key={col.key}>
//                     {typeof student[col.key] === "boolean"
//                       ? (student[col.key] ? t("yes") : t("no"))
//                       : (col.key === "dob" || col.key === "admission_date")
//                         ? (student[col.key] ? new Date(student[col.key]).toLocaleDateString() : "-")
//                         : student[col.key]}
//                   </td>
//                 ))}
//               </tr>
//             ))}
//             {filtered.length === 0 && !loading && (
//               <tr>
//                 <td colSpan={visibleColumns.length} className="text-center">
//                   {t("no_students_found") || "No students found"}
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//         {loading && <div>{t("loading") || "Loading..."}</div>}
//       </div>
//       {error && <div className="alert alert-danger mt-3">{error}</div>}
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

// Table columns reflecting your backend
const COLUMNS = [
  { key: "student_id", label: "Student ID" },
  { key: "full_name", label: "Full Name" },
  { key: "dob", label: "DOB" },
  { key: "gender", label: "Gender" },
  { key: "address", label: "Address" },
  { key: "parent_name", label: "Parent Name" },
  { key: "parent_phone", label: "Parent Phone" },
  { key: "admission_date", label: "Admission Date" },
  { key: "unit_id", label: "Unit ID" },
  { key: "enrollment_id", label: "Enrollment ID" },
  { key: "standard", label: "Standard" },
  { key: "division", label: "Division" },
  { key: "roll_number", label: "Roll Number" },
  { key: "academic_year", label: "Academic Year" },
  { key: "passed", label: "Passed" }
];

export default function Students() {
  const { t } = useTranslation();
  const [students, setStudents] = useState([]);
  const [allYears, setAllYears] = useState([]);
  const [academicYear, setAcademicYear] = useState(""); // initially empty
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(COLUMNS.map(c => c.key));
  const [showColDropdown, setShowColDropdown] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch all students, derive academic years
  useEffect(() => {
    async function fetchAll() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/principal/students", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudents(res.data);
        // Gather all years present
        const years = Array.from(new Set(res.data.map(s => s.academic_year).filter(Boolean))).sort().reverse();
        setAllYears(years);
        if (!academicYear && years.length) setAcademicYear(years[0]);
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            t("failed_load_students")
        );
        setLoading(false);
      }
    }
    fetchAll();
    // eslint-disable-next-line
  }, []);

  // Data filtered by year & search
  const filteredStudents = students.filter(s =>
    (!academicYear || s.academic_year === academicYear) &&
    (
      !search ||
      (s.full_name && s.full_name.toLowerCase().includes(search)) ||
      (s.roll_number && s.roll_number.toString().includes(search)) ||
      (s.standard && s.standard.toLowerCase().includes(search)) ||
      (s.division && s.division.toLowerCase().includes(search))
    )
  );

  function handleColumnToggle(key) {
    setVisibleColumns(prev =>
      prev.includes(key)
        ? prev.filter(col => col !== key)
        : [...prev, key]
    );
  }

  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4">{t("students_directory") || "My Students"}</h2>
      <div className="d-flex mb-3 align-items-center" style={{ gap: 16 }}>
        <input
          className="form-control"
          style={{ maxWidth: 300 }}
          placeholder={t("search_by_details") || "Search..."}
          value={search}
          onChange={e => setSearch(e.target.value.toLowerCase())}
        />
        <div className="dropdown" style={{ position: "relative" }}>
          <button
            className="btn btn-outline-secondary dropdown-toggle"
            type="button"
            onClick={() => setShowColDropdown(s => !s)}
          >
            Select Columns
          </button>
          {showColDropdown && (
            <div className="dropdown-menu show p-2" style={{ maxHeight: 300, overflowY: "auto", right: 0, left: "auto" }}>
              {COLUMNS.map(col => (
                <div key={col.key} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id={`col-check-${col.key}`}
                    checked={visibleColumns.includes(col.key)}
                    onChange={() => handleColumnToggle(col.key)}
                  />
                  <label className="form-check-label" htmlFor={`col-check-${col.key}`}>
                    {col.label}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        <select
          value={academicYear}
          onChange={e => setAcademicYear(e.target.value)}
          className="form-control"
          style={{ width: 160 }}
        >
          {allYears.length === 0 && <option value="">{t("loading") || "Loading"}</option>}
          {allYears.map(year => (
            <option value={year} key={year}>{year}</option>
          ))}
        </select>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead>
            <tr>
              {COLUMNS.filter(col => visibleColumns.includes(col.key)).map(col => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(student => (
              <tr key={student.student_id + "-" + student.academic_year}>
                {COLUMNS.filter(col => visibleColumns.includes(col.key)).map(col => (
                  <td key={col.key}>
                    {typeof student[col.key] === "boolean"
                      ? (student[col.key] ? t("yes") : t("no"))
                      : (col.key === "dob" || col.key === "admission_date")
                        ? (student[col.key] ? new Date(student[col.key]).toLocaleDateString() : "-")
                        : student[col.key]}
                  </td>
                ))}
              </tr>
            ))}
            {filteredStudents.length === 0 && !loading && (
              <tr>
                <td colSpan={visibleColumns.length} className="text-center">
                  {t("no_students_found") || "No students found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && <div>{t("loading") || "Loading..."}</div>}
      </div>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
    </div>
  );
}
