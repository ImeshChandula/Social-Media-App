import React, { useState } from 'react';
import '../styles/MailHead.css';

const MailHead = ({ totalMails = 0, unreadCount = 0, onRefresh, onSearch, onFilter,currentFilter = 'all'}) => {

    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        if (onSearch) {
            onSearch(e.target.value);
        }
    };

    const handleFilterChange = (filter) => {
        if (onFilter) {
            onFilter(filter);
        }
        setShowFilters(false);
    };

    const filters = [
        { key: 'all', label: 'All Mails', icon: '📧' },
        { key: 'unread', label: 'Unread', icon: '🔴' },
        { key: 'support', label: 'Support', icon: '🛠️' },
        { key: 'feedback', label: 'Feedback', icon: '💬' },
        { key: 'general', label: 'General', icon: '📝' }
    ];

    const getFilterLabel = () => {
        const filter = filters.find(f => f.key === currentFilter);
        return filter ? filter.label : 'All Mails';
    };


  return (
    <div className="mail-header">
      <div className="mail-header-container">
        {/* Header Title and Stats */}
        <div className="mail-header-top">
          <div className="mail-title-section">
            <h1 className="mail-title">
              <span className="mail-icon">📬</span>
              Mail Center
            </h1>
            <div className="mail-stats">
              <div className="stat-item">
                <span className="stat-number">{totalMails}</span>
                <span className="stat-label">Total</span>
              </div>
              {unreadCount > 0 && (
                <div className="stat-item unread">
                  <span className="stat-number">{unreadCount}</span>
                  <span className="stat-label">Unread</span>
                </div>
              )}
            </div>
          </div>

          <div className="mail-actions">
            <button 
              className="action-btn refresh-btn"
              onClick={onRefresh}
              title="Refresh mails"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
            </button>

            <div className="message-search-container">
              <div className={`message-search-input-wrapper ${isSearchActive ? 'active' : ''}`}>
                <svg className="message-search-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search mails..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchActive(true)}
                  onBlur={() => setIsSearchActive(false)}
                  className="search-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mail-header-bottom">
          <div className="filter-section">
            <button 
              className="filter-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
              </svg>
              <span>Filter: {getFilterLabel()}</span>
              <svg className={`chevron ${showFilters ? 'open' : ''}`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
              </svg>
            </button>

            {showFilters && (
              <div className="filter-dropdown">
                {filters.map((filter) => (
                  <button
                    key={filter.key}
                    className={`filter-option ${currentFilter === filter.key ? 'active' : ''}`}
                    onClick={() => handleFilterChange(filter.key)}
                  >
                    <span className="filter-icon">{filter.icon}</span>
                    <span className="filter-label">{filter.label}</span>
                    {currentFilter === filter.key && (
                      <svg className="check-icon" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="view-options">
            <div className="sort-section">
              <span className="sort-label">Sort by:</span>
              <select className="sort-select">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="subject">Subject A-Z</option>
                <option value="sender">Sender A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar for Loading */}
      <div className="progress-bar">
        <div className="progress-fill"></div>
      </div>
    </div>
  )
}

export default MailHead