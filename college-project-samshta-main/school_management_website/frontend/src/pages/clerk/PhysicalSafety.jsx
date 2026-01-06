import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import EmptyState from "../../components/admin/EmptyState";
import TabNavigation from "../../components/admin/TabNavigation";
import PageHeader from "../../components/admin/PageHeader";
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
    <div className="physical-safety-module container-fluid px-0">
      <PageHeader 
        title="Institutional Safety & Compliance" 
        subtitle="Monitor physical infrastructure, medical readiness, and security surveillance"
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
              <div className="col-xl-9 col-lg-11">
                <AdminCard header={
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <h5 className="mb-0 fw-bold">Physical Infrastructure Details</h5>
                    {!editing && (
                      <button className="btn btn-sm btn-primary px-3" onClick={() => setEditing(true)}>
                        <i className="bi bi-pencil-square me-1"></i> Edit Details
                      </button>
                    )}
                  </div>
                }>
                  {!editing ? (
                    <div className="infrastructure-view p-2">
                      <div className="row g-4">
                        <div className="col-md-6">
                          <div className="p-3 bg-light rounded-3 border-start border-4 border-primary h-100 shadow-sm">
                            <span className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider">Building Certificate</span>
                            <span className="fw-bold text-dark fs-5">{info.building_compliance_certificate ?? "-"}</span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="p-3 bg-light rounded-3 border-start border-4 border-info h-100 shadow-sm">
                            <span className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider">Expiry Date</span>
                            <span className="fw-bold text-dark fs-5">
                              {info.building_compliance_date 
                                ? new Date(info.building_compliance_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) 
                                : "-"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="col-md-4">
                          <div className="p-3 bg-white rounded-3 border h-100">
                            <span className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider">Stairs</span>
                            <span className="text-dark fw-bold fs-5">{info.stairs_count ?? "0"} Units</span>
                            <div className="mt-1"><span className="badge bg-primary-subtle text-primary border border-primary-subtle">{info.stairs_condition ?? "Good"}</span></div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="p-3 bg-white rounded-3 border h-100">
                            <span className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider">Ramps</span>
                            <span className="text-dark fw-bold fs-5">{info.ramps_count ?? "0"} Units</span>
                            <div className="mt-1"><span className="badge bg-info-subtle text-info border border-info-subtle">{info.ramps_condition ?? "Good"}</span></div>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="p-3 bg-white rounded-3 border h-100">
                            <span className="text-muted small fw-bold d-block text-uppercase mb-1 tracking-wider">Handrails</span>
                            <span className="text-dark fw-bold fs-5">{info.handrails_count ?? "0"} Units</span>
                            <div className="mt-1"><span className="badge bg-warning-subtle text-warning border border-warning-subtle">{info.handrails_condition ?? "Good"}</span></div>
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="p-4 bg-primary text-white rounded-3 shadow-sm border border-primary-subtle">
                            <div className="row align-items-center">
                              <div className="col-md-6 border-end border-white border-opacity-25">
                                <div className="d-flex align-items-center gap-3">
                                  <div className="fs-1 opacity-50"><i className="bi bi-droplet-fill"></i></div>
                                  <div>
                                    <span className="small fw-bold text-uppercase opacity-75 d-block mb-1">Drinking Water Outlets</span>
                                    <h3 className="fw-bold mb-0">{info.drinking_water_outlets ?? "0"} Active Outlets</h3>
                                  </div>
                                </div>
                              </div>
                              <div className="col-md-6 ps-md-4 mt-3 mt-md-0">
                                <span className="small fw-bold text-uppercase opacity-75 d-block mb-1">Last Quality Test</span>
                                <h4 className="fw-bold mb-0">
                                  {info.last_water_quality_test 
                                    ? new Date(info.last_water_quality_test).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) 
                                    : "-"}
                                </h4>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={savePhysical} className="p-2">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted">BUILDING COMPLIANCE CERTIFICATE</label>
                          <input name="building_compliance_certificate" className="form-control form-control-lg" value={form.building_compliance_certificate ?? ""} onChange={change} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted">EXPIRY DATE</label>
                          <input name="building_compliance_date" type="date" className="form-control form-control-lg" value={form.building_compliance_date ? form.building_compliance_date.slice(0,10) : ""} onChange={change} />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small fw-bold text-muted">STAIRS COUNT</label>
                          <input name="stairs_count" type="number" className="form-control" value={form.stairs_count ?? ""} onChange={change} />
                        </div>
                        <div className="col-md-8">
                          <label className="form-label small fw-bold text-muted">STAIRS CONDITION</label>
                          <input name="stairs_condition" className="form-control" value={form.stairs_condition ?? ""} onChange={change} placeholder="e.g. Excellent / Good / Needs Repair" />
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
                        <button type="submit" className="btn btn-primary px-5">Save Infrastructure Details</button>
                        <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setEditing(false)}>Cancel</button>
                      </div>
                    </form>
                  )}
                </AdminCard>
              </div>
            </div>
          )}

          {activeTab === "medical" && (
            <div className="row justify-content-center">
              <div className="col-xl-8 col-lg-10">
                <AdminCard header={
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <h5 className="mb-0 fw-bold">Medical Readiness Details</h5>
                    {!editingMedical && (
                      <button className="btn btn-sm btn-primary px-3" onClick={() => setEditingMedical(true)}>
                        <i className="bi bi-pencil-square me-1"></i> Edit Medical Info
                      </button>
                    )}
                  </div>
                }>
                  {!editingMedical ? (
                    <div className="medical-readiness-view p-2">
                      <div className="row g-4">
                        <div className="col-md-6">
                          <div className="p-4 bg-light rounded-3 border text-center h-100 shadow-sm border-start border-4 border-success">
                            <div className="icon-box bg-white text-success p-3 rounded-circle shadow-sm d-inline-block mb-3 border">
                              <i className="bi bi-plus-square-fill fs-3"></i>
                            </div>
                            <span className="text-muted small fw-bold d-block text-uppercase mb-1">First Aid Kits</span>
                            <span className="fw-bold fs-4 text-dark">{medical.first_aid_kits_count ?? "0"} Kits Available</span>
                            <div className="mt-2 py-1 px-3 bg-white rounded border d-inline-block small text-muted">
                              Locations: {medical.first_aid_kit_locations ?? "Not specified"}
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="p-4 bg-light rounded-3 border text-center h-100 shadow-sm border-start border-4 border-danger">
                            <div className={`icon-box bg-white ${medical.ambulance_access ? 'text-success' : 'text-danger'} p-3 rounded-circle shadow-sm d-inline-block mb-3 border`}>
                              <i className={`bi ${medical.ambulance_access ? 'bi-truck' : 'bi-x-circle'} fs-3`}></i>
                            </div>
                            <span className="text-muted small fw-bold d-block text-uppercase mb-1">Ambulance Readiness</span>
                            <span className={`badge ${medical.ambulance_access ? 'bg-success' : 'bg-danger'} fs-6 px-3 py-2 mb-2`}>
                              {medical.ambulance_access ? "READY FOR DISPATCH" : "NO IMMEDIATE ACCESS"}
                            </span>
                            <p className="small text-muted mt-1 mb-0 fw-medium">Last Drilled: {medical.last_medical_drill_date ? new Date(medical.last_medical_drill_date).toLocaleDateString() : "No records"}</p>
                          </div>
                        </div>
                        <div className="col-12">
                          <div className="p-4 bg-danger text-white rounded-3 shadow-sm border border-danger-subtle">
                            <div className="d-flex align-items-center gap-4">
                              <div className="fs-1 opacity-50"><i className="bi bi-hospital"></i></div>
                              <div className="flex-grow-1">
                                <span className="small fw-bold text-uppercase opacity-75 d-block mb-1">Emergency Medical Partnership</span>
                                <h4 className="fw-bold mb-2">{medical.nearest_hospital_name ?? "Emergency Hospital Not Configured"}</h4>
                                <div className="d-flex flex-wrap gap-4">
                                  <span className="badge bg-white text-danger px-3"><i className="bi bi-geo-alt me-1"></i> Distance: {medical.nearest_hospital_distance_km ?? "-"} KM</span>
                                  <span className="badge bg-white text-danger px-3"><i className="bi bi-telephone-fill me-1"></i> Helpline: {medical.emergency_medical_contact ?? "N/A"}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={saveMedical} className="p-2">
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
                        <div className="col-md-12">
                          <label className="form-label small fw-bold text-muted">EMERGENCY CONTACT NUMBER</label>
                          <input name="emergency_medical_contact" className="form-control" value={medicalForm.emergency_medical_contact ?? ""} onChange={changeMedical} />
                        </div>
                      </div>
                      <div className="d-flex gap-2 mt-4 pt-3 border-top">
                        <button type="submit" className="btn btn-primary px-5">Update Medical Readiness</button>
                        <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setEditingMedical(false)}>Cancel</button>
                      </div>
                    </form>
                  )}
                </AdminCard>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="row justify-content-center">
              <div className="col-xl-10 col-lg-12">
                <AdminCard header={<h5 className="mb-0 fw-bold">Infrastructure Components Distribution</h5>}>
                  <div className="chart-container p-4 bg-white border rounded shadow-sm" style={{height: '450px'}}>
                    <Bar data={chartData} options={{ 
                      responsive: true, 
                      maintainAspectRatio: false, 
                      plugins: { 
                        legend: { display: false },
                        title: {
                          display: false
                        }
                      },
                      scales: {
                        y: { 
                          beginAtZero: true, 
                          ticks: { stepSize: 1 },
                          grid: { color: 'rgba(0,0,0,0.05)' }
                        },
                        x: {
                          grid: { display: false }
                        }
                      }
                    }} />
                  </div>
                </AdminCard>
              </div>
            </div>
          )}

          {activeTab === "surveillance" && (
            <div className="row justify-content-center">
              <div className="col-xl-9 col-lg-11">
                <AdminCard header={
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <h5 className="mb-0 fw-bold">Security & Surveillance Configuration</h5>
                    {!editingSurv && (
                      <button className="btn btn-sm btn-primary px-3" onClick={() => setEditingSurv(true)}>
                        <i className="bi bi-pencil-square me-1"></i> Edit Security Config
                      </button>
                    )}
                  </div>
                }>
                  {!editingSurv ? (
                    <div className="surveillance-view p-2">
                      <div className="row g-4 mb-4">
                        <div className="col-md-6">
                          <div className="p-4 border rounded-3 shadow-sm text-center bg-light border-start border-4 border-primary">
                            <span className="text-muted small fw-bold d-block text-uppercase mb-2 tracking-wider">CCTV Infrastructure</span>
                            <div className="d-flex align-items-center justify-content-center">
                              <span className="fs-1 fw-bold text-primary">{surv.cctv_working_count ?? "0"}</span>
                              <span className="text-muted fs-3 ms-1">/{surv.cctv_cameras_count ?? "0"}</span>
                            </div>
                            <span className="badge bg-success-subtle text-success border border-success-subtle mt-2 px-3 py-2 fw-bold">ACTIVE & OPERATIONAL</span>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="p-4 border rounded-3 shadow-sm text-center bg-light border-start border-4 border-info">
                            <span className="text-muted small fw-bold d-block text-uppercase mb-2 tracking-wider">Security Manpower</span>
                            <span className="fs-1 fw-bold text-dark">{surv.security_guards_count ?? "0"}</span>
                            <span className="small d-block text-muted fw-bold">GUARDS ON DUTY</span>
                            <span className="badge bg-info-subtle text-info border border-info-subtle mt-2 px-3 py-2 fw-bold">{surv.security_guard_shift ?? "GENERAL SHIFT"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-3 border shadow-sm">
                        <h6 className="fw-bold mb-4 d-flex align-items-center">
                          <i className="bi bi-shield-check text-success me-2 fs-5"></i> 
                          Compliance & Protocol Verification
                        </h6>
                        <div className="row g-3">
                          <div className="col-md-4">
                            <div className="p-3 border rounded text-center h-100 bg-light">
                              <span className="small fw-bold text-muted d-block mb-2">VISITOR LOGS</span>
                              <span className={`badge ${surv.visitor_log_maintained ? 'bg-success' : 'bg-danger'} w-100 py-2`}>
                                {surv.visitor_log_maintained ? 'VERIFIED' : 'NOT ACTIVE'}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="p-3 border rounded text-center h-100 bg-light">
                              <span className="small fw-bold text-muted d-block mb-2">BOUNDARY WALL</span>
                              <span className={`badge ${surv.boundary_wall_condition === 'good' ? 'bg-success' : 'bg-warning'} w-100 py-2`}>
                                {surv.boundary_wall_condition ? surv.boundary_wall_condition.toUpperCase() : 'UNKNOWN'}
                              </span>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="p-3 border rounded text-center h-100 bg-light">
                              <span className="small fw-bold text-muted d-block mb-2">NIGHT PATROLLING</span>
                              <span className={`badge ${surv.night_patrolling ? 'bg-success' : 'bg-danger'} w-100 py-2`}>
                                {surv.night_patrolling ? 'YES' : 'NO'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={saveSurv} className="p-2">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted">TOTAL CCTV CAMERAS</label>
                          <input name="cctv_cameras_count" type="number" className="form-control" value={survForm.cctv_cameras_count ?? ""} onChange={changeSurv} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted">WORKING COUNT</label>
                          <input name="cctv_working_count" type="number" className="form-control" value={survForm.cctv_working_count ?? ""} onChange={changeSurv} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted">SECURITY GUARDS COUNT</label>
                          <input name="security_guards_count" type="number" className="form-control" value={survForm.security_guards_count ?? ""} onChange={changeSurv} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted">GUARD SHIFT</label>
                          <input name="security_guard_shift" className="form-control" value={survForm.security_guard_shift ?? ""} onChange={changeSurv} />
                        </div>
                        <div className="col-md-12 mt-3">
                          <div className="d-flex gap-4 p-3 bg-light rounded border">
                            <div className="form-check form-switch">
                              <input className="form-check-input" type="checkbox" name="visitor_log_maintained" checked={!!survForm.visitor_log_maintained} onChange={changeSurv} id="logCheck" />
                              <label className="form-check-label fw-bold small text-muted" htmlFor="logCheck">VISITOR LOG MAINTAINED</label>
                            </div>
                            <div className="form-check form-switch">
                              <input className="form-check-input" type="checkbox" name="night_patrolling" checked={!!survForm.night_patrolling} onChange={changeSurv} id="patrolCheck" />
                              <label className="form-check-label fw-bold small text-muted" htmlFor="patrolCheck">NIGHT PATROLLING ACTIVE</label>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex gap-2 mt-4 pt-3 border-top">
                        <button type="submit" className="btn btn-primary px-5">Save Security Config</button>
                        <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setEditingSurv(false)}>Cancel</button>
                      </div>
                    </form>
                  )}
                </AdminCard>
              </div>
            </div>
          )}

          {activeTab === "compliance" && (
            <div className="row justify-content-center">
              <div className="col-xl-10 col-lg-12">
                <AdminCard header={<h5 className="mb-0 fw-bold">Compliance Certificates Registry</h5>}>
                  <div className="p-2">
                    <form onSubmit={addCert} className="mb-4 p-4 bg-light rounded-3 border shadow-sm">
                      <h6 className="fw-bold mb-3 small text-muted text-uppercase tracking-wider">Register New Institutional Certificate</h6>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label small fw-bold text-muted">CERTIFICATE TYPE</label>
                          <input name="certificate_type" placeholder="e.g. Health, Structural, Fire" className="form-control" value={certForm.certificate_type} onChange={changeCert} required />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small fw-bold text-muted">ISSUE DATE</label>
                          <input name="issue_date" type="date" className="form-control" value={certForm.issue_date} onChange={changeCert} required />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label small fw-bold text-muted">EXPIRY DATE</label>
                          <input name="expiry_date" type="date" className="form-control" value={certForm.expiry_date} onChange={changeCert} />
                        </div>
                        <div className="col-md-2 d-flex align-items-end">
                          <button type="submit" className="btn btn-success w-100 fw-bold py-2">
                            <i className="bi bi-plus-lg me-1"></i> Register
                          </button>
                        </div>
                      </div>
                    </form>

                    <TableContainer title="Registry Table">
                      <div className="table-responsive">
                        <table className="table align-middle table-hover">
                          <thead className="table-light">
                            <tr>
                              <th className="ps-3">Certificate Type</th>
                              <th>Issued Date</th>
                              <th>Expiry Date</th>
                              <th>Status</th>
                              <th className="text-end pe-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {certs.length > 0 ? certs.map((c) => (
                              <tr key={c.id}>
                                <td className="ps-3 fw-bold text-dark">{c.certificate_type}</td>
                                <td>{c.issue_date ? new Date(c.issue_date).toLocaleDateString('en-IN') : "-"}</td>
                                <td>{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString('en-IN') : <span className="text-muted italic">Permanent</span>}</td>
                                <td>
                                  <span className={`badge ${c.status === 'valid' ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-danger-subtle text-danger border border-danger-subtle'} px-3 py-2`}>
                                    <i className={`bi ${c.status === 'valid' ? 'bi-patch-check-fill' : 'bi-exclamation-octagon'} me-1`}></i>
                                    {c.status ? c.status.toUpperCase() : 'UNKNOWN'}
                                  </span>
                                </td>
                                <td className="text-end pe-3">
                                  <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCert(c.id)}>
                                    <i className="bi bi-trash me-1"></i> Delete
                                  </button>
                                </td>
                              </tr>
                            )) : (
                              <tr>
                                <td colSpan="5" className="text-center py-5">
                                  <EmptyState title="No Certificates Registered" description="Maintain a central registry of all institutional safety and compliance certificates." />
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </TableContainer>
                  </div>
                </AdminCard>
              </div>
            </div>
          )}

          {activeTab === "emergency" && (
            <div className="row justify-content-center">
              <div className="col-xl-9 col-lg-11">
                <AdminCard header={
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <h5 className="mb-0 fw-bold">Emergency Response Framework</h5>
                    {!editingEmerg && (
                      <button className="btn btn-sm btn-primary px-3" onClick={() => setEditingEmerg(true)}>
                        <i className="bi bi-pencil-square me-1"></i> Edit Response Info
                      </button>
                    )}
                  </div>
                }>
                  {!editingEmerg ? (
                    <div className="emergency-view p-2">
                      <div className="row g-4 mb-4">
                        <div className="col-md-6">
                          <div className="p-4 bg-white border rounded-3 shadow-sm h-100 border-start border-4 border-warning">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span className="text-muted small fw-bold text-uppercase tracking-wider">Annual Training</span>
                              <div className="icon-box bg-warning-subtle text-warning p-2 rounded border border-warning-subtle"><i className="bi bi-journal-check fs-4"></i></div>
                            </div>
                            <div className="d-flex align-items-baseline">
                              <span className="fs-1 fw-bold text-dark">{emerg.emergency_drills_per_year ?? "0"}</span>
                              <span className="text-muted ms-2 fw-medium">Drills Planned/Year</span>
                            </div>
                            <div className="mt-3 p-2 bg-light rounded border small fw-medium">
                              Last Mock Drill: <span className="text-primary">{emerg.last_mock_drill_date ? new Date(emerg.last_mock_drill_date).toLocaleDateString('en-IN', {day:'2-digit', month:'short', year:'numeric'}) : "Never"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="p-4 bg-white border rounded-3 shadow-sm h-100 border-start border-4 border-danger">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <span className="text-muted small fw-bold text-uppercase tracking-wider">First Aid Expertise</span>
                              <div className="icon-box bg-danger-subtle text-danger p-2 rounded border border-danger-subtle"><i className="bi bi-heart-pulse fs-4"></i></div>
                            </div>
                            <div className="d-flex align-items-baseline">
                              <span className="fs-1 fw-bold text-dark">{emerg.staff_trained_in_cpr_count ?? "0"}</span>
                              <span className="text-muted ms-2 fw-medium">CPR Certified Staff</span>
                            </div>
                            <div className="mt-3">
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-bold">
                                <i className="bi bi-check-all me-1"></i> MINIMUM REQUIREMENT MET
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 p-4 bg-light rounded-3 border border-primary-subtle shadow-sm">
                        <div className="d-flex align-items-center gap-3 mb-4">
                          <div className="icon-box bg-primary text-white p-2 rounded shadow-sm border border-white"><i className="bi bi-people-fill fs-5"></i></div>
                          <h6 className="fw-bold mb-0 text-primary text-uppercase tracking-wider">Disaster Management Committee</h6>
                        </div>
                        <div className="p-4 bg-white rounded-3 border shadow-sm">
                          <div className="text-dark" style={{whiteSpace: 'pre-line', lineHeight: '1.6'}}>
                            {emerg.committee_members || "Disaster response committee members have not been officially designated yet. Please click 'Edit Response Info' to register the team."}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={saveEmerg} className="p-2">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted">MOCK DRILLS PER YEAR</label>
                          <input name="emergency_drills_per_year" type="number" className="form-control form-control-lg" value={emergForm.emergency_drills_per_year ?? ""} onChange={changeEmerg} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-muted">CPR TRAINED STAFF COUNT</label>
                          <input name="staff_trained_in_cpr_count" type="number" className="form-control form-control-lg" value={emergForm.staff_trained_in_cpr_count ?? ""} onChange={changeEmerg} />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label small fw-bold text-muted">LAST MOCK DRILL DATE</label>
                          <input name="last_mock_drill_date" type="date" className="form-control form-control-lg" value={emergForm.last_mock_drill_date ? emergForm.last_mock_drill_date.slice(0, 10) : ""} onChange={changeEmerg} />
                        </div>
                        <div className="col-12">
                          <label className="form-label small fw-bold text-muted">COMMITTEE MEMBERS & HIERARCHY</label>
                          <textarea name="committee_members" className="form-control" rows="6" value={emergForm.committee_members ?? ""} onChange={changeEmerg} placeholder="List committee members, their designations and emergency roles..." />
                        </div>
                      </div>
                      <div className="d-flex gap-2 mt-4 pt-3 border-top">
                        <button type="submit" className="btn btn-primary px-5">Update Response Framework</button>
                        <button type="button" className="btn btn-outline-secondary px-4" onClick={() => setEditingEmerg(false)}>Cancel</button>
                      </div>
                    </form>
                  )}
                </AdminCard>
              </div>
            </div>
          )}
        </div>
      </div>
      <ChatWidget />
    </div>
  );
}
