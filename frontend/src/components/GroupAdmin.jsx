import React from 'react';

const GroupAdmin = () => {
  return (
    <div style={{
      backgroundColor: '#121212',
      color: '#e0e0e0',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{
        borderBottom: '1px solid #3d3d3d',
        paddingBottom: '16px',
        marginBottom: '24px',
      }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#048904FF' }}>Group Name</h1>
        <p style={{ fontSize: '14px', color: '#a0a0a0' }}>
          Private Group • 5,732 members • Created Jan 15, 2021 • You're an admin
        </p>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {[
          { label: 'Members', value: '5,732' },
          { label: 'New Posts', value: '24' },
          { label: 'Reports', value: '5', note: 'Needs review' },
        ].map(({ label, value, note }) => (
          <div key={label} style={{
            backgroundColor: '#1e1e1e',
            padding: '16px',
            borderRadius: '8px',
            flex: '1',
            minWidth: '200px',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '500', color: '#048904FF' }}>{label}</h2>
            <p style={{ fontSize: '20px', fontWeight: '600', margin: '8px 0' }}>{value}</p>
            {note && <span style={{ fontSize: '12px', color: '#e41e3f' }}>{note}</span>}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Pending Approvals */}
        <div style={{
          backgroundColor: '#1e1e1e',
          padding: '16px',
          borderRadius: '8px',
          flex: '1',
          minWidth: '300px',
          border: '1px solid #3d3d3d',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#048904FF' }}>
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
          ].map((user, index) => (
            <div key={index} style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#2e2e2e',
              borderRadius: '6px',
            }}>
              <p style={{ fontWeight: '600' }}>{user.name}</p>
              <p style={{ fontSize: '12px', color: '#a0a0a0' }}>{user.time}</p>
              <p>{user.message}</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button style={{
                  backgroundColor: '#048904FF',
                  border: 'none',
                  color: '#1e1e1e',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}>Approve</button>
                <button style={{
                  backgroundColor: '#e41e3f',
                  border: 'none',
                  color: '#ffffff',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}>Decline</button>
              </div>
            </div>
          ))}
        </div>

        {/* Group Rules */}
        <div style={{
          backgroundColor: '#1e1e1e',
          padding: '16px',
          borderRadius: '8px',
          flex: '1',
          minWidth: '300px',
          border: '1px solid #3d3d3d',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#048904FF' }}>
            Group Rules & Settings
          </h2>
          <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
            <li style={{ marginBottom: '8px', color: '#a0a0a0' }}>✔ Be respectful and kind to other members</li>
            <li style={{ marginBottom: '8px', color: '#a0a0a0' }}>✔ No spam or self-promotion without approval</li>
            <li style={{ marginBottom: '8px', color: '#a0a0a0' }}>✔ Keep content relevant to the group topic</li>
            <li style={{ marginBottom: '8px', color: '#a0a0a0' }}>✔ No hate speech or discriminatory content</li>
          </ul>
          <button style={{
            backgroundColor: '#048904FF',
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
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#048904FF' }}>Moderator Team</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {['Alex Johnson (Admin)', 'Sarah Williams (Moderator)', 'David Chen (Moderator)', 'Lisa Park (Moderator)'].map((mod, i) => (
            <div key={i} style={{
              backgroundColor: '#2e2e2e',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
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
