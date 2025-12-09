import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ClerkProfile() {
  const [profile, setProfile] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");

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

    try {
      const token = localStorage.getItem("token");
      await axios.put("http://localhost:5000/api/clerk/me", editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(editForm);
      setIsEditing(false);
    } catch (err) {
      setError("Failed to update profile");
    }
  }

  if (!profile) {
    return <div className="loading-state">Loading profile…</div>;
  }

  // ---------- EDIT MODE ----------
  if (isEditing) {
    return (
      <div className="teacher-profile-card clerk-profile-card">
        <div className="card-header">
          <h3>Edit Clerk Profile</h3>
        </div>

        {error && <div className="error-state mb-3">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Full Name</label>
              <input
                className="form-control"
                name="full_name"
                value={editForm.full_name || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                name="email"
                value={editForm.email || ""}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Phone</label>
              <input
                className="form-control"
                name="phone"
                value={editForm.phone || ""}
                onChange={handleChange}
                pattern="[0-9]{10}"
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label">Qualification</label>
              <input
                className="form-control"
                name="qualification"
                value={editForm.qualification || ""}
                onChange={handleChange}
              />
            </div>
            {/* Add more fields here if needed */}
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn">
              Save Changes
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setEditForm(profile);
                setIsEditing(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ---------- VIEW MODE ----------
  return (
    <div className="teacher-profile-card clerk-profile-card">
      <div className="card-header">
        <h3>Clerk Profile</h3>
      </div>

      {error && <div className="error-state mb-3">{error}</div>}

      <div className="card-body">
        <div className="table-responsive">
          <table className="table clerk-profile-table">
            <tbody>
              <tr>
                <th>Full Name</th>
                <td>{profile.full_name}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td>{profile.email}</td>
              </tr>
              <tr>
                <th>Phone</th>
                <td>{profile.phone}</td>
              </tr>
              <tr>
                <th>Qualification</th>
                <td>{profile.qualification}</td>
              </tr>
              {/* Add more rows if you store more info */}
            </tbody>
          </table>
        </div>

        <button className="edit-profile-btn mt-3" onClick={handleEdit}>
          Edit Profile
        </button>
      </div>
    </div>
  );
}
