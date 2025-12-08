
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ClerkProfile from "./Profile";
import StudentFees from "./StudentFees";
import TeacherSalaries from "./TeacherSalaries";
import ChatWidget from "../../components/ChatWidget";
import ClerkAddStudent from "./StudentAdd";
import FireSafety from './FireSafety';
import PhysicalSafety from './PhysicalSafety';

export default function ClerkDashboard() {
  const [tab, setTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingProfile, setCheckingProfile] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkProfile() {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:5000/api/clerk/me", {
          headers: { Authorization: `Bearer ${token}` }
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

  useEffect(() => {
    if (checkingProfile) return;
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/clerk/unit", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboard(await res.json());
      } catch {
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [checkingProfile]);

  const sidebar = [
    { key: "dashboard", label: "Dashboard", icon: "bi-house" },
    { key: "profile", label: "Profile", icon: "bi-person" },
    { key: "fees", label: "Student Fees", icon: "bi-cash" },

    { key: "salaries", label: "Teacher Salaries", icon: "bi-currency-dollar" },
    { key: "addStudent", label: "Add Student", icon: "bi-person-plus" },
    { key: "fire-safety", label: "Fire Safety", icon: "bi-fire" },
    { key: "physical-safety", label: "Physical Safety", icon: "bi-shield" },

    { key: "logout", label: "Logout", icon: "bi-box-arrow-right" },
  ];

  function handleMenu(key) {
    if (key === "logout") {
      localStorage.removeItem("token");
      navigate("/");
    } else {
      setTab(key);
    }
  }

  if (checkingProfile) return <div>Checking profile...</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: "#212b36", color: "#fff", paddingTop: 30 }}>
        <div style={{ paddingLeft: 24, fontWeight: "bold" }}>Clerk Panel</div>
        <nav style={{ marginTop: 25 }}>
          {sidebar.map((item) => (
            <button key={item.key}
              className="nav-link"
              style={{
                background: tab === item.key ? "#2a3b4d" : "transparent",
                color: tab === item.key ? "#0dcaf0" : "#fff",
                border: "none",
                width: "100%",
                padding: 12,
                textAlign: "left",
                cursor: "pointer"
              }}
              onClick={() => handleMenu(item.key)}
            >
              <i className={`bi me-2 ${item.icon}`}></i>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
      {/* Main content */}
      <main style={{ flex: 1, padding: 32 }}>
        {tab === "dashboard" && (
          <div>
            <h2>School Unit Details</h2>
            {dashboard?.unit ? (
              <table className="table">
                <tbody>
                  {/* Dynamically loop through all columns/values */}
                  {Object.entries(dashboard.unit).map(([key, value]) => (
                    <tr key={key}>
                      <th style={{ textTransform: "capitalize" }}>{key.replace(/_/g, " ")}</th>
                      <td>{value !== null ? value : "-"}</td>
                    </tr>
                  ))}
                  <tr>
                    <th>Teacher Count</th>
                    <td>{dashboard.teacherCount}</td>
                  </tr>
                  <tr>
                    <th>Student Count</th>
                    <td>{dashboard.studentCount}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div>No unit info found.</div>
            )}
          </div>
        )}
        {tab === "profile" && <ClerkProfile />}
        {tab === "fees" && <StudentFees />}
        {tab === "salaries" && <TeacherSalaries />}
        {tab === "addStudent" && <ClerkAddStudent />}
        {tab === "fire-safety" && <FireSafety />}  {/* <-- Add this line */}
        {tab === "physical-safety" && <PhysicalSafety />} 
      </main>
      <ChatWidget />
    </div>
  );
}
