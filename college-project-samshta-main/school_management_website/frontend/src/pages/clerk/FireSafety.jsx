import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import Toolbar from "../../components/admin/Toolbar";
import EmptyState from "../../components/admin/EmptyState";
import ChatWidget from "../../components/ChatWidget";

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
    const data = {
      drill_date: e.target.drill_date.value,
      participants_students: e.target.students.value,
      participants_staff: e.target.staff.value,
      evacuation_time_seconds: e.target.evacuation.value
    };
    await fetch("http://localhost:5000/api/clerk/fire-safety/drill", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    e.target.reset();
    // Refresh
    const res = await fetch("http://localhost:5000/api/clerk/fire-safety", { headers: { Authorization: `Bearer ${token}` } });
    const newData = await res.json();
    setInfo(newData);
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
    <div className="fire-safety-module">
      <div className="section-header-pro">
        <h3>Fire Safety & Drill Management</h3>
        <p>Maintain fire safety infrastructure and record emergency evacuation drills</p>
      </div>

      <div className="row">
        <div className="col-lg-5">
          <AdminCard header={
            <div className="d-flex justify-content-between align-items-center w-100">
              <span>Safety Infrastructure</span>
              {!editing && (
                <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(true)}>
                  <i className="bi bi-pencil-square me-1"></i> Edit
                </button>
              )}
            </div>
          }>
            {!editing ? (
              <div className="safety-details-list">
                <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                  <span className="text-muted small fw-bold">EXTINGUISHERS</span>
                  <span className="fw-bold text-dark">{info?.safety?.extinguisher_count ?? "-"} Units</span>
                </div>
                <div className="d-flex flex-column mb-3 border-bottom pb-2">
                  <span className="text-muted small fw-bold">LOCATIONS</span>
                  <span className="text-dark small mt-1">{info?.safety?.extinguisher_locations ?? "-"}</span>
                </div>
                <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                  <span className="text-muted small fw-bold">LAST INSPECTION</span>
                  <span className="text-dark">
                    {info?.safety?.extinguisher_last_inspection
                      ? new Date(info.safety.extinguisher_last_inspection).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : "-"}
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-3 border-bottom pb-2">
                  <span className="text-muted small fw-bold">EVACUATION MARKED</span>
                  <span className={`erp-badge ${info?.safety?.evacuation_routes_marked ? 'badge-success' : 'badge-danger'}`}>
                    {info?.safety?.evacuation_routes_marked ? "YES" : "NO"}
                  </span>
                </div>
                <div className="d-flex flex-column mb-2">
                  <span className="text-muted small fw-bold">ASSEMBLY POINTS</span>
                  <span className="text-dark small mt-1">{info?.safety?.assembly_points ?? "-"}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={saveInfo}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">EXTINGUISHER COUNT</label>
                  <input type="number" className="form-control" name="extinguisher_count" value={form.extinguisher_count ?? ''} onChange={change} required />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">LOCATIONS</label>
                  <textarea className="form-control" rows="2" name="extinguisher_locations" value={form.extinguisher_locations ?? ''} onChange={change} required />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">LAST INSPECTION</label>
                  <input type="date" className="form-control" name="extinguisher_last_inspection" value={form.extinguisher_last_inspection ? form.extinguisher_last_inspection.slice(0, 10) : ''} onChange={change} required />
                </div>
                <div className="form-check form-switch mb-3">
                  <input className="form-check-input" type="checkbox" checked={!!form.evacuation_routes_marked} name="evacuation_routes_marked" onChange={change} id="evacCheck" />
                  <label className="form-check-label small fw-bold" htmlFor="evacCheck">EVACUATION ROUTES MARKED</label>
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted">ASSEMBLY POINTS</label>
                  <input type="text" className="form-control" name="assembly_points" value={form.assembly_points ?? ''} onChange={change} required />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary flex-grow-1">Save Infrastructure</button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            )}
          </AdminCard>

          <AdminCard header="Record New Drill">
            <form onSubmit={addDrill}>
              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">DRILL DATE</label>
                  <input name="drill_date" type="date" className="form-control" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">EVAC TIME (SEC)</label>
                  <input name="evacuation" type="number" className="form-control" placeholder="Seconds" required />
                </div>
              </div>
              <div className="row g-2 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">STUDENT COUNT</label>
                  <input name="students" type="number" className="form-control" required />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">STAFF COUNT</label>
                  <input name="staff" type="number" className="form-control" required />
                </div>
              </div>
              <button type="submit" className="btn btn-success w-100">
                <i className="bi bi-plus-circle me-2"></i> Register Drill
              </button>
            </form>
          </AdminCard>
        </div>

        <div className="col-lg-7">
          <AdminCard header="Drill Registry (Last 12 Months)">
            <TableContainer title="">
              <div className="table-responsive professional-table">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Drill Date</th>
                      <th>Participants</th>
                      <th>Evacuation Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueDrills.length > 0 ? (
                      uniqueDrills.map(drill => (
                        <tr key={drill.id}>
                          <td>
                            <span className="fw-bold text-dark">
                              {new Date(drill.drill_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </td>
                          <td>
                            <div className="small text-muted">
                              <div><i className="bi bi-mortarboard me-1"></i> Students: {drill.participants_students}</div>
                              <div><i className="bi bi-people me-1"></i> Staff: {drill.participants_staff}</div>
                            </div>
                          </td>
                          <td>
                            <span className={`fw-bold ${Number(drill.evacuation_time_seconds) < 180 ? 'text-success' : 'text-warning'}`}>
                              {formatSeconds(Number(drill.evacuation_time_seconds))}
                            </span>
                          </td>
                          <td>
                            <span className="erp-badge badge-success">COMPLETED</span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-5">
                          <EmptyState title="No Drills Recorded" description="Record your first fire safety drill to see it here." />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TableContainer>
          </AdminCard>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}
