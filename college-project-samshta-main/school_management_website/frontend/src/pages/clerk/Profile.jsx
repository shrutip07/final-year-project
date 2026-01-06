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

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : "CL";
  };

  return (
    <div className="profile-management-module pb-3">
      {/* 1️⃣ Profile Overview Card (Top Section) */}
      <div className="mb-3">
        <AdminCard className="border-0 shadow-sm overflow-hidden p-0">
          <div className="p-3 p-lg-4" style={{ background: "linear-gradient(135deg, #002E6D 0%, #004a99 100%)" }}>
            <div className="d-flex flex-column flex-md-row align-items-center gap-3">
              <div 
                className="profile-avatar-sm d-flex align-items-center justify-content-center text-white fw-bold shadow-lg"
                style={{ 
                  width: "80px", 
                  height: "80px", 
                  borderRadius: "50%", 
                  fontSize: "2rem",
                  background: "rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                  border: "2px solid rgba(255, 255, 255, 0.3)"
                }}
              >
                {getInitials(profile.full_name)}
              </div>
              <div className="text-center text-md-start flex-grow-1">
                <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-1">
                  <h4 className="text-white fw-bold mb-0">{profile.full_name}</h4>
                  <span 
                    className="badge rounded-pill" 
                    style={{ background: "#ffd700", color: "#002E6D", fontSize: "0.65rem", fontWeight: "700", padding: "4px 10px" }}
                  >
                    INSTITUTIONAL CLERK
                  </span>
                </div>
                <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-3 text-white-50">
                  <span className="small d-flex align-items-center gap-1" style={{ fontSize: "0.85rem" }}>
                    <i className="bi bi-envelope"></i> {profile.email}
                  </span>
                  <span className="small d-flex align-items-center gap-1" style={{ fontSize: "0.85rem" }}>
                    <i className="bi bi-telephone"></i> {profile.phone || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="mt-2 mt-md-0">
                {!isEditing && (
                  <button 
                    className="btn btn-light fw-bold px-3 py-1 rounded-pill shadow-sm" 
                    onClick={handleEdit}
                    style={{ color: "#002E6D", fontSize: "0.85rem" }}
                  >
                    <i className="bi bi-pencil-square me-2"></i> Edit Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </AdminCard>
      </div>

      <div className="row g-3">
        <div className="col-12">
          {/* 2️⃣ Sub Tabs INSIDE Profile */}
          <TabNavigation
            tabs={[
              { id: "personal", label: "Personal Information", icon: "bi-person-vcard" },
              { id: "institutional", label: "Institutional Details", icon: "bi-building-gear" },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="mt-3">
            {isEditing ? (
              <AdminCard header="Update Account Information">
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted mb-1">FULL NAME</label>
                      <input className="form-control border-2 shadow-none" name="full_name" value={editForm.full_name || ""} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted mb-1">EMAIL ADDRESS</label>
                      <input className="form-control border-2 shadow-none" type="email" name="email" value={editForm.email || ""} onChange={handleChange} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted mb-1">PHONE NUMBER</label>
                      <input className="form-control border-2 shadow-none" name="phone" value={editForm.phone || ""} onChange={handleChange} pattern="[0-9]{10}" required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted mb-1">QUALIFICATION</label>
                      <input className="form-control border-2 shadow-none" name="qualification" value={editForm.qualification || ""} onChange={handleChange} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted mb-1">RESIDENTIAL ADDRESS</label>
                      <textarea className="form-control border-2 shadow-none" name="address" rows="2" value={editForm.address || ""} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-4 pt-3 border-top">
                    <button type="submit" className="btn btn-primary px-4 rounded-pill fw-bold">Save Changes</button>
                    <button type="button" className="btn btn-outline-secondary px-4 rounded-pill fw-bold" onClick={() => { setEditForm(profile); setIsEditing(false); }}>Cancel</button>
                  </div>
                </form>
              </AdminCard>
            ) : (
              <>
                {/* 3️⃣ Personal Information Tab */}
                {activeTab === "personal" && (
                  <AdminCard header="Personal Profile Details">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3 border border-white h-100 shadow-sm">
                          <label className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider" style={{ fontSize: "0.7rem" }}>Email Address</label>
                          <span className="text-dark fw-bold fs-6">{profile.email}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3 border border-white h-100 shadow-sm">
                          <label className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider" style={{ fontSize: "0.7rem" }}>Phone Number</label>
                          <span className="text-dark fw-bold fs-6">+91 {profile.phone || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3 border border-white h-100 shadow-sm">
                          <label className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider" style={{ fontSize: "0.7rem" }}>Gender</label>
                          <span className="text-dark fw-bold fs-6 text-capitalize">{profile.gender || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3 border border-white h-100 shadow-sm">
                          <label className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider" style={{ fontSize: "0.7rem" }}>Qualification</label>
                          <span className="text-dark fw-bold fs-6">{profile.qualification || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="p-3 bg-light rounded-3 border border-white shadow-sm">
                          <label className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider" style={{ fontSize: "0.7rem" }}>Residential Address</label>
                          <span className="text-dark fw-bold fs-6 d-block">{profile.address || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </AdminCard>
                )}

                {/* 4️⃣ Institutional Details Tab */}
                {activeTab === "institutional" && (
                  <AdminCard header="Employment & Institutional Data">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3 border border-white h-100 shadow-sm">
                          <label className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider" style={{ fontSize: "0.7rem" }}>Designation</label>
                          <span className="text-dark fw-bold fs-6">Institutional Clerk</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3 border border-white h-100 shadow-sm">
                          <label className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider" style={{ fontSize: "0.7rem" }}>Employment Status</label>
                          <span className="badge bg-success-soft text-success px-2 py-1 rounded-pill fw-bold border border-success" style={{ fontSize: "0.75rem" }}>
                            <i className="bi bi-patch-check-fill me-1"></i> ACTIVE
                          </span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3 border border-white h-100 shadow-sm">
                          <label className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider" style={{ fontSize: "0.7rem" }}>Department</label>
                          <span className="text-dark fw-bold fs-6">ADMINISTRATION</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3 border border-white h-100 shadow-sm">
                          <label className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider" style={{ fontSize: "0.7rem" }}>Joining Date</label>
                          <span className="text-dark fw-bold fs-6">
                            {profile.joining_date ? new Date(profile.joining_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="p-3 bg-light rounded-3 border border-white shadow-sm">
                          <label className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider" style={{ fontSize: "0.7rem" }}>Assigned Unit</label>
                          <span className="text-dark fw-bold fs-6">{profile.unit_name || 'MKSSS Institutional Headquarters'}</span>
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
      
      {success && (
        <div className="toast-container position-fixed bottom-0 end-0 p-3">
          <div className="toast show align-items-center text-white bg-success border-0 rounded-3 shadow" role="alert">
            <div className="d-flex">
              <div className="toast-body fw-bold">
                <i className="bi bi-check-circle-fill me-2"></i> {success}
              </div>
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="toast-container position-fixed bottom-0 end-0 p-3">
          <div className="toast show align-items-center text-white bg-danger border-0 rounded-3 shadow" role="alert">
            <div className="d-flex">
              <div className="toast-body fw-bold">
                <i className="bi bi-exclamation-triangle-fill me-2"></i> {error}
              </div>
            </div>
          </div>
        </div>
      )}
      <ChatWidget />
      
        <style>{`
          .bg-success-soft {
            background-color: #e6fcf5;
          }
          .tracking-wider {
            letter-spacing: 0.05em;
          }
          .form-control:focus {
            border-color: #002E6D;
            box-shadow: 0 0 0 0.2rem rgba(0, 46, 109, 0.1);
          }
        `}</style>
    </div>
  );
}
