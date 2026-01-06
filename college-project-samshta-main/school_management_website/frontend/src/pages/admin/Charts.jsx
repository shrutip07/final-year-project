import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  PointElement,
  Legend,
  ArcElement,
} from "chart.js";
import AdminCard from "../../components/admin/AdminCard";
import TabNavigation from "../../components/admin/TabNavigation";

// Register ALL elements used (including PointElement!)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement, // REGISTER PointElement to fix "point" error!
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminCharts({ units }) {
  const [selectedUnitId, setSelectedUnitId] = useState(
    units?.[0]?.unit_id || ""
  );
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [selectedTab, setSelectedTab] = useState("admissions");

  useEffect(() => {
    if (!selectedUnitId) return;
    setLoading(true);
    axios
      .get(
        `http://localhost:5000/api/admin/units/${selectedUnitId}/analytics`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      )
      .then((res) => {
        setAnalytics(res.data);
        setLoading(false);
      })
      .catch((e) => {
        setErr("Failed to fetch analytics");
        setLoading(false);
      });
  }, [selectedUnitId]);

  if (!units?.length) return <div>No units found.</div>;

  const getChartData = () => {
    if (!analytics) return {};

    // Admissions by year
    const admissionsYears = analytics.admissions.map((a) => a.year);
    const admissionsCounts = analytics.admissions.map((a) => a.count);

    // Students by class/standard
    const classLabels = analytics.studentsByClass.map((c) => c.standard);
    const classCounts = analytics.studentsByClass.map((c) => c.count);

    // Payments
    const allFiscalYears = [
      ...new Set(analytics.payments.map((p) => p.fiscal_year)),
    ];
    const paymentCats = [
      ...new Set(analytics.payments.map((p) => p.category)),
    ];
    const paymentsDS = paymentCats.map((cat) => ({
      label: cat,
      data: allFiscalYears.map(
        (yr) =>
          +analytics.payments
            .filter((p) => p.category === cat && p.fiscal_year === yr)
            .reduce((sum, p) => sum + Number(p.total), 0)
      ),
    }));

    // Budgets
    const income = analytics.budgets.map((b) => b.income);
    const expenses = analytics.budgets.map((b) => b.expenses);
    const budgetLabels = analytics.budgets.map(
      (b) => `${b.fiscal_year} (${b.version})`
    );

    // Pass/fail and gender charts
    const allStudents = analytics.allStudents || [];
    const passCounts = [
      allStudents.filter((s) => s.passed === true || s.passed === "yes")
        .length,
      allStudents.filter((s) => s.passed === false || s.passed === "no")
        .length,
    ];
    const genderCounts = [
      allStudents.filter((s) => s.gender?.toLowerCase() === "male").length,
      allStudents.filter((s) => s.gender?.toLowerCase() === "female").length,
    ];

    return {
      admissions: { labels: admissionsYears, data: admissionsCounts },
      studentsByClass: { labels: classLabels, data: classCounts },
      payments: { labels: allFiscalYears, datasets: paymentsDS },
      budgets: { labels: budgetLabels, income, expenses },
      pass: passCounts,
      gender: genderCounts,
    };
  };

  const c = getChartData();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, padding: 20, font: { weight: '600', size: 11 } }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } }
    }
  };

  return (
    <div className="charts-page erp-container">
      {/* Unit Selection Card */}
      <AdminCard header={
        <div className="d-flex align-items-center gap-2">
          <i className="bi bi-graph-up text-primary"></i>
          <span>Institutional Analytics</span>
        </div>
      } className="mb-3">
        <div className="row align-items-center">
          <div className="col-md-12">
            <div className="d-flex align-items-center justify-content-between gap-3">
              <p className="text-muted small mb-0">
                <i className="bi bi-info-circle me-1"></i>
                Select a school unit to visualize performance and student demographics.
              </p>
              <select
                className="form-select border-primary-subtle"
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                style={{ fontWeight: '500', padding: '0.5rem 1rem', width: '350px' }}
              >
                {units.map((u) => (
                  <option key={u.unit_id} value={u.unit_id}>
                    {u.unit_name || `School ${u.unit_id}`} | {u.unit_id}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </AdminCard>

      {selectedUnitId && (
        <div className="charts-content-wrapper">
          <TabNavigation
            tabs={[
              { id: "admissions", label: "Admissions", icon: "bi-person-plus-fill" },
              { id: "students", label: "Students", icon: "bi-mortarboard-fill" },
              { id: "finance", label: "Finance", icon: "bi-cash-stack" },
              { id: "results", label: "Results", icon: "bi-check-circle-fill" },
              { id: "demographics", label: "Demographics", icon: "bi-people-fill" },
            ]}
            activeTab={selectedTab}
            onTabChange={setSelectedTab}
          />

          <div className="tab-pane-container mt-3" style={{ height: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center py-5 bg-white rounded border shadow-sm">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="mt-3 text-muted fw-bold">Generating reports...</p>
              </div>
            ) : err ? (
              <div className="alert alert-danger shadow-sm border-0 d-flex align-items-center">
                <i className="bi bi-exclamation-octagon-fill me-2 fs-4"></i>
                {err}
              </div>
            ) : (
              analytics && (
                <div className="tab-content">
                    {/* 1. Admissions Tab */}
                    {selectedTab === "admissions" && (
                      <div className="row g-4 justify-content-center">
                        <div className="col-lg-7">
                          <AdminCard header={
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-activity text-primary"></i>
                              <span>Admissions per Year</span>
                            </div>
                          }>
                            <div style={{ height: '350px' }}>
                              <Bar
                                data={{
                                  labels: c.admissions.labels,
                                  datasets: [
                                    {
                                      label: "New Admissions",
                                      data: c.admissions.data,
                                      backgroundColor: "rgba(34, 108, 240, 0.85)",
                                      borderRadius: 6,
                                    },
                                  ],
                                }}
                                options={chartOptions}
                                redraw
                              />
                            </div>
                          </AdminCard>
                        </div>
                      </div>
                    )}

                    {/* 2. Students Tab */}
                    {selectedTab === "students" && (
                      <div className="row g-4 justify-content-center">
                        <div className="col-lg-7">
                          <AdminCard header={
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-grid-3x3-gap text-success"></i>
                              <span>Students by Standard</span>
                            </div>
                          }>
                            <div style={{ height: '350px' }}>
                              <Bar
                                data={{
                                  labels: c.studentsByClass.labels,
                                  datasets: [
                                    {
                                      label: "Total Students",
                                      data: c.studentsByClass.data,
                                      backgroundColor: "rgba(71, 199, 152, 0.85)",
                                      borderRadius: 6,
                                    },
                                  ],
                                }}
                                options={chartOptions}
                                redraw
                              />
                            </div>
                          </AdminCard>
                        </div>
                      </div>
                    )}

                    {/* 3. Finance Tab */}
                    {selectedTab === "finance" && (
                      <div className="row g-4">
                        <div className="col-lg-6">
                          <AdminCard header={
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-wallet2 text-warning"></i>
                              <span>Payments by Year / Category</span>
                            </div>
                          }>
                            <div style={{ height: '350px' }}>
                              <Bar
                                data={{
                                  labels: c.payments.labels,
                                  datasets: c.payments.datasets.map((d, i) => ({
                                    ...d,
                                    backgroundColor: ["rgba(196, 88, 232, 0.85)", "rgba(80, 155, 235, 0.85)", "rgba(242, 186, 49, 0.85)"][i % 3],
                                    borderRadius: 4,
                                  })),
                                }}
                                options={{
                                  ...chartOptions,
                                  scales: { 
                                    x: { stacked: true, grid: { display: false } }, 
                                    y: { stacked: true, grid: { color: '#f1f5f9' } } 
                                  }
                                }}
                                redraw
                              />
                            </div>
                          </AdminCard>
                        </div>
                        <div className="col-lg-6">
                          <AdminCard header={
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-graph-down-arrow text-danger"></i>
                              <span>Budgets (Income vs Expenses)</span>
                            </div>
                          }>
                            <div style={{ height: '350px' }}>
                              <Line
                                data={{
                                  labels: c.budgets.labels,
                                  datasets: [
                                    {
                                      label: "Income",
                                      data: c.budgets.income,
                                      borderColor: "#33b249",
                                      backgroundColor: "rgba(191, 252, 198, 0.2)",
                                      fill: true,
                                      tension: 0.4
                                    },
                                    {
                                      label: "Expenses",
                                      data: c.budgets.expenses,
                                      borderColor: "#db504a",
                                      backgroundColor: "rgba(255, 224, 224, 0.2)",
                                      fill: true,
                                      tension: 0.4
                                    },
                                  ],
                                }}
                                options={chartOptions}
                                redraw
                              />
                            </div>
                          </AdminCard>
                        </div>
                      </div>
                    )}

                    {/* 4. Results Tab */}
                    {selectedTab === "results" && (
                      <div className="row g-4 justify-content-center">
                        <div className="col-lg-8">
                          <AdminCard header={
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-pie-chart-fill text-info"></i>
                              <span>Pass / Fail Distribution</span>
                            </div>
                          }>
                            <div className="row align-items-center">
                              <div className="col-md-6 text-center border-end">
                                 <div style={{ height: '300px' }}>
                                    <Pie
                                      data={{
                                        labels: ["Passed", "Not Passed"],
                                        datasets: [{
                                          data: c.pass,
                                          backgroundColor: ["#3b82f6", "#f59e0b"],
                                          borderWidth: 0,
                                        }],
                                      }}
                                      options={{
                                        maintainAspectRatio: false,
                                        plugins: { legend: { position: 'bottom' } }
                                      }}
                                      redraw
                                    />
                                 </div>
                              </div>
                              <div className="col-md-6 px-4">
                                 <div className="p-4 bg-light rounded-3 border">
                                    <h6 className="fw-bold mb-3 text-dark">Data Summary</h6>
                                    <div className="d-flex justify-content-between mb-2 pb-2 border-bottom">
                                       <span className="text-muted">Students Passed</span>
                                       <span className="fw-bold text-success fs-5">{c.pass[0]}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                       <span className="text-muted">Pending/Fail</span>
                                       <span className="fw-bold text-warning fs-5">{c.pass[1]}</span>
                                    </div>
                                 </div>
                              </div>
                            </div>
                          </AdminCard>
                        </div>
                      </div>
                    )}

                    {/* 5. Demographics Tab */}
                    {selectedTab === "demographics" && (
                      <div className="row g-4 justify-content-center">
                        <div className="col-lg-6">
                          <AdminCard header={
                            <div className="d-flex align-items-center gap-2">
                              <i className="bi bi-gender-ambiguous text-secondary"></i>
                              <span>Gender Distribution</span>
                            </div>
                          }>
                            <div style={{ height: '350px' }}>
                              <Pie
                                data={{
                                  labels: ["Male", "Female"],
                                  datasets: [{
                                    data: c.gender,
                                    backgroundColor: ["#42a5f5", "#d81b60"],
                                    borderWidth: 0,
                                  }],
                                }}
                                options={{
                                  maintainAspectRatio: false,
                                  plugins: { 
                                    legend: { 
                                      position: 'bottom',
                                      labels: { padding: 20, font: { size: 12, weight: '600' } }
                                    } 
                                  }
                                }}
                                redraw
                              />
                            </div>
                          </AdminCard>
                        </div>
                      </div>
                    )}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

