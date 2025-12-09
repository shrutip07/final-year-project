import React from 'react';

export default function TableContainer({ title, toolbar, children, emptyMessage }) {
  return (
    <div className="table-container">
      <div className="table-toolbar">
        <div className="table-title">{title && <h4 style={{ margin: 0 }}>{title}</h4>}</div>
        <div className="table-actions">{toolbar}</div>
      </div>

      <div className="table-responsive">{children}</div>

      {/* emptyMessage prop may be used by parent to show EmptyState inside card body */}
    </div>
  );
}
