import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import ChatWidget from "../../components/ChatWidget";
import TeacherLayout from "../../components/teacher/TeacherLayout";
import AdminCard from "../../components/admin/AdminCard";
import "../teacher/Dashboard.scss";

export default function TeacherProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);

  // fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/teacher/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data);
        setEditedProfile(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || t("failed_load_profile", "Failed to load profile"));
        setLoading(false);
      }
    };
    fetchProfile();
  }, [t]);

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
  };

  const handleChange = (e) => {
    setEditedProfile({
      ...editedProfile,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/teacher/profile`,
        editedProfile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(editedProfile);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || t("failed_update", "Failed to update profile"));
    }
  };

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

  const renderContent = () => {
    if (loading) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <div className="spinner-grow text-primary" role="status"></div>
          <span className="mt-3 text-muted fw-bold">Loading Profile...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-custom-danger d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-3 fs-3"></i>
          <div>
            <div className="fw-bold">Error</div>
            {error}
          </div>
        </div>
      );
    }

    if (!profile) return null;

    return (
      <div className="teacher-main-inner">
        <div className="section-header-pro">
          <h3>Teacher Profile</h3>
          <p>Manage and update your personal and professional information</p>
        </div>

        <AdminCard 
          header={
            <div className="d-flex justify-content-between align-items-center w-100">
              <h4 className="mb-0">{t("profile_details", "Profile Details")}</h4>
              {!isEditing && (
                <button 
                  className="btn btn-primary btn-sm px-3 rounded-pill" 
                  onClick={handleEdit} 
                  type="button"
                  style={{ fontSize: '0.8rem', fontWeight: '600' }}
                >
                  <i className="bi bi-pencil-square me-2"></i>
                  {t("edit_profile", "Edit Profile")}
                </button>
              )}
            </div>
          }
        >
          {isEditing ? (
            <form onSubmit={handleSubmit} className="professional-form">
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold small text-muted text-uppercase mb-2">{t("full_name", "Full Name")}</label>
                    <input
                      type="text"
                      className="form-control"
                      name="full_name"
                      value={editedProfile.full_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold small text-muted text-uppercase mb-2">{t("email", "Email Address")}</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={editedProfile.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold small text-muted text-uppercase mb-2">{t("phone", "Phone Number")}</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={editedProfile.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold small text-muted text-uppercase mb-2">{t("designation", "Designation")}</label>
                    <input
                      type="text"
                      className="form-control"
                      name="designation"
                      value={editedProfile.designation}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold small text-muted text-uppercase mb-2">{t("subject", "Primary Subject")}</label>
                    <input
                      type="text"
                      className="form-control"
                      name="subject"
                      value={editedProfile.subject}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group mb-3">
                    <label className="form-label fw-bold small text-muted text-uppercase mb-2">{t("qualification", "Qualification")}</label>
                    <input
                      type="text"
                      className="form-control"
                      name="qualification"
                      value={editedProfile.qualification}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-top d-flex gap-2 justify-content-end">
                <button type="submit" className="btn btn-primary px-4 rounded-pill fw-bold">
                  {t("save_changes", "Save Changes")}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary px-4 rounded-pill fw-bold"
                  onClick={handleCancel}
                >
                  {t("cancel", "Cancel")}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info-grid">
              <div className="info-row">
                <ProfileInfoBlock icon="bi-person" label="Full Name" value={profile.full_name} colorClass="profile-primary" />
                <ProfileInfoBlock icon="bi-book" label="Primary Subject" value={profile.subject} colorClass="profile-info" />
                <ProfileInfoBlock icon="bi-briefcase" label="Designation" value={profile.designation} colorClass="profile-warning" />
              </div>
              <div className="info-row">
                <ProfileInfoBlock icon="bi-envelope" label="Email Address" value={profile.email} colorClass="profile-danger" />
                <ProfileInfoBlock icon="bi-telephone" label="Phone Number" value={profile.phone} colorClass="profile-success" />
                <ProfileInfoBlock icon="bi-mortarboard" label="Qualification" value={profile.qualification} colorClass="profile-secondary" />
              </div>
              <div className="info-row mt-4 pt-4 border-top">
                <div className="d-flex gap-4">
                  <div>
                    <span className="text-muted small text-uppercase d-block mb-1 fw-bold">Joining Date</span>
                    <span className="fw-bold">{new Date(profile.joining_date).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-muted small text-uppercase d-block mb-1 fw-bold">Staff ID</span>
                    <span className="fw-bold text-primary">{profile.staff_id}</span>
                  </div>
                  <div>
                    <span className="text-muted small text-uppercase d-block mb-1 fw-bold">Last Updated</span>
                    <span className="fw-bold">{new Date(profile.updatedat).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </AdminCard>
      </div>
    );
  };

  return (
    <TeacherLayout activeSidebarTab="profile" customGreeting="Welcome, Teacher 👋">
      <div className="dashboard-wrapper">
        {renderContent()}
      </div>
      <ChatWidget />
    </TeacherLayout>
  );
}
