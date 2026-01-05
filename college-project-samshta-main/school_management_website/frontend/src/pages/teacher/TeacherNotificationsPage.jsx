// src/pages/teacher/TeacherNotificationsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axiosInstance from "../../api/axiosInstance";
import { Link } from "react-router-dom";
import ChatWidget from "../../components/ChatWidget";
import TeacherLayout from "../../components/teacher/TeacherLayout";
import AdminCard from "../../components/admin/AdminCard";
import "../teacher/Dashboard.scss";

const TeacherNotificationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axiosInstance.get("/notifications/teacher");
        if (res.data) {
          const sortedNotifications = res.data.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
          setNotifications(sortedNotifications);
        }
      } catch (error) {
        setError(error.response?.data?.message || "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const isDeadlineCrossed = (deadline) =>
    deadline && new Date() > new Date(deadline);

  const renderMessage = (note) => {
    const regex = /(https?:\/\/[^/]+\/forms\/(\d+))/;
    const match = note.message.match(regex);
    const deadline = note.deadline;

    if (match && isDeadlineCrossed(deadline)) {
      return (
        <span className="text-danger fw-bold small">
          <i className="bi bi-x-circle me-1"></i>
          Deadline reached, cannot fill form
        </span>
      );
    } else if (match) {
      const formId = match[2];
      const path = `/forms/${formId}`;
      return (
        <div className="mt-2">
          {note.message.split(match[1])[0]}
          <Link to={path} className="btn btn-primary btn-sm rounded-pill px-3 py-1 ms-1" style={{ fontSize: '0.75rem' }}>
            Fill Form <i className="bi bi-arrow-right ms-1"></i>
          </Link>
          {note.message.split(match[1])[1]}
        </div>
      );
    } else {
      return <div className="text-muted mt-1">{note.message}</div>;
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <div className="spinner-grow text-primary" role="status"></div>
          <span className="mt-3 text-muted fw-bold">Syncing Communications...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-custom-danger d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-3 fs-3"></i>
          <div>{error}</div>
        </div>
      );
    }

    return (
      <div className="teacher-main-inner">
        <div className="section-header-pro">
          <h3>Communication Center</h3>
          <p>Recent announcements and official notifications from administration</p>
        </div>

        <div className="notifications-container-pro">
          {notifications.length === 0 ? (
            <AdminCard>
              <div className="empty-state-centered py-5">
                <div className="empty-icon-wrapper mb-3">
                  <i className="bi bi-bell-slash text-muted"></i>
                </div>
                <h5 className="fw-bold text-dark">No Notifications</h5>
                <p className="text-muted small">You're all caught up! There are no new notifications at this time.</p>
              </div>
            </AdminCard>
          ) : (
            <div className="row g-3">
              {notifications.map((note) => (
                <div key={note.id} className="col-12" onClick={() => !note.is_read && markAsRead(note.id)}>
                  <div className={`notification-card-pro ${!note.is_read ? 'unread' : ''}`}>
                    <div className="note-icon">
                      <i className={`bi ${!note.is_read ? 'bi-bell-fill text-primary' : 'bi-bell text-muted'}`}></i>
                    </div>
                    <div className="note-content">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h5 className="note-title">{note.title}</h5>
                        {!note.is_read && (
                          <span className="badge bg-primary rounded-pill px-2 py-1" style={{ fontSize: '0.65rem' }}>NEW</span>
                        )}
                      </div>
                      <div className="note-body">
                        {renderMessage(note)}
                      </div>
                      <div className="note-footer mt-2">
                        <span className="text-muted small">
                          <i className="bi bi-clock me-1"></i>
                          {new Date(note.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <TeacherLayout activeSidebarTab="notifications" customGreeting="Welcome, Teacher 👋">
      <div className="dashboard-wrapper">
        {renderContent()}
      </div>
      <ChatWidget />
    </TeacherLayout>
  );
};

export default TeacherNotificationsPage;
