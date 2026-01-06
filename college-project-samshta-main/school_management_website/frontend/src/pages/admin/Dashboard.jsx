import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();

  const getTabFromPath = (path) => {
    if (path.includes("/admin/charts")) return "charts";
    if (path.includes("/admin/notifications")) return "notifications";
    if (path.includes("/admin/reports") || path.includes("/admin/report")) return "reports";
    return "dashboard";
  };

  const [sidebarTab, setSidebarTab] = useState(getTabFromPath(location.pathname));

  useEffect(() => {
    setSidebarTab(getTabFromPath(location.pathname));
  }, [location.pathname]);

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

  const [notifTargetSchool, setNotifTargetSchool] = useState("");
  const [notifSendToAllTeachers, setNotifSendToAllTeachers] = useState(true);
  const [notifSelectedTeachers, setNotifSelectedTeachers] = useState([]);
  const [schoolTeachers, setSchoolTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);

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

  // Import state
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importMessage, setImportMessage] = useState("");

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
            <div className="d-flex gap-2">
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
              <button
                className="btn btn-secondary"
                onClick={() => setSidebarTab("dashboard")}
              >
                Go to Admin Dashboard
              </button>
            </div>
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

  const handleImportFileChange = (e) => {
    const f = e.target.files?.[0];
    setImportFile(f || null);
    setImportMessage("");
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    setImportMessage("");

    if (!importFile) {
      setImportMessage("Please select an Excel file (.xlsx or .xls).");
      return;
    }

    try {
      setImportLoading(true);
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", importFile);

      const res = await axios.post("http://localhost:5000/api/units/import", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const data = res.data;
      setImportMessage(
        data.importedCount != null
          ? `Imported ${data.importedCount} unit(s) successfully.`
          : "Units imported successfully."
      );
      setImportFile(null);
      
      // Refresh units list
      const response = await axios.get("http://localhost:5000/api/admin/units", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnits(Array.isArray(response.data) ? response.data : []);
      
    } catch (err) {
      const errorData = err.response?.data || {};
      let msg = errorData.message || "Failed to import units.";
      if (Array.isArray(errorData.missingHeaders) && errorData.missingHeaders.length) {
        msg += " Missing headers: " + errorData.missingHeaders.join(", ");
      }
      setImportMessage(msg);
    } finally {
      setImportLoading(false);
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
          <div className="empty-table-msg text-center py-5 border rounded bg-light">
            <i className="bi bi-info-circle text-muted fs-2 d-block mb-3"></i>
            <span className="text-muted">No {tableName} data available for the selected period.</span>
          </div>
        );

      const cols = Object.keys(data[0]);
      function handleToggle(col) {
        setVisibleCols((prev) =>
          prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
        );
      }

      // Helper for professional cell rendering
      const formatCell = (key, val) => {
        if (val === null || val === undefined) return "-";
        const valStr = val.toString();

        // Colors for amounts/finance
        if (key.toLowerCase().includes("amount") || key.toLowerCase().includes("spent") || key.toLowerCase().includes("collected")) {
          const num = parseFloat(val);
          if (!isNaN(num)) {
            const colorClass = num >= 0 ? "finance-positive" : "finance-negative";
            return <span className={`fw-bold ${colorClass}`}>₹{num.toLocaleString()}</span>;
          }
        }

        // Dates
        if (key.toLowerCase().includes("date") || key.toLowerCase().includes("updated_at") || key.toLowerCase().includes("at")) {
          return <span className="text-muted small">{new Date(valStr).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
          })}</span>;
        }

        // Status / Category badges
        if (key.toLowerCase().includes("category") || key.toLowerCase().includes("status") || key.toLowerCase().includes("type")) {
          return <span className="erp-badge">{valStr.replace(/_/g, " ")}</span>;
        }

        return valStr;
      };

      return (
        <div className="dynamic-table-wrapper">
          <div className="dynamic-table-toolbar d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0 text-dark fw-bold">{tableName} Directory</h6>
            <div className="position-relative">
              <button
                className="btn btn-sm btn-light border d-flex align-items-center gap-2"
                onClick={() => setSelectShow((s) => !s)}
              >
                <i className="bi bi-columns-gap"></i> Columns
              </button>

              {selectShow && (
                <div className="col-dropdown p-3 border rounded shadow bg-white position-absolute end-0 mt-2" style={{ zIndex: 1000, minWidth: '220px' }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="fw-bold small">Manage Columns</span>
                    <button className="btn-close small" onClick={() => setSelectShow(false)} style={{fontSize: '0.7rem'}}></button>
                  </div>
                  {cols.map((col) => (
                    <div key={col} className="form-check mb-2">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id={`col-check-table-${tableName}-${col}`}
                        checked={visibleCols.includes(col)}
                        onChange={() => handleToggle(col)}
                      />
                      <label
                        className="form-check-label small text-capitalize"
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
          <div className="table-responsive professional-table">
            <table className="table align-middle">
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
                        <td key={col}>{formatCell(col, row[col])}</td>
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
                <AdminCard header="Unit Overview Summary">
                   <div className="metrics-grid">
                     <div className="metric-box metric-staff">
                       <span className="label">TOTAL STAFF</span>
                       <span className="value">{unitDetails.teachers?.length ?? 0}</span>
                     </div>
                     <div className="metric-box metric-students">
                       <span className="label">TOTAL STUDENTS</span>
                       <span className="value">{unitDetails.students?.length ?? 0}</span>
                     </div>
                     <div className="metric-box metric-ratio">
                       <span className="label">RATIO</span>
                       <span className="value">
                         {unitDetails.students?.length && unitDetails.teachers?.length
                           ? (unitDetails.students.length / unitDetails.teachers.length).toFixed(1)
                           : "0"}
                       </span>
                       <span className="sub-label">Student/Teacher</span>
                     </div>
                     <div className="metric-box metric-fees highlight">
                       <span className="label">COLLECTED FEES</span>
                       <span className="value">₹{(overviewMetrics?.feesCollectedFy ?? 0).toLocaleString()}</span>
                       <span className="sub-label">Financial Snapshot</span>
                     </div>
                   </div>
                   
                   <div className="overview-info-strip mt-4">
                      <div className="info-item">
                        <span className="label">Unit ID:</span>
                        <span className="value">{unitDetails.unit_id || "-"}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">SEMIS No:</span>
                        <span className="value">{unitDetails.semis_no || "-"}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Standards:</span>
                        <span className="value">{unitDetails.standard_range || "-"}</span>
                      </div>
                      <div className="info-item">
                        <span className="label">Shift:</span>
                        <span className="value">{unitDetails.school_shift || "-"}</span>
                      </div>
                   </div>
                </AdminCard>
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
                <AdminCard>
                  <TableContainer
                 title=""
                 toolbar={
                   <Toolbar
                     left={
                       <h6 className="mb-0 text-dark fw-bold">Staff Directory</h6>
                     }
                     right={
                       <div className="d-flex align-items-center gap-3">
                         <div className="d-flex align-items-center gap-2 bg-light px-3 py-1 rounded-pill">
                           <i className="bi bi-search text-muted"></i>
                           <input
                             type="text"
                             className="form-control form-control-sm border-0 bg-transparent"
                             placeholder="Search teachers..."
                             style={{ width: 200 }}
                             value={teacherSearch}
                             onChange={(e) => setTeacherSearch(e.target.value)}
                           />
                         </div>
                         <div className="position-relative">
                           <button
                             className="btn btn-sm btn-light border d-flex align-items-center gap-2"
                             onClick={() => setTeachersShowColDropdown(!teachersShowColDropdown)}
                           >
                               <i className="bi bi-columns-gap"></i> Columns
                             </button>
  
                           {teachersShowColDropdown && (
                             <div className="col-dropdown p-3 border rounded shadow bg-white position-absolute end-0 mt-2" style={{ zIndex: 1000, minWidth: '220px' }}>
                               <div className="d-flex justify-content-between align-items-center mb-2">
                                 <span className="fw-bold small">Manage Columns</span>
                                 <button className="btn-close" style={{fontSize: '0.6rem'}} onClick={() => setTeachersShowColDropdown(false)}></button>
                               </div>
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
                       </div>
                     }
                   />
                 }
               >
                   {filteredTeachers.length === 0 ? (
                     <EmptyState title="No Records" description="No teacher records found for this unit." />
                   ) : (
                     <div className="table-responsive professional-table">
                       <table className="table table-hover align-middle">
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
                                 .map(([key]) => (
                                   <td key={key}>
                                     {key === "full_name" ? (
                                       <div className="d-flex align-items-center gap-2">
                                         <div className="avatar-circle">
                                           {tch[key] ? tch[key].charAt(0).toUpperCase() : "T"}
                                         </div>
                                         <span className="fw-semibold">{tch[key] || "Unknown"}</span>
                                       </div>
                                     ) : key === "designation" || key === "qualification" ? (
                                       <span className={`erp-badge ${key === "designation" ? "badge-designation" : "badge-qualification"}`}>
                                         {tch[key] || "-"}
                                       </span>
                                     ) : key === "joining_date" || key.includes("updated_at") ? (
                                       <span className="text-muted small">
                                         {tch[key] ? new Date(tch[key]).toLocaleDateString(undefined, {
                                           year: 'numeric', month: 'short', day: 'numeric'
                                         }) : "-"}
                                       </span>
                                     ) : key === "email" ? (
                                       <span className="text-primary small">{tch[key]}</span>
                                     ) : (
                                       tch[key] || "-"
                                     )}
                                   </td>
                                 ))}
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
              <AdminCard>
                 <TableContainer
                 title=""
                 toolbar={
                   <Toolbar
                     left={
                       <h6 className="mb-0 text-dark fw-bold">Student Enrollment</h6>
                     }
                     right={
                       <div className="d-flex align-items-center gap-3">
                         <div className="d-flex align-items-center gap-2 bg-light px-3 py-1 rounded-pill">
                           <i className="bi bi-search text-muted"></i>
                           <input
                             type="text"
                             className="form-control form-control-sm border-0 bg-transparent"
                             placeholder="Search students..."
                             style={{ width: 180 }}
                             value={studentSearch}
                             onChange={(e) => setStudentSearch(e.target.value)}
                           />
                         </div>
                         <div className="d-flex align-items-center gap-2 bg-light px-3 py-1 rounded-pill">
                           <span className="small text-muted fw-bold text-nowrap">Year:</span>
                           <select
                             value={studentsYear}
                             onChange={(e) => setStudentsYear(e.target.value)}
                             className="form-select form-select-sm border-0 bg-transparent w-auto py-0"
                             style={{ fontSize: '0.75rem' }}
                           >
                             <option value="">All</option>
                             {allStudentYears.map(y => <option key={y} value={y}>{y}</option>)}
                           </select>
                         </div>
                         <div className="position-relative">
                          <button
                            className="btn btn-sm btn-light border d-flex align-items-center gap-2"
                            onClick={() => setStudentsShowColDropdown(!studentsShowColDropdown)}
                          >
                            <i className="bi bi-columns-gap"></i> Columns
                          </button>
                          {studentsShowColDropdown && (
                            <div className="col-dropdown p-3 border rounded shadow bg-white position-absolute end-0 mt-2" style={{ zIndex: 1000, minWidth: '220px' }}>
                               <div className="d-flex justify-content-between align-items-center mb-2">
                                 <span className="fw-bold small">Manage Columns</span>
                                 <button className="btn-close" style={{fontSize: '0.6rem'}} onClick={() => setStudentsShowColDropdown(false)}></button>
                               </div>
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
                       </div>
                     }
                   />
                 }
               >
                   {filteredStudents.length === 0 ? (
                     <EmptyState title="No Records" description="No student records found." />
                   ) : (
                     <div className="table-responsive professional-table">
                       <table className="table table-hover align-middle">
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
                                     {key === "full_name" ? (
                                       <div className="d-flex align-items-center gap-2">
                                         <div className="avatar-circle student">
                                           {s[key] ? s[key].charAt(0).toUpperCase() : "S"}
                                         </div>
                                         <span className="fw-semibold">{s[key] || "Unknown"}</span>
                                       </div>
                                     ) : key === "passed" ? (
                                       <span className={`erp-badge ${s[key] ? "badge-success" : "badge-danger"}`}>
                                         {s[key] ? "Passed" : "Failed / In-Progress"}
                                       </span>
                                     ) : key === "academic_year" ? (
                                       <span className="erp-badge badge-year">{s[key]}</span>
                                     ) : (
                                       s[key] || "-"
                                     )}
                                   </td>
                                 ))}
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

          {/* TAB CONTENT - Generic tables */}
          {["payments", "banks", "cases"].includes(selectedSchoolTab) && (
            <div className="tab-pane-content">
              <AdminCard header={
                <div className="d-flex align-items-center gap-2">
                  <i className={`bi ${
                    selectedSchoolTab === 'payments' ? 'bi-credit-card text-info' :
                    selectedSchoolTab === 'banks' ? 'bi-bank text-warning' :
                    'bi-shield-shaded text-danger'
                  }`}></i>
                  <span>{selectedSchoolTab.charAt(0).toUpperCase() + selectedSchoolTab.slice(1)} Registry</span>
                </div>
              }>
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
      <div className="section-header-pro">
        <h3>School Overview</h3>
        <p>Monitor and manage all MKSSS educational units</p>
      </div>

      <div className="import-units-section mb-4">
        <AdminCard header="Import Units from Excel">
          {importMessage && (
            <div
              className={`alert ${
                importMessage.includes("successfully")
                  ? "alert-success"
                  : "alert-danger"
              } py-2 mb-3 small`}
            >
              {importMessage}
            </div>
          )}
          <form
            onSubmit={handleImportSubmit}
            className="d-flex align-items-end gap-3 flex-wrap"
          >
            <div className="flex-grow-1" style={{ minWidth: "250px" }}>
              <label className="form-label small fw-bold text-muted mb-1">
                Select Excel File (.xlsx / .xls)
              </label>
              <input
                type="file"
                className="form-control form-control-sm"
                accept=".xlsx,.xls"
                onChange={handleImportFileChange}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary btn-sm px-4"
              disabled={importLoading}
              style={{ height: "38px" }}
            >
              {importLoading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Importing...
                </>
              ) : (
                <>
                  <i className="bi bi-file-earmark-excel me-2"></i>
                  Import Units
                </>
              )}
            </button>
          </form>
        </AdminCard>
      </div>

      <div className="row school-grid">
        {safeUnits.length === 0 ? (
          <div className="col-12 text-center py-5">
            <div className="premium-loader">
              <div className="spinner-border text-primary" role="status"></div>
              <p className="mt-2 text-muted">Loading schools...</p>
            </div>
          </div>
        ) : (
              safeUnits.map((unit, idx) => (
                <div key={unit.unit_id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
                  <div className="school-card-pro" onClick={() => handleUnitCardClick(unit.unit_id)}>
                   <div className="card-accent" style={{ backgroundColor: idx % 3 === 0 ? '#002E6D' : idx % 3 === 1 ? '#00A9A5' : '#0057D9' }}></div>
                   <div className="card-header-pro">
                     <div className="school-symbol">
                       <i className="bi bi-building"></i>
                     </div>
                     <span className="school-idx">#{idx + 1}</span>
                   </div>
                   <div className="card-body-pro">
                     <h5 className="school-name-text" title={unit.kendrashala_name || `School ${unit.unit_id}`}>
                       {unit.kendrashala_name || `School ${unit.unit_id}`}
                     </h5>
                     <div className="school-id-tag">UNIT ID: {unit.unit_id}</div>
                     
                     <div className="school-stats-row">
                       <div className="stat-item">
                         <div className="stat-icon staff">
                           <i className="bi bi-people-fill"></i>
                         </div>
                         <div className="stat-info">
                           <span className="stat-count">{unit.staff_count || 0}</span>
                           <span className="stat-label">Staff</span>
                         </div>
                       </div>
                       <div className="stat-item">
                         <div className="stat-icon students">
                           <i className="bi bi-mortarboard-fill"></i>
                         </div>
                         <div className="stat-info">
                           <span className="stat-count">{unit.student_count || 0}</span>
                           <span className="stat-label">Students</span>
                         </div>
                       </div>
                     </div>
                   </div>
                   <div className="card-footer-pro">
                     <span>View Institutional Details</span>
                     <i className="bi bi-arrow-right-short"></i>
                   </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );

    const [selectedNotificationTab, setSelectedNotificationTab] = useState("send_notification");

    const renderNotificationsModule = () => {
      return (
        <div className="notifications-page erp-container">
          <TabNavigation
            tabs={[
              { id: "send_notification", label: "Send Notification", icon: "bi-send-fill" },
              { id: "create_form", label: "Create Form", icon: "bi-file-earmark-plus-fill" },
              { id: "activity", label: "Recent Activity", icon: "bi-clock-history" },
            ]}
            activeTab={selectedNotificationTab}
            onTabChange={setSelectedNotificationTab}
          />

          <div className="tab-pane-container mt-3" style={{ height: 'calc(100vh - 220px)', overflowY: 'auto' }}>
            {selectedNotificationTab === "send_notification" && (
              <div className="row g-4">
                <div className="col-lg-8 mx-auto">
                  <AdminCard header={
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-megaphone-fill text-primary"></i>
                      <span>Official Announcement</span>
                    </div>
                  }>
                    <form onSubmit={addNotification}>
                      <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">RECEIVER ROLE</label>
                        <select className="form-select border-primary-subtle" value={notifRole} onChange={(e) => setNotifRole(e.target.value)}>
                          <option value="principal">Principal</option>
                          <option value="teacher">Teacher</option>
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">TITLE</label>
                        <input type="text" className="form-control" value={notifTitle} onChange={(e) => setNotifTitle(e.target.value)} required />
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-bold text-muted">MESSAGE</label>
                        <textarea className="form-control" rows={4} value={notifMsg} onChange={(e) => setNotifMsg(e.target.value)} required />
                      </div>
                      <button className="btn btn-primary w-100 py-2 shadow-sm" disabled={notifLoading} type="submit">
                        {notifLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-send me-2"></i>}
                        Dispatch Notification
                      </button>
                    </form>
                  </AdminCard>
                </div>
              </div>
            )}

            {selectedNotificationTab === "create_form" && (
              <div className="row g-4">
                <div className="col-lg-8 mx-auto">
                  <AdminCard header={
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-file-earmark-plus-fill text-success"></i>
                      <span>Data Collection Campaign</span>
                    </div>
                  }>
                    <form onSubmit={addForm}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted">TARGET ROLE</label>
                          <select className="form-select border-success-subtle" value={formRole} onChange={(e) => setFormRole(e.target.value)}>
                            <option value="principal">Principal</option>
                            <option value="teacher">Teacher</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted">DEADLINE</label>
                          <input type="datetime-local" className="form-control" value={formDeadline} onChange={(e) => setFormDeadline(e.target.value)} />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label small fw-bold text-muted">FORM TITLE</label>
                          <input type="text" className="form-control" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required />
                        </div>
                        <div className="col-md-12">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <label className="form-label small fw-bold text-muted mb-0">QUESTIONS</label>
                            <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none" onClick={addFormQuestion}>+ Add More</button>
                          </div>
                          {formQuestions.map((q, idx) => (
                            <div key={idx} className="p-3 border rounded bg-light mb-2 shadow-sm">
                              <input placeholder="Enter question text..." className="form-control mb-2" value={q.question_text} required onChange={(e) => handleQuestionChange(idx, "question_text", e.target.value)} />
                              <div className="d-flex gap-2">
                                <select className="form-select w-auto" value={q.question_type} onChange={(e) => handleQuestionChange(idx, "question_type", e.target.value)}>
                                  <option value="text">Input Text</option>
                                  <option value="mcq">Multiple Choice</option>
                                </select>
                                {q.question_type === "mcq" && (
                                  <input placeholder="Options (comma separated)" className="form-control" value={q.options} onChange={(e) => handleQuestionChange(idx, "options", e.target.value)} />
                                )}
                                <button type="button" className="btn btn-outline-danger" onClick={() => removeFormQuestion(idx)} disabled={formQuestions.length === 1}><i className="bi bi-trash"></i></button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="col-md-12 mt-3">
                          <button className="btn btn-success w-100 py-2 shadow-sm" disabled={formLoading} type="submit">
                            {formLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-rocket-takeoff me-2"></i>}
                            Launch Campaign
                          </button>
                        </div>
                      </div>
                    </form>
                  </AdminCard>
                </div>
              </div>
            )}

            {selectedNotificationTab === "activity" && (
              <div className="row g-4">
                <div className="col-lg-10 mx-auto">
                  <AdminCard header={
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-clock-history text-info"></i>
                      <span>Recent Communication Registry</span>
                    </div>
                  }>
                    <div className="list-group list-group-flush professional-list">
                      {notifications.length === 0 && forms.length === 0 ? (
                        <div className="text-center py-5">
                          <i className="bi bi-inbox text-muted fs-1"></i>
                          <p className="text-muted mt-2">No recent activity found</p>
                        </div>
                      ) : (
                        <>
                          {notifications.slice(0, 10).map(n => (
                            <div key={n.id} className="list-group-item py-4 border-bottom">
                              <div className="d-flex w-100 justify-content-between align-items-center mb-2">
                                <h6 className="mb-0 fw-bold">{n.title}</h6>
                                <span className="badge bg-soft-primary text-primary px-3 py-2">NOTIFICATION</span>
                              </div>
                              <p className="mb-2 text-muted small lh-lg">{n.message}</p>
                              <div className="d-flex gap-3 small text-muted">
                                <span><i className="bi bi-person me-1"></i> {n.receiver_role}</span>
                                <span><i className="bi bi-clock me-1"></i> {new Date().toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                          {forms.slice(0, 10).map(f => (
                            <div key={f.id} className="list-group-item py-4 border-bottom">
                              <div className="d-flex w-100 justify-content-between align-items-center mb-2">
                                <h6 className="mb-0 fw-bold text-success">{f.title}</h6>
                                <span className="badge bg-soft-success text-success px-3 py-2">ACTIVE FORM</span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center mt-3">
                                <span className="text-danger small fw-bold"><i className="bi bi-calendar-event me-1"></i> Deadline: {f.deadline ? new Date(f.deadline).toLocaleDateString() : 'No limit'}</span>
                                <button className="btn btn-sm btn-outline-success px-3" onClick={() => window.open(`http://localhost:3000/forms/${f.id}`, '_blank')}>View Form</button>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </AdminCard>
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
          if (selectedUnit && unitDetails) return renderUnitDetails();
          return renderDashboardMain();

        case "charts":
          return (
            <AdminCharts units={units} />
          );

        case "notifications":
          return renderNotificationsModule();

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
