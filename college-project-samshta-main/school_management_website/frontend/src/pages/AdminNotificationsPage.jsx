import React, { useState, useEffect } from "react";
import axios from "axios";

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [receiverRole, setReceiverRole] = useState("principal");

  const API = "http://localhost:5000/api/notifications";

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line
  }, []);

  const loadNotifications = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get(API, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch {
      setNotifications([]);
    }
  };

  const sendNotification = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    await axios.post(
      API,
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

  const markRead = async (id) => {
    const token = localStorage.getItem("token");
    await axios.put(
      `${API}/${id}/read`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    loadNotifications();
  };

  return (
    <div className="container mt-4">
      <h2>Admin Notification Panel</h2>
      <small className="text-muted">Send & Manage Notifications</small>

      {/* Send Section */}
      <form onSubmit={sendNotification} className="card p-3 mt-3 shadow-sm">
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

      {/* Received Section */}
      <div className="card p-3 mt-4 shadow-sm">
        <h5>Received Notifications</h5>
        {notifications.length === 0 ? (
          <p className="text-muted">No notifications received</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-2 mt-2 rounded ${
                n.is_read ? "bg-light" : "bg-warning"
              }`}
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
    </div>
  );
}
