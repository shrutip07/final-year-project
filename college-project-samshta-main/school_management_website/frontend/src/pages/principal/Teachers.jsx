import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/principal/teachers", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setTeachers(response.data);
        setFiltered(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching teachers:", err);
        setError(err.response?.data?.message || "Failed to load teachers");
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  function handleSearchChange(e) {
    const val = e.target.value.toLowerCase();
    setSearch(val);
    setFiltered(
      teachers.filter(
        t =>
          t.full_name.toLowerCase().includes(val) ||
          (t.email && t.email.toLowerCase().includes(val)) ||
          (t.subject && t.subject.toLowerCase().includes(val)) ||
          (t.designation && t.designation.toLowerCase().includes(val)) ||
          (t.phone && t.phone.toLowerCase().includes(val))
      )
    );
  }

  if (loading) return <div className="mt-3 text-center">Loading teachers...</div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4">Teachers Directory</h2>
      <input
        className="form-control mb-3"
        placeholder="Search by name, email, phone, subject, or designation"
        value={search}
        onChange={handleSearchChange}
      />
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Qualification</th>
              <th>Designation</th>
              <th>Subject</th>
              <th>Joining Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(teacher => (
              <tr key={teacher.staff_id}>
                <td>{teacher.full_name}</td>
                <td>{teacher.email}</td>
                <td>{teacher.phone || "-"}</td>
                <td>{teacher.qualification}</td>
                <td>{teacher.designation}</td>
                <td>{teacher.subject || "-"}</td>
                <td>{teacher.joining_date ? new Date(teacher.joining_date).toLocaleDateString() : "-"}</td>
                <td>
                  <span className={`badge ${teacher.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                    {teacher.status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center">
                  No teachers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
