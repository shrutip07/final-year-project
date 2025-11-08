
// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function PrincipalProfile() {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [profile, setProfile] = useState(null);
//   const [error, setError] = useState("");
//   const [isEditing, setIsEditing] = useState(false);
//   const [editForm, setEditForm] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       navigate("/login");
//       return;
//     }
//     axios
//       .get("http://localhost:5000/api/principal/me", { headers: { Authorization: `Bearer ${token}` } })
//       .then(res => {
//         if (res.data && res.data.user_id) {
//           setProfile(res.data);
//         } else {
//           setError("Profile not found.");
//         }
//       })
//       .catch(() => {
//         setError("Failed to load profile.");
//       })
//       .finally(() => setLoading(false));
//   }, [navigate]);

//   const handleEdit = () => {
//     setEditForm({ ...profile });
//     setIsEditing(true);
//   };

//   const handleChange = (e) => {
//     const value = e.target.type === 'date' 
//       ? e.target.value || null
//       : e.target.value;
//     setEditForm({
//       ...editForm,
//       [e.target.name]: value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");
//       const response = await axios.put(
//         `http://localhost:5000/api/principal/${profile.principal_id}`,
//         editForm,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       setProfile(response.data);
//       setIsEditing(false);
//       setError("");
//     } catch (err) {
//       setError(err.response?.data?.error || "Failed to update profile");
//     }
//   };

//   if (loading) return <div>Loading profile...</div>;
//   if (error) return <div className="alert alert-danger">{error}</div>;
//   if (!profile) return <div>No principal profile found.</div>;

//   if (isEditing) {
//     return (
//       <div className="container">
//         <h2>Edit Principal Profile</h2>
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>Unit ID</label>
//             <input
//               type="number"
//               name="unit_id"
//               value={editForm.unit_id || ""}
//               onChange={handleChange}
//               className="form-control"
//             />
//           </div>
//           <div className="form-group">
//             <label>Full Name</label>
//             <input
//               type="text"
//               name="full_name"
//               value={editForm.full_name || ""}
//               onChange={handleChange}
//               className="form-control"
//             />
//           </div>
//           <div className="form-group">
//             <label>Phone</label>
//             <input
//               type="text"
//               name="phone"
//               value={editForm.phone || ""}
//               onChange={handleChange}
//               className="form-control"
//             />
//           </div>
//           <div className="form-group">
//             <label>Email</label>
//             <input
//               type="email"
//               name="email"
//               value={editForm.email || ""}
//               onChange={handleChange}
//               className="form-control"
//             />
//           </div>
//           <div className="form-group">
//             <label>Qualification</label>
//             <input
//               type="text"
//               name="qualification"
//               value={editForm.qualification || ""}
//               onChange={handleChange}
//               className="form-control"
//             />
//           </div>
//           <div className="form-group">
//             <label>Joining Date</label>
//             <input
//               type="date"
//               name="joining_date"
//               value={editForm.joining_date?.slice(0, 10) || ""}
//               onChange={handleChange}
//               className="form-control"
//             />
//           </div>
//           <div className="form-group">
//             <label>Tenure Start Date</label>
//             <input
//               type="date"
//               name="tenure_start_date"
//               value={editForm.tenure_start_date?.slice(0, 10) || ""}
//               onChange={handleChange}
//               className="form-control"
//             />
//           </div>
//           <div className="form-group">
//             <label>Tenure End Date</label>
//             <input
//               type="date"
//               name="tenure_end_date"
//               value={editForm.tenure_end_date?.slice(0, 10) || ""}
//               onChange={handleChange}
//               className="form-control"
//             />
//           </div>
//           <div className="form-group">
//             <label>Status</label>
//             <select
//               name="status"
//               value={editForm.status || "active"}
//               onChange={handleChange}
//               className="form-control"
//             >
//               <option value="active">Active</option>
//               <option value="retired">Retired</option>
//               <option value="on-leave">On Leave</option>
//             </select>
//           </div>
//           <button type="submit" className="btn btn-primary mt-3">Save Changes</button>
//           <button 
//             type="button" 
//             className="btn btn-secondary mt-3 ms-2"
//             onClick={() => setIsEditing(false)}
//           >
//             Cancel
//           </button>
//         </form>
//       </div>
//     );
//   }

