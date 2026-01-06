import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import Toolbar from "../../components/admin/Toolbar";
import EmptyState from "../../components/admin/EmptyState";
import TabNavigation from "../../components/admin/TabNavigation";
import ChatWidget from "../../components/ChatWidget";

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
  const [editPay, setEditPay] = useState({});
  const [payMsg, setPayMsg] = useState("");
  const [payErr, setPayErr] = useState("");
  const [pendingOnly, setPendingOnly] = useState(false);

  const [activeTab, setActiveTab] = useState("configuration");

  // --- Assignment + history ---
  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      "http://localhost:5000/api/clerk/teacher-salaries",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setTeachers(res.data);
  };

  const fetchSalaryHistory = async (staff_id) => {
    const token = localStorage.getItem("token");
    const res = await axios.get(
      "http://localhost:5000/api/clerk/teacher-salary-history",
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { staff_id }
      }
    );
    setSalaryHistory((prev) => ({ ...prev, [staff_id]: res.data }));
    setShowHistoryFor(staff_id);
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
      effective_from:
        tr.effective_from ??
        t.effective_from ??
        new Date().toISOString().slice(0, 10),
      remarks: tr.remarks ?? t.remarks ?? ""
    };

    try {
      await axios.post(
        "http://localhost:5000/api/clerk/teacher-salary",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Salary configuration updated ✅");
      setTimeout(() => setSuccess(""), 3000);
      setEditRow({});
      fetchSalaries();
    } catch (err) {
      setPayErr("Failed to update salary configuration.");
    }
  };

  // --- Monthly payments grid ---
  useEffect(() => {
    fetchGrid(year);
  }, [year]);

  const fetchGrid = async (yr) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/clerk/teacher-salary-grid",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { year: yr }
        }
      );
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
      await axios.post(
        "http://localhost:5000/api/clerk/teacher-salary-pay",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPayMsg("Salary disbursement recorded! ✅");
      setTimeout(() => setPayMsg(""), 2000);

      setEditPay((prev) => {
        const next = { ...prev };
        if (next[staff_id]) delete next[staff_id][month];
        return next;
      });

      fetchGrid(year);
    } catch {
      setPayErr("Failed to record salary disbursement!");
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

  const salaryTabs = [
    { id: "configuration", label: "Salary Configuration", icon: "bi-sliders" },
    { id: "disbursement", label: "Monthly Payroll Disbursement", icon: "bi-cash-coin" },
  ];

  return (
    <div className="salaries-management-module">
      <div className="section-header-pro mb-3">
        <h3>Teacher Salaries</h3>
        <p>Manage base salary structures and record monthly disbursements</p>
      </div>

      <TabNavigation
        tabs={salaryTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="mt-3">
        {activeTab === "configuration" && (
          <AdminCard header="Salary Configuration">
            {success && <div className="alert alert-success py-2 mb-3 small">{success}</div>}
            <TableContainer title="">
              <div className="table-responsive professional-table">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Teacher Name</th>
                      <th>Current Base (₹)</th>
                      <th>Effective From</th>
                      <th>Audit Remarks</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teachers.length > 0 ? (
                      teachers.map((t) => (
                        <tr key={t.staff_id}>
                          <td className="fw-bold">
                            <div className="d-flex align-items-center gap-2">
                              <div className="avatar-circle">{t.full_name?.charAt(0)}</div>
                              {t.full_name}
                            </div>
                          </td>
                          <td style={{ width: "160px" }}>
                            <input
                              type="number"
                              className="form-control form-control-sm border-primary-subtle"
                              value={editRow[t.staff_id]?.amount ?? t.amount ?? ""}
                              placeholder="Enter Amount"
                              onChange={(e) => handleChange(t.staff_id, "amount", e.target.value)}
                            />
                          </td>
                          <td style={{ width: "180px" }}>
                            <input
                              type="date"
                              className="form-control form-control-sm border-primary-subtle"
                              value={editRow[t.staff_id]?.effective_from ?? (t.effective_from ? t.effective_from.slice(0, 10) : "")}
                              onChange={(e) => handleChange(t.staff_id, "effective_from", e.target.value)}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm border-primary-subtle"
                              value={editRow[t.staff_id]?.remarks ?? t.remarks ?? ""}
                              onChange={(e) => handleChange(t.staff_id, "remarks", e.target.value)}
                              placeholder="Optional notes"
                            />
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-sm btn-primary px-3"
                                onClick={() => handleSave(t)}
                              >Update</button>
                              <button
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => fetchSalaryHistory(t.staff_id)}
                                title="View History"
                              ><i className="bi bi-clock-history"></i></button>
                            </div>

                            {showHistoryFor === t.staff_id && salaryHistory[t.staff_id] && (
                              <div className="salary-history-popover mt-3 p-3 bg-light border rounded shadow-sm">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <span className="fw-bold small text-primary">Revision History</span>
                                  <button className="btn-close" style={{fontSize: '0.6rem'}} onClick={() => setShowHistoryFor(null)}></button>
                                </div>
                                <table className="table table-sm small mb-0">
                                  <thead>
                                    <tr className="text-muted">
                                      <th>Amount</th>
                                      <th>From</th>
                                      <th>To</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {salaryHistory[t.staff_id].map((hist, i) => (
                                      <tr key={i}>
                                        <td className="fw-bold text-success">₹{hist.amount}</td>
                                        <td>{hist.effective_from?.slice(0, 10)}</td>
                                        <td>{hist.effective_to ? hist.effective_to.slice(0, 10) : "Current"}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          <EmptyState title="No Staff" description="No teaching staff found in this unit." />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TableContainer>
          </AdminCard>
        )}

        {activeTab === "disbursement" && (
          <AdminCard header="Monthly Payroll Disbursement">
            <Toolbar
              left={
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center gap-2 bg-light px-3 py-1 rounded-pill border">
                    <span className="small text-muted fw-bold">Select Year:</span>
                    <select
                      className="form-select form-select-sm border-0 bg-transparent py-0"
                      style={{fontSize: '0.8rem', width: 'auto'}}
                      value={year}
                      onChange={handleYearChange}
                    >
                      {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <button
                    className={`btn btn-sm rounded-pill px-3 ${pendingOnly ? "btn-danger shadow-sm" : "btn-outline-secondary"}`}
                    onClick={togglePending}
                  >
                    {pendingOnly ? "Showing Pending Only" : "Show All Status"}
                  </button>
                </div>
              }
              right={
                <div className="d-flex gap-2 small text-muted">
                  <span className="d-flex align-items-center gap-1">
                    <span className="badge bg-success rounded-circle" style={{width: 8, height: 8}}></span> Paid
                  </span>
                  <span className="d-flex align-items-center gap-1">
                    <span className="badge bg-danger rounded-circle" style={{width: 8, height: 8}}></span> Pending
                  </span>
                </div>
              }
            />

            {payMsg && <div className="alert alert-success py-2 mb-3 small">{payMsg}</div>}
            {payErr && <div className="alert alert-danger py-2 mb-3 small">{payErr}</div>}

            <div className="table-responsive salary-grid-wrapper professional-table mt-3">
              <table className="table align-middle border-start">
                <thead>
                  <tr>
                    <th className="bg-light sticky-left" style={{position: 'sticky', left: 0, zIndex: 10, minWidth: '180px'}}>Staff Member</th>
                    {monthsArr.map((m) => (
                      <th key={m} className="text-center bg-primary text-white border-white" style={{minWidth: '220px'}}>
                        {m.toUpperCase()} {year}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredGrid.length > 0 ? (
                    filteredGrid.map((staff) => (
                      <tr key={staff.staff_id}>
                        <td className="bg-light fw-bold sticky-left border-end shadow-sm" style={{position: 'sticky', left: 0, zIndex: 5}}>
                          {staff.full_name}
                        </td>
                        {staff.payments.map((monthObj) => {
                          const v = editPay[staff.staff_id]?.[monthObj.month] || {};
                          return (
                            <td key={monthObj.month} className="p-2 border-end" style={{backgroundColor: monthObj.paid_on ? 'rgba(5, 150, 105, 0.03)' : 'rgba(225, 29, 72, 0.03)'}}>
                              {monthObj.paid_on ? (
                                <div className="p-2 rounded bg-white border border-success-subtle shadow-sm">
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <span className="erp-badge badge-success">PAID</span>
                                    <span className="fw-bold text-success">₹{monthObj.amount}</span>
                                  </div>
                                  <div className="small text-muted mb-1">
                                    <i className="bi bi-calendar-check me-1"></i> 
                                    {new Date(monthObj.paid_on).toLocaleDateString()}
                                  </div>
                                  {monthObj.remarks && (
                                    <div className="small text-muted text-truncate" title={monthObj.remarks}>
                                      <i className="bi bi-info-circle me-1"></i> {monthObj.remarks}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="p-2 rounded bg-white border border-danger-subtle shadow-sm">
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <span className="erp-badge badge-danger">PENDING</span>
                                  </div>
                                  <div className="d-flex flex-column gap-1">
                                    <input
                                      type="number"
                                      className="form-control form-control-sm"
                                      value={v.amount || monthObj.amount || ""}
                                      placeholder="Amount"
                                      onChange={(e) => handleEditPay(staff.staff_id, monthObj.month, "amount", e.target.value)}
                                    />
                                    <input
                                      type="date"
                                      className="form-control form-control-sm"
                                      value={v.paid_on || ""}
                                      onChange={(e) => handleEditPay(staff.staff_id, monthObj.month, "paid_on", e.target.value)}
                                    />
                                    <input
                                      type="text"
                                      className="form-control form-control-sm"
                                      placeholder="Remarks"
                                      value={v.remarks || ""}
                                      onChange={(e) => handleEditPay(staff.staff_id, monthObj.month, "remarks", e.target.value)}
                                    />
                                    <button
                                      className="btn btn-sm btn-success mt-1 w-100 fw-bold"
                                      onClick={() => paySalary(staff.staff_id, monthObj)}
                                      disabled={!v.amount && !monthObj.amount}
                                    >Record Payment</button>
                                  </div>
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={1 + monthsArr.length} className="text-center py-5">
                        <EmptyState title="No Records" description="No payroll data found for this period." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </AdminCard>
        )}
      </div>

      <ChatWidget />
    </div>
  );
}
