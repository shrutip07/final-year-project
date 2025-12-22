import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './TopGreetingBar.scss';

export default function TopGreetingBar({ role, schoolName, semisId }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const userName = localStorage.getItem("full_name") || "Admin User";
  const userEmail = localStorage.getItem("email") || "admin@mksss.org";

  const toggleLanguage = () => {
    const nextLang = (i18n.language && i18n.language.startsWith('mr')) ? 'en' : 'mr';
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
          <span className="user-name">{userName}</span>
        </div>
      </div>
      <div className="greeting-right">
        <button 
          className={`lang-btn ${i18n.language === 'mr' ? 'active' : ''}`} 
          onClick={toggleLanguage}
          title="Switch Language"
        >
          {i18n.language && i18n.language.startsWith('mr') ? 'English' : 'मराठी'}
        </button>
        <button className="notif-btn">
          <i className="bi bi-bell"></i>
          <span className="badge-dot"></span>
        </button>
        
        <div className="user-profile-wrapper">
          <div className="user-profile" onClick={() => setShowDropdown(!showDropdown)}>
            <div className="avatar-circle">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="profile-info-mini">
              <span className="profile-name">{userName}</span>
              <i className={`bi bi-chevron-${showDropdown ? 'up' : 'down'} ms-2`}></i>
            </div>
          </div>
          
          {showDropdown && (
            <div className="profile-dropdown-google">
              <div className="dropdown-header-google">
                <div className="avatar-large">{userName.charAt(0).toUpperCase()}</div>
                <div className="user-detail-google">
                  <div className="user-fullname">{userName}</div>
                  <div className="user-email-google">{userEmail}</div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-body-google">
                <button 
                  className="dropdown-item-google" 
                  onClick={() => {
                    setShowDropdown(false);
                    navigate(`/${role || 'admin'}/profile`);
                  }}
                >
                  <i className="bi bi-person-circle"></i>
                  <span>Manage Profile</span>
                </button>
                <button 
                  className="dropdown-item-google logout-btn-google" 
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
