import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './TopGreetingBar.scss';

export default function TopGreetingBar({ role, schoolName, semisId }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const userEmail = localStorage.getItem("email") || "User";
  const userName = localStorage.getItem("full_name") || userEmail.split("@")[0];

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'mr' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem("appLanguage", newLang);
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
          <span className="user-name">{userName}</span>
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
            <div className="avatar">{userName.charAt(0).toUpperCase()}</div>
            <span className="profile-name">{userName}</span>
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
