import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PrincipalLayout from "../../components/principal/PrincipalLayout";
import ChatWidget from "../../components/ChatWidget";
import "./Profile.scss";

export default function PrincipalProfile({ isSubComponent = false }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    axios
      .get("http://localhost:5000/api/principal/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data && res.data.user_id) {
          setProfile(res.data);
        } else {
          setError(t("profile_not_found"));
        }
      })
      .catch(() => {
        setError(t("failed_load_profile"));
      })
      .finally(() => setLoading(false));
  }, [navigate, t]);

  const handleEdit = () => {
    setEditForm({ ...profile });
    setIsEditing(true);
  };

  const handleChange = (e) => {
    const value =
      e.target.type === "date" ? e.target.value || null : e.target.value;
    setEditForm({ ...editForm, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/principal/${profile.principal_id}`,
        editForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data);
      setIsEditing(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || t("failed_update"));
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : "P";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t("loading_profile")}...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger m-4">{error}</div>;
  }

  if (!profile) {
    return <div className="m-4">{t("no_profile_found")}</div>;
  }

  const content = (
    <div className={`principal-profile-page ${isSubComponent ? "sub-component" : ""}`}>
      {isEditing ? (
        <div className="profile-card">
          <div className="profile-card-header">
            <h3>{t("edit_profile")}</h3>
          </div>
          <div className="profile-card-body">
            <form onSubmit={handleSubmit}>
              <div className="edit-grid">
                <div className="form-group mb-3">
                  <label className="form-label">{t("full_name")}</label>
                  <input type="text" name="full_name" value={editForm.full_name || ""} onChange={handleChange} className="form-control" />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">{t("phone")}</label>
                  <input type="text" name="phone" value={editForm.phone || ""} onChange={handleChange} className="form-control" />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">{t("email")}</label>
                  <input type="email" name="email" value={editForm.email || ""} onChange={handleChange} className="form-control" />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">{t("qualification")}</label>
                  <input type="text" name="qualification" value={editForm.qualification || ""} onChange={handleChange} className="form-control" />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">{t("joining_date")}</label>
                  <input type="date" name="joining_date" value={editForm.joining_date ? editForm.joining_date.substring(0, 10) : ""} onChange={handleChange} className="form-control" />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">{t("tenure_start_date")}</label>
                  <input type="date" name="tenure_start_date" value={editForm.tenure_start_date ? editForm.tenure_start_date.substring(0, 10) : ""} onChange={handleChange} className="form-control" />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">{t("tenure_end_date")}</label>
                  <input type="date" name="tenure_end_date" value={editForm.tenure_end_date ? editForm.tenure_end_date.substring(0, 10) : ""} onChange={handleChange} className="form-control" />
                </div>
                <div className="form-group mb-3">
                  <label className="form-label">{t("status")}</label>
                  <select name="status" value={editForm.status || ""} onChange={handleChange} className="form-select">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="form-actions mt-4">
                <button type="submit" className="btn btn-primary px-4">{t("save_changes")}</button>
                <button type="button" className="btn btn-outline-secondary ms-2 px-4" onClick={() => setIsEditing(false)}>{t("cancel")}</button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <>
          <div className="profile-header-section">
            <div className="header-main">
              <div className="profile-avatar">
                {getInitial(profile.full_name)}
              </div>
              <div className="profile-title-block">
                <div className="name-badge-row">
                  <h2>{profile.full_name || "-"}</h2>
                  <span className="role-badge">PRINCIPAL</span>
                </div>
                <div className="header-meta-info">
                  <span className="meta-item"><i className="bi bi-envelope"></i> {profile.email || "-"}</span>
                  <span className="meta-item"><i className="bi bi-telephone"></i> {profile.phone || "-"}</span>
                  <span className="meta-item"><i className="bi bi-patch-check"></i> {profile.qualification || "-"}</span>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button className="btn btn-primary edit-profile-btn" onClick={handleEdit}>
                <i className="bi bi-pencil-square me-2"></i>
                {t("edit_profile")}
              </button>
            </div>
          </div>

          <div className="profile-details-grid">
            <div className="info-group-card">
              <div className="card-header">
                <i className="bi bi-person-circle"></i>
                <h4>Personal Details</h4>
              </div>
              <div className="card-body">
                <div className="detail-row">
                  <span className="label">Full Name</span>
                  <span className="value">{profile.full_name || "-"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Email</span>
                  <span className="value">{profile.email || "-"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone</span>
                  <span className="value">{profile.phone || "-"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Qualification</span>
                  <span className="value">{profile.qualification || "-"}</span>
                </div>
              </div>
            </div>

            <div className="info-group-card">
              <div className="card-header">
                <i className="bi bi-calendar3"></i>
                <h4>Tenure Information</h4>
              </div>
              <div className="card-body">
                <div className="detail-row">
                  <span className="label">Joining Date</span>
                  <span className="value">{formatDate(profile.joining_date)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Tenure Start Date</span>
                  <span className="value">{formatDate(profile.tenure_start_date)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Tenure End Date</span>
                  <span className="value">{formatDate(profile.tenure_end_date)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Status</span>
                  <span className={`status-pill ${profile.status === 'Active' ? 'active' : 'inactive'}`}>
                    {profile.status || "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="info-group-card system-info">
              <div className="card-header">
                <i className="bi bi-cpu"></i>
                <h4>System Info</h4>
              </div>
              <div className="card-body">
                <div className="detail-row">
                  <span className="label">Principal ID</span>
                  <span className="value">{profile.principal_id ?? "-"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">User ID</span>
                  <span className="value">{profile.user_id ?? "-"}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Updated At</span>
                  <span className="value">{formatDate(profile.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  if (isSubComponent) {
    return content;
  }

  return (
    <PrincipalLayout activeSidebarTab="profile">
      {content}
      <ChatWidget />
    </PrincipalLayout>
  );
}

