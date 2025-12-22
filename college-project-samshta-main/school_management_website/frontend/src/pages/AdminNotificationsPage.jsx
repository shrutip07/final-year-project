import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatWidget from "../components/ChatWidget";
import AdminLayout from "../components/admin/AdminLayout";
import AdminCard from "../components/admin/AdminCard";
import TabNavigation from "../components/admin/TabNavigation";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [forms, setForms] = useState([]);
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

  const notifAPI = "http://localhost:5000/api/notifications";
  const formAPI = "http://localhost:5000/api/forms";

  useEffect(() => {
    loadNotifications();
    loadForms();
  }, [receiverRole]);

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
    await axios.post(
      notifAPI,
      {
        title,
        message,
        receiver_role: receiverRole,
        sender_role: "admin",
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setTitle("");
    setMessage("");
    loadNotifications();
    alert("Notification Sent ✅");
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

    try {
      const formRes = await axios.post(
        formAPI + "/create",
        {
          title: formTitle,
          description: formDesc,
          receiver_role: receiverRole,
          deadline: formDeadline,
          questions: questionsPayload,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const formId = formRes.data.form.id;
      const formLink = `http://localhost:3000/forms/${formId}`;

      await axios.post(
        notifAPI,
        {
          title: `New Form: ${formTitle}`,
          message: `Please fill this form before deadline: ${formLink}`,
          receiver_role: receiverRole,
          sender_role: "admin",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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

  return (
    <AdminLayout activeSidebarTab="notifications">
      <div className="notifications-page erp-container">
        <TabNavigation
          tabs={[
            { id: "send_notification", label: "Send Notification", icon: "bi-send-fill" },
            { id: "create_form", label: "Create Form", icon: "bi-file-earmark-plus-fill" },
            { id: "received", label: "Received Notifications", icon: "bi-inbox-fill" },
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
                      <div className="col-md-12">
                        <label className="form-label small fw-bold text-muted">TARGET AUDIENCE</label>
                        <select className="form-select border-primary-subtle" value={receiverRole} onChange={(e) => setReceiverRole(e.target.value)}>
                          <option value="principal">Principals (Heads of Schools)</option>
                          <option value="teacher">Teachers (Staff Members)</option>
                        </select>
                      </div>
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
                        <label className="form-label small fw-bold text-muted">SUBMISSION DEADLINE</label>
                        <input type="datetime-local" className="form-control border-danger-subtle" value={formDeadline} onChange={(e) => setFormDeadline(e.target.value)} required />
                      </div>
                      <div className="col-md-12">
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

          {selectedTab === "received" && (
            <div className="row g-4">
              <div className="col-lg-10 mx-auto">
                <AdminCard header={
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-envelope-paper-fill text-info"></i>
                    <span>Inbox - Administrator Notifications</span>
                  </div>
                }>
                  <div className="notification-list">
                    {notifications.length === 0 ? (
                      <div className="text-center py-5">
                        <i className="bi bi-mailbox2 text-muted fs-1 mb-3"></i>
                        <p className="text-muted fw-bold">Your inbox is clear</p>
                      </div>
                    ) : (
                      <div className="row g-3">
                        {notifications.map((n) => (
                          <div key={n.id} className="col-md-12">
                            <div
                              className={`p-4 rounded border-start border-4 shadow-sm transition-all ${n.is_read ? "bg-light border-secondary opacity-75" : "bg-white border-primary border-shadow-custom"}`}
                              style={{ cursor: "pointer" }}
                              onClick={() => markRead(n.id)}
                            >
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className={`mb-0 fw-bold ${n.is_read ? "text-muted" : "text-dark"}`}>{n.title}</h6>
                                {!n.is_read && <span className="badge bg-primary rounded-pill">New</span>}
                              </div>
                              <p className="m-0 text-muted small lh-lg">{n.message}</p>
                              <div className="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
                                <span className="text-uppercase fw-bold text-muted" style={{ fontSize: '10px', letterSpacing: '1px' }}>
                                  <i className="bi bi-person-circle me-1"></i> {n.receiver_role}
                                </span>
                                <span className="text-muted" style={{ fontSize: '10px' }}>
                                  <i className="bi bi-clock me-1"></i> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
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

