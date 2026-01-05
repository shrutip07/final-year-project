import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "./Dashboard.scss";
import axiosInstance from "../../api/axiosInstance";
import AdminLayout from "../../components/admin/AdminLayout";

import AdminCharts from "./Charts";
import ChatWidget from "../../components/ChatWidget";
import PageHeader from "../../components/admin/PageHeader";
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
  const [teachersShowColDropdown, setTeachersShowColDropdown] = useState(false);
  const [studentsShowColDropdown, setStudentsShowColDropdown] = useState(false);
  const [studentsYear, setStudentsYear] = useState("");

  // Notifications + Forms
  const [notifications, setNotifications] = useState([]);
  const [forms, setForms] = useState([]);

  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  const [notifRole, setNotifRole] = useState("principal");
  const [notifLoading, setNotifLoading] = useState(false);

  // shared targeting state
  const [notifUnitId, setNotifUnitId] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [sendAllTeachers, setSendAllTeachers] = useState(true);
  const [selectedTeachers, setSelectedTeachers] = useState([]);

  // Forms
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formRole, setFormRole] = useState("principal");
  const [formQuestions, setFormQuestions] = useState([
    { questiontext: "", questiontype: "text", options: "" },
  ]);
  const [formLoading, setFormLoading] = useState(false);

  // per-form recipient status (Sent / Received / Pending)
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [recipientStatus, setRecipientStatus] = useState([]);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [formResponses, setFormResponses] = useState([]);
  const [responsesLoading, setResponsesLoading] = useState(false);

  // dashboard / finance data for a unit
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
        const res = await axiosInstance.get("/admin/units");
        const unitData = Array.isArray(res.data) ? res.data : [];
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

  // Notifications tab: load extra data
  useEffect(() => {
    if (sidebarTab === "notifications") {
      fetchUnitsForNotifications();
      loadNotifications();
      loadForms();
    }
  }, [sidebarTab, formRole]);

  const fetchUnitsForNotifications = async () => {
    try {
      const res = await axiosInstance.get("/admin/units");
      setUnits(res.data || []);
    } catch (err) {
      console.error("Failed to load units", err);
      setUnits([]);
    }
  };

  // load teachers when notifRole / notifUnitId change
  useEffect(() => {
    if (notifRole !== "teacher" || !notifUnitId) {
      setTeachers([]);
      setSelectedTeachers([]);
      return;
    }

    async function loadTeachers() {
      try {
        const res = await axiosInstance.get(`/admin/units/${notifUnitId}/teachers`);
        setTeachers(res.data || []);
      } catch (err) {
        console.error("Failed to load teachers", err);
        setTeachers([]);
      }
    }

    loadTeachers();
  }, [notifRole, notifUnitId]);

  const loadNotifications = async () => {
    try {
      const res = await axiosInstance.get("/notifications");
      setNotifications(res.data || []);
    } catch {
      setNotifications([]);
    }
  };

  const loadForms = async () => {
    try {
      const res = await axiosInstance.get("/forms/created-by-me");
      setForms(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load forms:", err);
      setForms([]);
    }
  };

  const loadRecipientStatus = async (formId) => {
    setRecipientLoading(true);
    try {
      const res = await axiosInstance.get(`/forms/${formId}/recipient-status`);

      const raw = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      const normalized = raw.map((r) => ({
        ...r,
        has_responded:
          r.has_responded ??
          r.hasResponded ??
          r.responded ??
          r.is_responded ??
          false,
      }));

      setRecipientStatus(normalized);
    } catch (e) {
      console.error("Failed to load recipient status", e);
      setRecipientStatus([]);
    } finally {
      setRecipientLoading(false);
    }
  };

  const loadFormResponsesForDashboard = async (formId) => {
    setResponsesLoading(true);
    try {
      const res = await axiosInstance.get("/admin/filled-forms-detailed");

      const rows = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      const fid = parseInt(formId, 10);

      const formRows = rows.filter((r) => parseInt(r.form_id, 10) === fid);

      const map = new Map();
      for (const r of formRows) {
        const rid = r.response_id;
        if (!rid) continue;

        if (!map.has(rid)) {
          map.set(rid, {
            response_id: rid,
            submitted_by_name:
              r.submitted_by_name || r.full_name || r.email || "User",
            submitted_by_role: r.submitted_by_role || r.role || "",
            unit_name: r.unit_name || "",
            submitted_at: r.submitted_at || r.created_at || null,
            answers: [],
          });
        }

        map.get(rid).answers.push({
          question: r.question_text || r.question || "",
          answer: r.answer ?? "",
        });
      }

      const grouped = Array.from(map.values()).sort((a, b) => {
        const ta = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
        const tb = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
        return tb - ta;
      });

      setFormResponses(grouped);
    } catch (err) {
      console.error("Failed to load form responses", err);
      setFormResponses([]);
    } finally {
      setResponsesLoading(false);
    }
  };

  // helpers
  const validateTarget = (role, unitId, allTeachers, selTeachers) => {
    if (!unitId) {
      alert("Please select a school");
      return false;
    }
    if (role === "teacher" && !allTeachers && selTeachers.length === 0) {
      alert("Please select at least one teacher");
      return false;
    }
    return true;
  };

  const notifBasePayload = () => ({
    receiver_role: notifRole,
    unit_id: parseInt(notifUnitId, 10),
    send_all_teachers: notifRole === "teacher" ? sendAllTeachers : false,
    receiver_ids:
      notifRole === "teacher" && !sendAllTeachers
        ? selectedTeachers.map((id) => parseInt(id, 10))
        : [],
  });

  const formBasePayload = () => ({
    receiver_role: formRole,
    unit_id: parseInt(notifUnitId, 10),
    send_all_teachers: formRole === "teacher" ? sendAllTeachers : false,
    receiver_ids:
      formRole === "teacher" && !sendAllTeachers
        ? selectedTeachers.map((id) => parseInt(id, 10))
        : [],
  });

  const addNotification = async (e) => {
    e.preventDefault();

    if (
      !validateTarget(notifRole, notifUnitId, sendAllTeachers, selectedTeachers)
    )
      return;

    setNotifLoading(true);
    try {
      await axiosInstance.post("/notifications", {
        ...notifBasePayload(),
        title: notifTitle,
        message: notifMsg,
      });

      setNotifTitle("");
      setNotifMsg("");
      alert("Notification sent");
    } catch (err) {
      console.error("Failed to send notification", err);
      alert(err.response?.data?.error || "Failed to send notification");
    } finally {
      setNotifLoading(false);
    }
  };

  const addForm = async (e) => {
    e.preventDefault();

    if (
      !validateTarget(formRole, notifUnitId, sendAllTeachers, selectedTeachers)
    )
      return;

    setFormLoading(true);

    const questionsPayload = formQuestions.map((q) => ({
      question_text: q.questiontext,
      question_type: q.questiontype,
      options: q.options || null,
    }));

    try {
      const formRes = await axiosInstance.post("/forms/create", {
        title: formTitle,
        description: formDesc,
        deadline: formDeadline,
        questions: questionsPayload,
        ...formBasePayload(),
      });

      const formId = formRes.data.form.id;
      const formLink = `${window.location.origin}/forms/${formId}`;

      await axiosInstance.post("/notifications", {
        ...formBasePayload(),
        title: `New Form: ${formTitle}`,
        message: `Please fill this form before deadline: ${formLink}`,
      });

      setFormTitle("");
      setFormDesc("");
      setFormDeadline("");
      setFormQuestions([{ questiontext: "", questiontype: "text", options: "" }]);

      await loadForms();

      alert(`Form created and sent to ${formRes.data.recipients} recipient(s)`);
    } catch (err) {
      console.error("Failed to create/send form", err);
      alert(err.response?.data?.error || "Failed to create/send form");
    } finally {
      setFormLoading(false);
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
      { questiontext: "", questiontype: "text", options: "" },
    ]);
  };

  const removeFormQuestion = (idx) => {
    setFormQuestions((qs) => qs.filter((_, i) => i !== idx));
  };

  // REPORTS
  const loadReportYears = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5100/api/report/years", {
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
        `http://localhost:5100/api/report/schools?year=${selectedReportYear}&type=${reportType}`,
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
        <PageHeader
          title="Generate Reports"
          subtitle="Select academic year and report type, then download per school"
        />

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

  const downloadSelectedReport = async (unitId) => {
    try {
      const token = localStorage.getItem("token");

      let endpoint;
      if (reportType === "annual") {
        endpoint = `http://localhost:5100/api/report/units/${unitId}/report`;
      } else {
        endpoint = `http://localhost:5100/api/report/download?unit=${unitId}&year=${selectedReportYear}&type=${reportType}`;
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

  // UNIT DETAILS + dashboard
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
      const [detailRes, dashboardRes, fyRes, overviewRes] = await Promise.all([
        axiosInstance.get(`/admin/units/${unitId}`),
        axiosInstance.get(`/admin/units/${unitId}/dashboard-data`),

        axiosInstance.get(
          `/admin/units/${unitId}/finance-by-year?financial_year=${selectedFy}`
        ),

        axiosInstance.get(
          `/admin/units/${unitId}/finance-by-year?financial_year=${selectedOverviewFy}`
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

  useEffect(() => {
    if (!selectedUnit) return;
    async function reloadFy() {
      try {
        const res = await axiosInstance.get(
          `/admin/units/${selectedUnit}/finance-by-year?financial_year=${selectedFy}`
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
        const res = await axiosInstance.get(
          `/admin/units/${selectedUnit}/finance-by-year?financial_year=${selectedOverviewFy}`
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
    ? unitDetails.teachers.filter((tch) =>
        Object.values(tch)
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
      return <div className="mb-4 text-muted">{tableName} not available</div>;

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

  const renderUnitDetails = () =>
    unitDetails ? (
      <div className="page-inner">
        <PageHeader
          title={unitDetails.kendrashala_name}
          subtitle={t("school_overview")}
          actions={
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
                <div className="summary-value">{unitDetails.semis_no || "-"}</div>
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
                  <div className="details-value">{unitDetails[key] ?? "-"}</div>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>

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
                  {unitDashboard.studentCount && unitDashboard.teacherCount
                    ? (
                        unitDashboard.studentCount / unitDashboard.teacherCount
                      ).toFixed(1)
                    : 0}
                </div>
              </div>
            </div>
          </AdminCard>
        )}

        {overviewMetrics && (
          <AdminCard header={t("finance_overview")} className="mt-3 section-card">
            <div className="finance-header-row finance-header-colored">
              <div className="finance-header-text">
                {t("financial_year")} &nbsp; <strong>{selectedOverviewFy}</strong>
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
                <div className="finance-subtitle">{t("expected_fee_master")}</div>
                <div className="finance-value">
                  ₹ {(overviewMetrics.feesCollectedFy || 0).toLocaleString("en-IN")}
                </div>
              </div>
              <div className="finance-card finance-card--spent">
                <div className="finance-label">{t("total_spent")}</div>
                <div className="finance-subtitle">{t("teacher_salary_paid")}</div>
                <div className="finance-value">
                  ₹ {(overviewMetrics.salarySpentFy || 0).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </AdminCard>
        )}

        {overviewMetrics && (
          <AdminCard header={t("budget_summary")} className="mt-3 section-card">
            <div className="finance-header-row finance-header-colored">
              <div className="finance-header-text">
                {t("Financial Year")} &nbsp; <strong>{selectedOverviewFy}</strong>
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
                <div className="finance-subtitle">{t("actual_fees_collected")}</div>
                <div className="finance-value">
                  ₹ {(overviewMetrics.feesCollectedFy || 0).toLocaleString("en-IN")}
                </div>
              </div>
              <div className="finance-card finance-card--pending">
                <div className="finance-label">{t("pending_fees")}</div>
                <div className="finance-subtitle">{t("fees_yet_to_collect")}</div>
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
                ₹{(overviewMetrics.feesCollectedFy || 0).toLocaleString("en-IN")} - ₹{" "}
                {(overviewMetrics.salarySpentFy || 0).toLocaleString("en-IN")} =
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

        {fyMetrics && (
          <AdminCard
            header={`${t("financial_year")} ${fyMetrics.financial_year}`}
            className="mt-3 section-card"
          >
            <div className="finance-header-row finance-header-colored">
              <div className="finance-header-text">
                {t("Financial Year")} &nbsp; <strong>{selectedOverviewFy}</strong>
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
                  ₹{Number(fyMetrics.feesCollectedFy || 0).toLocaleString("en-IN")}
                </div>
              </div>
              <div className="fy-metric-card fy-metric-card--spent">
                <div className="fy-label">{t("salary_spent_in_fy")}</div>
                <div className="fy-value">
                  ₹{Number(fyMetrics.salarySpentFy || 0).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </AdminCard>
        )}

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
                    placeholder={t("search_teachers") || "Search teachers..."}
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
                      onClick={() => setTeachersShowColDropdown((s) => !s)}
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
                              onChange={() => handleTeacherColumnToggle(key)}
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
                description={t("no_teachers_found") || "No teachers found"}
              />
            ) : (
              <table className="table table-striped table-bordered">
                <thead>
                  <tr>
                    {teacherFields
                      .filter(([key]) => teacherVisibleColumns.includes(key))
                      .map(([key, label]) => (
                        <th key={key}>{label}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((tch) => (
                    <tr key={tch.staff_id}>
                      {teacherFields
                        .filter(([key]) => teacherVisibleColumns.includes(key))
                        .map(([key]) => (
                          <td key={key}>{tch[key] != null ? tch[key] : ""}</td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </TableContainer>
        </AdminCard>

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
                    placeholder={t("search_students") || "Search students..."}
                    style={{ maxWidth: 320 }}
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                }
                right={
                  <>
                    <select
                      value={studentsYear}
                      onChange={(e) => setStudentsYear(e.target.value)}
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
                      onClick={() => setStudentsShowColDropdown((s) => !s)}
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
                              checked={studentVisibleColumns.includes(key)}
                              onChange={() => handleStudentColumnToggle(key)}
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
                description={t("no_students_found") || "No students found"}
              />
            ) : (
              <table className="table table-striped table-bordered">
                <thead>
                  <tr>
                    {studentFields
                      .filter(([key]) => studentVisibleColumns.includes(key))
                      .map(([key, label]) => (
                        <th key={key}>{label}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr
                      key={s.student_id + "-" + s.roll_number + "-" + s.academic_year}
                    >
                      {studentFields
                        .filter(([key]) => studentVisibleColumns.includes(key))
                        .map(([key]) => (
                          <td key={key}>
                            {key === "passed"
                              ? s[key]
                                ? "Yes"
                                : "No"
                              : key === "dob" || key === "admission_date"
                              ? s[key]
                                ? new Date(s[key]).toLocaleDateString()
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
            header={t("Budgets")}
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
                <div key={unit.unit_id} className="col-md-4 col-lg-3 col-sm-6 mb-4">
                  <div
                    className="card school-card text-center p-3"
                    onClick={() => handleUnitCardClick(unit.unit_id)}
                  >
                    <div className="school-index">{idx + 1}</div>
                    <div className="school-name">{unit.kendrashala_name}</div>
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

            <div className="row g-3">
              <div className="col-lg-6">
                <AdminCard header="Send Notification">
                  <form onSubmit={addNotification}>
                    <div className="mb-3">
                      <label className="form-label">Select School</label>
                      <select
                        className="form-select"
                        value={notifUnitId}
                        onChange={(e) => setNotifUnitId(e.target.value)}
                        required
                      >
                        <option value="">Select</option>
                        {units.map((u) => (
                          <option key={u.unit_id} value={u.unit_id}>
                            {u.unit_name || u.kendrashala_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Send To</label>
                      <select
                        className="form-select"
                        value={notifRole}
                        onChange={(e) => {
                          setNotifRole(e.target.value);
                          setSendAllTeachers(true);
                          setSelectedTeachers([]);
                        }}
                        disabled={!notifUnitId}
                      >
                        <option value="principal">Principal</option>
                        <option value="teacher">Teacher</option>
                      </select>
                    </div>

                    {notifRole === "teacher" && notifUnitId && (
                      <>
                        <div className="form-check mb-3">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="dashboardAllTeachers"
                            checked={sendAllTeachers}
                            onChange={() => {
                              setSendAllTeachers(!sendAllTeachers);
                              setSelectedTeachers([]);
                            }}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="dashboardAllTeachers"
                          >
                            Send to all teachers ({teachers.length} teachers)
                          </label>
                        </div>

                        {!sendAllTeachers && (
                          <div className="mb-3">
                            <label className="form-label">
                              Select Specific Teachers
                            </label>
                            <select
                              multiple
                              className="form-select mb-2"
                              value={selectedTeachers}
                              onChange={(e) =>
                                setSelectedTeachers(
                                  [...e.target.selectedOptions].map((o) => o.value)
                                )
                              }
                              style={{ minHeight: 160 }}
                            >
                              {teachers.length === 0 ? (
                                <option disabled>No teachers found</option>
                              ) : (
                                teachers.map((tch) => (
                                  <option key={tch.user_id} value={tch.user_id}>
                                    {tch.full_name}{" "}
                                    {tch.designation ? ` (${tch.designation})` : ""}
                                    {tch.subject ? ` ${tch.subject}` : ""}
                                  </option>
                                ))
                              )}
                            </select>
                            <small className="text-muted">
                              Hold Ctrl/Cmd to select multiple. Selected:{" "}
                              {selectedTeachers.length}
                            </small>
                          </div>
                        )}
                      </>
                    )}

                    <div className="mb-3">
                      <label className="form-label">Title</label>
                      <input
                        className="form-control"
                        value={notifTitle}
                        onChange={(e) => setNotifTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Message</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        value={notifMsg}
                        onChange={(e) => setNotifMsg(e.target.value)}
                        required
                      />
                    </div>

                    <button
                      className="btn btn-primary w-100"
                      disabled={notifLoading || !notifUnitId}
                    >
                      {notifLoading ? "Sending..." : "Send ✓"}
                    </button>
                  </form>
                </AdminCard>
              </div>

              <div className="col-lg-6">
                <AdminCard header="Create and Send Form">
                  <form onSubmit={addForm}>
                    <div className="mb-3">
                      <label className="form-label">Select School</label>
                      <select
                        className="form-select"
                        value={notifUnitId}
                        onChange={(e) => setNotifUnitId(e.target.value)}
                        required
                      >
                        <option value="">Select</option>
                        {units.map((u) => (
                          <option key={u.unit_id} value={u.unit_id}>
                            {u.unit_name || u.kendrashala_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Send To</label>
                      <select
                        className="form-select"
                        value={formRole}
                        onChange={(e) => {
                          setFormRole(e.target.value);
                          setSendAllTeachers(true);
                          setSelectedTeachers([]);
                        }}
                        disabled={!notifUnitId}
                      >
                        <option value="principal">Principal</option>
                        <option value="teacher">Teacher</option>
                      </select>
                    </div>

                    {formRole === "teacher" && notifUnitId && (
                      <>
                        <div className="form-check mb-3">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="formAllTeachers"
                            checked={sendAllTeachers}
                            onChange={() => {
                              setSendAllTeachers(!sendAllTeachers);
                              setSelectedTeachers([]);
                            }}
                          />
                          <label
                            className="form-check-label"
                            htmlFor="formAllTeachers"
                          >
                            Send to all teachers ({teachers.length} teachers)
                          </label>
                        </div>

                        {!sendAllTeachers && (
                          <div className="mb-3">
                            <label className="form-label">
                              Select Specific Teachers
                            </label>
                            <select
                              multiple
                              className="form-select mb-2"
                              value={selectedTeachers}
                              onChange={(e) =>
                                setSelectedTeachers(
                                  [...e.target.selectedOptions].map((o) => o.value)
                                )
                              }
                              style={{ minHeight: 160 }}
                            >
                              {teachers.length === 0 ? (
                                <option disabled>No teachers found</option>
                              ) : (
                                teachers.map((tch) => (
                                  <option key={tch.user_id} value={tch.user_id}>
                                    {tch.full_name}{" "}
                                    {tch.designation ? ` (${tch.designation})` : ""}
                                    {tch.subject ? ` ${tch.subject}` : ""}
                                  </option>
                                ))
                              )}
                            </select>
                            <small className="text-muted">
                              Hold Ctrl/Cmd to select multiple. Selected:{" "}
                              {selectedTeachers.length}
                            </small>
                          </div>
                        )}
                      </>
                    )}

                    <div className="mb-3">
                      <label className="form-label">Form Title</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g., Monthly Report"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Description (optional)</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Brief description"
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Deadline</label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={formDeadline}
                        onChange={(e) => setFormDeadline(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">Questions</label>
                      <div style={{ maxHeight: 250, overflowY: "auto" }}>
                        {formQuestions.map((q, idx) => (
                          <div
                            key={idx}
                            className="border rounded p-2 mb-2 bg-light"
                          >
                            <div className="d-flex justify-content-between mb-2">
                              <small>
                                <strong>Question {idx + 1}</strong>
                              </small>
                              {formQuestions.length > 1 && (
                                <button
                                  type="button"
                                  className="btn btn-danger btn-sm"
                                  onClick={() => removeFormQuestion(idx)}
                                >
                                  Remove
                                </button>
                              )}
                            </div>

                            <input
                              placeholder="Question text"
                              className="form-control form-control-sm mb-2"
                              value={q.questiontext}
                              required
                              onChange={(e) =>
                                handleQuestionChange(
                                  idx,
                                  "questiontext",
                                  e.target.value
                                )
                              }
                            />

                            <select
                              className="form-select form-select-sm mb-2"
                              value={q.questiontype}
                              onChange={(e) =>
                                handleQuestionChange(
                                  idx,
                                  "questiontype",
                                  e.target.value
                                )
                              }
                            >
                              <option value="text">Text</option>
                              <option value="number">Number</option>
                              <option value="date">Date</option>
                              <option value="select">Select</option>
                            </select>

                            {q.questiontype === "select" && (
                              <input
                                placeholder="Options: A, B, C"
                                className="form-control form-control-sm"
                                value={q.options}
                                onChange={(e) =>
                                  handleQuestionChange(idx, "options", e.target.value)
                                }
                              />
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="btn btn-secondary btn-sm w-100 mt-2"
                        onClick={addFormQuestion}
                      >
                        + Add Question
                      </button>
                    </div>

                    <button
                      className="btn btn-success w-100"
                      disabled={formLoading || !notifUnitId}
                      type="submit"
                    >
                      {formLoading
                        ? "Creating..."
                        : "Create Form & Send Notification ✓"}
                    </button>
                  </form>
                </AdminCard>
              </div>
            </div>

            <div className="row g-3 mt-2">
              <div className="col-lg-6">
                <AdminCard header={`Active Forms (${forms.length})`}>
                  {forms.length === 0 ? (
                    <div className="text-muted text-center py-4">
                      <p className="mb-1">No active forms</p>
                      <small>When you create a form, it will appear here.</small>
                    </div>
                  ) : (
                    <div
                      className="list-group"
                      style={{ maxHeight: 500, overflowY: "auto" }}
                    >
                      {forms.map((f) => (
                        <div
                          key={f.id}
                          className={`list-group-item list-group-item-action ${
                            selectedFormId === f.id ? "active" : ""
                          }`}
                          onClick={() => {
                            setSelectedFormId(f.id);
                            loadRecipientStatus(f.id);
                            loadFormResponsesForDashboard(f.id);
                          }}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="d-flex w-100 justify-content-between">
                            <h6 className="mb-1">{f.title}</h6>
                            <span className="badge bg-primary rounded-pill">
                              #{f.id}
                            </span>
                          </div>
                          <small
                            className={
                              selectedFormId === f.id ? "text-white-50" : "text-muted"
                            }
                          >
                            Deadline:{" "}
                            {f.deadline ? new Date(f.deadline).toLocaleString() : "—"}
                          </small>
                          <br />
                          <small
                            className={
                              selectedFormId === f.id ? "text-white-50" : "text-muted"
                            }
                          >
                            Click to view responses
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </AdminCard>
              </div>

              <div className="col-lg-6">
                <AdminCard header="Form Responses">
                  {!selectedFormId ? (
                    <div className="text-muted text-center py-5">
                      <i className="bi bi-arrow-left-circle fs-1 mb-3 d-block"></i>{" "}
                      Select a form on the left to view responses.
                    </div>
                  ) : responsesLoading ? (
                    <div className="d-flex justify-content-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : formResponses.length === 0 ? (
                    <div className="text-muted text-center py-5">
                      <i className="bi bi-inbox fs-1 mb-3 d-block"></i>
                      <p>No responses yet</p>
                      <small>
                        Responses will appear here when users submit the form.
                      </small>
                    </div>
                  ) : (
                    <>
                      {(() => {
                        const receivedCount =
                          recipientStatus.length > 0
                            ? recipientStatus.filter((r) => r.has_responded === true)
                                .length
                            : formResponses.length;

                        const pendingCount =
                          recipientStatus.length > 0
                            ? recipientStatus.filter((r) => r.has_responded === false)
                                .length
                            : 0;

                        return (
                          <div className="d-flex justify-content-around mb-3 p-3 bg-light rounded">
                            <div className="text-center">
                              <div className="fs-4 fw-bold text-success">
                                {receivedCount}
                              </div>
                              <small className="text-muted">Received</small>
                            </div>
                            <div className="text-center">
                              <div className="fs-4 fw-bold text-warning">
                                {pendingCount}
                              </div>
                              <small className="text-muted">Pending</small>
                            </div>
                          </div>
                        );
                      })()}

                      <div style={{ maxHeight: 420, overflowY: "auto" }}>
                        {formResponses.map((resp) => (
                          <div
                            key={resp.response_id}
                            className="border rounded p-3 mb-2"
                          >
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <div className="fw-semibold">
                                  {resp.submitted_by_name || "User"}
                                </div>
                                <small className="text-muted">
                                  {(resp.submitted_by_role || "").toString()}
                                  {resp.unit_name ? ` • ${resp.unit_name}` : ""}
                                </small>
                              </div>
                              <small className="text-muted">
                                {resp.submitted_at
                                  ? new Date(resp.submitted_at).toLocaleString()
                                  : ""}
                              </small>
                            </div>

                            <hr />

                            {(resp.answers || []).map((a, idx) => (
                              <div key={idx} className="mb-2">
                                <div
                                  className="fw-semibold"
                                  style={{ fontSize: "0.92rem" }}
                                >
                                  {a.question}
                                </div>
                                <div style={{ fontSize: "0.95rem" }}>
                                  {a.answer?.toString?.() ?? ""}
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </AdminCard>
              </div>
            </div>
          </div>
        );

      case "reports":
        return renderReportsPage();

      case "budgets":
      case "tables":
      default:
        return null;
    }
  };

  function NotificationBell() {
    return null;
  }

  return (
    <AdminLayout 
      activeSidebarTab={sidebarTab} 
      onSidebarTabChange={setSidebarTab}
    >
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t("loading")}...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger m-4">{error}</div>
      ) : unitLoading ? (
        <div className="loading-spinner">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">{t("loading")}...</span>
          </div>
        </div>
      ) : (
        renderContent()
      )}

      <ChatWidget />
    </AdminLayout>
  );
}
