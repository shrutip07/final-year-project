import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import Toolbar from "../../components/admin/Toolbar";
import EmptyState from "../../components/admin/EmptyState";
import TabNavigation from "../../components/admin/TabNavigation";
import ChatWidget from "../../components/ChatWidget";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function PhysicalSafety() {
  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("infrastructure");

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

  const safetyTabs = [
    { id: "infrastructure", label: "Physical Infrastructure", icon: "bi-building-check" },
    { id: "medical", label: "Medical Readiness", icon: "bi-hospital" },
    { id: "analytics", label: "Infrastructure Analytics", icon: "bi-bar-chart" },
    { id: "surveillance", label: "Security & Surveillance", icon: "bi-camera-video" },
    { id: "compliance", label: "Compliance Certificates", icon: "bi-patch-check" },
    { id: "emergency", label: "Emergency Response", icon: "bi-exclamation-triangle" },
  ];

  return (
    <div className="physical-safety-module">
      <div className="section-header-pro mb-3">
        <h3>Institutional Safety & Compliance</h3>
        <p>Monitor physical infrastructure, medical readiness, and security surveillance</p>
      </div>

      <TabNavigation
        tabs={safetyTabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="mt-3">
        {activeTab === "infrastructure" && (
          <AdminCard header={
            <div className="d-flex justify-content-between align-items-center w-100">
              <span>Physical Infrastructure</span>
              {!editing && <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(true)}><i className="bi bi-pencil me-1"></i> Edit Details</button>}
            </div>
          }>
            <div className="row justify-content-center">
              <div className="col-lg-10">
                {!editing ? (
                  <div className="safety-details-grid p-3 bg-light rounded-3 shadow-sm border">
                    <div className="row g-4">
                      <div className="col-md-6 border-bottom pb-3">
                        <span className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider">Building Certificate</span>
                        <span className="fw-bold text-dark fs-5">{info.building_compliance_certificate ?? "-"}</span>
                      </div>
                      <div className="col-md-6 border-bottom pb-3">
                        <span className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider">Expiry Date</span>
                        <span className="fw-bold text-dark fs-5">{info.building_compliance_date ? new Date(info.building_compliance_date).toLocaleDateString() : "-"}</span>
                      </div>
                      <div className="col-md-4">
                        <span className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider">Stairs</span>
                        <span className="text-dark fw-bold">{info.stairs_count ?? "-"} Units <small className="text-muted font-normal">({info.stairs_condition ?? "-"})</small></span>
                      </div>
                      <div className="col-md-4">
                        <span className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider">Ramps</span>
                        <span className="text-dark fw-bold">{info.ramps_count ?? "-"} Units <small className="text-muted font-normal">({info.ramps_condition ?? "-"})</small></span>
                      </div>
                      <div className="col-md-4">
                        <span className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider">Handrails</span>
                        <span className="text-dark fw-bold">{info.handrails_count ?? "-"} Units <small className="text-muted font-normal">({info.handrails_condition ?? "-"})</small></span>
                      </div>
                      <div className="col-12 bg-white p-3 rounded-3 border">
                        <div className="row align-items-center">
                          <div className="col-md-6 border-end">
                            <span className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider">Drinking Water Outlets</span>
                            <span className="fw-bold text-primary fs-4">{info.drinking_water_outlets ?? "-"} Outlets</span>
                          </div>
                          <div className="col-md-6 ps-md-4">
                            <span className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider">Last Quality Test</span>
                            <span className="text-dark fw-bold fs-5">{info.last_water_quality_test ? new Date(info.last_water_quality_test).toLocaleDateString() : "-"}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={savePhysical} className="p-4 bg-white rounded border shadow-sm">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">BUILDING COMPLIANCE CERTIFICATE</label>
                        <input name="building_compliance_certificate" className="form-control" value={form.building_compliance_certificate ?? ""} onChange={change} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">EXPIRY DATE</label>
                        <input name="building_compliance_date" type="date" className="form-control" value={form.building_compliance_date ? form.building_compliance_date.slice(0,10) : ""} onChange={change} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold text-muted">STAIRS COUNT</label>
                        <input name="stairs_count" type="number" className="form-control" value={form.stairs_count ?? ""} onChange={change} />
                      </div>
                      <div className="col-md-8">
                        <label className="form-label small fw-bold text-muted">STAIRS CONDITION</label>
                        <input name="stairs_condition" className="form-control" value={form.stairs_condition ?? ""} onChange={change} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold text-muted">RAMPS COUNT</label>
                        <input name="ramps_count" type="number" className="form-control" value={form.ramps_count ?? ""} onChange={change} />
                      </div>
                      <div className="col-md-8">
                        <label className="form-label small fw-bold text-muted">RAMPS CONDITION</label>
                        <input name="ramps_condition" className="form-control" value={form.ramps_condition ?? ""} onChange={change} />
                      </div>
                    </div>
                    <div className="d-flex gap-2 mt-4 pt-3 border-top">
                      <button type="submit" className="btn btn-primary px-4">Save Infrastructure Details</button>
                      <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </AdminCard>
        )}

        {activeTab === "medical" && (
          <AdminCard header={
            <div className="d-flex justify-content-between align-items-center w-100">
              <span>Medical Readiness</span>
              {!editingMedical && <button className="btn btn-sm btn-outline-primary" onClick={() => setEditingMedical(true)}><i className="bi bi-pencil me-1"></i> Edit Medical Info</button>}
            </div>
          }>
            <div className="row justify-content-center">
              <div className="col-lg-8">
                {!editingMedical ? (
                  <div className="medical-readiness-details">
                    <div className="row g-4">
                      <div className="col-md-6">
                        <div className="p-4 bg-light rounded-3 border text-center h-100">
                          <div className="icon-box bg-white text-success p-3 rounded-circle shadow-sm d-inline-block mb-3">
                            <i className="bi bi-plus-square-fill fs-3"></i>
                          </div>
                          <span className="text-muted small fw-bold d-block text-uppercase mb-1">First Aid Kits</span>
                          <span className="fw-bold fs-4 text-dark">{medical.first_aid_kits_count ?? "0"} Kits Available</span>
                          <p className="small text-muted mt-2 mb-0">Locations: {medical.first_aid_kit_locations ?? "Not specified"}</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-4 bg-light rounded-3 border text-center h-100">
                          <div className={`icon-box bg-white ${medical.ambulance_access ? 'text-success' : 'text-danger'} p-3 rounded-circle shadow-sm d-inline-block mb-3`}>
                            <i className={`bi ${medical.ambulance_access ? 'bi-truck' : 'bi-x-circle'} fs-3`}></i>
                          </div>
                          <span className="text-muted small fw-bold d-block text-uppercase mb-1">Ambulance Readiness</span>
                          <span className={`erp-badge fs-6 ${medical.ambulance_access ? 'badge-success' : 'badge-danger'}`}>
                            {medical.ambulance_access ? "AMBULANCE ACCESS READY" : "NO IMMEDIATE ACCESS"}
                          </span>
                          <p className="small text-muted mt-2 mb-0">Last Checked: {medical.last_medical_drill_date ? new Date(medical.last_medical_drill_date).toLocaleDateString() : "No drills recorded"}</p>
                        </div>
                      </div>
                      <div className="col-12">
                        <div className="p-4 bg-primary text-white rounded-3 shadow-sm border border-primary-subtle">
                          <div className="d-flex align-items-center gap-4">
                            <div className="fs-1 opacity-50"><i className="bi bi-hospital"></i></div>
                            <div>
                              <span className="small fw-bold text-uppercase opacity-75 d-block mb-1">Emergency Hospital Contact</span>
                              <h4 className="fw-bold mb-1">{medical.nearest_hospital_name ?? "No Hospital Configured"}</h4>
                              <div className="d-flex gap-4">
                                <span><i className="bi bi-geo-alt me-1"></i> Distance: <strong>{medical.nearest_hospital_distance_km ?? "-"} KM</strong></span>
                                <span><i className="bi bi-telephone me-1"></i> Emergency No: <strong>{medical.emergency_medical_contact ?? "N/A"}</strong></span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={saveMedical} className="p-4 bg-white rounded border shadow-sm">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">FIRST AID KITS COUNT</label>
                        <input name="first_aid_kits_count" type="number" className="form-control" value={medicalForm.first_aid_kits_count ?? ""} onChange={changeMedical} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">KIT LOCATIONS</label>
                        <input name="first_aid_kit_locations" className="form-control" value={medicalForm.first_aid_kit_locations ?? ""} onChange={changeMedical} />
                      </div>
                      <div className="col-md-8">
                        <label className="form-label small fw-bold text-muted">NEAREST HOSPITAL NAME</label>
                        <input name="nearest_hospital_name" className="form-control" value={medicalForm.nearest_hospital_name ?? ""} onChange={changeMedical} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold text-muted">DISTANCE (KM)</label>
                        <input name="nearest_hospital_distance_km" type="number" step="0.1" className="form-control" value={medicalForm.nearest_hospital_distance_km ?? ""} onChange={changeMedical} />
                      </div>
                    </div>
                    <div className="d-flex gap-2 mt-4 pt-3 border-top">
                      <button type="submit" className="btn btn-primary px-4">Update Medical Readiness</button>
                      <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setEditingMedical(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </AdminCard>
        )}

        {activeTab === "analytics" && (
          <AdminCard header="Infrastructure Analytics Overview">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="chart-container p-3 bg-white border rounded shadow-sm" style={{height: '450px'}}>
                  <Bar data={chartData} options={{ 
                    responsive: true, 
                    maintainAspectRatio: false, 
                    plugins: { 
                      legend: { display: false },
                      title: {
                        display: true,
                        text: 'Infrastructure Components Status Count',
                        padding: { bottom: 20 }
                      }
                    },
                    scales: {
                      y: { beginAtZero: true, ticks: { stepSize: 1 } }
                    }
                  }} />
                </div>
              </div>
            </div>
          </AdminCard>
        )}

        {activeTab === "surveillance" && (
          <AdminCard header={
            <div className="d-flex justify-content-between align-items-center w-100">
              <span>Security & Surveillance</span>
              {!editingSurv && <button className="btn btn-sm btn-outline-primary" onClick={() => setEditingSurv(true)}><i className="bi bi-pencil me-1"></i> Edit Security Configuration</button>}
            </div>
          }>
            <div className="row justify-content-center">
              <div className="col-lg-8">
                {!editingSurv ? (
                  <div className="surveillance-details">
                    <div className="row g-4 mb-4">
                      <div className="col-md-6">
                        <div className="p-4 border rounded shadow-sm text-center bg-light">
                          <span className="text-muted small fw-bold d-block text-uppercase mb-2">CCTV Infrastructure</span>
                          <span className="fs-1 fw-bold text-primary">{surv.cctv_working_count ?? "0"}</span>
                          <span className="text-muted fs-4">/{surv.cctv_cameras_count ?? "0"}</span>
                          <p className="small fw-bold text-success mb-0 mt-2">ACTIVE CAMERAS</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-4 border rounded shadow-sm text-center bg-light">
                          <span className="text-muted small fw-bold d-block text-uppercase mb-2">Security Manpower</span>
                          <span className="fs-1 fw-bold text-success">{surv.security_guards_count ?? "0"}</span>
                          <span className="small d-block text-muted fw-bold">ON DUTY ({surv.security_guard_shift ?? "GENERAL SHIFT"})</span>
                          <p className="small text-muted mb-0 mt-2">Armed: {surv.armed_guards_count > 0 ? 'YES' : 'NO'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-3 border shadow-sm">
                      <h6 className="fw-bold mb-3">Compliance & Logs</h6>
                      <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                        <span className="small fw-bold text-muted">VISITOR LOG MAINTAINED</span>
                        <span className={`erp-badge ${surv.visitor_log_maintained ? 'badge-success' : 'badge-danger'}`}>
                          {surv.visitor_log_maintained ? 'VERIFIED & ACTIVE' : 'NO ACTIVE LOG'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2">
                        <span className="small fw-bold text-muted">BOUNDARY WALL STATUS</span>
                        <span className={`erp-badge ${surv.boundary_wall_condition === 'good' ? 'badge-success' : 'badge-warning'}`}>
                          {surv.boundary_wall_condition ? surv.boundary_wall_condition.toUpperCase() : 'NOT INSPECTED'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="small fw-bold text-muted">NIGHT PATROLLING</span>
                        <span className={`erp-badge ${surv.night_patrolling ? 'badge-success' : 'badge-danger'}`}>
                          {surv.night_patrolling ? 'YES' : 'NO'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={saveSurv} className="p-4 bg-white rounded border shadow-sm">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">TOTAL CAMERAS</label>
                        <input name="cctv_cameras_count" type="number" className="form-control" value={survForm.cctv_cameras_count ?? ""} onChange={changeSurv} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">WORKING COUNT</label>
                        <input name="cctv_working_count" type="number" className="form-control" value={survForm.cctv_working_count ?? ""} onChange={changeSurv} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">SECURITY GUARDS</label>
                        <input name="security_guards_count" type="number" className="form-control" value={survForm.security_guards_count ?? ""} onChange={changeSurv} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">GUARD SHIFT</label>
                        <input name="security_guard_shift" className="form-control" value={survForm.security_guard_shift ?? ""} onChange={changeSurv} />
                      </div>
                    </div>
                    <div className="d-flex gap-2 mt-4 pt-3 border-top">
                      <button type="submit" className="btn btn-primary px-4">Save Security Config</button>
                      <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setEditingSurv(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </AdminCard>
        )}

        {activeTab === "compliance" && (
          <AdminCard header="Compliance Certificates Registry">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <form onSubmit={addCert} className="mb-4 p-3 bg-light rounded-3 border">
                  <h6 className="fw-bold mb-3 small text-muted text-uppercase">Add New Compliance Certificate</h6>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <input name="certificate_type" placeholder="Certificate Type (e.g. Health, Structural)" className="form-control" value={certForm.certificate_type} onChange={changeCert} required />
                    </div>
                    <div className="col-md-3">
                      <input name="issue_date" type="date" className="form-control" value={certForm.issue_date} onChange={changeCert} required title="Issue Date" />
                    </div>
                    <div className="col-md-3">
                      <input name="expiry_date" type="date" className="form-control" value={certForm.expiry_date} onChange={changeCert} title="Expiry Date" />
                    </div>
                    <div className="col-md-2">
                      <button type="submit" className="btn btn-success w-100 fw-bold">
                        <i className="bi bi-plus-lg me-2"></i> Register
                      </button>
                    </div>
                  </div>
                </form>

                <TableContainer title="">
                  <div className="table-responsive professional-table">
                    <table className="table align-middle">
                      <thead>
                        <tr>
                          <th>Certificate Type</th>
                          <th>Issued Date</th>
                          <th>Expiry Date</th>
                          <th>Status</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {certs.length > 0 ? certs.map((c) => (
                          <tr key={c.id}>
                            <td className="fw-bold text-dark">{c.certificate_type}</td>
                            <td>{c.issue_date ? new Date(c.issue_date).toLocaleDateString() : "-"}</td>
                            <td>{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : "Permanent"}</td>
                            <td>
                              <span className={`erp-badge ${c.status === 'valid' ? 'badge-success' : 'badge-danger'}`}>
                                {c.status ? c.status.toUpperCase() : 'UNKNOWN'}
                              </span>
                            </td>
                            <td className="text-end">
                              <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCert(c.id)}>
                                <i className="bi bi-trash me-1"></i> Delete
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr><td colSpan="5" className="text-center py-5 text-muted">
                            <EmptyState title="No Certificates" description="Register institutional compliance certificates to track them here." />
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </TableContainer>
              </div>
            </div>
          </AdminCard>
        )}

        {activeTab === "emergency" && (
          <AdminCard header={
            <div className="d-flex justify-content-between align-items-center w-100">
              <span>Emergency Response Framework</span>
              {!editingEmerg && <button className="btn btn-sm btn-outline-primary" onClick={() => setEditingEmerg(true)}><i className="bi bi-pencil me-1"></i> Edit Response Info</button>}
            </div>
          }>
            <div className="row justify-content-center">
              <div className="col-lg-8">
                {!editingEmerg ? (
                  <div className="emergency-details">
                    <div className="row g-4 mb-4">
                      <div className="col-md-6">
                        <div className="p-4 bg-white border rounded shadow-sm h-100">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted small fw-bold text-uppercase">Annual Training</span>
                            <i className="bi bi-journal-check text-primary fs-4"></i>
                          </div>
                          <span className="fs-1 fw-bold text-dark">{emerg.emergency_drills_per_year ?? "0"}</span>
                          <span className="text-muted ms-2">Drills/Year</span>
                          <p className="small text-muted mt-2 mb-0">Last Mock Drill: <strong>{emerg.last_mock_drill_date ? new Date(emerg.last_mock_drill_date).toLocaleDateString() : "Never"}</strong></p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-4 bg-white border rounded shadow-sm h-100">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="text-muted small fw-bold text-uppercase">CPR Certified</span>
                            <i className="bi bi-heart-pulse text-danger fs-4"></i>
                          </div>
                          <span className="fs-1 fw-bold text-dark">{emerg.staff_trained_in_cpr_count ?? "0"}</span>
                          <span className="text-muted ms-2">Certified Staff</span>
                          <p className="small text-muted mt-2 mb-0">Requirement Met: <span className="text-success fw-bold">YES</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 p-4 bg-light rounded-3 border border-primary-subtle shadow-sm">
                      <div className="d-flex align-items-center gap-3 mb-3">
                        <div className="icon-box bg-primary text-white p-2 rounded shadow-sm"><i className="bi bi-people-fill"></i></div>
                        <h6 className="fw-bold mb-0">Disaster Management Committee</h6>
                      </div>
                      <div className="p-3 bg-white rounded border">
                        <p className="mb-0 text-dark" style={{whiteSpace: 'pre-line'}}>{emerg.committee_members ?? "Committee members have not been assigned yet. Please configure the disaster response team."}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={saveEmerg} className="p-4 bg-white rounded border shadow-sm">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">MOCK DRILLS PER YEAR</label>
                        <input name="emergency_drills_per_year" type="number" className="form-control" value={emergForm.emergency_drills_per_year ?? ""} onChange={changeEmerg} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">CPR TRAINED STAFF COUNT</label>
                        <input name="staff_trained_in_cpr_count" type="number" className="form-control" value={emergForm.staff_trained_in_cpr_count ?? ""} onChange={changeEmerg} />
                      </div>
                      <div className="col-md-12">
                        <label className="form-label small fw-bold text-muted">LAST MOCK DRILL DATE</label>
                        <input name="last_mock_drill_date" type="date" className="form-control" value={emergForm.last_mock_drill_date ? emergForm.last_mock_drill_date.slice(0, 10) : ""} onChange={changeEmerg} />
                      </div>
                      <div className="col-12">
                        <label className="form-label small fw-bold text-muted">COMMITTEE MEMBERS & RESPONSIBILITIES</label>
                        <textarea name="committee_members" className="form-control" rows="4" value={emergForm.committee_members ?? ""} onChange={changeEmerg} placeholder="List committee members and their emergency roles..." />
                      </div>
                    </div>
                    <div className="d-flex gap-2 mt-4 pt-3 border-top">
                      <button type="submit" className="btn btn-primary px-4">Update Response Framework</button>
                      <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setEditingEmerg(false)}>Cancel</button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </AdminCard>
        )}
      </div>
      <ChatWidget />
    </div>
  );
}
