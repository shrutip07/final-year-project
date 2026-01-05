// src/pages/teacher/Students.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import ChatWidget from "../../components/ChatWidget";
import TeacherLayout from "../../components/teacher/TeacherLayout";
import AdminCard from "../../components/admin/AdminCard";
import "../teacher/Dashboard.scss";

function getCurrentAcademicYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (month >= 3) {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
}

export default function Students() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentYear = getCurrentAcademicYear();

  const [studentsCurrentYear, setStudentsCurrentYear] = useState([]);
  const [searchCurrentYear, setSearchCurrentYear] = useState("");
  const [modalType, setModalType] = useState("");
  const [form, setForm] = useState({});
  const [updating, setUpdating] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [error, setError] = useState("");
  const [yearFilter, setYearFilter] = useState(currentYear);
  const [allYears, setAllYears] = useState([]);

  // Fetch academic years on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("http://localhost:5000/api/teacher/academic-years", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        const yearsArray = Array.from(res.data || []).sort().reverse();
        setAllYears(yearsArray);
      })
      .catch(() => {});
  }, []);

  // Fetch students of selected year on load and when yearFilter changes
  useEffect(() => {
    fetchStudentsByYear(yearFilter, true);
    // eslint-disable-next-line
  }, [yearFilter]);

  async function fetchStudentsByYear(year, isCurrent) {
    if (isCurrent) setLoadingCurrent(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(
        `http://localhost:5000/api/teacher/students?academic_year=${encodeURIComponent(
          year
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStudentsCurrentYear(response.data);
      setLoadingCurrent(false);
    } catch (err) {
      setError(err.response?.data?.message || t("failed_load_students"));
      setLoadingCurrent(false);
    }
  }

  function handleSearchChange(e) {
    setSearchCurrentYear(e.target.value.toLowerCase());
  }

  function filteredStudents(studentsList, search) {
    if (!search) return studentsList;
    return studentsList.filter(
      (s) =>
        s.full_name.toLowerCase().includes(search) ||
        (s.roll_number && s.roll_number.toString().includes(search)) ||
        (s.standard && s.standard.toLowerCase().includes(search)) ||
        (s.division && s.division.toLowerCase().includes(search))
    );
  }

  function handleView(student) {
    setSelectedStudent(student);
    setModalType("view");
  }

  function handleEdit(student) {
    setSelectedStudent(student);
    setForm({
      student_id: student.student_id || "",
      full_name: student.full_name || "",
      dob: student.dob || "",
      gender: student.gender || "",
      address: student.address || "",
      parent_name: student.parent_name || "",
      parent_phone: student.parent_phone || "",
      admission_date: student.admission_date || "",
      enrollment_id: student.enrollment_id || "",
      standard: student.standard || "",
      division: student.division || "",
      roll_number: student.roll_number || "",
      academic_year: student.academic_year || currentYear,
      passed: typeof student.passed === "boolean" ? student.passed : "",
      percentage: student.percentage || ""
    });
    setModalType("edit");
  }

  function closeModal() {
    setSelectedStudent(null);
    setModalType("");
    setForm({});
    setUpdating(false);
  }

  function handleFormChange(e) {
    const { name, value } = e.target;
    if (name === "passed") {
      setForm({ ...form, passed: value === "" ? "" : value === "true" });
    } else {
      setForm({ ...form, [name]: value });
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();
    setUpdating(true);
    const token = localStorage.getItem("token");
    try {
      let passedValue = null;
      if (form.passed === true || form.passed === false) {
        passedValue = form.passed;
      } else if (form.passed === "true") {
        passedValue = true;
      } else if (form.passed === "false") {
        passedValue = false;
      } else {
        passedValue = null;
      }

      await axios.put(
        `http://localhost:5000/api/teacher/enrollment/${form.enrollment_id}`,
        {
          standard: form.standard,
          division: form.division,
          roll_number: form.roll_number,
          passed: passedValue,
          percentage: form.percentage === "" ? null : Number(form.percentage)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchStudentsByYear(yearFilter, true);
      closeModal();
    } catch {
      alert(t("failed_update_student"));
      setUpdating(false);
    }
  }

  const renderContent = () => {
    if (loadingCurrent) {
      return (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <div className="spinner-grow text-primary" role="status"></div>
          <span className="mt-3 text-muted fw-bold">Loading Students...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="alert alert-custom-danger d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-3 fs-3"></i>
          <div>{error}</div>
        </div>
      );
    }

    const visibleStudents = filteredStudents(studentsCurrentYear, searchCurrentYear);

    return (
      <div className="teacher-main-inner">
        <div className="section-header-pro">
          <h3>Student Management</h3>
          <p>Manage student details and academic performance for {yearFilter}</p>
        </div>

        <AdminCard 
          header={
            <div className="d-flex justify-content-between align-items-center w-100">
              <div className="d-flex align-items-center gap-3">
                <h4 className="mb-0">My Students</h4>
                <span className="badge bg-soft-primary text-primary border-0 rounded-pill px-3">
                  {visibleStudents.length} Students
                </span>
              </div>
              <div className="d-flex gap-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="text-muted small fw-bold">Year:</span>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: '130px' }}
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                  >
                    {allYears.map((year) => (
                      <option value={year} key={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="search-box-pro">
                  <i className="bi bi-search"></i>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search students..."
                    value={searchCurrentYear}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
            </div>
          }
        >
          {visibleStudents.length === 0 ? (
            <div className="empty-state-centered py-5">
              <div className="empty-icon-wrapper mb-3">
                <i className="bi bi-people text-muted"></i>
              </div>
              <h5 className="fw-bold text-dark">No Students Found</h5>
              <p className="text-muted small">No student records match your current filter or search criteria.</p>
            </div>
          ) : (
            <div className="table-responsive professional-table">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Full Name</th>
                    <th>Class</th>
                    <th>Parent Info</th>
                    <th>Results</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleStudents.map((st) => (
                    <tr key={st.enrollment_id || st.student_id}>
                      <td><span className="erp-badge badge-year">{st.roll_number || '-'}</span></td>
                      <td>
                        <div className="fw-bold">{st.full_name}</div>
                        <div className="text-muted small">{st.gender} | {st.dob}</div>
                      </td>
                      <td>
                        <span className="fw-bold text-primary">{st.standard} - {st.division}</span>
                      </td>
                      <td>
                        <div className="small fw-bold">{st.parent_name}</div>
                        <div className="text-muted small">{st.parent_phone}</div>
                      </td>
                      <td>
                        {st.passed !== null ? (
                          <div className="d-flex align-items-center gap-2">
                            <span className={`badge rounded-pill ${st.passed ? 'bg-soft-success text-success' : 'bg-soft-danger text-danger'}`}>
                              {st.passed ? 'PASSED' : 'FAILED'}
                            </span>
                            <span className="fw-bold small">{st.percentage}%</span>
                          </div>
                        ) : (
                          <span className="text-muted small italic">Not Graded</span>
                        )}
                      </td>
                      <td className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <button className="btn btn-light btn-sm rounded-circle" onClick={() => handleView(st)} title="View Details">
                            <i className="bi bi-eye text-primary"></i>
                          </button>
                          <button className="btn btn-light btn-sm rounded-circle" onClick={() => handleEdit(st)} title="Edit Results">
                            <i className="bi bi-pencil-square text-warning"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </AdminCard>
      </div>
    );
  };

  return (
    <TeacherLayout activeSidebarTab="students" customGreeting="Welcome, Teacher 👋">
      <div className="dashboard-wrapper">
        {renderContent()}
      </div>
      <ChatWidget />

      {/* Modern Modal */}
      {(modalType === "view" || modalType === "edit") && (
        <div className="modal-backdrop-pro">
          <div className="modal-content-pro shadow-lg">
            <div className="modal-header-pro">
              <h4>{modalType === "view" ? "Student Profile" : "Edit Academic Results"}</h4>
              <button className="btn-close-pro" onClick={closeModal}>&times;</button>
            </div>
            <div className="modal-body-pro">
              {modalType === "view" ? (
                <div className="student-detail-view">
                  <div className="detail-section">
                    <h6>Personal Information</h6>
                    <div className="detail-grid">
                      <div className="detail-item"><label>Name</label><span>{selectedStudent.full_name}</span></div>
                      <div className="detail-item"><label>DOB</label><span>{selectedStudent.dob}</span></div>
                      <div className="detail-item"><label>Gender</label><span>{selectedStudent.gender}</span></div>
                      <div className="detail-item"><label>Address</label><span>{selectedStudent.address}</span></div>
                    </div>
                  </div>
                  <div className="detail-section mt-4">
                    <h6>Academic & Parent Info</h6>
                    <div className="detail-grid">
                      <div className="detail-item"><label>Roll No</label><span>{selectedStudent.roll_number}</span></div>
                      <div className="detail-item"><label>Class</label><span>{selectedStudent.standard} - {selectedStudent.division}</span></div>
                      <div className="detail-item"><label>Parent</label><span>{selectedStudent.parent_name}</span></div>
                      <div className="detail-item"><label>Contact</label><span>{selectedStudent.parent_phone}</span></div>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="professional-form">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Percentage (%)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        name="percentage"
                        value={form.percentage}
                        onChange={handleFormChange}
                        placeholder="e.g. 85.50"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Result Status</label>
                      <select
                        className="form-select"
                        name="passed"
                        value={form.passed === "" ? "" : form.passed ? "true" : "false"}
                        onChange={handleFormChange}
                      >
                        <option value="">Select Status</option>
                        <option value="true">Passed</option>
                        <option value="false">Failed</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-top d-flex justify-content-end gap-2">
                    <button type="submit" className="btn btn-primary px-4 rounded-pill fw-bold" disabled={updating}>
                      {updating ? 'Saving...' : 'Save Results'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary px-4 rounded-pill fw-bold" onClick={closeModal}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </TeacherLayout>
  );
}
