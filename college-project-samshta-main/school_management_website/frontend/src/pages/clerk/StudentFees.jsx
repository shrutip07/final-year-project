import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import Toolbar from "../../components/admin/Toolbar";
import EmptyState from "../../components/admin/EmptyState";
import ChatWidget from "../../components/ChatWidget";

export default function StudentFees() {
  const [feeRows, setFeeRows] = useState([]);
  const [standards] = useState([
    "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
  ]);
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
    const res = await axios.get(
      "http://localhost:5000/api/clerk/fee-master",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setFeeRows(res.data.fees);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.name === "fee_amount"
          ? e.target.value === ""
            ? ""
            : Number(e.target.value)
          : e.target.value,
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
          fee_amount:
            form.fee_amount === ""
              ? null
              : String(Number(form.fee_amount)),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccess("Fee structure updated successfully ✅");
      fetchFees();
      setForm({ standard: "", academic_year: "", fee_amount: "" });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Could not update fee.");
    }
  };

  const allYears = Array.from(
    new Set(feeRows.map((fee) => fee.academic_year))
  );
  const filteredFees = yearFilter
    ? feeRows.filter((fee) => fee.academic_year === yearFilter)
    : feeRows;

  useEffect(() => {
    const fetchStudents = async () => {
      if (!feeStandard || !feeDivision || !feeAcademicYear) {
        setStudents([]);
        return;
      }
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          "http://localhost:5000/api/clerk/students-for-fee",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              standard: feeStandard,
              division: feeDivision,
              academic_year: feeAcademicYear,
            },
          }
        );
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
      [student_id]: {
        ...prev[student_id],
        [field]: value,
      },
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
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFeePaidSuccess("Payment recorded successfully! ✅");

      const res = await axios.get(
        "http://localhost:5000/api/clerk/students-for-fee",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            standard: feeStandard,
            division: feeDivision,
            academic_year: feeAcademicYear,
          },
        }
      );
      setStudents(res.data);

      setFeeInputs((prev) => {
        const next = { ...prev };
        delete next[student_id];
        return next;
      });
      setTimeout(() => setFeePaidSuccess(""), 2000);
    } catch {
      setFeePaidSuccess("Error updating payment status!");
    }
  };

  const filteredStudents = students.filter((stu) => {
    if (studentFeeFilter === "all") return true;
    if (studentFeeFilter === "paid") return stu.paid_status;
    if (studentFeeFilter === "unpaid") return !stu.paid_status;
    return true;
  });

  return (
    <div className="fees-management-module">
      <div className="section-header-pro">
        <h3>Fee Management</h3>
        <p>Configure fee structures and track student payment compliance</p>
      </div>

      <div className="row">
        <div className="col-lg-4">
          <AdminCard header="Set Standard Fees">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">STANDARD</label>
                <select
                  required
                  name="standard"
                  value={form.standard}
                  onChange={handleChange}
                  className="form-select border-primary-subtle"
                >
                  <option value="">Select Standard</option>
                  {standards.map((std) => (
                    <option key={std} value={std}>STD {std}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">ACADEMIC YEAR</label>
                <input
                  name="academic_year"
                  className="form-control"
                  placeholder="e.g. 2025-26"
                  value={form.academic_year}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-muted">FEE AMOUNT (₹)</label>
                <input
                  name="fee_amount"
                  type="number"
                  className="form-control"
                  placeholder="Enter amount"
                  value={form.fee_amount}
                  onChange={handleChange}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100 py-2">
                Update Fee Structure
              </button>
            </form>

            {error && <div className="alert alert-danger py-2 mt-3 small">{error}</div>}
            {success && <div className="alert alert-success py-2 mt-3 small">{success}</div>}
          </AdminCard>

          <AdminCard header="Fee Directory">
            <div className="d-flex align-items-center gap-2 mb-3 bg-light p-2 rounded">
              <span className="small text-muted fw-bold">Filter:</span>
              <select
                className="form-select form-select-sm border-0 bg-transparent"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="">All Academic Years</option>
                {allYears.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="table-responsive professional-table" style={{maxHeight: '400px'}}>
              <table className="table align-middle small">
                <thead>
                  <tr>
                    <th>STD</th>
                    <th>Year</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFees.map((fee) => (
                    <tr key={fee.id}>
                      <td className="fw-bold">STD {fee.standard}</td>
                      <td>{fee.academic_year}</td>
                      <td className="text-success fw-bold">₹{fee.fee_amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminCard>
        </div>

        <div className="col-lg-8">
          <AdminCard header="Collect Student Fees">
            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">STANDARD</label>
                <select
                  className="form-select border-primary-subtle"
                  value={feeStandard}
                  onChange={(e) => setFeeStandard(e.target.value)}
                >
                  <option value="">Select</option>
                  {standards.map((std) => <option key={std} value={std}>STD {std}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">DIVISION</label>
                <select
                  className="form-select border-primary-subtle"
                  value={feeDivision}
                  onChange={(e) => setFeeDivision(e.target.value)}
                >
                  <option value="">Select</option>
                  {divisions.map((div) => <option key={div} value={div}>DIV {div}</option>)}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label small fw-bold text-muted">ACADEMIC YEAR</label>
                <select
                  className="form-select border-primary-subtle"
                  value={feeAcademicYear}
                  onChange={(e) => setFeeAcademicYear(e.target.value)}
                >
                  <option value="">Select</option>
                  {allYears.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
            </div>

            <div className="d-flex gap-2 mb-4">
              <button
                className={`btn btn-sm ${studentFeeFilter === "all" ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setStudentFeeFilter("all")}
              >All Students</button>
              <button
                className={`btn btn-sm ${studentFeeFilter === "paid" ? "btn-success" : "btn-outline-success"}`}
                onClick={() => setStudentFeeFilter("paid")}
              >Paid</button>
              <button
                className={`btn btn-sm ${studentFeeFilter === "unpaid" ? "btn-danger" : "btn-outline-danger"}`}
                onClick={() => setStudentFeeFilter("unpaid")}
              >Unpaid</button>
            </div>

            {feePaidSuccess && <div className="alert alert-info py-2 mb-3 small">{feePaidSuccess}</div>}

            <TableContainer title="">
              <div className="table-responsive professional-table">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Status</th>
                      <th>Payment Details</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((stu) => (
                        <tr key={stu.student_id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div className="avatar-circle student">
                                {stu.full_name?.charAt(0)}
                              </div>
                              <div>
                                <span className="d-block fw-bold">{stu.full_name}</span>
                                <span className="small text-muted">{stu.standard}-{stu.division}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`erp-badge ${stu.paid_status ? 'badge-success' : 'badge-danger'}`}>
                              {stu.paid_status ? "PAID" : "PENDING"}
                            </span>
                          </td>
                          <td>
                            {stu.paid_status ? (
                              <div>
                                <div className="fw-bold text-success">₹{stu.paid_amount}</div>
                                <div className="small text-muted">
                                  {new Date(stu.paid_on).toLocaleDateString()}
                                </div>
                              </div>
                            ) : (
                              <div className="d-flex flex-column gap-1" style={{minWidth: '250px'}}>
                                <div className="d-flex gap-1">
                                  <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    placeholder="Amount"
                                    value={feeInputs[stu.student_id]?.paid_amount || ""}
                                    onChange={(e) => handleFeeInput(stu.student_id, "paid_amount", e.target.value)}
                                  />
                                  <input
                                    type="date"
                                    className="form-control form-control-sm"
                                    value={feeInputs[stu.student_id]?.paid_on || ""}
                                    onChange={(e) => handleFeeInput(stu.student_id, "paid_on", e.target.value)}
                                  />
                                </div>
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Remarks (Optional)"
                                  value={feeInputs[stu.student_id]?.remarks || ""}
                                  onChange={(e) => handleFeeInput(stu.student_id, "remarks", e.target.value)}
                                />
                              </div>
                            )}
                          </td>
                          <td>
                            {!stu.paid_status && (
                              <button
                                className="btn btn-sm btn-success px-3"
                                onClick={() => markPaid(stu.student_id)}
                              >Record Payment</button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-5 text-muted">
                          <EmptyState title="No Records" description="Select standard and division to view students." />
                        </td>
                      </tr>
                    )}
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
