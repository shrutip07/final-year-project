import React from 'react';

export default function EmptyState({ icon, title, description }) {
  return (
    <div className="table-empty">
      {icon && <div className="empty-icon">{icon}</div>}
      {title && <h4>{title}</h4>}
      {description && <p>{description}</p>}
    </div>
  );
}
