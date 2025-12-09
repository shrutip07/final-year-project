import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

import "./Dashboard.scss"; // ✅ use teacher SCSS (colors will match admin)
import ChatWidget from "../../components/ChatWidget";
import TeacherNotificationsPage from "./TeacherNotificationsPage";
import Charts from "./Charts";

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [sidebarTab, setSidebarTab] = useState("dashboard");
  const [profile, setProfile] = useState(null);

  const [allYears, setAllYears] = useState([]);
  const [academicYear, setAcademicYear] = useState("");
  const [classes, setClasses] = useState([]);

  const [loading] = useState(false);
  const [error, setError] = useState("");

  const sidebarItems = [
    { key: "dashboard", label: t("dashboard", "Dashboard"), icon: "bi-speedometer2" },
    { key: "profile", label: t("profile", "Profile"), icon: "bi-person" },
    { key: "students", label: t("students", "Students"), icon: "bi-people" },
    { key: "charts", label: t("charts", "Charts"), icon: "bi-bar-chart" },
    { key: "notifications", label: t("notifications", "Notifications"), icon: "bi-bell" }
  ];

  // Load teacher profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:5000/api/teacher/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => setProfile(res.data))
      .catch((err) => {
        if (err.response?.status === 404) {
          navigate("/teacher/onboarding");
        } else {
          setError(t("failed_load_profile", "Failed to load profile"));
        }
      });
  }, [navigate, t]);

  // Load academic years
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("http://localhost:5000/api/teacher/academic-years", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const yearsArray = Array.from(res.data || []).sort().reverse();
        setAllYears(yearsArray);
        if (yearsArray.length && !academicYear) setAcademicYear(yearsArray[0]);
      })
      .catch(() => {});
  }, [academicYear]);

  // Load classes for selected year
  useEffect(() => {
    if (!academicYear) return;
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(
        `http://localhost:5000/api/teacher/classes?academic_year=${encodeURIComponent(
          academicYear
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => setClasses(res.data || []))
      .catch(() => setClasses([]));
  }, [academicYear, navigate]);

  async function handleMarkYearDone() {
    if (!academicYear) return;
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/api/teacher/year-done",
        { academic_year: academicYear },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Marked this academic year as completed.");
    } catch {
      alert("Failed to mark this year as done.");
    }
  }

  const renderDashboardContent = () => (
    <div className="teacher-main-inner">
      <div className="page-header">
        <h2>{t("teacher_dashboard", "Teacher Dashboard")}</h2>
      </div>

      {/* Profile card */}
      {profile && (
        <div className="teacher-profile-card">
          <div className="card-header">
            <h3>{t("teacher_profile", "Teacher Profile")}</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <h4>
                  {t("welcome", "Welcome")}, {profile.full_name}
                </h4>
                <p>
                  <strong>{t("email", "Email")}:</strong> {profile.email}
                </p>
                <p>
                  <strong>{t("phone", "Phone")}:</strong> {profile.phone}
                </p>
                <p>
                  <strong>{t("subject", "Subject")}:</strong> {profile.subject}
                </p>
                <p>
                  <strong>{t("designation", "Designation")}:</strong>{" "}
                  {profile.designation}
                </p>
                <p>
                  <strong>{t("qualification", "Qualification")}:</strong>{" "}
                  {profile.qualification}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* My classes card */}
      <div className="teacher-students-card">
        <div className="card-header">
          <h3>{t("my_classes", "My Classes")}</h3>
          <div className="header-controls">
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="form-control"
            >
              {allYears.length === 0 && (
                <option value="">{t("loading", "Loading...")}</option>
              )}
              {allYears.map((year) => (
                <option value={year} key={year}>
                  {year}
                </option>
              ))}
            </select>
            <button
              className="btn btn-primary-custom"
              type="button"
              onClick={handleMarkYearDone}
            >
              {t("mark_year_done", "Done with this year")}
            </button>
          </div>
        </div>
        <div className="card-body">
          {classes.length === 0 ? (
            <div className="text-muted">
              {t("no_classes_assigned", "No classes assigned for this year.")}
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>{t("academic_year", "Academic Year")}</th>
                    <th>{t("standard", "Standard")}</th>
                    <th>{t("division", "Division")}</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map((cls) => (
                    <tr
                      key={`${cls.academic_year}-${cls.standard}-${cls.division}`}
                    >
                      <td>{cls.academic_year}</td>
                      <td>{cls.standard}</td>
                      <td>{cls.division}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMainContent = () => {
    switch (sidebarTab) {
      case "dashboard":
        return renderDashboardContent();

      case "profile":
        navigate("/teacher/profile");
        return null;

      case "students":
        navigate("/teacher/students");
        return null;

      case "charts":
        return (
          <div className="teacher-main-inner">
            <div className="page-header">
              <h2>{t("charts", "Charts")}</h2>
            </div>
            <Charts />
          </div>
        );

      case "notifications":
        return (
          <div className="teacher-main-inner">
            <TeacherNotificationsPage />
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) return <div className="loading-state">{t("loading", "Loading...")}</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="teacher-dashboard-container">
      {/* Sidebar (teacher structure, admin colors) */}
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
              className={`teacher-nav-link ${
                sidebarTab === item.key ? "active" : ""
              }`}
              onClick={() => setSidebarTab(item.key)}
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="teacher-sidebar-footer">
          <button
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

      {/* Main content */}
      <main className="teacher-main-content">
        {renderMainContent()}
        <ChatWidget />
      </main>
    </div>
  );
}
