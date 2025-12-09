import React, { useEffect, useState } from "react";
import axios from "axios";
import ChatWidget from "../../components/ChatWidget";

export default function StudentFees() {
  const [feeRows, setFeeRows] = useState([]);
  const [standards] = useState([
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
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
      setSuccess("Fee updated.");
      fetchFees();
      setForm({ standard: "", academic_year: "", fee_amount: "" });
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

  // Load students for “Manage Fees” section when dropdowns change
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
      setFeePaidSuccess("Marked as paid!");

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
      setTimeout(() => setFeePaidSuccess(""), 1200);
    } catch {
      setFeePaidSuccess("Error updating payment!");
    }
  };

  const filteredStudents = students.filter((stu) => {
    if (studentFeeFilter === "all") return true;
    if (studentFeeFilter === "paid") return stu.paid_status;
    if (studentFeeFilter === "unpaid") return !stu.paid_status;
    return true;
  });

  return (
    <>
      <div className="teacher-main-inner">
        {/* PAGE HEADER */}
        <div className="page-header">
          <p className="page-subtitle">
            Define fee structure for each standard and track who has paid.
          </p>
        </div>

        {/* CARD 1: SET FEES FOR STANDARD */}
        <div className="teacher-students-card">
          <div className="card-header">
            <h3>Set Fees For Standard</h3>
          </div>

          <div className="card-body">
            <form
              onSubmit={handleSubmit}
              className="row g-2 align-items-end mb-3"
            >
              <div className="col-md-3">
                <label className="form-label">Standard</label>
                <select
                  required
                  name="standard"
                  value={form.standard}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="">Select Standard</option>
                  {standards.map((std) => (
                    <option key={std} value={std}>
                      {std}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label">Academic Year</label>
                <input
                  name="academic_year"
                  className="form-control"
                  placeholder="Academic Year (e.g. 2023-24)"
                  value={form.academic_year}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Fee Amount</label>
                <input
                  name="fee_amount"
                  type="number"
                  className="form-control"
                  placeholder="Fee Amount"
                  value={form.fee_amount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-2 d-flex">
                <button type="submit" className="save-btn w-100">
                  Set Fee
                </button>
              </div>
            </form>

            {error && (
              <div className="error-state mb-2" style={{ marginTop: 8 }}>
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success py-2 mb-2">{success}</div>
            )}

            {/* Year filter row */}
            <div
              className="students-filter-row"
              style={{ marginTop: 16, marginBottom: 8 }}
            >
              <div className="filter-group">
                <span className="form-label" style={{ marginBottom: 4 }}>
                  Show fees for
                </span>
                <select
                  className="form-control"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                >
                  <option value="">All Years</option>
                  {allYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fee structure table */}
            <div className="table-responsive mt-2">
              <table className="teacher-students-table">
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
                      <td>{fee.standard}</td>
                      <td>{fee.academic_year}</td>
                      <td>{fee.fee_amount}</td>
                    </tr>
                  ))}
                  {filteredFees.length === 0 && (
                    <tr>
                      <td colSpan={3}>No fee records yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* CARD 2: MANAGE STUDENT FEES STATUS */}
        <div className="teacher-students-card" style={{ marginTop: 32 }}>
          <div className="card-header">
            <h3>Manage Student Fees Paid Status</h3>
            <div className="header-controls">
              <select
                className="form-control"
                value={feeStandard}
                onChange={(e) => setFeeStandard(e.target.value)}
              >
                <option value="">Select Standard</option>
                {standards.map((std) => (
                  <option key={std}>{std}</option>
                ))}
              </select>

              <select
                className="form-control"
                value={feeDivision}
                onChange={(e) => setFeeDivision(e.target.value)}
              >
                <option value="">Select Division</option>
                {divisions.map((div) => (
                  <option key={div}>{div}</option>
                ))}
              </select>

              <select
                className="form-control"
                value={feeAcademicYear}
                onChange={(e) => setFeeAcademicYear(e.target.value)}
              >
                <option value="">Select Academic Year</option>
                {allYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="card-body">
            {/* Filter chips: all / paid / unpaid */}
            <div className="mb-3">
              <button
                type="button"
                className={`btn btn-outline-primary btn-sm me-2 ${
                  studentFeeFilter === "all" ? "active" : ""
                }`}
                onClick={() => setStudentFeeFilter("all")}
                disabled={studentFeeFilter === "all"}
              >
                All Students
              </button>
              <button
                type="button"
                className={`btn btn-outline-success btn-sm me-2 ${
                  studentFeeFilter === "paid" ? "active" : ""
                }`}
                onClick={() => setStudentFeeFilter("paid")}
                disabled={studentFeeFilter === "paid"}
              >
                Paid Students
              </button>
              <button
                type="button"
                className={`btn btn-outline-danger btn-sm ${
                  studentFeeFilter === "unpaid" ? "active" : ""
                }`}
                onClick={() => setStudentFeeFilter("unpaid")}
                disabled={studentFeeFilter === "unpaid"}
              >
                Unpaid Students
              </button>
            </div>

            {feePaidSuccess && (
              <div className="alert alert-info py-2 mb-3">
                {feePaidSuccess}
              </div>
            )}

            {/* Students table */}
            <div className="table-responsive">
              <table className="teacher-students-table">
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
                  {filteredStudents.map((stu) => (
                    <tr key={stu.student_id}>
                      <td>{stu.full_name}</td>
                      <td>{stu.standard}</td>
                      <td>{stu.division}</td>
                      <td>
                        {stu.paid_status ? (
                          <span className="badge-soft badge-soft-success">
                            Yes
                          </span>
                        ) : (
                          <span className="badge-soft badge-soft-danger">
                            No
                          </span>
                        )}
                      </td>

                      {stu.paid_status ? (
                        <>
                          <td>{stu.paid_amount}</td>
                          <td>
                            {stu.paid_on
                              ? new Date(
                                  stu.paid_on
                                ).toLocaleDateString()
                              : ""}
                          </td>
                          <td>{stu.remarks || ""}</td>
                          <td />
                        </>
                      ) : (
                        <>
                          <td>
                            <input
                              type="number"
                              min={0}
                              className="form-control form-control-sm"
                              value={
                                feeInputs[stu.student_id]?.paid_amount ||
                                ""
                              }
                              onChange={(e) =>
                                handleFeeInput(
                                  stu.student_id,
                                  "paid_amount",
                                  e.target.value
                                )
                              }
                              placeholder="Amount"
                            />
                          </td>
                          <td>
                            <input
                              type="date"
                              className="form-control form-control-sm"
                              value={
                                feeInputs[stu.student_id]?.paid_on || ""
                              }
                              onChange={(e) =>
                                handleFeeInput(
                                  stu.student_id,
                                  "paid_on",
                                  e.target.value
                                )
                              }
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={
                                feeInputs[stu.student_id]?.remarks || ""
                              }
                              onChange={(e) =>
                                handleFeeInput(
                                  stu.student_id,
                                  "remarks",
                                  e.target.value
                                )
                              }
                              placeholder="Remarks"
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-success btn-sm"
                              onClick={() => markPaid(stu.student_id)}
                            >
                              Mark Paid
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}

                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={8}>
                        {feeStandard && feeDivision && feeAcademicYear
                          ? "No students found for this selection."
                          : "Choose standard, division and year to see students."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <ChatWidget />
    </>
  );
}
