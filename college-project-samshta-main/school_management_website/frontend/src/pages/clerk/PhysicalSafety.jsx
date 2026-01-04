import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Table,
  TableBody,
  TableHead,
  TableCell,
  TableRow,
  TableContainer,
  Paper
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Chart data (uses analytics)
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
        backgroundColor: ["#1976d2", "#388e3c", "#fbc02d", "#0288d1", "#7b1fa2", "#c62828"],
        borderRadius: 6
      }
    ]
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Safety & Compliance — Clerk</Typography>

      {/* PHYSICAL */}
      <Card>
        <CardContent>
          <Typography variant="h6">Physical Infrastructure</Typography>
          {!editing ? (
            <Stack spacing={1}>
              <Typography><b>Building Certificate:</b> {info.building_compliance_certificate ?? "-"}</Typography>
              <Typography><b>Certificate Date:</b> {info.building_compliance_date ? new Date(info.building_compliance_date).toLocaleDateString() : "-"}</Typography>
              <Typography><b>Stairs:</b> {info.stairs_count ?? "-"} / {info.stairs_condition ?? "-"}</Typography>
              <Typography><b>Ramps:</b> {info.ramps_count ?? "-"} / {info.ramps_condition ?? "-"}</Typography>
              <Typography><b>Handrails:</b> {info.handrails_count ?? "-"} / {info.handrails_condition ?? "-"}</Typography>
              <Typography><b>Playground:</b> {info.playground_status ?? "-"}</Typography>
              <Typography><b>Water Outlets:</b> {info.drinking_water_outlets ?? "-"}</Typography>
              <Typography><b>Last Water Test:</b> {info.last_water_quality_test ? new Date(info.last_water_quality_test).toLocaleDateString() : "-"}</Typography>
              <Typography><b>Toilets (B/G):</b> {info.toilets_boys ?? "-"} / {info.toilets_girls ?? "-"}</Typography>
              <Typography><b>Sanitation Check:</b> {info.last_sanitation_check ? new Date(info.last_sanitation_check).toLocaleDateString() : "-"}</Typography>
              <Typography><b>Lighting:</b> {info.lighting_status ?? "-"}</Typography>
              <Typography><b>Ventilation:</b> {info.ventilation_status ?? "-"}</Typography>
              <Typography><b>Hazardous Storage:</b> {info.hazardous_storage_details ?? "-"}</Typography>
              <Typography><b>Hazardous Last Checked:</b> {info.hazardous_last_checked ? new Date(info.hazardous_last_checked).toLocaleDateString() : "-"}</Typography>
              <Button variant="contained" onClick={() => setEditing(true)}>Edit Physical Info</Button>
            </Stack>
          ) : (
            <form onSubmit={savePhysical} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <TextField name="building_compliance_certificate" label="Building Compliance Certificate" value={form.building_compliance_certificate ?? ""} onChange={change} />
              <TextField name="building_compliance_date" label="Certificate Date" type="date" InputLabelProps={{ shrink: true }} value={form.building_compliance_date ?? ""} onChange={change} />
              <TextField name="stairs_count" label="Stairs Count" type="number" value={form.stairs_count ?? ""} onChange={change} />
              <TextField name="stairs_condition" label="Stairs Condition" value={form.stairs_condition ?? ""} onChange={change} />
              <TextField name="ramps_count" label="Ramps Count" type="number" value={form.ramps_count ?? ""} onChange={change} />
              <TextField name="ramps_condition" label="Ramps Condition" value={form.ramps_condition ?? ""} onChange={change} />
              <TextField name="handrails_count" label="Handrails Count" type="number" value={form.handrails_count ?? ""} onChange={change} />
              <TextField name="handrails_condition" label="Handrails Condition" value={form.handrails_condition ?? ""} onChange={change} />
              <TextField name="playground_status" label="Playground Status" value={form.playground_status ?? ""} onChange={change} />
              <TextField name="drinking_water_outlets" label="Drinking Water Outlets" type="number" value={form.drinking_water_outlets ?? ""} onChange={change} />
              <TextField name="last_water_quality_test" label="Last Water Quality Test" type="date" InputLabelProps={{ shrink: true }} value={form.last_water_quality_test ?? ""} onChange={change} />
              <TextField name="toilets_boys" label="Toilets (Boys)" type="number" value={form.toilets_boys ?? ""} onChange={change} />
              <TextField name="toilets_girls" label="Toilets (Girls)" type="number" value={form.toilets_girls ?? ""} onChange={change} />
              <TextField name="last_sanitation_check" label="Last Sanitation Check" type="date" InputLabelProps={{ shrink: true }} value={form.last_sanitation_check ?? ""} onChange={change} />
              <TextField name="lighting_status" label="Lighting Status" value={form.lighting_status ?? ""} onChange={change} />
              <TextField name="ventilation_status" label="Ventilation Status" value={form.ventilation_status ?? ""} onChange={change} />
              <TextField name="hazardous_storage_details" label="Hazardous Storage Details" value={form.hazardous_storage_details ?? ""} onChange={change} />
              <TextField name="hazardous_last_checked" label="Last Hazardous Check" type="date" InputLabelProps={{ shrink: true }} value={form.hazardous_last_checked ?? ""} onChange={change} />
              <div style={{ display: "flex", gap: 8 }}>
                <Button type="submit" variant="contained">Save</Button>
                <Button color="secondary" onClick={() => { setEditing(false); fetchPhysical(); }}>Cancel</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* MEDICAL */}
      <Card>
        <CardContent>
          <Typography variant="h6">Medical Readiness</Typography>
          {!editingMedical ? (
            <Stack spacing={1}>
              <Typography><b>First Aid Kits:</b> {medical.first_aid_kits_count ?? "-"}</Typography>
              <Typography><b>Kit Locations:</b> {medical.first_aid_kit_locations ?? "-"}</Typography>
              <Typography><b>Last Kit Inspection:</b> {medical.last_kit_inspection ? new Date(medical.last_kit_inspection).toLocaleDateString() : "-"}</Typography>
              <Typography><b>Trained Staff:</b> {medical.trained_first_aiders_count ?? "-"} — {medical.trained_first_aiders_names ?? "-"}</Typography>
              <Typography><b>Ambulance Access:</b> {medical.ambulance_access ? "Available" : "Not Available"}</Typography>
              <Typography><b>Nearest Hospital:</b> {medical.nearest_hospital_name ? `${medical.nearest_hospital_name} (${medical.nearest_hospital_distance_km ?? "-"} km)` : "-"}</Typography>
              <Typography><b>Emergency Contacts:</b> {medical.emergency_contact_numbers ?? "-"}</Typography>
              <Button variant="contained" onClick={() => setEditingMedical(true)}>Edit Medical Info</Button>
            </Stack>
          ) : (
            <form onSubmit={saveMedical} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <TextField name="first_aid_kits_count" label="First Aid Kits Count" type="number" value={medicalForm.first_aid_kits_count ?? ""} onChange={changeMedical} />
              <TextField name="first_aid_kit_locations" label="First Aid Kit Locations" value={medicalForm.first_aid_kit_locations ?? ""} onChange={changeMedical} />
              <TextField name="last_kit_inspection" label="Last Kit Inspection" type="date" InputLabelProps={{ shrink: true }} value={medicalForm.last_kit_inspection ?? ""} onChange={changeMedical} />
              <TextField name="trained_first_aiders_count" label="Trained First Aiders Count" type="number" value={medicalForm.trained_first_aiders_count ?? ""} onChange={changeMedical} />
              <TextField name="trained_first_aiders_names" label="Trained First Aiders Names" value={medicalForm.trained_first_aiders_names ?? ""} onChange={changeMedical} />
              <TextField name="ambulance_access" label="Ambulance Access (true/false)" value={medicalForm.ambulance_access ?? ""} onChange={changeMedical} />
              <TextField name="nearest_hospital_name" label="Nearest Hospital" value={medicalForm.nearest_hospital_name ?? ""} onChange={changeMedical} />
              <TextField name="nearest_hospital_distance_km" label="Nearest Hospital Distance (km)" type="number" value={medicalForm.nearest_hospital_distance_km ?? ""} onChange={changeMedical} />
              <TextField name="emergency_contact_numbers" label="Emergency Contact Numbers (comma separated)" value={medicalForm.emergency_contact_numbers ?? ""} onChange={changeMedical} />
              <div style={{ display: "flex", gap: 8 }}>
                <Button type="submit" variant="contained">Save</Button>
                <Button color="secondary" onClick={() => { setEditingMedical(false); fetchMedical(); }}>Cancel</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* SURVEILLANCE */}
      <Card>
        <CardContent>
          <Typography variant="h6">Surveillance & Security</Typography>
          {!editingSurv ? (
            <Stack spacing={1}>
              <Typography><b>CCTV (Working/Total):</b> {surv.cctv_working_count ?? "-"} / {surv.cctv_cameras_count ?? "-"}</Typography>
              <Typography><b>Coverage Areas:</b> {surv.cctv_coverage_areas ?? "-"}</Typography>
              <Typography><b>Last Maintenance:</b> {surv.cctv_last_maintenance ? new Date(surv.cctv_last_maintenance).toLocaleDateString() : "-"}</Typography>
              <Typography><b>Recording Retention:</b> {surv.recording_retention_days ?? "-"} days</Typography>
              <Typography><b>Security Guards:</b> {surv.security_guards_count ?? "-"} ({surv.security_guard_shift ?? "-"})</Typography>
              <Typography><b>Visitor Log Maintained:</b> {surv.visitor_log_maintained ? "Yes" : "No"}</Typography>
              <Button variant="contained" onClick={() => setEditingSurv(true)}>Edit Surveillance</Button>
            </Stack>
          ) : (
            <form onSubmit={saveSurv} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <TextField name="cctv_cameras_count" label="CCTV Cameras Count" type="number" value={survForm.cctv_cameras_count ?? ""} onChange={changeSurv} />
              <TextField name="cctv_working_count" label="CCTV Working Count" type="number" value={survForm.cctv_working_count ?? ""} onChange={changeSurv} />
              <TextField name="cctv_coverage_areas" label="CCTV Coverage Areas" value={survForm.cctv_coverage_areas ?? ""} onChange={changeSurv} />
              <TextField name="cctv_last_maintenance" label="CCTV Last Maintenance" type="date" InputLabelProps={{ shrink: true }} value={survForm.cctv_last_maintenance ?? ""} onChange={changeSurv} />
              <TextField name="recording_retention_days" label="Recording Retention Days" type="number" value={survForm.recording_retention_days ?? ""} onChange={changeSurv} />
              <TextField name="security_guards_count" label="Security Guards Count" type="number" value={survForm.security_guards_count ?? ""} onChange={changeSurv} />
              <TextField name="security_guard_shift" label="Security Guard Shift" value={survForm.security_guard_shift ?? ""} onChange={changeSurv} />
              <TextField name="visitor_log_maintained" label="Visitor Log Maintained (true/false)" value={survForm.visitor_log_maintained ?? ""} onChange={changeSurv} />
              <div style={{ display: "flex", gap: 8 }}>
                <Button type="submit" variant="contained">Save</Button>
                <Button color="secondary" onClick={() => { setEditingSurv(false); fetchSurveillance(); }}>Cancel</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* EMERGENCY */}
      <Card>
        <CardContent>
          <Typography variant="h6">Emergency Response</Typography>
          {!editingEmerg ? (
            <Stack spacing={1}>
              <Typography><b>Plan Document:</b> {emerg.emergency_plan_document ? "Uploaded/Provided" : "Not provided"}</Typography>
              <Typography><b>Plan Last Updated:</b> {emerg.emergency_plan_last_updated ? new Date(emerg.emergency_plan_last_updated).toLocaleDateString() : "-"}</Typography>
              <Typography><b>Drills Per Year:</b> {emerg.emergency_drills_per_year ?? "-"}</Typography>
              <Typography><b>Last Mock Drill:</b> {emerg.last_mock_drill_date ? new Date(emerg.last_mock_drill_date).toLocaleDateString() : "-"}</Typography>
              <Typography><b>CPR Trained Staff:</b> {emerg.staff_trained_in_cpr_count ?? "-"}</Typography>
              <Typography><b>Disaster Committee:</b> {emerg.disaster_management_committee ? "Yes" : "No"}</Typography>
              <Typography><b>Committee Members:</b> {emerg.committee_members ?? "-"}</Typography>
              <Button variant="contained" onClick={() => setEditingEmerg(true)}>Edit Emergency Info</Button>
            </Stack>
          ) : (
            <form onSubmit={saveEmerg} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <TextField name="emergency_plan_document" label="Emergency Plan Document (text/URL)" value={emergForm.emergency_plan_document ?? ""} onChange={changeEmerg} />
              <TextField name="emergency_plan_last_updated" label="Plan Last Updated" type="date" InputLabelProps={{ shrink: true }} value={emergForm.emergency_plan_last_updated ?? ""} onChange={changeEmerg} />
              <TextField name="emergency_drills_per_year" label="Drills Per Year" type="number" value={emergForm.emergency_drills_per_year ?? ""} onChange={changeEmerg} />
              <TextField name="last_mock_drill_date" label="Last Mock Drill Date" type="date" InputLabelProps={{ shrink: true }} value={emergForm.last_mock_drill_date ?? ""} onChange={changeEmerg} />
              <TextField name="staff_trained_in_cpr_count" label="Staff Trained in CPR Count" type="number" value={emergForm.staff_trained_in_cpr_count ?? ""} onChange={changeEmerg} />
              <TextField name="disaster_management_committee" label="Disaster Management Committee (true/false)" value={emergForm.disaster_management_committee ?? ""} onChange={changeEmerg} />
              <TextField name="committee_members" label="Committee Members (comma separated)" value={emergForm.committee_members ?? ""} onChange={changeEmerg} />
              <div style={{ display: "flex", gap: 8 }}>
                <Button type="submit" variant="contained">Save</Button>
                <Button color="secondary" onClick={() => { setEditingEmerg(false); fetchEmergency(); }}>Cancel</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* CERTIFICATES */}
      <Card>
        <CardContent>
          <Typography variant="h6">Compliance Certificates</Typography>
          <form onSubmit={addCert} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <TextField name="certificate_type" placeholder="Type" value={certForm.certificate_type} onChange={changeCert} />
            <TextField name="certificate_number" placeholder="Number" value={certForm.certificate_number} onChange={changeCert} />
            <TextField name="issue_date" type="date" InputLabelProps={{ shrink: true }} value={certForm.issue_date} onChange={changeCert} />
            <Button type="submit" variant="contained">Add</Button>
          </form>

          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Number</TableCell>
                  <TableCell>Issue</TableCell>
                  <TableCell>Expiry</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {certs.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.certificate_type}</TableCell>
                    <TableCell>{c.certificate_number}</TableCell>
                    <TableCell>{c.issue_date ? new Date(c.issue_date).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>{c.expiry_date ? new Date(c.expiry_date).toLocaleDateString() : "-"}</TableCell>
                    <TableCell>{c.status}</TableCell>
                    <TableCell>
                      <Button size="small" color="error" onClick={() => deleteCert(c.id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Summary Table & Chart */}
      <Typography variant="h5">Summary Table</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Category</TableCell>
              <TableCell>Count</TableCell>
              <TableCell>Last Check/Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Stairs</TableCell>
              <TableCell>{analytics.stairs ?? "-"}</TableCell>
              <TableCell>-</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Ramps</TableCell>
              <TableCell>{analytics.ramps ?? "-"}</TableCell>
              <TableCell>-</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Handrails</TableCell>
              <TableCell>{analytics.handrails ?? "-"}</TableCell>
              <TableCell>-</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Water Outlets</TableCell>
              <TableCell>{analytics.drinking_water_outlets ?? "-"}</TableCell>
              <TableCell>{analytics.last_water_quality_test ? new Date(analytics.last_water_quality_test).toLocaleDateString() : "-"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Toilets (Boys/Girls)</TableCell>
              <TableCell>{analytics.toilets_boys ?? "-"} / {analytics.toilets_girls ?? "-"}</TableCell>
              <TableCell>{analytics.last_sanitation_check ? new Date(analytics.last_sanitation_check).toLocaleDateString() : "-"}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5">Analytics Chart</Typography>
      <Card>
        <CardContent>
          <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </CardContent>
      </Card>
    </Stack>
  );
}