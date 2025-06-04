import React, { useState } from 'react';
import TabNavigation from '../components/TabNavigation';
import ContentRenderer from '../components/ContentRender';
import '../styles/MemberControl.css';

const MemberControl = () => {
    const [activeTab, setActiveTab] = useState('suggestions');

  return (
    <div className="member-control-container">
      <div className="member-control-header">
        <h2 className="member-control-title">Friends</h2>
        <TabNavigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />
      </div>
      <ContentRenderer activeTab={activeTab} />
    </div>
  )
}

export default MemberControl