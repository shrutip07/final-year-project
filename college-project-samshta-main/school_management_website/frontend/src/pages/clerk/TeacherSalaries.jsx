// import React, { useEffect, useState } from "react";
// import axios from "axios";

// export default function TeacherSalaryManager({ unitId }) {
//   const [teachers, setTeachers] = useState([]);
//   const [editRow, setEditRow] = useState({});
//   const [success, setSuccess] = useState("");

//   useEffect(() => {
//     fetchSalaries();
//   }, [unitId]);

//   const fetchSalaries = async () => {
//   const token = localStorage.getItem("token");
//   const res = await axios.get("http://localhost:5000/api/clerk/teacher-salaries", {
//     headers: { Authorization: `Bearer ${token}` }
//     // No params!
//   });
//   setTeachers(res.data);
// };

//   const handleChange = (id, field, value) => {
//     setEditRow(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
//   };

//   const handleSave = async (t) => {
//     const tr = editRow[t.staff_id] || {};
//     const payload = {
//       staff_id: t.staff_id,
//       unit_id: unitId,
//       amount: tr.amount || t.amount,
//       effective_from: tr.effective_from || t.effective_from,
//       remarks: tr.remarks || t.remarks,
//     };
//     const token = localStorage.getItem("token");
//     await axios.post("http://localhost:5000/api/clerk/teacher-salary", payload, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     setSuccess("Salary saved!");
//     setTimeout(() => setSuccess(""), 1000);
//     setEditRow({});
//     fetchSalaries();
//   };

//   return (
//     <div>
//       <h3>Assign/Update Salary for Teachers</h3>
//       {success && <div className="alert alert-success">{success}</div>}
//       <table className="table table-bordered">
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Current Salary</th>
//             <th>Effective From</th>
//             <th>Remarks</th>
//             <th>Assign/Update</th>
//           </tr>
//         </thead>
//         <tbody>
//           {teachers.map(t => (
//             <tr key={t.staff_id}>
//               <td>{t.full_name}</td>
//               <td>
//                 <input
//                   type="number"
//                   value={editRow[t.staff_id]?.amount ?? t.amount ?? ""}
//                   placeholder="Amount"
//                   onChange={e => handleChange(t.staff_id, "amount", e.target.value)}
//                 />
//               </td>
//               <td>
//                 <input
//                   type="date"
//                   value={editRow[t.staff_id]?.effective_from ?? (t.effective_from ? t.effective_from.slice(0,10) : "")}
//                   onChange={e => handleChange(t.staff_id, "effective_from", e.target.value)}
//                 />
//               </td>
//               <td>
//                 <input
//                   type="text"
//                   value={editRow[t.staff_id]?.remarks ?? t.remarks ?? ""}
//                   onChange={e => handleChange(t.staff_id, "remarks", e.target.value)}
//                   placeholder="Remarks"
//                 />
//               </td>
//               <td>
//                 <button
//                   className="btn btn-success btn-sm"
//                   onClick={() => handleSave(t)}
//                 >
//                   Save Salary
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

//sallary assignment working 

// import React, { useEffect, useState } from "react";
// import axios from "axios";

// export default function TeacherSalaryManager() {
//   const [teachers, setTeachers] = useState([]);
//   const [editRow, setEditRow] = useState({});
//   const [success, setSuccess] = useState("");
//   const [salaryHistory, setSalaryHistory] = useState({});
//   const [showHistoryFor, setShowHistoryFor] = useState(null);

//   useEffect(() => {
//     fetchSalaries();
//   }, []);

//   const fetchSalaries = async () => {
//     const token = localStorage.getItem("token");
//     const res = await axios.get("http://localhost:5000/api/clerk/teacher-salaries", {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     setTeachers(res.data);
//   };

//   const fetchSalaryHistory = async (staff_id) => {
//     const token = localStorage.getItem("token");
//     const res = await axios.get("http://localhost:5000/api/clerk/teacher-salary-history", {
//       headers: { Authorization: `Bearer ${token}` },
//       params: { staff_id }
//     });
//     setSalaryHistory(prev => ({ ...prev, [staff_id]: res.data }));
//     setShowHistoryFor(staff_id);
//   };

//   const handleChange = (id, field, value) => {
//     setEditRow(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
//   };

//   const handleSave = async (t) => {
//     const tr = editRow[t.staff_id] || {};
//     const token = localStorage.getItem("token");

