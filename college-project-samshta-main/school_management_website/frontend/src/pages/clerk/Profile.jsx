import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminCard from "../../components/admin/AdminCard";
import ChatWidget from "../../components/ChatWidget";

export default function ClerkProfile() {
  const [profile, setProfile] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    async function fetchProfile() {
      try {
        const res = await axios.get("http://localhost:5000/api/clerk/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
        setEditForm(res.data);
      } catch (err) {
        setError("Failed to load profile");
      }
    }

    fetchProfile();
  }, []);

  function handleEdit() {
    setIsEditing(true);
  }

  function handleChange(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/clerk/me", editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(editForm);
      setSuccess("Profile updated successfully! ✅");
      setIsEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update profile");
    }
  }

  if (!profile) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="profile-management-module">
      <div className="section-header-pro">
        <h3>User Profile</h3>
        <p>Manage your personal information and institutional credentials</p>
      </div>

      <div className="row">
        <div className="col-lg-8 mx-auto">
          <AdminCard header={
            <div className="d-flex justify-content-between align-items-center w-100">
              <span>Clerk Information</span>
              {!isEditing && (
                <button className="btn btn-sm btn-outline-primary" onClick={handleEdit}>
                  <i className="bi bi-pencil-square me-1"></i> Edit Profile
                </button>
              )}
            </div>
          }>
            {error && <div className="alert alert-danger py-2 mb-3 small">{error}</div>}
            {success && <div className="alert alert-success py-2 mb-3 small">{success}</div>}

            {!isEditing ? (
              <div className="profile-details">
                <div className="d-flex align-items-center gap-4 mb-4 pb-4 border-bottom">
                  <div className="profile-avatar-large">
                    {profile.full_name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="fw-bold mb-1 text-dark">{profile.full_name}</h4>
                    <span className="erp-badge badge-designation">INSTITUTIONAL CLERK</span>
                    <div className="text-muted small mt-2">
                      <i className="bi bi-calendar3 me-2"></i> Joined: {profile.joining_date ? new Date(profile.joining_date).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                </div>

                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="text-muted small fw-bold d-block text-uppercase mb-1">Email Address</label>
                    <span className="text-dark fw-semibold">{profile.email}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small fw-bold d-block text-uppercase mb-1">Phone Number</label>
                    <span className="text-dark fw-semibold">+91 {profile.phone || 'N/A'}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small fw-bold d-block text-uppercase mb-1">Qualification</label>
                    <span className="text-dark fw-semibold">{profile.qualification || 'N/A'}</span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small fw-bold d-block text-uppercase mb-1">Gender</label>
                    <span className="text-dark fw-semibold text-capitalize">{profile.gender || 'N/A'}</span>
                  </div>
                  <div className="col-12">
                    <label className="text-muted small fw-bold d-block text-uppercase mb-1">Residential Address</label>
                    <span className="text-dark fw-semibold">{profile.address || 'N/A'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">FULL NAME</label>
                    <input className="form-control" name="full_name" value={editForm.full_name || ""} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">EMAIL</label>
                    <input className="form-control" type="email" name="email" value={editForm.email || ""} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">PHONE</label>
                    <input className="form-control" name="phone" value={editForm.phone || ""} onChange={handleChange} pattern="[0-9]{10}" required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold">QUALIFICATION</label>
                    <input className="form-control" name="qualification" value={editForm.qualification || ""} onChange={handleChange} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold">ADDRESS</label>
                    <textarea className="form-control" name="address" rows="2" value={editForm.address || ""} onChange={handleChange} />
                  </div>
                </div>
                <div className="d-flex gap-2 mt-4 pt-3 border-top">
                  <button type="submit" className="btn btn-primary px-4">Save Changes</button>
                  <button type="button" className="btn btn-outline-secondary px-4" onClick={() => { setEditForm(profile); setIsEditing(false); }}>Cancel</button>
                </div>
              </form>
            )}
          </AdminCard>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}
