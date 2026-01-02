import React, { useEffect, useState } from "react";

export default function ManageRetirements() {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch teachers + dashboard in parallel
        const [tRes, dRes] = await Promise.all([
          fetch("http://localhost:5000/api/clerk/teachers", { headers }),
          fetch("http://localhost:5000/api/clerk/unit", { headers })
        ]);

        if (!tRes.ok) throw new Error("Failed to load teachers");
        const tData = await tRes.json();
        setTeachers(tData);

        if (dRes.ok) {
          const dData = await dRes.json();
          setUpcoming(Array.isArray(dData.upcomingRetirements) ? dData.upcomingRetirements : []);
        } else {
          setUpcoming([]);
        }
      } catch (err) {
        console.error(err);
        setTeachers([]);
        setUpcoming([]);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [token]);

  const handleChange = (staff_id, value) => {
    setTeachers((prev) => prev.map(t => (t.staff_id === staff_id ? { ...t, retirement_date: value } : t)));
  };

  const handleSave = async (staff_id) => {
    const teacher = teachers.find(t => t.staff_id === staff_id);
    if (!teacher) return;
    setSavingId(staff_id);
    try {
      const res = await fetch("http://localhost:5000/api/clerk/teacher-retirement", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ staff_id, retirement_date: teacher.retirement_date || null }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Save failed");
      }
      // refresh dashboard counts after save
      const dRes = await fetch("http://localhost:5000/api/clerk/unit", { headers: { Authorization: `Bearer ${token}` } });
      if (dRes.ok) {
        const dData = await dRes.json();
        setUpcoming(Array.isArray(dData.upcomingRetirements) ? dData.upcomingRetirements : []);
      }
      console.log("Saved", staff_id);
    } catch (e) {
      console.error("Failed saving retirement date:", e);
      alert("Failed to save. See console for details.");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) return <div className="loading-state">Loading teachers…</div>;

  const currentYear = new Date().getFullYear();

  // Filter teachers by selected year (if any)
  const filteredTeachers = selectedYear
    ? teachers.filter(t => {
        if (!t.retirement_date) return false;
        const year = new Date(t.retirement_date).getFullYear();
        return year === selectedYear;
      })
    : teachers;

  const totalTeachers = teachers.length;
  const showingCount = filteredTeachers.length;

  const handleYearClick = (year) => {
    // toggle selection
    setSelectedYear(prev => (prev === year ? null : year));
  };

  return (
    <div className="clerk-main-inner">
      <div className="page-header page-header-tight">
        <h2>Manage Teacher Retirement Dates</h2>
      </div>

      {/* Upcoming retirements summary (clickable) */}
      <div style={{ marginBottom: 12 }}>
        <strong>Upcoming retirements:</strong>
        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => setSelectedYear(null)}
            style={{
              padding: "6px 10px",
              borderRadius: 6,
              background: selectedYear === null ? "#dfeffd" : "#f4f4f4",
              border: selectedYear === null ? "1px solid #9fd0ff" : "1px solid #e0e0e0",
              cursor: "pointer",
              fontSize: 14
            }}
            aria-pressed={selectedYear === null}
            title="Show all teachers"
          >
            All ({totalTeachers})
          </button>

          {upcoming.length === 0 && <span className="text-muted">No data</span>}
          {upcoming.map(u => {
            const isSelected = selectedYear === u.year;
            return (
              <button
                key={u.year}
                onClick={() => handleYearClick(u.year)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 6,
                  background: isSelected ? "#e9f5ff" : "#f4f4f4",
                  border: isSelected ? "1px solid #9fd0ff" : "1px solid #e0e0e0",
                  cursor: "pointer",
                  fontSize: 14
                }}
                aria-pressed={isSelected}
                title={`Show teachers retiring in ${u.year}`}
              >
                <strong>{u.year}:</strong> {u.count}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 8, color: "#555" }}>
        <small>
          Showing {showingCount} {selectedYear ? `teacher(s) retiring in ${selectedYear}` : "teacher(s)"} (total {totalTeachers})
        </small>
      </div>

      <div className="table-responsive">
        <table className="clerk-unit-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Retirement Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeachers.length === 0 && (
              <tr><td colSpan={3} className="text-muted">No teachers found for the selection.</td></tr>
            )}
            {filteredTeachers.map(t => (
              <tr key={t.staff_id}>
                <td>{t.full_name}</td>
                <td>
                  <input
                    type="date"
                    value={t.retirement_date ? t.retirement_date.slice(0,10) : ""}
                    onChange={(e) => handleChange(t.staff_id, e.target.value || null)}
                  />
                </td>
                <td>
                  <button
                    onClick={() => handleSave(t.staff_id)}
                    disabled={savingId === t.staff_id}
                    className="btn btn-sm btn-primary"
                  >
                    {savingId === t.staff_id ? "Saving…" : "Save"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}