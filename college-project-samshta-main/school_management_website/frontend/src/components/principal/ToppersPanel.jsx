import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ToppersPanel({ allYears }) {
  const [toppersByStandard, setToppersByStandard] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState(3);
  const [academicYear, setAcademicYear] = useState("");

  const fetchToppers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/principal/students/toppers", {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit, academic_year: academicYear }
      });
      
      // Group by standard
      const data = res.data || [];
      const grouped = data.reduce((acc, student) => {
        const std = student.standard || "Other";
        if (!acc[std]) acc[std] = [];
        acc[std].push(student);
        return acc;
      }, {});
      
      setToppersByStandard(grouped);
      setError("");
    } catch (err) {
      console.error("Error fetching toppers:", err);
      setError("Failed to load toppers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchToppers();
  }, [limit, academicYear]);

  return (
    <div className="card shadow-sm mb-4 border-0">
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
        <h5 className="mb-0 fw-bold text-dark">
          <i className="bi bi-trophy text-warning me-2"></i>
          Toppers by Standard
        </h5>
        <div className="d-flex gap-2">
          <select 
            className="form-select form-select-sm" 
            style={{ width: "auto" }}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            {[1, 2, 3, 5].map(n => (
              <option key={n} value={n}>Top {n}</option>
            ))}
          </select>
          <select 
            className="form-select form-select-sm" 
            style={{ width: "auto" }}
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          >
            <option value="">All Years</option>
            {allYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="card-body">
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-info py-2 mb-0 small">{error}</div>
        ) : Object.keys(toppersByStandard).length === 0 ? (
          <div className="text-center text-muted py-3 small">No data available for the selected criteria.</div>
        ) : (
          <div className="row g-3">
            {Object.entries(toppersByStandard).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })).map(([standard, students]) => (
              <div key={standard} className="col-12 col-md-6 col-lg-4 col-xl-3">
                <div className="p-3 border rounded h-100 bg-light-subtle">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary px-2">{standard} Standard</span>
                  </div>
                  <ul className="list-unstyled mb-0">
                    {students.map((student, idx) => (
                      <li key={student.student_id} className="d-flex align-items-center mb-2 last-child-mb-0">
                        <span className={`me-2 rounded-circle d-flex align-items-center justify-content-center small text-white bg-${idx === 0 ? 'warning' : idx === 1 ? 'secondary' : 'bronze'}`} 
                              style={{ width: "20px", height: "20px", fontSize: "11px", backgroundColor: idx >= 2 ? '#cd7f32' : undefined }}>
                          {idx + 1}
                        </span>
                        <div className="overflow-hidden">
                          <div className="text-truncate fw-semibold small" title={student.full_name}>{student.full_name}</div>
                          <div className="text-muted" style={{ fontSize: "10px" }}>Roll: {student.roll_number} • Div: {student.division}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
