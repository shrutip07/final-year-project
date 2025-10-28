import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Dashboard.scss"; // We'll create this file next

export default function AdminDashboard() {
  const [sidebarTab, setSidebarTab] = useState("dashboard");
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const sidebarItems = [
    { key: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { key: "tables", label: "Tables", icon: "bi-table" },
    { key: "charts", label: "Charts", icon: "bi-bar-chart-fill" },
    { key: "budgets", label: "Budgets", icon: "bi-wallet2" }
  ];

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/admin/units", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnits(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching units:", err);
        setError(err.response?.data?.message || "Failed to load units");
        setLoading(false);
      }
    };

    fetchUnits();
  }, []);

  const renderContent = () => {
    switch (sidebarTab) {
      case "dashboard":
        return (
          <div className="dashboard-content">
            <div className="page-header">
              <h2>School Overview</h2>
              <p className="text-muted">Manage and monitor all schools</p>
            </div>

            <div className="stats-cards mb-4">
              <div className="row g-3">
                <div className="col-md-3">
                  <div className="stat-card primary">
                    <div className="stat-card__icon">
                      <i className="bi bi-buildings"></i>
                    </div>
                    <div className="stat-card__content">
                      <h5>Total Schools</h5>
                      <h2>{units.length}</h2>
                    </div>
                  </div>
                </div>
                {/* Add more stat cards as needed */}
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Schools Directory</h5>
                <small className="text-muted">Scroll horizontally to view all details</small>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Unit ID</th>
                        <th>SEMIS No</th>
                        <th>DCF No</th>
                        <th>NMMS No</th>
                        <th>Scholarship Code</th>
                        <th>First Grant Year</th>
                        <th>Management Type</th>
                        <th>School Jurisdiction</th>
                        <th>Competent Authority</th>
                        <th>Authority Number</th>
                        <th>Authority Zone</th>
                        <th>Kendrashala Name</th>
                        <th>Info Authority</th>
                        <th>Appellate Authority</th>
                        <th>Midday Meal Org</th>
                        <th>Midday Meal Contact</th>
                        <th>Standard Range</th>
                        <th>Headmistress Name</th>
                        <th>Headmistress Phone</th>
                        <th>Headmistress Email</th>
                        <th>School Shift</th>
                      </tr>
                    </thead>
                    <tbody>
                      {units.map(unit => (
                        <tr key={unit.unit_id}>
                          <td>{unit.unit_id}</td>
                          <td>{unit.semis_no}</td>
                          <td>{unit.dcf_no}</td>
                          <td>{unit.nmms_no}</td>
                          <td>{unit.scholarship_code}</td>
                          <td>{unit.first_grant_in_aid_year}</td>
                          <td>{unit.type_of_management}</td>
                          <td>{unit.school_jurisdiction}</td>
                          <td>{unit.competent_authority_name}</td>
                          <td>{unit.authority_number}</td>
                          <td>{unit.authority_zone}</td>
                          <td>{unit.kendrashala_name}</td>
                          <td>{unit.info_authority_name}</td>
                          <td>{unit.appellate_authority_name}</td>
                          <td>{unit.midday_meal_org_name}</td>
                          <td>{unit.midday_meal_org_contact}</td>
                          <td>{unit.standard_range}</td>
                          <td>{unit.headmistress_name}</td>
                          <td>{unit.headmistress_phone}</td>
                          <td>{unit.headmistress_email}</td>
                          <td>{unit.school_shift}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      case "tables":
        return navigate("/admin/tables");
      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="app-icon">
            <i className="bi bi-buildings-fill"></i>
          </div>
          <h3>Admin Panel</h3>
        </div>
        
        <nav className="sidebar-nav">
          {sidebarItems.map(item => (
            <button
              key={item.key}
              className={`nav-link ${sidebarTab === item.key ? 'active' : ''}`}
              onClick={() => setSidebarTab(item.key)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="nav-link"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
          >
            <i className="bi bi-box-arrow-left"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger m-4">{error}</div>
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
}
