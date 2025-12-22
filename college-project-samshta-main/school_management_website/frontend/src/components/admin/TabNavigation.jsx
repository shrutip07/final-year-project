import React from 'react';
import './TabNavigation.scss';

export default function TabNavigation({ tabs, activeTab, onTabChange }) {
  return (
    <div className="tab-navigation-bar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon && <i className={`bi ${tab.icon}`}></i>}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
