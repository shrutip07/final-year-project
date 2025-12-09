// src/pages/teacher/Students.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";

import ChatWidget from "../../components/ChatWidget";
import EmptyState from "../../components/admin/EmptyState";
import "./Dashboard.scss";

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

  // sidebar active tab
  const [activeTab, setActiveTab] = useState("students");

  const sidebarItems = [
    { key: "dashboard", label: t("dashboard", "Dashboard"), icon: "bi-speedometer2" },
    { key: "profile", label: t("profile", "Profile"), icon: "bi-person" },
    { key: "students", label: t("students", "Students"), icon: "bi-people" },
    { key: "charts", label: t("charts", "Charts"), icon: "bi-bar-chart" },
    { key: "notifications", label: t("notifications", "Notifications"), icon: "bi-bell" }
  ];

  const handleSidebarClick = (key) => {
    setActiveTab(key);
    switch (key) {
      case "dashboard":
        navigate("/teacher");
        break;
      case "profile":
        navigate("/teacher/profile");
        break;
      case "students":
        navigate("/teacher/students");
        break;
      case "charts":
        navigate("/teacher/charts");
        break;
      case "notifications":
        navigate("/teacher/notifications");
        break;
      default:
        break;
    }
  };

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

  // Modal open functions
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

  // ----- MAIN CONTENT -----
  const renderMainContent = () => {
    if (loadingCurrent) {
      return (
        <div className="loading-state">{t("loading_students")}...</div>
      );
    }

    if (error) {
      return <div className="error-state">{error}</div>;
    }

    const visibleStudents = filteredStudents(
      studentsCurrentYear,
      searchCurrentYear
    );

    return (
      <>
        {/* Header with subtitle */}
        <div className="page-header page-header-tight">
          <div>
            <h2>
              {t("student_management", "Student Management")} - {yearFilter}
            </h2>
            <div className="page-subtitle">
              {t(
                "student_management_subtitle",
                "Manage student details for your assigned classes."
              )}
            </div>
          </div>
        </div>

        {/* Main card */}
        <div className="teacher-students-card">
          <div className="card-header">
            <h3>{t("students")}</h3>
            <span className="students-count-badge">
              {visibleStudents.length} {t("students_label", "students")}
            </span>
          </div>

          <div className="card-body">
            {/* Filter row: Academic Year + Search */}
            <div className="students-filter-row">
              <div className="filter-group">
                <label className="form-label">
                  {t("academic_year", "Academic Year")}
                </label>
                <select
                  className="form-control"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                >
                  {allYears.length === 0 && (
                    <option value="">{t("loading")}</option>
                  )}
                  {allYears.map((year) => (
                    <option value={year} key={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group filter-group-search">
                <label className="form-label">
                  {t("search", "Search")}
                </label>
                <input
                  className="form-control"
                  placeholder={t(
                    "search_placeholder",
                    "Search by name, roll no, standard, or division"
                  )}
                  value={searchCurrentYear}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="teacher-students-table">
                <thead>
                  <tr>
                    <th>{t("roll_no")}</th>
                    <th>{t("full_name")}</th>
                    <th>{t("standard")}</th>
                    <th>{t("division")}</th>
                    <th>{t("dob")}</th>
                    <th>{t("gender")}</th>
                    <th>{t("parent_name")}</th>
                    <th>{t("parent_phone")}</th>
                    <th>{t("address")}</th>
                    <th>{t("admission_date")}</th>
                    <th>{t("percentage")}</th>
                    <th>{t("passed")}</th>
                    <th>{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleStudents.map((st) => (
                    <tr
                      key={
                        st.enrollment_id ||
                        st.student_id + "-" + st.academic_year
                      }
                    >
                      <td>{st.roll_number || ""}</td>
                      <td>{st.full_name || ""}</td>
                      <td>{st.standard || ""}</td>
                      <td>{st.division || ""}</td>
                      <td>{st.dob || ""}</td>
                      <td>{st.gender || ""}</td>
                      <td>{st.parent_name || ""}</td>
                      <td>{st.parent_phone || ""}</td>
                      <td>{st.address || ""}</td>
                      <td>{st.admission_date || ""}</td>
                      <td>{st.percentage ?? ""}</td>
                      <td>
                        {st.passed === true ? (
                          <span className="badge-soft badge-soft-success">
                            {t("yes")}
                          </span>
                        ) : st.passed === false ? (
                          <span className="badge-soft badge-soft-danger">
                            {t("no")}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>
                        <div className="students-actions">
                          <button
                            type="button"
                            className="students-action-btn"
                            onClick={() => handleView(st)}
                          >
                            <i className="bi bi-eye" />
                            <span>{t("view")}</span>
                          </button>
                          <button
                            type="button"
                            className="students-action-btn"
                            onClick={() => handleEdit(st)}
                          >
                            <i className="bi bi-pencil-square" />
                            <span>{t("edit")}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {visibleStudents.length === 0 && (
                    <tr>
                      <td colSpan="13" style={{ padding: "24px 0" }}>
                        <EmptyState
                          icon="🎓"
                          title={t("no_students_found", "No students found")}
                          description={t(
                            "no_students_year",
                            "No students found for this academic year."
                          )}
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    );
  };

  // ----- LAYOUT WITH SIDEBAR -----
  return (
    <div className="teacher-dashboard-container">
      {/* Sidebar – same as other teacher pages */}
      <aside className="teacher-sidebar">
        <div className="teacher-sidebar-header">
          <div className="teacher-sidebar-icon">
            <i className="bi bi-person-workspace" />
          </div>
          <h3>{t("teacher_portal", "Teacher Portal")}</h3>
        </div>

        <div className="teacher-sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              className={`teacher-nav-link ${
                activeTab === item.key ? "active" : ""
              }`}
              onClick={() => handleSidebarClick(item.key)}
              type="button"
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="teacher-sidebar-footer">
          <button
            className="teacher-nav-link logout-btn"
            type="button"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            <i className="bi bi-box-arrow-left" />
            <span>{t("logout", "Logout")}</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="teacher-main-content">
        <div className="teacher-main-inner">{renderMainContent()}</div>
        <ChatWidget />
      </main>

      {/* Modal overlay (same as before) */}
      {(modalType === "view" || modalType === "edit") && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div
            className="modal-dialog"
            style={{ maxWidth: "600px", width: "90%" }}
          >
            <div
              className="modal-content"
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "24px"
              }}
            >
              <div
                className="modal-header"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid #E5E7EB"
                }}
              >
                <h5
                  className="modal-title"
                  style={{
                    margin: 0,
                    color: "#0A2540",
                    fontSize: "20px",
                    fontWeight: 600
                  }}
                >
                  {modalType === "view"
                    ? t("student_details")
                    : t("edit_student")}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer"
                  }}
                >
                  ×
                </button>
              </div>

              <div className="modal-body">
                {modalType === "view" ? (
                  <div>
                    <div>
                      <strong>{t("full_name")}:</strong>{" "}
                      {selectedStudent.full_name}
                    </div>
                    <div>
                      <strong>{t("roll_no")}:</strong>{" "}
                      {selectedStudent.roll_number}
                    </div>
                    <div>
                      <strong>{t("standard")}:</strong>{" "}
                      {selectedStudent.standard}
                    </div>
                    <div>
                      <strong>{t("division")}:</strong>{" "}
                      {selectedStudent.division}
                    </div>
                    <div>
                      <strong>{t("dob")}:</strong> {selectedStudent.dob}
                    </div>
                    <div>
                      <strong>{t("gender")}:</strong>{" "}
                      {selectedStudent.gender}
                    </div>
                    <div>
                      <strong>{t("parent_name")}:</strong>{" "}
                      {selectedStudent.parent_name}
                    </div>
                    <div>
                      <strong>{t("parent_phone")}:</strong>{" "}
                      {selectedStudent.parent_phone}
                    </div>
                    <div>
                      <strong>{t("address")}:</strong>{" "}
                      {selectedStudent.address}
                    </div>
                    <div>
                      <strong>{t("admission_date")}:</strong>{" "}
                      {selectedStudent.admission_date}
                    </div>
                    <div>
                      <strong>{t("passed")}:</strong>{" "}
                      {selectedStudent.passed === true
                        ? t("yes")
                        : selectedStudent.passed === false
                        ? t("no")
                        : ""}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdate}>
                    <input
                      type="text"
                      className="form-control mb-2"
                      name="standard"
                      value={form.standard}
                      readOnly
                    />
                    <input
                      type="text"
                      className="form-control mb-2"
                      name="division"
                      value={form.division}
                      readOnly
                    />
                    <input
                      type="number"
                      className="form-control mb-2"
                      name="roll_number"
                      value={form.roll_number}
                      readOnly
                    />
                    <input
                      type="number"
                      step="0.01"
                      className="form-control mb-2"
                      name="percentage"
                      value={form.percentage}
                      onChange={handleFormChange}
                      placeholder={t("percentage")}
                    />
                    <div className="mb-2">
                      <label className="form-label">{t("passed")}</label>
                      <select
                        className="form-control"
                        name="passed"
                        value={
                          form.passed === ""
                            ? ""
                            : form.passed
                            ? "true"
                            : "false"
                        }
                        onChange={handleFormChange}
                      >
                        <option value="">{t("select_status")}</option>
                        <option value="true">{t("yes")}</option>
                        <option value="false">{t("no")}</option>
                      </select>
                    </div>
                    <div
                      className="form-actions"
                      style={{
                        marginTop: "24px",
                        display: "flex",
                        gap: "12px"
                      }}
                    >
                      <button
                        className="save-btn"
                        type="submit"
                        disabled={updating}
                        style={{
                          padding: "10px 20px",
                          borderRadius: "8px",
                          background: "#0B63E5",
                          color: "white",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: 500
                        }}
                      >
                        {updating ? t("saving") : t("save")}
                      </button>
                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={closeModal}
                        style={{
                          padding: "10px 20px",
                          borderRadius: "8px",
                          background: "#F9FAFB",
                          color: "#0A2540",
                          border: "1px solid #E5E7EB",
                          cursor: "pointer",
                          fontSize: "14px",
                          fontWeight: 500
                        }}
                      >
                        {t("cancel")}
                      </button>
                    </div>
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
