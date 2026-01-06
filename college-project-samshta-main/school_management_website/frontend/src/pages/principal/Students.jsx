import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import PrincipalLayout from "../../components/principal/PrincipalLayout";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import Toolbar from "../../components/admin/Toolbar";
import EmptyState from "../../components/admin/EmptyState";
import ChatWidget from "../../components/ChatWidget";

const COLUMNS = [
  { key: "roll_number", label: "Roll No" },
  { key: "full_name", label: "Full Name" },
  { key: "standard", label: "Standard" },
  { key: "division", label: "Division" },
  { key: "parent_name", label: "Parent Name" },
  { key: "parent_phone", label: "Parent Phone" },
  { key: "academic_year", label: "Academic Year" },
  { key: "passed", label: "Status" },
  { key: "gender", label: "Gender" },
];

const LIMIT_OPTIONS = [1, 2, 3, 5];

function ToppersPanel({ allYears }) {
  const [toppers, setToppers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(3);
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    async function fetchToppers() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const params = new URLSearchParams({ limit });
        if (selectedYear) params.append("academic_year", selectedYear);
        const res = await axios.get(
          `http://localhost:5000/api/principal/students/toppers?${params.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setToppers(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch toppers", err);
        setToppers([]);
      } finally {
        setLoading(false);
      }
    }
    fetchToppers();
  }, [limit, selectedYear]);

  return (
    <AdminCard 
      header={
        <div className="d-flex align-items-center justify-content-between w-100">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-trophy-fill text-warning fs-4"></i>
            <span className="fw-bold">Academic Toppers by Standard</span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <label className="small text-muted fw-bold text-uppercase">Limit</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="form-select form-select-sm border-0 bg-light fw-bold"
                style={{ width: '70px' }}
              >
                {LIMIT_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="d-flex align-items-center gap-2">
              <label className="small text-muted fw-bold text-uppercase">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="form-select form-select-sm border-0 bg-light fw-bold"
                style={{ width: '130px' }}
              >
                <option value="">All Years</option>
                {allYears.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      }
      className="mb-4 shadow-sm border-0"
    >
      <div className="toppers-body">
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-4 gap-2">
            <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
            <span className="text-muted">Analyzing topper data...</span>
          </div>
        ) : toppers.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <i className="bi bi-info-circle me-2"></i>
            <span>No topper records found for the selected criteria.</span>
          </div>
        ) : (
          <div className="row g-3">
            {toppers.map((group) => (
              <div key={group.standard} className="col-md-4">
                <div className="p-3 border rounded-3 bg-white h-100">
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span className="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-bold">
                      Standard {group.standard}
                    </span>
                  </div>
                  <div className="topper-list">
                    {group.toppers.map((s, idx) => (
                      <div key={s.student_id} className="d-flex align-items-center gap-3 mb-2 p-2 rounded-2 hover-bg-light transition-all">
                        <div className={`rank-indicator rank-${idx + 1} d-flex align-items-center justify-content-center fw-bold`}>
                          {idx + 1}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-bold text-dark small">{s.full_name}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {s.division && `Division ${s.division}`}
                            {s.percentage != null && ` • ${s.percentage}%`}
                          </div>
                        </div>
                        {idx === 0 && <i className="bi bi-star-fill text-warning"></i>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminCard>
  );
}

export default function Students({ isSubComponent = false }) {
  const { t } = useTranslation();
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [allYears, setAllYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStudents() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/principal/students", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data || [];
        setStudents(data);
        setFiltered(data);
        
        const years = Array.from(new Set(data.map(s => s.academic_year).filter(Boolean)))
          .sort().reverse();
        setAllYears(years);
      } catch (err) {
        setError(err.response?.data?.message || t("failed_load_students"));
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  useEffect(() => {
    const searchLower = search.toLowerCase();
    const result = students.filter(s => {
      const matchesYear = !academicYear || s.academic_year === academicYear;
      const matchesSearch = !searchLower || 
        s.full_name?.toLowerCase().includes(searchLower) ||
        s.roll_number?.toString().includes(searchLower) ||
        s.standard?.toLowerCase().includes(searchLower) ||
        s.parent_name?.toLowerCase().includes(searchLower);
      return matchesYear && matchesSearch;
    });
    setFiltered(result);
  }, [search, academicYear, students]);

  const content = (
    <div className={isSubComponent ? "" : "p-4"}>
      {loading ? (
        <div className="d-flex flex-column align-items-center justify-content-center py-5">
          <div className="spinner-grow text-primary" role="status"></div>
          <span className="mt-3 text-muted fw-bold">Loading student records...</span>
        </div>
      ) : error ? (
        <div className="alert alert-danger shadow-sm border-0 d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
          <div>{error}</div>
        </div>
      ) : (
        <>
          <ToppersPanel allYears={allYears} />

          <AdminCard 
            header={
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-mortarboard-fill text-success fs-4"></i>
                <span className="fw-bold">Comprehensive Student Directory</span>
              </div>
            }
            className="shadow-sm border-0"
          >
            <TableContainer
              toolbar={
                <Toolbar
                  left={
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-search text-muted"></i>
                      <input
                        type="text"
                        className="form-control form-control-sm border-0 bg-light"
                        placeholder="Search by name, roll no, or standard..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ minWidth: '300px', fontWeight: '500' }}
                      />
                    </div>
                  }
                  right={
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="form-select form-select-sm border-primary-subtle fw-semibold"
                      style={{ width: '200px' }}
                    >
                      <option value="">All Academic Years</option>
                      {allYears.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  }
                />
              }
            >
              {filtered.length === 0 ? (
                <EmptyState
                  title={t("no_students") || "No students"}
                  description={t("no_students_found") || "No students match your criteria."}
                />
              ) : (
                <div className="table-responsive professional-table">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        {COLUMNS.map(col => (
                          <th key={col.key} className="text-uppercase small fw-bold text-muted">{col.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((student) => (
                        <tr key={`${student.student_id}-${student.academic_year}`}>
                          <td>
                            <span className="fw-bold text-dark">#{student.roll_number || student.student_id}</span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <div className="avatar-circle student shadow-sm" style={{ width: '32px', height: '32px', fontSize: '0.8rem' }}>
                                {student.full_name ? student.full_name.charAt(0).toUpperCase() : "S"}
                              </div>
                              <span className="fw-semibold text-dark">{student.full_name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="erp-badge badge-year px-3">
                              {student.standard}
                            </span>
                          </td>
                          <td>
                            <span className="text-muted fw-medium">{student.division || "-"}</span>
                          </td>
                          <td>
                            <span className="text-dark small">{student.parent_name || "-"}</span>
                          </td>
                          <td>
                            <span className="text-muted small">
                              <i className="bi bi-telephone me-1"></i>
                              {student.parent_phone || "-"}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border fw-normal">
                              {student.academic_year}
                            </span>
                          </td>
                          <td>
                            <span className={`badge rounded-pill px-3 py-2 ${student.passed ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary'}`}>
                              {student.passed ? 'Passed' : 'Active'}
                            </span>
                          </td>
                          <td>
                            <span className="text-muted small text-capitalize">{student.gender || "-"}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TableContainer>
          </AdminCard>
        </>
      )}
    </div>
  );

  if (isSubComponent) {
    return content;
  }

  return (
    <PrincipalLayout activeSidebarTab="students">
      {content}
      <ChatWidget />
    </PrincipalLayout>
  );
}


