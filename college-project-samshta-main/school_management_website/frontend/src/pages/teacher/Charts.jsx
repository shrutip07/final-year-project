// src/pages/teacher/Charts.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer
} from "recharts";

// Register ChartJS elements just in case react-chartjs-2 is used elsewhere or imported
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  PointElement,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend as ChartLegend,
} from "chart.js";

import ChatWidget from "../../components/ChatWidget";
import TeacherLayout from "../../components/teacher/TeacherLayout";
import AdminCard from "../../components/admin/AdminCard";
import TabNavigation from "../../components/admin/TabNavigation";
import "../teacher/Dashboard.scss";

// Register ALL elements used in the project to avoid common "point" or "arc" errors
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  ChartTooltip,
  ChartLegend,
  ArcElement
);

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
  const [selectedTab, setSelectedTab] = useState("overview");

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

  const renderGenderChart = (centered = false) => (
    <AdminCard header="Students by Gender" className={centered ? "mx-auto" : ""}>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : noGenderData ? (
        <div className="empty-state-centered py-5">
          <i className="bi bi-pie-chart text-muted mb-2 fs-1"></i>
          <p className="text-muted small">No gender data available for {academicYear}</p>
        </div>
      ) : (
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genderData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                label={({ value }) => value}
              >
                {genderData.map((entry, idx) => (
                  <Cell
                    key={entry.name}
                    fill={GENDER_COLORS[idx % GENDER_COLORS.length]}
                  />
                ))}
              </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <RechartsLegend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </AdminCard>
  );

  const renderPassFailChart = (centered = false) => (
    <AdminCard header="Pass / Fail Distribution" className={centered ? "mx-auto" : ""}>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      ) : noPassData ? (
        <div className="empty-state-centered py-5">
          <i className="bi bi-bar-chart text-muted mb-2 fs-1"></i>
          <p className="text-muted small">No performance data available for {academicYear}</p>
        </div>
      ) : (
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={passData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                label={({ value }) => value}
              >
                {passData.map((entry, idx) => (
                  <Cell
                    key={entry.name}
                    fill={PASS_COLORS[idx % PASS_COLORS.length]}
                  />
                ))}
              </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <RechartsLegend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </AdminCard>
  );

  const renderContent = () => {
    return (
      <div className="teacher-main-inner">
        <div className="section-header-pro">
          <h3>Academic Charts</h3>
          <p>Visual representation of student demographics and performance metrics</p>
        </div>

        <AdminCard className="compact-filter-card mb-4" header={
          <div className="d-flex align-items-center justify-content-between w-100">
            <h5 className="mb-0 fw-bold">Filter Data</h5>
            <div className="d-flex align-items-center gap-3">
              <span className="text-muted small fw-bold text-uppercase">Academic Year:</span>
              <select
                className="form-select form-select-sm"
                style={{ width: '160px', fontWeight: '500' }}
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
          </div>
        }/>

        <TabNavigation
          tabs={[
            { id: "overview", label: "Overview", icon: "bi-grid-fill" },
            { id: "gender", label: "Gender Distribution", icon: "bi-gender-ambiguous" },
            { id: "passfail", label: "Pass / Fail Analysis", icon: "bi-check-circle-fill" },
          ]}
          activeTab={selectedTab}
          onTabChange={setSelectedTab}
        />

        <div className="mt-4">
          {error && (
            <div className="alert alert-custom-danger mb-4" role="alert">
              <i className="bi bi-exclamation-octagon me-2"></i>
              {error}
            </div>
          )}

          {selectedTab === "overview" && (
            <div className="row g-4">
              <div className="col-md-6">
                {renderGenderChart()}
              </div>
              <div className="col-md-6">
                {renderPassFailChart()}
              </div>
            </div>
          )}

          {selectedTab === "gender" && (
            <div className="row">
              <div className="col-md-8 mx-auto">
                {renderGenderChart(true)}
              </div>
            </div>
          )}

          {selectedTab === "passfail" && (
            <div className="row">
              <div className="col-md-8 mx-auto">
                {renderPassFailChart(true)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <TeacherLayout activeSidebarTab="charts" customGreeting="Welcome, Teacher 👋">
      <div className="dashboard-wrapper">
        {renderContent()}
      </div>
      <ChatWidget />
    </TeacherLayout>
  );
}
