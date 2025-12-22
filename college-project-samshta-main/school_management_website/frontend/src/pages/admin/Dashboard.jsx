import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "./Dashboard.scss";

import AdminCharts from "./Charts";
import ChatWidget from "../../components/ChatWidget";
import AdminLayout from "../../components/admin/AdminLayout";
import SchoolContextHeader from "../../components/admin/SchoolContextHeader";
import TabNavigation from "../../components/admin/TabNavigation";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import Toolbar from "../../components/admin/Toolbar";
import EmptyState from "../../components/admin/EmptyState";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [sidebarTab, setSidebarTab] = useState("dashboard");
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitDetails, setUnitDetails] = useState(null);
  const [unitLoading, setUnitLoading] = useState(false);
  const [selectedSchoolTab, setSelectedSchoolTab] = useState("overview");

  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherVisibleColumns, setTeacherVisibleColumns] = useState([
    "staff_id",
    "full_name",
    "email",
    "phone",
    "qualification",
    "designation",
    "subject",
    "joining_date",
    "updatedat",
  ]);
  const [studentVisibleColumns, setStudentVisibleColumns] = useState([
    "student_id",
    "full_name",
    "standard",
    "division",
    "roll_number",
    "academic_year",
    "passed",
    "dob",
    "gender",
    "address",
    "parent_name",
    "parent_phone",
    "admission_date",
    "createdat",
    "updatedat",
  ]);
  const [teachersShowColDropdown, setTeachersShowColDropdown] =
    useState(false);
  const [studentsShowColDropdown, setStudentsShowColDropdown] =
    useState(false);
  const [studentsYear, setStudentsYear] = useState("");

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [forms, setForms] = useState([]);

  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  const [notifRole, setNotifRole] = useState("principal");
  const [notifLoading, setNotifLoading] = useState(false);

  // Forms
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formRole, setFormRole] = useState("principal");
  const [formQuestions, setFormQuestions] = useState([
    { question_text: "", question_type: "text", options: "" },
  ]);
  const [formLoading, setFormLoading] = useState(false);

  // NEW: dashboard / finance data for a unit
  const [selectedFy, setSelectedFy] = useState("2024-25");
  const [fyMetrics, setFyMetrics] = useState(null);
  const [selectedOverviewFy, setSelectedOverviewFy] = useState("2024-25");
  const [overviewMetrics, setOverviewMetrics] = useState(null);

  // REPORTS
  const [reportYears, setReportYears] = useState([]);
  const [selectedReportYear, setSelectedReportYear] = useState("");
  const [reportType, setReportType] = useState("annual");
  const [reportSchools, setReportSchools] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

  const navigate = useNavigate();

  // Load all units
  useEffect(() => {
    async function fetchUnits() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/admin/units",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const unitData = Array.isArray(response.data) ? response.data : [];
        setUnits(unitData);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || t("failed_load_units"));
        setUnits([]);
        setLoading(false);
      }
    }
    fetchUnits();
  }, [t]);

  // Load report years when Reports tab opens
  useEffect(() => {
    if (sidebarTab === "reports") {
      loadReportYears();
    }
  }, [sidebarTab]);

  const safeUnits = Array.isArray(units) ? units : [];

  const toLabel = (key) => {
    if (!key) return "";
    const map = {
      unit_id: "Unit ID",
      kendrashala_name: "School Name",
      fiscal_year: "Fiscal Year",
      bank_name: "Bank Name",
      bank_purpose: "Bank Purpose",
      createdat: "Created At",
      updatedat: "Updated At",
      non_recurring_expenses: "Non Recurring Expenses",
      staff_count: "Staff",
      student_count: "Students",
      semis_no: "SEMIS No",
    };
    if (map[key]) return map[key];
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .split(/_|\s+/)
      .filter(Boolean)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ");
  };

  useEffect(() => {
    if (sidebarTab === "notifications") {
      loadNotifications();
      loadForms();
    }
  }, [sidebarTab, notifRole, formRole]);

  const loadNotifications = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch {
      setNotifications([]);
    }
  };

  const loadForms = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(
        `http://localhost:5000/api/forms/active?role=${formRole}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForms(res.data);
    } catch {
      setForms([]);
    }
  };

  const addNotification = async (e) => {
    e.preventDefault();
    setNotifLoading(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        "http://localhost:5000/api/notifications",
        {
          title: notifTitle,
          message: notifMsg,
          receiver_role: notifRole,
          sender_role: "admin",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifTitle("");
      setNotifMsg("");
      setNotifLoading(false);
      loadNotifications();
      alert("Notification Sent ✅");
    } catch {
      setNotifLoading(false);
      alert("Failed to send notification");
    }
  };

  const addForm = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    const token = localStorage.getItem("token");
    const questionsPayload = formQuestions.map((q) => ({
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options ? q.options : null,
    }));
    try {
      const formRes = await axios.post(
        "http://localhost:5000/api/forms/create",
        {
          title: formTitle,
          description: formDesc,
          receiver_role: formRole,
          deadline: formDeadline,
          questions: questionsPayload,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const formId = formRes.data.form.id;
      const formLink = `http://localhost:3000/forms/${formId}`;
      await axios.post(
        "http://localhost:5000/api/notifications",
        {
          title: `New Form: ${formTitle}`,
          message: `Please fill this form before deadline: ${formLink}`,
          receiver_role: formRole,
          sender_role: "admin",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormTitle("");
      setFormDesc("");
      setFormDeadline("");
      setFormQuestions([
        { question_text: "", question_type: "text", options: "" },
      ]);
      setFormLoading(false);
      loadForms();
      alert("Form Created and Notification Sent ✅");
    } catch {
      setFormLoading(false);
      alert("Failed to create/send form");
    }
  };

  const handleQuestionChange = (idx, field, value) => {
    setFormQuestions((qs) =>
      qs.map((q, i) => (i === idx ? { ...q, [field]: value } : q))
    );
  };

  const addFormQuestion = () => {
    setFormQuestions((qs) => [
      ...qs,
      { question_text: "", question_type: "text", options: "" },
    ]);
  };

  const removeFormQuestion = (idx) => {
    setFormQuestions((qs) => qs.filter((_, i) => i !== idx));
  };

  const loadReportYears = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/report/years", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReportYears(res.data || []);
      if (res.data && res.data.length > 0) {
        setSelectedReportYear(res.data[0]);
      }
    } catch (err) {
      console.error("Failed to load report years", err);
      setReportYears([]);
    }
  };

  const fetchReportSchools = async () => {
    if (!selectedReportYear) return;
    setReportLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/report/schools?year=${selectedReportYear}&type=${reportType}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReportSchools(res.data || []);
    } catch (err) {
      console.error("Failed fetching report schools", err);
      setReportSchools([]);
    }
    setReportLoading(false);
  };

  const renderReportsPage = () => {
    return (
      <div className="page-inner">
        <AdminCard header="Generate Reports">
          <p className="text-muted small mb-4">Select academic year and report type, then download per school</p>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="fw-semibold small mb-1">Select Academic Year</label>
              <select
                className="form-select"
                value={selectedReportYear}
                onChange={(e) => setSelectedReportYear(e.target.value)}
              >
                <option value="">Select</option>
                {reportYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="fw-semibold small mb-1">Select Report Type</label>
              <select
                className="form-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="annual">Annual Academic Report</option>
                <option value="payroll">Staff Payroll Report</option>
                <option value="finance">Financial Allocation Report</option>
                <option value="safety">School Safety &amp; Compliance Report</option>
              </select>
            </div>
          </div>
          <button
            className="btn btn-primary"
            disabled={!selectedReportYear}
            onClick={fetchReportSchools}
          >
            {reportLoading ? (
              <span className="spinner-border spinner-border-sm" />
            ) : (
              "Fetch Schools"
            )}
          </button>
        </AdminCard>

        {reportSchools.length > 0 && (
          <div className="mt-4">
            <AdminCard header="Available Schools">
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>School</th>
                      <th>Status</th>
                      <th>Download</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportSchools.map((school) => (
                      <tr key={school.unit_id}>
                        <td>
                          {school.kendrashala_name ||
                            school.unit_name ||
                            school.school_name ||
                            `Unit ${school.unit_id}`}
                        </td>
                        <td>
                          {school.status === "complete" ? (
                            <span className="badge bg-success">Ready</span>
                          ) : (
                            <span className="badge bg-danger">Missing</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            disabled={school.status !== "complete"}
                            onClick={() => downloadSelectedReport(school.unit_id)}
                          >
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminCard>
          </div>
        )}
        {reportSchools.length === 0 && !reportLoading && (
          <div className="text-muted mt-3">No report data found...</div>
        )}
      </div>
    );
  };

  const downloadSelectedReport = async (unitId) => {
    try {
      const token = localStorage.getItem("token");
      let endpoint;
      if (reportType === "annual") {
        endpoint = `http://localhost:5000/api/report/units/${unitId}/report`;
      } else {
        endpoint = `http://localhost:5000/api/report/download?unit=${unitId}&year=${selectedReportYear}&type=${reportType}`;
      }
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${reportType}_report_${unitId}_${selectedReportYear}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert(
        "Failed to download report: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  async function handleUnitCardClick(unitId) {
    setUnitLoading(true);
    setSelectedUnit(unitId);
    setTeacherSearch("");
    setStudentSearch("");
    setStudentsYear("");
    setFyMetrics(null);
    setOverviewMetrics(null);
    try {
      const token = localStorage.getItem("token");
      const [detailRes, fyRes, overviewRes] =
        await Promise.all([
          axios.get(`http://localhost:5000/api/admin/units/${unitId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            `http://localhost:5000/api/admin/units/${unitId}/finance-by-year?financial_year=${selectedFy}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `http://localhost:5000/api/admin/units/${unitId}/finance-by-year?financial_year=${selectedOverviewFy}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);
      setUnitDetails(detailRes.data);
      setFyMetrics(fyRes.data);
      setOverviewMetrics(overviewRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load unit details");
    }
    setUnitLoading(false);
  }

  useEffect(() => {
    if (!selectedUnit) return;
    async function reloadFy() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/admin/units/${selectedUnit}/finance-by-year?financial_year=${selectedFy}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFyMetrics(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    reloadFy();
  }, [selectedUnit, selectedFy]);

  useEffect(() => {
    if (!selectedUnit) return;
    async function reloadOverviewFy() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/admin/units/${selectedUnit}/finance-by-year?financial_year=${selectedOverviewFy}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOverviewMetrics(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    reloadOverviewFy();
  }, [selectedUnit, selectedOverviewFy]);

  const teacherFields = [
    ["staff_id", "Staff ID"],
    ["full_name", "Full Name"],
    ["email", "Email"],
    ["phone", "Phone"],
    ["qualification", "Qualification"],
    ["designation", "Designation"],
    ["subject", "Subject"],
    ["joining_date", "Joining Date"],
    ["updatedat", "Updated At"],
  ];

  const studentFields = [
    ["student_id", "Student ID"],
    ["full_name", "Full Name"],
    ["standard", "Standard"],
    ["division", "Division"],
    ["roll_number", "Roll Number"],
    ["academic_year", "Academic Year"],
    ["passed", "Passed"],
    ["dob", "DOB"],
    ["gender", "Gender"],
    ["address", "Address"],
    ["parent_name", "Parent Name"],
    ["parent_phone", "Parent Phone"],
    ["admission_date", "Admission Date"],
    ["createdat", "Created At"],
    ["updatedat", "Updated At"],
  ];

  const allStudentYears = unitDetails?.students
    ? Array.from(
        new Set(unitDetails.students.map((s) => s.academic_year).filter(Boolean))
      )
        .sort()
        .reverse()
    : [];

  const filteredTeachers = unitDetails?.teachers
    ? unitDetails.teachers.filter((t) =>
        Object.values(t)
          .join(" ")
          .toLowerCase()
          .includes(teacherSearch.toLowerCase())
      )
    : [];

  function handleTeacherColumnToggle(key) {
    setTeacherVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]
    );
  }

  const filteredStudents = unitDetails?.students
    ? unitDetails.students.filter(
        (s) =>
          (!studentsYear || s.academic_year === studentsYear) &&
          Object.values(s)
            .join(" ")
            .toLowerCase()
            .includes(studentSearch.toLowerCase())
      )
    : [];

  function handleStudentColumnToggle(key) {
    setStudentVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]
    );
  }

    function DynamicDropdownTable({ tableName, data }) {
      const [visibleCols, setVisibleCols] = useState(() =>
        data.length ? Object.keys(data[0]) : []
      );
      const [selectShow, setSelectShow] = useState(false);
      useEffect(() => {
        if (data.length) setVisibleCols(Object.keys(data[0]));
      }, [data]);
      if (!data.length)
        return (
          <div className="mb-4 text-muted small">No {tableName} records found.</div>
        );
      const cols = Object.keys(data[0]);
      function handleToggle(col) {
        setVisibleCols((prev) =>
          prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
        );
      }
      return (
        <div className="dynamic-table-wrapper">
          <div className="dynamic-table-header d-flex justify-content-end align-items-center mb-3">
            <div className="position-relative">

            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setSelectShow((s) => !s)}
            >
              <i className="bi bi-columns-gap me-1"></i> Columns
            </button>
            {selectShow && (
              <div className="col-dropdown p-3 border rounded shadow-sm bg-white position-absolute end-0 mt-2" style={{ zIndex: 1000, minWidth: '200px' }}>
                {cols.map((col) => (
                  <div key={col} className="form-check mb-1">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`col-check-table-${tableName}-${col}`}
                      checked={visibleCols.includes(col)}
                      onChange={() => handleToggle(col)}
                    />
                    <label
                      className="form-check-label small"
                      htmlFor={`col-check-table-${tableName}-${col}`}
                    >
                      {toLabel(col)}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
          <div className="table-responsive">
            <table className="table table-hover table-sm">
              <thead>
                <tr>
                  {cols
                    .filter((col) => visibleCols.includes(col))
                    .map((col) => (
                      <th key={col}>{toLabel(col)}</th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={tableName + "-row-" + i}>
                    {cols
                      .filter((col) => visibleCols.includes(col))
                      .map((col) => (
                        <td key={col}>
                          {row[col] != null ? row[col].toString() : ""}
                        </td>
                      ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }


  const renderUnitDetails = () =>
    unitDetails ? (
      <div className="school-detail-view">
        <SchoolContextHeader
          schoolName={unitDetails.kendrashala_name}
          semisNo={unitDetails.semis_no || "-"}
          headmasterName={unitDetails.headmistress_name || "-"}
          totalStudents={unitDetails.students?.length ?? 0}
          totalTeachers={unitDetails.teachers?.length ?? 0}
          onBack={() => {
            setSelectedUnit(null);
            setUnitDetails(null);
            setSelectedSchoolTab("overview");
          }}
          onGenerateReport={() => {
            setSidebarTab("reports");
          }}
        />

        <TabNavigation
          tabs={[
            { id: "overview", label: "Overview", icon: "bi-grid-1x2" },
            { id: "finance", label: "Finance", icon: "bi-cash-stack" },
            { id: "teachers", label: "Teachers", icon: "bi-people" },
            { id: "students", label: "Students", icon: "bi-mortarboard" },
            { id: "payments", label: "Payments", icon: "bi-credit-card" },
            { id: "banks", label: "Banks", icon: "bi-bank" },
            { id: "cases", label: "Legal / Cases", icon: "bi-shield-shaded" },
          ]}
          activeTab={selectedSchoolTab}
          onTabChange={setSelectedSchoolTab}
        />

        {/* TAB CONTENT - Overview */}
        {selectedSchoolTab === "overview" && (
          <div className="tab-pane-content">
            <div className="row">
              <div className="col-md-12">
                <AdminCard header="Summary">
                   <div className="metrics-grid">
                     <div className="metric-box">
                       <span className="label">STAFF</span>
                       <span className="value">{unitDetails.teachers?.length ?? 0}</span>
                     </div>
                     <div className="metric-box">
                       <span className="label">STUDENTS</span>
                       <span className="value">{unitDetails.students?.length ?? 0}</span>
                     </div>
                     <div className="metric-box">
                       <span className="label">RATIO</span>
                       <span className="value">
                         {unitDetails.students?.length && unitDetails.teachers?.length
                           ? (unitDetails.students.length / unitDetails.teachers.length).toFixed(1)
                           : "0"}
                       </span>
                     </div>
                     <div className="metric-box highlight">
                       <span className="label">FEES</span>
                       <span className="value">₹{(overviewMetrics?.feesCollectedFy ?? 0).toLocaleString()}</span>
                     </div>
                   </div>
                </AdminCard>
                <div className="mt-4">
                  <AdminCard header="Identity">
                    <div className="profile-details-grid">
                      {[
                        ["unit_id", "Unit ID"],
                        ["semis_no", "SEMIS No"],
                        ["standard_range", "Range"],
                        ["school_shift", "Shift"],
                      ].map(([key, label]) => (
                        <div key={key} className="profile-row">
                          <span className="field-label">{label}</span>
                          <span className="field-value">{unitDetails[key] || "-"}</span>
                        </div>
                      ))}
                    </div>
                  </AdminCard>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT - Finance */}
        {selectedSchoolTab === "finance" && (
          <div className="tab-pane-content">
             <AdminCard header="Finance Insights">
               <div className="d-flex justify-content-between align-items-center mb-4">
                 <div>
                   <h6 className="mb-0">Financial Metrics</h6>
                   <p className="text-muted small mb-0">Overview of budget and expenses</p>
                 </div>
                 <select
                   value={selectedOverviewFy}
                   onChange={(e) => setSelectedOverviewFy(e.target.value)}
                   className="form-select form-select-sm"
                   style={{ width: '150px' }}
                 >
                   <option value="2023-24">2023-24</option>
                   <option value="2024-25">2024-25</option>
                   <option value="2025-26">2025-26</option>
                 </select>
               </div>
               
               <div className="finance-summary-grid">
                 <div className="finance-item budget">
                    <span className="label">BUDGET SUMMARY</span>
                    <span className="value">₹ {(overviewMetrics?.feesCollectedFy || 0).toLocaleString()}</span>
                    <span className="sub">Expected Fees</span>
                 </div>
                 <div className="finance-item collected">
                    <span className="label">FEES COLLECTED</span>
                    <span className="value">₹ {(overviewMetrics?.feesCollectedFy || 0).toLocaleString()}</span>
                    <span className="sub">Actual Amount</span>
                 </div>
                 <div className="finance-item pending">
                    <span className="label">PENDING FEES</span>
                    <span className="value">₹ {( (overviewMetrics?.feesCollectedFy || 0) * 0.1).toLocaleString()}</span>
                    <span className="sub">To be Collected</span>
                 </div>
                 <div className="finance-item spent">
                    <span className="label">SALARY SPENT</span>
                    <span className="value">₹ {(overviewMetrics?.salarySpentFy || 0).toLocaleString()}</span>
                    <span className="sub">Total Payroll</span>
                 </div>
               </div>
             </AdminCard>
          </div>
        )}

        {/* TAB CONTENT - Teachers */}
        {selectedSchoolTab === "teachers" && (
          <div className="tab-pane-content">
            <AdminCard header="Staff Directory">
               <TableContainer
                 title=""
                 toolbar={
                   <Toolbar
                     left={
                       <input
                         type="text"
                         className="form-control form-control-sm"
                         placeholder="Search teachers..."
                         style={{ maxWidth: 250 }}
                         value={teacherSearch}
                         onChange={(e) => setTeacherSearch(e.target.value)}
                       />
                     }
                     right={
                       <div className="position-relative">
                         <button
                           className="btn btn-sm btn-outline-secondary"
                           onClick={() => setTeachersShowColDropdown(!teachersShowColDropdown)}
                         >
                           <i className="bi bi-columns-gap me-1"></i> Columns
                         </button>
                         {teachersShowColDropdown && (
                           <div className="col-dropdown p-3 border rounded shadow-sm bg-white position-absolute end-0 mt-2" style={{ zIndex: 1000, minWidth: '200px' }}>
                             {teacherFields.map(([key, label]) => (
                               <div key={key} className="form-check mb-1">
                                 <input
                                   className="form-check-input"
                                   type="checkbox"
                                   id={`col-check-teacher-${key}`}
                                   checked={teacherVisibleColumns.includes(key)}
                                   onChange={() => handleTeacherColumnToggle(key)}
                                 />
                                 <label className="form-check-label small" htmlFor={`col-check-teacher-${key}`}>
                                   {label}
                                 </label>
                               </div>
                             ))}
                           </div>
                         )}
                       </div>
                     }
                   />
                 }
               >
                 {filteredTeachers.length === 0 ? (
                   <EmptyState title="No Records" description="No teacher records found for this unit." />
                 ) : (
                   <div className="table-responsive">
                     <table className="table table-hover table-sm">
                       <thead>
                         <tr>
                           {teacherFields
                             .filter(([key]) => teacherVisibleColumns.includes(key))
                             .map(([key, label]) => <th key={key}>{label}</th>)}
                         </tr>
                       </thead>
                       <tbody>
                         {filteredTeachers.map((tch) => (
                           <tr key={tch.staff_id}>
                             {teacherFields
                               .filter(([key]) => teacherVisibleColumns.includes(key))
                               .map(([key]) => <td key={key}>{tch[key] || "-"}</td>)}
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 )}
               </TableContainer>
            </AdminCard>
          </div>
        )}

        {/* TAB CONTENT - Students */}
        {selectedSchoolTab === "students" && (
          <div className="tab-pane-content">
            <AdminCard header="Student Enrollment">
               <TableContainer
                 title=""
                 toolbar={
                   <Toolbar
                     left={
                       <div className="d-flex gap-2">
                         <input
                           type="text"
                           className="form-control form-control-sm"
                           placeholder="Search students..."
                           value={studentSearch}
                           onChange={(e) => setStudentSearch(e.target.value)}
                         />
                         <select
                           value={studentsYear}
                           onChange={(e) => setStudentsYear(e.target.value)}
                           className="form-select form-select-sm w-auto"
                         >
                           <option value="">All Years</option>
                           {allStudentYears.map(y => <option key={y} value={y}>{y}</option>)}
                         </select>
                       </div>
                     }
                     right={
                        <div className="position-relative">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setStudentsShowColDropdown(!studentsShowColDropdown)}
                          >
                            <i className="bi bi-columns-gap me-1"></i> Columns
                          </button>
                          {studentsShowColDropdown && (
                            <div className="col-dropdown p-3 border rounded shadow-sm bg-white position-absolute end-0 mt-2" style={{ zIndex: 1000, minWidth: '200px' }}>
                              {studentFields.map(([key, label]) => (
                                <div key={key} className="form-check mb-1">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`col-check-student-${key}`}
                                    checked={studentVisibleColumns.includes(key)}
                                    onChange={() => handleStudentColumnToggle(key)}
                                  />
                                  <label className="form-check-label small" htmlFor={`col-check-student-${key}`}>
                                    {label}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                     }
                   />
                 }
               >
                 {filteredStudents.length === 0 ? (
                   <EmptyState title="No Records" description="No student records found." />
                 ) : (
                   <div className="table-responsive">
                     <table className="table table-hover table-sm">
                       <thead>
                         <tr>
                           {studentFields
                             .filter(([key]) => studentVisibleColumns.includes(key))
                             .map(([key, label]) => <th key={key}>{label}</th>)}
                         </tr>
                       </thead>
                       <tbody>
                         {filteredStudents.map((s) => (
                           <tr key={s.student_id}>
                             {studentFields
                               .filter(([key]) => studentVisibleColumns.includes(key))
                               .map(([key]) => (
                                 <td key={key}>
                                   {key === "passed" ? (s[key] ? "Yes" : "No") : (s[key] || "-")}
                                 </td>
                               ))}
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 )}
                </TableContainer>
              )}
            </div>
          )}

        {/* TAB CONTENT - Generic tables */}
        {["payments", "banks", "cases"].includes(selectedSchoolTab) && (
          <div className="tab-pane-content">
            <AdminCard header={selectedSchoolTab.charAt(0).toUpperCase() + selectedSchoolTab.slice(1)}>
              <DynamicDropdownTable
                tableName={selectedSchoolTab.charAt(0).toUpperCase() + selectedSchoolTab.slice(1)}
                data={unitDetails[selectedSchoolTab] ?? []}
              />
            </AdminCard>
          </div>
        )}

      </div>
    ) : null;

  const renderDashboardMain = () => (
    <div className="dashboard-main-view">
      <div className="dashboard-hero-title">
        <h3>School Overview</h3>
        <p>Monitor and manage all academic units</p>
      </div>
      <div className="row school-grid">
        {safeUnits.length === 0 ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Synchronizing units...</p>
          </div>
        ) : (
          safeUnits.map((unit, idx) => (
            <div key={unit.unit_id} className="col-md-4 col-sm-6 mb-4">
              <div className="school-card-pro" onClick={() => handleUnitCardClick(unit.unit_id)}>
                 <div className="card-accent-line"></div>
                 <div className="card-index-pill">{idx + 1}</div>
                 <div className="card-top-meta">
                   <span className="unit-tag">Unit {unit.unit_id}</span>
                 </div>
                 <h4 className="school-display-name">{unit.kendrashala_name || "MKSSS School Unit"}</h4>
                 <div className="card-stats-row">
                   <div className="stat-item-mini">
                     <i className="bi bi-people-fill"></i>
                     <span>{unit.staff_count || 0} Staff</span>
                   </div>
                   <div className="stat-item-mini">
                     <i className="bi bi-mortarboard-fill"></i>
                     <span>{unit.student_count || 0} Students</span>
                   </div>
                 </div>
                 <div className="card-action-bar">
                   <span>View Details</span>
                   <i className="bi bi-arrow-right-short"></i>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (sidebarTab) {
      case "dashboard":
        if (selectedUnit && unitDetails) return renderUnitDetails();
        return renderDashboardMain();

      case "charts":
        return (
          <AdminCharts units={units} />
        );

      case "notifications":
        return (
          <div className="notifications-portal">
            <div className="row">
              <div className="col-lg-6 mb-4">
                <AdminCard header="Send Global Notification">
                  <form onSubmit={addNotification}>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">RECEIVER ROLE</label>
                      <select className="form-select" value={notifRole} onChange={(e) => setNotifRole(e.target.value)}>
                        <option value="principal">Principal</option>
                        <option value="teacher">Teacher</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">TITLE</label>
                      <input type="text" className="form-control" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">MESSAGE</label>
                      <textarea className="form-control" rows={3} value={notifMsg} onChange={(e) => setNotifMsg(e.target.value)} required />
                    </div>
                    <button className="btn btn-primary w-100" disabled={notifLoading} type="submit">
                      {notifLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-send me-2"></i>}
                      Dispatch Notification
                    </button>
                  </form>
                </AdminCard>
              </div>

              <div className="col-lg-6 mb-4">
                <AdminCard header="Create & Distribute Form">
                  <form onSubmit={addForm}>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">TARGET ROLE</label>
                      <select className="form-select" value={formRole} onChange={(e) => setFormRole(e.target.value)}>
                        <option value="principal">Principal</option>
                        <option value="teacher">Teacher</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">FORM TITLE</label>
                      <input type="text" className="form-control" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">DEADLINE</label>
                      <input type="datetime-local" className="form-control" value={formDeadline} onChange={(e) => setFormDeadline(e.target.value)} />
                    </div>
                    
                    <div className="questions-section mb-3">
                      <label className="form-label small fw-bold d-flex justify-content-between">
                        QUESTIONS
                        <button type="button" className="btn btn-link btn-sm p-0" onClick={addFormQuestion}>+ Add More</button>
                      </label>
                      {formQuestions.map((q, idx) => (
                        <div key={idx} className="p-3 border rounded bg-light mb-2">
                          <input placeholder="Enter question..." className="form-control mb-2" value={q.question_text} required onChange={(e) => handleQuestionChange(idx, "question_text", e.target.value)} />
                          <div className="d-flex gap-2">
                             <select className="form-select w-auto" value={q.question_type} onChange={(e) => handleQuestionChange(idx, "question_type", e.target.value)}>
                               <option value="text">Input Text</option>
                               <option value="mcq">Multiple Choice</option>
                             </select>
                             {q.question_type === "mcq" && (
                               <input placeholder="Option 1, Option 2..." className="form-control" value={q.options} onChange={(e) => handleQuestionChange(idx, "options", e.target.value)} />
                             )}
                             <button type="button" className="btn btn-outline-danger" onClick={() => removeFormQuestion(idx)} disabled={formQuestions.length === 1}><i className="bi bi-trash"></i></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="btn btn-success w-100" disabled={formLoading} type="submit">
                      {formLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-plus-circle me-2"></i>}
                      Launch Form Campaign
                    </button>
                  </form>
                </AdminCard>
              </div>
            </div>
            
            <div className="row">
               <div className="col-md-12">
                  <AdminCard header="Recent Activity">
                    <div className="list-group list-group-flush">
                      {notifications.slice(0, 5).map(n => (
                        <div key={n.id} className="list-group-item px-0">
                          <div className="d-flex w-100 justify-content-between">
                            <h6 className="mb-1">{n.title}</h6>
                            <small className="text-muted">Notification</small>
                          </div>
                          <p className="mb-1 small text-muted">{n.message}</p>
                        </div>
                      ))}
                      {forms.slice(0, 5).map(f => (
                        <div key={f.id} className="list-group-item px-0">
                          <div className="d-flex w-100 justify-content-between">
                            <h6 className="mb-1 text-primary">{f.title}</h6>
                            <small className="text-muted">Active Form</small>
                          </div>
                          <p className="mb-1 small text-muted">Deadline: {f.deadline ? new Date(f.deadline).toLocaleDateString() : 'No limit'}</p>
                        </div>
                      ))}
                    </div>
                  </AdminCard>
               </div>
            </div>
          </div>
        );

      case "reports":
        return renderReportsPage();

      default:
        return null;
    }
  };

  return (
    <AdminLayout
      activeSidebarTab={sidebarTab}
      onSidebarTabChange={setSidebarTab}
      schoolName={unitDetails?.kendrashala_name}
      semisId={unitDetails?.semis_no}
    >
      <div className="dashboard-wrapper">
        {loading || unitLoading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <div className="spinner-grow text-primary" role="status"></div>
            <span className="mt-3 text-muted fw-bold">Syncing Dashboard Data...</span>
          </div>
        ) : error ? (
          <div className="alert alert-custom-danger d-flex align-items-center" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-3 fs-3"></i>
            <div>
              <div className="fw-bold">Configuration Error</div>
              {error}
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </div>
      <ChatWidget />
    </AdminLayout>
  );
}
