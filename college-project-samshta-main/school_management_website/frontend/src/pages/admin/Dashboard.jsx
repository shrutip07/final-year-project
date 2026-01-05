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
  const [selectedDetailTab, setSelectedDetailTab] = useState("overview");

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

  // Import Units state
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [importIsSuccess, setImportIsSuccess] = useState(false);
  const [showFullFormat, setShowFullFormat] = useState(false);

  const navigate = useNavigate();

  // Import Unit Handlers
  function handleImportFileChange(e) {
    const f = e.target.files?.[0];
    setImportFile(f || null);
    setImportMessage("");
    setImportIsSuccess(false);
  }

  async function handleImportSubmit(e) {
    e.preventDefault();
    setImportMessage("");
    setImportIsSuccess(false);

    if (!importFile) {
      setImportMessage("Please select an Excel file (.xlsx or .xls).");
      return;
    }

    try {
      setImportLoading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", importFile);

      const res = await fetch("http://localhost:5000/api/units/import", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        let msg = data.message || "Failed to import units.";
        if (Array.isArray(data.missingHeaders) && data.missingHeaders.length) {
          msg += " Missing headers: " + data.missingHeaders.join(", ");
        }
        throw new Error(msg);
      }

      setImportMessage(
        data.importedCount != null
          ? `Imported ${data.importedCount} unit(s) successfully.`
          : "Units imported successfully."
      );
      setImportIsSuccess(true);
      setImportFile(null);
      e.target.reset();

      // Refresh units list
      const updatedUnits = await axiosInstance.get("/admin/units");
      setUnits(updatedUnits.data || []);
    } catch (err) {
      setImportMessage(err.message || "Failed to import units.");
      setImportIsSuccess(false);
    } finally {
      setImportLoading(false);
    }
  }

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
    setSelectedDetailTab("overview");
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

  const renderSchoolDetailView = () => {
    if (!unitDetails) return null;

    const detailTabs = [
      { id: "overview", label: "Overview", icon: "bi-grid-1x2" },
      { id: "finance", label: "Finance", icon: "bi-cash-stack" },
      { id: "teachers", label: "Teachers", icon: "bi-people" },
      { id: "students", label: "Students", icon: "bi-mortarboard" },
      { id: "payments", label: "Payments", icon: "bi-credit-card" },
      { id: "banks", label: "Banks", icon: "bi-bank" },
      { id: "legal", label: "Legal / Cases", icon: "bi-shield-shaded" },
    ];

    return (
      <div className="school-detail-view-container">
        {/* Static School Information Card */}
        <div className="school-static-info-card shadow-sm">
          <div className="info-card-header">
            <div className="school-identity">
              <h2 className="school-name">{unitDetails.kendrashala_name}</h2>
              <div className="school-meta-pills">
                <span className="meta-pill">
                  <i className="bi bi-hash"></i> SEMIS No: {unitDetails.semis_no}
                </span>
                <span className="meta-pill">
                  <i className="bi bi-person-badge"></i> Headmaster: {unitDetails.headmistress_name || "N/A"}
                </span>
              </div>
            </div>
            
            <div className="info-card-actions">
              <div className="academic-year-badge">
                <span className="label">ACADEMIC YEAR</span>
                <span className="value">AY 2024-25</span>
              </div>
              <button 
                className="btn btn-dark btn-back"
                onClick={() => {
                  setSelectedUnit(null);
                  setUnitDetails(null);
                }}
              >
                <i className="bi bi-arrow-left"></i> Back to Units
              </button>
              <button className="btn btn-outline-primary btn-generate">
                <i className="bi bi-file-earmark-text"></i> Generate Report
              </button>
            </div>
          </div>

          <div className="info-card-stats-row">
            <div className="mini-stat-box">
              <span className="label">TOTAL STUDENTS</span>
              <span className="value">{unitDetails.students?.length || 0}</span>
            </div>
            <div className="mini-stat-box">
              <span className="label">TOTAL TEACHERS</span>
              <span className="value">{unitDetails.teachers?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Horizontal Detail Tabs */}
        <div className="school-detail-tabs shadow-sm">
          {detailTabs.map((tab) => (
            <button
              key={tab.id}
              className={`detail-tab-item ${selectedDetailTab === tab.id ? "active" : ""}`}
              onClick={() => setSelectedDetailTab(tab.id)}
            >
              <i className={`bi ${tab.icon}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="school-tab-content-area">
          {selectedDetailTab === "overview" && (
            <div className="tab-pane-fade-in">
              <div className="content-section-title">Unit Overview Summary</div>
              <div className="overview-summary-grid">
                <div className="overview-card staff">
                  <span className="label">TOTAL STAFF</span>
                  <span className="value">{unitDetails.teachers?.length || 0}</span>
                </div>
                <div className="overview-card students">
                  <span className="label">TOTAL STUDENTS</span>
                  <span className="value">{unitDetails.students?.length || 0}</span>
                </div>
                <div className="overview-card ratio">
                  <span className="label">RATIO</span>
                  <span className="value">
                    {(unitDetails.students?.length / (unitDetails.teachers?.length || 1)).toFixed(1)}
                  </span>
                  <span className="sub">Student/Teacher</span>
                </div>
                <div className="overview-card finance">
                  <span className="label">COLLECTED FEES</span>
                  <span className="value">₹0</span>
                  <span className="sub">Financial Snapshot</span>
                </div>
              </div>
            </div>
          )}

          {selectedDetailTab === "finance" && (
            <div className="tab-pane-fade-in">
               <div className="content-section-title">Financial Data</div>
               <div className="empty-tab-state">
                 <i className="bi bi-cash-stack"></i>
                 <p>No financial records found for this academic year.</p>
               </div>
            </div>
          )}

          {selectedDetailTab === "teachers" && (
            <div className="tab-pane-fade-in h-100">
               <div className="table-fixed-wrapper">
                 <table className="table table-hover modern-table">
                   <thead>
                     <tr>
                       <th>Staff ID</th>
                       <th>Full Name</th>
                       <th>Designation</th>
                       <th>Subject</th>
                       <th>Phone</th>
                     </tr>
                   </thead>
                   <tbody>
                     {unitDetails.teachers?.slice(0, 10).map(t => (
                       <tr key={t.staff_id}>
                         <td>{t.staff_id}</td>
                         <td>{t.full_name}</td>
                         <td>{t.designation}</td>
                         <td>{t.subject}</td>
                         <td>{t.phone}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {selectedDetailTab === "students" && (
            <div className="tab-pane-fade-in h-100">
               <div className="table-fixed-wrapper">
                 <table className="table table-hover modern-table">
                   <thead>
                     <tr>
                       <th>Student ID</th>
                       <th>Full Name</th>
                       <th>Standard</th>
                       <th>Division</th>
                       <th>Roll No</th>
                     </tr>
                   </thead>
                   <tbody>
                     {unitDetails.students?.slice(0, 10).map(s => (
                       <tr key={s.student_id}>
                         <td>{s.student_id}</td>
                         <td>{s.full_name}</td>
                         <td>{s.standard}</td>
                         <td>{s.division}</td>
                         <td>{s.roll_number}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          )}

          {["payments", "banks", "legal"].includes(selectedDetailTab) && (
            <div className="tab-pane-fade-in">
               <div className="empty-tab-state">
                 <i className="bi bi-info-circle"></i>
                 <p>No data available for {selectedDetailTab} yet.</p>
               </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (sidebarTab) {
        case "dashboard":
          if (selectedUnit && unitDetails) return renderSchoolDetailView();
          return (
            <div className="page-inner">
              <PageHeader
                title={t("school_overview")}
                subtitle={t("manage_monitor_all_schools")}
              />

                {/* Import Units Section */}
                <div className="admin-import-container mb-5">
                  <div className="card admin-import-card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4">
                      <div className="row g-4">
                        {/* Left: Upload + Action */}
                        <div className="col-lg-6 border-end pe-lg-4">
                          <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="import-icon-box bg-soft-primary text-primary">
                              <i className="bi bi-file-earmark-spreadsheet fs-4"></i>
                            </div>
                            <div>
                              <h5 className="mb-0 fw-bold">Import Units from Excel</h5>
                              <p className="text-muted small">Select your file to bulk import schools</p>
                            </div>
                          </div>

                          <form onSubmit={handleImportSubmit} className="import-form">
                            <div className="upload-box mb-4 p-4 border-2 border-dashed rounded-3 text-center bg-light">
                              <i className="bi bi-cloud-arrow-up fs-1 text-primary mb-2 d-block"></i>
                              <input
                                type="file"
                                id="excelImport"
                                className="form-control d-none"
                                accept=".xlsx,.xls"
                                onChange={handleImportFileChange}
                              />
                              <label htmlFor="excelImport" className="btn btn-outline-primary btn-sm mb-2">
                                {importFile ? importFile.name : "Choose Excel File"}
                              </label>
                              <p className="text-muted x-small mb-0">Support: .xlsx, .xls (Max 10MB)</p>
                            </div>

                            {importMessage && (
                              <div className={`alert ${importIsSuccess ? "alert-success" : "alert-danger"} py-2 small mb-3 border-0 shadow-sm`}>
                                <i className={`bi ${importIsSuccess ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"} me-2`}></i>
                                {importMessage}
                              </div>
                            )}

                            <div className="d-flex gap-3">
                              <button
                                type="submit"
                                className="btn btn-primary btn-lg flex-grow-1 py-3 fw-bold d-flex align-items-center justify-content-center gap-2 shadow"
                                disabled={importLoading || !importFile}
                              >
                                {importLoading ? (
                                  <span className="spinner-border spinner-border-sm" />
                                ) : (
                                  <>
                                    <i className="bi bi-cloud-arrow-up-fill fs-5"></i>
                                    <span>Import Units</span>
                                  </>
                                )}
                              </button>
                              <button type="button" className="btn btn-light border btn-lg px-3" title="Download Sample">
                                <i className="bi bi-download"></i>
                              </button>
                            </div>
                          </form>
                        </div>

                        {/* Right: Instructions & Format */}
                        <div className="col-lg-6 ps-lg-4">
                          <div className="instruction-header mb-3">
                            <h6 className="fw-bold text-dark d-flex align-items-center gap-2">
                              <i className="bi bi-info-circle-fill text-primary"></i>
                              Quick Instructions
                            </h6>
                          </div>
                          
                          <div className="instructions-body">
                            <ul className="instruction-list-modern mb-4">
                              <li className="mb-2">
                                <span className="step-num">1</span>
                                <span>Ensure each school has a unique <strong>unit_id</strong> and <strong>semis_no</strong>.</span>
                              </li>
                              <li className="mb-2">
                                <span className="step-num">2</span>
                                <span>Follow the exact column naming as per the system requirements.</span>
                              </li>
                              <li className="mb-2">
                                <span className="step-num">3</span>
                                <span>Download and verify with the <strong>sample template</strong> before uploading.</span>
                              </li>
                            </ul>

                            <div className="required-columns-box p-3 rounded-3 bg-light border mb-3">
                              <p className="fw-bold x-small text-uppercase text-muted mb-2 letter-spacing-1">Important Required Columns</p>
                              <div className="d-flex flex-wrap gap-2">
                                {['unit_id', 'semis_no', 'kendrashala_name'].map(c => (
                                  <span key={c} className="badge bg-white text-dark border shadow-sm py-2 px-3">{c}</span>
                                ))}
                                <span className="badge bg-soft-primary text-primary py-2 px-3">+ 18 more</span>
                              </div>
                            </div>

                            <div className="format-toggle">
                              <button
                                className="btn btn-link btn-sm p-0 text-decoration-none fw-bold d-flex align-items-center gap-1"
                                onClick={() => setShowFullFormat(!showFullFormat)}
                              >
                                <i className={`bi ${showFullFormat ? "bi-dash-circle" : "bi-plus-circle"}`}></i>
                                {showFullFormat ? "Hide full format" : "View full Excel format"}
                              </button>

                              {showFullFormat && (
                                <div className="full-format-scroll mt-3 p-3 bg-white rounded border small text-muted shadow-inner">
                                  <strong>Allowed Headers:</strong>
                                  <p className="mb-0 mt-1">unit_id, semis_no, dcf_no, nmms_no, scholarship_code, first_grant_in_aid_year, type_of_management, school_jurisdiction, competent_authority_name, authority_number, authority_zone, kendrashala_name, info_authority_name, appellate_authority_name, midday_meal_org_name, midday_meal_org_contact, standard_range, headmistress_name, headmistress_phone, headmistress_email, school_shift</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row school-grid g-4">
                  {safeUnits.map((unit, idx) => (
                    <div key={unit.unit_id} className="col-md-4 col-lg-3 col-sm-6 mb-4">
                      <div
                        className="school-card-modern"
                        onClick={() => handleUnitCardClick(unit.unit_id)}
                      >
                        <div className="card-top-accent"></div>
                        
                        <div className="card-header-modern">
                          <div className="symbol-container">
                            <i className="bi bi-building"></i>
                          </div>
                          <div className="index-badge">#{idx + 1}</div>
                        </div>
                        
                        <div className="card-body-modern">
                          <h5 className="school-title">{unit.kendrashala_name}</h5>
                          <div className="unit-id-label">UNIT ID: {unit.unit_id}</div>
                          
                          <div className="stats-pills-row">
                            <div className="stat-pill staff">
                              <div className="pill-icon">
                                <i className="bi bi-people-fill"></i>
                              </div>
                              <div className="pill-data">
                                <span className="count">{unit.staff_count || 0}</span>
                                <span className="label">Staff</span>
                              </div>
                            </div>
                            <div className="stat-pill students">
                              <div className="pill-icon">
                                <i className="bi bi-mortarboard-fill"></i>
                              </div>
                              <div className="pill-data">
                                <span className="count">{unit.student_count || 0}</span>
                                <span className="label">Students</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="card-footer-modern">
                          <span className="footer-link">View Institutional Details</span>
                          <i className="bi bi-arrow-right"></i>
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
        schoolName={unitDetails?.kendrashala_name}
        semisId={unitDetails?.semis_no}
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
