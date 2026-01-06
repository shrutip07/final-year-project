// src/pages/clerk/FireSafety.jsx
import React, { useEffect, useState } from "react";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import Toolbar from "../../components/admin/Toolbar";

function formatSeconds(s) {
  if (isNaN(s)) return "-";
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min}m ${sec < 10 ? '0' : ''}${sec}s`;
}

export default function FireSafety() {
  const [info, setInfo] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5000/api/clerk/fire-safety", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setInfo);
  }, [editing, token]);

  useEffect(() => { if (info?.safety) setForm(info.safety); }, [info]);

  const change = (e) => {
    let value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [e.target.name]: value }));
  };

  const saveInfo = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:5000/api/clerk/fire-safety", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form)
    });
    setEditing(false);
  };

  const addDrill = async (e) => {
    e.preventDefault();
    const drillForm = e.target;
    await fetch("http://localhost:5000/api/clerk/fire-safety/drill", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        drill_date: drillForm.drill_date.value,
        participants_students: drillForm.students.value,
        participants_staff: drillForm.staff.value,
        evacuation_time_seconds: drillForm.evacuation.value
      })
    });
    drillForm.reset();
    setEditing(false);
    // Reload data
    fetch("http://localhost:5000/api/clerk/fire-safety", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setInfo);
  };

  const uniqueDrills = [];
  const drillDates = new Set();
  (info?.allDrills ?? []).forEach(drill => {
    if (!drillDates.has(drill.drill_date)) {
      uniqueDrills.push(drill);
      drillDates.add(drill.drill_date);
    }
  });

  return (
    <div className="clerk-fire-safety-page">
      <div className="section-header-pro">
        <h3>Fire Safety & Drill Management</h3>
        <p>Monitor equipment status and record emergency evacuation drills</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-7">
          <AdminCard header={editing ? "Edit Equipment Info" : "Equipment Status Overview"}>
            {!editing ? (
              <div className="table-responsive professional-table">
                <table className="table table-hover align-middle">
                  <tbody>
                    <tr>
                      <th className="text-muted small text-uppercase" style={{ width: "40%" }}>Extinguishers Count</th>
                      <td className="fw-bold text-navy">{info?.safety?.extinguisher_count ?? "-"}</td>
                    </tr>
                    <tr>
                      <th className="text-muted small text-uppercase">Primary Locations</th>
                      <td className="text-navy">{info?.safety?.extinguisher_locations ?? "-"}</td>
                    </tr>
                    <tr>
                      <th className="text-muted small text-uppercase">Last Inspection Date</th>
                      <td><span className="erp-badge badge-year">{info?.safety?.extinguisher_last_inspection ? new Date(info.safety.extinguisher_last_inspection).toLocaleDateString() : "-"}</span></td>
                    </tr>
                    <tr>
                      <th className="text-muted small text-uppercase">Evacuation Routes</th>
                      <td>
                        <span className={`erp-badge ${info?.safety?.evacuation_routes_marked ? 'badge-success' : 'badge-danger'}`}>
                          {info?.safety?.evacuation_routes_marked ? "Marked & Clear" : "Not Marked"}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <th className="text-muted small text-uppercase">Assembly Points</th>
                      <td className="text-navy">{info?.safety?.assembly_points ?? "-"}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="pt-3">
                  <button className="btn btn-navy px-4" onClick={() => setEditing(true)}>Update Status</button>
                </div>
              </div>
            ) : (
              <form onSubmit={saveInfo} className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">EXTINGUISHER COUNT</label>
                  <input type="number" name="extinguisher_count" className="form-control" value={form.extinguisher_count ?? ''} onChange={change} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">LAST INSPECTION</label>
                  <input type="date" name="extinguisher_last_inspection" className="form-control" value={form.extinguisher_last_inspection?.slice(0,10) ?? ''} onChange={change} required />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted">LOCATIONS</label>
                  <input name="extinguisher_locations" className="form-control" value={form.extinguisher_locations ?? ''} onChange={change} required />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-bold text-muted">ASSEMBLY POINTS</label>
                  <input name="assembly_points" className="form-control" value={form.assembly_points ?? ''} onChange={change} required />
                </div>
                <div className="col-12">
                  <div className="form-check form-switch mt-2">
                    <input className="form-check-input" type="checkbox" checked={!!form.evacuation_routes_marked} name="evacuation_routes_marked" onChange={change} id="evacSwitch" />
                    <label className="form-check-label small fw-bold text-muted" htmlFor="evacSwitch">Evacuation Routes Marked</label>
                  </div>
                </div>
                <div className="col-12 d-flex gap-2 pt-2">
                  <button type="submit" className="btn btn-primary px-4">Save Changes</button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            )}
          </AdminCard>
        </div>

        <div className="col-lg-5">
          <AdminCard header="Record New Fire Drill">
            <form onSubmit={addDrill} className="row g-3">
              <div className="col-md-12">
                <label className="form-label small fw-bold text-muted">DRILL DATE</label>
                <input name="drill_date" type="date" className="form-control" required />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">STUDENT PARTICIPANTS</label>
                <input name="students" type="number" className="form-control" placeholder="0" required />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted">STAFF PARTICIPANTS</label>
                <input name="staff" type="number" className="form-control" placeholder="0" required />
              </div>
              <div className="col-md-12">
                <label className="form-label small fw-bold text-muted">EVACUATION TIME (SECONDS)</label>
                <input name="evacuation" type="number" className="form-control" placeholder="e.g. 180" required />
              </div>
              <div className="col-12 pt-2">
                <button type="submit" className="btn btn-success w-100">Log Drill Session</button>
              </div>
            </form>
          </AdminCard>
        </div>

        <div className="col-lg-12">
          <AdminCard>
            <TableContainer 
              title="Recent Drill History"
              toolbar={<Toolbar left={<div className="text-muted small">Showing records from the last 12 months</div>} />}
            >
              <div className="table-responsive professional-table">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Student Participants</th>
                      <th>Staff Participants</th>
                      <th>Evacuation Time</th>
                      <th className="text-end">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueDrills.map((drill, idx) => (
                      <tr key={idx}>
                        <td><span className="fw-bold text-navy">{new Date(drill.drill_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></td>
                        <td>{drill.participants_students}</td>
                        <td>{drill.participants_staff}</td>
                        <td><span className="erp-badge badge-designation">{formatSeconds(Number(drill.evacuation_time_seconds))}</span></td>
                        <td className="text-end text-success"><i className="bi bi-check-circle-fill me-2"></i>Recorded</td>
                      </tr>
                    ))}
                    {uniqueDrills.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-4 text-muted small">No drill records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TableContainer>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
