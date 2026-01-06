// src/pages/clerk/ClerkDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import ClerkProfile from "./Profile";
import StudentFees from "./StudentFees";
import TeacherSalaries from "./TeacherSalaries";
import ClerkAddStudent from "./StudentAdd";
import FireSafety from "./FireSafety";
import PhysicalSafety from "./PhysicalSafety";
import Onboarding from "./Onboarding";

import ClerkLayout from "../../components/clerk/ClerkLayout";
import AdminCard from "../../components/admin/AdminCard";
import ChatWidget from "../../components/ChatWidget";

import "./Dashboard.scss";

export default function ClerkDashboard() {
  const [sidebarTab, setSidebarTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const [pendingSalariesCount, setPendingSalariesCount] = useState(0);
  const [safetyStatus, setSafetyStatus] = useState({ fire: "Pending", physical: "Pending" });

  const navigate = useNavigate();

  /* -------------------- PROFILE CHECK -------------------- */
  useEffect(() => {
    async function checkProfile() {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/clerk/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 404) {
          navigate("/clerk/onboarding", { replace: true });
        } else {
          setCheckingProfile(false);
        }
      } catch {
        setCheckingProfile(false);
      }
    }

    checkProfile();
  }, [navigate]);

  /* -------------------- DASHBOARD DATA -------------------- */
  useEffect(() => {
    if (checkingProfile) return;

    async function fetchData() {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Main Dashboard Data
        const dashRes = await fetch("http://localhost:5000/api/clerk/unit", { headers });
        const dashData = await dashRes.json();
        setDashboard(dashData);

        // Pending Salaries Count
        const pendingSalRes = await axios.get("http://localhost:5000/api/clerk/teacher-salary-pending", { headers });
        setPendingSalariesCount(pendingSalRes.data?.length || 0);

        // Physical Safety Check
        const physicalRes = await axios.get("http://localhost:5000/api/clerk/physical-safety", { headers });
        if (physicalRes.data && Object.keys(physicalRes.data).length > 0) {
          setSafetyStatus(prev => ({ ...prev, physical: "Completed" }));
        }

        // Fire Safety Check
        const fireRes = await axios.get("http://localhost:5000/api/clerk/compliance-certificates", { headers });
        if (fireRes.data && fireRes.data.some(c => c.certificate_type?.toLowerCase().includes("fire"))) {
          setSafetyStatus(prev => ({ ...prev, fire: "Completed" }));
        }

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [checkingProfile]);

  /* -------------------- RENDER HELPERS -------------------- */
  function renderDashboardMain() {
    return (
      <div className="clerk-dashboard-main">
        <div className="section-header-pro">
          <h3>Clerk Overview</h3>
          <p>Administrative summary for {dashboard?.unit?.kendrashala_name || "your unit"}</p>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-3">
            <AdminCard className="h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon-circle bg-primary-subtle text-primary">
                  <i className="bi bi-mortarboard-fill fs-4"></i>
                </div>
                <div>
                  <div className="text-muted small fw-bold">TOTAL STUDENTS</div>
                  <div className="fs-3 fw-bold text-navy">{dashboard?.studentCount || 0}</div>
                </div>
              </div>
            </AdminCard>
          </div>
          <div className="col-md-3">
            <AdminCard className="h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon-circle bg-success-subtle text-success">
                  <i className="bi bi-cash-stack fs-4"></i>
                </div>
                <div>
                  <div className="text-muted small fw-bold">CLASS CAPACITY</div>
                  <div className="fs-3 fw-bold text-navy">{dashboard?.totals?.capacity || 0}</div>
                </div>
              </div>
            </AdminCard>
          </div>
          <div className="col-md-3">
            <AdminCard className="h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon-circle bg-warning-subtle text-warning">
                  <i className="bi bi-wallet2 fs-4"></i>
                </div>
                <div>
                  <div className="text-muted small fw-bold">PENDING SALARIES</div>
                  <div className="fs-3 fw-bold text-navy">{pendingSalariesCount}</div>
                </div>
              </div>
            </AdminCard>
          </div>
          <div className="col-md-3">
            <AdminCard className="h-100">
              <div className="d-flex align-items-center gap-3">
                <div className="stat-icon-circle bg-info-subtle text-info">
                  <i className="bi bi-shield-check fs-4"></i>
                </div>
                <div>
                  <div className="text-muted small fw-bold">SAFETY STATUS</div>
                  <div className="small fw-bold text-navy">Fire: {safetyStatus.fire}</div>
                  <div className="small fw-bold text-navy">Physical: {safetyStatus.physical}</div>
                </div>
              </div>
            </AdminCard>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <AdminCard header="Unit Information">
              <div className="table-responsive professional-table">
                <table className="table table-hover align-middle">
                  <tbody>
                    {dashboard?.unit && Object.entries(dashboard.unit)
                      .filter(([key]) => ["unit_id", "kendrashala_name", "semis_no", "school_shift", "standard_range"].includes(key))
                      .map(([key, value]) => (
                      <tr key={key}>
                        <th className="text-muted small text-uppercase" style={{ width: "30%" }}>{key.replace(/_/g, " ")}</th>
                        <td className="fw-bold text-navy">{value || "-"}</td>
                      </tr>
                    ))}
                    <tr>
                      <th className="text-muted small text-uppercase">Teacher Count</th>
                      <td className="fw-bold text-navy">{dashboard?.teacherCount ?? "-"}</td>
                    </tr>
                    <tr>
                      <th className="text-muted small text-uppercase">Student Count</th>
                      <td className="fw-bold text-navy">{dashboard?.studentCount ?? "-"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </AdminCard>
          </div>
          <div className="col-lg-4">
            <AdminCard header="Upcoming Retirements">
              {dashboard?.upcomingRetirements?.length > 0 ? (
                <div className="list-group list-group-flush">
                  {dashboard.upcomingRetirements.map((ret, idx) => (
                    <div key={idx} className="list-group-item d-flex justify-content-between align-items-center px-0">
                      <span className="fw-semibold">Year {ret.year}</span>
                      <span className="badge bg-primary rounded-pill">{ret.count} staff</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted small text-center py-3">No upcoming retirements.</div>
              )}
            </AdminCard>
          </div>
        </div>
      </div>
    );
  }

  function renderContent() {
    switch (sidebarTab) {
      case "dashboard":
        return renderDashboardMain();

      case "profile":
        return <ClerkProfile />;

      case "fees":
        return <StudentFees />;

      case "salaries":
        return <TeacherSalaries />;

      case "addStudent":
        return <ClerkAddStudent />;

      case "fire-safety":
        return <FireSafety />;

      case "physical-safety":
        return <PhysicalSafety />;
        
      case "notifications":
        return <Onboarding />; // Using Onboarding or separate component

      default:
        return null;
    }
  }

  if (checkingProfile) return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="spinner-border text-primary" role="status"></div>
      <span className="ms-2">Checking profile...</span>
    </div>
  );

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div className="spinner-border text-primary" role="status"></div>
      <span className="ms-2">Syncing Dashboard...</span>
    </div>
  );

  return (
    <ClerkLayout
      activeSidebarTab={sidebarTab}
      onSidebarTabChange={setSidebarTab}
      customGreeting="Welcome, Clerk 👋"
    >
      <div className="dashboard-wrapper">
        {renderContent()}
      </div>
      <ChatWidget />
    </ClerkLayout>
  );
}
