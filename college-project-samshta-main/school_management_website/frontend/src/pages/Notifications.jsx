

import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Notifications = ({ title }) => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axiosInstance.get("/notifications", {
          params: { role: 'principal' }
        });
        if (res.data) {
          const sortedNotifications = res.data.sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
          );
          setNotifications(sortedNotifications);
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || "Failed to load notifications";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const isExpired = (deadline) => {
    if (!deadline) return false;
    return new Date() > new Date(deadline);
  };
const isDeadlineCrossed = deadline => deadline && new Date() > new Date(deadline);
  const renderMessage = (note) => {
  // Find form link (adapt this for your backend notification format)
  const regex = /(http:\/\/localhost:3000\/forms\/(\d+))/;
  const match = note.message.match(regex);
  const deadline = note.deadline; // Make sure notification data includes this

  if (match && isDeadlineCrossed(deadline)) {
    // Deadline passed: show message in red, no link
    return (
      <span style={{ color: 'red', fontWeight: 600 }}>
        Deadline reached, cannot fill form
      </span>
    );
  } else if (match) {
    // Not expired: show link
    const path = match[1].replace("http://localhost:3000", "");
    return (
      <>
        {note.message.split(match[1])[0]}
        <Link to={path}>{match[1]}</Link>
        {note.message.split(match[1])[1]}
      </>
    );
  } else {
    return <span>{note.message}</span>;
  }
};
    

  if (loading) {
    return <div className="d-flex justify-content-center p-4">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }

  if (error) {
    return <div className="alert alert-danger m-4">
      <i className="bi bi-exclamation-triangle-fill me-2"></i>
      {error}
    </div>;
  }

  return (
    <div className="container p-4">
      <h2 className="mb-4">{title}</h2>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <div className="alert alert-info">
            <i className="bi bi-info-circle me-2"></i>
            {t("no_notifications")}
          </div>
        ) : (
          notifications.map(note => (
            <div
              key={note.id}
              className={`card mb-3 shadow-sm ${!note.is_read ? "border-primary" : ""}`}
              style={{ cursor: "pointer" }}
              onClick={() => markAsRead(note.id)}
            >
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">{note.title}</h5>
                  {!note.is_read && <span className="badge bg-primary">New</span>}
                </div>
                <p className="card-text mt-2 mb-1">{renderMessage(note)}</p>
                <small className="text-muted">
                  <i className="bi bi-clock me-1"></i>
                  {new Date(note.created_at).toLocaleString()}
                </small>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
