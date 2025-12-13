import React, { useEffect, useState } from "react";
import {
  Card, CardContent, Typography, Button, TextField, Stack, Table, TableBody,
  TableHead, TableCell, TableRow, TableContainer, Paper
} from "@mui/material";
import { Bar } from 'react-chartjs-2';
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

// Register chart.js elements
Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function PhysicalSafety() {
  const [info, setInfo] = useState({});
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [analytics, setAnalytics] = useState({});
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5000/api/clerk/physical-safety", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(setInfo);
  }, [editing]);

  useEffect(() => { if (info) setForm(info); }, [info]);

  useEffect(() => {
    fetch("http://localhost:5000/api/clerk/physical-safety/analytics", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setAnalytics);
  }, [editing]);

  const change = e => {
    let v = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [e.target.name]: v }));
  };

  const saveInfo = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:5000/api/clerk/physical-safety", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });
    setEditing(false);
  };

  const chartData = {
    labels: [
      "Stairs",
      "Ramps",
      "Handrails",
      "Water Outlets",
      "Toilets Boys",
      "Toilets Girls"
    ],
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
      backgroundColor: [
        "#1976d2", "#388e3c", "#fbc02d", "#0288d1", "#7b1fa2", "#c62828"
      ],
      borderRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Physical Safety Analytics',
        font: { size: 20, weight: "bold" },
        color: "#212b36"
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Category",
          font: { size: 16, weight: "bold" },
          color: "#212b36"
        },
        ticks: {
          font: { size: 14, weight: "bold" },
          color: "#1976d2"
        }
      },
      y: {
        title: {
          display: true,
          text: "Count",
          font: { size: 16, weight: "bold" },
          color: "#212b36"
        },
        ticks: {
          font: { size: 14, weight: "bold" },
          color: "#388e3c"
        },
        beginAtZero: true,
        precision: 0
      }
    }
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h4">Physical Safety & Infrastructure</Typography>
      <Card>
        <CardContent>
          {!editing ? <Stack spacing={2}>
            <Typography><b>Building Compliance Certificate:</b> {info.building_compliance_certificate ?? "-"}</Typography>
            <Typography><b>Certificate Date:</b> {info.building_compliance_date ? new Date(info.building_compliance_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}</Typography>
            <Typography><b>Stairs (Count/Condition):</b> {info.stairs_count ?? "-"} / {info.stairs_condition ?? "-"}</Typography>
            <Typography><b>Ramps (Count/Condition):</b> {info.ramps_count ?? "-"} / {info.ramps_condition ?? "-"}</Typography>
            <Typography><b>Handrails (Count/Condition):</b> {info.handrails_count ?? "-"} / {info.handrails_condition ?? "-"}</Typography>
            <Typography><b>Playground Status:</b> {info.playground_status ?? "-"}</Typography>
            <Typography><b>Drinking Water Outlets:</b> {info.drinking_water_outlets ?? "-"}</Typography>
            <Typography><b>Last Water Quality Test:</b> {info.last_water_quality_test ? new Date(info.last_water_quality_test).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}</Typography>
            <Typography><b>Toilets (Boys/Girls):</b> {info.toilets_boys ?? "-"} / {info.toilets_girls ?? "-"}</Typography>
            <Typography><b>Last Sanitation Check:</b> {info.last_sanitation_check ? new Date(info.last_sanitation_check).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}</Typography>
            <Typography><b>Lighting Status:</b> {info.lighting_status ?? "-"}</Typography>
            <Typography><b>Ventilation Status:</b> {info.ventilation_status ?? "-"}</Typography>
            <Typography><b>Hazardous Storage Details:</b> {info.hazardous_storage_details ?? "-"}</Typography>
            <Typography><b>Last Hazardous Check:</b> {info.hazardous_last_checked ? new Date(info.hazardous_last_checked).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}</Typography>
            <Button variant="contained" onClick={() => setEditing(true)}>Edit Info</Button>
          </Stack> : (
            <form onSubmit={saveInfo} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <TextField name="building_compliance_certificate" label="Building Compliance Certificate" value={form.building_compliance_certificate ?? ""} onChange={change} required />
              <TextField name="building_compliance_date" label="Certificate Date" type="date" InputLabelProps={{ shrink: true }} value={form.building_compliance_date ?? ""} onChange={change} required />
              <TextField name="stairs_count" label="Stairs Count" type="number" value={form.stairs_count ?? ""} onChange={change} required />
              <TextField name="stairs_condition" label="Stairs Condition" value={form.stairs_condition ?? ""} onChange={change} required />
              <TextField name="ramps_count" label="Ramps Count" type="number" value={form.ramps_count ?? ""} onChange={change} required />
              <TextField name="ramps_condition" label="Ramps Condition" value={form.ramps_condition ?? ""} onChange={change} required />
              <TextField name="handrails_count" label="Handrails Count" type="number" value={form.handrails_count ?? ""} onChange={change} required />
              <TextField name="handrails_condition" label="Handrails Condition" value={form.handrails_condition ?? ""} onChange={change} required />
              <TextField name="playground_status" label="Playground Status" value={form.playground_status ?? ""} onChange={change} required />
              <TextField name="drinking_water_outlets" label="Drinking Water Outlets" type="number" value={form.drinking_water_outlets ?? ""} onChange={change} required />
              <TextField name="last_water_quality_test" label="Last Water Quality Test" type="date" InputLabelProps={{ shrink: true }} value={form.last_water_quality_test ?? ""} onChange={change} required />
              <TextField name="toilets_boys" label="Toilets (Boys)" type="number" value={form.toilets_boys ?? ""} onChange={change} required />
              <TextField name="toilets_girls" label="Toilets (Girls)" type="number" value={form.toilets_girls ?? ""} onChange={change} required />
              <TextField name="last_sanitation_check" label="Last Sanitation Check" type="date" InputLabelProps={{ shrink: true }} value={form.last_sanitation_check ?? ""} onChange={change} required />
              <TextField name="lighting_status" label="Lighting Status" value={form.lighting_status ?? ""} onChange={change} required />
              <TextField name="ventilation_status" label="Ventilation Status" value={form.ventilation_status ?? ""} onChange={change} required />
              <TextField name="hazardous_storage_details" label="Hazardous Storage Details" value={form.hazardous_storage_details ?? ""} onChange={change} required />
              <TextField name="hazardous_last_checked" label="Last Hazardous Check" type="date" InputLabelProps={{ shrink: true }} value={form.hazardous_last_checked ?? ""} onChange={change} required />
              <Button type="submit" variant="contained">Save</Button>
              <Button color="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Summary Table */}
      <Typography variant="h5" gutterBottom>Summary Table</Typography>
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
              <TableCell>{
                analytics.last_water_quality_test ?
                  new Date(analytics.last_water_quality_test).toLocaleDateString() : "-"
              }</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Toilets (Boys/Girls)</TableCell>
              <TableCell>{analytics.toilets_boys ?? "-"} / {analytics.toilets_girls ?? "-"}</TableCell>
              <TableCell>{
                analytics.last_sanitation_check ?
                  new Date(analytics.last_sanitation_check).toLocaleDateString() : "-"
              }</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Analytics Chart */}
      <Typography variant="h5" gutterBottom>Analytics Chart</Typography>
      <Card sx={{ marginTop: 3 }}>
        <CardContent>
          <Bar
            data={{
              labels: [
                "Stairs",
                "Ramps",
                "Handrails",
                "Water Outlets",
                "Toilets Boys",
                "Toilets Girls"
              ],
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
                backgroundColor: [
                  "#1976d2", "#388e3c", "#fbc02d", "#0288d1", "#7b1fa2", "#c62828"
                ],
                borderRadius: 6
              }]
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                title: {
                  display: true,
                  text: 'Physical Safety Analytics',
                  font: { size: 20, weight: "bold" },
                  color: "#212b36"
                }
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: "Category",
                    font: { size: 16, weight: "bold" },
                    color: "#212b36"
                  },
                  ticks: { font: { size: 14, weight: "bold" }, color: "#1976d2" }
                },
                y: {
                  title: {
                    display: true,
                    text: "Count",
                    font: { size: 16, weight: "bold" },
                    color: "#212b36"
                  },
                  ticks: { font: { size: 14, weight: "bold" }, color: "#388e3c" },
                  beginAtZero: true,
                  precision: 0
                }
              }
            }}
          />
        </CardContent>
      </Card>
    </Stack>
  );
}
