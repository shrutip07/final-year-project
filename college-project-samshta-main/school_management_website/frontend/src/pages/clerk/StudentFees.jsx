
// // // // import React, { useEffect, useState } from "react";
// // // // import axios from "axios";

// // // // export default function StudentFees() {
// // // //   const [feeRows, setFeeRows] = useState([]);
// // // //   const [standards, setStandards] = useState(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
// // // //   const [form, setForm] = useState({ standard: "", academic_year: "", fee_amount: "" });
// // // //   const [error, setError] = useState("");
// // // //   const [success, setSuccess] = useState("");
// // // //   const [yearFilter, setYearFilter] = useState(""); // academic year filter

// // // //   useEffect(() => {
// // // //     fetchFees();
// // // //   }, []);

// // // //   const fetchFees = async () => {
// // // //     const token = localStorage.getItem("token");
// // // //     const res = await axios.get("http://localhost:5000/api/clerk/fee-master", {
// // // //       headers: { Authorization: `Bearer ${token}` }
// // // //     });
// // // //     setFeeRows(res.data.fees);
// // // //   };

// // // //   const handleChange = e => {
// // // //     setForm({ 
// // // //       ...form, 
// // // //       [e.target.name]: e.target.name === "fee_amount" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value 
// // // //     });
// // // //   };

// // // //   const handleSubmit = async e => {
// // // //     e.preventDefault();
// // // //     setError("");
// // // //     setSuccess("");
// // // //     try {
// // // //       const token = localStorage.getItem("token");
// // // //       await axios.post("http://localhost:5000/api/clerk/fee-master", {
// // // //         ...form,
// // // //         fee_amount: form.fee_amount === "" ? null : String(Number(form.fee_amount))
// // // //       }, {
// // // //         headers: { Authorization: `Bearer ${token}` }
// // // //       });
// // // //       setSuccess("Fee updated.");
// // // //       fetchFees();
// // // //       setForm({ standard: "", academic_year: "", fee_amount: "" });
// // // //     } catch (err) {
// // // //       setError(err.response?.data?.error || "Could not update fee.");
// // // //     }
// // // //   };

// // // //   // Compute all available academic years from feeRows
// // // //   const allYears = Array.from(new Set(feeRows.map(fee => fee.academic_year)));
// // // //   const filteredFees = yearFilter
// // // //     ? feeRows.filter(fee => fee.academic_year === yearFilter)
// // // //     : feeRows;

// // // //   return (
// // // //     <div>
// // // //       <h2>Set Fees For Standard</h2>
// // // //       {/* Fee Setting Form */}
// // // //       <form onSubmit={handleSubmit} className="mb-4" style={{ display: 'flex', gap: 8, alignItems: "center" }}>
// // // //         <select required name="standard" value={form.standard} onChange={handleChange}>
// // // //           <option value="">Select Standard</option>
// // // //           {standards.map(std => (
// // // //             <option key={std} value={std}>{std}</option>
// // // //           ))}
// // // //         </select>
// // // //         <input
// // // //           name="academic_year"
// // // //           placeholder="Academic Year (e.g. 2023-24)"
// // // //           value={form.academic_year}
// // // //           onChange={handleChange}
// // // //           required
// // // //         />
// // // //         <input
// // // //           name="fee_amount"
// // // //           type="number"
// // // //           placeholder="Fee Amount"
// // // //           value={form.fee_amount}
// // // //           onChange={handleChange}
// // // //           required
// // // //         />
// // // //         <button type="submit" className="btn btn-primary">Set Fee</button>
// // // //       </form>
// // // //       {error && <div className="alert alert-danger">{error}</div>}
// // // //       {success && <div className="alert alert-success">{success}</div>}

// // // //       {/* Academic Year filter */}
// // // //       <div style={{ marginBottom: 20, marginTop: 25 }}>
// // // //         <label style={{ marginRight: 8 }}>Show fees for:</label>
// // // //         <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
// // // //           <option value="">All Years</option>
// // // //           {allYears.map(year => (
// // // //             <option key={year} value={year}>{year}</option>
// // // //           ))}
// // // //         </select>
// // // //       </div>

// // // //       {/* Fee Master Table */}
// // // //       <h4>Fee Structure</h4>
// // // //       <table className="table table-bordered">
// // // //         <thead>
// // // //           <tr>
// // // //             <th>Standard</th>
// // // //             <th>Academic Year</th>
// // // //             <th>Fee Amount</th>
// // // //           </tr>
// // // //         </thead>
// // // //         <tbody>
// // // //           {filteredFees.map(fee => (
// // // //             <tr key={fee.id}>
// // // //               <td>{fee.standard}</td>
// // // //               <td>{fee.academic_year}</td>
// // // //               <td>{fee.fee_amount}</td>
// // // //             </tr>
// // // //           ))}
// // // //         </tbody>
// // // //       </table>
// // // //     </div>
// // // //   );
// // // // }

