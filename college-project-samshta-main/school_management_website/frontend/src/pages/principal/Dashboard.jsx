import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Profile from "./Profile";
import Teachers from "./Teachers";
import Students from "./Students"; // Import Students component

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarTab, setSidebarTab] = useState("dashboard");
  const [profileExists, setProfileExists] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/principal/me", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then((res) => {
        if (!res.exists) {
          navigate("/principal/onboarding");
        } else {
          setProfileExists(true);
        }
      })
      .catch(() => {
        navigate("/principal/onboarding");
      });
  }, [navigate]);

  const sidebarItems = [
    { key: "dashboard", label: "Dashboard", icon: "bi-house" },
    { key: "profile", label: "Profile", icon: "bi-person" },
    { key: "teachers", label: "Teachers", icon: "bi-people" },
    { key: "students", label: "Students", icon: "bi-person-lines-fill" }
  ];

  const renderContent = () => {
    switch (sidebarTab) {
      case "profile": 
        return <Profile />;
      case "teachers": 
        return <Teachers />;
      case "students": 
        return <Students />; // Add this case
      case "dashboard":
      default:
        return (
          <div className="dashboard-container">
            <h1>Principal Dashboard</h1>
            <div className="dashboard-cards">
              <div className="card" onClick={() => navigate('/principal/profile')}>
                <h3>Profile</h3>
                <p>View and edit your profile</p>
              </div>
              <div className="card" onClick={() => navigate('/principal/teachers')}>
                <h3>Teachers</h3>
                <p>Manage teachers</p>
              </div>
              <div className="card" onClick={() => navigate('/principal/students')}>
                <h3>Students</h3>
                <p>View all students</p>
              </div>
            </div>
          </div>
        );
    }
  };

  if (profileExists === null) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f7fafd" }}>
      {/* Sidebar and Main Layout unchanged */}
      <div
        style={{
          minWidth: 220,
          background: "#212b36",
          color: "#fff",
          paddingTop: 24,
          borderRight: "1px solid #e3e7ed"
        }}
        className="flex-shrink-0 d-flex flex-column"
      >
        <div className="ps-4 pb-3 fs-4 fw-bold">
          <i className="bi bi-grid-3x3-gap me-2"></i>Principal Panel
        </div>
        <div className="nav flex-column">
          {sidebarItems.map(item => (
            <button
              key={item.key}
              className={`btn btn-link px-4 py-3 text-start w-100 text-${sidebarTab === item.key ? "info" : "light"} fs-6 fw-semibold`}
              style={{
                ...(sidebarTab === item.key && {
                  background: "#2a3b4d",
                  borderLeft: "4px solid #0dcaf0"
                }),
                border: "none",
                borderRadius: 0
              }}
              onClick={() => setSidebarTab(item.key)}
            >
              <i className={`bi me-2 ${item.icon}`}></i>{item.label}
            </button>
          ))}
          <button
            className="btn btn-link px-4 py-3 text-start w-100 text-danger fs-6 fw-semibold mt-3"
            style={{ border: "none", borderRadius: 0 }}
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            <i className="bi bi-box-arrow-right me-2"></i>Logout
          </button>
        </div>
        <div className="mt-auto ps-4 pb-4 text-muted small">
          © {new Date().getFullYear()} School Principal
        </div>
      </div>
      {/* Main Content */}
      <main className="flex-fill" style={{ padding: "2.5rem 2rem" }}>
        {renderContent()}
      </main>
    </div>
  );
}
