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

const GENDER_COLORS = ["#0B63E5", "#F59E0B"];
const PASS_COLORS = ["#22C55E", "#EF4444"];
const COLORS = ["#0B63E5", "#1D9BF0", "#22C55E", "#F97316", "#6366F1", "#EC4899"];

function formatNumber(n) {
  return n && !isNaN(n) ? n.toLocaleString("en-IN") : n;
}

export default function Charts({ unitId }) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [selectedYear, setSelectedYear] = useState("");

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

  // Salary paid trend across all financial years
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

  // Fees collected trend across all academic years (placeholder)
  const feesTrendData = useMemo(() => {
    if (!analytics?.allStudents || analytics.allStudents.length === 0)
      return [];
    const yearMap = {};
    analytics.allStudents.forEach((s) => {
      if (!yearMap[s.academic_year]) yearMap[s.academic_year] = 0;
      yearMap[s.academic_year] += 5000; // placeholder per student
    });
    return Object.keys(yearMap)
      .sort()
      .map((year) => ({
        year,
        fees: Math.round(yearMap[year]),
      }));
  }, [analytics]);

  // Students by class (all years)
  const studentsByClass = useMemo(
    () =>
      analytics?.studentsByClass?.map((row) => ({
        standard: row.standard,
        count: parseInt(row.count, 10),
      })) || [],
    [analytics]
  );

  // Admissions per year
  const admissionsData = useMemo(
    () =>
      analytics?.admissions?.map((row) => ({
        year: String(row.year),
        count: parseInt(row.count, 10),
      })) || [],
    [analytics]
  );

  // Only students of selected year
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

  // Students by standard for selected academic year
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

  // Payments by category for selected year
  const expenseCategories = useMemo(
    () =>
      analytics?.payments
        ?.filter((p) => p.fiscal_year === selectedYear)
        .map((p) => ({ ...p, total: Number(p.total) })) || [],
    [analytics, selectedYear]
  );

  // Budget vs Expense for all financial years
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
    return <div style={{ padding: 24 }}>{t("loading")}...</div>;
  }

  // Shared tooltip style (light card)
  const tooltipStyle = {
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 8,
    boxShadow: "0 10px 25px rgba(15,23,42,0.08)",
    fontSize: 12,
  };

  return (
    <div className="charts-wrapper">
      {/* Header row */}
      <div className="charts-header">
        <div>
            <p className="page-subtitle">
            {"Visualize key school metrics"}
          </p>
        </div>

        <div className="d-flex align-items-center" style={{ gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            {t("financial_year_label") || "Financial Year:"}
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

      {/* ========== SECTION 1: YEAR SPECIFIC ========== */}
      <h5 style={{ marginTop: 8, marginBottom: 12 }}>
        {t("year_specific") || "Year Specific"} {selectedYear}
      </h5>
      <div className="charts-grid">
        {/* Gender distribution */}
        <div className="chart-card">
          <div className="chart-title">
            {t("students_by_gender") || "Students by Gender"}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={genderData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {genderData.map((entry, idx) => (
                  <Cell
                    key={entry.name}
                    fill={GENDER_COLORS[idx % GENDER_COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Pass / Fail */}
        <div className="chart-card">
          <div className="chart-title">
            {t("pass_fail_distribution") || "Pass / Fail Distribution"}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={passData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {passData.map((entry, idx) => (
                  <Cell
                    key={entry.name}
                    fill={PASS_COLORS[idx % PASS_COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Students by standard (selected year) */}
        <div className="chart-card">
          <div className="chart-title">
            {t("students_by_class_year_specific") ||
              "Students by Class (Year Specific)"}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={studentsByStandardYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="standard" stroke="#4B5563" />
              <YAxis stroke="#4B5563" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="count" fill="#0B63E5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payments by category (selected FY) */}
        <div className="chart-card">
          <div className="chart-title">
            {t("payments_by_category") || "Payments by Category"}
          </div>
          {expenseCategories.length === 0 ? (
            <div className="text-muted small mt-3">
              {t("no_payment_data") || "No payment data for this year."}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={expenseCategories}
                  dataKey="total"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ category, total }) =>
                    `${category}: ₹${formatNumber(total)}`
                  }
                  labelLine={false}
                >
                  {expenseCategories.map((entry, idx) => (
                    <Cell
                      key={entry.category}
                      fill={COLORS[idx % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  formatter={(value) => `₹${formatNumber(value)}`}
                  contentStyle={tooltipStyle}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ========== SECTION 2: FINANCIAL TRENDS ========== */}
      <h5 style={{ marginTop: 32, marginBottom: 12 }}>
        {t("financial_trends") || "Financial Trends Over Years"}
      </h5>
      <div className="charts-grid">
        {/* Salary trend */}
        <div className="chart-card">
          <div className="chart-title">
            {t("salary_trend") || "Salary Trend"}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={salaryTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="year" stroke="#4B5563" />
              <YAxis stroke="#4B5563" />
              <Tooltip
                formatter={(value) => `₹${formatNumber(value)}`}
                contentStyle={tooltipStyle}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="salary"
                stroke="#F97316"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={t("salary_paid") || "Salary Paid"}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Fees trend */}
        <div className="chart-card">
          <div className="chart-title">{t("fees_trend") || "Fees Trend"}</div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={feesTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="year" stroke="#4B5563" />
              <YAxis stroke="#4B5563" />
              <Tooltip
                formatter={(value) => `₹${formatNumber(value)}`}
                contentStyle={tooltipStyle}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="fees"
                stroke="#22C55E"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name={t("fees_collected") || "Fees Collected"}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ========== SECTION 3: HISTORICAL ANALYSIS ========== */}
      <h5 style={{ marginTop: 32, marginBottom: 12 }}>
        {t("historical_analysis") || "Historical Analysis"}
      </h5>
      <div className="charts-grid">
        {/* Students by class (all years) */}
        <div className="chart-card">
          <div className="chart-title">
            {t("students_by_class") || "Students by Class"}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={studentsByClass}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="standard" stroke="#4B5563" />
              <YAxis stroke="#4B5563" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="count" fill="#0B63E5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Admissions per year */}
        <div className="chart-card">
          <div className="chart-title">
            {t("admissions_per_year") || "Admissions per Year"}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={admissionsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="year" stroke="#4B5563" />
              <YAxis stroke="#4B5563" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="count" fill="#22C55E" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Budget vs Expenses */}
        <div className="chart-card">
          <div className="chart-title">
            {t("budget_vs_expenses") || "Budget vs Expenses"}
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={budgetVsExpense}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="year" stroke="#4B5563" />
              <YAxis stroke="#4B5563" />
              <Tooltip
                formatter={(value) => `₹${formatNumber(value)}`}
                contentStyle={tooltipStyle}
              />
              <Legend />
              <Bar dataKey="Budget" fill="#0B63E5" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Expenses" fill="#F97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