// // // import React, { useEffect, useState } from "react";
// // // import axios from "axios";

// // // export default function StudentFees() {
// // //   const [feeRows, setFeeRows] = useState([]);
// // //   const [standards] = useState(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
// // //   const [divisions] = useState(["A", "B", "C", "D"]);
// // //   const [form, setForm] = useState({ standard: "", academic_year: "", fee_amount: "" });
// // //   const [error, setError] = useState("");
// // //   const [success, setSuccess] = useState("");
// // //   const [yearFilter, setYearFilter] = useState(""); // Academic year filter for fee display

// // //   // Fee paid management states
// // //   const [feeStandard, setFeeStandard] = useState("");
// // //   const [feeDivision, setFeeDivision] = useState("");
// // //   const [feeAcademicYear, setFeeAcademicYear] = useState("");
// // //   const [students, setStudents] = useState([]);
// // //   const [feePaidSuccess, setFeePaidSuccess] = useState("");

// // //   useEffect(() => {
// // //     fetchFees();
// // //   }, []);

// // //   const fetchFees = async () => {
// // //     const token = localStorage.getItem("token");
// // //     const res = await axios.get("http://localhost:5000/api/clerk/fee-master", {
// // //       headers: { Authorization: `Bearer ${token}` }
// // //     });
// // //     setFeeRows(res.data.fees);
// // //   };

// // //   const handleChange = e => {
// // //     setForm({
// // //       ...form,
// // //       [e.target.name]: e.target.name === "fee_amount" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value
// // //     });
// // //   };

// // //   const handleSubmit = async e => {
// // //     e.preventDefault();
// // //     setError("");
// // //     setSuccess("");
// // //     try {
// // //       const token = localStorage.getItem("token");
// // //       await axios.post("http://localhost:5000/api/clerk/fee-master", {
// // //         ...form,
// // //         fee_amount: form.fee_amount === "" ? null : String(Number(form.fee_amount))
// // //       }, {
// // //         headers: { Authorization: `Bearer ${token}` }
// // //       });
// // //       setSuccess("Fee updated.");
// // //       fetchFees();
// // //       setForm({ standard: "", academic_year: "", fee_amount: "" });
// // //     } catch (err) {
// // //       setError(err.response?.data?.error || "Could not update fee.");
// // //     }
// // //   };

// // //   // Fee Table Academic Year filter
// // //   const allYears = Array.from(new Set(feeRows.map(fee => fee.academic_year)));
// // //   const filteredFees = yearFilter
// // //     ? feeRows.filter(fee => fee.academic_year === yearFilter)
// // //     : feeRows;

// // //   // --- Student Fee Paid Table ---

// // //   // Fetch students for paid management
// // //   useEffect(() => {
// // //     const fetchStudents = async () => {
// // //       if (!feeStandard || !feeDivision || !feeAcademicYear) {
// // //         setStudents([]);
// // //         return;
// // //       }
// // //       const token = localStorage.getItem("token");
// // //       try {
// // //         const res = await axios.get("http://localhost:5000/api/clerk/students-for-fee", {
// // //           headers: { Authorization: `Bearer ${token}` },
// // //           params: {
// // //             standard: feeStandard,
// // //             division: feeDivision,
// // //             academic_year: feeAcademicYear
// // //           }
// // //         });
// // //         setStudents(res.data);
// // //       } catch (err) {
// // //         setStudents([]);
// // //       }
// // //     };
// // //     fetchStudents();
// // //   }, [feeStandard, feeDivision, feeAcademicYear]);

// // //   const markPaid = async (student_id) => {
// // //     const token = localStorage.getItem("token");
// // //     try {
// // //       await axios.post("http://localhost:5000/api/clerk/student-fee-status", {
// // //         student_id,
// // //         academic_year: feeAcademicYear,
// // //         paid_amount: 1,
// // //         remarks: "Paid"
// // //       }, {
// // //         headers: { Authorization: `Bearer ${token}` }
// // //       });
// // //       setFeePaidSuccess("Marked as paid!");
// // //       // Refetch students to update status
// // //       const res = await axios.get("http://localhost:5000/api/clerk/students-for-fee", {
// // //         headers: { Authorization: `Bearer ${token}` },
// // //         params: {
// // //           standard: feeStandard,
// // //           division: feeDivision,
// // //           academic_year: feeAcademicYear
// // //         }
// // //       });
// // //       setStudents(res.data);
// // //       setTimeout(() => setFeePaidSuccess(""), 1200);
// // //     } catch {
// // //       setFeePaidSuccess("Error updating payment!");
// // //     }
// // //   };

