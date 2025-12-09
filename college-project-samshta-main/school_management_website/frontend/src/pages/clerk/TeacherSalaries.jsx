import React, { useEffect, useState } from "react";
import axios from "axios";
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

    await axios.post(
      "http://localhost:5000/api/clerk/teacher-salary",
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSuccess("Salary saved!");
    setTimeout(() => setSuccess(""), 1000);
    setEditRow({});
    fetchSalaries();
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
      setTimeout(() => setPayErr(""), 1500);
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

      setPayMsg("Salary marked as paid!");
      setTimeout(() => setPayMsg(""), 1200);

      setEditPay((prev) => {
        const next = { ...prev };
        if (next[staff_id]) delete next[staff_id][month];
        return next;
      });

      fetchGrid(year);
    } catch {
      setPayErr("Failed to update salary status!");
      setTimeout(() => setPayErr(""), 1400);
    }
  };

  const handleYearChange = (e) => setYear(Number(e.target.value));
  const togglePending = () => setPendingOnly((v) => !v);

  // year dropdown
  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 2; y <= currentYear + 2; ++y) yearOptions.push(y);

  const filteredGrid = pendingOnly
    ? salaryGrid.filter((staff) => staff.payments.some((m) => !m.paid_on))
    : salaryGrid;

  const paidCellStyle = { background: "#dcfce7" };
  const pendingCellStyle = { background: "#fee2e2" };

  return (
    <>
      <div className="teacher-main-inner clerk-salary-page">
        {/* Page header – only once */}
        <div className="page-header page-header-tight">
          <p className="page-subtitle">
            Assign base salary for each teacher and track their monthly payments.
          </p>
        </div>

        {/* CARD 1: ASSIGN / UPDATE */}
        <div className="teacher-students-card">
          <div className="card-header">
            <h3>Assign / Update Teacher Salary</h3>
          </div>
          <div className="card-body">
            {success && (
              <div className="alert alert-success mb-3">{success}</div>
            )}

            <div className="table-responsive">
              <table className="teacher-students-table salary-assign-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Current Salary</th>
                    <th>Effective From</th>
                    <th>Remarks</th>
                    <th>History</th>
                    <th>Assign / Update</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t) => (
                    <tr key={t.staff_id}>
                      <td>{t.full_name}</td>
                      <td style={{ maxWidth: 140 }}>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={editRow[t.staff_id]?.amount ?? t.amount ?? ""}
                          placeholder="Amount"
                          onChange={(e) =>
                            handleChange(t.staff_id, "amount", e.target.value)
                          }
                        />
                      </td>
                      <td style={{ maxWidth: 150 }}>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={
                            editRow[t.staff_id]?.effective_from ??
                            (t.effective_from
                              ? t.effective_from.slice(0, 10)
                              : "")
                          }
                          onChange={(e) =>
                            handleChange(
                              t.staff_id,
                              "effective_from",
                              e.target.value
                            )
                          }
                        />
                      </td>
                      <td style={{ maxWidth: 220 }}>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={
                            editRow[t.staff_id]?.remarks ?? t.remarks ?? ""
                          }
                          onChange={(e) =>
                            handleChange(t.staff_id, "remarks", e.target.value)
                          }
                          placeholder="Remarks"
                        />
                      </td>
                      <td style={{ width: 110 }}>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm w-100"
                          onClick={() => fetchSalaryHistory(t.staff_id)}
                        >
                          View
                        </button>

                        {showHistoryFor === t.staff_id &&
                          salaryHistory[t.staff_id] && (
                            <div className="salary-history-popover">
                              <div className="salary-history-title">
                                Salary History
                              </div>
                              <div className="table-responsive">
                                <table className="table table-sm mb-0">
                                  <thead>
                                    <tr>
                                      <th>Amount</th>
                                      <th>From</th>
                                      <th>To</th>
                                      <th>Remarks</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {salaryHistory[t.staff_id].map((hist) => (
                                      <tr
                                        key={
                                          hist.effective_from + hist.amount
                                        }
                                      >
                                        <td>{hist.amount}</td>
                                        <td>
                                          {hist.effective_from?.slice(0, 10)}
                                        </td>
                                        <td>
                                          {hist.effective_to
                                            ? hist.effective_to.slice(0, 10)
                                            : "Current"}
                                        </td>
                                        <td>{hist.remarks || ""}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                      </td>
                      <td style={{ width: 130 }}>
                        <button
                          type="button"
                          className="save-btn w-100"
                          onClick={() => handleSave(t)}
                        >
                          Save Salary
                        </button>
                      </td>
                    </tr>
                  ))}

                  {teachers.length === 0 && (
                    <tr>
                      <td colSpan={6}>No teachers found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CARD 2: MONTHLY PAYMENTS */}
        <div className="teacher-students-card salary-payments-card">
          <div className="card-header">
            <h3>Teacher Monthly Salary Payments</h3>
            <div className="header-controls">
              <div className="filter-group">
                <label className="form-label mb-1">Year</label>
                <select
                  className="form-control"
                  value={year}
                  onChange={handleYearChange}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={togglePending}
              >
                {pendingOnly ? "Show All" : "Show Only Pending"}
              </button>
            </div>
          </div>

          <div className="card-body">
            {payMsg && (
              <div className="alert alert-success py-2 mb-2">{payMsg}</div>
            )}
            {payErr && (
              <div className="alert alert-danger py-2 mb-2">{payErr}</div>
            )}

            <div className="table-responsive salary-grid-wrapper">
              <table className="teacher-students-table salary-payments-table">
                <thead>
                  <tr>
                    <th className="teacher-col">Teacher</th>
                    {monthsArr.map((m) => (
                      <th key={m} colSpan={3} className="salary-month-header">
                        <div>{m}</div>
                        <div className="salary-month-sub">
                          Status · Amount · Action
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredGrid.map((staff) => (
                    <tr key={staff.staff_id}>
                      <td className="teacher-col">{staff.full_name}</td>

                      {staff.payments.map((monthObj) => {
                        if (monthObj.paid_on) {
                          return [
                            <td
                              key={"s-" + monthObj.month}
                              style={paidCellStyle}
                              className="salary-status-cell"
                            >
                              <span className="badge-soft badge-soft-success">
                                Paid
                              </span>
                              <br />
                              <small>
                                {new Date(
                                  monthObj.paid_on
                                ).toLocaleDateString()}
                              </small>
                              {monthObj.remarks && (
                                <>
                                  <br />
                                  <small className="salary-remarks">
                                    {monthObj.remarks}
                                  </small>
                                </>
                              )}
                            </td>,
                            <td key={"a-" + monthObj.month} className="amount-col">
                              {monthObj.amount}
                            </td>,
                            <td key={"x-" + monthObj.month}></td>
                          ];
                        } else {
                          const v =
                            editPay[staff.staff_id]?.[monthObj.month] || {};
                          return [
                            <td
                              key={"s-" + monthObj.month}
                              style={pendingCellStyle}
                              className="salary-status-cell"
                            >
                              <span className="badge-soft badge-soft-danger">
                                Pending
                              </span>
                            </td>,
                            <td key={"a-" + monthObj.month} className="amount-col">
                              <input
                                type="number"
                                className="form-control form-control-sm mb-1"
                                value={v.amount || monthObj.amount || ""}
                                placeholder="Amount"
                                onChange={(e) =>
                                  handleEditPay(
                                    staff.staff_id,
                                    monthObj.month,
                                    "amount",
                                    e.target.value
                                  )
                                }
                              />
                              <input
                                type="date"
                                className="form-control form-control-sm mb-1"
                                value={v.paid_on || ""}
                                onChange={(e) =>
                                  handleEditPay(
                                    staff.staff_id,
                                    monthObj.month,
                                    "paid_on",
                                    e.target.value
                                  )
                                }
                              />
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Remarks"
                                value={v.remarks || ""}
                                onChange={(e) =>
                                  handleEditPay(
                                    staff.staff_id,
                                    monthObj.month,
                                    "remarks",
                                    e.target.value
                                  )
                                }
                              />
                            </td>,
                            <td key={"x-" + monthObj.month} className="action-col">
                              <button
                                type="button"
                                className="btn btn-success btn-sm w-100"
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

                  {filteredGrid.length === 0 && (
                    <tr>
                      <td colSpan={1 + monthsArr.length * 3}>
                        No salary data for this year.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="salary-legend">
              <strong>Legend:</strong>{" "}
              <span className="legend-pill legend-paid">Paid</span>
              <span className="legend-pill legend-pending">Pending</span>
            </div>
          </div>
        </div>
      </div>

      <ChatWidget />
    </>
  );
}
