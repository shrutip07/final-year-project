// src/pages/clerk/Profile.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminCard from "../../components/admin/AdminCard";

export default function ClerkProfile() {
  const [profile, setProfile] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/clerk/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setEditForm(res.data);
    } catch (err) {
      setError("Failed to load profile");
    }
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/clerk/me", editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(editForm);
      setIsEditing(false);
      setSuccess("Profile updated successfully ✅");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update profile");
    }
  };

  if (!profile) return (
    <div className="d-flex justify-content-center p-5">
      <div className="spinner-border text-primary"></div>
    </div>
  );

  return (
    <div className="clerk-profile-page">
      <div className="section-header-pro">
        <h3>My Profile</h3>
        <p>Manage your personal and professional information</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <AdminCard className="text-center py-4">
            <div className="profile-avatar-large mx-auto mb-3">
              {profile.full_name?.charAt(0).toUpperCase()}
            </div>
            <h4 className="fw-bold text-navy mb-1">{profile.full_name}</h4>
            <div className="erp-badge badge-designation mb-3">Institutional Clerk</div>
            <div className="text-muted small">
              <i className="bi bi-envelope me-2"></i>{profile.email}
            </div>
            <div className="text-muted small mt-1">
              <i className="bi bi-phone me-2"></i>{profile.phone}
            </div>
          </AdminCard>
        </div>

        <div className="col-lg-8">
          <AdminCard header={isEditing ? "Edit Profile Information" : "Profile Details"}>
            {success && <div className="alert alert-success py-2 mb-3 small">{success}</div>}
            {error && <div className="alert alert-danger py-2 mb-3 small">{error}</div>}

            {isEditing ? (
              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">FULL NAME</label>
                  <input className="form-control" name="full_name" value={editForm.full_name || ""} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">EMAIL</label>
                  <input className="form-control" type="email" name="email" value={editForm.email || ""} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">PHONE</label>
                  <input className="form-control" name="phone" value={editForm.phone || ""} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">QUALIFICATION</label>
                  <input className="form-control" name="qualification" value={editForm.qualification || ""} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">GENDER</label>
                  <select className="form-select" name="gender" value={editForm.gender || ""} onChange={handleChange}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-md-12">
                  <label className="form-label small fw-bold text-muted">ADDRESS</label>
                  <textarea className="form-control" name="address" rows={2} value={editForm.address || ""} onChange={handleChange}></textarea>
                </div>
                <div className="col-12 d-flex gap-2 pt-2">
                  <button type="submit" className="btn btn-primary px-4">Save Changes</button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="table-responsive professional-table">
                <table className="table table-hover align-middle">
                  <tbody>
                    <tr>
                      <th className="text-muted small text-uppercase" style={{ width: "30%" }}>Full Name</th>
                      <td className="fw-bold text-navy">{profile.full_name}</td>
                    </tr>
                    <tr>
                      <th className="text-muted small text-uppercase">Email Address</th>
                      <td className="text-navy">{profile.email}</td>
                    </tr>
                    <tr>
                      <th className="text-muted small text-uppercase">Phone Number</th>
                      <td className="text-navy">{profile.phone}</td>
                    </tr>
                    <tr>
                      <th className="text-muted small text-uppercase">Qualification</th>
                      <td><span className="erp-badge badge-qualification">{profile.qualification || "-"}</span></td>
                    </tr>
                    <tr>
                      <th className="text-muted small text-uppercase">Gender</th>
                      <td className="text-navy">{profile.gender || "-"}</td>
                    </tr>
                    <tr>
                      <th className="text-muted small text-uppercase">Joining Date</th>
                      <td className="text-navy">{profile.joining_date ? new Date(profile.joining_date).toLocaleDateString() : "-"}</td>
                    </tr>
                    <tr>
                      <th className="text-muted small text-uppercase">Address</th>
                      <td className="text-navy small">{profile.address || "-"}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="pt-3">
                  <button className="btn btn-navy px-4" onClick={() => setIsEditing(true)}>Edit Profile</button>
                </div>
              </div>
            )}
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
