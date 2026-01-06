import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import Toolbar from "../../components/admin/Toolbar";
import EmptyState from "../../components/admin/EmptyState";
import ChatWidget from "../../components/ChatWidget";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function PhysicalSafety() {
  const token = localStorage.getItem("token");

  // Physical safety
  const [info, setInfo] = useState({});
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  // Medical
  const [medical, setMedical] = useState({});
  const [editingMedical, setEditingMedical] = useState(false);
  const [medicalForm, setMedicalForm] = useState({});

  // Surveillance
  const [surv, setSurv] = useState({});
  const [editingSurv, setEditingSurv] = useState(false);
  const [survForm, setSurvForm] = useState({});

  // Emergency
  const [emerg, setEmerg] = useState({});
  const [editingEmerg, setEditingEmerg] = useState(false);
  const [emergForm, setEmergForm] = useState({});

  // Certificates
  const [certs, setCerts] = useState([]);
  const [certForm, setCertForm] = useState({
    certificate_type: "",
    certificate_number: "",
    issue_date: "",
    expiry_date: "",
    status: "valid"
  });

  // Analytics (existing)
  const [analytics, setAnalytics] = useState({});

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    await Promise.all([
      fetchPhysical(),
      fetchPhysicalAnalytics(),
      fetchMedical(),
      fetchSurveillance(),
      fetchEmergency(),
      fetchCertificates()
    ]);
  }

  // Fetch functions
  async function fetchPhysical() {
    try {
      const res = await fetch("http://localhost:5000/api/clerk/physical-safety", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      setInfo(json || {});
      setForm(json || {});
    } catch (err) {
      console.error("fetchPhysical error", err);
    }
  }

  async function fetchPhysicalAnalytics() {
    try {
      const res = await fetch("http://localhost:5000/api/clerk/physical-safety/analytics", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      setAnalytics(json || {});
    } catch (err) {
      console.error("fetchPhysicalAnalytics error", err);
    }
  }

  async function fetchMedical() {
    try {
      const res = await fetch("http://localhost:5000/api/clerk/medical-readiness", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      setMedical(json || {});
      setMedicalForm(json || {});
    } catch (err) {
      console.error("fetchMedical error", err);
    }
  }

  async function fetchSurveillance() {
    try {
      const res = await fetch("http://localhost:5000/api/clerk/surveillance", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      setSurv(json || {});
      setSurvForm(json || {});
    } catch (err) {
      console.error("fetchSurveillance error", err);
    }
  }

  async function fetchEmergency() {
    try {
      const res = await fetch("http://localhost:5000/api/clerk/emergency-response", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      setEmerg(json || {});
      setEmergForm(json || {});
    } catch (err) {
      console.error("fetchEmergency error", err);
    }
  }

  async function fetchCertificates() {
    try {
      const res = await fetch("http://localhost:5000/api/clerk/compliance-certificates", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      setCerts(json || []);
    } catch (err) {
      console.error("fetchCertificates error", err);
    }
  }

  // Generic change handlers
  const change = (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [e.target.name]: v }));
  };
  const changeMedical = (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setMedicalForm((f) => ({ ...f, [e.target.name]: v }));
  };
  const changeSurv = (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setSurvForm((f) => ({ ...f, [e.target.name]: v }));
  };
  const changeEmerg = (e) => {
    const v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setEmergForm((f) => ({ ...f, [e.target.name]: v }));
  };
  const changeCert = (e) => {
    const v = e.target.value;
    setCertForm((f) => ({ ...f, [e.target.name]: v }));
  };

  // Save handlers
  const savePhysical = async (e) => {
    e && e.preventDefault && e.preventDefault();
    try {
      await fetch("http://localhost:5000/api/clerk/physical-safety", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      setEditing(false);
      fetchPhysical();
      fetchPhysicalAnalytics();
    } catch (err) {
      console.error("savePhysical error", err);
    }
  };

  const saveMedical = async (e) => {
    e && e.preventDefault && e.preventDefault();
    try {
      await fetch("http://localhost:5000/api/clerk/medical-readiness", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(medicalForm)
      });
      setEditingMedical(false);
      fetchMedical();
    } catch (err) {
      console.error("saveMedical error", err);
    }
  };

  const saveSurv = async (e) => {
    e && e.preventDefault && e.preventDefault();
    try {
      await fetch("http://localhost:5000/api/clerk/surveillance", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(survForm)
      });
      setEditingSurv(false);
      fetchSurveillance();
    } catch (err) {
      console.error("saveSurv error", err);
    }
  };

  const saveEmerg = async (e) => {
    e && e.preventDefault && e.preventDefault();
    try {
      await fetch("http://localhost:5000/api/clerk/emergency-response", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(emergForm)
      });
      setEditingEmerg(false);
      fetchEmergency();
    } catch (err) {
      console.error("saveEmerg error", err);
    }
  };

  const addCert = async (e) => {
    e && e.preventDefault && e.preventDefault();
    try {
      await fetch("http://localhost:5000/api/clerk/compliance-certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(certForm)
      });
      setCertForm({
        certificate_type: "",
        certificate_number: "",
        issue_date: "",
        expiry_date: "",
        status: "valid"
      });
      fetchCertificates();
    } catch (err) {
      console.error("addCert error", err);
    }
  };

  const deleteCert = async (id) => {
    if (!window.confirm("Delete certificate?")) return;
    try {
      await fetch(`http://localhost:5000/api/clerk/compliance-certificates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCertificates();
    } catch (err) {
      console.error("deleteCert error", err);
    }
  };

  const chartData = {
    labels: ["Stairs", "Ramps", "Handrails", "Water Outlets", "Toilets Boys", "Toilets Girls"],
    datasets: [
      {
        label: "Count",
        data: [
          analytics.stairs ?? 0,
          analytics.ramps ?? 0,
          analytics.handrails ?? 0,
          analytics.drinking_water_outlets ?? 0,
          analytics.toilets_boys ?? 0,
          analytics.toilets_girls ?? 0
        ],
        backgroundColor: ["#002E6D", "#00A9A5", "#FFC145", "#0057D9", "#7C3AED", "#E11D48"],
        borderRadius: 6
      }
    ]
  };

  return (
    <div className="physical-safety-module">
      <div className="section-header-pro">
        <h3>Institutional Safety & Compliance</h3>
        <p>Monitor physical infrastructure, medical readiness, and security surveillance</p>
      </div>

      <div className="row g-4">
        {/* LEFT COLUMN */}
        <div className="col-lg-6">
          <AdminCard header={
            <div className="d-flex justify-content-between align-items-center w-100">
              <span>Physical Infrastructure</span>
              {!editing && <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(true)}><i className="bi bi-pencil me-1"></i> Edit</button>}
            </div>
          }>
            {!editing ? (
              <div className="safety-details-grid">
                <div className="row g-3">
                  <div className="col-md-6 border-bottom pb-2">
                    <span className="text-muted small fw-bold d-block">BUILDING CERTIFICATE</span>
                    <span className="fw-bold">{info.building_compliance_certificate ?? "-"}</span>
                  </div>
                  <div className="col-md-6 border-bottom pb-2">
                    <span className="text-muted small fw-bold d-block">EXPIRY DATE</span>
                    <span className="fw-bold">{info.building_compliance_date ? new Date(info.building_compliance_date).toLocaleDateString() : "-"}</span>
                  </div>
                  <div className="col-md-4">
                    <span className="text-muted small fw-bold d-block">STAIRS</span>
                    <span className="text-dark">{info.stairs_count ?? "-"} ({info.stairs_condition ?? "-"})</span>
                  </div>
                  <div className="col-md-4">
                    <span className="text-muted small fw-bold d-block">RAMPS</span>
                    <span className="text-dark">{info.ramps_count ?? "-"} ({info.ramps_condition ?? "-"})</span>
                  </div>
                  <div className="col-md-4">
                    <span className="text-muted small fw-bold d-block">HANDRAILS</span>
                    <span className="text-dark">{info.handrails_count ?? "-"} ({info.handrails_condition ?? "-"})</span>
                  </div>
                  <div className="col-md-12 bg-light p-2 rounded">
                    <div className="row">
                      <div className="col-6">
                        <span className="text-muted small fw-bold d-block">WATER OUTLETS</span>
                        <span className="fw-bold text-primary">{info.drinking_water_outlets ?? "-"} Units</span>
                      </div>
                      <div className="col-6">
                        <span className="text-muted small fw-bold d-block">LAST QUALITY TEST</span>
                        <span className="small">{info.last_water_quality_test ? new Date(info.last_water_quality_test).toLocaleDateString() : "-"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={savePhysical} className="row g-2">
                <div className="col-md-6"><label className="form-label small fw-bold">CERTIFICATE</label><input name="building_compliance_certificate" className="form-control form-control-sm" value={form.building_compliance_certificate ?? ""} onChange={change} /></div>
                <div className="col-md-6"><label className="form-label small fw-bold">DATE</label><input name="building_compliance_date" type="date" className="form-control form-control-sm" value={form.building_compliance_date ? form.building_compliance_date.slice(0,10) : ""} onChange={change} /></div>
                <div className="col-md-4"><label className="form-label small fw-bold">STAIRS</label><input name="stairs_count" type="number" className="form-control form-control-sm" value={form.stairs_count ?? ""} onChange={change} /></div>
                <div className="col-md-8"><label className="form-label small fw-bold">CONDITION</label><input name="stairs_condition" className="form-control form-control-sm" value={form.stairs_condition ?? ""} onChange={change} /></div>
                <div className="col-md-12 d-flex gap-2 mt-3">
                  <button type="submit" className="btn btn-sm btn-primary flex-grow-1">Save Changes</button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </form>
            )}
          </AdminCard>

          <AdminCard header={
            <div className="d-flex justify-content-between align-items-center w-100">
              <span>Medical Readiness</span>
              {!editingMedical && <button className="btn btn-sm btn-outline-primary" onClick={() => setEditingMedical(true)}><i className="bi bi-pencil me-1"></i> Edit</button>}
            </div>
          }>
            {!editingMedical ? (
              <div className="medical-readiness-details">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="icon-box bg-soft-success text-success p-2 rounded"><i className="bi bi-plus-square-fill fs-4"></i></div>
                    <div>
                      <span className="text-muted small fw-bold d-block">FIRST AID KITS</span>
                      <span className="fw-bold">{medical.first_aid_kits_count ?? "-"} Units in {medical.first_aid_kit_locations ?? "-"}</span>
                    </div>
                  </div>
                  <span className={`erp-badge ${medical.ambulance_access ? 'badge-success' : 'badge-danger'}`}>
                    {medical.ambulance_access ? "AMBULANCE READY" : "NO AMBULANCE"}
                  </span>
                </div>
                <div className="p-3 bg-light rounded-3">
                  <span className="text-muted small fw-bold d-block mb-1">NEAREST HOSPITAL</span>
                  <span className="fw-bold text-dark">{medical.nearest_hospital_name ?? "-"}</span>
                  <span className="text-muted small ms-2">({medical.nearest_hospital_distance_km ?? "-"} km away)</span>
                </div>
              </div>
            ) : (
              <form onSubmit={saveMedical} className="row g-2">
                <div className="col-md-6"><label className="form-label small fw-bold">KITS COUNT</label><input name="first_aid_kits_count" type="number" className="form-control form-control-sm" value={medicalForm.first_aid_kits_count ?? ""} onChange={changeMedical} /></div>
                <div className="col-md-6"><label className="form-label small fw-bold">HOSPITAL NAME</label><input name="nearest_hospital_name" className="form-control form-control-sm" value={medicalForm.nearest_hospital_name ?? ""} onChange={changeMedical} /></div>
                <div className="col-md-12 d-flex gap-2 mt-3">
                  <button type="submit" className="btn btn-sm btn-primary flex-grow-1">Save Medical Info</button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setEditingMedical(false)}>Cancel</button>
                </div>
              </form>
            )}
          </AdminCard>

          <AdminCard header="Infrastructure Analytics">
            <div style={{height: '300px'}}>
              <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </AdminCard>
        </div>

        {/* RIGHT COLUMN */}
        <div className="col-lg-6">
          <AdminCard header={
            <div className="d-flex justify-content-between align-items-center w-100">
              <span>Security & Surveillance</span>
              {!editingSurv && <button className="btn btn-sm btn-outline-primary" onClick={() => setEditingSurv(true)}><i className="bi bi-pencil me-1"></i> Edit</button>}
            </div>
          }>
            {!editingSurv ? (
              <div className="surveillance-details">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="p-3 border rounded text-center">
                      <span className="text-muted small fw-bold d-block">WORKING CAMERAS</span>
                      <span className="fs-3 fw-bold text-primary">{surv.cctv_working_count ?? "0"}<small className="text-muted fs-6">/{surv.cctv_cameras_count ?? "0"}</small></span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 border rounded text-center">
                      <span className="text-muted small fw-bold d-block">SECURITY STAFF</span>
                      <span className="fs-3 fw-bold text-success">{surv.security_guards_count ?? "0"}</span>
                      <span className="small d-block text-muted">{surv.security_guard_shift ?? "-"}</span>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center bg-light p-2 rounded">
                      <span className="small fw-bold text-muted">VISITOR LOG MAINTAINED</span>
                      <span className={`erp-badge ${surv.visitor_log_maintained ? 'badge-success' : 'badge-danger'}`}>{surv.visitor_log_maintained ? 'YES' : 'NO'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={saveSurv} className="row g-2">
                <div className="col-md-6"><label className="form-label small fw-bold">TOTAL CAMERAS</label><input name="cctv_cameras_count" type="number" className="form-control form-control-sm" value={survForm.cctv_cameras_count ?? ""} onChange={changeSurv} /></div>
                <div className="col-md-6"><label className="form-label small fw-bold">WORKING COUNT</label><input name="cctv_working_count" type="number" className="form-control form-control-sm" value={survForm.cctv_working_count ?? ""} onChange={changeSurv} /></div>
                <div className="col-md-12 d-flex gap-2 mt-3">
                  <button type="submit" className="btn btn-sm btn-primary flex-grow-1">Save Surveillance</button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setEditingSurv(false)}>Cancel</button>
                </div>
              </form>
            )}
          </AdminCard>

          <AdminCard header="Compliance Certificates">
            <form onSubmit={addCert} className="mb-4">
              <div className="row g-2">
                <div className="col-md-5"><input name="certificate_type" placeholder="Certificate Type" className="form-control form-control-sm" value={certForm.certificate_type} onChange={changeCert} required /></div>
                <div className="col-md-4"><input name="issue_date" type="date" className="form-control form-control-sm" value={certForm.issue_date} onChange={changeCert} required /></div>
                <div className="col-md-3"><button type="submit" className="btn btn-sm btn-success w-100"><i className="bi bi-plus"></i> Add</button></div>
              </div>
            </form>

            <TableContainer title="">
              <div className="table-responsive professional-table" style={{maxHeight: '300px'}}>
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Issued</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {certs.length > 0 ? certs.map((c) => (
                      <tr key={c.id}>
                        <td className="fw-bold">{c.certificate_type}</td>
                        <td className="small">{c.issue_date ? new Date(c.issue_date).toLocaleDateString() : "-"}</td>
                        <td><span className={`erp-badge ${c.status === 'valid' ? 'badge-success' : 'badge-danger'}`}>{c.status}</span></td>
                        <td className="text-end"><button className="btn btn-sm btn-outline-danger border-0" onClick={() => deleteCert(c.id)}><i className="bi bi-trash"></i></button></td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="text-center text-muted small py-3">No certificates found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TableContainer>
          </AdminCard>

          <AdminCard header={
            <div className="d-flex justify-content-between align-items-center w-100">
              <span>Emergency Response</span>
              {!editingEmerg && <button className="btn btn-sm btn-outline-primary" onClick={() => setEditingEmerg(true)}><i className="bi bi-pencil me-1"></i> Edit</button>}
            </div>
          }>
            {!editingEmerg ? (
              <div className="emergency-details">
                <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
                  <span className="text-muted small fw-bold">DRILLS PER YEAR</span>
                  <span className="fw-bold text-dark">{emerg.emergency_drills_per_year ?? "0"} Mock Drills</span>
                </div>
                <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
                  <span className="text-muted small fw-bold">LAST MOCK DRILL</span>
                  <span className="text-dark">{emerg.last_mock_drill_date ? new Date(emerg.last_mock_drill_date).toLocaleDateString() : "-"}</span>
                </div>
                <div className="d-flex justify-content-between mb-2 border-bottom pb-2">
                  <span className="text-muted small fw-bold">CPR TRAINED STAFF</span>
                  <span className="fw-bold text-primary">{emerg.staff_trained_in_cpr_count ?? "0"} Persons</span>
                </div>
                <div className="mt-3 p-3 bg-soft-primary rounded border border-primary-subtle">
                  <span className="text-muted small fw-bold d-block mb-1">DISASTER COMMITTEE</span>
                  <p className="small mb-0 text-dark">{emerg.committee_members ?? "No members assigned yet."}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={saveEmerg} className="row g-2">
                <div className="col-md-6"><label className="form-label small fw-bold">DRILLS/YEAR</label><input name="emergency_drills_per_year" type="number" className="form-control form-control-sm" value={emergForm.emergency_drills_per_year ?? ""} onChange={changeEmerg} /></div>
                <div className="col-md-6"><label className="form-label small fw-bold">CPR TRAINED</label><input name="staff_trained_in_cpr_count" type="number" className="form-control form-control-sm" value={emergForm.staff_trained_in_cpr_count ?? ""} onChange={changeEmerg} /></div>
                <div className="col-12"><label className="form-label small fw-bold">COMMITTEE MEMBERS</label><textarea name="committee_members" className="form-control form-control-sm" value={emergForm.committee_members ?? ""} onChange={changeEmerg} /></div>
                <div className="col-md-12 d-flex gap-2 mt-3">
                  <button type="submit" className="btn btn-sm btn-primary flex-grow-1">Save Emergency Info</button>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setEditingEmerg(false)}>Cancel</button>
                </div>
              </form>
            )}
          </AdminCard>
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}
