import React from 'react';
import "../styles/SupportHead.css";

const SupportHead = ({status = 'inactive', username = 'User'}) => {
    const getStatusConfig = () => {
        if (status === 'banned') {
          return {
              title: 'Account Suspended',
              subtitle: 'Your account has been temporarily suspended',
              description: 'We\'ve restricted access to your account due to policy violations. Review our community guidelines and submit an appeal if you believe this was a mistake.',
              iconColor: '#e74c3c',
              gradientFrom: '#ff6b6b',
              gradientTo: '#ee5a52'
          };
        }
        
        return {
          title: 'Account Inactive',
          subtitle: 'Your account is currently inactive',
          description: 'Your account has been temporarily deactivated. This could be due to inactivity or security reasons. Contact our support team or, you can reactivate your account.',
          iconColor: '#f39c12',
          gradientFrom: '#ffd32a',
          gradientTo: '#f39c12'
        };
    };

    const config = getStatusConfig();

  return (
    <div 
        className="support-heading"
        style={{
            '--iconColor': config.iconColor,
            '--gradientFrom': config.gradientFrom,
            '--gradientTo': config.gradientTo,
        }}
    >
      <div className="support-heading-content">
        <div className="status-icon-container">
          {status === 'banned' ? (
            <svg className="status-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
            </svg>
          ) : (
            <svg className="status-icon" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          )}
        </div>

        <h1 className="support-title">{config.title}</h1>
        <p className="support-subtitle">
          Hi <span className="username-highlight">{username}</span>, {config.subtitle.toLowerCase()}
        </p>
        <p className="support-description">
          {config.description}
        </p>
      </div>
    </div>
  )
}

export default SupportHead