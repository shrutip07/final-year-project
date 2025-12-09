import React from 'react';

export default function AdminCard({ header, children, className = '' }) {
  return (
    <div className={`admin-card ${className}`.trim()}>
      {header && (
        <div className="card-header">
          {typeof header === 'string' ? <h4>{header}</h4> : header}
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}