// // //   return (
// // //     <div>
// // //       <h2>Set Fees For Standard</h2>
// // //       {/* Fee Setting Form */}
// // //       <form onSubmit={handleSubmit} className="mb-4" style={{ display: 'flex', gap: 8, alignItems: "center" }}>
// // //         <select required name="standard" value={form.standard} onChange={handleChange}>
// // //           <option value="">Select Standard</option>
// // //           {standards.map(std => (
// // //             <option key={std} value={std}>{std}</option>
// // //           ))}
// // //         </select>
// // //         <input
// // //           name="academic_year"
// // //           placeholder="Academic Year (e.g. 2023-24)"
// // //           value={form.academic_year}
// // //           onChange={handleChange}
// // //           required
// // //         />
// // //         <input
// // //           name="fee_amount"
// // //           type="number"
// // //           placeholder="Fee Amount"
// // //           value={form.fee_amount}
// // //           onChange={handleChange}
// // //           required
// // //         />
// // //         <button type="submit" className="btn btn-primary">Set Fee</button>
// // //       </form>
// // //       {error && <div className="alert alert-danger">{error}</div>}
// // //       {success && <div className="alert alert-success">{success}</div>}

// // //       {/* Academic Year filter */}
// // //       <div style={{ marginBottom: 20, marginTop: 25 }}>
// // //         <label style={{ marginRight: 8 }}>Show fees for:</label>
// // //         <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
// // //           <option value="">All Years</option>
// // //           {allYears.map(year => (
// // //             <option key={year} value={year}>{year}</option>
// // //           ))}
// // //         </select>
// // //       </div>

// // //       {/* Fee Master Table */}
// // //       <h4>Fee Structure</h4>
// // //       <table className="table table-bordered">
// // //         <thead>
// // //           <tr>
// // //             <th>Standard</th>
// // //             <th>Academic Year</th>
// // //             <th>Fee Amount</th>
// // //           </tr>
// // //         </thead>
// // //         <tbody>
// // //           {filteredFees.map(fee => (
// // //             <tr key={fee.id}>
// // //               <td>{fee.standard}</td>
// // //               <td>{fee.academic_year}</td>
// // //               <td>{fee.fee_amount}</td>
// // //             </tr>
// // //           ))}
// // //         </tbody>
// // //       </table>

// // //       {/* --- Students Fee Paid Status Management --- */}
// // //       <hr />
// // //       <h3 style={{ marginTop: 40 }}>Manage Student Fees Paid Status</h3>
// // //       <div style={{display:"flex", gap:10, marginBottom:20}}>
// // //         <select value={feeStandard} onChange={e=>setFeeStandard(e.target.value)}>
// // //           <option value="">Select Standard</option>
// // //           {standards.map(std => <option key={std}>{std}</option>)}
// // //         </select>
// // //         <select value={feeDivision} onChange={e=>setFeeDivision(e.target.value)}>
// // //           <option value="">Select Division</option>
// // //           {divisions.map(div => <option key={div}>{div}</option>)}
// // //         </select>
// // //         <input
// // //           value={feeAcademicYear}
// // //           onChange={e=>setFeeAcademicYear(e.target.value)}
// // //           placeholder="Academic Year (e.g. 2024-25)"
// // //         />
// // //       </div>
// // //       {feePaidSuccess && <div className="alert alert-success">{feePaidSuccess}</div>}
// // //       <table className="table table-bordered">
// // //         <thead>
// // //           <tr>
// // //             <th>Name</th>
// // //             <th>Standard</th>
// // //             <th>Division</th>
// // //             <th>Paid?</th>
// // //             <th>Mark Paid</th>
// // //           </tr>
// // //         </thead>
// // //         <tbody>
// // //           {students.map(stu => (
// // //             <tr key={stu.student_id}>
// // //               <td>{stu.name}</td>
// // //               <td>{stu.standard}</td>
// // //               <td>{stu.division}</td>
// // //               <td>{stu.paid_status ? "Yes" : "No"}</td>
// // //               <td>
// // //                 {!stu.paid_status &&
// // //                   <button className="btn btn-success btn-sm"
// // //                     onClick={() => markPaid(stu.student_id)}>
// // //                     Mark Paid
// // //                   </button>
// // //                 }
// // //               </td>
// // //             </tr>
// // //           ))}
// // //         </tbody>
// // //       </table>
// // //     </div>
// // //   );
// // // }
// // import React, { useEffect, useState } from "react";
// // import axios from "axios";

// // export default function StudentFees() {
// //   const [feeRows, setFeeRows] = useState([]);
// //   const [standards] = useState(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
// //   const [divisions] = useState(["A", "B", "C", "D"]);
// //   const [form, setForm] = useState({ standard: "", academic_year: "", fee_amount: "" });
// //   const [error, setError] = useState("");
// //   const [success, setSuccess] = useState("");
// //   const [yearFilter, setYearFilter] = useState(""); // Academic year filter for fee display

// //   // Fee paid management states
// //   const [feeStandard, setFeeStandard] = useState("");
// //   const [feeDivision, setFeeDivision] = useState("");
// //   const [feeAcademicYear, setFeeAcademicYear] = useState("");
// //   const [students, setStudents] = useState([]);
// //   const [feePaidSuccess, setFeePaidSuccess] = useState("");

