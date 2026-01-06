import React, { useState } from "react";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import Toolbar from "../../components/admin/Toolbar";
import EmptyState from "../../components/admin/EmptyState";
import TabNavigation from "../../components/admin/TabNavigation";
import PageHeader from "../../components/admin/PageHeader";
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
    <div className="pb-4">
      <PageHeader 
        title="Student & Staff Registration" 
        subtitle="Enroll new students and manage academic year class allocations" 
      />

      <TabNavigation
        tabs={studentTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="mt-3">
        {activeTab === "add-profile" && (
          <AdminCard header="Register New Student">
            {message && (
              <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} py-2 mb-4 small shadow-sm`}>
                {message}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">Full Name</label>
                  <input name="full_name" className="form-control border-primary-subtle" value={form.full_name} onChange={handleChange} required placeholder="Enter student's legal name" />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-muted text-uppercase">Date of Birth</label>
                  <input name="dob" type="date" className="form-control border-primary-subtle" value={form.dob} onChange={handleChange} required />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-bold text-muted text-uppercase">Gender</label>
                  <select name="gender" className="form-select border-primary-subtle" value={form.gender} onChange={handleChange} required>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="col-md-12">
                  <label className="form-label small fw-bold text-muted text-uppercase">Residential Address</label>
                  <input name="address" className="form-control border-primary-subtle" value={form.address} onChange={handleChange} placeholder="House no, Street, City" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">Parent / Guardian Name</label>
                  <input name="parent_name" className="form-control border-primary-subtle" value={form.parent_name} onChange={handleChange} placeholder="Father or Mother's name" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted text-uppercase">Contact Number</label>
                  <input name="parent_phone" className="form-control border-primary-subtle" value={form.parent_phone} onChange={handleChange} placeholder="+91 00000 00000" />
                </div>
              </div>

              <div className="mt-4 p-4 bg-light rounded-4 border shadow-sm">
                <h6 className="fw-bold text-primary mb-4 d-flex align-items-center gap-2">
                  <div className="icon-circle bg-primary text-white" style={{ width: '24px', height: '24px', fontSize: '0.75rem' }}>
                    <i className="bi bi-mortarboard"></i>
                  </div>
                  Academic Enrollment Details
                </h6>
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Academic Year</label>
                    <input name="academic_year" className="form-control border-primary-subtle" placeholder="e.g. 2025-26" value={form.academic_year} onChange={handleChange} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Standard</label>
                    <input name="standard" className="form-control border-primary-subtle" value={form.standard} onChange={handleChange} required placeholder="e.g. 10" />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small fw-bold text-muted text-uppercase">Division</label>
                    <input name="division" className="form-control border-primary-subtle" value={form.division} onChange={handleChange} placeholder="e.g. A" />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small fw-bold text-muted text-uppercase">Roll No</label>
                    <input name="roll_number" type="number" className="form-control border-primary-subtle" value={form.roll_number} onChange={handleChange} />
                  </div>
                  <div className="col-md-2">
                    <label className="form-label small fw-bold text-muted text-uppercase">Admission Date</label>
                    <input name="admission_date" type="date" className="form-control border-primary-subtle" value={form.admission_date} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button type="submit" className="btn btn-primary px-5 py-2 shadow-sm fw-bold" disabled={loading}>
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2"></span>
                  ) : (
                    <i className="bi bi-person-check me-2"></i>
                  )}
                  {loading ? "Registering..." : "Complete Registration"}
                </button>
              </div>
            </form>
          </AdminCard>
        )}

        {activeTab === "promotion" && (
          <AdminCard header="Academic Year Promotion">
            <div className="bg-light p-3 rounded-4 mb-4 border shadow-sm">
              <div className="row align-items-center g-3">
                <div className="col-auto">
                  <span className="fw-bold text-muted small text-uppercase">Source Year:</span>
                </div>
                <div className="col-md-3">
                  <input
                    className="form-control border-primary-subtle"
                    placeholder="e.g. 2024-25"
                    value={studYear}
                    onChange={(e) => setStudYear(e.target.value)}
                  />
                </div>
                <div className="col-auto">
                  <button className="btn btn-primary px-4 fw-bold shadow-sm" onClick={loadPassedStudents}>
                    <i className="bi bi-search me-2"></i>
                    Load Directory
                  </button>
                </div>
              </div>
            </div>

            {studAllocMsg && <div className="alert alert-info py-2 mb-3 small shadow-sm">{studAllocMsg}</div>}
            
            {passedStudents.length > 0 ? (
              <TableContainer title="">
                <div className="table-responsive professional-table">
                  <table className="table align-middle table-hover">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3">STUDENT NAME</th>
                        <th>CURRENT</th>
                        <th>NEXT YEAR</th>
                        <th>NEXT STD</th>
                        <th>NEXT DIV</th>
                        <th>ROLL</th>
                        <th className="text-end pe-3">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {passedStudents.map((s) => {
                        const inputs = studAllocInputs[s.student_id] || {};
                        return (
                          <tr key={s.student_id}>
                            <td className="ps-3">
                              <div className="d-flex align-items-center gap-2">
                                <div className="avatar-circle student" style={{ width: '28px', height: '28px', fontSize: '0.7rem' }}>
                                  {s.full_name?.charAt(0)}
                                </div>
                                <span className="fw-bold text-dark">{s.full_name}</span>
                              </div>
                            </td>
                            <td>
                              <span className="erp-badge badge-year" style={{ fontSize: '0.7rem' }}>
                                STD {s.standard} - {s.division}
                              </span>
                            </td>
                            <td>
                              <input 
                                className="form-control form-control-sm border-primary-subtle" 
                                placeholder="2025-26" 
                                value={inputs.to_academic_year || ""} 
                                onChange={(e) => handleStudAllocInputChange(s.student_id, "to_academic_year", e.target.value)} 
                                style={{ maxWidth: '100px' }}
                              />
                            </td>
                            <td>
                              <input 
                                className="form-control form-control-sm border-primary-subtle" 
                                style={{ width: 60 }} 
                                value={inputs.standard || ""} 
                                onChange={(e) => handleStudAllocInputChange(s.student_id, "standard", e.target.value)} 
                              />
                            </td>
                            <td>
                              <input 
                                className="form-control form-control-sm border-primary-subtle" 
                                style={{ width: 50 }} 
                                value={inputs.division || ""} 
                                onChange={(e) => handleStudAllocInputChange(s.student_id, "division", e.target.value)} 
                              />
                            </td>
                            <td>
                              <input 
                                className="form-control form-control-sm border-primary-subtle" 
                                style={{ width: 50 }} 
                                value={inputs.roll_number || ""} 
                                onChange={(e) => handleStudAllocInputChange(s.student_id, "roll_number", e.target.value)} 
                              />
                            </td>
                            <td className="text-end pe-3">
                              <button className="btn btn-sm btn-success fw-bold px-3 shadow-sm" onClick={() => handlePromoteStudent(s)}>
                                Promote
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </TableContainer>
            ) : (
              !studAllocMsg && <EmptyState title="No Records" description="Enter the source academic year and load the directory to begin promotion." />
            )}
          </AdminCard>
        )}

        {activeTab === "allocation" && (
          <AdminCard header="Faculty Assignment Management">
            <div className="bg-light p-3 rounded-4 mb-4 border shadow-sm">
              <div className="row align-items-center g-3">
                <div className="col-auto">
                  <span className="fw-bold text-muted small text-uppercase">Target Year:</span>
                </div>
                <div className="col-md-3">
                  <input
                    className="form-control border-primary-subtle"
                    placeholder="e.g. 2025-26"
                    value={teacherYear}
                    onChange={(e) => setTeacherYear(e.target.value)}
                  />
                </div>
                <div className="col-auto">
                  <button className="btn btn-primary px-4 fw-bold shadow-sm" onClick={loadTeachers}>
                    <i className="bi bi-people me-2"></i>
                    Fetch Staff List
                  </button>
                </div>
              </div>
            </div>

            {teacherMsg && <div className="alert alert-info py-2 mb-3 small shadow-sm">{teacherMsg}</div>}

            {teachers.length > 0 ? (
              <TableContainer title="">
                <div className="table-responsive professional-table">
                  <table className="table align-middle table-hover">
                    <thead className="table-light">
                      <tr>
                        <th className="ps-3">STAFF NAME</th>
                        <th>CURRENT ROLE</th>
                        <th>TARGET YEAR</th>
                        <th>STD</th>
                        <th>DIV</th>
                        <th className="text-end pe-3">ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {teachers.map((t) => {
                        const inputs = teacherAllocInputs[t.staff_id] || {};
                        return (
                          <tr key={t.staff_id}>
                            <td className="ps-3">
                              <div className="d-flex align-items-center gap-2">
                                <div className="avatar-circle teacher" style={{ width: '28px', height: '28px', fontSize: '0.7rem' }}>
                                  {t.full_name?.charAt(0)}
                                </div>
                                <span className="fw-bold text-dark">{t.full_name}</span>
                              </div>
                            </td>
                            <td>
                              <span className="small text-muted fw-medium">
                                {t.standard ? (
                                  <span className="badge bg-soft-info text-info">
                                    {t.standard} - {t.division}
                                  </span>
                                ) : (
                                  "Unassigned"
                                )}
                              </span>
                            </td>
                            <td>
                              <input 
                                className="form-control form-control-sm border-primary-subtle" 
                                placeholder={teacherYear} 
                                value={inputs.academic_year || ""} 
                                onChange={(e) => handleTeacherAllocInputChange(t.staff_id, "academic_year", e.target.value)} 
                                style={{ maxWidth: '100px' }}
                              />
                            </td>
                            <td>
                              <input 
                                className="form-control form-control-sm border-primary-subtle" 
                                style={{ width: 60 }} 
                                value={inputs.standard || ""} 
                                onChange={(e) => handleTeacherAllocInputChange(t.staff_id, "standard", e.target.value)} 
                              />
                            </td>
                            <td>
                              <input 
                                className="form-control form-control-sm border-primary-subtle" 
                                style={{ width: 50 }} 
                                value={inputs.division || ""} 
                                onChange={(e) => handleTeacherAllocInputChange(t.staff_id, "division", e.target.value)} 
                              />
                            </td>
                            <td className="text-end pe-3">
                              <button className="btn btn-sm btn-primary fw-bold px-3 shadow-sm" onClick={() => handleAllocateTeacher(t)}>
                                Assign Role
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </TableContainer>
            ) : (
              !teacherMsg && <EmptyState title="No Staff Data" description="Select the target academic year and fetch the staff list to manage class allocations." />
            )}
          </AdminCard>
        )}
      </div>

      <ChatWidget />
    </div>
  );
}
