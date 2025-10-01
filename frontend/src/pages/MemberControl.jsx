import React, { useState } from 'react';
import TabNavigation from '../components/TabNavigation';
import ContentRenderer from '../components/ContentRender';
import '../styles/MemberControl.css';
import useThemeStore from '../store/themeStore';

const MemberControl = () => {
  const [activeTab, setActiveTab] = useState('suggestions');
  const { isDarkMode } = useThemeStore();

  return (
    <div className="py-5 py-md-0 mt-5 mt-md-0">
      <div className="mt-1">
        <div className={`member-control-container ${isDarkMode ? '' : 'member-control-container-light'}`}>
          <div className="member-control-header">
            <h2 className={`member-control-title ${isDarkMode ? "" : "text-dark"}`}>Friends</h2>
            <TabNavigation
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>
          <ContentRenderer activeTab={activeTab} />
        </div>
      </div>
    </div>
  )
}

export default MemberControl