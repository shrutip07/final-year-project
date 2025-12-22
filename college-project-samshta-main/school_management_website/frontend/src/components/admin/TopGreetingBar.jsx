import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { jwtDecode } from "jwt-decode";
import './TopGreetingBar.scss';

export default function TopGreetingBar({ role, schoolName, semisId }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [displayName, setDisplayName] = useState("User");
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Try to get name from decoded token, fallback to email or 'User'
        const name = decoded.full_name || decoded.email || decoded.username || "User";
        setDisplayName(name.split('@')[0]); // Clean up email if that's what we have
      } catch (e) {
        setDisplayName("User");
      }
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'mr' : 'en';
    i18n.changeLanguage(nextLang);
    localStorage.setItem("appLanguage", nextLang);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="top-greeting-bar">
      <div className="greeting-left">
        <div className="welcome-text">
          <span className="welcome-label">Welcome,</span>
          <span className="user-name">{displayName}</span>
        </div>
      </div>
      <div className="greeting-right">
        <button className="lang-btn" onClick={toggleLanguage}>
          {i18n.language === 'en' ? 'मराठी' : 'English'}
        </button>
        <button className="notif-btn">
          <i className="bi bi-bell"></i>
        </button>
        <div className="user-profile-wrapper">
          <div className="user-profile" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="avatar">{displayName.charAt(0).toUpperCase()}</div>
            <span className="profile-name">{displayName}</span>
            <i className={`bi bi-chevron-${showDropdown ? 'up' : 'down'}`}></i>
          </div>
          
          {showDropdown && (
            <div className="profile-dropdown">
              <button 
                className="dropdown-item" 
                onClick={() => {
                  setShowDropdown(false);
                  navigate(`/${role || 'admin'}/profile`);
                }}
              >
                <i className="bi bi-person"></i> Profile
              </button>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout-item" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right"></i> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

