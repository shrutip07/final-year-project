import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Notifications from "../Notifications";
import ChatWidget from "../../components/ChatWidget";
import "./Dashboard.scss"; // reuse teacher styles

const TeacherNotificationsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("notifications");

  const sidebarItems = [
    { key: "dashboard", label: t("dashboard", "Dashboard"), icon: "bi-speedometer2" },
    { key: "profile", label: t("profile", "Profile"), icon: "bi-person" },
    { key: "students", label: t("students", "Students"), icon: "bi-people" },
    { key: "charts", label: t("charts", "Charts"), icon: "bi-bar-chart" },
    { key: "notifications", label: t("notifications", "Notifications"), icon: "bi-bell" }
  ];

  const handleSidebarClick = (key) => {
    setActiveTab(key);
    switch (key) {
      case "dashboard":
        navigate("/teacher");
        break;
      case "profile":
        navigate("/teacher/profile");
        break;
      case "students":
        navigate("/teacher/students");
        break;
      case "charts":
        navigate("/teacher/charts");
        break;
      case "notifications":
        navigate("/teacher/notifications");
        break;
      default:
        break;
    }
  };

  return (
    <div className="teacher-dashboard-container">
      {/* SIDEBAR */}
      <aside className="teacher-sidebar">
        <div className="teacher-sidebar-header">
          <div className="teacher-sidebar-icon">
            <i className="bi bi-person-workspace" />
          </div>
          <h3>{t("teacher_portal", "Teacher Portal")}</h3>
        </div>

        <div className="teacher-sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`teacher-nav-link ${
                activeTab === item.key ? "active" : ""
              }`}
              onClick={() => handleSidebarClick(item.key)}
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="teacher-sidebar-footer">
          <button
            type="button"
            className="teacher-nav-link logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            <i className="bi bi-box-arrow-left" />
            <span>{t("logout", "Logout")}</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="teacher-main-content">
        <div className="teacher-main-inner">
          {/* Page header for hierarchy */}
          <div className="page-header">
            <h2>{t("teacher_notifications_title", "Teacher Notifications")}</h2>
            <div className="page-subtitle">
              {t(
                "teacher_notifications_subtitle",
                "See all updates, announcements and shared forms in one place."
              )}
            </div>
          </div>

          {/* Center notifications list a bit, like a feed */}
          <div className="teacher-notifications-list">
            <Notifications/>
          </div>
        </div>

        <ChatWidget />
      </main>
    </div>
  );
};

export default TeacherNotificationsPage;
