import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatWidget from "../components/ChatWidget";
import AdminLayout from "../components/admin/AdminLayout";
import AdminCard from "../components/admin/AdminCard";
import TabNavigation from "../components/admin/TabNavigation";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [forms, setForms] = useState([]);
  const [adminForms, setAdminForms] = useState([]);
  const [selectedTab, setSelectedTab] = useState("send_notification");
  const [selectedFormResponses, setSelectedFormResponses] = useState(null);
  const [viewingFormId, setViewingFormId] = useState(null);
  const [loadingResponses, setLoadingResponses] = useState(false);

  // Notification state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [receiverRole, setReceiverRole] = useState("principal");

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formDeadline, setFormDeadline] = useState("");
  const [formQuestions, setFormQuestions] = useState([{ question_text: "", question_type: "text", options: "" }]);

  // Optional targeting state
  const [units, setUnits] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [sendToAllTeachers, setSendToAllTeachers] = useState(true);
  const [selectedTeachers, setSelectedTeachers] = useState([]);

  const notifAPI = "http://localhost:5000/api/notifications";
  const formAPI = "http://localhost:5000/api/forms";

  useEffect(() => {
    loadNotifications();
    loadForms();
    loadAdminForms();
    fetchUnits();
  }, [receiverRole]);

  useEffect(() => {
    if (selectedSchool && receiverRole === "teacher") {
      fetchTeachers(selectedSchool);
    } else {
      setTeachers([]);
      setSelectedTeachers([]);
      setSendToAllTeachers(true);
    }
  }, [selectedSchool, receiverRole]);

  const fetchUnits = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:5000/api/admin/units", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUnits(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch units", err);
    }
  };

  const fetchTeachers = async (unitId) => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`http://localhost:5000/api/admin/units/${unitId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTeachers(res.data.teachers || []);
    } catch (err) {
      console.error("Failed to fetch teachers", err);
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(notifAPI, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch {
      setNotifications([]);
    }
  };

  // Load active forms for creation tab
  const loadForms = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(`${formAPI}/active?role=${receiverRole}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setForms(res.data);
    } catch {
      setForms([]);
    }
  };

  // Load all forms for responses tab
  const loadAdminForms = async () => {
    const token = localStorage.getItem("token");
    try {
      const [pForms, tForms] = await Promise.all([
        axios.get(`${formAPI}/active?role=principal`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${formAPI}/active?role=teacher`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const combined = [...pForms.data, ...tForms.data];
      // Sort by created_at desc
      setAdminForms(combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch {
      setAdminForms([]);
    }
  };

  const viewResponses = async (formId) => {
    const token = localStorage.getItem("token");
    setLoadingResponses(true);
    setViewingFormId(formId);
    try {
      const res = await axios.get(`${formAPI}/${formId}/responses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedFormResponses(res.data);
    } catch {
      setSelectedFormResponses([]);
    } finally {
      setLoadingResponses(false);
    }
  };

  // Send plain notification
  const sendNotification = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const payload = {
      title,
      message,
      receiver_role: receiverRole,
      sender_role: "admin",
    };

    if (selectedSchool) {
      payload.school_id = selectedSchool;
      if (receiverRole === "teacher" && !sendToAllTeachers && selectedTeachers.length > 0) {
        payload.teacher_ids = selectedTeachers;
      }
    }

    try {
      await axios.post(notifAPI, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTitle("");
      setMessage("");
      loadNotifications();
      alert("Notification Sent ✅");
    } catch (error) {
      alert("Error sending notification: " + error.message);
    }
  };

  // Create form and send notification with form link
  const createFormAndNotify = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const questionsPayload = formQuestions.map((q) => ({
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options ? q.options : null,
    }));

    const formPayload = {
      title: formTitle,
      description: formDesc,
      receiver_role: receiverRole,
      deadline: formDeadline,
      questions: questionsPayload,
    };

    if (selectedSchool) {
      formPayload.school_id = selectedSchool;
      if (receiverRole === "teacher" && !sendToAllTeachers && selectedTeachers.length > 0) {
        formPayload.teacher_ids = selectedTeachers;
      }
    }

    try {
      const formRes = await axios.post(formAPI + "/create", formPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const formId = formRes.data.form.id;
      const formLink = `http://localhost:3000/forms/${formId}`;

      const notifPayload = {
        title: `New Form: ${formTitle}`,
        message: `Please fill this form before deadline: ${formLink}`,
        receiver_role: receiverRole,
        sender_role: "admin",
      };

      if (selectedSchool) {
        notifPayload.school_id = selectedSchool;
        if (receiverRole === "teacher" && !sendToAllTeachers && selectedTeachers.length > 0) {
          notifPayload.teacher_ids = selectedTeachers;
        }
      }

      await axios.post(notifAPI, notifPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

        alert("Form Created and Notification Sent ✅");
        setFormTitle("");
        setFormDesc("");
        setFormDeadline("");
        setFormQuestions([{ question_text: "", question_type: "text", options: "" }]);
        loadForms();
        loadAdminForms();
        loadNotifications();
      } catch (error) {
      alert("Error creating form or notification: " + error.message);
    }
  };

  const updateQuestion = (index, field, value) => {
    const qs = [...formQuestions];
    qs[index][field] = value;
    setFormQuestions(qs);
  };

  const addQuestion = () => setFormQuestions([...formQuestions, { question_text: "", question_type: "text", options: "" }]);

  const removeQuestion = (index) => {
    const qs = [...formQuestions];
    qs.splice(index, 1);
    setFormQuestions(qs);
  };

  const markRead = async (id) => {
    const token = localStorage.getItem("token");
    await axios.put(
      `${notifAPI}/${id}/read`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    loadNotifications();
  };

  const handleTeacherSelection = (teacherId) => {
    setSelectedTeachers((prev) =>
      prev.includes(teacherId) ? prev.filter((id) => id !== teacherId) : [...prev, teacherId]
    );
  };

  return (
    <AdminLayout activeSidebarTab="notifications">
      <div className="notifications-page erp-container">
        <TabNavigation
          tabs={[
            { id: "send_notification", label: "Send Notification", icon: "bi-send-fill" },
            { id: "create_form", label: "Create Form", icon: "bi-file-earmark-plus-fill" },
            { id: "form_responses", label: "Form Responses", icon: "bi-file-earmark-spreadsheet-fill" },
            { id: "active_forms", label: "Active Forms", icon: "bi-card-list" },
          ]}
          activeTab={selectedTab}
          onTabChange={setSelectedTab}
        />

        <div className="tab-pane-container mt-3" style={{ height: 'calc(100vh - 180px)', overflowY: 'auto' }}>
          {selectedTab === "send_notification" && (
            <div className="row g-4">
              <div className="col-lg-8 mx-auto">
                <AdminCard header={
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-megaphone-fill text-primary"></i>
                    <span>Official Announcement</span>
                  </div>
                }>
                  <form onSubmit={sendNotification}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">TARGET AUDIENCE</label>
                        <select className="form-select border-primary-subtle" value={receiverRole} onChange={(e) => setReceiverRole(e.target.value)}>
                          <option value="principal">Principals (Heads of Schools)</option>
                          <option value="teacher">Teachers (Staff Members)</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">TARGET SCHOOL (OPTIONAL)</label>
                        <select className="form-select border-primary-subtle" value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
                          <option value="">All Schools</option>
                          {units.map((u) => (
                            <option key={u.unit_id} value={u.unit_id}>
                              {u.kendrashala_name || `Unit ${u.unit_id}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {receiverRole === "teacher" && selectedSchool && (
                        <div className="col-md-12 bg-light p-3 rounded border">
                          <label className="form-label small fw-bold text-primary mb-2">ADVANCED TEACHER TARGETING</label>
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="sendAllTeachersNotif"
                              checked={sendToAllTeachers}
                              onChange={(e) => setSendToAllTeachers(e.target.checked)}
                            />
                            <label className="form-check-label small fw-bold" htmlFor="sendAllTeachersNotif">
                              Send to all teachers in this school
                            </label>
                          </div>
                          {!sendToAllTeachers && teachers.length > 0 && (
                            <div className="teacher-selector mt-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                              <label className="form-label small text-muted d-block mb-1">Select Specific Teachers:</label>
                              {teachers.map((t) => (
                                <div key={t.staff_id} className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`t-${t.staff_id}`}
                                    checked={selectedTeachers.includes(t.staff_id)}
                                    onChange={() => handleTeacherSelection(t.staff_id)}
                                  />
                                  <label className="form-check-label small" htmlFor={`t-${t.staff_id}`}>
                                    {t.full_name} ({t.designation})
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                          {!sendToAllTeachers && teachers.length === 0 && (
                            <p className="text-muted small mb-0">No teachers found for this school.</p>
                          )}
                        </div>
                      )}

                      <div className="col-md-12">
                        <label className="form-label small fw-bold text-muted">ANNOUNCEMENT TITLE</label>
                        <input type="text" className="form-control" placeholder="Subject of the notification" value={title} onChange={(e) => setTitle(e.target.value)} required />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label small fw-bold text-muted">MESSAGE CONTENT</label>
                        <textarea className="form-control" rows={5} placeholder="Type your detailed message here..." value={message} onChange={(e) => setMessage(e.target.value)} required />
                      </div>
                      <div className="col-md-12">
                        <button className="btn btn-primary btn-lg w-100 shadow-sm" type="submit">
                          <i className="bi bi-send-check me-2"></i> Broadcast Notification
                        </button>
                      </div>
                    </div>
                  </form>
                </AdminCard>
              </div>
            </div>
          )}

          {selectedTab === "create_form" && (
            <div className="row g-4">
              <div className="col-lg-8 mx-auto">
                <AdminCard header={
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-file-earmark-spreadsheet-fill text-success"></i>
                    <span>Data Collection Campaign</span>
                  </div>
                }>
                  <form onSubmit={createFormAndNotify}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">TARGET ROLE</label>
                        <select className="form-select border-success-subtle" value={receiverRole} onChange={(e) => setReceiverRole(e.target.value)}>
                          <option value="principal">Principals</option>
                          <option value="teacher">Teachers</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">TARGET SCHOOL (OPTIONAL)</label>
                        <select className="form-select border-success-subtle" value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)}>
                          <option value="">All Schools</option>
                          {units.map((u) => (
                            <option key={u.unit_id} value={u.unit_id}>
                              {u.kendrashala_name || `Unit ${u.unit_id}`}
                            </option>
                          ))}
                        </select>
                      </div>

                      {receiverRole === "teacher" && selectedSchool && (
                        <div className="col-md-12 bg-light p-3 rounded border">
                          <label className="form-label small fw-bold text-success mb-2">ADVANCED TEACHER TARGETING</label>
                          <div className="form-check mb-2">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id="sendAllTeachersForm"
                              checked={sendToAllTeachers}
                              onChange={(e) => setSendToAllTeachers(e.target.checked)}
                            />
                            <label className="form-check-label small fw-bold" htmlFor="sendAllTeachersForm">
                              Send to all teachers in this school
                            </label>
                          </div>
                          {!sendToAllTeachers && teachers.length > 0 && (
                            <div className="teacher-selector mt-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                              <label className="form-label small text-muted d-block mb-1">Select Specific Teachers:</label>
                              {teachers.map((t) => (
                                <div key={t.staff_id} className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`tf-${t.staff_id}`}
                                    checked={selectedTeachers.includes(t.staff_id)}
                                    onChange={() => handleTeacherSelection(t.staff_id)}
                                  />
                                  <label className="form-check-label small" htmlFor={`tf-${t.staff_id}`}>
                                    {t.full_name} ({t.designation})
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                          {!sendToAllTeachers && teachers.length === 0 && (
                            <p className="text-muted small mb-0">No teachers found for this school.</p>
                          )}
                        </div>
                      )}

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">SUBMISSION DEADLINE</label>
                        <input type="datetime-local" className="form-control border-danger-subtle" value={formDeadline} onChange={(e) => setFormDeadline(e.target.value)} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">FORM TITLE</label>
                        <input type="text" className="form-control" placeholder="e.g. Monthly Attendance Registry" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} required />
                      </div>
                      
                      <div className="col-md-12">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <label className="form-label small fw-bold text-muted mb-0">QUESTIONNAIRE DESIGN</label>
                          <button type="button" className="btn btn-sm btn-outline-success" onClick={addQuestion}>
                            <i className="bi bi-plus-lg me-1"></i> Add Question
                          </button>
                        </div>
                        {formQuestions.map((q, i) => (
                          <div key={i} className="p-3 border rounded bg-light mb-3 shadow-sm">
                             <input
                              type="text"
                              placeholder="Describe your question..."
                              className="form-control mb-2 fw-semibold"
                              value={q.question_text}
                              onChange={(e) => updateQuestion(i, 'question_text', e.target.value)}
                              required
                            />
                            <div className="d-flex gap-2">
                              <select
                                className="form-select w-auto"
                                value={q.question_type}
                                onChange={(e) => updateQuestion(i, 'question_type', e.target.value)}
                              >
                                <option value="text">Short Text</option>
                                <option value="number">Numeric Value</option>
                                <option value="date">Date Entry</option>
                                <option value="select">Multiple Choice (MCQ)</option>
                              </select>
                              {q.question_type === 'select' && (
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Option A, Option B, Option C..."
                                  value={q.options}
                                  onChange={(e) => updateQuestion(i, 'options', e.target.value)}
                                  required
                                />
                              )}
                              <button type="button" className="btn btn-outline-danger" onClick={() => removeQuestion(i)} disabled={formQuestions.length === 1}>
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="col-md-12 mt-4">
                        <button type="submit" className="btn btn-success btn-lg w-100 shadow-sm">
                          <i className="bi bi-cloud-upload me-2"></i> Deploy Form & Notify Recipients
                        </button>
                      </div>
                    </div>
                  </form>
                </AdminCard>
              </div>
            </div>
          )}

          {selectedTab === "form_responses" && (
            <div className="row g-4">
              <div className="col-lg-10 mx-auto">
                <AdminCard header={
                  <div className="d-flex align-items-center justify-content-between w-100">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-file-earmark-spreadsheet-fill text-primary"></i>
                      <span>{selectedFormResponses ? "Response Details" : "Form Submission Monitoring"}</span>
                    </div>
                    {selectedFormResponses && (
                      <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedFormResponses(null)}>
                        <i className="bi bi-arrow-left me-1"></i> Back to Forms
                      </button>
                    )}
                  </div>
                }>
                  {!selectedFormResponses ? (
                    <div className="form-responses-list">
                      {adminForms.length === 0 ? (
                        <div className="text-center py-5">
                          <i className="bi bi-clipboard-x text-muted fs-1 mb-3"></i>
                          <p className="text-muted fw-bold">No forms created yet</p>
                        </div>
                      ) : (
                        <div className="row g-3">
                          {adminForms.map((form) => (
                            <div key={form.id} className="col-md-12">
                              <div className="p-4 rounded border bg-white shadow-sm hover-shadow transition-all">
                                <div className="d-flex justify-content-between align-items-start mb-3">
                                  <div>
                                    <h6 className="text-dark fw-bold mb-1">{form.title}</h6>
                                    <span className="text-muted small">Target: <span className="text-capitalize">{form.receiver_role}s</span></span>
                                  </div>
                                  <div className="text-end">
                                    <div className="text-danger small fw-bold mb-1">
                                      <i className="bi bi-calendar-event me-1"></i> 
                                      Deadline: {new Date(form.deadline).toLocaleDateString()}
                                    </div>
                                    <span className="badge bg-light text-dark border">
                                      ID: #{form.id}
                                    </span>
                                  </div>
                                </div>
                                <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                                  <div className="text-muted small">
                                    <i className="bi bi-info-circle me-1"></i>
                                    {form.description || 'Monitor submissions for this campaign.'}
                                  </div>
                                  <button 
                                    className="btn btn-primary btn-sm px-4"
                                    onClick={() => viewResponses(form.id)}
                                    disabled={loadingResponses && viewingFormId === form.id}
                                  >
                                    {loadingResponses && viewingFormId === form.id ? (
                                      <span className="spinner-border spinner-border-sm me-2"></span>
                                    ) : (
                                      <i className="bi bi-eye-fill me-2"></i>
                                    )}
                                    View Responses
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="responses-detail-view">
                      {selectedFormResponses.length === 0 ? (
                        <div className="text-center py-5">
                          <i className="bi bi-chat-left-dots text-muted fs-1 mb-3"></i>
                          <p className="text-muted fw-bold">No responses submitted yet</p>
                          <p className="small text-muted">Wait for recipients to fill the form.</p>
                        </div>
                      ) : (
                        <div className="response-items">
                          <div className="mb-4 p-3 bg-primary bg-opacity-10 rounded border border-primary-subtle">
                            <h6 className="mb-0 text-primary fw-bold">
                              Total Submissions: {selectedFormResponses.length}
                            </h6>
                          </div>
                          {selectedFormResponses.map((resp, idx) => (
                            <div key={resp.id} className="card mb-4 shadow-sm border-0 bg-light">
                              <div className="card-header bg-white border-bottom-0 pt-3 px-4">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <h6 className="mb-0 fw-bold text-dark">Submission #{idx + 1}</h6>
                                    <span className="text-muted small">
                                      <i className="bi bi-clock me-1"></i>
                                      {new Date(resp.submitted_at).toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="text-end">
                                    <span className="badge bg-info text-white me-2">Response ID: {resp.id}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="card-body px-4 pb-4">
                                <div className="row g-3 mb-4">
                                  <div className="col-md-4">
                                    <label className="text-muted small fw-bold d-block">SUBMITTED BY</label>
                                    <span className="fw-semibold">User ID: {resp.submitted_by}</span>
                                  </div>
                                  <div className="col-md-4">
                                    <label className="text-muted small fw-bold d-block">SCHOOL ID</label>
                                    <span className="fw-semibold">#{resp.school_id}</span>
                                  </div>
                                </div>
                                <div className="questions-answers bg-white p-4 rounded border">
                                  <h6 className="border-bottom pb-2 mb-3 text-secondary small fw-bold">QUESTION & ANSWER LIST</h6>
                                  {resp.answers && resp.answers.map((ans, aIdx) => (
                                    <div key={aIdx} className="mb-3 last-child-mb-0">
                                      <p className="mb-1 fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                                        Q{aIdx + 1}: {ans.question_text}
                                      </p>
                                      <div className="p-2 bg-light rounded border-start border-3 border-primary">
                                        {ans.answer || <span className="text-muted italic">No answer provided</span>}
                                      </div>
                                    </div>
                                  ))}
                                  {(!resp.answers || resp.answers.length === 0) && (
                                    <p className="text-muted small italic">No detailed answers found for this response.</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </AdminCard>
              </div>
            </div>
          )}

          {selectedTab === "active_forms" && (
            <div className="row g-4">
              <div className="col-lg-10 mx-auto">
                <AdminCard header={
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-clipboard-data-fill text-warning"></i>
                    <span>Ongoing Data Collection Forms</span>
                  </div>
                }>
                  <div className="form-list">
                    {forms.length === 0 ? (
                      <div className="text-center py-5">
                        <i className="bi bi-file-earmark-x text-muted fs-1 mb-3"></i>
                        <p className="text-muted fw-bold">No active forms found</p>
                      </div>
                    ) : (
                      <div className="row g-3">
                        {forms.map((form) => (
                          <div key={form.id} className="col-md-6">
                            <div className="p-4 rounded border bg-white shadow-sm h-100 d-flex flex-column">
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <h6 className="text-primary fw-bold mb-0">{form.title}</h6>
                                <span className="erp-badge badge-year">ACTIVE</span>
                              </div>
                              <p className="small text-muted mb-4 flex-grow-1">{form.description || 'No specialized description provided for this collection form.'}</p>
                              <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                                <div className="text-danger small fw-bold">
                                  <i className="bi bi-calendar-event me-1"></i> 
                                  Due: {new Date(form.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </div>
                                <a href={`http://localhost:3000/forms/${form.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary px-3">
                                  <i className="bi bi-link-45deg me-1"></i> Form Link
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </AdminCard>
              </div>
            </div>
          )}
        </div>
      </div>
      <ChatWidget />
    </AdminLayout>
  );
}
