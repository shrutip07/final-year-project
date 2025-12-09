// src/pages/teacher/Charts.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

import ChatWidget from "../../components/ChatWidget";
import "../teacher/Dashboard.scss";   // sidebar + general teacher styles
import "./Charts.scss";              // charts-specific styles

const GENDER_COLORS = ["#278BCD", "#E9B949"];
const PASS_COLORS = ["#56C596", "#F37272"];

export default function Charts() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [allYears, setAllYears] = useState([]);
  const [academicYear, setAcademicYear] = useState("");
  const [genderData, setGenderData] = useState([]);
  const [passData, setPassData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // sidebar active tab
  const [activeTab, setActiveTab] = useState("charts");

  const sidebarItems = [
    { key: "dashboard", label: t("dashboard", "Dashboard"), icon: "bi-speedometer2" },
    { key: "profile", label: t("profile", "Profile"), icon: "bi-person" },
    { key: "students", label: t("students", "Students"), icon: "bi-people" },
    { key: "charts", label: t("charts", "Charts"), icon: "bi-bar-chart" },
    { key: "notifications", label: t("notifications", "Notifications"), icon: "bi-bell" }
  ];

  const handleSidebarClick = (key) => {
    setActiveTab(key);
    switch (key) {
      case "dashboard":
        navigate("/teacher");
        break;
      case "profile":
        navigate("/teacher/profile");
        break;
      case "students":
        navigate("/teacher/students");
        break;
      case "charts":
        navigate("/teacher/charts");
        break;
      case "notifications":
        navigate("/teacher/notifications");
        break;
      default:
        break;
    }
  };

  // Load academic years
  useEffect(() => {
    async function fetchYears() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/teacher/academic-years",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const years = res.data || [];
        setAllYears(years);
        if (years.length > 0) setAcademicYear(years[0]);
      } catch (err) {
        setError(t("failed_load_years", "Failed to load academic years"));
      }
    }
    fetchYears();
  }, [t]);

  // Load chart data for selected year
  useEffect(() => {
    if (!academicYear) return;

    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:5000/api/teacher/students?academic_year=${encodeURIComponent(
            academicYear
          )}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const students = res.data || [];

        const males = students.filter(
          (s) => s.gender?.toLowerCase() === "male"
        ).length;
        const females = students.filter(
          (s) => s.gender?.toLowerCase() === "female"
        ).length;

        setGenderData([
          { name: t("male", "Male"), value: males },
          { name: t("female", "Female"), value: females }
        ]);

        const passed = students.filter((s) => s.passed === true).length;
        const failed = students.filter((s) => s.passed === false).length;

        setPassData([
          { name: t("passed", "Passed"), value: passed },
          { name: t("failed", "Failed"), value: failed }
        ]);
      } catch (err) {
        setError(t("failed_load_charts", "Failed to load chart data"));
        setGenderData([]);
        setPassData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [academicYear, t]);

  const noGenderData = !loading && genderData.every((d) => d.value === 0);
  const noPassData = !loading && passData.every((d) => d.value === 0);

  return (
    <div className="teacher-dashboard-container">
      {/* Sidebar */}
      <aside className="teacher-sidebar">
        <div className="teacher-sidebar-header">
          <div className="teacher-sidebar-icon">
            <i className="bi bi-person-workspace" />
          </div>
          <h3>{t("teacher_portal", "Teacher Portal")}</h3>
        </div>

        <div className="teacher-sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              className={`teacher-nav-link ${
                activeTab === item.key ? "active" : ""
              }`}
              onClick={() => handleSidebarClick(item.key)}
              type="button"
            >
              <i className={`bi ${item.icon}`} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className="teacher-sidebar-footer">
          <button
            className="teacher-nav-link logout-btn"
            type="button"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            <i className="bi bi-box-arrow-left" />
            <span>{t("logout", "Logout")}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="teacher-main-content">
        <div className="teacher-main-inner teacher-charts-container">
          {/* Header */}
          <div className="page-header">
            <div>
              <h2>{t("charts_dashboard", "Charts Dashboard")}</h2>
              <div className="page-subtitle">
                {t(
                  "charts_dashboard_subtitle",
                  "Visualize key student metrics for the selected academic year."
                )}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && <div className="error-state">{error}</div>}

          {/* Controls */}
          <div className="charts-controls">
            <label htmlFor="year-select">
              {t("select_academic_year", "Select academic year")}
            </label>
            <select
              id="year-select"
              className="form-control"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            >
              {allYears.length === 0 && (
                <option value="">{t("loading", "Loading")}</option>
              )}
              {allYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* Charts grid */}
          <div className="charts-grid">
            {/* Students by Gender */}
            <div className="chart-card">
              <h4>{t("students_by_gender", "Students by Gender")}</h4>
              {loading ? (
                <div className="loading-state">
                  {t("loading_charts", "Loading charts")}...
                </div>
              ) : noGenderData ? (
                <div className="loading-state">
                  {t(
                    "no_gender_data",
                    "No gender data available for this year."
                  )}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="52%"
                      outerRadius={90}
                      label={({ value }) => value}
                      labelLine={false}
                    >
                      {genderData.map((entry, idx) => (
                        <Cell
                          key={entry.name}
                          fill={GENDER_COLORS[idx % GENDER_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      formatter={(value) => (
                        <span style={{ color: "#4b5563", fontWeight: 500 }}>
                          {value}
                        </span>
                      )}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pass / Fail */}
            <div className="chart-card">
              <h4>{t("pass_fail_distribution", "Pass/Fail Distribution")}</h4>
              {loading ? (
                <div className="loading-state">
                  {t("loading_charts", "Loading charts")}...
                </div>
              ) : noPassData ? (
                <div className="loading-state">
                  {t(
                    "no_pass_data",
                    "No pass/fail data available for this year."
                  )}
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={passData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="52%"
                      outerRadius={90}
                      label={({ value }) => value}
                      labelLine={false}
                    >
                      {passData.map((entry, idx) => (
                        <Cell
                          key={entry.name}
                          fill={PASS_COLORS[idx % PASS_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      formatter={(value) => (
                        <span style={{ color: "#4b5563", fontWeight: 500 }}>
                          {value}
                        </span>
                      )}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        <ChatWidget />
      </main>
    </div>
  );
}
