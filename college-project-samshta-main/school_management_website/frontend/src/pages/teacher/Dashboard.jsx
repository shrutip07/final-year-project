import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

import "./Dashboard.scss"; 
import ChatWidget from "../../components/ChatWidget";
import TeacherLayout from "../../components/teacher/TeacherLayout";
import AdminCard from "../../components/admin/AdminCard";

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  const ProfileInfoBlock = ({ icon, label, value, colorClass = "" }) => (
    <div className={`profile-info-block ${colorClass}`}>
      <div className="info-icon">
        <i className={`bi ${icon}`}></i>
      </div>
      <div className="info-content">
        <span className="info-label">{label}</span>
        <span className="info-value">{value || "Not Set"}</span>
      </div>
    </div>
  );

  const renderDashboardContent = () => {
    const totalClasses = classes.length;
    const totalStudents = classes.reduce((sum, cls) => sum + (cls.student_count || 0), 0);

    return (
      <div className="teacher-main-inner">
        <div className="section-header-pro">
          <h3>Institutional Overview</h3>
          <p>Manage your academic profile and assigned classes</p>
        </div>

        {/* Teacher Metric Cards */}
        <div className="teacher-metrics-grid mb-4">
          <div className="teacher-metric-card classes">
            <div className="metric-icon"><i className="bi bi-journal-text"></i></div>
            <div className="metric-info">
              <span className="metric-label">Total Classes</span>
              <span className="metric-value">{totalClasses}</span>
            </div>
          </div>
          <div className="teacher-metric-card students">
            <div className="metric-icon"><i className="bi bi-people-fill"></i></div>
            <div className="metric-info">
              <span className="metric-label">Total Students</span>
              <span className="metric-value">{totalStudents}</span>
            </div>
          </div>
          <div className="teacher-metric-card year">
            <div className="metric-icon"><i className="bi bi-calendar-check-fill"></i></div>
            <div className="metric-info">
              <span className="metric-label">Academic Year</span>
              <span className="metric-value">{academicYear || "N/A"}</span>
            </div>
          </div>
          <div className="teacher-metric-card subject">
            <div className="metric-icon"><i className="bi bi-book-half"></i></div>
            <div className="metric-info">
              <span className="metric-label">Primary Subject</span>
              <span className="metric-value">{profile?.subject || "N/A"}</span>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-12">
            {profile ? (
              <AdminCard header="Teacher Profile">
                  <div className="profile-info-grid">
                    <div className="info-row">
                      <ProfileInfoBlock icon="bi-person" label="Full Name" value={profile.full_name} colorClass="teacher-accent-teal" />
                      <ProfileInfoBlock icon="bi-book" label="Primary Subject" value={profile.subject} colorClass="teacher-accent-indigo" />
                      <ProfileInfoBlock icon="bi-briefcase" label="Designation" value={profile.designation} colorClass="teacher-accent-amber" />
                    </div>
                    <div className="info-row">
                      <ProfileInfoBlock icon="bi-envelope" label="Email Address" value={profile.email} colorClass="teacher-accent-green" />
                      <ProfileInfoBlock icon="bi-telephone" label="Phone Number" value={profile.phone} colorClass="teacher-accent-teal" />
                      <ProfileInfoBlock icon="bi-mortarboard" label="Qualification" value={profile.qualification} colorClass="teacher-accent-indigo" />
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

          <div className="col-12">
            <AdminCard 
              header={
                <div className="d-flex justify-content-between align-items-center w-100">
                  <div className="d-flex align-items-center gap-3">
                    <h4 className="mb-0">My Classes</h4>
                    <div className="d-flex gap-2">
                      <span className="badge bg-soft-primary text-primary border-0 rounded-pill px-3">Classes: {totalClasses}</span>
                      <span className="badge bg-soft-info text-info border-0 rounded-pill px-3">Students: {totalStudents}</span>
                    </div>
                  </div>
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
                <div className="empty-state-centered py-5">
                  <div className="empty-icon-wrapper mb-3">
                    <i className="bi bi-journal-x text-muted"></i>
                  </div>
                  <h5 className="fw-bold text-dark">No Classes Assigned</h5>
                  <p className="text-muted small px-4">You haven't been assigned to any classes for the academic year {academicYear}.</p>
                </div>
              ) : (
                <div className="table-responsive professional-table" style={{ maxHeight: '280px' }}>
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
                  className="btn btn-outline-secondary btn-sm px-3"
                  type="button"
                  onClick={handleMarkYearDone}
                  style={{ fontSize: '0.75rem', fontWeight: '600' }}
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
  };

  return (
    <TeacherLayout
      activeSidebarTab="dashboard"
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
            {renderDashboardContent()}
          </div>
        )}
      </div>
      <ChatWidget />
    </TeacherLayout>
  );
}
