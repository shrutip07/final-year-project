// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function ClerkProfile() {
//   const [profile, setProfile] = useState(null);
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (!token) return navigate("/login");
//     axios
//       .get("http://localhost:5000/api/clerk/me", { headers: { Authorization: `Bearer ${token}` } })
//       .then(res => setProfile(res.data))
//       .catch(() => navigate("/clerk/onboarding"));
//   }, [token, navigate]);

//   if (!profile) return <div>Loading...</div>;

//   return (
//     <div style={{ maxWidth: 700, margin: "auto" }}>
//       <h2>Clerk Profile</h2>
//       <table>
//         <tbody>
//           <tr><th>Full Name</th><td>{profile.full_name}</td></tr>
//           <tr><th>Email</th><td>{profile.email}</td></tr>
//           <tr><th>Phone</th><td>{profile.phone}</td></tr>
//           <tr><th>Qualification</th><td>{profile.qualification}</td></tr>
//           <tr><th>Joining Date</th><td>{profile.joining_date}</td></tr>
//           <tr><th>Retirement Date</th><td>{profile.retirement_date}</td></tr>
//           <tr><th>Status</th><td>{profile.status}</td></tr>
//           <tr><th>Address</th><td>{profile.address}</td></tr>
//           <tr><th>Gender</th><td>{profile.gender}</td></tr>
//         </tbody>
//       </table>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatWidget from "../../components/ChatWidget";

export default function ClerkProfile() {
  const [profile, setProfile] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://localhost:5000/api/clerk/me", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      setProfile(res.data);
      setEditForm(res.data);
    });
  }, []);

  function handleEdit() {
    setIsEditing(true);
  }

  function handleChange(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    await axios.put("http://localhost:5000/api/clerk/me", editForm, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setProfile(editForm);
    setIsEditing(false);
  }

  if (!profile) return (
    <>
      <div>Loading...</div>
      <ChatWidget />
    </>
  );

  if (isEditing) {
    return (
      <>
      <form onSubmit={handleSubmit}>
        <input name="full_name" value={editForm.full_name || ''} onChange={handleChange} placeholder="Full Name" />
        {/* Repeat for other fields */}
        <input name="email" value={editForm.email || ''} onChange={handleChange} placeholder="Email" />
        <input name="phone" value={editForm.phone || ''} onChange={handleChange} placeholder="Phone" />
        <input name="qualification" value={editForm.qualification || ''} onChange={handleChange} placeholder="Qualification" />
        {/* ...Add other fields */}
        <button type="submit">Save</button>
        <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
      </form>
      <ChatWidget />
      </>
    );
  }

  return (
    <>
    <div>
      <h2>Clerk Profile</h2>
      <table className="table">
        <tbody>
          <tr><th>Full Name</th><td>{profile.full_name}</td></tr>
          <tr><th>Email</th><td>{profile.email}</td></tr>
          <tr><th>Phone</th><td>{profile.phone}</td></tr>
          <tr><th>Qualification</th><td>{profile.qualification}</td></tr>
          {/* Repeat for other profile info */}
        </tbody>
      </table>
      <button onClick={handleEdit}>Edit Profile</button>
    </div>
    <ChatWidget />
    </>
  );
}