//     // Build request payload (do not include unit_id)
//     const payload = {
//       staff_id: t.staff_id,
//       amount: tr.amount ?? t.amount,
//       effective_from: tr.effective_from ?? t.effective_from ?? new Date().toISOString().slice(0,10),
//       remarks: tr.remarks ?? t.remarks ?? ""
//     };

//     // For debugging if you get 400:
//     // console.log("POST-ing salary:", payload);

//     await axios.post("http://localhost:5000/api/clerk/teacher-salary", payload, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     setSuccess("Salary saved!");
//     setTimeout(() => setSuccess(""), 1000);
//     setEditRow({});
//     fetchSalaries();
//   };

//   return (
//     <div>
//       <h3>Assign/Update Salary for Teachers</h3>
//       {success && <div className="alert alert-success">{success}</div>}
//       <table className="table table-bordered">
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Current Salary</th>
//             <th>Effective From</th>
//             <th>Remarks</th>
//             <th>History</th>
//             <th>Assign/Update</th>
//           </tr>
//         </thead>
//         <tbody>
//           {teachers.map(t => (
//             <tr key={t.staff_id}>
//               <td>{t.full_name}</td>
//               <td>
//                 <input
//                   type="number"
//                   value={editRow[t.staff_id]?.amount ?? t.amount ?? ""}
//                   placeholder="Amount"
//                   onChange={e => handleChange(t.staff_id, "amount", e.target.value)}
//                 />
//               </td>
//               <td>
//                 <input
//                   type="date"
//                   value={
//                     editRow[t.staff_id]?.effective_from ??
//                     (t.effective_from ? t.effective_from.slice(0, 10) : "")
//                   }
//                   onChange={e =>
//                     handleChange(t.staff_id, "effective_from", e.target.value)
//                   }
//                 />
//               </td>
//               <td>
//                 <input
//                   type="text"
//                   value={editRow[t.staff_id]?.remarks ?? t.remarks ?? ""}
//                   onChange={e => handleChange(t.staff_id, "remarks", e.target.value)}
//                   placeholder="Remarks"
//                 />
//               </td>
//               <td>
//                 <button
//                   className="btn btn-info btn-sm"
//                   onClick={() => fetchSalaryHistory(t.staff_id)}
//                 >
//                   View
//                 </button>
//                 {showHistoryFor === t.staff_id && salaryHistory[t.staff_id] && (
//                   <div style={{ background: "#eee", marginTop: '6px', padding: '6px' }}>
//                     <table className="table table-sm">
//                       <thead>
//                         <tr>
//                           <th>Amount</th>
//                           <th>From</th>
//                           <th>To</th>
//                           <th>Remarks</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {salaryHistory[t.staff_id].map(hist => (
//                           <tr key={hist.effective_from + hist.amount}>
//                             <td>{hist.amount}</td>
//                             <td>{hist.effective_from?.slice(0,10)}</td>
//                             <td>{hist.effective_to ? hist.effective_to.slice(0,10) : "Current"}</td>
//                             <td>{hist.remarks || ""}</td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </td>
//               <td>
//                 <button
//                   className="btn btn-success btn-sm"
//                   onClick={() => handleSave(t)}
//                 >
//                   Save Salary
//                 </button>
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

