import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import ChatWidget from "../../components/ChatWidget";
import PageHeader from "../../components/admin/PageHeader";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import EmptyState from "../../components/admin/EmptyState";
import Toolbar from "../../components/admin/Toolbar";

export default function Tables() {
  const { t } = useTranslation();
  const { unitId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(unitId || "");
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTeachers, setSearchTeachers] = useState("");
  const [searchStudents, setSearchStudents] = useState("");
  const [filledForms, setFilledForms] = useState([]);

  useEffect(() => {
    const fetchFilledForms = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/admin/filled-forms-detailed",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFilledForms(res.data?.data || []);
      } catch (err) {
        setFilledForms([]);
      }
    };
    fetchFilledForms();
  }, []);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/admin/units",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUnits(response.data || []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || t("failed_load_units"));
        setLoading(false);
      }
    };
    fetchUnits();
  }, [t]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedUnit) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const [teachersRes, studentsRes] = await Promise.all([
          axios.get(
            `http://localhost:5000/api/admin/units/${selectedUnit}/teachers`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          axios.get(
            `http://localhost:5000/api/admin/units/${selectedUnit}/students`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);
        setTeachers(teachersRes.data || []);
        setStudents(studentsRes.data || []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || t("failed_fetch_data"));
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedUnit, t]);

  const handleUnitChange = (value) => {
    setSelectedUnit(value);
    if (value) {
      navigate(`/admin/tables/${value}`);
    } else {
      navigate("/admin/tables");
    }
  };

  if (loading && (!units || !units.length))
    return <div className="text-center mt-5">{t("loading")}...</div>;
  if (error) return <div className="alert alert-danger m-5">{error}</div>;

  const filteredForms = selectedUnit
    ? filledForms.filter(
        (f) => f.unit_id === Number(selectedUnit) || f.unit_id === selectedUnit
      )
    : filledForms;

  const excludedKeys = [
    "response_id",
    "submitted_by_id",
    "question_id",
    "question_type",
  ];
  const filteredKeys =
    filteredForms && filteredForms[0]
      ? Object.keys(filteredForms[0]).filter(
          (col) => !excludedKeys.includes(col)
        )
      : [];

  const sidebarItems = [
    { key: "dashboard", label: t("dashboard"), icon: "bi-speedometer2", path: "/admin" },
    { key: "tables", label: t("tables"), icon: "bi-table", path: "/admin/tables" },
    { key: "charts", label: t("charts"), icon: "bi-bar-chart-fill", path: "/admin/charts" },
    { key: "budgets", label: t("budgets"), icon: "bi-wallet2", path: "/admin/budgets" },
    { key: "notifications", label: t("notifications"), icon: "bi-bell-fill", path: "/admin/notifications" },
    { key: "reports", label: "Reports", icon: "bi-file-earmark-text", path: "/admin/reports" },
  ];

  const isActive = (path) => {
    if (path === "/admin") {
      return location.pathname === "/admin" || location.pathname === "/admin/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="app-icon">
            <i className="bi bi-buildings-fill"></i>
          </div>
          <h3>{t("admin_panel") || "Admin Panel"}</h3>
        </div>
        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              className={`nav-link ${isActive(item.path) ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button
            className="nav-link"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            <i className="bi bi-box-arrow-left"></i>
            <span>{t("logout")}</span>
          </button>
        </div>
      </div>

      <main className="main-content">
        <PageHeader
          title={"School Data Tables"}
          subtitle={
            "View teachers, students and filled form responses for the selected school or unit."
          }
        />

        <AdminCard header={"Select School / Unit"} className="mb-4">
          <div>
            <select
              className="form-select"
              value={selectedUnit}
              onChange={(e) => handleUnitChange(e.target.value)}
            >
              <option value="">{t("select_a_school")}</option>
              {(units || []).map((unit) => (
                <option key={unit.unit_id} value={unit.unit_id}>
                  {t("school")} {unit.unit_id} - SEMIS: {unit.semis_no}
                </option>
              ))}
            </select>
          </div>
        </AdminCard>

        {selectedUnit && (
          <>
            {/* TEACHERS */}
            <AdminCard header={"Teachers"} className="mb-4 section-card">
              <TableContainer
                title={"Teachers"}
                toolbar={
                  <Toolbar
                    left={<span>Teachers</span>}
                    right={
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search teachers by any field..."
                        value={searchTeachers}
                        onChange={(e) => setSearchTeachers(e.target.value)}
                      />
                    }
                  />
                }
              >
                {(teachers || []).filter((teacher) =>
                  Object.values(teacher).some((val) =>
                    String(val).toLowerCase().includes(searchTeachers.toLowerCase())
                  )
                ).length === 0 ? (
                  <EmptyState
                    title={"No teachers found"}
                    description={
                      t("no_teachers_found_description") ||
                      "Teachers for this school will appear here once added."
                    }
                  />
                ) : (
                  <table className="table table-striped table-hover table-bordered">
                    <thead>
                      <tr>
                        <th>{t("name")}</th>
                        <th>{t("email")}</th>
                        <th>{t("phone")}</th>
                        <th>{t("subject")}</th>
                        <th>{t("qualification")}</th>
                        <th>{t("joining_date")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(teachers || [])
                        .filter((teacher) =>
                          Object.values(teacher).some((val) =>
                            String(val).toLowerCase().includes(searchTeachers.toLowerCase())
                          )
                        )
                        .map((teacher) => (
                          <tr key={teacher.staff_id}>
                            <td>{teacher.full_name}</td>
                            <td>{teacher.email}</td>
                            <td>{teacher.phone}</td>
                            <td>{teacher.subject}</td>
                            <td>{teacher.qualification}</td>
                            <td>{new Date(teacher.joining_date).toLocaleDateString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </TableContainer>
            </AdminCard>

            {/* STUDENTS – same header style */}
            <AdminCard header={"Students"} className="mb-4 section-card">
  <TableContainer
    title={"Students"}
    toolbar={
      <Toolbar
        left={<span>Students</span>}
        right={
          <input
            type="text"
            className="form-control"
            placeholder="Search students by any field..."
            value={searchStudents}
            onChange={(e) => setSearchStudents(e.target.value)}
          />
        }
      />
    }
  >
    {(students || []).filter((student) =>
      Object.values(student).some((val) =>
        String(val).toLowerCase().includes(searchStudents.toLowerCase())
      )
    ).length === 0 ? (
      <EmptyState
        title={"No students found"}
        description={
          "Students will appear here after they are added for this school."
        }
      />
    ) : (
      <table className="table table-striped table-hover table-bordered">
        <thead>
          <tr>
            <th>{t("roll_number")}</th>
            <th>{t("name")}</th>
            <th>{t("standard")}</th>
            <th>{t("division")}</th>
            <th>{t("parent_name")}</th>
            <th>{t("parent_phone")}</th>
          </tr>
        </thead>
        <tbody>
          {(students || [])
            .filter((student) =>
              Object.values(student).some((val) =>
                String(val).toLowerCase().includes(searchStudents.toLowerCase())
              )
            )
            .map((student) => (
              <tr key={student.student_id}>
                <td>{student.roll_number}</td>
                <td>{student.full_name}</td>
                <td>{student.standard}</td>
                <td>{student.division}</td>
                <td>{student.parent_name}</td>
                <td>{student.parent_phone}</td>
              </tr>
            ))}
        </tbody>
      </table>
    )}
  </TableContainer>
</AdminCard>

            {/* FILLED FORMS – same header style */}
            <AdminCard header={"Filled Forms Data"} className="mb-4 section-card">
  <TableContainer
    title={"Filled Forms Data"}
    toolbar={
      <Toolbar
        left={<span>Filled Forms Data</span>}
        right={null}
      />
    }
  >
    {filteredForms && filteredForms.length > 0 ? (
      <div style={{ overflowX: "auto" }}>
        <table className="table table-striped table-hover table-bordered">
          <thead>
            <tr>
              {filteredKeys.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredForms.map((row, idx) => (
              <tr key={idx}>
                {filteredKeys.map((col) => (
                  <td key={col}>
                    {row[col] !== null && row[col] !== undefined
                      ? String(row[col])
                      : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <EmptyState
        title={"No filled form responses"}
        description={
          "Once schools submit forms, their responses will appear here."
        }
      />
    )}
  </TableContainer>
</AdminCard>

          </>
        )}
      </main>

      <ChatWidget />
    </div>
  );
}
