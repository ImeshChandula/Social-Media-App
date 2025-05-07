import React, { useEffect, useState } from 'react';

const PageAdmin = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const containerStyle = {
    backgroundColor: '#000',
    color: '#fff',
    minHeight: '100vh',
    padding: isMobile ? '1rem' : '2rem',
    fontFamily: 'Arial, sans-serif',
  };

  const cardStyle = {
    backgroundColor: '#1a1a1a',
    padding: isMobile ? '1rem' : '1.5rem',
    borderRadius: '10px',
    marginBottom: '1.5rem',
  };

  const flexContainer = {
    display: isMobile ? 'block' : 'flex',
    gap: '1rem',
    marginBottom: '2rem',
  };

  const flexItem = {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: '1rem',
    borderRadius: '10px',
    marginBottom: isMobile ? '1rem' : '0',
  };

  const buttonStyle = {
    backgroundColor: '#3ddc84',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    width: isMobile ? '100%' : 'auto',
    marginTop: isMobile ? '1rem' : '0',
  };

  const fullWidthButton = {
    ...buttonStyle,
    padding: '0.75rem',
    width: '100%',
  };

  return (
    <div style={containerStyle}>
      {/* Page Header */}
      <div style={cardStyle}>
        <h2 style={{ margin: 0 }}>Page Name</h2>
        <p>@pagename • Business</p>
        <button style={buttonStyle}>View as Visitor</button>
      </div>

      {/* Stats */}
      <div style={flexContainer}>
        <div style={flexItem}>
          <p style={{ color: '#aaa' }}>Page Followers</p>
          <h3 style={{ margin: 0 }}>12,458</h3>
          <span style={{ color: '#3ddc84' }}>+124 this week</span>
        </div>
        <div style={flexItem}>
          <p style={{ color: '#aaa' }}>Post Reach</p>
          <h3 style={{ margin: 0 }}>45,872</h3>
          <span style={{ color: '#f44336' }}>-2% from last week</span>
        </div>
      </div>

      {/* Recent Messages */}
      <div style={cardStyle}>
        <h3>Recent Messages</h3>
        <div style={{ marginBottom: '1rem' }}>
          <strong>John Smith</strong>
          <p>Hello! I'm interested in your services. Can you provide more information?</p>
          <small>2 hours ago</small>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <strong>Emma Wilson</strong>
          <p>Great content! I’ve been following your page for months and love what you share.</p>
          <small>Yesterday</small>
        </div>
        <div>
          <strong>Michael Brown</strong>
          <p>Do you offer discounts for returning customers?</p>
          <small>2 days ago</small>
        </div>
      </div>

      {/* Scheduled Posts */}
      <div style={cardStyle}>
        <h3>Scheduled Posts</h3>
        <div style={{ marginBottom: '1rem' }}>
          <p><strong>Today, 3:00 PM</strong> - New product announcement! Stay tuned for our exciting launch.</p>
        </div>
        <div>
          <p><strong>Tomorrow, 10:00 AM</strong> - Weekend special: 20% off all products with code WEEKEND20</p>
        </div>
        <button style={fullWidthButton}>+ Create New Post</button>
      </div>
    </div>
  );
};

export default PageAdmin;
