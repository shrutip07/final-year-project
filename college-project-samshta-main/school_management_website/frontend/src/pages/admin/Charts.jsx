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

  return (
    <div className="charts-wrapper">
      {/* header row: title + select */}
      <div className="charts-header">
        <h2 className="charts-title mb-0">Analytics Charts</h2>
        <div className="charts-unit-select">
          <label className="form-label fw-bold mb-1">Select Unit</label>
          <select
            className="form-select"
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
          >
            {units.map((u) => (
              <option key={u.unit_id} value={u.unit_id}>
                {u.unit_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div>Loading analytics...</div>
      ) : err ? (
        <div>{err}</div>
      ) : (
        analytics && (
          <div className="charts-grid">
            {/* 1. Admissions per Year */}
            <div className="chart-card">
              <h5 className="chart-title">Admissions per Year</h5>
              <Bar
                data={{
                  labels: c.admissions.labels,
                  datasets: [
                    {
                      label: "Admissions",
                      data: c.admissions.data,
                      backgroundColor: "#226cf0",
                    },
                  ],
                }}
                options={{ responsive: true }}
                redraw
              />
            </div>

            {/* 2. Students by Standard */}
            <div className="chart-card">
              <h5 className="chart-title">Students by Standard</h5>
              <Bar
                data={{
                  labels: c.studentsByClass.labels,
                  datasets: [
                    {
                      label: "Students",
                      data: c.studentsByClass.data,
                      backgroundColor: "#47c798",
                    },
                  ],
                }}
                options={{ responsive: true }}
                redraw
              />
            </div>

            {/* 3. Payments by Year/Category */}
            <div className="chart-card">
              <h5 className="chart-title">Payments by Year/Category</h5>
              <Bar
                data={{
                  labels: c.payments.labels,
                  datasets: c.payments.datasets.map((d, i) => ({
                    ...d,
                    backgroundColor: ["#c458e8", "#509beb", "#f2ba31"][i % 3],
                  })),
                }}
                options={{
                  responsive: true,
                  scales: { x: { stacked: true }, y: { stacked: true } },
                }}
                redraw
              />
            </div>

            {/* 4. Budgets */}
            <div className="chart-card">
              <h5 className="chart-title">Budgets (Income vs Expenses)</h5>
              <Line
                data={{
                  labels: c.budgets.labels,
                  datasets: [
                    {
                      label: "Income",
                      data: c.budgets.income,
                      borderColor: "#33b249",
                      backgroundColor: "#bffcc6",
                    },
                    {
                      label: "Expenses",
                      data: c.budgets.expenses,
                      borderColor: "#db504a",
                      backgroundColor: "#ffe0e0",
                    },
                  ],
                }}
                options={{ responsive: true }}
                redraw
              />
            </div>

            {/* 5. Pass / Fail */}
            <div className="chart-card">
              <h5 className="chart-title">Pass / Fail Distribution</h5>
              <Pie
                data={{
                  labels: ["Passed", "Not Passed"],
                  datasets: [
                    {
                      data: c.pass,
                      backgroundColor: ["#2196f3", "#ff9f43"],
                    },
                  ],
                }}
                redraw
              />
            </div>

            {/* 6. Gender distribution */}
            <div className="chart-card">
              <h5 className="chart-title">Gender Distribution</h5>
              <Pie
                data={{
                  labels: ["Male", "Female"],
                  datasets: [
                    {
                      data: c.gender,
                      backgroundColor: ["#42a5f5", "#d81b60"],
                    },
                  ],
                }}
                redraw
              />
            </div>
          </div>
        )
      )}
    </div>
  );
}
