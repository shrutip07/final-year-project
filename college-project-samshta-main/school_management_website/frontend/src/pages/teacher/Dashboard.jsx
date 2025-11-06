

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import "./Dashboard.scss";
import Charts from "./Charts"; // if your Dashboard.jsx and Charts.jsx are in the same folder


// Update columns as per your backend SELECT
const COLUMNS = [
  { key: "student_id", label: "Student ID" },
  { key: "full_name", label: "Full Name" },
  { key: "dob", label: "DOB" },
  { key: "gender", label: "Gender" },
  { key: "address", label: "Address" },
  { key: "parent_name", label: "Parent Name" },
  { key: "parent_phone", label: "Parent Phone" },
  { key: "admission_date", label: "Admission Date" },
  { key: "unit_id", label: "Unit ID" },
  { key: "enrollment_id", label: "Enrollment ID" },
  { key: "standard", label: "Standard" },
  { key: "division", label: "Division" },
  { key: "roll_number", label: "Roll Number" },
  { key: "academic_year", label: "Academic Year" },
  { key: "passed", label: "Passed" }
];

export default function TeacherDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sidebarTab, setSidebarTab] = useState("dashboard");
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [allYears, setAllYears] = useState([]);
  const [academicYear, setAcademicYear] = useState(""); // initially empty, will set after loading
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visibleColumns, setVisibleColumns] = useState(COLUMNS.map(col => col.key));
  const [showColDropdown, setShowColDropdown] = useState(false);

  const sidebarItems = [
    { key: "dashboard", label: t("dashboard"), icon: "bi-speedometer2" },
    { key: "profile", label: t("profile"), icon: "bi-person" },
    { key: "students", label: t("students"), icon: "bi-people" },
    { key: "charts", label: t("charts"), icon: "bi-bar-chart" }
  ];

  // Teacher profile on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    axios
      .get("http://localhost:5000/api/teacher/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        setProfile(res.data);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          navigate("/teacher/onboarding");
        } else {
          setError(err.response?.data?.message || t("failed_load_profile"));
        }
      });
  }, [navigate, t]);

  // Load available academic years for this teacher's unit (use only once on mount)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get("http://localhost:5000/api/teacher/students?academic_year=all", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then((res) => {
        // Collect all years in enrollments returned
        const yearsSet = new Set();
        res.data.forEach((row) => {
          if (row.academic_year) yearsSet.add(row.academic_year);
        });
        const yearsArray = Array.from(yearsSet).sort().reverse();
        setAllYears(yearsArray);
        // Set default year to most recent if not already.
        if (yearsArray.length && !academicYear) setAcademicYear(yearsArray[0]);
      });
  }, []); // Run once when component mounts

  // Fetch students for the selected academic year
  useEffect(() => {
    if (!academicYear) return;
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    setLoading(true);
    axios
      .get(
        `http://localhost:5000/api/teacher/students?academic_year=${encodeURIComponent(
          academicYear
        )}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setStudents(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            t("failed_load_students") ||
            "Fetch error"
        );
        setLoading(false);
      });
  }, [academicYear, t, navigate]);

  function handleColumnToggle(key) {
    setVisibleColumns(prev =>
      prev.includes(key)
        ? prev.filter(col => col !== key)
        : [...prev, key]
    );
  }

  const renderContent = () => {
    switch (sidebarTab) {
      case "dashboard":
        return (
          <div>
            <h2>{t("teacher_dashboard")}</h2>
            {profile && (
              <div className="card mb-4">
                <div className="card-header">
                  <h3>{t("teacher_profile")}</h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h4>{t("welcome")}, {profile.full_name}</h4>
                      <p>
                        <strong>{t("email")}:</strong> {profile.email}
                      </p>
                      <p>
                        <strong>{t("phone")}:</strong> {profile.phone}
                      </p>
                      <p>
                        <strong>{t("subject")}:</strong> {profile.subject}
                      </p>
                      <p>
                        <strong>{t("designation")}:</strong> {profile.designation}
                      </p>
                      <p>
                        <strong>{t("qualification")}:</strong> {profile.qualification}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-header d-flex align-items-center" style={{ gap: "20px" }}>
                <h3 style={{ flex: 1 }}>{t("my_students")}</h3>
                <div className="dropdown" style={{ position: "relative" }}>
                  <button
                    className="btn btn-outline-secondary dropdown-toggle"
                    type="button"
                    onClick={() => setShowColDropdown((s) => !s)}
                  >
                    Select Columns
                  </button>
                  {showColDropdown && (
                    <div className="dropdown-menu show p-2" style={{ maxHeight: 300, overflowY: "auto", right: 0, left: "auto" }}>
                      {COLUMNS.map(col => (
                        <div key={col.key} className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id={`col-check-${col.key}`}
                            checked={visibleColumns.includes(col.key)}
                            onChange={() => handleColumnToggle(col.key)}
                          />
                          <label className="form-check-label" htmlFor={`col-check-${col.key}`}>
                            {col.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <select
                  value={academicYear}
                  onChange={e => setAcademicYear(e.target.value)}
                  className="form-control"
                  style={{ width: "160px" }}
                >
                  {allYears.length === 0 && (
                    <option value="">{t("loading")}</option>
                  )}
                  {allYears.map((year) => (
                    <option value={year} key={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        {COLUMNS.filter(col => visibleColumns.includes(col.key)).map(col => (
                          <th key={col.key}>{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student) => (
                        <tr key={student.student_id + "-" + student.academic_year}>
                          {COLUMNS.filter(col => visibleColumns.includes(col.key)).map(col => (
                            <td key={col.key}>
                              {typeof student[col.key] === "boolean"
                                ? (student[col.key] ? t("yes") : t("no"))
                                : student[col.key]}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {students.length === 0 && !loading && (
                        <tr>
                          <td colSpan={visibleColumns.length} className="text-center">
                            {t("no_students_found")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  {loading && <div>{t("loading")}</div>}
                </div>
              </div>
            </div>
          </div>
        );
      case "profile":
        navigate("/teacher/profile");
        return null;
      case "students":
        navigate("/teacher/students");
        return null;
        case "charts":
      return <Charts />;
      default:
        return <div>{t("select_tab")}</div>;
    }
  };

  if (loading) return <div>{t("loading")}...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          minHeight: "100vh",
          backgroundColor: "#333",
          padding: "20px",
          color: "white"
        }}
      >
        <h3>{t("teacher_portal")}</h3>
        <div style={{ marginTop: "20px" }}>
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setSidebarTab(item.key)}
              style={{
                display: "block",
                width: "100%",
                padding: "10px",
                marginBottom: "10px",
                backgroundColor: sidebarTab === item.key ? "#555" : "transparent",
                border: "none",
                color: "white",
                textAlign: "left",
                cursor: "pointer"
              }}
            >
              <i className={`bi ${item.icon}`}></i> {item.label}
            </button>
          ))}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            style={{
              display: "block",
              width: "100%",
              padding: "10px",
              marginTop: "20px",
              backgroundColor: "transparent",
              border: "none",
              color: "white",
              textAlign: "left",
              cursor: "pointer"
            }}
          >
            <i className="bi bi-box-arrow-left"></i> {t("logout")}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px" }}>{renderContent()}</div>
    </div>
  );
}