// //   useEffect(() => {
// //     fetchFees();
// //   }, []);

// //   const fetchFees = async () => {
// //     const token = localStorage.getItem("token");
// //     const res = await axios.get("http://localhost:5000/api/clerk/fee-master", {
// //       headers: { Authorization: `Bearer ${token}` }
// //     });
// //     setFeeRows(res.data.fees);
// //   };

// //   const handleChange = e => {
// //     setForm({
// //       ...form,
// //       [e.target.name]: e.target.name === "fee_amount" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value
// //     });
// //   };

// //   const handleSubmit = async e => {
// //     e.preventDefault();
// //     setError("");
// //     setSuccess("");
// //     try {
// //       const token = localStorage.getItem("token");
// //       await axios.post("http://localhost:5000/api/clerk/fee-master", {
// //         ...form,
// //         fee_amount: form.fee_amount === "" ? null : String(Number(form.fee_amount))
// //       }, {
// //         headers: { Authorization: `Bearer ${token}` }
// //       });
// //       setSuccess("Fee updated.");
// //       fetchFees();
// //       setForm({ standard: "", academic_year: "", fee_amount: "" });
// //     } catch (err) {
// //       setError(err.response?.data?.error || "Could not update fee.");
// //     }
// //   };

// //   // Academic year dropdown options from all unique years in feeRows
// //   const allYears = Array.from(new Set(feeRows.map(fee => fee.academic_year)));
// //   const filteredFees = yearFilter
// //     ? feeRows.filter(fee => fee.academic_year === yearFilter)
// //     : feeRows;

// //   // --- Student Fee Paid Table ---
// //   useEffect(() => {
// //     const fetchStudents = async () => {
// //       if (!feeStandard || !feeDivision || !feeAcademicYear) {
// //         setStudents([]);
// //         return;
// //       }
// //       const token = localStorage.getItem("token");
// //       try {
// //         const res = await axios.get("http://localhost:5000/api/clerk/students-for-fee", {
// //           headers: { Authorization: `Bearer ${token}` },
// //           params: {
// //             standard: feeStandard,
// //             division: feeDivision,
// //             academic_year: feeAcademicYear
// //           }
// //         });
// //         setStudents(res.data);
// //       } catch (err) {
// //         setStudents([]);
// //       }
// //     };
// //     fetchStudents();
// //   }, [feeStandard, feeDivision, feeAcademicYear]);

// //   const markPaid = async (student_id) => {
// //     const token = localStorage.getItem("token");
// //     try {
// //       await axios.post("http://localhost:5000/api/clerk/student-fee-status", {
// //         student_id,
// //         academic_year: feeAcademicYear,
// //         paid_amount: 1,
// //         remarks: "Paid"
// //       }, {
// //         headers: { Authorization: `Bearer ${token}` }
// //       });
// //       setFeePaidSuccess("Marked as paid!");
// //       // Refetch students to update status
// //       const res = await axios.get("http://localhost:5000/api/clerk/students-for-fee", {
// //         headers: { Authorization: `Bearer ${token}` },
// //         params: {
// //           standard: feeStandard,
// //           division: feeDivision,
// //           academic_year: feeAcademicYear
// //         }
// //       });
// //       setStudents(res.data);
// //       setTimeout(() => setFeePaidSuccess(""), 1200);
// //     } catch {
// //       setFeePaidSuccess("Error updating payment!");
// //     }
// //   };

// //   return (
// //     <div>
// //       <h2>Set Fees For Standard</h2>
// //       {/* Fee Setting Form */}
// //       <form onSubmit={handleSubmit} className="mb-4" style={{ display: 'flex', gap: 8, alignItems: "center" }}>
// //         <select required name="standard" value={form.standard} onChange={handleChange}>
// //           <option value="">Select Standard</option>
// //           {standards.map(std => (
// //             <option key={std} value={std}>{std}</option>
// //           ))}
// //         </select>
// //         <input
// //           name="academic_year"
// //           placeholder="Academic Year (e.g. 2023-24)"
// //           value={form.academic_year}
// //           onChange={handleChange}
// //           required
// //         />
// //         <input
// //           name="fee_amount"
// //           type="number"
// //           placeholder="Fee Amount"
// //           value={form.fee_amount}
// //           onChange={handleChange}
// //           required
// //         />
// //         <button type="submit" className="btn btn-primary">Set Fee</button>
// //       </form>
// //       {error && <div className="alert alert-danger">{error}</div>}
// //       {success && <div className="alert alert-success">{success}</div>}

// //       {/* Academic Year filter */}
// //       <div style={{ marginBottom: 20, marginTop: 25 }}>
// //         <label style={{ marginRight: 8 }}>Show fees for:</label>
// //         <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
// //           <option value="">All Years</option>
// //           {allYears.map(year => (
// //             <option key={year} value={year}>{year}</option>
// //           ))}
// //         </select>
// //       </div>

