import React from 'react'

const TabNavigation = ({ activeTab, setActiveTab }) => {
    const tabs = [
        {
            key: 'suggestions',
            label: 'Suggestions',
            icon: '👥'
        },
        {
            key: 'requests',
            label: 'Friend Requests',
            icon: '📨'
        },
        {
            key: 'friends',
            label: 'All Friends',
            icon: '👫'
        }
    ];


  return (
    <div className="tab-container">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
          onClick={() => setActiveTab(tab.key)}
        >
          <span className="tab-icon">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default TabNavigation