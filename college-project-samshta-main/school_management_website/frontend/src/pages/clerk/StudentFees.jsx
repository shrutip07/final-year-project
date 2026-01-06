// src/pages/clerk/StudentFees.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import Toolbar from "../../components/admin/Toolbar";
import EmptyState from "../../components/admin/EmptyState";

export default function StudentFees() {
  const [feeRows, setFeeRows] = useState([]);
  const [standards] = useState(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
  const [divisions] = useState(["A", "B", "C", "D"]);

  const [form, setForm] = useState({
    standard: "",
    academic_year: "",
    fee_amount: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const [feeStandard, setFeeStandard] = useState("");
  const [feeDivision, setFeeDivision] = useState("");
  const [feeAcademicYear, setFeeAcademicYear] = useState("");
  const [students, setStudents] = useState([]);
  const [feePaidSuccess, setFeePaidSuccess] = useState("");
  const [feeInputs, setFeeInputs] = useState({});
  const [studentFeeFilter, setStudentFeeFilter] = useState("all");

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/clerk/fee-master", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setFeeRows(res.data.fees);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.name === "fee_amount" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/clerk/fee-master",
        {
          ...form,
          fee_amount: form.fee_amount === "" ? null : String(Number(form.fee_amount)),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Fee structure updated successfully ✅");
      fetchFees();
      setForm({ standard: "", academic_year: "", fee_amount: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Could not update fee.");
    }
  };

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
            academic_year: feeAcademicYear,
          },
        });
        setStudents(res.data);
      } catch (err) {
        setStudents([]);
      }
    };
    fetchStudents();
  }, [feeStandard, feeDivision, feeAcademicYear]);

  const handleFeeInput = (student_id, field, value) => {
    setFeeInputs((prev) => ({
      ...prev,
      [student_id]: { ...prev[student_id], [field]: value },
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
      await axios.post(
        "http://localhost:5000/api/clerk/student-fee-status",
        {
          student_id,
          academic_year: feeAcademicYear,
          paid_amount,
          paid_on,
          remarks,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeePaidSuccess("Payment recorded successfully! ✅");

      const res = await axios.get("http://localhost:5000/api/clerk/students-for-fee", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          standard: feeStandard,
          division: feeDivision,
          academic_year: feeAcademicYear,
        },
      });
      setStudents(res.data);

      setFeeInputs((prev) => {
        const next = { ...prev };
        delete next[student_id];
        return next;
      });
      setTimeout(() => setFeePaidSuccess(""), 1200);
    } catch {
      setFeePaidSuccess("Error updating payment!");
    }
  };

  const allYears = Array.from(new Set(feeRows.map((fee) => fee.academic_year)));
  const filteredFees = yearFilter ? feeRows.filter((fee) => fee.academic_year === yearFilter) : feeRows;
  const filteredStudents = students.filter((stu) => {
    if (studentFeeFilter === "all") return true;
    if (studentFeeFilter === "paid") return stu.paid_status;
    if (studentFeeFilter === "unpaid") return !stu.paid_status;
    return true;
  });

  return (
    <div className="clerk-fees-page">
      <div className="section-header-pro">
        <h3>Fee Management</h3>
        <p>Configure fee structures and track student payments</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-12">
          <AdminCard header="Configure Fee Structure">
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-3">
                <label className="form-label small fw-bold text-muted">STANDARD</label>
                <select required name="standard" value={form.standard} onChange={handleChange} className="form-select">
                  <option value="">Select</option>
                  {standards.map((std) => (
                    <option key={std} value={std}>{std}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold text-muted">ACADEMIC YEAR</label>
                <input name="academic_year" className="form-control" placeholder="e.g. 2024-25" value={form.academic_year} onChange={handleChange} required />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold text-muted">FEE AMOUNT (₹)</label>
                <input name="fee_amount" type="number" className="form-control" placeholder="0.00" value={form.fee_amount} onChange={handleChange} required />
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <button type="submit" className="btn btn-primary w-100">
                  Update Structure
                </button>
              </div>
            </form>
            {error && <div className="alert alert-danger py-2 mt-3 small">{error}</div>}
            {success && <div className="alert alert-success py-2 mt-3 small">{success}</div>}
          </AdminCard>
        </div>

        <div className="col-lg-12">
          <AdminCard>
            <TableContainer 
              title="Fee Master Directory"
              toolbar={
                <Toolbar 
                  left={<div className="text-muted small">Showing existing fee configurations</div>}
                  right={
                    <select className="form-select form-select-sm" style={{ width: 180 }} value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                      <option value="">All Academic Years</option>
                      {allYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  }
                />
              }
            >
              <div className="table-responsive professional-table">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Standard</th>
                      <th>Academic Year</th>
                      <th>Fee Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFees.map((fee) => (
                      <tr key={fee.id}>
                        <td className="fw-bold">Standard {fee.standard}</td>
                        <td><span className="erp-badge badge-year">{fee.academic_year}</span></td>
                        <td><span className="fw-bold text-navy">₹{fee.fee_amount?.toLocaleString()}</span></td>
                      </tr>
                    ))}
                    {filteredFees.length === 0 && (
                      <tr><td colSpan={3} className="text-center text-muted">No fee records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TableContainer>
          </AdminCard>
        </div>

        <div className="col-lg-12">
          <AdminCard header="Track Student Payments">
            <div className="row g-3 mb-4">
              <div className="col-md-3">
                <label className="form-label small fw-bold text-muted">STANDARD</label>
                <select className="form-select" value={feeStandard} onChange={(e) => setFeeStandard(e.target.value)}>
                  <option value="">Select</option>
                  {standards.map(std => <option key={std}>{std}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold text-muted">DIVISION</label>
                <select className="form-select" value={feeDivision} onChange={(e) => setFeeDivision(e.target.value)}>
                  <option value="">Select</option>
                  {divisions.map(div => <option key={div}>{div}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold text-muted">ACADEMIC YEAR</label>
                <select className="form-select" value={feeAcademicYear} onChange={(e) => setFeeAcademicYear(e.target.value)}>
                  <option value="">Select</option>
                  {allYears.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
              <div className="col-md-3 d-flex align-items-end gap-2">
                <button className={`btn btn-sm ${studentFeeFilter === 'all' ? 'btn-navy' : 'btn-outline-navy'}`} onClick={() => setStudentFeeFilter('all')}>All</button>
                <button className={`btn btn-sm ${studentFeeFilter === 'paid' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setStudentFeeFilter('paid')}>Paid</button>
                <button className={`btn btn-sm ${studentFeeFilter === 'unpaid' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={() => setStudentFeeFilter('unpaid')}>Unpaid</button>
              </div>
            </div>

            {feePaidSuccess && <div className="alert alert-info py-2 mb-3 small">{feePaidSuccess}</div>}

            <div className="table-responsive professional-table">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Status</th>
                    <th>Amount Paid</th>
                    <th>Paid On</th>
                    <th>Remarks</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((stu) => (
                    <tr key={stu.student_id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-circle student">{stu.full_name.charAt(0)}</div>
                          <span className="fw-semibold">{stu.full_name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`erp-badge ${stu.paid_status ? 'badge-success' : 'badge-danger'}`}>
                          {stu.paid_status ? 'Paid' : 'Pending'}
                        </span>
                      </td>

                      {stu.paid_status ? (
                        <>
                          <td className="fw-bold">₹{stu.paid_amount?.toLocaleString()}</td>
                          <td className="small text-muted">{new Date(stu.paid_on).toLocaleDateString()}</td>
                          <td className="small">{stu.remarks || "-"}</td>
                          <td className="text-end text-success"><i className="bi bi-check-circle-fill"></i></td>
                        </>
                      ) : (
                        <>
                          <td><input type="number" className="form-control form-control-sm" style={{width: 100}} value={feeInputs[stu.student_id]?.paid_amount || ""} onChange={(e) => handleFeeInput(stu.student_id, "paid_amount", e.target.value)} placeholder="₹" /></td>
                          <td><input type="date" className="form-control form-control-sm" value={feeInputs[stu.student_id]?.paid_on || ""} onChange={(e) => handleFeeInput(stu.student_id, "paid_on", e.target.value)} /></td>
                          <td><input type="text" className="form-control form-control-sm" value={feeInputs[stu.student_id]?.remarks || ""} onChange={(e) => handleFeeInput(stu.student_id, "remarks", e.target.value)} placeholder="Note..." /></td>
                          <td className="text-end">
                            <button className="btn btn-success btn-sm px-3" onClick={() => markPaid(stu.student_id)}>Mark Paid</button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted small">
                        {feeStandard && feeDivision && feeAcademicYear ? "No students matching filters." : "Apply filters to view student records."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