const monthsArr = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export default function TeacherSalaryManagerAndPayments() {
  // ----- Salary Assignment -----
  const [teachers, setTeachers] = useState([]);
  const [editRow, setEditRow] = useState({});
  const [success, setSuccess] = useState("");
  const [salaryHistory, setSalaryHistory] = useState({});
  const [showHistoryFor, setShowHistoryFor] = useState(null);

  // ----- Monthly Payments -----
  const [year, setYear] = useState(new Date().getFullYear());
  const [salaryGrid, setSalaryGrid] = useState([]);
  const [editPay, setEditPay] = useState({}); // { staff_id: { 1: { amount, paid_on, remarks }, ... } }
  const [payMsg, setPayMsg] = useState("");
  const [payErr, setPayErr] = useState("");
  const [pendingOnly, setPendingOnly] = useState(false);

  // --- Assignment and History ---
  useEffect(() => {
    fetchSalaries();
  }, []);
  const fetchSalaries = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/clerk/teacher-salaries", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTeachers(res.data);
  };
  const fetchSalaryHistory = async (staff_id) => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/clerk/teacher-salary-history", {
      headers: { Authorization: `Bearer ${token}` },
      params: { staff_id }
    });
    setSalaryHistory(prev => ({ ...prev, [staff_id]: res.data }));
    setShowHistoryFor(staff_id);
  };
  const handleChange = (id, field, value) => {
    setEditRow(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };
  const handleSave = async (t) => {
    const tr = editRow[t.staff_id] || {};
    const token = localStorage.getItem("token");
    const payload = {
      staff_id: t.staff_id,
      amount: tr.amount ?? t.amount,
      effective_from: tr.effective_from ?? t.effective_from ?? new Date().toISOString().slice(0,10),
      remarks: tr.remarks ?? t.remarks ?? ""
    };
    await axios.post("http://localhost:5000/api/clerk/teacher-salary", payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setSuccess("Salary saved!");
    setTimeout(() => setSuccess(""), 1000);
    setEditRow({});
    fetchSalaries();
  };

  // --- Monthly Payments ---
  useEffect(() => {
    fetchGrid(year);
  }, [year]);
  const fetchGrid = async (yr) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/clerk/teacher-salary-grid", {
        headers: { Authorization: `Bearer ${token}` },
        params: { year: yr }
      });
      setSalaryGrid(res.data.staff || []);
    } catch {
      setSalaryGrid([]);
    }
  };
  const handleEditPay = (staff_id, month, field, value) => {
    setEditPay(prev => ({
      ...prev,
      [staff_id]: {
        ...(prev[staff_id] || {}),
        [month]: {
          ...(prev[staff_id]?.[month] || {}),
          [field]: value
        }
      }
    }));
  };
