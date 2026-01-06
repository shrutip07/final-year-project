import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { useTranslation } from "react-i18next";
import TabNavigation from "../../components/admin/TabNavigation";
import AdminCard from "../../components/admin/AdminCard";
import "./Charts.scss";

const PASS_COLORS = ["#16a34a", "#dc2626"];
const COLORS = ["#002E6D", "#4f46e5", "#16a34a", "#d97706", "#818cf8", "#db2777"];

function formatNumber(n) {
  return n && !isNaN(n) ? n.toLocaleString("en-IN") : n;
}

const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="value" style={{ color: entry.color }}>
            {entry.name}: {formatter ? formatter(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Charts({ unitId }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");
  const [activeTab, setActiveTab] = useState("year_overview");

  const tabs = [
    { id: "year_overview", label: "Year Overview", icon: "bi-calendar-event" },
    { id: "financial_trends", label: "Financial Trends", icon: "bi-graph-up" },
    { id: "student_insights", label: "Student Insights", icon: "bi-people" },
    { id: "historical_analysis", label: "Historical Analysis", icon: "bi-clock-history" },
  ];

  useEffect(() => {
    if (!unitId) return;
    setLoading(true);
    const token = localStorage.getItem("token");

    axios
      .get(
        `http://localhost:5000/api/principal/analytics?unit_id=${unitId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        const data = res.data;
        setAnalytics(data);

        const allYears = [
          ...new Set([
            ...(data.allStudents?.map((s) => s.academic_year) || []),
            ...(data.payments?.map((p) => p.fiscal_year) || []),
          ]),
        ]
          .filter(Boolean)
          .sort()
          .reverse();

        if (allYears.length > 0) {
          setSelectedYear(allYears[0]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch analytics:", err);
      })
      .finally(() => setLoading(false));
  }, [unitId]);

  const allYears = useMemo(() => {
    if (!analytics) return [];
    const years = [
      ...new Set([
        ...(analytics.allStudents?.map((s) => s.academic_year) || []),
        ...(analytics.payments?.map((p) => p.fiscal_year) || []),
      ]),
    ]
      .filter(Boolean)
      .sort()
      .reverse();
    return years.length ? years : ["2024-25"];
  }, [analytics]);

  const salaryTrendData = useMemo(() => {
    if (!analytics?.payments || analytics.payments.length === 0) return [];
    const yearMap = {};
    analytics.payments.forEach((p) => {
      if (!yearMap[p.fiscal_year]) yearMap[p.fiscal_year] = 0;
      yearMap[p.fiscal_year] += Number(p.total) || 0;
    });
    return Object.keys(yearMap)
      .sort()
      .map((year) => ({
        year,
        salary: Math.round(yearMap[year]),
      }));
  }, [analytics]);

  const feesTrendData = useMemo(() => {
    if (!analytics?.allStudents || analytics.allStudents.length === 0)
      return [];
    const yearMap = {};
    analytics.allStudents.forEach((s) => {
      if (!yearMap[s.academic_year]) yearMap[s.academic_year] = 0;
      yearMap[s.academic_year] += 5000;
    });
    return Object.keys(yearMap)
      .sort()
      .map((year) => ({
        year,
        fees: Math.round(yearMap[year]),
      }));
  }, [analytics]);

  const studentsByClass = useMemo(
    () =>
      analytics?.studentsByClass?.map((row) => ({
        standard: row.standard,
        count: parseInt(row.count, 10),
      })) || [],
    [analytics]
  );

  const admissionsData = useMemo(
    () =>
      analytics?.admissions?.map((row) => ({
        year: String(row.year),
        count: parseInt(row.count, 10),
      })) || [],
    [analytics]
  );

  const yearStudents = useMemo(
    () =>
      analytics?.allStudents?.filter(
        (s) => s.academic_year === selectedYear
      ) || [],
    [analytics, selectedYear]
  );

  const genderData = useMemo(
    () => [
      {
        name: t("male") || "Male",
        value: yearStudents.filter(
          (s) => s.gender?.toLowerCase() === "male"
        ).length,
      },
      {
        name: t("female") || "Female",
        value: yearStudents.filter(
          (s) => s.gender?.toLowerCase() === "female"
        ).length,
      },
    ],
    [yearStudents, t]
  );

  const passData = useMemo(
    () => [
      {
        name: t("passed") || "Passed",
        value: yearStudents.filter((s) => s.passed === true).length,
      },
      {
        name: t("failed") || "Failed",
        value: yearStudents.filter((s) => s.passed === false).length,
      },
    ],
    [yearStudents, t]
  );

  const studentsByStandardYear = useMemo(() => {
    if (!analytics?.allStudents || !selectedYear) return [];
    const counts = {};
    analytics.allStudents
      .filter((s) => s.academic_year === selectedYear)
      .forEach((s) => {
        const std = s.standard || "NA";
        counts[std] = (counts[std] || 0) + 1;
      });

    return Object.keys(counts)
      .sort()
      .map((std) => ({
        standard: std,
        count: counts[std],
      }));
  }, [analytics, selectedYear]);

  const expenseCategories = useMemo(
    () =>
      analytics?.payments
        ?.filter((p) => p.fiscal_year === selectedYear)
        .map((p) => ({ ...p, total: Number(p.total) })) || [],
    [analytics, selectedYear]
  );

  const budgetVsExpense = useMemo(
    () =>
      analytics?.budgets?.map((b) => ({
        year: b.fiscal_year,
        Budget: Number(b.income || 0),
        Expenses: Number(b.expenses || 0),
        Surplus: Number(b.surplus || 0),
      })) || [],
    [analytics]
  );

  if (loading || !analytics) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <span className="mt-3 text-muted fw-bold">Generating Analytics Insights...</span>
      </div>
    );
  }

  return (
    <div className="charts-wrapper">
      <div className="charts-header-container mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <div className="header-left">
            <h4 className="fw-bold mb-1">Institutional Analytics</h4>
            <p className="text-muted small mb-0">
              Visualize key school metrics and performance indicators
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small fw-bold">Academic Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="form-select form-select-sm charts-unit-select"
              style={{ width: '130px', borderRadius: '8px' }}
            >
              {allYears.map((year) => (
                <option value={year} key={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="charts-tabs-container mb-4">
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      <div className="charts-tab-content">
        {activeTab === "year_overview" && (
          <div className="charts-grid">
            <AdminCard 
              header={
                <div className="d-flex align-items-center">
                  <i className="bi bi-gender-ambiguous me-2 text-primary"></i>
                  <span className="fw-bold">Students by Gender</span>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <defs>
                    <linearGradient id="maleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#002E6D" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#002E6D" stopOpacity={1}/>
                    </linearGradient>
                    <linearGradient id="femaleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={1}/>
                    </linearGradient>
                  </defs>
                  <Pie 
                    data={genderData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60}
                    outerRadius={90} 
                    paddingAngle={5}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {genderData.map((entry, idx) => (
                      <Cell key={entry.name} fill={idx === 0 ? "url(#maleGradient)" : "url(#femaleGradient)"} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </AdminCard>

            <AdminCard 
              header={
                <div className="d-flex align-items-center">
                  <i className="bi bi-check-all me-2 text-success"></i>
                  <span className="fw-bold">Pass / Fail Distribution</span>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={passData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={60}
                    outerRadius={90} 
                    paddingAngle={5}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {passData.map((entry, idx) => (
                      <Cell key={entry.name} fill={PASS_COLORS[idx % PASS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </AdminCard>

            <AdminCard 
              header={
                <div className="d-flex align-items-center">
                  <i className="bi bi-bar-chart-steps me-2 text-primary"></i>
                  <span className="fw-bold">Students by Class (Year Specific)</span>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={studentsByStandardYear}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#002E6D" stopOpacity={0.9}/>
                      <stop offset="95%" stopColor="#002E6D" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="standard" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0,46,109,0.05)'}} />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </AdminCard>

            <AdminCard 
              header={
                <div className="d-flex align-items-center">
                  <i className="bi bi-cash-coin me-2 text-primary"></i>
                  <span className="fw-bold">Payments by Category</span>
                </div>
              }
            >
              {expenseCategories.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted small py-5">
                  <i className="bi bi-info-circle me-2"></i> {t("no_payment_data") || "No payment data for this year."}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={expenseCategories} 
                      dataKey="total" 
                      nameKey="category" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={90} 
                      innerRadius={40}
                      label={({ category }) => category}
                    >
                      {expenseCategories.map((entry, idx) => (
                        <Cell key={entry.category} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip formatter={(val) => `₹${formatNumber(val)}`} />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </AdminCard>
          </div>
        )}

        {activeTab === "financial_trends" && (
          <div className="charts-grid">
            <AdminCard 
              header={
                <div className="d-flex align-items-center">
                  <i className="bi bi-graph-up me-2 text-warning"></i>
                  <span className="fw-bold">Salary Trend</span>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={salaryTrendData}>
                  <defs>
                    <linearGradient id="salaryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip content={<CustomTooltip formatter={(val) => `₹${formatNumber(val)}`} />} />
                  <Area 
                    type="monotone" 
                    dataKey="salary" 
                    stroke="#F97316" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#salaryGradient)" 
                    name={t("salary_paid") || "Salary Paid"} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </AdminCard>

            <AdminCard 
              header={
                <div className="d-flex align-items-center">
                  <i className="bi bi-graph-up-arrow me-2 text-success"></i>
                  <span className="fw-bold">Fees Trend</span>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={feesTrendData}>
                  <defs>
                    <linearGradient id="feesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip content={<CustomTooltip formatter={(val) => `₹${formatNumber(val)}`} />} />
                  <Area 
                    type="monotone" 
                    dataKey="fees" 
                    stroke="#16a34a" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#feesGradient)" 
                    name={t("fees_collected") || "Fees Collected"} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </AdminCard>
          </div>
        )}

        {activeTab === "student_insights" && (
          <div className="charts-grid">
            <AdminCard 
              header={
                <div className="d-flex align-items-center">
                  <i className="bi bi-people me-2 text-primary"></i>
                  <span className="fw-bold">Students by Class (Historical)</span>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={studentsByClass}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="standard" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#002E6D" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </AdminCard>

            <AdminCard 
              header={
                <div className="d-flex align-items-center">
                  <i className="bi bi-person-plus me-2 text-success"></i>
                  <span className="fw-bold">Admissions per Year</span>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={admissionsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </AdminCard>
          </div>
        )}

        {activeTab === "historical_analysis" && (
          <div className="charts-grid">
            <AdminCard 
              header={
                <div className="d-flex align-items-center">
                  <i className="bi bi-clock-history me-2 text-primary"></i>
                  <span className="fw-bold">Budget vs Expenses</span>
                </div>
              }
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetVsExpense}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip content={<CustomTooltip formatter={(val) => `₹${formatNumber(val)}`} />} />
                  <Legend />
                  <Bar dataKey="Budget" fill="#002E6D" radius={[6, 6, 0, 0]} barSize={30} />
                  <Bar dataKey="Expenses" fill="#F97316" radius={[6, 6, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </AdminCard>
          </div>
        )}
      </div>
    </div>
  );
}
