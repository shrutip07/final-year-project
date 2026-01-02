import React, { useEffect, useState } from "react";
import axios from "axios";
import "./CapacityManager.scss";

export default function CapacityManager() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [academicYear, setAcademicYear] = useState("");
  const [standard, setStandard] = useState("");
  const [division, setDivision] = useState("");
  const [capacity, setCapacity] = useState("");
  const [message, setMessage] = useState("");

  async function loadDashboard(year) {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const q = year ? `?academic_year=${encodeURIComponent(year)}` : "";
      const res = await axios.get(`http://localhost:5000/api/clerk/unit${q}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboard(res.data);
      if (!year && res.data?.academic_year) setAcademicYear(res.data.academic_year);
    } catch {
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleUpsert(e) {
    e.preventDefault();
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/clerk/capacity",
        {
          academic_year: academicYear,
          standard,
          division: division || null,
          capacity: Number(capacity)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Capacity saved successfully");
      loadDashboard(academicYear);
      setStandard("");
      setDivision("");
      setCapacity("");
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Save failed");
    }
  }

  return (
    <div className="capacity-wrapper">
      <div className="capacity-header">
        <h2>Class Capacity Management</h2>
        <p>Define maximum student strength per class</p>
      </div>

      <div className="capacity-card">
        <form onSubmit={handleUpsert} className="capacity-form">
          <div className="form-group">
            <label>Academic Year</label>
            <input
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="2025-26"
              required
            />
          </div>

          <div className="form-group">
            <label>Standard</label>
            <input
              value={standard}
              onChange={(e) => setStandard(e.target.value)}
              placeholder="10"
              required
            />
          </div>

          <div className="form-group">
            <label>Division</label>
            <input
              value={division}
              onChange={(e) => setDivision(e.target.value)}
              placeholder="A (optional)"
            />
          </div>

          <div className="form-group">
            <label>Capacity</label>
            <input
              type="number"
              min="0"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="60"
              required
            />
          </div>

          <div className="form-actions">
            <button className="btn-primary" type="submit">
              Save
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => loadDashboard(academicYear)}
            >
              Reload
            </button>
          </div>
        </form>

        {message && <div className="form-message">{message}</div>}
      </div>

      <div className="capacity-table-card">
        {loading ? (
          <div className="loading">Loading…</div>
        ) : (
          <>
            <div className="table-title">
              Academic Year: <strong>{dashboard?.academic_year ?? academicYear}</strong>
            </div>

            <table className="capacity-table">
              <thead>
                <tr>
                  <th>Standard</th>
                  <th>Division</th>
                  <th>Capacity</th>
                  <th>Enrolled</th>
                  <th>Seats Left</th>
                </tr>
              </thead>
              <tbody>
                {(dashboard?.classStats ?? []).map((c) => (
                  <tr key={`${c.standard}-${c.division || ""}`}>
                    <td>{c.standard}</td>
                    <td>{c.division ?? "-"}</td>
                    <td>{c.capacity}</td>
                    <td>{c.enrolled}</td>
                    <td className={c.seatsRemaining <= 5 ? "danger" : "success"}>
                      {c.seatsRemaining}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
