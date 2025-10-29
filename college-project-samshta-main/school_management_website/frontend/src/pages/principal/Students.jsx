// import React, { useState, useEffect } from "react";
// import axios from "axios";

// export default function Students() {
//   const [students, setStudents] = useState([]);
//   const [filtered, setFiltered] = useState([]);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchStudents = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         console.log('Fetching students...'); // Debug log
//         const response = await axios.get("http://localhost:5000/api/principal/students", {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         });
//         console.log('Students data:', response.data); // Debug log
//         setStudents(response.data);
//         setFiltered(response.data);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error details:", err.response || err); // Enhanced error logging
//         setError(err.response?.data?.error || err.message || "Failed to load students");
//         setLoading(false);
//       }
//     };

//     fetchStudents();
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

//   if (loading) return <div className="mt-3 text-center">Loading students...</div>;
//   if (error) return <div className="alert alert-danger mt-3">{error}</div>;

//   return (
//     <div className="container-fluid p-4">
//       <h2 className="mb-4">Students Directory</h2>
//       <input
//         className="form-control mb-3"
//         placeholder="Search by name, roll number, standard, or division"
//         value={search}
//         onChange={handleSearchChange}
//       />
//       <div className="table-responsive">
//         <table className="table table-bordered table-hover">
//           <thead className="table-light">
//             <tr>
//               <th>Roll No</th>
//               <th>Full Name</th>
//               <th>Standard</th>
//               <th>Division</th>
//               <th>DOB</th>
//               <th>Gender</th>
//               <th>Address</th>
//               <th>Parent Name</th>
//               <th>Parent Phone</th>
//               <th>Created At</th>
//               <th>Updated At</th>
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
//                 <td>{student.createdat ? new Date(student.createdat).toLocaleString() : "-"}</td>
//                 <td>{student.updatedat ? new Date(student.updatedat).toLocaleString() : "-"}</td>
//               </tr>
//             ))}
//             {filtered.length === 0 && (
//               <tr>
//                 <td colSpan="11" className="text-center">
//                   No students found.
//                 </td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

export default function Students() {
  const { t } = useTranslation();
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/principal/students", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStudents(response.data);
        setFiltered(response.data);
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            err.message ||
            t("failed_load_students")
        );
        setLoading(false);
      }
    };

    fetchStudents();
    // eslint-disable-next-line
  }, []);

  function handleSearchChange(e) {
    const val = e.target.value.toLowerCase();
    setSearch(val);
    setFiltered(
      students.filter(
        s =>
          s.full_name.toLowerCase().includes(val) ||
          (s.roll_number && s.roll_number.toString().includes(val)) ||
          (s.standard && s.standard.toLowerCase().includes(val)) ||
          (s.division && s.division.toLowerCase().includes(val))
      )
    );
  }

  if (loading) return <div className="mt-3 text-center">{t("loading_students")}...</div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4">{t("students_directory")}</h2>
      <input
        className="form-control mb-3"
        placeholder={t("search_by_details")}
        value={search}
        onChange={handleSearchChange}
      />
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>{t("roll_no")}</th>
              <th>{t("full_name")}</th>
              <th>{t("standard")}</th>
              <th>{t("division")}</th>
              <th>{t("dob")}</th>
              <th>{t("gender")}</th>
              <th>{t("address")}</th>
              <th>{t("parent_name")}</th>
              <th>{t("parent_phone")}</th>
              <th>{t("created_at")}</th>
              <th>{t("updated_at")}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(student => (
              <tr key={student.student_id}>
                <td>{student.roll_number}</td>
                <td>{student.full_name}</td>
                <td>{student.standard}</td>
                <td>{student.division}</td>
                <td>{student.dob ? new Date(student.dob).toLocaleDateString() : "-"}</td>
                <td>{student.gender}</td>
                <td>{student.address}</td>
                <td>{student.parent_name}</td>
                <td>{student.parent_phone}</td>
                <td>{student.createdat ? new Date(student.createdat).toLocaleString() : "-"}</td>
                <td>{student.updatedat ? new Date(student.updatedat).toLocaleString() : "-"}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="11" className="text-center">
                  {t("no_students_found")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
