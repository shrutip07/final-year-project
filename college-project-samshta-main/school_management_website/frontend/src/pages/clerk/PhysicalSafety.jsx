// src/pages/clerk/PhysicalSafety.jsx
import React, { useEffect, useState } from "react";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import Toolbar from "../../components/admin/Toolbar";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function PhysicalSafety() {
  const token = localStorage.getItem("token");

  // State sections
  const [info, setInfo] = useState({});
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  const [medical, setMedical] = useState({});
  const [editingMedical, setEditingMedical] = useState(false);
  const [medicalForm, setMedicalForm] = useState({});

  const [surv, setSurv] = useState({});
  const [editingSurv, setEditingSurv] = useState(false);
  const [survForm, setSurvForm] = useState({});

  const [emerg, setEmerg] = useState({});
  const [editingEmerg, setEditingEmerg] = useState(false);
  const [emergForm, setEmergForm] = useState({});

  const [certs, setCerts] = useState([]);
  const [certForm, setCertForm] = useState({
    certificate_type: "",
    certificate_number: "",
    issue_date: "",
    expiry_date: "",
    status: "valid"
  });

  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [physRes, analRes, medRes, survRes, emergRes, certRes] = await Promise.all([
        fetch("http://localhost:5000/api/clerk/physical-safety", { headers }),
        fetch("http://localhost:5000/api/clerk/physical-safety/analytics", { headers }),
        fetch("http://localhost:5000/api/clerk/medical-readiness", { headers }),
        fetch("http://localhost:5000/api/clerk/surveillance", { headers }),
        fetch("http://localhost:5000/api/clerk/emergency-response", { headers }),
        fetch("http://localhost:5000/api/clerk/compliance-certificates", { headers })
      ]);

      setInfo(await physRes.json());
      setAnalytics(await analRes.json());
      setMedical(await medRes.json());
      setSurv(await survRes.json());
      setEmerg(await emergRes.json());
      setCerts(await certRes.json());
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  }

  // Save Handlers
  const saveSection = async (endpoint, data, setEditState, fetchFunc) => {
    await fetch(`http://localhost:5000/api/clerk/${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(data)
    });
    setEditState(false);
    fetchAll();
  };

  const chartData = {
    labels: ["Stairs", "Ramps", "Handrails", "Water Outlets", "Toilets (B)", "Toilets (G)"],
    datasets: [{
      label: "Count",
      data: [
        analytics.stairs ?? 0,
        analytics.ramps ?? 0,
        analytics.handrails ?? 0,
        analytics.drinking_water_outlets ?? 0,
        analytics.toilets_boys ?? 0,
        analytics.toilets_girls ?? 0
      ],
      backgroundColor: "rgba(0, 46, 109, 0.7)",
      borderColor: "#002E6D",
      borderWidth: 1,
      borderRadius: 4
    }]
  };

  return (
    <div className="clerk-physical-safety-page">
      <div className="section-header-pro">
        <h3>Physical Safety & Infrastructure</h3>
        <p>Comprehensive monitoring of school facilities and emergency readiness</p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <AdminCard header="Infrastructure Audit">
            {!editing ? (
              <div className="table-responsive professional-table">
                <table className="table table-hover align-middle">
                  <tbody>
                    <tr><th className="text-muted small">Building Certificate</th><td className="fw-bold text-navy">{info.building_compliance_certificate || "-"}</td></tr>
                    <tr><th className="text-muted small">Stairs (Qty/Cond)</th><td>{info.stairs_count} / <span className="erp-badge">{info.stairs_condition}</span></td></tr>
                    <tr><th className="text-muted small">Ramps (Qty/Cond)</th><td>{info.ramps_count} / <span className="erp-badge">{info.ramps_condition}</span></td></tr>
                    <tr><th className="text-muted small">Drinking Water Outlets</th><td><span className="fw-bold text-navy">{info.drinking_water_outlets}</span></td></tr>
                    <tr><th className="text-muted small">Toilets (Boys/Girls)</th><td><span className="fw-bold text-navy">{info.toilets_boys} / {info.toilets_girls}</span></td></tr>
                  </tbody>
                </table>
                <button className="btn btn-navy btn-sm mt-3" onClick={() => { setForm(info); setEditing(true); }}>Update Audit</button>
              </div>
            ) : (
              <form className="row g-3" onSubmit={(e) => { e.preventDefault(); saveSection('physical-safety', form, setEditing); }}>
                <div className="col-md-6"><label className="small fw-bold">Building Cert</label><input className="form-control" value={form.building_compliance_certificate || ""} onChange={e => setForm({...form, building_compliance_certificate: e.target.value})} /></div>
                <div className="col-md-3"><label className="small fw-bold">Stairs Count</label><input type="number" className="form-control" value={form.stairs_count || ""} onChange={e => setForm({...form, stairs_count: e.target.value})} /></div>
                <div className="col-md-3"><label className="small fw-bold">Toilets (B)</label><input type="number" className="form-control" value={form.toilets_boys || ""} onChange={e => setForm({...form, toilets_boys: e.target.value})} /></div>
                <div className="col-12 d-flex gap-2 mt-3">
                  <button type="submit" className="btn btn-primary btn-sm">Save</button>
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            )}
          </AdminCard>
        </div>
        <div className="col-lg-4">
          <AdminCard header="Infrastructure Analytics">
            <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { display: false } } } }} />
          </AdminCard>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-6">
          <AdminCard header="Medical Readiness">
            {!editingMedical ? (
              <ul className="list-group list-group-flush professional-list small">
                <li className="list-group-item d-flex justify-content-between"><span>First Aid Kits:</span> <b>{medical.first_aid_kits_count}</b></li>
                <li className="list-group-item d-flex justify-content-between"><span>Ambulance Access:</span> <span className={`badge ${medical.ambulance_access ? 'bg-success' : 'bg-danger'}`}>{medical.ambulance_access ? 'YES' : 'NO'}</span></li>
                <li className="list-group-item d-flex justify-content-between"><span>Trained Staff:</span> <b>{medical.trained_first_aiders_count}</b></li>
              </ul>
            ) : (
              <div className="p-2">
                <input className="form-control mb-2" placeholder="Kits Count" value={medicalForm.first_aid_kits_count || ""} onChange={e => setMedicalForm({...medicalForm, first_aid_kits_count: e.target.value})} />
                <button className="btn btn-primary btn-sm" onClick={() => saveSection('medical-readiness', medicalForm, setEditingMedical)}>Save</button>
              </div>
            )}
            {!editingMedical && <button className="btn btn-link btn-sm text-navy" onClick={() => { setMedicalForm(medical); setEditingMedical(true); }}>Edit Details</button>}
          </AdminCard>
        </div>
        <div className="col-md-6">
          <AdminCard header="Surveillance & Security">
            <div className="d-flex align-items-center gap-4">
              <div className="security-stat text-center">
                <div className="fs-2 fw-bold text-navy">{surv.cctv_working_count || 0}</div>
                <div className="text-muted x-small">WORKING CAMERAS</div>
              </div>
              <div className="security-details small flex-grow-1">
                <div><b>Guards:</b> {surv.security_guards_count} ({surv.security_guard_shift})</div>
                <div><b>Visitor Log:</b> {surv.visitor_log_maintained ? '✅ Maintained' : '❌ Not Maintained'}</div>
              </div>
            </div>
            <button className="btn btn-link btn-sm text-navy p-0 mt-3" onClick={() => { setSurvForm(surv); setEditingSurv(true); }}>Update Security</button>
          </AdminCard>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12">
          <AdminCard>
            <TableContainer title="Compliance Certificates" toolbar={<Toolbar right={<span className="erp-badge badge-year">{certs.length} Active Records</span>} />}>
              <div className="table-responsive professional-table">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr><th>Type</th><th>Number</th><th>Issue Date</th><th>Expiry Date</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {certs.map(c => (
                      <tr key={c.id}>
                        <td><span className="fw-bold">{c.certificate_type}</span></td>
                        <td>{c.certificate_number}</td>
                        <td className="small">{new Date(c.issue_date).toLocaleDateString()}</td>
                        <td className="small">{new Date(c.expiry_date).toLocaleDateString()}</td>
                        <td><span className={`erp-badge ${c.status === 'valid' ? 'badge-success' : 'badge-danger'}`}>{c.status}</span></td>
                      </tr>
                    ))}
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
