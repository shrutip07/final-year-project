// src/pages/clerk/TeacherSalaries.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import Toolbar from "../../components/admin/Toolbar";

const monthsArr = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function TeacherSalaries() {
  const [teachers, setTeachers] = useState([]);
  const [editRow, setEditRow] = useState({});
  const [success, setSuccess] = useState("");
  const [salaryHistory, setSalaryHistory] = useState({});
  const [showHistoryFor, setShowHistoryFor] = useState(null);

  const [year, setYear] = useState(new Date().getFullYear());
  const [salaryGrid, setSalaryGrid] = useState([]);
  const [editPay, setEditPay] = useState({});
  const [payMsg, setPayMsg] = useState("");
  const [payErr, setPayErr] = useState("");
  const [pendingOnly, setPendingOnly] = useState(false);

  useEffect(() => {
    fetchSalaries();
  }, []);

  useEffect(() => {
    fetchGrid(year);
  }, [year]);

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
    setSalaryHistory((prev) => ({ ...prev, [staff_id]: res.data }));
    setShowHistoryFor(showHistoryFor === staff_id ? null : staff_id);
  };

  const handleChange = (id, field, value) => {
    setEditRow((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const handleSave = async (t) => {
    const tr = editRow[t.staff_id] || {};
    const token = localStorage.getItem("token");
    const payload = {
      staff_id: t.staff_id,
      amount: tr.amount ?? t.amount,
      effective_from: tr.effective_from ?? t.effective_from ?? new Date().toISOString().slice(0, 10),
      remarks: tr.remarks ?? t.remarks ?? ""
    };

    await axios.post("http://localhost:5000/api/clerk/teacher-salary", payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setSuccess("Salary updated successfully! ✅");
    setTimeout(() => setSuccess(""), 2000);
    setEditRow({});
    fetchSalaries();
  };

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
    setEditPay((prev) => ({
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
      setTimeout(() => setPayErr(""), 2000);
      return;
    }

    const payload = { staff_id, year, month, amount, paid_on, remarks: cell.remarks || "" };

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/clerk/teacher-salary-pay", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPayMsg("Payment recorded! ✅");
      setTimeout(() => setPayMsg(""), 2000);

      setEditPay((prev) => {
        const next = { ...prev };
        if (next[staff_id]) delete next[staff_id][month];
        return next;
      });

      fetchGrid(year);
    } catch {
      setPayErr("Failed to record payment!");
      setTimeout(() => setPayErr(""), 2000);
    }
  };

  const handleYearChange = (e) => setYear(Number(e.target.value));
  const togglePending = () => setPendingOnly((v) => !v);

  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 2; y <= currentYear + 2; ++y) yearOptions.push(y);

  const filteredGrid = pendingOnly
    ? salaryGrid.filter((staff) => staff.payments.some((m) => !m.paid_on))
    : salaryGrid;

  return (
    <div className="clerk-salaries-page">
      <div className="section-header-pro">
        <h3>Payroll Management</h3>
        <p>Assign teacher salaries and record monthly payments</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-12">
          <AdminCard header="Salary Assignment Registry">
            {success && <div className="alert alert-success py-2 mb-3 small">{success}</div>}
            <div className="table-responsive professional-table">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Teacher Name</th>
                    <th>Base Salary</th>
                    <th>Effective From</th>
                    <th>Remarks</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t) => (
                    <tr key={t.staff_id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-circle">{t.full_name.charAt(0)}</div>
                          <span className="fw-semibold">{t.full_name}</span>
                        </div>
                      </td>
                      <td style={{ width: 140 }}>
                        <div className="input-group input-group-sm">
                          <span className="input-group-text bg-light">₹</span>
                          <input type="number" className="form-control" value={editRow[t.staff_id]?.amount ?? t.amount ?? ""} onChange={(e) => handleChange(t.staff_id, "amount", e.target.value)} />
                        </div>
                      </td>
                      <td style={{ width: 150 }}>
                        <input type="date" className="form-control form-control-sm" value={editRow[t.staff_id]?.effective_from ?? (t.effective_from ? t.effective_from.slice(0, 10) : "")} onChange={(e) => handleChange(t.staff_id, "effective_from", e.target.value)} />
                      </td>
                      <td>
                        <input type="text" className="form-control form-control-sm" value={editRow[t.staff_id]?.remarks ?? t.remarks ?? ""} onChange={(e) => handleChange(t.staff_id, "remarks", e.target.value)} placeholder="Notes..." />
                      </td>
                      <td className="text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button className="btn btn-sm btn-outline-navy" onClick={() => fetchSalaryHistory(t.staff_id)}>History</button>
                          <button className="btn btn-sm btn-navy" onClick={() => handleSave(t)}>Update</button>
                        </div>
                        {showHistoryFor === t.staff_id && salaryHistory[t.staff_id] && (
                          <div className="history-dropdown mt-2 p-3 border rounded shadow-sm bg-light text-start" style={{ position: 'absolute', zIndex: 100, right: 0, minWidth: 400 }}>
                            <div className="fw-bold small mb-2">Salary History: {t.full_name}</div>
                            <table className="table table-sm table-borderless mb-0 x-small">
                              <thead><tr className="border-bottom"><th>Amt</th><th>From</th><th>To</th></tr></thead>
                              <tbody>
                                {salaryHistory[t.staff_id].map((h, i) => (
                                  <tr key={i}>
                                    <td>₹{h.amount}</td>
                                    <td>{h.effective_from?.slice(0, 10)}</td>
                                    <td>{h.effective_to?.slice(0, 10) || "Present"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </div>

        <div className="col-lg-12">
          <AdminCard>
            <TableContainer 
              title="Monthly Payment Grid"
              toolbar={
                <Toolbar 
                  left={
                    <div className="d-flex gap-2">
                      <select className="form-select form-select-sm" style={{ width: 100 }} value={year} onChange={handleYearChange}>
                        {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                      <button className={`btn btn-sm ${pendingOnly ? 'btn-danger' : 'btn-outline-navy'}`} onClick={togglePending}>
                        {pendingOnly ? "Showing Pending" : "Filter Pending"}
                      </button>
                    </div>
                  }
                  right={
                    <div className="text-muted small">Academic Year: {year}</div>
                  }
                />
              }
            >
              {payMsg && <div className="alert alert-success py-2 mb-2 small">{payMsg}</div>}
              {payErr && <div className="alert alert-danger py-2 mb-2 small">{payErr}</div>}
              
              <div className="table-responsive professional-table salary-grid-container" style={{ maxHeight: 600 }}>
                <table className="table table-bordered align-middle text-center mb-0">
                  <thead className="table-light sticky-top">
                    <tr>
                      <th className="text-start sticky-left bg-light" style={{ minWidth: 200 }}>Teacher</th>
                      {monthsArr.map(m => <th key={m} style={{ minWidth: 200 }}>{m}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGrid.map((staff) => (
                      <tr key={staff.staff_id}>
                        <td className="text-start fw-bold sticky-left bg-white">{staff.full_name}</td>
                        {staff.payments.map((mObj) => (
                          <td key={mObj.month} className={mObj.paid_on ? "bg-success-subtle" : "bg-danger-subtle"}>
                            {mObj.paid_on ? (
                              <div className="small">
                                <div className="fw-bold text-success">₹{mObj.amount?.toLocaleString()}</div>
                                <div className="text-muted" style={{ fontSize: '0.7rem' }}>{new Date(mObj.paid_on).toLocaleDateString()}</div>
                              </div>
                            ) : (
                              <div className="p-1">
                                <input type="number" className="form-control form-control-sm mb-1" placeholder="₹" value={editPay[staff.staff_id]?.[mObj.month]?.amount || mObj.amount || ""} onChange={(e) => handleEditPay(staff.staff_id, mObj.month, "amount", e.target.value)} />
                                <input type="date" className="form-control form-control-sm mb-1" value={editPay[staff.staff_id]?.[mObj.month]?.paid_on || ""} onChange={(e) => handleEditPay(staff.staff_id, mObj.month, "paid_on", e.target.value)} />
                                <button className="btn btn-xs btn-success w-100" style={{ fontSize: '0.7rem' }} onClick={() => paySalary(staff.staff_id, mObj)}>Mark Paid</button>
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TableContainer>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
