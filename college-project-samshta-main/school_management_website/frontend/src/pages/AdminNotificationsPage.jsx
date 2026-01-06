import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatWidget from "../components/ChatWidget";
import AdminLayout from "../components/admin/AdminLayout";
import AdminCard from "../components/admin/AdminCard";
import TabNavigation from "../components/admin/TabNavigation";
import TableContainer from "../components/admin/TableContainer";
import EmptyState from "../components/admin/EmptyState";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [forms, setForms] = useState([]);
  const [filledForms, setFilledForms] = useState([]);
  const [selectedTab, setSelectedTab] = useState("send_notification");

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
    fetchUnits();
  }, [receiverRole]);

  useEffect(() => {
    const fetchFilledForms = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/admin/filled-forms-detailed",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFilledForms(res.data?.data || []);
      } catch (err) {
        setFilledForms([]);
      }
    };
    fetchFilledForms();
  }, []);

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

  // Load active forms
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
            { id: "forms", label: "Form Responses", icon: "bi-file-earmark-check" },
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

          {selectedTab === "forms" && (
            <div className="row g-4">
              <div className="col-lg-10 mx-auto">
                <AdminCard header={
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-file-earmark-check-fill text-info"></i>
                    <span>Form Responses Registry</span>
                  </div>
                }>
                  <TableContainer title={""}>
                    {(() => {
                      const filteredForms = selectedSchool
                        ? (filledForms || []).filter((f) => String(f.unit_id) === String(selectedSchool))
                        : (filledForms || []);

                      const excludedKeys = [
                        "response_id",
                        "submitted_by_id",
                        "question_id",
                        "question_type",
                      ];

                      const filteredKeys =
                        filteredForms && filteredForms[0]
                          ? Object.keys(filteredForms[0]).filter((col) => !excludedKeys.includes(col))
                          : [];

                      return (
                        filteredForms && filteredForms.length > 0 ? (
                          <div className="table-responsive professional-table">
                            <table className="table table-hover align-middle">
                              <thead>
                                <tr>
                                  {filteredKeys.map((col) => (
                                    <th key={col}>{col.replace(/_/g, ' ').toUpperCase()}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {filteredForms.map((row, idx) => (
                                  <tr key={idx}>
                                    {filteredKeys.map((col) => (
                                      <td key={col}>
                                        {col.toLowerCase().includes("date") || col.toLowerCase().includes("at")
                                          ? <span className="text-muted small">
                                              {row[col] ? new Date(row[col]).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                              }) : "-"}
                                            </span>
                                          : row[col] !== null && row[col] !== undefined
                                            ? String(row[col])
                                            : "-"}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <EmptyState
                            title={"No responses"}
                            description={"No form responses submitted by this school yet."}
                          />
                        )
                      );
                    })()}
                  </TableContainer>
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