//   return (
//     <div className="container" style={{ maxWidth: 700 }}>
//       <h2 className="mb-4">Principal Profile</h2>
//       <button 
//         className="btn btn-primary mb-3"
//         onClick={handleEdit}
//       >
//         Edit Profile
//       </button>
//       <table className="table table-bordered">
//         <tbody>
//           <tr><th>Principal ID</th><td>{profile.principal_id ?? ""}</td></tr>
//           <tr><th>User ID</th><td>{profile.user_id ?? ""}</td></tr>
//           <tr><th>Unit ID</th><td>{profile.unit_id ?? ""}</td></tr>
//           <tr><th>Full Name</th><td>{profile.full_name ?? ""}</td></tr>
//           <tr><th>Phone</th><td>{profile.phone ?? ""}</td></tr>
//           <tr><th>Email</th><td>{profile.email ?? ""}</td></tr>
//           <tr><th>Qualification</th><td>{profile.qualification ?? ""}</td></tr>
//           <tr><th>Joining Date</th><td>{profile.joining_date ?? ""}</td></tr>
//           <tr><th>Tenure Start Date</th><td>{profile.tenure_start_date ?? ""}</td></tr>
//           <tr><th>Tenure End Date</th><td>{profile.tenure_end_date ?? ""}</td></tr>
//           <tr><th>Status</th><td>{profile.status ?? ""}</td></tr>
//           <tr><th>Updated At</th><td>{profile.updatedat ?? profile.updatedAt ?? ""}</td></tr>
//         </tbody>
//       </table>
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
      .get("http://localhost:5000/api/principal/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
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
    const value = e.target.type === 'date' ? e.target.value || null : e.target.value;
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

  if (loading) return <div>{t("loading_profile")}...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!profile) return <div>{t("no_profile_found")}</div>;

  if (isEditing) {
    return (
      <div className="container">
        <h2>{t("edit_profile")}</h2>
        <form onSubmit={handleSubmit}>
          {/* Repeat for all fields, replacing labels with t() keys */}
          <div className="mb-3">
            <label className="form-label">{t("unit_id")}</label>
            <input
              type="number"
              name="unit_id"
              value={editForm.unit_id || ""}
              onChange={handleChange}
              className="form-control"
            />
          </div>
          {/* other fields similarly */}
          <button type="submit" className="btn btn-primary">{t("save_changes")}</button>
          <button type="button" className="btn btn-secondary ms-2" onClick={() => setIsEditing(false)}>{t("cancel")}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 700 }}>
      <h2>{t("principal_profile")}</h2>
      <button className="btn btn-primary mb-3" onClick={handleEdit}>{t("edit_profile")}</button>
      <table className="table table-bordered">
        <tbody>
          <tr><th>{t("principal_id")}</th><td>{profile.principal_id ?? ""}</td></tr>
          <tr><th>{t("user_id")}</th><td>{profile.user_id ?? ""}</td></tr>
          {/* repeat for all profile fields with t() keys */}
          <tr><th>{t("full_name")}</th><td>{profile.full_name ?? ""}</td></tr>
          <tr><th>{t("phone")}</th><td>{profile.phone ?? ""}</td></tr>
          <tr><th>{t("email")}</th><td>{profile.email ?? ""}</td></tr>
          <tr><th>{t("qualification")}</th><td>{profile.qualification ?? ""}</td></tr>
          <tr><th>{t("joining_date")}</th><td>{profile.joining_date ?? ""}</td></tr>
          <tr><th>{t("tenure_start_date")}</th><td>{profile.tenure_start_date ?? ""}</td></tr>
          <tr><th>{t("tenure_end_date")}</th><td>{profile.tenure_end_date ?? ""}</td></tr>
          <tr><th>{t("status")}</th><td>{profile.status ?? ""}</td></tr>
          <tr><th>{t("updated_at")}</th><td>{profile.updatedAt ?? ""}</td></tr>
        </tbody>
      </table>
    </div>
  );
}
