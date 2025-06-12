import React, { useState } from 'react';
import TabNavigation from '../components/TabNavigation';
import ContentRenderer from '../components/ContentRender';
import '../styles/MemberControl.css';

const MemberControl = () => {
  const [activeTab, setActiveTab] = useState('suggestions');

  return (
    <div className=" py-5 py-md-0 mt-4 mt-md-0">
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
    </div>
  )
}

export default MemberControl