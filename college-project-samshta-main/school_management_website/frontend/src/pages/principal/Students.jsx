import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import EmptyState from "../../components/admin/EmptyState";

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
    <div className="toppers-panel">
      <div className="toppers-header">
        <div className="header-left">
          <i className="bi bi-trophy-fill"></i>
          <h3>Toppers by Standard</h3>
        </div>
        <div className="toppers-controls">
          <div className="control-group">
            <label>Top</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="form-select form-select-sm"
            >
              {LIMIT_OPTIONS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
          <div className="control-group">
            <label>Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="form-select form-select-sm"
            >
              <option value="">All Years</option>
              {allYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="toppers-body">
        {loading ? (
          <div className="toppers-loading">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <span>Loading toppers...</span>
          </div>
        ) : toppers.length === 0 ? (
          <div className="toppers-empty">
            <i className="bi bi-info-circle"></i>
            <span>No topper data available</span>
          </div>
        ) : (
          <div className="toppers-grid">
            {toppers.map((group) => (
              <div key={group.standard} className="standard-card">
                <div className="standard-badge">
                  <span>Std {group.standard}</span>
                </div>
                <div className="topper-list">
                  {group.toppers.map((s, idx) => (
                    <div key={s.student_id} className={`topper-item rank-${idx + 1}`}>
                      <span className="rank-badge">#{idx + 1}</span>
                      <div className="topper-info">
                        <span className="topper-name">{s.full_name}</span>
                        <span className="topper-details">
                          {s.division && `Div ${s.division}`}
                          {s.percentage != null && ` • ${s.percentage}%`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Students() {
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t("loading")}...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger mt-3">{error}</div>;
  }

  return (
    <div className="directory-wrapper">
      <ToppersPanel allYears={allYears} />

      <div className="directory-controls">
        <div className="search-box">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, roll no, or standard..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="toolbar-actions">
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="form-select"
          >
            <option value="">All Academic Years</option>
            {allYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        {filtered.length === 0 ? (
          <EmptyState
            title={t("no_students") || "No students"}
            description={t("no_students_found") || "No students match your criteria."}
          />
        ) : (
          <div className="custom-table-wrapper">
            <table className="table table-hover align-middle">
              <thead>
                <tr>
                  {COLUMNS.map(col => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <tr key={`${student.student_id}-${student.academic_year}`}>
                    <td className="fw-bold text-primary">#{student.roll_number || student.student_id}</td>
                    <td className="fw-semibold">{student.full_name}</td>
                    <td>
                      <span className="badge badge-subject">
                        {student.standard}
                      </span>
                    </td>
                    <td className="text-muted">{student.division || "-"}</td>
                    <td>{student.parent_name || "-"}</td>
                    <td className="text-muted">{student.parent_phone || "-"}</td>
                    <td>{student.academic_year}</td>
                    <td>
                      <span className={`badge ${student.passed ? 'badge-status-active' : 'badge-status-inactive'}`}>
                        {student.passed ? 'Passed' : 'Active'}
                      </span>
                    </td>
                    <td className="text-muted small">{student.gender || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
