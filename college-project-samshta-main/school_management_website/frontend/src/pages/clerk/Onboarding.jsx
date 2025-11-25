// import React, { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// export default function ClerkOnboarding() {
//   const [form, setForm] = useState({
//     full_name: "",
//     phone: "",
//     email: "",
//     qualification: "",
//     joining_date: "",
//     retirement_date: "",
//     status: "active",
//     address: "",
//     gender: ""
//   });
//   const [error, setError] = useState("");
//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();

//   function handleChange(e) {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");
//     try {
//       const response = await axios.post(
//         "http://localhost:5000/api/clerk/onboard",
//         form,
//         { headers: { Authorization: `Bearer ${token}` } }
//       );
//       if (response.data?.success) {
//         navigate("/clerk", { replace: true });
//       } else {
//         setError("Onboarding failed");
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to save details");
//     }
//   }

//   return (
//     <div style={{ maxWidth: 600, margin: "auto" }}>
//       <h2>Clerk Onboarding</h2>
//       {error && <div style={{ color: "red" }}>{error}</div>}
//       <form onSubmit={handleSubmit}>
//         <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Full Name" required />
//         <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required />
//         <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required />
//         <input name="qualification" value={form.qualification} onChange={handleChange} placeholder="Qualification" required />
//         <input name="joining_date" type="date" value={form.joining_date} onChange={handleChange} required />
//         <input name="retirement_date" type="date" value={form.retirement_date} onChange={handleChange} />
//         <input name="address" value={form.address} onChange={handleChange} placeholder="Address" required />
//         <input name="gender" value={form.gender} onChange={handleChange} placeholder="Gender" required />
//         <select name="status" value={form.status} onChange={handleChange}>
//           <option value="active">Active</option>
//           <option value="retired">Retired</option>
//         </select>
//         <button type="submit">Save</button>
//       </form>
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ClerkOnboarding() {
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    qualification: "",
    joining_date: "",
    retirement_date: "",
    status: "active",
    address: "",
    gender: "",
    unit_id: ""  // Add unit_id to form state
  });
  const [error, setError] = useState("");
  const [units, setUnits] = useState([]); // List of available school units
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch available units when component mounts
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/units", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnits(res.data.units || []);
      } catch (err) {
        setUnits([]);
      }
    };
    fetchUnits();
  }, [token]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.unit_id) {
      setError("Please select a school unit.");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:5000/api/clerk/onboard",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.success) {
        navigate("/clerk", { replace: true });
      } else {
        setError("Onboarding failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save details");
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <h2>Clerk Onboarding</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Full Name" required />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" type="email" required />
        <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone" required />
        <input name="qualification" value={form.qualification} onChange={handleChange} placeholder="Qualification" required />
        <input name="joining_date" type="date" value={form.joining_date} onChange={handleChange} required />
        <input name="retirement_date" type="date" value={form.retirement_date} onChange={handleChange} />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" required />
        <input name="gender" value={form.gender} onChange={handleChange} placeholder="Gender" required />
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="active">Active</option>
          <option value="retired">Retired</option>
        </select>
        {/* Add unit selector */}
        <select name="unit_id" value={form.unit_id} onChange={handleChange} required>
          <option value="">Select School Unit</option>
          {units.map(u => (
            <option key={u.unit_id} value={u.unit_id}>{u.unit_name}</option>
          ))}
        </select>
        <button type="submit">Save</button>
      </form>
    </div>
  );
}