const paySalary = async (staff_id, monthObj) => {
  const month = monthObj.month;
  const cell = editPay[staff_id]?.[month] || {};
  const amount = cell.amount || monthObj.amount || "";
  const paid_on = cell.paid_on || "";

  if (!amount || !paid_on) {
    setPayErr("Amount and Paid On date both required.");
    setTimeout(() => setPayErr(""), 1500);
    return;
  }

  // Build payload here!
  const payload = {
    staff_id,
    year,
    month,
    amount,
    paid_on,
    remarks: cell.remarks || ""
  };

  try {
    const token = localStorage.getItem("token");
    await axios.post("http://localhost:5000/api/clerk/teacher-salary-pay", payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPayMsg("Salary marked as paid!");
    setTimeout(() => setPayMsg(""), 1200);
    setEditPay(prev => {
      const next = { ...prev };
      if (next[staff_id]) delete next[staff_id][month];
      return next;
    });
    fetchGrid(year); // Refresh grid
  } catch {
    setPayErr("Failed to update salary status!");
    setTimeout(() => setPayErr(""), 1400);
  }
};


  const handleYearChange = e => setYear(Number(e.target.value));
  const togglePending = () => setPendingOnly(v => !v);

  // Year select helper
  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 2; y <= currentYear + 2; ++y) yearOptions.push(y);
  const filteredGrid = pendingOnly
    ? salaryGrid.filter(staff => staff.payments.some(m => !m.paid_on))
    : salaryGrid;

  // --- Render ---
  return (
    <div>
      {/* ---- Assignment ---- */}
      <h3 style={{ marginBottom: 16 }}>Assign/Update Teacher Salary</h3>
      {success && <div className="alert alert-success">{success}</div>}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Current Salary</th>
            <th>Effective From</th>
            <th>Remarks</th>
            <th>History</th>
            <th>Assign/Update</th>
          </tr>
        </thead>
        <tbody>
          {teachers.map(t => (
            <tr key={t.staff_id}>
              <td>{t.full_name}</td>
              <td>
                <input
                  type="number"
                  value={editRow[t.staff_id]?.amount ?? t.amount ?? ""}
                  placeholder="Amount"
                  onChange={e => handleChange(t.staff_id, "amount", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="date"
                  value={
                    editRow[t.staff_id]?.effective_from ??
                    (t.effective_from ? t.effective_from.slice(0, 10) : "")
                  }
                  onChange={e =>
                    handleChange(t.staff_id, "effective_from", e.target.value)
                  }
                />
              </td>
              <td>
                <input
                  type="text"
                  value={editRow[t.staff_id]?.remarks ?? t.remarks ?? ""}
                  onChange={e => handleChange(t.staff_id, "remarks", e.target.value)}
                  placeholder="Remarks"
                />
              </td>
              <td>
                <button
                  className="btn btn-info btn-sm"
                  onClick={() => fetchSalaryHistory(t.staff_id)}
                >
                  View
                </button>
                {showHistoryFor === t.staff_id && salaryHistory[t.staff_id] && (
                  <div style={{ background: "#eee", marginTop: '6px', padding: '6px' }}>
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Amount</th>
                          <th>From</th>
                          <th>To</th>
                          <th>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {salaryHistory[t.staff_id].map(hist => (
                          <tr key={hist.effective_from + hist.amount}>
                            <td>{hist.amount}</td>
                            <td>{hist.effective_from?.slice(0,10)}</td>
                            <td>{hist.effective_to ? hist.effective_to.slice(0,10) : "Current"}</td>
                            <td>{hist.remarks || ""}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </td>
              <td>
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleSave(t)}
                >
                  Save Salary
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <hr />

      {/* ---- Monthly Payments ---- */}
      <h3>Teacher Monthly Salary Payments</h3>
      <div style={{ marginBottom: 12 }}>
        Year:
        <select value={year} onChange={handleYearChange} style={{ marginLeft: 8, marginRight: 16 }}>
          {yearOptions.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button
          className={`btn btn-sm ${pendingOnly ? 'btn-danger' : 'btn-secondary'}`}
          onClick={togglePending}
        >
          {pendingOnly ? "Show All" : "Show Only Pending"}
        </button>
        {payMsg && <span className="alert alert-success mx-3">{payMsg}</span>}
        {payErr && <span className="alert alert-danger mx-3">{payErr}</span>}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="table table-bordered table-sm align-middle">
          <thead>
            <tr>
              <th rowSpan={2}>Teacher</th>
              {monthsArr.map((m, i) => <th key={m} colSpan={3}>{m}</th>)}
            </tr>
            <tr>
              {monthsArr.map((m, idx) => [
                <th key={m + "-status"}>Status</th>,
                <th key={m + "-amount"}>Amount</th>,
                <th key={m + "-action"}>Action</th>
              ])}
            </tr>
          </thead>
          <tbody>
            {filteredGrid.map(staff => (
              <tr key={staff.staff_id}>
                <td style={{ whiteSpace: "nowrap" }}>{staff.full_name}</td>
                {staff.payments.map(monthObj => {
                  if (monthObj.paid_on) {
                    return [
                      <td key={"s-" + monthObj.month} style={{ background: '#dff0d8', minWidth: 80 }}>
                        Paid<br />
                        {new Date(monthObj.paid_on).toLocaleDateString()}
                        <br /><span style={{ fontSize: 11, color: "#666" }}>{monthObj.remarks}</span>
                      </td>,
                      <td key={"a-" + monthObj.month}>{monthObj.amount}</td>,
                      <td key={"x-" + monthObj.month}></td>
                    ];
                  } else {
                    const v = editPay[staff.staff_id]?.[monthObj.month] || {};
                    return [
                      <td key={"s-" + monthObj.month} style={{ background: '#f9dcdc', minWidth: 80 }}>Pending</td>,
                      <td key={"a-" + monthObj.month}>
                        <input
                          type="number"
                          style={{ width: 80 }}
                          value={v.amount || monthObj.amount || ""}
                          placeholder="Amount"
                          onChange={e => handleEditPay(staff.staff_id, monthObj.month, "amount", e.target.value)}
                        />
                        <br />
                        <input
                          type="date"
                          style={{ width: 110 }}
                          value={v.paid_on || ""}
                          onChange={e => handleEditPay(staff.staff_id, monthObj.month, "paid_on", e.target.value)}
                        />
                        <br />
                        <input
                          type="text"
                          style={{ width: 110 }}
                          placeholder="Remarks"
                          value={v.remarks || ""}
                          onChange={e => handleEditPay(staff.staff_id, monthObj.month, "remarks", e.target.value)}
                        />
                      </td>,
                      <td key={"x-" + monthObj.month}>
                        <button className="btn btn-success btn-sm"
                          onClick={() => paySalary(staff.staff_id, monthObj)}
                           disabled={!v.amount || !v.paid_on}
                        >
                          Mark Paid
                        </button>
                      </td>
                    ];
                  }
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: "90%", marginTop: 16 }}>
        <b>Legend:</b> <span style={{ background: '#dff0d8', padding: '2px 6px' }}>Paid</span>,
        <span style={{ background: '#f9dcdc', padding: '2px 6px', marginLeft: 6 }}>Pending</span>
      </div>
    </div>
  );
}
