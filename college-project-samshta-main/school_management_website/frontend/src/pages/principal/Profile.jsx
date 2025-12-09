import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import ChatWidget from "../../components/ChatWidget";
import PageHeader from "../../components/admin/PageHeader";
import AdminCard from "../../components/admin/AdminCard";

export default function PrincipalProfile() {
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

  // ====== LOADING / ERROR STATES ======
  if (loading) {
    return (
      <>
        <div className="page-inner">
          
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">
                {t("loading_profile")}...
              </span>
            </div>
          </div>
        </div>
        <ChatWidget />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="page-inner">
          <div className="alert alert-danger mt-3">{error}</div>
        </div>
        <ChatWidget />
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <div className="page-inner">
          <div>{t("no_profile_found")}</div>
        </div>
        <ChatWidget />
      </>
    );
  }

  // ====== EDIT MODE UI ======
  if (isEditing) {
    return (
      <>
        <div className="page-inner">
         
          <AdminCard
            header={t("edit_profile")}
            className="section-card principal-profile-card"
          >
            <form onSubmit={handleSubmit}>
              <div className="principal-edit-grid">
                {/* Only expose editable fields you actually want to allow */}
                <div className="mb-3">
                  <label className="form-label">{t("full_name")}</label>
                  <input
                    type="text"
                    name="full_name"
                    value={editForm.full_name || ""}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">{t("phone")}</label>
                  <input
                    type="text"
                    name="phone"
                    value={editForm.phone || ""}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">{t("email")}</label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email || ""}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">{t("qualification")}</label>
                  <input
                    type="text"
                    name="qualification"
                    value={editForm.qualification || ""}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">{t("joining_date")}</label>
                  <input
                    type="date"
                    name="joining_date"
                    value={
                      editForm.joining_date
                        ? editForm.joining_date.substring(0, 10)
                        : ""
                    }
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    {t("tenure_start_date")}
                  </label>
                  <input
                    type="date"
                    name="tenure_start_date"
                    value={
                      editForm.tenure_start_date
                        ? editForm.tenure_start_date.substring(0, 10)
                        : ""
                    }
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    {t("tenure_end_date")}
                  </label>
                  <input
                    type="date"
                    name="tenure_end_date"
                    value={
                      editForm.tenure_end_date
                        ? editForm.tenure_end_date.substring(0, 10)
                        : ""
                    }
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">{t("status")}</label>
                  <input
                    type="text"
                    name="status"
                    value={editForm.status || ""}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-actions mt-3">
                <button type="submit" className="btn btn-primary">
                  {t("save_changes")}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary ms-2"
                  onClick={() => setIsEditing(false)}
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          </AdminCard>
        </div>
        <ChatWidget />
      </>
    );
  }

  // ====== VIEW MODE UI ======
  return (
    <>
      <div className="page-inner">

        <AdminCard
          header={t("principal_profile")}
          className="section-card principal-profile-card"
        >
          <div className="principal-profile-actions">
            <button className="btn btn-primary" onClick={handleEdit}>
              {t("edit_profile")}
            </button>
          </div>

          {/* Summary strip at top */}
          <div className="principal-summary-row">
            <div className="principal-summary-name">
              {profile.full_name || "-"}
            </div>
            <div className="principal-summary-meta">
              {profile.email && (
                <span>
                  <i className="bi bi-envelope me-1" />
                  {profile.email}
                </span>
              )}
              {profile.phone && (
                <span>
                  <i className="bi bi-telephone me-1" />
                  {profile.phone}
                </span>
              )}
              {profile.qualification && (
                <span>
                  <i className="bi bi-patch-check me-1" />
                  {profile.qualification}
                </span>
              )}
            </div>
          </div>

          {/* Detail grid using same admin styles */}
          <div className="details-grid details-grid--comfortable mt-3">
            <div className="details-row">
              <div className="details-key">{t("principal_id")}</div>
              <div className="details-value">
                {profile.principal_id ?? "-"}
              </div>
            </div>
            <div className="details-row">
              <div className="details-key">{t("user_id")}</div>
              <div className="details-value">{profile.user_id ?? "-"}</div>
            </div>

            <div className="details-row">
              <div className="details-key">{t("full_name")}</div>
              <div className="details-value">{profile.full_name ?? "-"}</div>
            </div>
            <div className="details-row">
              <div className="details-key">{t("phone")}</div>
              <div className="details-value">{profile.phone ?? "-"}</div>
            </div>

            <div className="details-row">
              <div className="details-key">{t("email")}</div>
              <div className="details-value">{profile.email ?? "-"}</div>
            </div>
            <div className="details-row">
              <div className="details-key">{t("qualification")}</div>
              <div className="details-value">
                {profile.qualification ?? "-"}
              </div>
            </div>

            <div className="details-row">
              <div className="details-key">{t("joining_date")}</div>
              <div className="details-value">
                {profile.joining_date ?? "-"}
              </div>
            </div>
            <div className="details-row">
              <div className="details-key">{t("tenure_start_date")}</div>
              <div className="details-value">
                {profile.tenure_start_date ?? "-"}
              </div>
            </div>

            <div className="details-row">
              <div className="details-key">{t("tenure_end_date")}</div>
              <div className="details-value">
                {profile.tenure_end_date ?? "-"}
              </div>
            </div>
            <div className="details-row">
              <div className="details-key">{t("status")}</div>
              <div className="details-value">{profile.status ?? "-"}</div>
            </div>

            <div className="details-row">
              <div className="details-key">{t("updated_at")}</div>
              <div className="details-value">
                {profile.updatedAt ?? "-"}
              </div>
            </div>
          </div>
        </AdminCard>
      </div>

      <ChatWidget />
    </>
  );
}
