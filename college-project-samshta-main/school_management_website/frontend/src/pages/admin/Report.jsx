import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatWidget from "../../components/ChatWidget";
export default function Report() {
const [units, setUnits] = useState([]);
const [unitId, setUnitId] = useState("");
const [loading, setLoading] = useState(false);
const [pdfUrl, setPdfUrl] = useState("");
useEffect(() => {
 const token = localStorage.getItem("token");
 axios.get("http://localhost:5000/api/admin/units", {
 headers: { Authorization: `Bearer ${token}` },
 })
 .then(res => setUnits(res.data))
 .catch(() => {});
}, []);
async function generateReport() {
 if (!unitId) return alert("Select a school");
 setLoading(true);
 try {
 const token = localStorage.getItem("token");
 const res = await axios.get(
 `http://localhost:5000/api/report/class-summary/${unitId}`,
 {
 headers: { Authorization: `Bearer ${token}` },
 responseType: "blob"
 }
 );
 const fileURL = URL.createObjectURL(res.data);
 setPdfUrl(fileURL);
 } catch (err) {
 alert("Failed to generate report");
 }
 setLoading(false);
}
return (
 <div className="container p-4">
 <h2>Class Summary Report</h2>
 <label>Select School</label>
 <select
 className="form-select mb-3"
 value={unitId}
 onChange={e => setUnitId(e.target.value)}
 >
 <option value="">Select</option>
 {units.map(u => (
 <option key={u.unit_id} value={u.unit_id}>
 {u.kendrashala_name}
 </option>
 ))}
 </select>
 <button className="btn btn-primary" onClick={generateReport}>
 {loading ? "Generating..." : "Generate Report"}
 </button>
 {pdfUrl && (
 <div className="mt-4">
 <h4>Preview</h4>
 <iframe
 src={pdfUrl}
 width="100%"
 height="600px"
 title="PDF Preview"
 style={{ border: "1px solid #ccc" }}
 />
 </div>
 )}
 <ChatWidget />
 </div>
);
}