// //       {/* Fee Master Table */}
// //       <h4>Fee Structure</h4>
// //       <table className="table table-bordered">
// //         <thead>
// //           <tr>
// //             <th>Standard</th>
// //             <th>Academic Year</th>
// //             <th>Fee Amount</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //           {filteredFees.map(fee => (
// //             <tr key={fee.id}>
// //               <td>{fee.standard}</td>
// //               <td>{fee.academic_year}</td>
// //               <td>{fee.fee_amount}</td>
// //             </tr>
// //           ))}
// //         </tbody>
// //       </table>

// //       {/* --- Students Fee Paid Status Management --- */}
// //       <hr />
// //       <h3 style={{ marginTop: 40 }}>Manage Student Fees Paid Status</h3>
// //       <div style={{display:"flex", gap:10, marginBottom:20}}>
// //         <select value={feeStandard} onChange={e=>setFeeStandard(e.target.value)}>
// //           <option value="">Select Standard</option>
// //           {standards.map(std => <option key={std}>{std}</option>)}
// //         </select>
// //         <select value={feeDivision} onChange={e=>setFeeDivision(e.target.value)}>
// //           <option value="">Select Division</option>
// //           {divisions.map(div => <option key={div}>{div}</option>)}
// //         </select>
// //         {/* Academic year dropdown based on allYears */}
// //         <select value={feeAcademicYear} onChange={e => setFeeAcademicYear(e.target.value)}>
// //           <option value="">Select Academic Year</option>
// //           {allYears.map(year => (
// //             <option key={year} value={year}>{year}</option>
// //           ))}
// //         </select>
// //       </div>
// //       {feePaidSuccess && <div className="alert alert-success">{feePaidSuccess}</div>}
// //       <table className="table table-bordered">
// //         <thead>
// //           <tr>
// //             <th>Name</th>
// //             <th>Standard</th>
// //             <th>Division</th>
// //             <th>Paid?</th>
// //             <th>Mark Paid</th>
// //           </tr>
// //         </thead>
// //         <tbody>
// //   {students.map(stu => (
// //     <tr key={stu.student_id}>
// //       <td>{stu.full_name}</td>
// //       <td>{stu.standard}</td>
// //       <td>{stu.division}</td>
// //       <td>{stu.paid_status ? "Yes" : "No"}</td>
// //       <td>
// //         {!stu.paid_status && (
// //           <button className="btn btn-success btn-sm"
// //             onClick={() => markPaid(stu.student_id)}>
// //             Mark Paid
// //           </button>
// //         )}
// //       </td>
// //     </tr>
// //   ))}
// // </tbody>

// //       </table>
// //     </div>
// //   );
// // }
// import React, { useEffect, useState } from "react";
// import axios from "axios";

// export default function StudentFees() {
//   const [feeRows, setFeeRows] = useState([]);
//   const [standards] = useState(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
//   const [divisions] = useState(["A", "B", "C", "D"]);
//   const [form, setForm] = useState({ standard: "", academic_year: "", fee_amount: "" });
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [yearFilter, setYearFilter] = useState(""); // Academic year filter for fee display

//   // Fee paid management
//   const [feeStandard, setFeeStandard] = useState("");
//   const [feeDivision, setFeeDivision] = useState("");
//   const [feeAcademicYear, setFeeAcademicYear] = useState("");
//   const [students, setStudents] = useState([]);
//   const [feePaidSuccess, setFeePaidSuccess] = useState("");
//   const [feeInputs, setFeeInputs] = useState({}); // { [student_id]: {paid_amount, paid_on, remarks} }

//   useEffect(() => {
//     fetchFees();
//   }, []);

//   const fetchFees = async () => {
//     const token = localStorage.getItem("token");
//     const res = await axios.get("http://localhost:5000/api/clerk/fee-master", {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     setFeeRows(res.data.fees);
//   };

//   const handleChange = e => {
//     setForm({
//       ...form,
//       [e.target.name]: e.target.name === "fee_amount" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value
//     });
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");
//     try {
//       const token = localStorage.getItem("token");
//       await axios.post("http://localhost:5000/api/clerk/fee-master", {
//         ...form,
//         fee_amount: form.fee_amount === "" ? null : String(Number(form.fee_amount))
//       }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setSuccess("Fee updated.");
//       fetchFees();
//       setForm({ standard: "", academic_year: "", fee_amount: "" });
//     } catch (err) {
//       setError(err.response?.data?.error || "Could not update fee.");
//     }
//   };

//   // Academic year dropdown options
//   const allYears = Array.from(new Set(feeRows.map(fee => fee.academic_year)));
//   const filteredFees = yearFilter
//     ? feeRows.filter(fee => fee.academic_year === yearFilter)
//     : feeRows;

