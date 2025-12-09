import React from 'react';

export default function ChartContainer({ title, subtitle, children }) {
  return (
    <div className="chart-container">
      <div className="chart-header">
        <div>
          {title && <h4>{title}</h4>}
          {subtitle && <div className="chart-subtitle">{subtitle}</div>}
        </div>
      </div>
      <div className="chart-canvas">{children}</div>
    </div>
  );
}
