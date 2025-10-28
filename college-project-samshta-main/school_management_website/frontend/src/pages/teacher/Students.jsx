import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Students() {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalType, setModalType] = useState(""); // "", "view", "edit", "add"
  const [form, setForm] = useState({});
  const [updating, setUpdating] = useState(false);

  // Fetch students on load
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get("http://localhost:5000/api/teacher/students", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setStudents(response.data);
        setFiltered(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError(err.response?.data?.message || "Failed to load students");
        setLoading(false);
      }
    };

    fetchStudents();
  }, [navigate]);

  // Search filter
  function handleSearchChange(e) {
    const val = e.target.value.toLowerCase();
    setSearch(val);
    setFiltered(
      students.filter(
        s =>
          s.full_name.toLowerCase().includes(val) ||
          s.roll_number.toString().includes(val) ||
          s.standard.toLowerCase().includes(val) ||
          s.division.toLowerCase().includes(val)
      )
    );
  }

  // Modal helpers
  function handleView(student) {
    setSelectedStudent(student);
    setModalType("view");
  }

  function handleEdit(student) {
    setSelectedStudent(student);
    setForm(student);
    setModalType("edit");
  }

  function handleAddNew() {
    setForm({
      full_name: "",
      standard: "",
      division: "",
      roll_number: "",
      dob: "",
      gender: "",
      address: "",
      parent_name: "",
      parent_phone: ""
    });
    setModalType("add");
  }

  function closeModal() {
    setSelectedStudent(null);
    setModalType("");
    setForm({});
    setUpdating(false);
  }

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Edit handler
  async function handleUpdate(e) {
    e.preventDefault();
    setUpdating(true);
    const token = localStorage.getItem("token");
    try {
      await axios.put(
        `http://localhost:5000/api/teacher/student/${form.student_id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = students.map(s =>
        s.student_id === form.student_id ? { ...s, ...form } : s
      );
      setStudents(updated);
      setFiltered(updated.filter(
        s =>
          s.full_name.toLowerCase().includes(search) ||
          s.roll_number.toString().includes(search) ||
          s.standard.toLowerCase().includes(search) ||
          s.division.toLowerCase().includes(search)
      ));
      closeModal();
    } catch {
      alert("Failed to update student.");
      setUpdating(false);
    }
  }

  // Add handler
  async function handleAddSubmit(e) {
    e.preventDefault();
    setUpdating(true);
    const token = localStorage.getItem("token");
    try {
      const res = await axios.post(
        "http://localhost:5000/api/teacher/student",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newStudent = res.data.student || res.data;
      const newList = [...students, newStudent];
      setStudents(newList);
      setFiltered(newList.filter(
        s =>
          s.full_name.toLowerCase().includes(search) ||
          s.roll_number.toString().includes(search) ||
          s.standard.toLowerCase().includes(search) ||
          s.division.toLowerCase().includes(search)
      ));
      closeModal();
    } catch {
      alert("Failed to add student.");
      setUpdating(false);
    }
  }

  if (loading) return <div className="mt-3 text-center">Loading students...</div>;
  if (error) return <div className="alert alert-danger mt-3">{error}</div>;

  return (
    <div className="container" style={{ maxWidth: 950 }}>
      <div className="d-flex align-items-center mb-4">
        <button 
          className="btn btn-link"
          onClick={() => navigate('/teacher')}
        >
          <i className="bi bi-arrow-left"></i> Back to Dashboard
        </button>
        <h2 className="mb-0 ms-3">Student Management</h2>
      </div>
      
      <button className="btn btn-success mb-3" onClick={handleAddNew}>
        Add Student
      </button>
      <input
        className="form-control mb-3"
        placeholder="Search by name, roll no, standard, or division"
        value={search}
        onChange={handleSearchChange}
      />
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Roll No</th>
              <th>Full Name</th>
              <th>Standard</th>
              <th>Division</th>
              <th>DOB</th>
              <th>Gender</th>
              <th>Parent Name</th>
              <th>Parent Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(student => (
              <tr key={student.student_id}>
                <td>{student.roll_number}</td>
                <td>{student.full_name}</td>
                <td>{student.standard}</td>
                <td>{student.division}</td>
                <td>{student.dob}</td>
                <td>{student.gender}</td>
                <td>{student.parent_name}</td>
                <td>{student.parent_phone}</td>
                <td>{student.address}</td>
                <td>
                  <button className="btn btn-sm btn-info me-2" onClick={() => handleView(student)}>
                    View
                  </button>
                  <button className="btn btn-sm btn-primary" onClick={() => handleEdit(student)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="10" className="text-center">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View/Edit/Add Modal */}
      {(modalType === "view" || modalType === "edit" || modalType === "add") && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {modalType === "view"
                    ? "Student Details"
                    : modalType === "edit"
                    ? "Edit Student"
                    : "Add Student"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                {modalType === "view" ? (
                  <div>
                    <div><strong>Full Name:</strong> {selectedStudent.full_name}</div>
                    <div><strong>Roll No:</strong> {selectedStudent.roll_number}</div>
                    <div><strong>Standard:</strong> {selectedStudent.standard}</div>
                    <div><strong>Division:</strong> {selectedStudent.division}</div>
                    <div><strong>DOB:</strong> {selectedStudent.dob}</div>
                    <div><strong>Gender:</strong> {selectedStudent.gender}</div>
                    <div><strong>Parent Name:</strong> {selectedStudent.parent_name}</div>
                    <div><strong>Parent Phone:</strong> {selectedStudent.parent_phone}</div>
                    <div><strong>Address:</strong> {selectedStudent.address}</div>
                  </div>
                ) : (
                  <form onSubmit={modalType === "add" ? handleAddSubmit : handleUpdate}>
                    <input
                      type="text"
                      className="form-control mb-2"
                      name="full_name"
                      value={form.full_name}
                      onChange={handleFormChange}
                      placeholder="Full Name"
                      required
                    />
                    <input
                      type="text"
                      className="form-control mb-2"
                      name="standard"
                      value={form.standard}
                      onChange={handleFormChange}
                      placeholder="Standard"
                      required
                    />
                    <input
                      type="text"
                      className="form-control mb-2"
                      name="division"
                      value={form.division}
                      onChange={handleFormChange}
                      placeholder="Division"
                      required
                    />
                    <input
                      type="number"
                      className="form-control mb-2"
                      name="roll_number"
                      value={form.roll_number}
                      onChange={handleFormChange}
                      placeholder="Roll Number"
                      required
                    />
                    <input
                      type="date"
                      className="form-control mb-2"
                      name="dob"
                      value={form.dob}
                      onChange={handleFormChange}
                    />
                    <input
                      type="text"
                      className="form-control mb-2"
                      name="gender"
                      value={form.gender}
                      onChange={handleFormChange}
                      placeholder="Gender"
                      required
                    />
                    <input
                      type="text"
                      className="form-control mb-2"
                      name="parent_name"
                      value={form.parent_name}
                      onChange={handleFormChange}
                      placeholder="Parent Name"
                    />
                    <input
                      type="text"
                      className="form-control mb-2"
                      name="parent_phone"
                      value={form.parent_phone}
                      onChange={handleFormChange}
                      placeholder="Parent Phone"
                    />
                    <input
                      type="text"
                      className="form-control mb-2"
                      name="address"
                      value={form.address}
                      onChange={handleFormChange}
                      placeholder="Address"
                    />
                    <button className="btn btn-primary mt-2" type="submit" disabled={updating}>
                      {updating
                        ? modalType === "add" ? "Adding..." : "Saving..."
                        : modalType === "add" ? "Add" : "Save"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
