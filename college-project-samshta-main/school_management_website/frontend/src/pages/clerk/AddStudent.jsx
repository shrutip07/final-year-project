import React, { useState } from "react";
import axios from "axios";
import ChatWidget from "../../components/ChatWidget";

export default function AddStudent() {
  const [form, setForm] = useState({
    full_name: "",
    standard: "",
    division: "",
    dob: "",
    gender: "",
    address: "",
    parent_name: "",
    parent_phone: "",
    admission_date: "",
    unit_id: "",
    academic_year: "",
  });
  const [message, setMessage] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/clerk/students", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Student added!");
      setForm({ ...form, full_name: "", parent_name: "" }); // Reset key fields
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add student");
    }
  }

  return (
    <div>
      <h3>Add New Student</h3>
      <form onSubmit={handleSubmit}>
        <input name="full_name" value={form.full_name} onChange={handleChange} placeholder="Full Name" required />
        <input name="standard" value={form.standard} onChange={handleChange} placeholder="Standard" required />
        <input name="division" value={form.division} onChange={handleChange} placeholder="Division" required />
        <input name="dob" value={form.dob} onChange={handleChange} type="date" placeholder="DOB" />
        <input name="gender" value={form.gender} onChange={handleChange} placeholder="Gender" />
        <input name="address" value={form.address} onChange={handleChange} placeholder="Address" />
        <input name="parent_name" value={form.parent_name} onChange={handleChange} placeholder="Parent Name" />
        <input name="parent_phone" value={form.parent_phone} onChange={handleChange} placeholder="Parent Phone" />
        <input name="admission_date" value={form.admission_date} onChange={handleChange} type="date" placeholder="Admission Date" />
        <input name="unit_id" value={form.unit_id} onChange={handleChange} placeholder="School ID" required />
        <input name="academic_year" value={form.academic_year} onChange={handleChange} placeholder="Academic Year" required />
        <button type="submit">Add Student</button>
      </form>
      {message && <div>{message}</div>}
      <ChatWidget />
    </div>
  );
}
