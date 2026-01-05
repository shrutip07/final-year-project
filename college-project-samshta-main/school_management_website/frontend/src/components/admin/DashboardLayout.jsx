import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from "jwt-decode";
import TopGreetingBar from './TopGreetingBar';
import TabNavigation from './TabNavigation';
import mksssLogo from "../../assets/mksss-logo.png";
import './AdminLayout.scss';

export default function DashboardLayout({ 
  children, 
  schoolName, 
  semisId, 
  activeSidebarTab, 
  onSidebarTabChange,
  sidebarItems,
  portalName,
  portalIcon = "bi-buildings-fill",
  customGreeting
}) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [displayName, setDisplayName] = useState("User");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const name = decoded.full_name || decoded.email || decoded.username || "User";
        setDisplayName(name.split('@')[0]);
      } catch (e) {
        setDisplayName("User");
      }
    }
  }, []);

  const handleNavClick = (item) => {
    if (onSidebarTabChange) {
      onSidebarTabChange(item.key);
    }
    if (item.path) {
      navigate(item.path);
    }
  };

  const handleLangToggle = () => {
    const newLng = i18n.language === "en" ? "mr" : "en";
    i18n.changeLanguage(newLng);
    localStorage.setItem("appLanguage", newLng);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="admin-layout-redesign">
      {/* Premium Top Header */}
        <header className="premium-header">
          <div className="header-left">
            <img src={mksssLogo} alt="MKSSS Logo" className="header-logo" />
            <h1 className="header-org-name">Maharshi Karve Stree Shikshan Samstha (MKSSS)</h1>
          </div>

        <div className="header-right">
          <button className="lang-toggle-btn" onClick={handleLangToggle}>
            <i className="fas fa-globe"></i>
            <span>{i18n.language === "en" ? "मराठी" : "English"}</span>
          </button>

          <div className="header-icons">
            <button className="icon-btn" title="Notifications">
              <i className="bi bi-bell"></i>
              <span className="icon-badge"></span>
            </button>
            
            <div className="profile-section">
              <div className="profile-trigger" onClick={() => setShowDropdown(!showDropdown)}>
                <div className="profile-avatar">{displayName.charAt(0).toUpperCase()}</div>
                <i className={`bi bi-chevron-${showDropdown ? 'up' : 'down'}`}></i>
              </div>

              {showDropdown && (
                <div className="profile-dropdown-menu">
                  <div className="dropdown-user-info">
                    <p className="user-name">{displayName}</p>
                    <p className="user-role">{portalName || "User"}</p>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-link" onClick={() => { setShowDropdown(false); navigate("/admin/profile"); }}>
                    <i className="bi bi-person"></i> Profile
                  </button>
                  <button className="dropdown-link logout" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right"></i> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="layout-container">
        <TopGreetingBar schoolName={schoolName} semisId={semisId} customGreeting={customGreeting} />
        
        {/* Horizontal Navigation Bar (Shown on main dashboard only) */}
        {!schoolName && sidebarItems && (
          <div className="horizontal-feature-nav">
            <div className="nav-container">
              {sidebarItems.map((item) => (
                <button
                  key={item.key}
                  className={`horiz-nav-item ${activeSidebarTab === item.key ? "active" : ""}`}
                  onClick={() => handleNavClick(item)}
                >
                  <i className={`bi ${item.icon}`}></i>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <main className="premium-main-content">
          <div className="content-inner">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
