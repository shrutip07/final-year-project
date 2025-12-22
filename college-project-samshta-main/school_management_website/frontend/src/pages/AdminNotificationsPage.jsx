import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatWidget from "../components/ChatWidget";
import AdminLayout from "../components/admin/AdminLayout";
import AdminCard from "../components/admin/AdminCard";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [forms, setForms] = useState([]);

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
  }, []);

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
      <div className="notifications-portal">
        <div className="row">
          <div className="col-lg-6 mb-4">
            <AdminCard header="Send Global Notification">
              <form onSubmit={sendNotification}>
                <div className="mb-3">
                  <label className="form-label small fw-bold">RECEIVER ROLE</label>
                  <select className="form-select" value={receiverRole} onChange={(e) => setReceiverRole(e.target.value)}>
                    <option value="principal">Principal</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">TITLE</label>
                  <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold">MESSAGE</label>
                  <textarea className="form-control" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} required />
                </div>
                <button className="btn btn-primary w-100" type="submit">
                  <i className="bi bi-send me-2"></i> Send Notification
                </button>
              </form>
            </AdminCard>
          </div>

          <div className="col-lg-6 mb-4">
            <AdminCard header="Create & Distribute Form">
              <form onSubmit={createFormAndNotify}>
                <div className="mb-3">
                  <label className="form-label small fw-bold">TARGET ROLE</label>
                  <select className="form-select" value={receiverRole} onChange={(e) => setReceiverRole(e.target.value)}>
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
                  <input type="datetime-local" className="form-control" value={formDeadline} onChange={(e) => setFormDeadline(e.target.value)} required />
                </div>
                
                <div className="questions-section mb-3">
                  <label className="form-label small fw-bold d-flex justify-content-between">
                    QUESTIONS
                    <button type="button" className="btn btn-link btn-sm p-0 text-decoration-none" onClick={addQuestion}>+ Add Question</button>
                  </label>
                  {formQuestions.map((q, i) => (
                    <div key={i} className="p-3 border rounded bg-light mb-2">
                       <input
                        type="text"
                        placeholder="Question text"
                        className="form-control mb-2"
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
                          <option value="text">Input Text</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="select">MCQ</option>
                        </select>
                        {q.question_type === 'select' && (
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Options, comma separated"
                            value={q.options}
                            onChange={(e) => updateQuestion(i, 'options', e.target.value)}
                          />
                        )}
                        <button type="button" className="btn btn-outline-danger" onClick={() => removeQuestion(i)} disabled={formQuestions.length === 1}><i className="bi bi-trash"></i></button>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="submit" className="btn btn-success w-100">
                  <i className="bi bi-plus-circle me-2"></i> Create Form & Notify
                </button>
              </form>
            </AdminCard>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <AdminCard header="Received Notifications">
              <div className="notification-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <p className="text-muted text-center py-4">No notifications received</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 mb-2 rounded border-start border-4 ${n.is_read ? "bg-light border-secondary" : "bg-white border-warning shadow-sm"}`}
                      style={{ cursor: "pointer" }}
                      onClick={() => markRead(n.id)}
                    >
                      <h6 className="mb-1">{n.title}</h6>
                      <p className="m-0 small text-muted">{n.message}</p>
                      <div className="mt-1"><span className="badge bg-secondary" style={{ fontSize: '10px' }}>{n.receiver_role}</span></div>
                    </div>
                  ))
                )}
              </div>
            </AdminCard>
          </div>

          <div className="col-md-6 mb-4">
            <AdminCard header={`Active Forms (${forms.length})`}>
              <div className="form-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {forms.length === 0 ? (
                  <p className="text-muted text-center py-4">No active forms found</p>
                ) : (
                  forms.map((form) => (
                    <div key={form.id} className="p-3 mb-2 rounded border bg-white shadow-sm">
                      <h6 className="text-primary mb-1">{form.title}</h6>
                      <p className="small text-muted mb-2">{form.description || 'No description provided'}</p>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted"><i className="bi bi-clock me-1"></i> {new Date(form.deadline).toLocaleDateString()}</small>
                        <a href={`http://localhost:3000/forms/${form.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                          View Link
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </AdminCard>
          </div>
        </div>
      </div>
      <ChatWidget />
    </AdminLayout>
  );
}
