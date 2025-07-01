import React from 'react';
import { Lock, UserX, Eye } from 'lucide-react';
import '../styles/UserInPrivateStatus.css';

const UserInPrivateStatus = () => {
  return (
    <div className="pri-container">
      <div className="pri-card">
        <div className="pri-icon-wrapper">
          <div className="pri-icon-bg">
            <Lock className="pri-lock-icon" size={48} />
          </div>
          <div className="pri-floating-icons">
            <UserX className="pri-float-icon pri-float-1" size={20} />
            <Eye className="pri-float-icon pri-float-2" size={18} />
          </div>
        </div>
        
        <div className="pri-content">
          <h3 className="pri-title">This Account is Private</h3>
          <p className="pri-description">
            Follow this account to see their photos and posts in your feed.
          </p>
          <div className="pri-features">
            <div className="pri-feature-item">
              <div className="pri-feature-dot"></div>
              <span>Only friends can see content</span>
            </div>
            <div className="pri-feature-item">
              <div className="pri-feature-dot"></div>
              <span>Protected posts and stories</span>
            </div>
            <div className="pri-feature-item">
              <div className="pri-feature-dot"></div>
              <span>Send friend request to connect</span>
            </div>
          </div>
        </div>
        
        <div className="pri-action-hint">
          <div className="pri-pulse-dot"></div>
          <span>Use the add friend button above to request access</span>
        </div>
      </div>
    </div>
  );
};

export default UserInPrivateStatus;