// src/pages/clerk/StudentAdd.jsx
import React, { useState } from "react";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import Toolbar from "../../components/admin/Toolbar";

export default function StudentAdd() {
  // ---------------- ADD NEW STUDENT ----------------
  const [form, setForm] = useState({
    full_name: "",
    dob: "",
    gender: "",
    address: "",
    parent_name: "",
    parent_phone: "",
    admission_date: "",
    academic_year: "",
    standard: "",
    division: "",
    roll_number: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/clerk/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: form.full_name,
          dob: form.dob,
          gender: form.gender,
          address: form.address || null,
          parent_name: form.parent_name || null,
          parent_phone: form.parent_phone || null,
          admission_date: form.admission_date || null,
          academic_year: form.academic_year,
          standard: form.standard,
          division: form.division || null,
          roll_number: form.roll_number ? Number(form.roll_number) : null
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to add student");
      }

      setMessage("Student added successfully ✅");
      setForm({
        full_name: "",
        dob: "",
        gender: "",
        address: "",
        parent_name: "",
        parent_phone: "",
        admission_date: "",
        academic_year: "",
        standard: "",
        division: "",
        roll_number: ""
      });
    } catch (err) {
      setMessage(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // ---------------- ALLOCATE STUDENTS (PROMOTION) ----------------
  const [studYear, setStudYear] = useState("");
  const [passedStudents, setPassedStudents] = useState([]);
  const [studAllocMsg, setStudAllocMsg] = useState("");
  const [studAllocInputs, setStudAllocInputs] = useState({});

  function handleStudAllocInputChange(student_id, field, value) {
    setStudAllocInputs((prev) => ({
      ...prev,
      [student_id]: {
        ...(prev[student_id] || {}),
        [field]: value
      }
    }));
  }

  async function loadPassedStudents() {
    setStudAllocMsg("");
    setPassedStudents([]);
    if (!studYear) {
      setStudAllocMsg("Please enter academic year to load passed students.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/clerk/passed-students?academic_year=${encodeURIComponent(
          studYear
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load passed students.");
      }
      setPassedStudents(data);
      if (data.length === 0) {
        setStudAllocMsg("No passed students found for this year.");
      }
    } catch (err) {
      setStudAllocMsg(err.message || "Failed to load passed students.");
    }
  }

  async function handlePromoteStudent(student) {
    const inputs = studAllocInputs[student.student_id] || {};
    const to_academic_year = inputs.to_academic_year;
    const standard = inputs.standard;
    const division = inputs.division;
    const roll_number = inputs.roll_number;

    if (!to_academic_year || !standard || !division) {
      alert("Enter next academic year, standard and division.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:5000/api/clerk/allocate-student-next-year",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            student_id: student.student_id,
            from_academic_year: studYear,
            to_academic_year,
            standard,
            division,
            roll_number: roll_number ? Number(roll_number) : null
          })
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to allocate student.");
      }
      alert("Student promoted successfully ✅");
    } catch (err) {
      alert(err.message || "Failed to allocate student.");
    }
  }

  // ---------------- ALLOCATE TEACHERS ----------------
  const [teacherYear, setTeacherYear] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [teacherMsg, setTeacherMsg] = useState("");
  const [teacherAllocInputs, setTeacherAllocInputs] = useState({});

  function handleTeacherAllocInputChange(staff_id, field, value) {
    setTeacherAllocInputs((prev) => ({
      ...prev,
      [staff_id]: {
        ...(prev[staff_id] || {}),
        [field]: value
      }
    }));
  }

  async function loadTeachers() {
    setTeacherMsg("");
    setTeachers([]);
    if (!teacherYear) {
      setTeacherMsg("Please enter academic year to load teachers.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/clerk/teachers-for-allocation?academic_year=${encodeURIComponent(
          teacherYear
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load teachers.");
      }
      setTeachers(data);
      if (data.length === 0) {
        setTeacherMsg("No teachers found for this year.");
      }
    } catch (err) {
      setTeacherMsg(err.message || "Failed to load teachers.");
    }
  }

  async function handleAllocateTeacher(teacher) {
    const inputs = teacherAllocInputs[teacher.staff_id] || {};
    const academic_year = inputs.academic_year || teacherYear;
    const standard = inputs.standard;
    const division = inputs.division;

    if (!academic_year || !standard || !division) {
      alert("Enter academic year, standard and division for this teacher.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        "http://localhost:5000/api/clerk/allocate-teacher",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            staff_id: teacher.staff_id,
            academic_year,
            standard,
            division
          })
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to allocate teacher.");
      }
      alert("Teacher class allocation saved ✅");
    } catch (err) {
      alert(err.message || "Failed to allocate teacher.");
    }
  }

  return (
    <div className="clerk-student-add-page">
      <div className="section-header-pro">
        <h3>Admission & Allocation</h3>
        <p>Register new students and manage class promotions/allocations</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-12">
          <AdminCard header="Register New Student">
            {message && <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-info'} py-2 mb-3 small`}>{message}</div>}
            <form onSubmit={handleSubmit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">FULL NAME *</label>
                <input type="text" name="full_name" className="form-control" value={form.full_name} onChange={handleChange} required />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold text-muted">DATE OF BIRTH *</label>
                <input type="date" name="dob" className="form-control" value={form.dob} onChange={handleChange} required />
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold text-muted">GENDER *</label>
                <select name="gender" className="form-select" value={form.gender} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-md-12">
                <label className="form-label small fw-bold text-muted">ADDRESS</label>
                <textarea name="address" className="form-control" rows={2} value={form.address} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">PARENT NAME</label>
                <input type="text" name="parent_name" className="form-control" value={form.parent_name} onChange={handleChange} />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">PARENT PHONE</label>
                <input type="text" name="parent_phone" className="form-control" value={form.parent_phone} onChange={handleChange} />
              </div>
              <div className="col-12 mt-4">
                <h6 className="text-navy fw-bold border-bottom pb-2 mb-3">Initial Enrollment Information</h6>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-muted">ACADEMIC YEAR *</label>
                    <input type="text" name="academic_year" className="form-control" placeholder="2024-25" value={form.academic_year} onChange={handleChange} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-muted">STANDARD *</label>
                    <input type="text" name="standard" className="form-control" placeholder="e.g. 1" value={form.standard} onChange={handleChange} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-muted">DIVISION</label>
                    <input type="text" name="division" className="form-control" placeholder="A, B, C" value={form.division} onChange={handleChange} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-muted">ROLL NUMBER</label>
                    <input type="number" name="roll_number" className="form-control" value={form.roll_number} onChange={handleChange} />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-muted">ADMISSION DATE</label>
                    <input type="date" name="admission_date" className="form-control" value={form.admission_date} onChange={handleChange} />
                  </div>
                </div>
              </div>
              <div className="col-12 pt-3">
                <button type="submit" className="btn btn-navy px-5" disabled={loading}>
                  {loading ? "Registering..." : "Add Student to Records"}
                </button>
              </div>
            </form>
          </AdminCard>
        </div>

        <div className="col-lg-12">
          <AdminCard>
            <TableContainer 
              title="Student Promotion Registry"
              toolbar={
                <Toolbar 
                  left={
                    <div className="d-flex gap-2">
                      <input type="text" className="form-select form-select-sm" placeholder="From Year (2024-25)" value={studYear} onChange={(e) => setStudYear(e.target.value)} style={{ width: 180 }} />
                      <button className="btn btn-sm btn-navy" onClick={loadPassedStudents}>Load Passed Students</button>
                    </div>
                  }
                  right={<div className="text-muted small">Showing passed students ready for promotion</div>}
                />
              }
            >
              {studAllocMsg && <div className="text-muted small p-3">{studAllocMsg}</div>}
              {passedStudents.length > 0 && (
                <div className="table-responsive professional-table">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Current Class</th>
                        <th>Target Year</th>
                        <th>Target Std</th>
                        <th>Target Div</th>
                        <th>Roll No</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {passedStudents.map((s) => {
                        const inputs = studAllocInputs[s.student_id] || {};
                        return (
                          <tr key={s.student_id}>
                            <td>
                              <div className="fw-bold">{s.full_name}</div>
                              <div className="text-muted small">{s.parent_phone}</div>
                            </td>
                            <td><span className="erp-badge badge-year">{s.standard} ({s.division || "N/A"})</span></td>
                            <td><input className="form-control form-control-sm" placeholder="2025-26" value={inputs.to_academic_year || ""} onChange={(e) => handleStudAllocInputChange(s.student_id, "to_academic_year", e.target.value)} style={{ width: 100 }} /></td>
                            <td><input className="form-control form-control-sm" placeholder="Std" value={inputs.standard || ""} onChange={(e) => handleStudAllocInputChange(s.student_id, "standard", e.target.value)} style={{ width: 60 }} /></td>
                            <td><input className="form-control form-control-sm" placeholder="Div" value={inputs.division || ""} onChange={(e) => handleStudAllocInputChange(s.student_id, "division", e.target.value)} style={{ width: 60 }} /></td>
                            <td><input type="number" className="form-control form-control-sm" placeholder="Roll" value={inputs.roll_number || ""} onChange={(e) => handleStudAllocInputChange(s.student_id, "roll_number", e.target.value)} style={{ width: 60 }} /></td>
                            <td className="text-end"><button className="btn btn-sm btn-success px-3" onClick={() => handlePromoteStudent(s)}>Promote</button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </TableContainer>
          </AdminCard>
        </div>

        <div className="col-lg-12">
          <AdminCard>
            <TableContainer 
              title="Teacher Class Allocation"
              toolbar={
                <Toolbar 
                  left={
                    <div className="d-flex gap-2">
                      <input type="text" className="form-select form-select-sm" placeholder="Academic Year" value={teacherYear} onChange={(e) => setTeacherYear(e.target.value)} style={{ width: 180 }} />
                      <button className="btn btn-sm btn-navy" onClick={loadTeachers}>Load Teachers</button>
                    </div>
                  }
                  right={<div className="text-muted small">Manage teacher assignments per academic cycle</div>}
                />
              }
            >
              {teacherMsg && <div className="text-muted small p-3">{teacherMsg}</div>}
              {teachers.length > 0 && (
                <div className="table-responsive professional-table">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Teacher</th>
                        <th>Active Assignment</th>
                        <th>Target Std</th>
                        <th>Target Div</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((t) => {
                        const inputs = teacherAllocInputs[t.staff_id] || {};
                        return (
                          <tr key={t.staff_id}>
                            <td>
                              <div className="fw-bold">{t.full_name}</div>
                              <div className="text-muted small">{t.subject || "No subject assigned"}</div>
                            </td>
                            <td>
                              {t.standard ? (
                                <span className="erp-badge badge-designation">{t.standard} ({t.division || "N/A"})</span>
                              ) : (
                                <span className="text-muted small">No allocation</span>
                              )}
                            </td>
                            <td><input className="form-control form-control-sm" placeholder="Std" value={inputs.standard || ""} onChange={(e) => handleTeacherAllocInputChange(t.staff_id, "standard", e.target.value)} style={{ width: 60 }} /></td>
                            <td><input className="form-control form-control-sm" placeholder="Div" value={inputs.division || ""} onChange={(e) => handleTeacherAllocInputChange(t.staff_id, "division", e.target.value)} style={{ width: 60 }} /></td>
                            <td className="text-end"><button className="btn btn-sm btn-primary px-3" onClick={() => handleAllocateTeacher(t)}>Save Allocation</button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </TableContainer>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
