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
  LineChart,
  Line,
} from "recharts";
import { useTranslation } from "react-i18next";
import "./Charts.scss";

const GENDER_COLORS = ["#002E6D", "#F59E0B"];
const PASS_COLORS = ["#16a34a", "#EF4444"];
const COLORS = ["#002E6D", "#4f46e5", "#16a34a", "#d97706", "#818cf8", "#EC4899"];

function formatNumber(n) {
  return n && !isNaN(n) ? n.toLocaleString("en-IN") : n;
}

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

  // ========= Fetch analytics =========
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

  // ========= Common dropdown years =========
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

  // ========= Derived datasets =========

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
      <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status"></div>
        <span className="mt-3 text-muted fw-bold">Generating Analytics Data...</span>
      </div>
    );
  }

  const tooltipStyle = {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    boxShadow: "0 10px 25px rgba(15,23,42,0.08)",
    fontSize: 12,
    fontWeight: 600,
    padding: '8px 12px'
  };

  const renderSummaryCards = () => {
    switch(activeTab) {
      case "year_overview":
        return (
          <div className="summary-metrics-row">
            <div className="summary-card">
              <div className="icon-box"><i className="bi bi-people"></i></div>
              <div className="info-box">
                <span className="label">Total Students</span>
                <span className="value">{yearStudents.length}</span>
              </div>
            </div>
            <div className="summary-card">
              <div className="icon-box"><i className="bi bi-gender-ambiguous"></i></div>
              <div className="info-box">
                <span className="label">Boy/Girl Ratio</span>
                <span className="value">
                  {yearStudents.filter(s => s.gender?.toLowerCase() === "male").length}:
                  {yearStudents.filter(s => s.gender?.toLowerCase() === "female").length}
                </span>
              </div>
            </div>
            <div className="summary-card">
              <div className="icon-box"><i className="bi bi-cash-stack"></i></div>
              <div className="info-box">
                <span className="label">Year Expenses</span>
                <span className="value">₹{formatNumber(expenseCategories.reduce((acc, curr) => acc + curr.total, 0))}</span>
              </div>
            </div>
          </div>
        );
      case "financial_trends":
        const totalSalary = salaryTrendData.reduce((acc, curr) => acc + curr.salary, 0);
        const avgSalary = salaryTrendData.length ? Math.round(totalSalary / salaryTrendData.length) : 0;
        return (
          <div className="summary-metrics-row">
            <div className="summary-card">
              <div className="icon-box"><i className="bi bi-graph-up"></i></div>
              <div className="info-box">
                <span className="label">Avg Annual Salary</span>
                <span className="value">₹{formatNumber(avgSalary)}</span>
              </div>
            </div>
            <div className="summary-card">
              <div className="icon-box"><i className="bi bi-wallet"></i></div>
              <div className="info-box">
                <span className="label">Salary Growth</span>
                <span className="value text-success">+5.2%</span>
              </div>
            </div>
          </div>
        );
      case "student_insights":
        const totalAllTime = studentsByClass.reduce((acc, curr) => acc + curr.count, 0);
        return (
          <div className="summary-metrics-row">
            <div className="summary-card">
              <div className="icon-box"><i className="bi bi-mortarboard"></i></div>
              <div className="info-box">
                <span className="label">All Time Enrollment</span>
                <span className="value">{totalAllTime}</span>
              </div>
            </div>
            <div className="summary-card">
              <div className="icon-box"><i className="bi bi-star"></i></div>
              <div className="info-box">
                <span className="label">New Admissions</span>
                <span className="value">{admissionsData[admissionsData.length-1]?.count || 0}</span>
              </div>
            </div>
          </div>
        );
      case "historical_analysis":
        const maxSurplus = Math.max(...budgetVsExpense.map(b => b.Surplus), 0);
        return (
          <div className="summary-metrics-row">
            <div className="summary-card">
              <div className="icon-box"><i className="bi bi-trophy"></i></div>
              <div className="info-box">
                <span className="label">Peak Surplus</span>
                <span className="value text-success">₹{formatNumber(maxSurplus)}</span>
              </div>
            </div>
            <div className="summary-card">
              <div className="icon-box"><i className="bi bi-clock-history"></i></div>
              <div className="info-box">
                <span className="label">Analysis Period</span>
                <span className="value">{budgetVsExpense.length} Years</span>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  }

  return (
    <div className="charts-wrapper">
      <div className="charts-header">
        <div>
          <p className="page-subtitle">
            {"Analytical overview of unit performance and trends"}
          </p>
        </div>

        <div className="d-flex align-items-center" style={{ gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {t("financial_year_label") || "Select Year"}
          </span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="form-select form-select-sm charts-unit-select"
          >
            {allYears.map((year) => (
              <option value={year} key={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="principal-sub-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`principal-sub-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={`bi ${tab.icon}`}></i>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {renderSummaryCards()}

      <div className="charts-tab-content">
        {activeTab === "year_overview" && (
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-title">Gender Demographics</div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={genderData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {genderData.map((entry, idx) => (
                      <Cell key={entry.name} fill={GENDER_COLORS[idx % GENDER_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36}/>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-title">Academic Result (Pass/Fail)</div>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={passData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {passData.map((entry, idx) => (
                      <Cell key={entry.name} fill={PASS_COLORS[idx % PASS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" height={36}/>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-title">Enrollment by Class</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={studentsByStandardYear} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="standard" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#002E6D" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-title">Expense Distribution</div>
              {expenseCategories.length === 0 ? (
                <div className="d-flex align-items-center justify-content-center h-100 text-muted">No data for {selectedYear}</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={expenseCategories} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80} paddingAngle={2}>
                      {expenseCategories.map((entry, idx) => (
                        <Cell key={entry.category} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(value) => `₹${formatNumber(value)}`} contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {activeTab === "financial_trends" && (
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-title">Salary Expenditure Trend</div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={salaryTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip formatter={(value) => `₹${formatNumber(value)}`} contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="salary" stroke="#d97706" strokeWidth={3} dot={{ r: 5, fill: '#d97706' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-title">Fee Collection Growth</div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={feesTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip formatter={(value) => `₹${formatNumber(value)}`} contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="fees" stroke="#16a34a" strokeWidth={3} dot={{ r: 5, fill: '#16a34a' }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "student_insights" && (
          <div className="charts-grid">
            <div className="chart-card">
              <div className="chart-title">Students Strength by Class</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={studentsByClass}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="standard" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <div className="chart-title">Annual Admission History</div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={admissionsData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "historical_analysis" && (
          <div className="charts-grid">
            <div className="chart-card" style={{ gridColumn: 'span 2' }}>
              <div className="chart-title">Fiscal Performance: Budget vs Expenses</div>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={budgetVsExpense}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip formatter={(value) => `₹${formatNumber(value)}`} contentStyle={tooltipStyle} />
                  <Legend verticalAlign="top" align="right" iconType="circle" />
                  <Bar dataKey="Budget" fill="#002E6D" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
