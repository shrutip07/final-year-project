// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function PrincipalOnboarding() {
//   const [units, setUnits] = useState([]);
//   const [form, setForm] = useState({
//     full_name: "",
//     phone: "",
//     email: "",
//     qualification: "",
//     unit_id: "",
//     joining_date: "",
//     tenure_start_date: "",
//     tenure_end_date: "",
//     status: "active"
//   });
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(true);
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();

//   useEffect(() => {
//     async function fetchUnits() {
//       try {
//         // If you have a principal/units endpoint, use that
//         const res = await axios.get("http://localhost:5000/api/teacher/units", {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         setUnits(res.data);
//         setLoading(false);
//       } catch {
//         setUnits([]);
//         setLoading(false);
//         setError("Failed to load schools for selection.");
//       }
//     }
//     fetchUnits();
//   }, [token]);

//   function handleChange(e) {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   }

//   // Redirect if not logged in
//   useEffect(() => {
//     if (!token) navigate("/");
//   }, [token, navigate]);

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");
//     // Basic validation
//     if (!form.full_name || !form.unit_id || !form.phone || !form.email || !form.qualification) {
//       return setError("All fields are required.");
//     }
//     try {
//       const response = await axios.post(
//         "http://localhost:5000/api/principal/onboard",
//         { ...form },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       if (response.data?.success) {
//         navigate("/principal", { replace: true });
//       } else {
//         setError("Onboarding failed, please try again.");
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to complete onboarding.");
//     }
//   }

//   if (loading) return <div className="text-center mt-5">Loading...</div>;

//   return (
//     <div className="container mt-5" style={{ maxWidth: 600 }}>
//       <h2 className="mb-4">Principal Onboarding</h2>
//       {error && <div className="alert alert-danger">{error}</div>}
//       <form onSubmit={handleSubmit}>
//         <div className="mb-3">
//           <label className="form-label">Full Name:</label>
//           <input className="form-control" name="full_name" value={form.full_name} onChange={handleChange} required />
//         </div>
//         <div className="mb-3">
//           <label className="form-label">Email:</label>
//           <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} required />
//         </div>
//         <div className="mb-3">
//           <label className="form-label">Phone:</label>
//           <input className="form-control" name="phone" value={form.phone} onChange={handleChange} pattern="[0-9]{10}" required />
//         </div>
//         <div className="mb-3">
//           <label className="form-label">Qualification:</label>
//           <input className="form-control" name="qualification" value={form.qualification} onChange={handleChange} required />
//         </div>
//         <div className="mb-3">
//           <label className="form-label">Select School/Unit:</label>
//           <select className="form-select" name="unit_id" value={form.unit_id} onChange={handleChange} required>
//             <option value="">Select...</option>
//             {units.map(unit => (
//               <option key={unit.unit_id} value={unit.unit_id}>
//                 {unit.kendrashala_name || unit.unit_name} ({unit.semis_no || unit.unit_id})
//               </option>
//             ))}
//           </select>
//         </div>
//         <div className="mb-3">
//           <label className="form-label">Joining Date:</label>
//           <input className="form-control" name="joining_date" type="date" value={form.joining_date} onChange={handleChange} />
//         </div>
//         <div className="mb-3">
//           <label className="form-label">Tenure Start Date:</label>
//           <input className="form-control" name="tenure_start_date" type="date" value={form.tenure_start_date} onChange={handleChange} />
//         </div>
//         <div className="mb-3">
//           <label className="form-label">Tenure End Date:</label>
//           <input className="form-control" name="tenure_end_date" type="date" value={form.tenure_end_date} onChange={handleChange} />
//         </div>
//         <div className="mb-3">
//           <label className="form-label">Status:</label>
//           <select className="form-control" name="status" value={form.status} onChange={handleChange}>
//             <option value="active">Active</option>
//             <option value="retired">Retired</option>
//             <option value="on-leave">On Leave</option>
//           </select>
//         </div>
//         <button type="submit" className="btn btn-primary">Submit</button>
//       </form>
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function PrincipalOnboarding() {
  const { t } = useTranslation();
  const [units, setUnits] = useState([]);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    qualification: "",
    unit_id: "",
    joining_date: "",
    tenure_start_date: "",
    tenure_end_date: "",
    status: "active"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchUnits() {
      try {
        const res = await axios.get("http://localhost:5000/api/teacher/units", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnits(res.data);
        setLoading(false);
      } catch {
        setUnits([]);
        setLoading(false);
        setError(t("failed_load_units"));
      }
    }
    fetchUnits();
    // eslint-disable-next-line
  }, [token, t]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  useEffect(() => {
    if (!token) navigate("/");
  }, [token, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.full_name || !form.unit_id || !form.phone || !form.email || !form.qualification) {
      return setError(t("all_fields_required"));
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/principal/onboard",
        { ...form },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.success) {
        navigate("/principal", { replace: true });
      } else {
        setError(t("onboarding_failed"));
      }
    } catch (err) {
      setError(err.response?.data?.message || t("onboarding_failed_default"));
    }
  }

  if (loading) return <div className="text-center mt-5">{t("loading")}...</div>;

  return (
    <div className="container mt-5" style={{ maxWidth: 600 }}>
      <h2 className="mb-4">{t("principal_onboarding")}</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">{t("full_name")}</label>
          <input className="form-control" name="full_name" value={form.full_name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">{t("email")}</label>
          <input className="form-control" type="email" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">{t("phone")}</label>
          <input className="form-control" name="phone" value={form.phone} onChange={handleChange} pattern="[0-9]{10}" required />
        </div>
        <div className="mb-3">
          <label className="form-label">{t("qualification")}</label>
          <input className="form-control" name="qualification" value={form.qualification} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">{t("select_school")}</label>
          <select className="form-select" name="unit_id" value={form.unit_id} onChange={handleChange} required>
            <option value="">{t("select_option")}</option>
            {units.map(unit => (
              <option key={unit.unit_id} value={unit.unit_id}>
                {unit.kendrashala_name || unit.unit_name} ({unit.semis_no || unit.unit_id})
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">{t("joining_date")}</label>
          <input className="form-control" name="joining_date" type="date" value={form.joining_date} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">{t("tenure_start_date")}</label>
          <input className="form-control" name="tenure_start_date" type="date" value={form.tenure_start_date} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">{t("tenure_end_date")}</label>
          <input className="form-control" name="tenure_end_date" type="date" value={form.tenure_end_date} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label className="form-label">{t("status")}</label>
          <select className="form-control" name="status" value={form.status} onChange={handleChange}>
            <option value="active">{t("active")}</option>
            <option value="retired">{t("retired")}</option>
            <option value="on-leave">{t("on_leave")}</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">{t("submit")}</button>
      </form>
    </div>
  );
}
