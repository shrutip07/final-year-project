import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "./Dashboard.scss";

import AdminCharts from "./Charts";
import ChatWidget from "../../components/ChatWidget";
import PageHeader from "../../components/admin/PageHeader";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import Toolbar from "../../components/admin/Toolbar";
import EmptyState from "../../components/admin/EmptyState";
import AdminUnitImport from "./AdminUnitImport";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const [sidebarTab, setSidebarTab] = useState("dashboard");
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitDetails, setUnitDetails] = useState(null);
  const [unitLoading, setUnitLoading] = useState(false);

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
  const [unitDashboard, setUnitDashboard] = useState(null);
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

  const sidebarItems = [
    { key: "dashboard", label: t("dashboard"), icon: "bi-speedometer2" },
    { key: "tables", label: t("tables"), icon: "bi-table" },
    { key: "charts", label: t("charts"), icon: "bi-bar-chart-fill" },
    { key: "budgets", label: t("budgets"), icon: "bi-wallet2" },
    { key: "notifications", label: t("notifications"), icon: "bi-bell-fill" },
    { key: "reports", label: "Reports", icon: "bi-file-earmark-text" },
  ];

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

  // Helper: convert snake_case keys to human readable labels
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
    // Generic: split on underscores and camelCase boundaries
    return key
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .split(/_|\s+/)
      .filter(Boolean)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ");
  };

  // Load notifications + forms when tab opened or role changes
  useEffect(() => {
    if (sidebarTab === "notifications") {
      loadNotifications();
      loadForms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // ===============================
  // REPORT: Fetch Available Academic Years
  // ===============================
  const loadReportYears = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get("http://localhost:5000/api/report/years", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setReportYears(res.data || []);
    if (res.data && res.data.length > 0) {
      setSelectedReportYear(res.data[0]); // auto-select first year
    }
  } catch (err) {
    console.error("Failed to load report years", err);
    setReportYears([]);
  }
  };

  // ===============================
  // REPORT: Fetch schools for selected year and type
  // ===============================
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


  // ===============================
  // REPORT PAGE UI
  // ===============================
  const renderReportsPage = () => {
    return (
      <div className="page-inner">
        <PageHeader
          title="Generate Reports"
          subtitle="Select academic year and report type, then download per school"
        />

        {/* Academic Year Dropdown */}
        <label className="fw-semibold">Select Academic Year</label>
        <select
          className="form-select mb-3"
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

        {/* Report Type Dropdown */}
        <label className="fw-semibold">Select Report Type</label>
        <select
          className="form-select mb-3"
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
        >
          <option value="annual">Annual Academic Report</option>
          <option value="payroll">Staff Payroll Report</option>
          <option value="finance">Financial Allocation Report</option>
          <option value="safety">School Safety &amp; Compliance Report</option>
        </select>

        <button
          className="btn btn-primary mb-4"
          disabled={!selectedReportYear}
          onClick={fetchReportSchools}
        >
          {reportLoading ? (
            <span className="spinner-border spinner-border-sm" />
          ) : (
            "Fetch Schools"
          )}
        </button>

        {/* Show table if results exist */}
        {reportSchools.length > 0 && (
          <table className="table table-bordered">
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
        )}

        {reportSchools.length === 0 && !reportLoading && (
          <div className="text-muted mt-3">No report data found...</div>
        )}
      </div>
    );
  };

  // ===============================
  // REPORT: Download selected report for one unit
  // ===============================
  const downloadSelectedReport = async (unitId) => {
    try {
      const token = localStorage.getItem("token");

      let endpoint;
      if (reportType === "annual") {
        // annual report
        endpoint = `http://localhost:5000/api/report/units/${unitId}/report`;
      } else {
        // payroll / finance / safety
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


  // -----------------------------------
  // UNIT DETAILS + DASHBOARD DATA LOAD
  // -----------------------------------
  async function handleUnitCardClick(unitId) {
    setUnitLoading(true);
    setSelectedUnit(unitId);
    setTeacherSearch("");
    setStudentSearch("");
    setStudentsYear("");
    setUnitDashboard(null);
    setFyMetrics(null);
    setOverviewMetrics(null);

    try {
      const token = localStorage.getItem("token");

      const [detailRes, dashboardRes, fyRes, overviewRes] =
        await Promise.all([
          axios.get(`http://localhost:5000/api/admin/units/${unitId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(
            `http://localhost:5000/api/admin/units/${unitId}/dashboard-data`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
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
      setUnitDashboard(dashboardRes.data);
      setFyMetrics(fyRes.data);
      setOverviewMetrics(overviewRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load unit details");
    }
    setUnitLoading(false);
  }

  // Reload FY metrics if year changes
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

  // -----------------------
  // TABLE FIELD DEFINITIONS
  // -----------------------
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

  // Reusable dynamic table
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
        <div className="mb-4 text-muted">{tableName} not available</div>
      );

    const cols = Object.keys(data[0]);

    function handleToggle(col) {
      setVisibleCols((prev) =>
        prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
      );
    }

    return (
      <div className="dynamic-table-wrapper">
        <div className="dynamic-table-header">
          <span className="fw-bold">{tableName}</span>
          <div className="dropdown dropdown-columns">
            <button
              className="btn btn-outline-secondary btn-sm dropdown-toggle"
              type="button"
              onClick={() => setSelectShow((s) => !s)}
            >
              Select Columns
            </button>
            {selectShow && (
              <div className="dropdown-menu show p-2 col-dropdown">
                {cols.map((col) => (
                  <div key={col} className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id={`col-check-table-${tableName}-${col}`}
                      checked={visibleCols.includes(col)}
                      onChange={() => handleToggle(col)}
                    />
                    <label
                      className="form-check-label"
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
          <table className="table table-striped table-bordered">
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

  // ----------------------
  // UNIT DETAILS UI
  // ----------------------
  const renderUnitDetails = () =>
    unitDetails ? (
      <div className="page-inner">
        <PageHeader
          title={unitDetails.kendrashala_name}
          subtitle={t("school_overview")}
          actions={
            // <button
            //   className="btn btn-outline-primary"
            //   onClick={() => {
            //     setSelectedUnit(null);
            //     setUnitDetails(null);
            //   }}
            // >
            //   ← {t("back_to_units")}
            // </button>
            <button
                className="btn btn-primary back-btn mb-3"
                onClick={() => {
                  setSelectedUnit(null);
                  setUnitDetails(null);
                }}
              >
                ← {t("back_to_units")}
              </button>
          }
        />

        <div className="unit-details-grid">
          <AdminCard header={t("school_summary")} className="summary-card">
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-value">
                  {unitDetails.teachers?.length ?? 0}
                </div>
                <div className="summary-label">{t("total_staff")}</div>
              </div>
              <div className="summary-item">
                <div className="summary-value">
                  {unitDetails.students?.length ?? 0}
                </div>
                <div className="summary-label">{t("total_students")}</div>
              </div>
              <div className="summary-item">
                <div className="summary-value">
                  {unitDetails.headmistress_name || "-"}
                </div>
                <div className="summary-label">{t("headmistress_name")}</div>
              </div>
              <div className="summary-item">
                <div className="summary-value">
                  {unitDetails.semis_no || "-"}
                </div>
                <div className="summary-label">SEMIS No</div>
              </div>
            </div>
          </AdminCard>

          <AdminCard header={t("school_details")} className="details-card">
            <div className="details-grid">
              {[
                ["unit_id", "Unit ID"],
                ["semis_no", "SEMIS No"],
                ["dcf_no", "DCF No"],
                ["nmms_no", "NMMS No"],
                ["scholarship_code", "Scholarship Code"],
                ["first_grant_in_aid_year", "First Grant Year"],
                ["type_of_management", "Management Type"],
                ["school_jurisdiction", "School Jurisdiction"],
                ["competent_authority_name", "Competent Authority"],
                ["authority_number", "Authority Number"],
                ["authority_zone", "Authority Zone"],
                ["info_authority_name", "Info Authority"],
                ["appellate_authority_name", "Appellate Authority"],
                ["midday_meal_org_name", "Midday Meal Org"],
                ["midday_meal_org_contact", "Midday Meal Contact"],
                ["standard_range", "Standard Range"],
                ["school_shift", "School Shift"],
              ].map(([key, label]) => (
                <div key={key} className="details-row">
                  <div className="details-key">{t(key) || label}</div>
                  <div className="details-value">
                    {unitDetails[key] ?? "-"}
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>

        {/* Unit overview metrics */}
        {unitDashboard && (
          <AdminCard header={t("unit_overview")} className="mt-3 section-card">
            <div className="unit-metrics-grid">
              <div className="metric-card metric-card--teachers">
                <div className="metric-label">{t("teachers")}</div>
                <div className="metric-value">
                  {unitDashboard.teacherCount || 0}
                </div>
              </div>
              <div className="metric-card metric-card--students">
                <div className="metric-label">{t("students")}</div>
                <div className="metric-value">
                  {unitDashboard.studentCount || 0}
                </div>
              </div>
              <div className="metric-card metric-card--ratio">
                <div className="metric-label">{t("teacher_ratio")}</div>
                <div className="metric-value">
                  {unitDashboard.studentCount &&
                  unitDashboard.teacherCount
                    ? (
                        unitDashboard.studentCount /
                        unitDashboard.teacherCount
                      ).toFixed(1)
                    : 0}
                </div>
              </div>
            </div>
          </AdminCard>
        )}

        {/* Finance overview */}
        {overviewMetrics && (
          
          <AdminCard header={t("finance_overview")} className="mt-3 section-card">
            <div className="finance-header-row finance-header-colored">
              <div className="finance-header-text">
                {t("financial_year")} &nbsp;
                <strong>{selectedOverviewFy}</strong>
              </div>
              <select
                value={selectedOverviewFy}
                onChange={(e) => setSelectedOverviewFy(e.target.value)}
                className="form-select form-select-sm fy-select"
              >
                <option value="2023-24">2023-24</option>
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
              </select>
            </div>
            <div className="finance-grid">
              <div className="finance-card finance-card--budget">
                <div className="finance-label">{t("total_budget")}</div>
                <div className="finance-subtitle">
                  {t("expected_fee_master")}
                </div>
                <div className="finance-value">
                  ₹{" "}
                  {(overviewMetrics.feesCollectedFy || 0).toLocaleString(
                    "en-IN"
                  )}
                </div>
              </div>
              <div className="finance-card finance-card--spent">
                <div className="finance-label">{t("total_spent")}</div>
                <div className="finance-subtitle">
                  {t("teacher_salary_paid")}
                </div>
                <div className="finance-value">
                  ₹{" "}
                  {(overviewMetrics.salarySpentFy || 0).toLocaleString(
                    "en-IN"
                  )}
                </div>
              </div>
            </div>
          </AdminCard>
        )}

        {/* Budget summary + balance */}
        {overviewMetrics && (
          <AdminCard header={t("budget_summary")} className="mt-3 section-card">
            <div className="finance-header-row finance-header-colored">
              <div className="finance-header-text">
                {t("Financial Year")} &nbsp;
                <strong>{selectedOverviewFy}</strong>
              </div>
              <select
                value={selectedOverviewFy}
                onChange={(e) => setSelectedOverviewFy(e.target.value)}
                className="form-select form-select-sm fy-select"
              >
                <option value="2023-24">2023-24</option>
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
              </select>
            </div>

            <div className="finance-grid">
              <div className="finance-card finance-card--positive">
                <div className="finance-label">{t("fees_collected")}</div>
                <div className="finance-subtitle">
                  {t("actual_fees_collected")}
                </div>
                <div className="finance-value">
                  ₹{" "}
                  {(overviewMetrics.feesCollectedFy || 0).toLocaleString(
                    "en-IN"
                  )}
                </div>
              </div>
              <div className="finance-card finance-card--pending">
                <div className="finance-label">{t("pending_fees")}</div>
                <div className="finance-subtitle">
                  {t("fees_yet_to_collect")}
                </div>
                <div className="finance-value">
                  ₹{" "}
                  {(
                    (overviewMetrics.feesCollectedFy || 0) -
                    (overviewMetrics.salarySpentFy || 0)
                  ).toLocaleString("en-IN")}
                </div>
              </div>
            </div>

            <div className="balance-strip">
              <div className="balance-label">
                {t("balance")} ({t("collected_minus_spent")})
              </div>
              <div className="balance-equation">
                ₹
                {(overviewMetrics.feesCollectedFy || 0).toLocaleString(
                  "en-IN"
                )}{" "}
                - ₹
                {(overviewMetrics.salarySpentFy || 0).toLocaleString(
                  "en-IN"
                )}{" "}
                =
              </div>
              <div
                className={
                  (overviewMetrics.feesCollectedFy || 0) -
                    (overviewMetrics.salarySpentFy || 0) >=
                  0
                    ? "balance-value balance-value--positive"
                    : "balance-value balance-value--negative"
                }
              >
                ₹{" "}
                {(
                  (overviewMetrics.feesCollectedFy || 0) -
                  (overviewMetrics.salarySpentFy || 0)
                ).toLocaleString("en-IN")}
              </div>
            </div>
          </AdminCard>
        )}

        {/* Financial year metrics card */}
        {fyMetrics && (
          <AdminCard
            header={`${t("financial_year")} ${fyMetrics.financial_year}`}
            className="mt-3 section-card"
          >
            <div className="finance-header-row finance-header-colored">
              <div className="finance-header-text">
                {t("Financial Year")} &nbsp;
                <strong>{selectedOverviewFy}</strong>
              </div>
              <select
                value={selectedFy}
                onChange={(e) => setSelectedFy(e.target.value)}
                className="form-select form-select-sm fy-select"
              >
                <option value="2023-24">2023-24</option>
                <option value="2024-25">2024-25</option>
                <option value="2025-26">2025-26</option>
              </select>
            </div>
            <div className="fy-metrics-grid">
              <div className="fy-metric-card">
                <div className="fy-label">{t("fees_collected_in_fy")}</div>
                <div className="fy-value">
                  ₹
                  {Number(
                    fyMetrics.feesCollectedFy || 0
                  ).toLocaleString("en-IN")}
                </div>
              </div>
              <div className="fy-metric-card fy-metric-card--spent">
                <div className="fy-label">{t("salary_spent_in_fy")}</div>
                <div className="fy-value">
                  ₹
                  {Number(
                    fyMetrics.salarySpentFy || 0
                  ).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </AdminCard>
        )}

        {/* Teachers Section */}
        <AdminCard
          header={t("teachers")}
          className="mt-4 section-card section-card--table"
        >
          <TableContainer
            title={t("teachers")}
            toolbar={
              <Toolbar
                left={
                  <input
                    type="text"
                    className="form-control"
                    placeholder={
                      t("search_teachers") || "Search teachers..."
                    }
                    style={{ maxWidth: 320 }}
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                  />
                }
                right={
                  <div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() =>
                        setTeachersShowColDropdown((s) => !s)
                      }
                    >
                      Select Columns
                    </button>
                    {teachersShowColDropdown && (
                      <div className="col-dropdown p-2">
                        {teacherFields.map(([key, label]) => (
                          <div key={key} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`col-check-teacher-${key}`}
                              checked={teacherVisibleColumns.includes(key)}
                              onChange={() =>
                                handleTeacherColumnToggle(key)
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`col-check-teacher-${key}`}
                            >
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
              <EmptyState
                title={t("no_teachers")}
                description={
                  t("no_teachers_found") || "No teachers found"
                }
              />
            ) : (
              <table className="table table-striped table-bordered">
                <thead>
                  <tr>
                    {teacherFields
                      .filter(([key]) =>
                        teacherVisibleColumns.includes(key)
                      )
                      .map(([key, label]) => (
                        <th key={key}>{label}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((tch) => (
                    <tr key={tch.staff_id}>
                      {teacherFields
                        .filter(([key]) =>
                          teacherVisibleColumns.includes(key)
                        )
                        .map(([key]) => (
                          <td key={key}>
                            {tch[key] != null ? tch[key] : ""}
                          </td>
                        ))}
                  </tr>
                  ))}
                </tbody>
              </table>
            )}
          </TableContainer>
        </AdminCard>

        {/* Students Section */}
          <AdminCard
            header={t("students")}
            className="mt-4 section-card section-card--table"
          >
          <TableContainer
            title={t("students")}
            toolbar={
              <Toolbar
                left={
                  <input
                    type="text"
                    className="form-control"
                    placeholder={
                      t("search_students") || "Search students..."
                    }
                    style={{ maxWidth: 320 }}
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                }
                right={
                  <>
                    <select
                      value={studentsYear}
                      onChange={(e) =>
                        setStudentsYear(e.target.value)
                      }
                      className="form-control form-control-sm"
                      style={{
                        width: 160,
                        display: "inline-block",
                        marginLeft: 8,
                      }}
                    >
                      <option value="">All Years</option>
                      {allStudentYears.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      style={{ marginLeft: 8 }}
                      onClick={() =>
                        setStudentsShowColDropdown((s) => !s)
                      }
                    >
                      Select Columns
                    </button>
                    {studentsShowColDropdown && (
                      <div className="col-dropdown p-2">
                        {studentFields.map(([key, label]) => (
                          <div key={key} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`col-check-student-${key}`}
                              checked={studentVisibleColumns.includes(
                                key
                              )}
                              onChange={() =>
                                handleStudentColumnToggle(key)
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor={`col-check-student-${key}`}
                            >
                              {label}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                }
              />
            }
          >
            {filteredStudents.length === 0 ? (
              <EmptyState
                title={t("no_students")}
                description={
                  t("no_students_found") || "No students found"
                }
              />
            ) : (
              <table className="table table-striped table-bordered">
                <thead>
                  <tr>
                    {studentFields
                      .filter(([key]) =>
                        studentVisibleColumns.includes(key)
                      )
                      .map(([key, label]) => (
                        <th key={key}>{label}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr
                      key={
                        s.student_id +
                        "-" +
                        s.roll_number +
                        "-" +
                        s.academic_year
                      }
                    >
                      {studentFields
                        .filter(([key]) =>
                          studentVisibleColumns.includes(key)
                        )
                        .map(([key]) => (
                          <td key={key}>
                            {key === "passed"
                              ? s[key]
                                ? "Yes"
                                : "No"
                              : key === "dob" ||
                                key === "admission_date"
                              ? s[key]
                                ? new Date(
                                    s[key]
                                  ).toLocaleDateString()
                                : ""
                              : s[key] != null
                              ? s[key]
                              : ""}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </TableContainer>
        </AdminCard>

        {/* Other Unit detail tables (Payments, Budgets, Banks, Cases) */}
        <div className="mt-4">
        <AdminCard
          header={t("Payments")}
          className="mt-4 section-card section-card--table"
        >
            <DynamicDropdownTable
              tableName="Payments"
              data={unitDetails.payments ?? []}
            />
          </AdminCard>
              <AdminCard
                header={t("Budegts")}
                className="mt-4 section-card section-card--table"
              >
            <DynamicDropdownTable
              tableName="Budgets"
              data={unitDetails.budgets ?? []}
            />
          </AdminCard>
          <AdminCard
            header={t("Banks")}
            className="mt-4 section-card section-card--table"
          >
            <DynamicDropdownTable
              tableName="Banks"
              data={unitDetails.banks ?? []}
            />
          </AdminCard>
            <AdminCard
              header={t("Cases")}
              className="mt-4 section-card section-card--table"
            >
            <DynamicDropdownTable
              tableName="Cases"
              data={unitDetails.cases ?? []}
            />
          </AdminCard>
        </div>
      </div>
    ) : null;

  // ------------------------
  // MAIN CONTENT PER TAB
  // ------------------------
  const renderContent = () => {
    switch (sidebarTab) {
      case "dashboard":
        if (selectedUnit && unitDetails) return renderUnitDetails();
        return (
          <div className="page-inner">
            <PageHeader
              title={t("school_overview")}
              subtitle={t("manage_monitor_all_schools")}
            />
            <div className="row school-grid">
              {safeUnits.map((unit, idx) => (
                <div
                  key={unit.unit_id}
                  className="col-md-4 col-lg-3 col-sm-6 mb-4"
                >
                  <div
                    className="card school-card text-center p-3"
                    onClick={() => handleUnitCardClick(unit.unit_id)}
                  >
                    <div className="school-index">{idx + 1}</div>
                    <div className="school-name">
                      {unit.kendrashala_name}
                    </div>
                    <div className="school-meta">
                      {t("total_staff")}: {unit.staff_count || 0}
                    </div>
                    <div className="school-meta">
                      {t("total_students")}: {unit.student_count || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Unit Import Component */}
            <AdminUnitImport />
          </div>
        );

      case "charts":
        return (
          <div className="page-inner">
            <PageHeader
              title={t("charts")}
              subtitle={t("visualize_school_data")}
            />
            <AdminCharts units={units} />
          </div>
        );

      case "notifications":
        return (
          <div className="page-inner notifications-page">
            <PageHeader
              title="Admin Notification Panel"
              subtitle="Send notifications or create and manage forms"
            />

            <div className="two-col-grid">
              <AdminCard header="Send Notification">
                <form onSubmit={addNotification}>
                  <div className="form-group">
                    <label className="form-label">Send To</label>
                    <select
                      className="form-select"
                      value={notifRole}
                      onChange={(e) => setNotifRole(e.target.value)}
                    >
                      <option value="principal">Principal</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={notifMsg}
                      onChange={(e) => setNotifMsg(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      className="btn btn-primary"
                      disabled={notifLoading}
                      type="submit"
                    >
                      Send&nbsp;
                      {notifLoading ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <span>✅</span>
                      )}
                    </button>
                  </div>
                </form>
              </AdminCard>

              <AdminCard header="Create and Send Form">
                <form onSubmit={addForm}>
                  <div className="form-group">
                    <label className="form-label">Send To</label>
                    <select
                      className="form-select"
                      value={formRole}
                      onChange={(e) => setFormRole(e.target.value)}
                    >
                      <option value="principal">Principal</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Form Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Description (optional)
                    </label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Deadline</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={formDeadline}
                      onChange={(e) =>
                        setFormDeadline(e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Questions</label>
                    {formQuestions.map((q, idx) => (
                      <div key={idx} className="question-card">
                        <div className="row-inner">
                          <input
                            placeholder="Question text"
                            className="form-control"
                            value={q.question_text}
                            required
                            onChange={(e) =>
                              handleQuestionChange(
                                idx,
                                "question_text",
                                e.target.value
                              )
                            }
                          />
                          <select
                            className="form-select"
                            value={q.question_type}
                            onChange={(e) =>
                              handleQuestionChange(
                                idx,
                                "question_type",
                                e.target.value
                              )
                            }
                          >
                            <option value="text">Text</option>
                            <option value="mcq">MCQ</option>
                          </select>
                          {q.question_type === "mcq" && (
                            <input
                              placeholder="Comma separated options"
                              className="form-control"
                              value={q.options}
                              onChange={(e) =>
                                handleQuestionChange(
                                  idx,
                                  "options",
                                  e.target.value
                                )
                              }
                            />
                          )}
                        </div>
                        <div className="question-actions">
                          <button
                            type="button"
                            className="btn btn-outline-danger btn-sm"
                            onClick={() =>
                              removeFormQuestion(idx)
                            }
                            disabled={formQuestions.length === 1}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="form-actions-inline">
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={addFormQuestion}
                      >
                        Add Question
                      </button>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      className="btn btn-success"
                      disabled={formLoading}
                      type="submit"
                    >
                      Create Form &amp; Send Notification&nbsp;
                      {formLoading ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <span>✅</span>
                      )}
                    </button>
                  </div>
                </form>
              </AdminCard>
            </div>

            <div className="cards-row">
              <AdminCard header="Received Notifications">
                {notifications.length === 0 ? (
                  <EmptyState
                    title="No notifications"
                    description="Notifications sent from the system will appear here."
                  />
                ) : (
                  <ul className="list-unstyled mb-0">
                    {notifications.map((n) => (
                      <li key={n.id} className="mb-2">
                        <strong>{n.title}:</strong> {n.message}
                      </li>
                    ))}
                  </ul>
                )}
              </AdminCard>

              <AdminCard header={`Active Forms (${forms.length})`}>
                {forms.length === 0 ? (
                  <EmptyState
                    title="No active forms"
                    description="When you create a form, it will appear here."
                  />
                ) : (
                  <div className="forms-list">
                    {forms.map((f) => (
                      <div key={f.id || f._id} className="form-row">
                        <div className="form-row-title">{f.title}</div>
                        <div className="form-row-meta">
                          Deadline:&nbsp;
                          {f.deadline &&
                            new Date(
                              f.deadline
                            ).toLocaleString()}
                        </div>
                        {f.link && (
                          <a
                            href={f.link}
                            rel="noopener noreferrer"
                            target="_blank"
                            className="form-row-link"
                          >
                            Open form
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </AdminCard>
            </div>
          </div>
        );

      case "reports":
        return renderReportsPage();


      default:
        return null;
    }
  };

  function NotificationBell() {
    return null;
  }

  return (
    <div className="dashboard-container d-flex">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="app-icon">
            <i className="bi bi-buildings-fill"></i>
          </div>
          <h3>{t("admin_panel")}</h3>
        </div>
        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              className={`nav-link ${
                sidebarTab === item.key ? "active" : ""
              }`}
              onClick={() => {
                if (item.key === "tables") {
                  navigate("/admin/tables");
                } else {
                  setSidebarTab(item.key);
                }
              }}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button
            className="nav-link logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            <i className="bi bi-box-arrow-left"></i>
            
            <span>{t("logout")}</span>
          </button>
        </div>
      </div>

      <main className="main-content">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">
                {t("loading")}...
              </span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger m-4">{error}</div>
        ) : unitLoading ? (
          <div className="loading-spinner">
            <div className="spinner-border text-secondary" role="status">
              <span className="visually-hidden">
                {t("loading")}...
              </span>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </main>

      <ChatWidget />
    </div>
  );
}