//   // Fetch students for selected Standard/Division/Year
//   useEffect(() => {
//     const fetchStudents = async () => {
//       if (!feeStandard || !feeDivision || !feeAcademicYear) {
//         setStudents([]);
//         return;
//       }
//       const token = localStorage.getItem("token");
//       try {
//         const res = await axios.get("http://localhost:5000/api/clerk/students-for-fee", {
//           headers: { Authorization: `Bearer ${token}` },
//           params: {
//             standard: feeStandard,
//             division: feeDivision,
//             academic_year: feeAcademicYear
//           }
//         });
//         setStudents(res.data);
//       } catch (err) {
//         setStudents([]);
//       }
//     };
//     fetchStudents();
//   }, [feeStandard, feeDivision, feeAcademicYear]);

//   // Input handlers for paid fields
//   const handleFeeInput = (student_id, field, value) => {
//     setFeeInputs(prev => ({
//       ...prev,
//       [student_id]: {
//         ...prev[student_id],
//         [field]: value
//       }
//     }));
//   };
// const [studentFeeFilter, setStudentFeeFilter] = useState("all");
//   const markPaid = async (student_id) => {
//     const { paid_amount, paid_on, remarks } = feeInputs[student_id] || {};
//     if (!paid_amount || !paid_on) {
//       setFeePaidSuccess("Amount and date required.");
//       return;
//     }
//     const token = localStorage.getItem("token");
//     try {
//       await axios.post("http://localhost:5000/api/clerk/student-fee-status", {
//         student_id,
//         academic_year: feeAcademicYear,
//         paid_amount,
//         paid_on,
//         remarks
//       }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setFeePaidSuccess("Marked as paid!");
//       // Refetch students to update status
//       const res = await axios.get("http://localhost:5000/api/clerk/students-for-fee", {
//         headers: { Authorization: `Bearer ${token}` },
//         params: {
//           standard: feeStandard,
//           division: feeDivision,
//           academic_year: feeAcademicYear
//         }
//       });
//       setStudents(res.data);
//       setFeeInputs(prev => {
//         const next = { ...prev };
//         delete next[student_id];
//         return next;
//       });
//       setTimeout(() => setFeePaidSuccess(""), 1200);
//     } catch {
//       setFeePaidSuccess("Error updating payment!");
//     }
//   };

//   return (
//     <div>
//       <h2>Set Fees For Standard</h2>
//       {/* Fee Setting Form */}
//       <form onSubmit={handleSubmit} className="mb-4" style={{ display: 'flex', gap: 8, alignItems: "center" }}>
//         <select required name="standard" value={form.standard} onChange={handleChange}>
//           <option value="">Select Standard</option>
//           {standards.map(std => (
//             <option key={std} value={std}>{std}</option>
//           ))}
//         </select>
//         <input
//           name="academic_year"
//           placeholder="Academic Year (e.g. 2023-24)"
//           value={form.academic_year}
//           onChange={handleChange}
//           required
//         />
//         <input
//           name="fee_amount"
//           type="number"
//           placeholder="Fee Amount"
//           value={form.fee_amount}
//           onChange={handleChange}
//           required
//         />
//         <button type="submit" className="btn btn-primary">Set Fee</button>
//       </form>
//       {error && <div className="alert alert-danger">{error}</div>}
//       {success && <div className="alert alert-success">{success}</div>}

//       {/* Academic Year filter */}
//       <div style={{ marginBottom: 20, marginTop: 25 }}>
//         <label style={{ marginRight: 8 }}>Show fees for:</label>
//         <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
//           <option value="">All Years</option>
//           {allYears.map(year => (
//             <option key={year} value={year}>{year}</option>
//           ))}
//         </select>
//       </div>

