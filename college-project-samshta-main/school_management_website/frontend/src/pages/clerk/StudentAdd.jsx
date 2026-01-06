import React, { useState } from "react";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import Toolbar from "../../components/admin/Toolbar";
import EmptyState from "../../components/admin/EmptyState";
import TabNavigation from "../../components/admin/TabNavigation";
import ChatWidget from "../../components/ChatWidget";

export default function StudentAdd() {
  const [activeTab, setActiveTab] = useState("add-profile");

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
          ...form,
          roll_number: form.roll_number ? Number(form.roll_number) : null
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to add student");
      }

      setMessage("Student added successfully ✅");
      setForm({
        full_name: "", dob: "", gender: "", address: "", parent_name: "",
        parent_phone: "", admission_date: "", academic_year: "",
        standard: "", division: "", roll_number: ""
      });
      setTimeout(() => setMessage(""), 3000);
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
      [student_id]: { ...(prev[student_id] || {}), [field]: value }
    }));
  }

  async function loadPassedStudents() {
    setStudAllocMsg("");
    setPassedStudents([]);
    if (!studYear) {
      setStudAllocMsg("Enter academic year first.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/clerk/passed-students?academic_year=${encodeURIComponent(studYear)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setPassedStudents(data);
      if (data.length === 0) setStudAllocMsg("No passed students found.");
    } catch (err) {
      setStudAllocMsg(err.message);
    }
  }

  async function handlePromoteStudent(student) {
    const inputs = studAllocInputs[student.student_id] || {};
    if (!inputs.to_academic_year || !inputs.standard || !inputs.division) {
      alert("Missing required fields for promotion.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/clerk/allocate-student-next-year", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          student_id: student.student_id,
          from_academic_year: studYear,
          to_academic_year: inputs.to_academic_year,
          standard: inputs.standard,
          division: inputs.division,
          roll_number: inputs.roll_number ? Number(inputs.roll_number) : null
        })
      });
      if (!res.ok) throw new Error("Promotion failed");
      alert("Promoted successfully ✅");
    } catch (err) {
      alert(err.message);
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
      [staff_id]: { ...(prev[staff_id] || {}), [field]: value }
    }));
  }

  async function loadTeachers() {
    setTeacherMsg("");
    setTeachers([]);
    if (!teacherYear) {
      setTeacherMsg("Enter year first.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `http://localhost:5000/api/clerk/teachers-for-allocation?academic_year=${encodeURIComponent(teacherYear)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setTeachers(data || []);
      if (data.length === 0) setTeacherMsg("No staff found.");
    } catch (err) {
      setTeacherMsg("Failed to load staff.");
    }
  }

  async function handleAllocateTeacher(teacher) {
    const inputs = teacherAllocInputs[teacher.staff_id] || {};
    const ay = inputs.academic_year || teacherYear;
    if (!ay || !inputs.standard || !inputs.division) {
      alert("Missing allocation details.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/clerk/allocate-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          staff_id: teacher.staff_id,
          academic_year: ay,
          standard: inputs.standard,
          division: inputs.division
        })
      });
      if (!res.ok) throw new Error("Allocation failed");
      alert("Staff allocated ✅");
    } catch (err) {
      alert(err.message);
    }
  }

  const studentTabs = [
    { id: "add-profile", label: "Add New Student Profile", icon: "bi-person-plus" },
    { id: "promotion", label: "Annual Promotion", icon: "bi-arrow-up-circle" },
    { id: "allocation", label: "Staff Class Allocation", icon: "bi-people" },
  ];

  return (
    <div className="registration-management-module">
      <div className="section-header-pro mb-3">
        <h3>Student & Staff Registration</h3>
        <p>Enroll new students and manage academic year class allocations</p>
      </div>

      <TabNavigation
        tabs={studentTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="mt-3">
        {activeTab === "add-profile" && (
          <AdminCard header="Add New Student Profile">
            {message && <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} py-2 mb-3 small`}>{message}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">FULL NAME</label>
                  <input name="full_name" className="form-control" value={form.full_name} onChange={handleChange} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-muted">DATE OF BIRTH</label>
                  <input name="dob" type="date" className="form-control" value={form.dob} onChange={handleChange} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-muted">GENDER</label>
                  <select name="gender" className="form-select" value={form.gender} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted">RESIDENTIAL ADDRESS</label>
                  <input name="address" className="form-control" value={form.address} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">PARENT/GUARDIAN NAME</label>
                  <input name="parent_name" className="form-control" value={form.parent_name} onChange={handleChange} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">CONTACT NUMBER</label>
                  <input name="parent_phone" className="form-control" value={form.parent_phone} onChange={handleChange} />
                </div>
              </div>

              <div className="mt-4 p-3 bg-light rounded-3 border">
                <h6 className="fw-bold text-primary mb-3"><i className="bi bi-mortarboard me-2"></i>Initial Enrollment</h6>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label small fw-bold">ACADEMIC YEAR</label>
                    <input name="academic_year" className="form-control form-control-sm" placeholder="2025-26" value={form.academic_year} onChange={handleChange} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-bold">STANDARD</label>
                    <input name="standard" className="form-control form-control-sm" value={form.standard} onChange={handleChange} required />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small fw-bold">DIVISION</label>
                    <input name="division" className="form-control form-control-sm" value={form.division} onChange={handleChange} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small fw-bold">ROLL NO</label>
                    <input name="roll_number" type="number" className="form-control form-control-sm" value={form.roll_number} onChange={handleChange} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small fw-bold">ADMISSION DATE</label>
                    <input name="admission_date" type="date" className="form-control form-control-sm" value={form.admission_date} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary mt-4 px-5 py-2 shadow-sm" disabled={loading}>
                {loading ? "Registering..." : "Create Student Record"}
              </button>
            </form>
          </AdminCard>
        )}

        {activeTab === "promotion" && (
          <AdminCard header="Annual Promotion (Passed Students)">
            <Toolbar
              left={
                <div className="d-flex gap-2">
                  <input
                    className="form-control form-control-sm"
                    placeholder="From Year (e.g. 2024-25)"
                    value={studYear}
                    onChange={(e) => setStudYear(e.target.value)}
                    style={{ width: 200 }}
                  />
                  <button className="btn btn-sm btn-primary" onClick={loadPassedStudents}>Load Directory</button>
                </div>
              }
            />
            {studAllocMsg && <div className="text-muted small mb-3">{studAllocMsg}</div>}
            {passedStudents.length > 0 ? (
              <TableContainer title="">
                <div className="table-responsive professional-table">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Current</th>
                        <th>Next Year</th>
                        <th>Next Std</th>
                        <th>Next Div</th>
                        <th>Roll</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {passedStudents.map((s) => {
                        const inputs = studAllocInputs[s.student_id] || {};
                        return (
                          <tr key={s.student_id}>
                            <td className="fw-bold">{s.full_name}</td>
                            <td><span className="erp-badge badge-year">{s.standard}-{s.division}</span></td>
                            <td><input className="form-control form-control-sm border-primary-subtle" placeholder="2025-26" value={inputs.to_academic_year || ""} onChange={(e) => handleStudAllocInputChange(s.student_id, "to_academic_year", e.target.value)} /></td>
                            <td><input className="form-control form-control-sm border-primary-subtle" style={{width: 80}} value={inputs.standard || ""} onChange={(e) => handleStudAllocInputChange(s.student_id, "standard", e.target.value)} /></td>
                            <td><input className="form-control form-control-sm border-primary-subtle" style={{width: 60}} value={inputs.division || ""} onChange={(e) => handleStudAllocInputChange(s.student_id, "division", e.target.value)} /></td>
                            <td><input className="form-control form-control-sm border-primary-subtle" style={{width: 60}} value={inputs.roll_number || ""} onChange={(e) => handleStudAllocInputChange(s.student_id, "roll_number", e.target.value)} /></td>
                            <td><button className="btn btn-sm btn-success" onClick={() => handlePromoteStudent(s)}>Promote</button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </TableContainer>
            ) : (
              !studAllocMsg && <EmptyState title="No Students" description="Enter academic year and load directory." />
            )}
          </AdminCard>
        )}

        {activeTab === "allocation" && (
          <AdminCard header="Staff Class Allocation">
            <Toolbar
              left={
                <div className="d-flex gap-2">
                  <input
                    className="form-control form-control-sm"
                    placeholder="Year (e.g. 2025-26)"
                    value={teacherYear}
                    onChange={(e) => setTeacherYear(e.target.value)}
                    style={{ width: 200 }}
                  />
                  <button className="btn btn-sm btn-primary" onClick={loadTeachers}>Load Staff</button>
                </div>
              }
            />
            {teacherMsg && <div className="text-muted small mb-3">{teacherMsg}</div>}
            {teachers.length > 0 ? (
              <TableContainer title="">
                <div className="table-responsive professional-table">
                  <table className="table align-middle">
                    <thead>
                      <tr>
                        <th>Teacher Name</th>
                        <th>Current Role</th>
                        <th>Assign Year</th>
                        <th>Std</th>
                        <th>Div</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((t) => {
                        const inputs = teacherAllocInputs[t.staff_id] || {};
                        return (
                          <tr key={t.staff_id}>
                            <td className="fw-bold">{t.full_name}</td>
                            <td><span className="small text-muted">{t.standard ? `${t.standard}-${t.division}` : 'No current assignment'}</span></td>
                            <td><input className="form-control form-control-sm border-primary-subtle" placeholder={teacherYear} value={inputs.academic_year || ""} onChange={(e) => handleTeacherAllocInputChange(t.staff_id, "academic_year", e.target.value)} /></td>
                            <td><input className="form-control form-control-sm border-primary-subtle" style={{width: 80}} value={inputs.standard || ""} onChange={(e) => handleTeacherAllocInputChange(t.staff_id, "standard", e.target.value)} /></td>
                            <td><input className="form-control form-control-sm border-primary-subtle" style={{width: 60}} value={inputs.division || ""} onChange={(e) => handleTeacherAllocInputChange(t.staff_id, "division", e.target.value)} /></td>
                            <td><button className="btn btn-sm btn-primary" onClick={() => handleAllocateTeacher(t)}>Assign</button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </TableContainer>
            ) : (
              !teacherMsg && <EmptyState title="No Staff" description="Enter academic year and load staff list." />
            )}
          </AdminCard>
        )}
      </div>

      <ChatWidget />
    </div>
  );
}
