import React, { useState, useEffect } from "react";
import axios from "axios";
import AdminCard from "../../components/admin/AdminCard";
import TabNavigation from "../../components/admin/TabNavigation";
import ChatWidget from "../../components/ChatWidget";

export default function ClerkProfile() {
  const [profile, setProfile] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
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
      <div className="section-header-pro mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="header-icon-box bg-soft-primary">
            <i className="bi bi-person-badge-fill text-primary"></i>
          </div>
          <div>
            <h3 className="mb-1">Clerk Profile</h3>
            <p className="text-muted small mb-0">Manage your institutional identity and contact information.</p>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-4">
          <AdminCard className="text-center h-100">
            <div className="profile-avatar-xl mx-auto mb-3">
              {profile.full_name?.charAt(0).toUpperCase()}
            </div>
            <h4 className="fw-bold text-dark mb-1">{profile.full_name}</h4>
            <span className="erp-badge badge-designation mb-3">Institutional Clerk</span>
            <div className="d-grid mt-4">
              {!isEditing && (
                <button className="btn btn-outline-primary" onClick={handleEdit}>
                  <i className="bi bi-pencil-square me-2"></i> Edit Account
                </button>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-top text-start">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="icon-circle-sm bg-light">
                  <i className="bi bi-envelope text-primary"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Official Email</small>
                  <span className="fw-semibold small">{profile.email}</span>
                </div>
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="icon-circle-sm bg-light">
                  <i className="bi bi-telephone text-primary"></i>
                </div>
                <div>
                  <small className="text-muted d-block">Contact Number</small>
                  <span className="fw-semibold small">+91 {profile.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
          </AdminCard>
        </div>

        <div className="col-lg-8">
          <TabNavigation
            tabs={[
              { id: "personal", label: "Personal Information", icon: "bi-person" },
              { id: "institutional", label: "Institutional Details", icon: "bi-building" },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="mt-4">
            {isEditing ? (
              <AdminCard header="Edit Profile Information">
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
              </AdminCard>
            ) : (
              <>
                {activeTab === "personal" && (
                  <AdminCard header="Personal Details">
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <label className="text-muted small fw-bold d-block text-uppercase mb-1">Email Address</label>
                          <span className="text-dark fw-bold">{profile.email}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <label className="text-muted small fw-bold d-block text-uppercase mb-1">Phone Number</label>
                          <span className="text-dark fw-bold">+91 {profile.phone || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <label className="text-muted small fw-bold d-block text-uppercase mb-1">Gender</label>
                          <span className="text-dark fw-bold text-capitalize">{profile.gender || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="p-3 bg-light rounded-3">
                          <label className="text-muted small fw-bold d-block text-uppercase mb-1">Residential Address</label>
                          <span className="text-dark fw-bold">{profile.address || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </AdminCard>
                )}

                {activeTab === "institutional" && (
                  <AdminCard header="Institutional Information">
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <label className="text-muted small fw-bold d-block text-uppercase mb-1">Joining Date</label>
                          <span className="text-dark fw-bold">
                            {profile.joining_date ? new Date(profile.joining_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <label className="text-muted small fw-bold d-block text-uppercase mb-1">Qualification</label>
                          <span className="text-dark fw-bold">{profile.qualification || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <label className="text-muted small fw-bold d-block text-uppercase mb-1">Employment Status</label>
                          <span className="badge bg-success">ACTIVE</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3">
                          <label className="text-muted small fw-bold d-block text-uppercase mb-1">Department</label>
                          <span className="text-dark fw-bold">ADMINISTRATION</span>
                        </div>
                      </div>
                    </div>
                  </AdminCard>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {success && <div className="toast-container position-fixed bottom-0 end-0 p-3"><div className="toast show align-items-center text-white bg-success border-0" role="alert"><div className="d-flex"><div className="toast-body">{success}</div></div></div></div>}
      {error && <div className="toast-container position-fixed bottom-0 end-0 p-3"><div className="toast show align-items-center text-white bg-danger border-0" role="alert"><div className="d-flex"><div className="toast-body">{error}</div></div></div></div>}
      <ChatWidget />
    </div>
  );
}

