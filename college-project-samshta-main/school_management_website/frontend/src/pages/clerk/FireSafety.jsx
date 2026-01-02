import React, { useEffect, useState } from "react";
import {
  Card, CardContent, Typography, Button, TextField,
  Checkbox, FormControlLabel, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Stack
} from '@mui/material';

// Helpers
function toDateOnly(iso) {
  if (!iso) return '';
  const s = typeof iso === 'string' ? iso : (new Date(iso)).toISOString();
  return s.slice(0, 10); // yyyy-mm-dd
}
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

  // central fetch function with error handling
  async function fetchData() {
    try {
      const res = await fetch("http://localhost:5000/api/clerk/fire-safety", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        console.error("Failed to load fire-safety, status:", res.status);
        setInfo(null);
        return;
      }
      const data = await res.json();
      setInfo(data);
    } catch (err) {
      console.error("Failed to fetch fire-safety:", err);
      setInfo(null);
    }
  }

  // load once and after operations
  useEffect(() => {
    fetchData();
  }, []);

  // When server returns safety object, normalize dates for inputs
  useEffect(() => {
    if (info?.safety) {
      setForm(prev => ({
        ...info.safety,
        extinguisher_last_inspection: toDateOnly(info.safety.extinguisher_last_inspection),
        // add other date-normalizations here if you add date fields
      }));
    }
  }, [info]);

  const change = (e) => {
    const { name, type } = e.target;
    let value = type === "checkbox" ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [name]: value }));
  };

  const saveInfo = async (e) => {
    e.preventDefault();
    try {
      // send the form directly; date inputs are yyyy-mm-dd which PostgreSQL DATE accepts
      const res = await fetch("http://localhost:5000/api/clerk/fire-safety", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        console.error("Save failed, status:", res.status);
      } else {
        // reload data
        await fetchData();
        setEditing(false);
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const addDrill = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/clerk/fire-safety/drill", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          drill_date: e.target.drill_date.value, // yyyy-mm-dd
          participants_students: Number(e.target.students.value),
          participants_staff: Number(e.target.staff.value),
          evacuation_time_seconds: Number(e.target.evacuation.value)
        })
      });
      if (!res.ok) {
        console.error("Add drill failed, status:", res.status);
      } else {
        e.target.reset();
        // reload data
        await fetchData();
        setEditing(false);
      }
    } catch (err) {
      console.error("Add drill error:", err);
    }
  };

  // Deduplicate by date
  const uniqueDrills = [];
  const drillDates = new Set();
  (info?.allDrills ?? []).forEach(drill => {
    if (!drillDates.has(drill.drill_date)) {
      uniqueDrills.push(drill);
      drillDates.add(drill.drill_date);
    }
  });

  return (
    <Stack spacing={3}>
      <Typography variant="h4" gutterBottom>Fire Safety / Drill Management</Typography>

      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2}>
            {!editing ? <>
              <Stack direction="row" spacing={2}>
                <Typography variant="h6">Extinguishers:</Typography>
                <Typography>{info?.safety?.extinguisher_count ?? "-"}</Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Typography variant="h6">Locations:</Typography>
                <Typography>{info?.safety?.extinguisher_locations ?? "-"}</Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Typography variant="h6">Last Inspection:</Typography>
                <Typography>
                  {info?.safety?.extinguisher_last_inspection
                    ? new Date(info.safety.extinguisher_last_inspection).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : "-"}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Typography variant="h6">Evacuation Marked:</Typography>
                <Typography>{info?.safety?.evacuation_routes_marked ? "Yes" : "No"}</Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Typography variant="h6">Assembly Points:</Typography>
                <Typography>{info?.safety?.assembly_points ?? "-"}</Typography>
              </Stack>
              <Button variant="contained" onClick={() => setEditing(true)}>Edit Info</Button>
            </> : (
              <form onSubmit={saveInfo} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <TextField label="Number of Extinguishers" type="number" name="extinguisher_count" value={form.extinguisher_count ?? ''} onChange={change} required />
                <TextField label="Locations" name="extinguisher_locations" value={form.extinguisher_locations ?? ''} onChange={change} required />
                <TextField label="Last Inspection" type="date" name="extinguisher_last_inspection" InputLabelProps={{ shrink: true }} value={form.extinguisher_last_inspection ?? ''} onChange={change} required />
                <FormControlLabel control={<Checkbox checked={!!form.evacuation_routes_marked} name="evacuation_routes_marked" onChange={change} />} label="Evacuation Routes Marked" />
                <TextField label="Assembly Points" name="assembly_points" value={form.assembly_points ?? ''} onChange={change} required />
                <Button type="submit" variant="contained">Save</Button>
                <Button color="secondary" onClick={() => { setEditing(false); /* restore form from latest info */ setForm(info?.safety ? { ...info.safety, extinguisher_last_inspection: toDateOnly(info.safety.extinguisher_last_inspection) } : {}); }}>Cancel</Button>
              </form>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>Add Fire Drill</Typography>
          <form onSubmit={addDrill} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <TextField name="drill_date" type="date" InputLabelProps={{ shrink: true }} required />
            <TextField name="students" label="Students" type="number" required />
            <TextField name="staff" label="Staff" type="number" required />
            <TextField name="evacuation" label="Evacuation Time (seconds)" type="number" required />
            <Button variant="contained" type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      <Typography variant="h6" gutterBottom>Drills in Last 12 Months</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Students</TableCell>
              <TableCell>Staff</TableCell>
              <TableCell>Evacuation Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {uniqueDrills.map(drill => (
              <TableRow key={drill.id}>
                <TableCell>
                  {new Date(drill.drill_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </TableCell>
                <TableCell>{drill.participants_students}</TableCell>
                <TableCell>{drill.participants_staff}</TableCell>
                <TableCell>
                  {formatSeconds(Number(drill.evacuation_time_seconds))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
}