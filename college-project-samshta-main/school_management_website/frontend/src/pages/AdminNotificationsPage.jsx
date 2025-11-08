

import React, { useState, useEffect } from "react";
import axios from "axios";

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
    // eslint-disable-next-line
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

    // Prepare questions array with options correctly formatted
    const questionsPayload = formQuestions.map((q) => ({
      question_text: q.question_text,
      question_type: q.question_type,
      options: q.options ? q.options : null,
    }));

    try {
      // Create form
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

      const formLink = `http://localhost:3000/forms/${formId}`; // Adjust frontend URL

      // Send notification with form link in message
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

      // Reset form input states
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

  // Manage question list inputs
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

  // Mark notification read (same as before)
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
    <div className="container mt-4">

      <h2>Admin Notification Panel + Form Creator</h2>
      <small className="text-muted">Send Notifications or Create & Send Forms</small>

      {/* Notification sending form */}
      <form onSubmit={sendNotification} className="card p-3 mt-3 shadow-sm">
        <h5>Send Notification</h5>
        <label>Send To:</label>
        <select
          className="form-select"
          value={receiverRole}
          onChange={(e) => setReceiverRole(e.target.value)}
        >
          <option value="principal">Principal</option>
          <option value="teacher">Teacher</option>
        </select>

        <label className="mt-2">Title:</label>
        <input
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <label className="mt-2">Message:</label>
        <textarea
          className="form-control"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <button className="btn btn-primary mt-3">Send ✅</button>
      </form>

      {/* Form creation section */}
      <form onSubmit={createFormAndNotify} className="card p-3 mt-3 shadow-sm">
        <h5>Create and Send Form</h5>
        <label>Send To:</label>
        <select
          className="form-select"
          value={receiverRole}
          onChange={(e) => setReceiverRole(e.target.value)}
        >
          <option value="principal">Principal</option>
          <option value="teacher">Teacher</option>
        </select>

        <label className="mt-2">Form Title:</label>
        <input
          type="text"
          className="form-control"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          required
        />

        <label className="mt-2">Description (optional):</label>
        <textarea
          className="form-control"
          value={formDesc}
          onChange={(e) => setFormDesc(e.target.value)}
        />

        <label className="mt-2">Deadline:</label>
        <input
          type="datetime-local"
          className="form-control"
          value={formDeadline}
          onChange={(e) => setFormDeadline(e.target.value)}
          required
        />

        <div className="mt-3">
          <h6>Questions:</h6>
          {formQuestions.map((q, i) => (
            <div key={i} className="mb-2 border p-2 rounded">
              <input
                type="text"
                placeholder="Question text"
                className="form-control mb-1"
                value={q.question_text}
                onChange={(e) => updateQuestion(i, 'question_text', e.target.value)}
                required
              />
              <select
                className="form-select mb-1"
                value={q.question_type}
                onChange={(e) => updateQuestion(i, 'question_type', e.target.value)}
              >
                <option value="text">Text</option>
                <option value="number">Number</option>
                <option value="date">Date</option>
                <option value="select">Multiple Choice</option>
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
              <button type="button" className="btn btn-danger btn-sm mt-1" onClick={() => removeQuestion(i)}>Remove</button>
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={addQuestion}>Add Question</button>
        </div>

        <button type="submit" className="btn btn-success mt-3">Create Form & Send Notification ✅</button>
      </form>

      {/* Received Notifications */}
      <div className="card p-3 mt-4 shadow-sm">
        <h5>Received Notifications</h5>
        {notifications.length === 0 ? (
          <p className="text-muted">No notifications received</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-2 mt-2 rounded ${n.is_read ? "bg-light" : "bg-warning"}`}
              style={{ cursor: "pointer" }}
              onClick={() => markRead(n.id)}
            >
              <strong>{n.title}</strong>
              <p className="m-0">{n.message}</p>
              <small>To: {n.receiver_role}</small>
            </div>
          ))
        )}
      </div>

      {/* Active Forms */}
      <div className="card p-3 mt-4 shadow-sm">
        <h5>Active Forms ({forms.length})</h5>
        {forms.length === 0 ? (
          <p className="text-muted">No active forms</p>
        ) : (
          forms.map((form) => (
            <div key={form.id} className="p-2 mt-2 rounded border">
              <strong>{form.title}</strong>
              <p>{form.description}</p>
              <small>Deadline: {new Date(form.deadline).toLocaleString()}</small>
              <br />
              <a href={`http://localhost:3000/forms/${form.id}`} target="_blank" rel="noopener noreferrer">
                Fill Form Link
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
