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
    <div className="school-context-header-v2">
      <div className="school-info-side">
        <h2 className="school-name-v2">{schoolName}</h2>
        <div className="school-badge-meta">
          <span className="badge-item-v2">
            <i className="bi bi-hash"></i> SEMIS: {semisNo}
          </span>
          <span className="badge-item-v2">
            <i className="bi bi-person-badge"></i> {headmasterName}
          </span>
          <span className="badge-item-v2 stat-highlight">
            <i className="bi bi-people"></i> {totalStudents} Students
          </span>
          <span className="badge-item-v2 stat-highlight">
            <i className="bi bi-person-workspace"></i> {totalTeachers} Teachers
          </span>
        </div>
      </div>

      <div className="school-actions-side">
        <div className="ay-picker">
          <i className="bi bi-calendar3"></i>
          <select className="ay-select-v2">
            <option>AY 2024-25</option>
            <option>AY 2023-24</option>
          </select>
        </div>
        <button className="back-link-btn" onClick={onBack}>
          <i className="bi bi-grid"></i>
          Back to Units
        </button>
        <button className="btn-generate-report" onClick={onGenerateReport}>
          <i className="bi bi-file-earmark-bar-graph"></i>
          Generate Report
        </button>
      </div>
    </div>

  );
}
