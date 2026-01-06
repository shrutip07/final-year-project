import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import Toolbar from "../../components/admin/Toolbar";
import EmptyState from "../../components/admin/EmptyState";
import TabNavigation from "../../components/admin/TabNavigation";
import PageHeader from "../../components/admin/PageHeader";
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

  const [activeTab, setActiveTab] = useState("fee-directory");

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

  const feeTabs = [
    { id: "fee-directory", label: "Fee Directory", icon: "bi-journal-text" },
    { id: "collect-fees", label: "Collect Student Fees", icon: "bi-cash-coin" },
    { id: "set-fees", label: "Set Standard Fees", icon: "bi-gear" },
  ];

  return (
    <div className="pb-4">
      <PageHeader
        title="Fee Management"
        subtitle="Configure fee structures and track student payment compliance"
      />

      <TabNavigation
        tabs={feeTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="mt-3">
        {activeTab === "fee-directory" && (
          <AdminCard header="Fee Directory">
            <div className="d-flex align-items-center gap-2 mb-3 bg-light p-2 rounded" style={{ maxWidth: "300px" }}>
              <span className="small text-muted fw-bold">Filter Year:</span>
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

            <TableContainer title="">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>STANDARD</th>
                    <th>ACADEMIC YEAR</th>
                    <th className="text-end">FEE AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFees.map((fee) => (
                    <tr key={fee.id}>
                      <td className="fw-bold text-primary">STD {fee.standard}</td>
                      <td>{fee.academic_year}</td>
                      <td className="text-end text-success fw-bold">₹{fee.fee_amount}</td>
                    </tr>
                  ))}
                  {filteredFees.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center py-4">
                        <EmptyState title="No Records" description="No fee structures found for the selected year." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TableContainer>
          </AdminCard>
        )}

        {activeTab === "collect-fees" && (
          <AdminCard header="Collect Student Fees">
            <div className="row g-3 mb-4 bg-light p-3 rounded shadow-sm border mx-0">
              <div className="col-md-3">
                <label className="form-label small fw-bold text-muted text-uppercase">Standard</label>
                <select
                  className="form-select form-select-sm border-primary-subtle"
                  value={feeStandard}
                  onChange={(e) => setFeeStandard(e.target.value)}
                >
                  <option value="">Select</option>
                  {standards.map((std) => <option key={std} value={std}>STD {std}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold text-muted text-uppercase">Division</label>
                <select
                  className="form-select form-select-sm border-primary-subtle"
                  value={feeDivision}
                  onChange={(e) => setFeeDivision(e.target.value)}
                >
                  <option value="">Select</option>
                  {divisions.map((div) => <option key={div} value={div}>DIV {div}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold text-muted text-uppercase">Academic Year</label>
                <select
                  className="form-select form-select-sm border-primary-subtle"
                  value={feeAcademicYear}
                  onChange={(e) => setFeeAcademicYear(e.target.value)}
                >
                  <option value="">Select</option>
                  {allYears.map((year) => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
              <div className="col-md-3 d-flex align-items-end">
                <div className="btn-group btn-group-sm w-100 shadow-sm">
                  <button
                    className={`btn ${studentFeeFilter === "all" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setStudentFeeFilter("all")}
                  >All</button>
                  <button
                    className={`btn ${studentFeeFilter === "paid" ? "btn-success" : "btn-outline-success"}`}
                    onClick={() => setStudentFeeFilter("paid")}
                  >Paid</button>
                  <button
                    className={`btn ${studentFeeFilter === "unpaid" ? "btn-danger" : "btn-outline-danger"}`}
                    onClick={() => setStudentFeeFilter("unpaid")}
                  >Unpaid</button>
                </div>
              </div>
            </div>

            {feePaidSuccess && <div className="alert alert-info py-2 mb-3 small shadow-sm">{feePaidSuccess}</div>}

            <TableContainer title="">
              <table className="table align-middle border-top">
                <thead className="table-light">
                  <tr>
                    <th>STUDENT NAME</th>
                    <th>STATUS</th>
                    <th style={{ minWidth: '300px' }}>PAYMENT DETAILS</th>
                    <th className="text-end">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((stu) => (
                      <tr key={stu.student_id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <div className="avatar-circle student shadow-sm" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                              {stu.full_name?.charAt(0)}
                            </div>
                            <div>
                              <span className="d-block fw-bold text-dark">{stu.full_name}</span>
                              <span className="small text-muted">{stu.standard}-{stu.division}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`erp-badge ${stu.paid_status ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                            {stu.paid_status ? "PAID" : "PENDING"}
                          </span>
                        </td>
                        <td>
                          {stu.paid_status ? (
                            <div className="d-flex align-items-center gap-3">
                              <span className="fw-bold text-success">₹{stu.paid_amount}</span>
                              <span className="small text-muted border-start ps-2">
                                {new Date(stu.paid_on).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <div className="d-flex flex-column gap-2 py-1">
                              <div className="row g-1">
                                <div className="col-6">
                                  <input
                                    type="number"
                                    className="form-control form-control-sm border-primary-subtle"
                                    placeholder="Amount"
                                    value={feeInputs[stu.student_id]?.paid_amount || ""}
                                    onChange={(e) => handleFeeInput(stu.student_id, "paid_amount", e.target.value)}
                                  />
                                </div>
                                <div className="col-6">
                                  <input
                                    type="date"
                                    className="form-control form-control-sm border-primary-subtle"
                                    value={feeInputs[stu.student_id]?.paid_on || ""}
                                    onChange={(e) => handleFeeInput(stu.student_id, "paid_on", e.target.value)}
                                  />
                                </div>
                              </div>
                              <input
                                type="text"
                                className="form-control form-control-sm border-primary-subtle"
                                placeholder="Remarks (Optional)"
                                value={feeInputs[stu.student_id]?.remarks || ""}
                                onChange={(e) => handleFeeInput(stu.student_id, "remarks", e.target.value)}
                              />
                            </div>
                          )}
                        </td>
                        <td className="text-end">
                          {!stu.paid_status && (
                            <button
                              className="btn btn-sm btn-success px-4 shadow-sm fw-bold"
                              onClick={() => markPaid(stu.student_id)}
                              style={{ fontSize: '0.75rem' }}
                            >Record Payment</button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-5">
                        <EmptyState title="No Records" description="Select filters above to view students and record payments." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </TableContainer>
          </AdminCard>
        )}

        {activeTab === "set-fees" && (
          <AdminCard header="Set Standard Fees">
            <div className="row justify-content-center py-4">
              <div className="col-lg-5">
                <div className="bg-light p-4 rounded-4 shadow-sm border">
                  <h5 className="mb-4 text-primary fw-bold border-bottom pb-2">Fee Configuration</h5>
                  <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-muted text-uppercase">Standard</label>
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
                      <label className="form-label small fw-bold text-muted text-uppercase">Academic Year</label>
                      <input
                        name="academic_year"
                        className="form-control border-primary-subtle"
                        placeholder="e.g. 2025-26"
                        value={form.academic_year}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label className="form-label small fw-bold text-muted text-uppercase">Fee Amount (₹)</label>
                      <div className="input-group border-primary-subtle rounded overflow-hidden">
                        <span className="input-group-text bg-primary text-white border-0">₹</span>
                        <input
                          name="fee_amount"
                          type="number"
                          className="form-control border-0"
                          placeholder="Enter amount"
                          value={form.fee_amount}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100 py-2 fw-bold shadow-sm">
                      <i className="bi bi-cloud-arrow-up me-2"></i>
                      Update Fee Structure
                    </button>
                  </form>

                  {error && <div className="alert alert-danger py-2 mt-4 small shadow-sm border-0">{error}</div>}
                  {success && <div className="alert alert-success py-2 mt-4 small shadow-sm border-0">{success}</div>}
                </div>
              </div>
            </div>
          </AdminCard>
        )}
      </div>
      <ChatWidget />
    </div>
  );
}
