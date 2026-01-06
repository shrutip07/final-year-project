import React, { useEffect, useState } from "react";
import AdminCard from "../../components/admin/AdminCard";
import TableContainer from "../../components/admin/TableContainer";
import EmptyState from "../../components/admin/EmptyState";
import TabNavigation from "../../components/admin/TabNavigation";

export default function ManageRetirements() {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [activeTab, setActiveTab] = useState("projections");
  const token = localStorage.getItem("token");

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [tRes, dRes] = await Promise.all([
          fetch("http://localhost:5000/api/clerk/teachers", { headers }),
          fetch("http://localhost:5000/api/clerk/unit", { headers })
        ]);

        if (!tRes.ok) throw new Error("Failed to load teachers");
        const tData = await tRes.json();
        setTeachers(tData);

        if (dRes.ok) {
          const dData = await dRes.json();
          setUpcoming(Array.isArray(dData.upcomingRetirements) ? dData.upcomingRetirements : []);
        } else {
          setUpcoming([]);
        }
      } catch (err) {
        console.error(err);
        setTeachers([]);
        setUpcoming([]);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, [token]);

  const handleChange = (staff_id, value) => {
    setTeachers((prev) => prev.map(t => (t.staff_id === staff_id ? { ...t, retirement_date: value } : t)));
  };

  const handleSave = async (staff_id) => {
    const teacher = teachers.find(t => t.staff_id === staff_id);
    if (!teacher) return;
    setSavingId(staff_id);
    try {
      const res = await fetch("http://localhost:5000/api/clerk/teacher-retirement", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ staff_id, retirement_date: teacher.retirement_date || null }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Save failed");
      }
      const dRes = await fetch("http://localhost:5000/api/clerk/unit", { headers: { Authorization: `Bearer ${token}` } });
      if (dRes.ok) {
        const dData = await dRes.json();
        setUpcoming(Array.isArray(dData.upcomingRetirements) ? dData.upcomingRetirements : []);
      }
    } catch (e) {
      console.error("Failed saving retirement date:", e);
      alert("Failed to save. See console for details.");
    } finally {
      setSavingId(null);
    }
  };

  const filteredTeachers = selectedYear
    ? teachers.filter(t => {
        if (!t.retirement_date) return false;
        const year = new Date(t.retirement_date).getFullYear();
        return year === selectedYear;
      })
    : teachers;

  const totalTeachers = teachers.length;

  const handleYearClick = (year) => {
    setSelectedYear(prev => (prev === year ? null : year));
  };

  const retirementTabs = [
    { id: "projections", label: "Retirement Projections", icon: "bi-calendar3" },
    { id: "records", label: "Staff Service Records", icon: "bi-person-badge" },
  ];

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <span className="mt-2 text-muted small">Loading staff records...</span>
      </div>
    );
  }

  return (
    <div className="dashboard-main-view">
      <div className="section-header-pro mb-4">
        <div className="d-flex align-items-center gap-3">
          <div className="header-icon-box">
            <i className="bi bi-person-x text-primary"></i>
          </div>
          <div>
            <h3 className="mb-1">Retirement Management</h3>
            <p className="text-muted small mb-0">Monitor and update service records and retirement projections for faculty members.</p>
          </div>
        </div>
      </div>

      <div className="px-0">
        <TabNavigation
          tabs={retirementTabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        <div className="mt-4">
          {activeTab === "projections" && (
            <div className="row g-4">
              <div className="col-12">
                <AdminCard header={
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-calendar3 text-primary"></i>
                    <span>Retirement Counts by Financial Year</span>
                  </div>
                }>
                  <div className="row g-3">
                    <div className="col-md-auto">
                      <button
                        onClick={() => setSelectedYear(null)}
                        className={`btn ${selectedYear === null ? 'btn-primary' : 'btn-light'} border px-4 py-3 rounded-3 d-flex flex-column align-items-center`}
                        style={{ minWidth: '120px' }}
                      >
                        <span className="small opacity-75 fw-bold mb-1">TOTAL STAFF</span>
                        <span className="h4 mb-0 fw-bold">{totalTeachers}</span>
                      </button>
                    </div>
                    {upcoming.map(u => (
                      <div key={u.year} className="col-md-auto">
                        <button
                          onClick={() => {
                            handleYearClick(u.year);
                            setActiveTab("records");
                          }}
                          className={`btn ${selectedYear === u.year ? 'btn-primary' : 'btn-white'} border px-4 py-3 rounded-3 d-flex flex-column align-items-center shadow-sm transition-all`}
                          style={{ minWidth: '140px' }}
                        >
                          <span className="small opacity-75 fw-bold mb-1">YEAR {u.year}</span>
                          <span className="h4 mb-0 fw-bold">{u.count}</span>
                          <span className="small mt-1 opacity-50">View Records</span>
                        </button>
                      </div>
                    ))}
                    {upcoming.length === 0 && (
                      <div className="col text-muted small py-4 text-center">
                        <i className="bi bi-calendar-x d-block mb-2 fs-3 opacity-50"></i>
                        No upcoming retirement projections found for the next period.
                      </div>
                    )}
                  </div>

                  <div className="mt-5 p-3 bg-soft-info rounded-3 border-start border-4 border-info d-flex align-items-center gap-3">
                    <div className="bg-info bg-opacity-10 p-2 rounded-circle">
                      <i className="bi bi-info-circle-fill text-info fs-5"></i>
                    </div>
                    <p className="small text-info mb-0 fw-medium">
                      Retirement projections are based on service record data and institutional policy. 
                      Updating service dates in the next tab will automatically refresh these projections.
                    </p>
                  </div>
                </AdminCard>
              </div>
            </div>
          )}

          {activeTab === "records" && (
            <div className="row">
              <div className="col-12">
                <AdminCard header={
                  <div className="d-flex align-items-center justify-content-between w-100">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-person-badge text-primary"></i>
                      <span>Institutional Staff Service Records</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      {selectedYear && (
                        <button 
                          className="btn btn-sm btn-soft-danger px-2 py-1 rounded-pill small fw-bold"
                          onClick={() => setSelectedYear(null)}
                        >
                          Clear Filter <i className="bi bi-x"></i>
                        </button>
                      )}
                      <span className="badge bg-soft-primary text-primary px-3 py-2">
                        {selectedYear ? `Projection: ${selectedYear}` : 'Full Faculty Roster'}
                      </span>
                    </div>
                  </div>
                }>
                  <TableContainer title="">
                    <div className="table-responsive professional-table">
                      <table className="table align-middle table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="ps-3">Staff Member</th>
                            <th>Staff ID</th>
                            <th>Designated Retirement Date</th>
                            <th className="text-end pe-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTeachers.length > 0 ? (
                            filteredTeachers.map(t => (
                              <tr key={t.staff_id}>
                                <td className="ps-3">
                                  <div className="d-flex align-items-center gap-3">
                                    <div className="avatar-circle-sm bg-soft-primary text-primary fw-bold border border-primary border-opacity-10">
                                      {t.full_name?.charAt(0)}
                                    </div>
                                    <span className="fw-bold text-dark">{t.full_name}</span>
                                  </div>
                                </td>
                                <td className="text-muted fw-medium">{t.staff_id}</td>
                                <td>
                                  <div className="input-group input-group-sm" style={{ maxWidth: '180px' }}>
                                    <span className="input-group-text bg-white border-end-0">
                                      <i className="bi bi-calendar-event text-muted"></i>
                                    </span>
                                    <input
                                      type="date"
                                      className="form-control border-start-0 ps-0 bg-light-subtle fw-medium"
                                      value={t.retirement_date ? t.retirement_date.slice(0, 10) : ""}
                                      onChange={(e) => handleChange(t.staff_id, e.target.value || null)}
                                    />
                                  </div>
                                </td>
                                <td className="text-end pe-3">
                                  <button
                                    onClick={() => handleSave(t.staff_id)}
                                    disabled={savingId === t.staff_id}
                                    className={`btn btn-sm ${savingId === t.staff_id ? 'btn-light' : 'btn-primary'} px-3 rounded-pill fw-bold shadow-sm`}
                                  >
                                    {savingId === t.staff_id ? (
                                      <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Updating</>
                                    ) : (
                                      <><i className="bi bi-check-lg me-1"></i>Commit Change</>
                                    )}
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4">
                                <EmptyState title="No Records Found" description="No staff members match the current projection filter." />
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </TableContainer>
                </AdminCard>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
