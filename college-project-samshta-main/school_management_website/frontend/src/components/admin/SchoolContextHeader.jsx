import React from 'react';
import './SchoolContextHeader.scss';

export default function SchoolContextHeader({ 
  schoolName, 
  semisNo, 
  headmasterName, 
  totalStudents, 
  totalTeachers, 
  onBack, 
  onGenerateReport 
}) {
  return (
    <div className="school-context-header">
      <div className="header-top">
        <div className="branding-section">
          <div className="school-branding">
            <h1>{schoolName}</h1>
            <div className="school-meta">
              <span className="meta-item">
                <i className="bi bi-hash"></i> SEMIS No: {semisNo}
              </span>
              <span className="meta-item">
                <i className="bi bi-person-badge"></i> Headmaster: {headmasterName}
              </span>
            </div>
          </div>
        </div>

        <div className="header-actions-row">
           <div className="ay-selector-wrapper">
              <span className="ay-label">Academic Year</span>
              <select className="form-select ay-select-sm">
                 <option>AY 2024-25</option>
                 <option>AY 2023-24</option>
              </select>
           </div>
           <button className="back-btn-new" onClick={onBack}>
             <i className="bi bi-arrow-left"></i> Back to Units
           </button>
           <button className="btn btn-outline-primary btn-sm generate-report-btn-new" onClick={onGenerateReport}>
             <i className="bi bi-file-earmark-pdf"></i> Generate Report
           </button>
        </div>
      </div>
      
      <div className="header-stats">
        <div className="stat-pill">
          <div className="label">TOTAL STUDENTS</div>
          <div className="value">{totalStudents}</div>
        </div>
        <div className="stat-pill">
          <div className="label">TOTAL TEACHERS</div>
          <div className="value">{totalTeachers}</div>
        </div>
      </div>
    </div>
  );
}
