import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatWidget from "../../components/ChatWidget";
import PageHeader from '../../components/admin/PageHeader';
import AdminCard from '../../components/admin/AdminCard';
import EmptyState from '../../components/admin/EmptyState';

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

	// generateReport optionally accepts a unit id; if not provided uses state
	async function generateReport(unitIdArg) {
		const targetId = unitIdArg || unitId;
		if (!targetId) return alert("Select a school");
		setLoading(true);
		try {
			const token = localStorage.getItem("token");
			const res = await axios.get(
				`http://localhost:5000/api/report/class-summary/${targetId}`,
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
		<div className="dashboard-container">
			<main className="main-content">
				<PageHeader title={"Generate School Reports"} subtitle={"Select a school to download a full report"} />

				<div className="page-inner">
					<div className="report-controls mb-3">
						<label className="form-label">Select School</label>
						<select className="form-select" value={unitId} onChange={e => setUnitId(e.target.value)}>
							<option value="">Select</option>
							{units.map(u => (
								<option key={u.unit_id} value={u.unit_id}>
									{u.kendrashala_name || u.name || `Unit ${u.unit_id}`}
								</option>
							))}
						</select>
						<div className="mt-2" style={{ display: 'flex', justifyContent: 'flex-end' }}>
							<button className="btn btn-primary" onClick={() => generateReport()}>{loading ? 'Generating...' : 'Generate Report'}</button>
						</div>
					</div>

					<div className="report-grid">
						{units && units.length === 0 && (
							<EmptyState title={"No schools found"} description={"No units available to generate reports."} />
						)}

						{units && units.map(u => (
							<AdminCard key={u.unit_id} className="report-card">
								<div className="report-card-body">
									<h4 className="report-school">{u.kendrashala_name || u.name || `Unit ${u.unit_id}`}</h4>
									<div className="report-meta">
										<div><strong>{u.staff_count ?? u.teacher_count ?? '—'}</strong><div className="meta-label">Staff</div></div>
										<div><strong>{u.student_count ?? u.students ?? '—'}</strong><div className="meta-label">Students</div></div>
									</div>
									<div className="report-actions">
										<button className="btn btn-primary" onClick={() => generateReport(u.unit_id)}>Download Report</button>
									</div>
								</div>
							</AdminCard>
						))}
					</div>

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
				</div>

				<ChatWidget />
			</main>
		</div>
	);
}
