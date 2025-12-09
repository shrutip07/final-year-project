import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import ChatWidget from "../../components/ChatWidget";
import "../teacher/Dashboard.scss";

export default function TeacherProfile() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("profile"); // sidebar highlight

  const sidebarItems = [
    { key: "dashboard", label: t("dashboard", "Dashboard"), icon: "bi-speedometer2" },
    { key: "profile", label: t("profile", "Profile"), icon: "bi-person" },
    { key: "students", label: t("students", "Students"), icon: "bi-people" },
    { key: "charts", label: t("charts", "Charts"), icon: "bi-bar-chart" },
    { key: "notifications", label: t("notifications", "Notifications"), icon: "bi-bell" }
  ];

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

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="loading-state">
          {t("loading_profile", "Loading profile")}...
        </div>
      );
    }

    if (error) {
      return <div className="error-state">{error}</div>;
    }

    if (!profile) return null;

    return (
      <>
        <div className="teacher-profile-card">
          <div className="card-header">
            <h3>{t("teacher_profile", "Teacher Profile")}</h3>
            {!isEditing && (
              <button className="edit-profile-btn" onClick={handleEdit} type="button">
                {t("edit_profile", "Edit Profile")}
              </button>
            )}
          </div>

          <div className="card-body">
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">{t("full_name", "Full Name")}</label>
                      <input
                        type="text"
                        className="form-control"
                        name="full_name"
                        value={editedProfile.full_name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">{t("email", "Email")}</label>
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={editedProfile.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">{t("phone", "Phone")}</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phone"
                        value={editedProfile.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">{t("qualification", "Qualification")}</label>
                      <input
                        type="text"
                        className="form-control"
                        name="qualification"
                        value={editedProfile.qualification}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">{t("designation", "Designation")}</label>
                      <input
                        type="text"
                        className="form-control"
                        name="designation"
                        value={editedProfile.designation}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">{t("subject", "Subject")}</label>
                      <input
                        type="text"
                        className="form-control"
                        name="subject"
                        value={editedProfile.subject}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">{t("joining_date", "Joining Date")}</label>
                      <input
                        type="date"
                        className="form-control"
                        name="joining_date"
                        value={editedProfile.joining_date?.split("T")[0]}
                        onChange={handleChange}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="save-btn">
                    {t("save_changes", "Save Changes")}
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleCancel}
                  >
                    {t("cancel", "Cancel")}
                  </button>
                </div>
              </form>
            ) : (
              <div className="row">
                <div className="col-md-6">
                  <p><strong>{t("staff_id", "Staff ID")}</strong> {profile.staff_id}</p>
                  <p><strong>{t("full_name", "Full Name")}</strong> {profile.full_name}</p>
                  <p><strong>{t("email", "Email")}</strong> {profile.email}</p>
                  <p><strong>{t("phone", "Phone")}</strong> {profile.phone}</p>
                  <p><strong>{t("qualification", "Qualification")}</strong> {profile.qualification}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>{t("designation", "Designation")}</strong> {profile.designation}</p>
                  <p><strong>{t("subject", "Subject")}</strong> {profile.subject}</p>
                  <p>
                    <strong>{t("joining_date", "Joining Date")}</strong>{" "}
                    {new Date(profile.joining_date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>{t("last_updated", "Last Updated")}</strong>{" "}
                    {new Date(profile.updatedat).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="teacher-dashboard-container">
      {/* Sidebar – same structure + colors as teacher dashboard */}
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
                activeTab === item.key ? "active" : ""
              }`}
              onClick={() => handleSidebarClick(item.key)}
              type="button"
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="teacher-sidebar-footer">
          <button
            className="teacher-nav-link logout-btn"
            type="button"
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

      {/* Main content – reuses same blue/white theme */}
      <main className="teacher-main-content">
        <div className="teacher-main-inner">
          {renderMainContent()}
        </div>
        <ChatWidget />
      </main>
    </div>
  );
}
