import React, { useEffect, useState } from "react";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import EmptyState from "../../components/admin/EmptyState";
import TabNavigation from "../../components/admin/TabNavigation";
import PageHeader from "../../components/admin/PageHeader";
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
  const [activeTab, setActiveTab] = useState("infrastructure");
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
    setActiveTab("registry"); // Switch to registry after adding
  };

  const uniqueDrills = [];
  const drillDates = new Set();
  (info?.allDrills ?? []).forEach(drill => {
    if (!drillDates.has(drill.drill_date)) {
      uniqueDrills.push(drill);
      drillDates.add(drill.drill_date);
    }
  });

  const safetyTabs = [
    { id: "infrastructure", label: "Safety Infrastructure", icon: "bi-building-check" },
    { id: "record", label: "Record New Drill", icon: "bi-plus-circle" },
    { id: "registry", label: "Drill Registry", icon: "bi-journal-list" },
  ];

  return (
    <div className="fire-safety-module container-fluid px-0">
      <PageHeader 
        title="Fire Safety & Drill Management" 
        subtitle="Maintain fire safety infrastructure and record emergency evacuation drills"
      />

      <div className="px-3 mt-3">
        <TabNavigation
          tabs={safetyTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="mt-4">
          {activeTab === "infrastructure" && (
            <div className="row justify-content-center">
              <div className="col-xl-8 col-lg-10">
                <AdminCard 
                  header={
                    <div className="d-flex justify-content-between align-items-center w-100">
                      <h5 className="mb-0 fw-bold">Safety Infrastructure Details</h5>
                      {!editing && (
                        <button className="btn btn-sm btn-primary px-3" onClick={() => setEditing(true)}>
                          <i className="bi bi-pencil-square me-1"></i> Edit Details
                        </button>
                      )}
                    </div>
                  }
                >
                  {!editing ? (
                    <div className="infrastructure-view p-2">
                      <div className="row g-4">
                        <div className="col-md-6">
                          <div className="p-3 bg-light rounded-3 border-start border-4 border-primary h-100">
                            <span className="text-muted small fw-bold d-block text-uppercase mb-1">Extinguishers</span>
                            <span className="fw-bold fs-4 text-dark">{info?.safety?.extinguisher_count ?? "0"} Units</span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="p-3 bg-light rounded-3 border-start border-4 border-info h-100">
                            <span className="text-muted small fw-bold d-block text-uppercase mb-1">Last Inspection</span>
                            <span className="fw-bold fs-4 text-dark">
                              {info?.safety?.extinguisher_last_inspection
                                ? new Date(info.safety.extinguisher_last_inspection).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="p-3 bg-light rounded-3 border-start border-4 border-secondary">
                            <span className="text-muted small fw-bold d-block text-uppercase mb-1">Placement Locations</span>
                            <span className="text-dark fw-medium">{info?.safety?.extinguisher_locations ?? "No locations specified"}</span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="p-3 bg-light rounded-3 border-start border-4 border-success h-100">
                            <span className="text-muted small fw-bold d-block text-uppercase mb-1">Evacuation Routes</span>
                            <span className={`badge ${info?.safety?.evacuation_routes_marked ? 'bg-success' : 'bg-danger'} fs-6`}>
                              {info?.safety?.evacuation_routes_marked ? "YES - MARKED" : "NOT MARKED"}
                            </span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="p-3 bg-light rounded-3 border-start border-4 border-warning h-100">
                            <span className="text-muted small fw-bold d-block text-uppercase mb-1">Assembly Points</span>
                            <span className="text-dark fw-bold fs-5">{info?.safety?.assembly_points ?? "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={saveInfo} className="p-2">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-bold text-muted small">EXTINGUISHER COUNT</label>
                          <input type="number" className="form-control form-control-lg" name="extinguisher_count" value={form.extinguisher_count ?? ''} onChange={change} required />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold text-muted small">LAST INSPECTION</label>
                          <input type="date" className="form-control form-control-lg" name="extinguisher_last_inspection" value={form.extinguisher_last_inspection ? form.extinguisher_last_inspection.slice(0, 10) : ''} onChange={change} required />
                        </div>
                        <div className="col-12">
                          <label className="form-label fw-bold text-muted small">LOCATIONS</label>
                          <textarea className="form-control" rows="3" name="extinguisher_locations" value={form.extinguisher_locations ?? ''} onChange={change} required placeholder="Describe where extinguishers are placed..." />
                        </div>
                        <div className="col-md-6">
                          <div className="form-check form-switch bg-light p-3 rounded-3 border mt-2">
                            <input className="form-check-input ms-0 me-3" type="checkbox" checked={!!form.evacuation_routes_marked} name="evacuation_routes_marked" onChange={change} id="evacCheck" />
                            <label className="form-check-label fw-bold text-dark" htmlFor="evacCheck">EVACUATION ROUTES MARKED</label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold text-muted small">ASSEMBLY POINTS</label>
                          <input type="text" className="form-control form-control-lg" name="assembly_points" value={form.assembly_points ?? ''} onChange={change} required placeholder="e.g. Main Playground" />
                        </div>
                      </div>
                      <div className="d-flex gap-2 mt-4 pt-3 border-top">
                        <button type="submit" className="btn btn-primary px-5">Update Infrastructure</button>
                        <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setEditing(false)}>Cancel</button>
                      </div>
                    </form>
                  )}
                </AdminCard>
              </div>
            </div>
          )}

          {activeTab === "record" && (
            <div className="row justify-content-center">
              <div className="col-xl-6 col-lg-8">
                <AdminCard header={<h5 className="mb-0 fw-bold">Register New Safety Drill</h5>}>
                  <form onSubmit={addDrill} className="p-2">
                    <div className="row g-4 mb-4">
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-muted small">DRILL DATE</label>
                        <input name="drill_date" type="date" className="form-control form-control-lg" required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-muted small">EVAC TIME (SEC)</label>
                        <div className="input-group">
                          <input name="evacuation" type="number" className="form-control form-control-lg" placeholder="e.g. 120" required />
                          <span className="input-group-text">Seconds</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-muted small">STUDENT PARTICIPANTS</label>
                        <input name="students" type="number" className="form-control form-control-lg" required placeholder="0" />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold text-muted small">STAFF PARTICIPANTS</label>
                        <input name="staff" type="number" className="form-control form-control-lg" required placeholder="0" />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-success w-100 py-3 fw-bold fs-5 shadow-sm">
                      <i className="bi bi-plus-circle me-2"></i> Register Safety Drill
                    </button>
                  </form>
                </AdminCard>
              </div>
            </div>
          )}

          {activeTab === "registry" && (
            <AdminCard header={<h5 className="mb-0 fw-bold">Drill History (Last 12 Months)</h5>}>
              <TableContainer title="Evacuation Drill Registry">
                <table className="table align-middle table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">Drill Date</th>
                      <th>Participants</th>
                      <th>Evacuation Time</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueDrills.length > 0 ? (
                      uniqueDrills.map(drill => (
                        <tr key={drill.id}>
                          <td className="ps-3">
                            <span className="fw-bold text-primary">
                              {new Date(drill.drill_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <span className="badge bg-light text-dark border"><i className="bi bi-mortarboard me-1 text-primary"></i> {drill.participants_students} Students</span>
                              <span className="badge bg-light text-dark border"><i className="bi bi-people me-1 text-info"></i> {drill.participants_staff} Staff</span>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${Number(drill.evacuation_time_seconds) < 180 ? 'bg-success' : 'bg-warning text-dark'} px-3 py-2`}>
                              <i className="bi bi-stopwatch me-1"></i>
                              {formatSeconds(Number(drill.evacuation_time_seconds))}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-success-subtle text-success border border-success px-3 py-2">
                              <i className="bi bi-check-circle me-1"></i> COMPLETED
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-5">
                          <EmptyState 
                            title="No Drills Recorded" 
                            description="Maintain a registry of all emergency evacuation drills for institutional compliance." 
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </TableContainer>
            </AdminCard>
          )}
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}
