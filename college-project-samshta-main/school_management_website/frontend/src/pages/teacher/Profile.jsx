// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";

// export default function TeacherProfile() {
//   const navigate = useNavigate();
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedProfile, setEditedProfile] = useState(null);

//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const token = localStorage.getItem("token");
//         const response = await axios.get("http://localhost:5000/api/teacher/me", {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setProfile(response.data);
//         setEditedProfile(response.data);
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching profile:", err);
//         setError(err.response?.data?.message || "Failed to load profile");
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, []);

//   const handleEdit = () => {
//     setIsEditing(true);
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     setEditedProfile(profile);
//   };

//   const handleChange = (e) => {
//     setEditedProfile({
//       ...editedProfile,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const token = localStorage.getItem("token");
//       await axios.put(`http://localhost:5000/api/teacher/profile`, editedProfile, {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setProfile(editedProfile);
//       setIsEditing(false);
//     } catch (err) {
//       console.error("Error updating profile:", err);
//       setError(err.response?.data?.message || "Failed to update profile");
//     }
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div className="alert alert-danger">{error}</div>;

//   return (
//     <div className="container mt-4">
//       <div className="d-flex align-items-center mb-4">
//         <button
//           className="btn btn-link"
//           onClick={() => navigate('/teacher')}
//         >
//           <i className="bi bi-arrow-left"></i> Back to Dashboard
//         </button>
//         <h2 className="mb-0 ms-3">Teacher Profile</h2>
//       </div>

//       <div className="card">
//         <div className="card-header d-flex justify-content-between align-items-center">
//           <h3>Teacher Profile</h3>
//           {!isEditing && (
//             <button className="btn btn-primary" onClick={handleEdit}>
//               Edit Profile
//             </button>
//           )}
//         </div>
//         <div className="card-body">
//           {isEditing ? (
//             <form onSubmit={handleSubmit}>
//               <div className="row">
//                 <div className="col-md-6">
//                   <div className="mb-3">
//                     <label className="form-label">Full Name</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       name="full_name"
//                       value={editedProfile.full_name}
//                       onChange={handleChange}
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <label className="form-label">Email</label>
//                     <input
//                       type="email"
//                       className="form-control"
//                       name="email"
//                       value={editedProfile.email}
//                       onChange={handleChange}
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <label className="form-label">Phone</label>
//                     <input
//                       type="tel"
//                       className="form-control"
//                       name="phone"
//                       value={editedProfile.phone}
//                       onChange={handleChange}
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <label className="form-label">Qualification</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       name="qualification"
//                       value={editedProfile.qualification}
//                       onChange={handleChange}
//                     />
//                   </div>
//                 </div>
//                 <div className="col-md-6">
//                   <div className="mb-3">
//                     <label className="form-label">Designation</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       name="designation"
//                       value={editedProfile.designation}
//                       onChange={handleChange}
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <label className="form-label">Subject</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       name="subject"
//                       value={editedProfile.subject}
//                       onChange={handleChange}
//                     />
//                   </div>
//                   <div className="mb-3">
//                     <label className="form-label">Joining Date</label>
//                     <input
//                       type="date"
//                       className="form-control"
//                       name="joining_date"
//                       value={editedProfile.joining_date?.split("T")[0]}
//                       onChange={handleChange}
//                       disabled
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="mt-3">
//                 <button type="submit" className="btn btn-success me-2">
//                   Save Changes
//                 </button>
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={handleCancel}
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </form>
//           ) : (
//             <div className="row">
//               <div className="col-md-6">
//                 <p><strong>Staff ID:</strong> {profile.staff_id}</p>
//                 <p><strong>Full Name:</strong> {profile.full_name}</p>
//                 <p><strong>Email:</strong> {profile.email}</p>
//                 <p><strong>Phone:</strong> {profile.phone}</p>
//                 <p><strong>Qualification:</strong> {profile.qualification}</p>
//               </div>
//               <div className="col-md-6">
//                 <p><strong>Designation:</strong> {profile.designation}</p>
//                 <p><strong>Subject:</strong> {profile.subject}</p>
//                 <p><strong>Joining Date:</strong> {new Date(profile.joining_date).toLocaleDateString()}</p>
//                 <p><strong>Last Updated:</strong> {new Date(profile.updatedat).toLocaleDateString()}</p>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

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
        setError(err.response?.data?.message || t("failed_load_profile"));
        setLoading(false);
      }
    };
    fetchProfile();
    // eslint-disable-next-line
  }, [t]);

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
      await axios.put(`http://localhost:5000/api/teacher/profile`, editedProfile, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(editedProfile);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || t("failed_update"));
    }
  };

  if (loading) return <div className="loading-state">{t("loading_profile")}...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <>
    <div className="teacher-profile-page">
      <div className="teacher-main-content">
        <div className="page-header">
          <button
            className="back-button"
            onClick={() => navigate('/teacher')}
          >
            <i className="bi bi-arrow-left"></i> {t("back_to_dashboard")}
          </button>
          <h2>{t("teacher_profile")}</h2>
        </div>
        <div className="teacher-profile-card">
          <div className="card-header">
            <h3>{t("teacher_profile")}</h3>
            {!isEditing && (
              <button className="edit-profile-btn" onClick={handleEdit}>
                {t("edit_profile")}
              </button>
            )}
          </div>
          <div className="card-body">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">{t("full_name")}</label>
                    <input
                      type="text"
                      className="form-control"
                      name="full_name"
                      value={editedProfile.full_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{t("email")}</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={editedProfile.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{t("phone")}</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={editedProfile.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{t("qualification")}</label>
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
                    <label className="form-label">{t("designation")}</label>
                    <input
                      type="text"
                      className="form-control"
                      name="designation"
                      value={editedProfile.designation}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{t("subject")}</label>
                    <input
                      type="text"
                      className="form-control"
                      name="subject"
                      value={editedProfile.subject}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{t("joining_date")}</label>
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
                  {t("save_changes")}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancel}
                >
                  {t("cancel")}
                </button>
              </div>
            </form>
          ) : (
            <div className="row">
              <div className="col-md-6">
                <p><strong>{t("staff_id")}</strong> {profile.staff_id}</p>
                <p><strong>{t("full_name")}</strong> {profile.full_name}</p>
                <p><strong>{t("email")}</strong> {profile.email}</p>
                <p><strong>{t("phone")}</strong> {profile.phone}</p>
                <p><strong>{t("qualification")}</strong> {profile.qualification}</p>
              </div>
              <div className="col-md-6">
                <p><strong>{t("designation")}</strong> {profile.designation}</p>
                <p><strong>{t("subject")}</strong> {profile.subject}</p>
                <p><strong>{t("joining_date")}</strong> {new Date(profile.joining_date).toLocaleDateString()}</p>
                <p><strong>{t("last_updated")}</strong> {new Date(profile.updatedat).toLocaleDateString()}</p>
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
    <ChatWidget />
    </>
  );
}