//       {/* Fee Master Table */}
//       <h4>Fee Structure</h4>
//       <table className="table table-bordered">
//         <thead>
//           <tr>
//             <th>Standard</th>
//             <th>Academic Year</th>
//             <th>Fee Amount</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredFees.map(fee => (
//             <tr key={fee.id}>
//               <td>{fee.standard}</td>
//               <td>{fee.academic_year}</td>
//               <td>{fee.fee_amount}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* --- Students Fee Paid Status Management --- */}
//       <hr />
//       <h3 style={{ marginTop: 40 }}>Manage Student Fees Paid Status</h3>
//       <div style={{display:"flex", gap:10, marginBottom:20}}>
//         <select value={feeStandard} onChange={e=>setFeeStandard(e.target.value)}>
//           <option value="">Select Standard</option>
//           {standards.map(std => <option key={std}>{std}</option>)}
//         </select>
//         <select value={feeDivision} onChange={e=>setFeeDivision(e.target.value)}>
//           <option value="">Select Division</option>
//           {divisions.map(div => <option key={div}>{div}</option>)}
//         </select>
//         <select value={feeAcademicYear} onChange={e => setFeeAcademicYear(e.target.value)}>
//           <option value="">Select Academic Year</option>
//           {allYears.map(year => (
//             <option key={year} value={year}>{year}</option>
//           ))}
//         </select>
//       </div>
//       {feePaidSuccess && <div className="alert alert-success">{feePaidSuccess}</div>}
//       <table className="table table-bordered">
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Standard</th>
//             <th>Division</th>
//             <th>Paid?</th>
//             <th>Paid Amount</th>
//             <th>Paid On</th>
//             <th>Remarks</th>
//             <th>Mark Paid</th>
//           </tr>
//         </thead>
//         <tbody>
//           {students.map(stu => (
//             <tr key={stu.student_id}>
//               <td>{stu.full_name}</td>
//               <td>{stu.standard}</td>
//               <td>{stu.division}</td>
//               <td>{stu.paid_status ? "Yes" : "No"}</td>
//               <td>
//                 {!stu.paid_status &&
//                   <input
//                     type="number"
//                     min={0}
//                     value={feeInputs[stu.student_id]?.paid_amount || ""}
//                     onChange={e=>handleFeeInput(stu.student_id, 'paid_amount', e.target.value)}
//                     placeholder="Amount"
//                     style={{width:80}}
//                   />
//                 }
//               </td>
//               <td>
//                 {!stu.paid_status &&
//                   <input
//                     type="date"
//                     value={feeInputs[stu.student_id]?.paid_on || ""}
//                     onChange={e => handleFeeInput(stu.student_id, 'paid_on', e.target.value)}
//                     style={{width:130}}
//                   />
//                 }
//               </td>
//               <td>
//                 {!stu.paid_status &&
//                   <input
//                     type="text"
//                     value={feeInputs[stu.student_id]?.remarks || ""}
//                     onChange={e => handleFeeInput(stu.student_id, 'remarks', e.target.value)}
//                     placeholder="Remarks"
//                   />
//                 }
//               </td>
//               <td>
//                 {!stu.paid_status &&
//                   <button className="btn btn-success btn-sm"
//                     onClick={() => markPaid(stu.student_id)}>
//                     Mark Paid
//                   </button>
//                 }
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function StudentFees() {
  const [feeRows, setFeeRows] = useState([]);
  const [standards] = useState(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
  const [divisions] = useState(["A", "B", "C", "D"]);
  const [form, setForm] = useState({ standard: "", academic_year: "", fee_amount: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const [feeStandard, setFeeStandard] = useState("");
  const [feeDivision, setFeeDivision] = useState("");
  const [feeAcademicYear, setFeeAcademicYear] = useState("");
  const [students, setStudents] = useState([]);
  const [feePaidSuccess, setFeePaidSuccess] = useState("");
  const [feeInputs, setFeeInputs] = useState({});
  const [studentFeeFilter, setStudentFeeFilter] = useState("all"); // new filter state

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/clerk/fee-master", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setFeeRows(res.data.fees);
  };

  const handleChange = e => {
    setForm({
      ...form,
      [e.target.name]: e.target.name === "fee_amount" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/clerk/fee-master", {
        ...form,
        fee_amount: form.fee_amount === "" ? null : String(Number(form.fee_amount))
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Fee updated.");
      fetchFees();
      setForm({ standard: "", academic_year: "", fee_amount: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Could not update fee.");
    }
  };

  const allYears = Array.from(new Set(feeRows.map(fee => fee.academic_year)));
  const filteredFees = yearFilter
    ? feeRows.filter(fee => fee.academic_year === yearFilter)
    : feeRows;

  useEffect(() => {
    const fetchStudents = async () => {
      if (!feeStandard || !feeDivision || !feeAcademicYear) {
        setStudents([]);
        return;
      }
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get("http://localhost:5000/api/clerk/students-for-fee", {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            standard: feeStandard,
            division: feeDivision,
            academic_year: feeAcademicYear
          }
        });
        setStudents(res.data);
      } catch (err) {
        setStudents([]);
      }
    };
    fetchStudents();
  }, [feeStandard, feeDivision, feeAcademicYear]);

  const handleFeeInput = (student_id, field, value) => {
    setFeeInputs(prev => ({
      ...prev,
      [student_id]: {
        ...prev[student_id],
        [field]: value
      }
    }));
  };

  const markPaid = async (student_id) => {
    const { paid_amount, paid_on, remarks } = feeInputs[student_id] || {};
    if (!paid_amount || !paid_on) {
      setFeePaidSuccess("Amount and date required.");
      return;
    }
    const token = localStorage.getItem("token");
    try {
      await axios.post("http://localhost:5000/api/clerk/student-fee-status", {
        student_id,
        academic_year: feeAcademicYear,
        paid_amount,
        paid_on,
        remarks
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeePaidSuccess("Marked as paid!");
      // Refetch students to update status
      const res = await axios.get("http://localhost:5000/api/clerk/students-for-fee", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          standard: feeStandard,
          division: feeDivision,
          academic_year: feeAcademicYear
        }
      });
      setStudents(res.data);
      setFeeInputs(prev => {
        const next = { ...prev };
        delete next[student_id];
        return next;
      });
      setTimeout(() => setFeePaidSuccess(""), 1200);
    } catch {
      setFeePaidSuccess("Error updating payment!");
    }
  };

  // For filter buttons
  const filteredStudents = students.filter(stu => {
    if (studentFeeFilter === "all") return true;
    if (studentFeeFilter === "paid") return stu.paid_status;
    if (studentFeeFilter === "unpaid") return !stu.paid_status;
    return true;
  });

  return (
    <div>
      <h2>Set Fees For Standard</h2>
      <form onSubmit={handleSubmit} className="mb-4" style={{ display: 'flex', gap: 8, alignItems: "center" }}>
        <select required name="standard" value={form.standard} onChange={handleChange}>
          <option value="">Select Standard</option>
          {standards.map(std => (
            <option key={std} value={std}>{std}</option>
          ))}
        </select>
        <input
          name="academic_year"
          placeholder="Academic Year (e.g. 2023-24)"
          value={form.academic_year}
          onChange={handleChange}
          required
        />
        <input
          name="fee_amount"
          type="number"
          placeholder="Fee Amount"
          value={form.fee_amount}
          onChange={handleChange}
          required
        />
        <button type="submit" className="btn btn-primary">Set Fee</button>
      </form>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div style={{ marginBottom: 20, marginTop: 25 }}>
        <label style={{ marginRight: 8 }}>Show fees for:</label>
        <select value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
          <option value="">All Years</option>
          {allYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <h4>Fee Structure</h4>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Standard</th>
            <th>Academic Year</th>
            <th>Fee Amount</th>
          </tr>
        </thead>
        <tbody>
          {filteredFees.map(fee => (
            <tr key={fee.id}>
              <td>{fee.standard}</td>
              <td>{fee.academic_year}</td>
              <td>{fee.fee_amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr />
      <h3 style={{ marginTop: 40 }}>Manage Student Fees Paid Status</h3>
      <div style={{display:"flex", gap:10, marginBottom:20}}>
        <select value={feeStandard} onChange={e=>setFeeStandard(e.target.value)}>
          <option value="">Select Standard</option>
          {standards.map(std => <option key={std}>{std}</option>)}
        </select>
        <select value={feeDivision} onChange={e=>setFeeDivision(e.target.value)}>
          <option value="">Select Division</option>
          {divisions.map(div => <option key={div}>{div}</option>)}
        </select>
        <select value={feeAcademicYear} onChange={e => setFeeAcademicYear(e.target.value)}>
          <option value="">Select Academic Year</option>
          {allYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <div style={{marginBottom: 10}}>
        <button
          className="btn btn-outline-primary btn-sm"
          style={{marginRight: 5}}
          onClick={() => setStudentFeeFilter("all")}
          disabled={studentFeeFilter === "all"}
        >
          All Students
        </button>
        <button
          className="btn btn-outline-success btn-sm"
          style={{marginRight: 5}}
          onClick={() => setStudentFeeFilter("paid")}
          disabled={studentFeeFilter === "paid"}
        >
          Paid Students
        </button>
        <button
          className="btn btn-outline-danger btn-sm"
          onClick={() => setStudentFeeFilter("unpaid")}
          disabled={studentFeeFilter === "unpaid"}
        >
          Unpaid Students
        </button>
      </div>
      {feePaidSuccess && <div className="alert alert-success">{feePaidSuccess}</div>}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Standard</th>
            <th>Division</th>
            <th>Paid?</th>
            <th>Paid Amount</th>
            <th>Paid On</th>
            <th>Remarks</th>
            <th>Mark Paid</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map(stu => (
            <tr key={stu.student_id}>
              <td>{stu.full_name}</td>
              <td>{stu.standard}</td>
              <td>{stu.division}</td>
              <td>{stu.paid_status ? "Yes" : "No"}</td>
              {stu.paid_status ? (
                <>
                  <td>{stu.paid_amount}</td>
                  <td>{stu.paid_on ? new Date(stu.paid_on).toLocaleDateString() : ""}</td>
                  <td>{stu.remarks || ""}</td>
                  <td></td>
                </>
              ) : (
                <>
                  <td>
                    <input
                      type="number"
                      min={0}
                      value={feeInputs[stu.student_id]?.paid_amount || ""}
                      onChange={e=>handleFeeInput(stu.student_id, 'paid_amount', e.target.value)}
                      placeholder="Amount"
                      style={{width:80}}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={feeInputs[stu.student_id]?.paid_on || ""}
                      onChange={e => handleFeeInput(stu.student_id, 'paid_on', e.target.value)}
                      style={{width:130}}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={feeInputs[stu.student_id]?.remarks || ""}
                      onChange={e => handleFeeInput(stu.student_id, 'remarks', e.target.value)}
                      placeholder="Remarks"
                    />
                  </td>
                  <td>
                    <button className="btn btn-success btn-sm"
                      onClick={() => markPaid(stu.student_id)}>
                      Mark Paid
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
