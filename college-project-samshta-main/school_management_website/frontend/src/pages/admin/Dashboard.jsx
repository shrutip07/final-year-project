import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../api/axiosInstance";

import AdminCharts from "./Charts";
import ChatWidget from "../../components/ChatWidget";
import AdminLayout from "../../components/admin/AdminLayout";
import SchoolContextHeader from "../../components/admin/SchoolContextHeader";
import TabNavigation from "../../components/admin/TabNavigation";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import Toolbar from "../../components/admin/Toolbar";
import EmptyState from "../../components/admin/EmptyState";
import AdminUnitImport from "./AdminUnitImport";
import "./Dashboard.scss";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Dashboard State
  const [sidebarTab, setSidebarTab] = useState("dashboard");
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [unitDetails, setUnitDetails] = useState(null);
  const [unitLoading, setUnitLoading] = useState(false);
  const [selectedSchoolTab, setSelectedSchoolTab] = useState("overview");

  // Search & Tables State
  const [teacherSearch, setTeacherSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [teacherVisibleColumns, setTeacherVisibleColumns] = useState([
    "staff_id", "full_name", "email", "phone", "qualification", "designation", "subject", "joining_date", "updatedat"
  ]);
  const [studentVisibleColumns, setStudentVisibleColumns] = useState([
    "student_id", "full_name", "standard", "division", "roll_number", "academic_year", "passed", "dob", "gender", "address", "parent_name", "parent_phone", "admission_date", "createdat", "updatedat"
  ]);
  const [teachersShowColDropdown, setTeachersShowColDropdown] = useState(false);
  const [studentsShowColDropdown, setStudentsShowColDropdown] = useState(false);
  const [studentsYear, setStudentsYear] = useState("");

  // Notifications & Forms State
  const [notifications, setNotifications] = useState([]);
  const [forms, setForms] = useState([]);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMsg, setNotifMsg] = useState("");
  const [notifRole, setNotifRole] = useState("principal");
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifUnitId, setNotifUnitId] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [sendAllTeachers, setSendAllTeachers] = useState(true);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [selectedNotificationTab, setSelectedNotificationTab] = useState("send_notification");

  // Forms Management State
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formRole, setFormRole] = useState("principal");
  const [formQuestions, setFormQuestions] = useState([
    { questiontext: "", questiontype: "text", options: "" },
  ]);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [recipientStatus, setRecipientStatus] = useState([]);
  const [recipientLoading, setRecipientLoading] = useState(false);
  const [formResponses, setFormResponses] = useState([]);
  const [responsesLoading, setResponsesLoading] = useState(false);

  // Financial & Metrics State
  const [unitDashboard, setUnitDashboard] = useState(null);
  const [selectedFy, setSelectedFy] = useState("2024-25");
  const [fyMetrics, setFyMetrics] = useState(null);
  const [selectedOverviewFy, setSelectedOverviewFy] = useState("2024-25");
  const [overviewMetrics, setOverviewMetrics] = useState(null);

  // Reports State
  const [reportYears, setReportYears] = useState([]);
  const [selectedReportYear, setSelectedReportYear] = useState("");
  const [reportType, setReportType] = useState("annual");
  const [reportSchools, setReportSchools] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

  // Constants
  const teacherFields = [
    ["staff_id", "Staff ID"], ["full_name", "Full Name"], ["email", "Email"], ["phone", "Phone"], ["qualification", "Qualification"], ["designation", "Designation"], ["subject", "Subject"], ["joining_date", "Joining Date"], ["updatedat", "Updated At"]
  ];

  const studentFields = [
    ["student_id", "Student ID"], ["full_name", "Full Name"], ["standard", "Standard"], ["division", "Division"], ["roll_number", "Roll Number"], ["academic_year", "Academic Year"], ["passed", "Passed"], ["dob", "DOB"], ["gender", "Gender"], ["address", "Address"], ["parent_name", "Parent Name"], ["parent_phone", "Parent Phone"], ["admission_date", "Admission Date"], ["createdat", "Created At"], ["updatedat", "Updated At"]
  ];

  // Helper Functions
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
    return key.replace(/([a-z])([A-Z])/g, "$1 $2").split(/_|\s+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  };

  // Effects
  useEffect(() => {
    async function fetchUnits() {
      try {
        const res = await axiosInstance.get("/admin/units");
        setUnits(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || t("failed_load_units"));
        setUnits([]);
        setLoading(false);
      }
    }
    fetchUnits();
  }, [t]);

  useEffect(() => {
    if (sidebarTab === "reports") loadReportYears();
    if (sidebarTab === "notifications") {
      fetchUnitsForNotifications();
      loadNotifications();
      loadForms();
    }
  }, [sidebarTab, formRole]);

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

  useEffect(() => {
    if (!selectedUnit) return;
    async function reloadMetrics() {
      try {
        const [fyRes, overviewRes] = await Promise.all([
          axiosInstance.get(`/admin/units/${selectedUnit}/finance-by-year?financial_year=${selectedFy}`),
          axiosInstance.get(`/admin/units/${selectedUnit}/finance-by-year?financial_year=${selectedOverviewFy}`)
        ]);
        setFyMetrics(fyRes.data);
        setOverviewMetrics(overviewRes.data);
      } catch (err) {
        console.error("Failed to reload metrics", err);
      }
    }
    reloadMetrics();
  }, [selectedUnit, selectedFy, selectedOverviewFy]);

  // Actions
  const loadReportYears = async () => {
    try {
      const res = await axiosInstance.get("/report/years");
      setReportYears(res.data || []);
      if (res.data?.length > 0) setSelectedReportYear(res.data[0]);
    } catch (err) {
      console.error("Failed to load report years", err);
    }
  };

  const fetchUnitsForNotifications = async () => {
    try {
      const res = await axiosInstance.get("/admin/units");
      setUnits(res.data || []);
    } catch (err) {
      console.error("Failed to load units", err);
    }
  };

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

  const handleUnitCardClick = async (unitId) => {
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
        axiosInstance.get(`/admin/units/${unitId}/finance-by-year?financial_year=${selectedFy}`),
        axiosInstance.get(`/admin/units/${unitId}/finance-by-year?financial_year=${selectedOverviewFy}`),
      ]);

      setUnitDetails(detailRes.data);
      setUnitDashboard(dashboardRes.data);
      setFyMetrics(fyRes.data);
      setOverviewMetrics(overviewRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load unit details");
    }
    setUnitLoading(false);
  };

  const addNotification = async (e) => {
    e.preventDefault();
    if (!notifUnitId) return alert("Please select a school");
    setNotifLoading(true);
    try {
      await axiosInstance.post("/notifications", {
        receiver_role: notifRole,
        unit_id: parseInt(notifUnitId, 10),
        send_all_teachers: notifRole === "teacher" ? sendAllTeachers : false,
        receiver_ids: notifRole === "teacher" && !sendAllTeachers ? selectedTeachers.map(id => parseInt(id, 10)) : [],
        title: notifTitle,
        message: notifMsg,
      });
      setNotifTitle("");
      setNotifMsg("");
      alert("Notification sent");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send notification");
    } finally {
      setNotifLoading(false);
    }
  };

  const addForm = async (e) => {
    e.preventDefault();
    if (!notifUnitId) return alert("Please select a school");
    setFormLoading(true);
    try {
      const questionsPayload = formQuestions.map(q => ({
        question_text: q.questiontext,
        question_type: q.questiontype,
        options: q.options || null,
      }));
      const formRes = await axiosInstance.post("/forms/create", {
        title: formTitle,
        description: formDesc,
        deadline: formDeadline,
        questions: questionsPayload,
        receiver_role: formRole,
        unit_id: parseInt(notifUnitId, 10),
        send_all_teachers: formRole === "teacher" ? sendAllTeachers : false,
        receiver_ids: formRole === "teacher" && !sendAllTeachers ? selectedTeachers.map(id => parseInt(id, 10)) : [],
      });

      const formLink = `${window.location.origin}/forms/${formRes.data.form.id}`;
      await axiosInstance.post("/notifications", {
        title: `New Form: ${formTitle}`,
        message: `Please fill this form before deadline: ${formLink}`,
        receiver_role: formRole,
        unit_id: parseInt(notifUnitId, 10),
        send_all_teachers: formRole === "teacher" ? sendAllTeachers : false,
        receiver_ids: formRole === "teacher" && !sendAllTeachers ? selectedTeachers.map(id => parseInt(id, 10)) : [],
      });

      setFormTitle("");
      setFormDesc("");
      setFormDeadline("");
      setFormQuestions([{ questiontext: "", questiontype: "text", options: "" }]);
      await loadForms();
      alert("Form created and sent");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create form");
    } finally {
      setFormLoading(false);
    }
  };

  const loadRecipientStatus = async (formId) => {
    setRecipientLoading(true);
    try {
      const res = await axiosInstance.get(`/forms/${formId}/recipient-status`);
      const raw = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
      setRecipientStatus(raw.map(r => ({ ...r, has_responded: r.has_responded ?? r.hasResponded ?? r.responded ?? false })));
    } catch (e) {
      console.error(e);
      setRecipientStatus([]);
    } finally {
      setRecipientLoading(false);
    }
  };

  const loadFormResponsesForDashboard = async (formId) => {
    setResponsesLoading(true);
    try {
      const res = await axiosInstance.get("/admin/filled-forms-detailed");
      const rows = Array.isArray(res?.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
      const fid = parseInt(formId, 10);
      const formRows = rows.filter(r => parseInt(r.form_id, 10) === fid);
      const map = new Map();
      for (const r of formRows) {
        if (!map.has(r.response_id)) {
          map.set(r.response_id, {
            response_id: r.response_id,
            submitted_by_name: r.submitted_by_name || r.full_name || "User",
            submitted_by_role: r.submitted_by_role || "",
            unit_name: r.unit_name || "",
            submitted_at: r.submitted_at || r.created_at || null,
            answers: [],
          });
        }
        map.get(r.response_id).answers.push({ question: r.question_text || r.question || "", answer: r.answer ?? "" });
      }
      setFormResponses(Array.from(map.values()).sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at)));
    } catch (err) {
      console.error(err);
      setFormResponses([]);
    } finally {
      setResponsesLoading(false);
    }
  };

  const addFormQuestion = () => setFormQuestions([...formQuestions, { questiontext: "", questiontype: "text", options: "" }]);
  const removeFormQuestion = (idx) => setFormQuestions(formQuestions.filter((_, i) => i !== idx));
  const handleQuestionChange = (idx, field, value) => setFormQuestions(formQuestions.map((q, i) => i === idx ? { ...q, [field]: value } : q));

  const handleTeacherColumnToggle = (key) => setTeacherVisibleColumns(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]);
  const handleStudentColumnToggle = (key) => setStudentVisibleColumns(prev => prev.includes(key) ? prev.filter(c => c !== key) : [...prev, key]);

  // Sub-components (defined inside for access to state)
  const DynamicDropdownTable = ({ tableName, data }) => {
    const [visibleCols, setVisibleCols] = useState(data.length ? Object.keys(data[0]) : []);
    const [selectShow, setSelectShow] = useState(false);
    
    useEffect(() => {
      if (data.length) setVisibleCols(Object.keys(data[0]));
    }, [data]);

    if (!data.length) return <div className="text-center py-5 text-muted">No {tableName} data available.</div>;

    const cols = Object.keys(data[0]);
    return (
      <div className="dynamic-table-wrapper">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0 fw-bold">{tableName} Directory</h6>
          <div className="position-relative">
            <button className="btn btn-sm btn-light border" onClick={() => setSelectShow(!selectShow)}>Columns</button>
            {selectShow && (
              <div className="col-dropdown p-3 border rounded shadow bg-white position-absolute end-0 mt-2" style={{ zIndex: 1000, minWidth: '200px' }}>
                {cols.map(col => (
                  <div key={col} className="form-check mb-1">
                    <input type="checkbox" className="form-check-input" checked={visibleCols.includes(col)} onChange={() => setVisibleCols(prev => prev.includes(col) ? prev.filter(c => c !== col) : [...prev, col])} />
                    <label className="form-check-label small">{toLabel(col)}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="table-responsive professional-table">
          <table className="table table-hover align-middle">
            <thead>
              <tr>{cols.filter(c => visibleCols.includes(c)).map(c => <th key={c}>{toLabel(c)}</th>)}</tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i}>{cols.filter(c => visibleCols.includes(c)).map(c => <td key={c}>{row[c]?.toString() || "-"}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderUnitDetails = () => (
    <div className="school-detail-view">
      <SchoolContextHeader
        schoolName={unitDetails?.kendrashala_name}
        semisNo={unitDetails?.semis_no || "-"}
        headmasterName={unitDetails?.headmistress_name || "-"}
        totalStudents={unitDetails?.students?.length ?? 0}
        totalTeachers={unitDetails?.teachers?.length ?? 0}
        onBack={() => { setSelectedUnit(null); setUnitDetails(null); setSelectedSchoolTab("overview"); }}
        onGenerateReport={() => setSidebarTab("reports")}
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
      <div className="tab-pane-content mt-4">
        {selectedSchoolTab === "overview" && (
          <AdminCard header="Summary">
            <div className="metrics-grid">
              <div className="metric-box">
                <span className="label">STAFF</span>
                <span className="value">{unitDetails?.teachers?.length ?? 0}</span>
              </div>
              <div className="metric-box">
                <span className="label">STUDENTS</span>
                <span className="value">{unitDetails?.students?.length ?? 0}</span>
              </div>
              <div className="metric-box highlight">
                <span className="label">COLLECTED</span>
                <span className="value">₹{(overviewMetrics?.feesCollectedFy ?? 0).toLocaleString()}</span>
              </div>
            </div>
          </AdminCard>
        )}
        {selectedSchoolTab === "finance" && (
          <AdminCard header="Finance Insights">
             <div className="d-flex justify-content-between mb-4">
               <span>Year: <strong>{selectedOverviewFy}</strong></span>
               <select className="form-select form-select-sm w-auto" value={selectedOverviewFy} onChange={(e) => setSelectedOverviewFy(e.target.value)}>
                 <option value="2023-24">2023-24</option>
                 <option value="2024-25">2024-25</option>
               </select>
             </div>
             <div className="finance-summary-grid">
                <div className="finance-item collected">
                  <span className="label">FEES COLLECTED</span>
                  <span className="value">₹{(overviewMetrics?.feesCollectedFy || 0).toLocaleString()}</span>
                </div>
                <div className="finance-item spent">
                  <span className="label">SALARY SPENT</span>
                  <span className="value">₹{(overviewMetrics?.salarySpentFy || 0).toLocaleString()}</span>
                </div>
             </div>
          </AdminCard>
        )}
        {selectedSchoolTab === "teachers" && (
          <AdminCard>
            <TableContainer title="Staff Directory" toolbar={
              <Toolbar right={<button className="btn btn-sm btn-light" onClick={() => setTeachersShowColDropdown(!teachersShowColDropdown)}>Columns</button>} />
            }>
              <div className="table-responsive professional-table">
                <table className="table table-hover">
                  <thead>
                    <tr>{teacherFields.filter(([k]) => teacherVisibleColumns.includes(k)).map(([k, l]) => <th key={k}>{l}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filteredTeachers.map(t => (
                      <tr key={t.staff_id}>{teacherFields.filter(([k]) => teacherVisibleColumns.includes(k)).map(([k]) => <td key={k}>{t[k]?.toString() || "-"}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TableContainer>
          </AdminCard>
        )}
        {selectedSchoolTab === "students" && (
          <AdminCard>
            <TableContainer title="Student Enrollment" toolbar={
              <select className="form-select form-select-sm w-auto" value={studentsYear} onChange={e => setStudentsYear(e.target.value)}>
                <option value="">All Years</option>
                {allStudentYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            }>
              <div className="table-responsive professional-table">
                <table className="table table-hover">
                  <thead>
                    <tr>{studentFields.filter(([k]) => studentVisibleColumns.includes(k)).map(([k, l]) => <th key={k}>{l}</th>)}</tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map(s => (
                      <tr key={s.student_id}>{studentFields.filter(([k]) => studentVisibleColumns.includes(k)).map(([k]) => <td key={k}>{s[k]?.toString() || "-"}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TableContainer>
          </AdminCard>
        )}
        {["payments", "banks", "cases"].includes(selectedSchoolTab) && (
          <AdminCard>
            <DynamicDropdownTable tableName={selectedSchoolTab} data={unitDetails[selectedSchoolTab] ?? []} />
          </AdminCard>
        )}
      </div>
    </div>
  );

  const renderDashboardMain = () => (
    <div className="dashboard-main-view">
      <div className="section-header-pro mb-4">
        <h3>School Overview</h3>
        <p className="text-muted">Monitor and manage all MKSSS educational units</p>
      </div>
      <AdminUnitImport />
      <div className="row mt-4">
        {units.map((unit, idx) => (
          <div key={unit.unit_id} className="col-md-4 mb-4">
            <div className="school-card-pro p-3 border rounded shadow-sm bg-white" onClick={() => handleUnitCardClick(unit.unit_id)} style={{ cursor: 'pointer' }}>
               <h5 className="fw-bold">{unit.kendrashala_name}</h5>
               <div className="d-flex justify-content-between mt-3 text-muted small">
                 <span>Staff: {unit.staff_count || 0}</span>
                 <span>Students: {unit.student_count || 0}</span>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNotificationsModule = () => (
    <div className="notifications-module">
      <TabNavigation
        tabs={[
          { id: "send_notification", label: "Notification", icon: "bi-send" },
          { id: "create_form", label: "Create Form", icon: "bi-file-plus" },
          { id: "active_forms", label: "Manage Forms", icon: "bi-journal" },
        ]}
        activeTab={selectedNotificationTab}
        onTabChange={setSelectedNotificationTab}
      />
      <div className="mt-4">
        {selectedNotificationTab === "send_notification" && (
          <AdminCard header="Send Announcement">
            <form onSubmit={addNotification}>
              <select className="form-select mb-3" value={notifUnitId} onChange={e => setNotifUnitId(e.target.value)} required>
                <option value="">Select School</option>
                {units.map(u => <option key={u.unit_id} value={u.unit_id}>{u.unit_name}</option>)}
              </select>
              <input className="form-control mb-3" placeholder="Title" value={notifTitle} onChange={e => setNotifTitle(e.target.value)} required />
              <textarea className="form-control mb-3" placeholder="Message" rows={4} value={notifMsg} onChange={e => setNotifMsg(e.target.value)} required />
              <button className="btn btn-primary w-100">Send</button>
            </form>
          </AdminCard>
        )}
        {selectedNotificationTab === "create_form" && (
          <AdminCard header="Create Data Form">
             <form onSubmit={addForm}>
                <select className="form-select mb-3" value={notifUnitId} onChange={e => setNotifUnitId(e.target.value)} required>
                  <option value="">Select School</option>
                  {units.map(u => <option key={u.unit_id} value={u.unit_id}>{u.unit_name}</option>)}
                </select>
                <input className="form-control mb-3" placeholder="Form Title" value={formTitle} onChange={e => setFormTitle(e.target.value)} required />
                <input type="datetime-local" className="form-control mb-3" value={formDeadline} onChange={e => setFormDeadline(e.target.value)} required />
                {formQuestions.map((q, idx) => (
                  <div key={idx} className="mb-3 p-2 bg-light rounded">
                    <input className="form-control mb-2" placeholder="Question" value={q.questiontext} required onChange={e => handleQuestionChange(idx, "questiontext", e.target.value)} />
                    <select className="form-select" value={q.questiontype} onChange={e => handleQuestionChange(idx, "questiontype", e.target.value)}>
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="select">Select</option>
                    </select>
                  </div>
                ))}
                <button type="button" className="btn btn-outline-secondary btn-sm mb-3" onClick={addFormQuestion}>+ Question</button>
                <button className="btn btn-success w-100">Launch Form</button>
             </form>
          </AdminCard>
        )}
        {selectedNotificationTab === "active_forms" && (
          <div className="row">
            <div className="col-md-4">
              <AdminCard header="Forms">
                <div className="list-group">
                  {forms.map(f => (
                    <button key={f.id} className={`list-group-item list-group-item-action ${selectedFormId === f.id ? 'active' : ''}`} onClick={() => { setSelectedFormId(f.id); loadRecipientStatus(f.id); loadFormResponsesForDashboard(f.id); }}>{f.title}</button>
                  ))}
                </div>
              </AdminCard>
            </div>
            <div className="col-md-8">
              <AdminCard header="Responses">
                {!selectedFormId ? <div className="text-center py-5">Select a form</div> : (
                  <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                    {formResponses.map(r => (
                      <div key={r.response_id} className="p-3 border rounded mb-2">
                        <div className="fw-bold">{r.submitted_by_name} ({r.unit_name})</div>
                        <div className="mt-2 border-top pt-2">
                          {r.answers.map((a, i) => <div key={i} className="small"><strong>{a.question}:</strong> {a.answer}</div>)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AdminCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (sidebarTab) {
      case "dashboard": return selectedUnit ? renderUnitDetails() : renderDashboardMain();
      case "notifications": return renderNotificationsModule();
      case "reports": return <div>Reports Page Logic...</div>;
      case "charts": return <AdminCharts units={units} />;
      default: return null;
    }
  };

  return (
    <AdminLayout activeSidebarTab={sidebarTab} onSidebarTabChange={setSidebarTab}>
      <div className="dashboard-wrapper p-4">
        {loading || unitLoading ? <div className="text-center py-5">Loading...</div> : renderContent()}
      </div>
      <ChatWidget />
    </AdminLayout>
  );
}
