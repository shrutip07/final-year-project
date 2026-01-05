import React, { useState, useEffect } from 'react';
import { jwtDecode } from "jwt-decode";
import './TopGreetingBar.scss';

export default function TopGreetingBar({ schoolName, semisId, customGreeting }) {
  const [displayName, setDisplayName] = useState("Admin");
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const name = decoded.full_name || decoded.email || decoded.username || "Admin";
        setDisplayName(name.split('@')[0]);
      } catch (e) {
        setDisplayName("Admin");
      }
    }
  }, []);

  return (
    <div className="premium-greeting-banner">
      <div className="banner-content">
        <div className="greeting-text">
          <h1>
            {customGreeting || `Welcome, ${displayName} 👋`} 
            <span className="divider">|</span> 
            <span className="subtitle">MKSSS Dashboard</span>
          </h1>
          {schoolName && (
            <div className="context-info">
              <i className="bi bi-building"></i>
              <span>{schoolName}</span>
              {semisId && <span className="semis-tag">SEMIS: {semisId}</span>}
            </div>
          )}
        </div>
        <div className="banner-visual">
          <div className="blob-decoration"></div>
        </div>
      </div>
    </div>
  );
}

