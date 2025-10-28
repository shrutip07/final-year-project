import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PrincipalOnboarding() {
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
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.full_name || !form.unit_id || !form.phone || !form.email || !form.qualification) {
      return setError("All required fields must be filled.");
    }
    try {
      await axios.post(
        "http://localhost:5000/api/principal",  // Update the URL to include full path
        { ...form },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/principal/dashboard");
    } catch (err) {
      console.error("Error response:", err.response?.data); // Add this for debugging
      setError(err.response?.data?.error || "Something went wrong.");
    }
  }

  return (
    <div className="container mt-5" style={{ maxWidth: 600 }}>
      <h2 className="mb-4">Principal Onboarding</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Full Name:</label>
          <input className="form-control" name="full_name" value={form.full_name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Phone:</label>
          <input className="form-control" name="phone" value={form.phone} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Email:</label>
          <input className="form-control" name="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Qualification:</label>
          <input className="form-control" name="qualification" value={form.qualification} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">School/Unit ID:</label>
          <input className="form-control" name="unit_id" value={form.unit_id} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label className="form-label">Joining Date:</label>
          <input className="form-control" name="joining_date" value={form.joining_date} onChange={handleChange} placeholder="YYYY-MM-DD" />
        </div>
        <div className="mb-3">
          <label className="form-label">Tenure Start Date:</label>
          <input className="form-control" name="tenure_start_date" value={form.tenure_start_date} onChange={handleChange} placeholder="YYYY-MM-DD" />
        </div>
        <div className="mb-3">
          <label className="form-label">Tenure End Date:</label>
          <input className="form-control" name="tenure_end_date" value={form.tenure_end_date} onChange={handleChange} placeholder="YYYY-MM-DD" />
        </div>
        <div className="mb-3">
          <label className="form-label">Status:</label>
          <select className="form-control" name="status" value={form.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="retired">Retired</option>
            <option value="on-leave">On Leave</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
}
