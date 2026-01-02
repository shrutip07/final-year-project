import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";

import AdminCard from "../../components/admin/AdminCard";
import EmptyState from "../../components/admin/EmptyState";

// All possible columns from backend
const COLUMNS = [
  { key: "roll_number", label: "Roll Number" },
  { key: "full_name", label: "Name" },
  { key: "standard", label: "Standard" },
  { key: "division", label: "Division" },
  { key: "parent_name", label: "Parent Name" },
  { key: "parent_phone", label: "Parent Phone" },
  { key: "academic_year", label: "Academic Year" },
  { key: "passed", label: "Passed" },
  { key: "gender", label: "Gender" },

  // extra data – can be toggled on via “Select Columns”
  { key: "student_id", label: "Student ID" },
  { key: "dob", label: "DOB" },
  { key: "address", label: "Address" },
  { key: "admission_date", label: "Admission Date" },
  { key: "unit_id", label: "Unit ID" },
  { key: "enrollment_id", label: "Enrollment ID" },
];

// default visible (same as your screenshot)
const DEFAULT_VISIBLE = [
  "roll_number",
  "full_name",
  "standard",
  "division",
  "parent_name",
  "parent_phone",
  "academic_year",
  "passed",
  "gender",
];

export default function Students() {
  const { t } = useTranslation();

  const [students, setStudents] = useState([]);
  const [allYears, setAllYears] = useState([]);
  const [academicYear, setAcademicYear] = useState(""); // initially all
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_VISIBLE);
  const [showColDropdown, setShowColDropdown] = useState(false);
  const [search, setSearch] = useState("");

  // Toppers state
  const [toppers, setToppers] = useState([]); // grouped by standard
  const [toppersLimit, setToppersLimit] = useState(3);
  const [loadingToppers, setLoadingToppers] = useState(false);

  // Fetch all students once (and toppers)
  useEffect(() => {
    async function fetchAll() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/principal/students", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data || [];
        setStudents(data);

        const years = Array.from(new Set(data.map((s) => s.academic_year).filter(Boolean)))
          .sort()
          .reverse();
        setAllYears(years);

        // fetch toppers as well
        await fetchToppers(toppersLimit, token);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.response?.data?.error ||
            err.message ||
            t("failed_load_students")
        );
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch toppers function
  async function fetchToppers(limit = 3, tokenArg = null) {
    setLoadingToppers(true);
    try {
      const token = tokenArg || localStorage.getItem("token");
      const res = await axios.get(`http://localhost:5000/api/principal/students/toppers?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // res.data.data is expected to be [{ standard: '1', toppers: [...] }, ...]
      setToppers(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load toppers:", err);
      setToppers([]);
    } finally {
      setLoadingToppers(false);
    }
  }

  // When toppersLimit changes, re-fetch toppers
  useEffect(() => {
    // avoid calling until students load triggered initial fetch; still safe to call
    fetchToppers(toppersLimit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toppersLimit]);

  // Filtered list by year + search
  const searchLower = search.toLowerCase();
  const filteredStudents = students.filter((s) => {
    const matchesYear = !academicYear || s.academic_year === academicYear;
    const matchesSearch =
      !searchLower ||
      (s.full_name && s.full_name.toLowerCase().includes(searchLower)) ||
      (s.roll_number && s.roll_number.toString().includes(searchLower)) ||
      (s.standard && s.standard.toLowerCase().includes(searchLower)) ||
      (s.division && s.division.toLowerCase().includes(searchLower)) ||
      (s.parent_name && s.parent_name.toLowerCase().includes(searchLower));
    return matchesYear && matchesSearch;
  });

  function handleColumnToggle(key) {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  }

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">
            {t("loading_students") || "Loading students..."}
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger mt-3">{error}</div>;
  }

  return (
    // PageHeader + .page-inner are provided by PrincipalDashboard
    <AdminCard header={t("students") || "Students"} className="section-card section-card--table">
      {/* TOPPERS PANEL */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div style={{ fontWeight: 600 }}>Toppers by Standard</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 13, color: "#555" }}>Top</div>
            <select
              className="form-control form-control-sm"
              value={toppersLimit}
              onChange={(e) => setToppersLimit(Number(e.target.value))}
              style={{ width: 100 }}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={5}>5</option>
            </select>
            <button
              className="btn btn-sm btn-outline-secondary"
              onClick={() => fetchToppers(toppersLimit)}
            >
              Refresh
            </button>
          </div>
        </div>

        {loadingToppers ? (
          <div className="mt-2">Loading toppers…</div>
        ) : toppers.length === 0 ? (
          <div className="text-muted mt-2">No topper data available.</div>
        ) : (
          <div style={{ marginTop: 10, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {toppers.map((group) => (
              <div
                key={group.standard}
                style={{
                  minWidth: 260,
                  border: "1px solid #e6e6e6",
                  borderRadius: 6,
                  padding: 12,
                  background: "#fff"
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Standard {group.standard}</div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", fontSize: 12, color: "#444" }}>Rank</th>
                      <th style={{ textAlign: "left", fontSize: 12, color: "#444" }}>Name</th>
                      <th style={{ textAlign: "left", fontSize: 12, color: "#444" }}>Perc</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.toppers.map((t) => (
                      <tr key={t.student_id}>
                        <td style={{ paddingRight: 8 }}>{t.rank ?? "-"}</td>
                        <td>{t.full_name}</td>
                        <td>{t.percentage != null ? t.percentage : "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toolbar – search + year + columns */}
      <div className="table-toolbar" style={{ marginTop: 8 }}>
        <div className="toolbar-search" style={{ maxWidth: 320 }}>
          <input
            className="form-control"
            placeholder={t("search_by_details") || "Search by name, roll, standard, division, or parent"}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="toolbar-actions">
          {/* Year filter */}
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="form-control form-control-sm"
            style={{ width: 160 }}
          >
            <option value="">{t("all_years") || "All Years"}</option>
            {allYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Column selector */}
          <div className="dropdown" style={{ position: "relative" }}>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowColDropdown((s) => !s)}>
              {t("select_columns") || "Select Columns"}
            </button>
            {showColDropdown && (
              <div className="col-dropdown p-2">
                {COLUMNS.map((col) => (
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
        </div>
      </div>

      {/* Table content */}
      {filteredStudents.length === 0 ? (
        <EmptyState title={t("no_students") || "No students"} description={t("no_students_found") || "No students match your filters."} />
      ) : (
        <div className="table-responsive" style={{ marginTop: 8 }}>
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                {COLUMNS.filter((c) => visibleColumns.includes(c.key)).map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr key={student.student_id + "-" + (student.academic_year || "")}>
                  {COLUMNS.filter((c) => visibleColumns.includes(c.key)).map((col) => {
                    const val = student[col.key];

                    // boolean field (passed)
                    if (typeof val === "boolean") {
                      return (
                        <td key={col.key}>
                          {val ? t("yes") : t("no")}
                        </td>
                      );
                    }

                    // date fields
                    if (col.key === "dob" || col.key === "admission_date") {
                      return (
                        <td key={col.key}>
                          {val ? new Date(val).toLocaleDateString() : "-"}
                        </td>
                      );
                    }

                    return <td key={col.key}>{val ?? "-"}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminCard>
  );
}