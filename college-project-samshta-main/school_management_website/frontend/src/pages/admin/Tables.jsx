import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import "./Dashboard.scss";
import ChatWidget from "../../components/ChatWidget";
import AdminLayout from "../../components/admin/AdminLayout";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import EmptyState from "../../components/admin/EmptyState";
import Toolbar from "../../components/admin/Toolbar";
import TabNavigation from "../../components/admin/TabNavigation";

export default function Tables() {
  const { t } = useTranslation();
  const { unitId } = useParams();
  const navigate = useNavigate();

  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(unitId || "");
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTeachers, setSearchTeachers] = useState("");
  const [searchStudents, setSearchStudents] = useState("");
  const [filledForms, setFilledForms] = useState([]);
  const [selectedTab, setSelectedTab] = useState("teachers");

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

  const selectedUnitData = units.find(u => String(u.unit_id) === String(selectedUnit));

  const filteredForms = selectedUnit
    ? filledForms.filter(
        (f) => String(f.unit_id) === String(selectedUnit)
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

  return (
    <AdminLayout 
      activeSidebarTab="tables" 
      schoolName={selectedUnitData?.kendrashala_name}
      semisId={selectedUnitData?.semis_no}
    >
        <div className="tables-page">
          <AdminCard header={
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-building-gear text-primary"></i>
              <span>Unit Configuration & Selection</span>
            </div>
          } className="mb-4">
            <div className="row align-items-center">
              <div className="col-md-8">
                <p className="text-muted small mb-3">
                  <i className="bi bi-info-circle me-1"></i>
                  Analyze institutional data across your network by selecting a specific unit below.
                </p>
                <div className="d-flex align-items-center gap-3">
                  <select
                    className="form-select border-primary-subtle"
                    value={selectedUnit}
                    onChange={(e) => handleUnitChange(e.target.value)}
                    style={{ fontWeight: '500', padding: '0.6rem 1rem' }}
                  >
                    <option value="">{t("select_a_school")}</option>
                    {(units || []).map((unit) => (
                      <option key={unit.unit_id} value={unit.unit_id}>
                        {unit.kendrashala_name || `School ${unit.unit_id}`} | SEMIS: {unit.semis_no}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </AdminCard>

        {selectedUnit && (
          <div className="mt-4">
            <TabNavigation 
              tabs={[
                { id: "teachers", label: "Teachers", icon: "bi-people" },
                { id: "students", label: "Students", icon: "bi-mortarboard" },
                { id: "forms", label: "Filled Forms", icon: "bi-file-earmark-check" },
              ]}
              activeTab={selectedTab}
              onTabChange={setSelectedTab}
            />

            {/* Teachers Tab */}
            {selectedTab === "teachers" && (
              <AdminCard header={
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-people-fill text-primary"></i>
                  <span>Staff Directory</span>
                </div>
              }>
                <TableContainer
                  title={""}
                  toolbar={
                    <Toolbar
                      left={
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-search text-muted"></i>
                          <input
                            type="text"
                            className="form-control form-control-sm border-0 bg-light"
                            placeholder="Search teachers..."
                            value={searchTeachers}
                            onChange={(e) => setSearchTeachers(e.target.value)}
                            style={{ minWidth: 250 }}
                          />
                        </div>
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
                      title={"No records found"}
                      description={"No teachers found for this school."}
                    />
                  ) : (
                    <div className="table-responsive professional-table">
                      <table className="table table-hover align-middle">
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
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <div className="avatar-circle">
                                      {teacher.full_name ? teacher.full_name.charAt(0).toUpperCase() : "T"}
                                    </div>
                                    <span className="fw-semibold">{teacher.full_name}</span>
                                  </div>
                                </td>
                                <td><span className="text-primary small">{teacher.email}</span></td>
                                <td>{teacher.phone}</td>
                                <td><span className="erp-badge badge-designation">{teacher.subject}</span></td>
                                <td><span className="erp-badge badge-qualification">{teacher.qualification}</span></td>
                                <td>
                                  <span className="text-muted small">
                                    {new Date(teacher.joining_date).toLocaleDateString(undefined, {
                                      year: 'numeric', month: 'short', day: 'numeric'
                                    })}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TableContainer>
              </AdminCard>
            )}

            {/* Students Tab */}
            {selectedTab === "students" && (
              <AdminCard header={
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-mortarboard-fill text-success"></i>
                  <span>Student Enrollment</span>
                </div>
              }>
                <TableContainer
                  title={""}
                  toolbar={
                    <Toolbar
                      left={
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-search text-muted"></i>
                          <input
                            type="text"
                            className="form-control form-control-sm border-0 bg-light"
                            placeholder="Search students..."
                            value={searchStudents}
                            onChange={(e) => setSearchStudents(e.target.value)}
                            style={{ minWidth: 250 }}
                          />
                        </div>
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
                      title={"No records found"}
                      description={"No student records found for this school."}
                    />
                  ) : (
                    <div className="table-responsive professional-table">
                      <table className="table table-hover align-middle">
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
                                <td><span className="fw-bold text-dark">{student.roll_number}</span></td>
                                <td>
                                  <div className="d-flex align-items-center gap-2">
                                    <div className="avatar-circle student">
                                      {student.full_name ? student.full_name.charAt(0).toUpperCase() : "S"}
                                    </div>
                                    <span className="fw-semibold">{student.full_name}</span>
                                  </div>
                                </td>
                                <td><span className="erp-badge badge-year">{student.standard}</span></td>
                                <td>{student.division}</td>
                                <td>{student.parent_name}</td>
                                <td>{student.parent_phone}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </TableContainer>
              </AdminCard>
            )}

            {/* Filled Forms Tab */}
            {selectedTab === "forms" && (
              <AdminCard header={
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-file-earmark-check-fill text-info"></i>
                  <span>Form Responses Registry</span>
                </div>
              }>
                <TableContainer title={""}>
                  {filteredForms && filteredForms.length > 0 ? (
                    <div className="table-responsive professional-table">
                      <table className="table table-hover align-middle">
                        <thead>
                          <tr>
                            {filteredKeys.map((col) => (
                              <th key={col}>{col.replace(/_/g, ' ').toUpperCase()}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredForms.map((row, idx) => (
                            <tr key={idx}>
                              {filteredKeys.map((col) => (
                                <td key={col}>
                                  {col.toLowerCase().includes("date") || col.toLowerCase().includes("at") 
                                    ? <span className="text-muted small">
                                        {row[col] ? new Date(row[col]).toLocaleDateString(undefined, {
                                          year: 'numeric', month: 'short', day: 'numeric'
                                        }) : "-"}
                                      </span>
                                    : row[col] !== null && row[col] !== undefined
                                      ? String(row[col])
                                      : "-"}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <EmptyState
                      title={"No responses"}
                      description={"No form responses submitted by this school yet."}
                    />
                  )}
                </TableContainer>
              </AdminCard>
            )}
          </div>
        )}
      </div>
      <ChatWidget />
    </AdminLayout>
  );
}
