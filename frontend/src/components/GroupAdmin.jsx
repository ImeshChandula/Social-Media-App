import React from 'react';

const GroupAdmin = () => {
  const containerStyle = {
    color: '#e0e0e0',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  };

  const headerStyle = {
    borderBottom: '1px solid #3d3d3d',
    paddingBottom: '16px',
    marginBottom: '24px',
  };

  const statCardStyle = {
    backgroundColor: '#1e1e1e',
    padding: '16px',
    borderRadius: '8px',
    flex: '1',
    minWidth: '200px',
  };

  const boxStyle = {
    backgroundColor: '#1e1e1e',
    padding: '16px',
    borderRadius: '8px',
    flex: '1',
    minWidth: '300px',
    border: '1px solid #3d3d3d',
  };

  const approvalItemStyle = {
    marginBottom: '16px',
    padding: '12px',
    backgroundColor: '#2e2e2e',
    borderRadius: '6px',
  };

  const buttonApprove = {
    backgroundColor: '#048904',
    border: 'none',
    color: '#1e1e1e',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const buttonDecline = {
    backgroundColor: '#444343FF',
    border: 'none',
    color: '#ffffff',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
  };

  const moderatorBoxStyle = {
    backgroundColor: '#2e2e2e',
    padding: '16px',
    borderRadius: '8px',
    textAlign: 'center',
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#048904' }}>Group Name</h1>
        <p style={{ fontSize: '14px', color: '#a0a0a0' }}>
          Private Group • 5,732 members • Created Jan 15, 2021 • You're an admin
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {[
          { label: 'Members', value: '5,732' },
          { label: 'New Posts', value: '24',note: 'Today' },
          { label: 'Reports', value: '5', note: 'Needs review' },
        ].map(({ label, value, note }) => (
          <div key={label} style={statCardStyle}>
            <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#048904' }}>{label}</h2>
            <p style={{ fontSize: '20px', fontWeight: '600', margin: '8px 0' }}>{value}</p>
            {note && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '12px', color: '#464344FF' }}>{note}</span>
              </div>
              )}
          </div>
        ))}
      </div>

      {/* Main Content: Approvals and Rules */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Pending Approvals */}
        <div style={boxStyle}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#048904' }}>
            Pending Approvals
          </h2>
          {[
            {
              name: 'John Smith',
              time: '2 hours ago',
              message: "I'm selling my old gaming PC. Specs: i7, 32GB RAM, RTX 3070. DM if interested!",
            },
            {
              name: 'Emma Thompson',
              time: 'Yesterday',
              message: "Hi, I'd love to join this group because I'm passionate about this topic!",
            },
            {
              name: 'Michael Brown',
              time: '1 day ago',
              message: "Check out my new YouTube channel about tech reviews!",
            },
          ].map((user, index) => (
            <div key={index} style={approvalItemStyle}>
              <p style={{ fontWeight: '600' }}>{user.name}</p>
              <p style={{ fontSize: '12px', color: '#a0a0a0' }}>{user.time}</p>
              <p>{user.message}</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button style={buttonApprove}>✔️Approve</button>
                <button style={buttonDecline}>✖️Decline</button>
              </div>
            </div>
          ))}
        </div>

        {/* Group Rules */}
        <div style={boxStyle}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#048904' }}>
            Group Rules & Settings
          </h2>
          <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
            <li style={{ marginBottom: '8px', color: '#a0a0a0' }}>✔ Be respectful and kind to other members</li>
            <li style={{ marginBottom: '8px', color: '#a0a0a0' }}>✔ No spam or self-promotion without approval</li>
            <li style={{ marginBottom: '8px', color: '#a0a0a0' }}>✔ Keep content relevant to the group topic</li>
            <li style={{ marginBottom: '8px', color: '#a0a0a0' }}>✔ No hate speech or discriminatory content</li>
          </ul>
          <button style={{
            backgroundColor: '#048904',
            border: 'none',
            color: '#1e1e1e',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '16px',
          }}>Edit Group Settings</button>
        </div>
      </div>

      {/* Moderator Team */}
      <div style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#048904' }}>Moderator Team</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {['Alex Johnson (Admin)', 'Sarah Williams (Moderator)', 'David Chen (Moderator)', 'Lisa Park (Moderator)'].map((mod, i) => (
            <div key={i} style={moderatorBoxStyle}>
              <p><strong>{mod.split(' ')[0]} {mod.split(' ')[1]}</strong></p>
              <p style={{ fontSize: '12px', color: '#a0a0a0' }}>{mod.includes('Admin') ? 'Admin' : 'Moderator'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupAdmin;
