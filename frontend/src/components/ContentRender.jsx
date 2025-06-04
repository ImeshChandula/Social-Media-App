import React from 'react';
import FriendSuggestions from "./FriendSuggestions";
import FriendRequests from "./FriendRequests";
import Friends from "./Friends";

const ContentRenderer = ({ activeTab }) => {
  const renderContent = () => {
    switch(activeTab) {
      case 'suggestions':
        return <FriendSuggestions />;
      case 'requests':
        return <FriendRequests />;
      case 'friends':
        return <Friends />;
      default:
        return <FriendSuggestions />;
    }
  };

  return (
    <div className="member-control-content">
      {renderContent()}
    </div>
  );
};

export default ContentRenderer;