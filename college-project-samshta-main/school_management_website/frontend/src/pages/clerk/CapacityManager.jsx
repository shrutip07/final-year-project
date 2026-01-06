import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import TabNavigation from "../../components/admin/TabNavigation";
import "./CapacityManager.scss";

export default function CapacityManager() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [academicYear, setAcademicYear] = useState("");
  const [standard, setStandard] = useState("");
  const [division, setDivision] = useState("");
  const [capacity, setCapacity] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("define");

  async function loadDashboard(year) {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const q = year ? `?academic_year=${encodeURIComponent(year)}` : "";
      const res = await axios.get(`http://localhost:5000/api/clerk/unit${q}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboard(res.data);
      if (!year && res.data?.academic_year) setAcademicYear(res.data.academic_year);
    } catch {
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleUpsert(e) {
    e.preventDefault();
    setMessage("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/clerk/capacity",
        {
          academic_year: academicYear,
          standard,
          division: division || null,
          capacity: Number(capacity)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Capacity saved successfully");
      loadDashboard(academicYear);
      setStandard("");
      setDivision("");
      setCapacity("");
    } catch (err) {
      setMessage(err.response?.data?.error || "❌ Save failed");
    }
  }

  const capacityTabs = [
    { id: "define", label: "Define Capacity", icon: "bi-plus-circle" },
    { id: "stats", label: "Class Enrollment Statistics", icon: "bi-table" },
  ];

  return (
    <div className="capacity-wrapper dashboard-main-view">
      <div className="section-header-pro mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="header-icon-box">
            <i className="bi bi-building-up text-primary"></i>
          </div>
          <div>
            <h3 className="mb-1">Class Capacity Management</h3>
            <p className="text-muted small mb-0">Define and monitor maximum student strength per standard and division.</p>
          </div>
        </div>
      </div>

      <div className="px-0">
        <div className="metrics-grid mb-4">
          <div className="metric-box metric-students">
            <div className="metric-icon">
              <i className="bi bi-door-open"></i>
            </div>
            <div className="metric-info">
              <span className="label">TOTAL CAPACITY</span>
              <span className="value">{dashboard?.totals?.capacity || 0}</span>
              <span className="sub-label">Across all classes</span>
            </div>
          </div>
          <div className="metric-box metric-staff">
            <div className="metric-icon">
              <i className="bi bi-people"></i>
            </div>
            <div className="metric-info">
              <span className="label">ENROLLED STUDENTS</span>
              <span className="value">{dashboard?.totals?.enrolled || 0}</span>
              <span className="sub-label">Active admissions</span>
            </div>
          </div>
          <div className="metric-box metric-fees highlight">
            <div className="metric-icon">
              <i className="bi bi-bookmark-plus"></i>
            </div>
            <div className="metric-info">
              <span className="label">SEATS REMAINING</span>
              <span className="value">{dashboard?.totals?.seatsRemaining || 0}</span>
              <span className="sub-label">Available for intake</span>
            </div>
          </div>
        </div>

        <TabNavigation
          tabs={capacityTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="mt-4">
          {activeTab === "define" && (
            <div className="row justify-content-center">
              <div className="col-lg-6">
                <AdminCard header={
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-plus-circle text-primary"></i>
                    <span>Define Capacity Details</span>
                  </div>
                }>
                  <form onSubmit={handleUpsert} className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted">ACADEMIC YEAR</label>
                      <input
                        className="form-control form-control-lg"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        placeholder="2025-26"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">STANDARD</label>
                      <input
                        className="form-control form-control-lg"
                        value={standard}
                        onChange={(e) => setStandard(e.target.value)}
                        placeholder="10"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">DIVISION</label>
                      <input
                        className="form-control form-control-lg"
                        value={division}
                        onChange={(e) => setDivision(e.target.value)}
                        placeholder="A"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted">MAX CAPACITY</label>
                      <input
                        className="form-control form-control-lg"
                        type="number"
                        min="0"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        placeholder="60"
                        required
                      />
                    </div>

                    <div className="col-12 d-flex gap-2 pt-3">
                      <button className="btn btn-primary py-3 flex-grow-1 fw-bold" type="submit">
                        Update Capacity Record
                      </button>
                      <button
                        type="button"
                        className="btn btn-light px-4"
                        onClick={() => loadDashboard(academicYear)}
                        title="Reload"
                      >
                        <i className="bi bi-arrow-clockwise fs-5"></i>
                      </button>
                    </div>
                  </form>

                  {message && (
                    <div className={`mt-3 p-3 rounded-3 small fw-medium ${message.includes('✅') ? 'bg-soft-success text-success' : 'bg-soft-danger text-danger'}`}>
                      {message}
                    </div>
                  )}
                </AdminCard>
              </div>
            </div>
          )}

          {activeTab === "stats" && (
            <AdminCard header={
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-table text-primary"></i>
                  <span>Enrollment Statistics by Class</span>
                </div>
                <span className="badge bg-soft-primary text-primary px-3 py-2">Academic Year {dashboard?.academic_year ?? academicYear}</span>
              </div>
            }>
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                  <div className="mt-2 text-muted small">Loading statistics...</div>
                </div>
              ) : (
                <TableContainer title="">
                  <div className="table-responsive professional-table">
                    <table className="table align-middle table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="ps-3">Class Specification</th>
                          <th>Capacity</th>
                          <th>Enrolled</th>
                          <th className="text-end pe-3">Current Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dashboard?.classStats ?? []).length > 0 ? (
                          (dashboard?.classStats ?? []).map((c, i) => (
                            <tr key={i}>
                              <td className="ps-3 fw-bold text-dark">
                                STD {c.standard} <span className="text-muted ms-1">{c.division ? `(${c.division})` : ''}</span>
                              </td>
                              <td>
                                <span className="fw-medium text-dark">{c.capacity}</span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-3">
                                  <span className="fw-bold text-primary" style={{ minWidth: '25px' }}>{c.enrolled}</span>
                                  <div className="progress flex-grow-1" style={{ height: '8px', maxWidth: '120px', borderRadius: '10px' }}>
                                    <div 
                                      className="progress-bar bg-primary" 
                                      style={{ width: `${Math.min(100, (c.enrolled / c.capacity) * 100)}%`, borderRadius: '10px' }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td className="text-end pe-3">
                                <span className={`badge ${c.seatsRemaining > 5 ? 'bg-soft-success text-success' : 'bg-soft-danger text-danger'} px-3 py-2 rounded-pill border`}>
                                  {c.seatsRemaining} Seats Available
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center py-5 text-muted">
                              <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                              No enrollment data available for this academic year.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </TableContainer>
              )}
            </AdminCard>
          )}
        </div>
      </div>
    </div>
  );
}
