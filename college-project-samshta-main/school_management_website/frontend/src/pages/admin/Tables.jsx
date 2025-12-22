import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
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
        <AdminCard header={"Select School / Unit"} className="mb-4">
          <div className="row align-items-center">
            <div className="col-md-8">
              <p className="text-muted small mb-2">View teachers, students and filled form responses by selecting a school.</p>
              <select
                className="form-select"
                value={selectedUnit}
                onChange={(e) => handleUnitChange(e.target.value)}
              >
                <option value="">{t("select_a_school")}</option>
                {(units || []).map((unit) => (
                  <option key={unit.unit_id} value={unit.unit_id}>
                    {unit.kendrashala_name || `School ${unit.unit_id}`} - SEMIS: {unit.semis_no}
                  </option>
                ))}
              </select>
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
              <AdminCard header={"Teachers Directory"}>
                <TableContainer
                  title={"Teachers"}
                  toolbar={
                    <Toolbar
                      left={
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Search teachers..."
                          value={searchTeachers}
                          onChange={(e) => setSearchTeachers(e.target.value)}
                          style={{ maxWidth: 250 }}
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
                      title={"No records found"}
                      description={"No teachers found for this school."}
                    />
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover table-bordered table-sm">
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
                    </div>
                  )}
                </TableContainer>
              </AdminCard>
            )}

            {/* Students Tab */}
            {selectedTab === "students" && (
              <AdminCard header={"Students Enrollment"}>
                <TableContainer
                  title={"Students"}
                  toolbar={
                    <Toolbar
                      left={
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Search students..."
                          value={searchStudents}
                          onChange={(e) => setSearchStudents(e.target.value)}
                          style={{ maxWidth: 250 }}
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
                      title={"No records found"}
                      description={"No student records found for this school."}
                    />
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover table-bordered table-sm">
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
                    </div>
                  )}
                </TableContainer>
              </AdminCard>
            )}

            {/* Filled Forms Tab */}
            {selectedTab === "forms" && (
              <AdminCard header={"Form Responses"}>
                <TableContainer title={"Submissions"}>
                  {filteredForms && filteredForms.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-striped table-hover table-bordered table-sm">
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
