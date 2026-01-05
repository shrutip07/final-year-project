import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

import "./Dashboard.scss"; 
import ChatWidget from "../../components/ChatWidget";
import TeacherNotificationsPage from "./TeacherNotificationsPage";
import Charts from "./Charts";
import TeacherLayout from "../../components/teacher/TeacherLayout";
import AdminCard from "../../components/admin/AdminCard";

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [sidebarTab, setSidebarTab] = useState("dashboard");
  const [profile, setProfile] = useState(null);

  const [allYears, setAllYears] = useState([]);
  const [academicYear, setAcademicYear] = useState("");
  const [classes, setClasses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load teacher profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    axios
      .get("http://localhost:5000/api/teacher/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setProfile(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
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
      <div className="section-header-pro">
        <h3>Institutional Overview</h3>
        <p>Manage your academic profile and assigned classes</p>
      </div>

      <div className="row g-4">
        {/* Profile card */}
        <div className="col-lg-6">
          {profile ? (
            <AdminCard header="Teacher Profile">
              <div className="profile-details-grid">
                <div className="detail-item">
                  <span className="label">Full Name</span>
                  <span className="value">{profile.full_name}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Email Address</span>
                  <span className="value">{profile.email}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Phone Number</span>
                  <span className="value">{profile.phone}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Primary Subject</span>
                  <span className="value">{profile.subject}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Designation</span>
                  <span className="value">{profile.designation}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Qualification</span>
                  <span className="value">{profile.qualification}</span>
                </div>
              </div>
            </AdminCard>
          ) : (
            <AdminCard header="Teacher Profile">
              <div className="text-center py-4">
                <div className="spinner-border text-primary spinner-border-sm" role="status"></div>
                <p className="mt-2 text-muted small">Loading profile...</p>
              </div>
            </AdminCard>
          )}
        </div>

        {/* My classes card */}
        <div className="col-lg-6">
          <AdminCard 
            header={
              <div className="d-flex justify-content-between align-items-center w-100">
                <h4 className="mb-0">My Classes</h4>
                <div className="d-flex gap-2">
                  <select
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="form-select form-select-sm"
                    style={{ width: '130px' }}
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
                </div>
              </div>
            }
          >
            {classes.length === 0 ? (
              <div className="empty-state-container text-center py-5">
                <i className="bi bi-journal-x text-muted fs-1"></i>
                <p className="text-muted mt-2">No classes assigned for this year.</p>
              </div>
            ) : (
              <div className="table-responsive professional-table">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Academic Year</th>
                      <th>Standard</th>
                      <th>Division</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classes.map((cls, idx) => (
                      <tr key={idx}>
                        <td><span className="erp-badge badge-year">{cls.academic_year}</span></td>
                        <td><span className="fw-bold">{cls.standard}</span></td>
                        <td><span className="fw-bold text-primary">{cls.division}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <div className="mt-4 pt-3 border-top d-flex justify-content-end">
              <button
                className="btn btn-primary btn-sm px-4"
                type="button"
                onClick={handleMarkYearDone}
              >
                <i className="bi bi-check-circle me-2"></i>
                Mark Year as Completed
              </button>
            </div>
          </AdminCard>
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
             <div className="section-header-pro">
              <h3>Academic Charts</h3>
              <p>Visual representation of institutional performance</p>
            </div>
            <AdminCard>
              <Charts />
            </AdminCard>
          </div>
        );

      case "notifications":
        return (
          <div className="teacher-main-inner">
             <div className="section-header-pro">
              <h3>Communication Center</h3>
              <p>Recent announcements and official notifications</p>
            </div>
            <AdminCard>
              <TeacherNotificationsPage />
            </AdminCard>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <TeacherLayout
      activeSidebarTab={sidebarTab}
      onSidebarTabChange={setSidebarTab}
      customGreeting="Welcome, Teacher 👋"
    >
      <div className="dashboard-wrapper">
        {loading ? (
          <div className="d-flex flex-column align-items-center justify-content-center py-5">
            <div className="spinner-grow text-primary" role="status"></div>
            <span className="mt-3 text-muted fw-bold">Syncing Teacher Dashboard...</span>
          </div>
        ) : error ? (
          <div className="alert alert-custom-danger d-flex align-items-center" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-3 fs-3"></i>
            <div>
              <div className="fw-bold">Configuration Error</div>
              {error}
            </div>
          </div>
        ) : (
          <div className="dashboard-main-view">
            {renderMainContent()}
          </div>
        )}
      </div>
      <ChatWidget />
    </TeacherLayout>
  );
}
