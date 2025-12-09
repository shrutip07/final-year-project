import React from 'react';

export default function Toolbar({ left, right }) {
  return (
    <div className="toolbar">
      <div className="toolbar-search">{left}</div>
      <div className="toolbar-actions">{right}</div>
    </div>
  );
}
