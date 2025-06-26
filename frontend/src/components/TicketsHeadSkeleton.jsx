import React from 'react';
import '../styles/TicketsHeadSkeleton.css';

const TicketsHeadSkeleton = () => {
  return (
    <header className="tk-appeals-header">
      <div className="tk-header-container">
        <div className="tk-header-content">
          <div className="tk-title-section">
            <div className="tk-icon-wrapper">
              <div className="tk-skeleton-icon"></div>
            </div>
            <div className="tk-title-text">
              <div className="tk-skeleton-title"></div>
              <div className="tk-skeleton-subtitle"></div>
            </div>
          </div>
          
          <div className="tk-stats-section">
            <div className="tk-stat-card tk-skeleton-card">
              <div className="tk-skeleton-number"></div>
              <div className="tk-skeleton-label"></div>
            </div>
            <div className="tk-stat-card tk-skeleton-card">
              <div className="tk-skeleton-number"></div>
              <div className="tk-skeleton-label"></div>
            </div>
            <div className="tk-stat-card tk-skeleton-card">
              <div className="tk-skeleton-number"></div>
              <div className="tk-skeleton-label"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TicketsHeadSkeleton;