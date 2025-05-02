import React from 'react';

const GroupAdmin = () => {
  return (
    <div style={{
      backgroundColor: '#18191a',
      color: '#ffffff',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: '#242526',
        borderRadius: '16px',
        padding: '24px',
        width: '100%',
        maxWidth: '800px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Group Name</h1>
          <p style={{ fontSize: '14px', color: '#b0b3b8', marginTop: '4px' }}>Private Group • 5,732 members • Created Jan 15, 2021 • You're an admin</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
          <div style={{
            backgroundColor: '#3a3b3c',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Members</h2>
            <p style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '8px' }}>5,732</p>
          </div>
          <div style={{
            backgroundColor: '#3a3b3c',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600' }}>New Posts</h2>
            <p style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '8px' }}>24</p>
          </div>
          <div style={{
            backgroundColor: '#3a3b3c',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Reports</h2>
            <p style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '8px' }}>5</p>
            <span style={{ fontSize: '12px', color: '#f7b731' }}>Needs review</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
          <div style={{
            backgroundColor: '#3a3b3c',
            padding: '16px',
            borderRadius: '8px',
            flex: '1',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Pending Approvals</h2>
            <div style={{ marginBottom: '16px' }}>
              <p><strong>John Smith</strong></p>
              <p style={{ fontSize: '12px', color: '#b0b3b8' }}>2 hours ago</p>
              <p>I'm selling my old gaming PC. Specs: i7, 32GB RAM, RTX 3070. DM if interested!</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button style={{
                  backgroundColor: '#2d88ff',
                  border: 'none',
                  color: '#ffffff',
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
            <div style={{ marginBottom: '16px' }}>
              <p><strong>Emma Thompson</strong></p>
              <p style={{ fontSize: '12px', color: '#b0b3b8' }}>Yesterday</p>
              <p>Hi, I'd love to join this group because I'm passionate about this topic!</p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <button style={{
                  backgroundColor: '#2d88ff',
                  border: 'none',
                  color: '#ffffff',
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
          </div>

          <div style={{
            backgroundColor: '#3a3b3c',
            padding: '16px',
            borderRadius: '8px',
            flex: '1',
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Group Rules & Settings</h2>
            <ul style={{ listStyle: 'none', padding: '0', margin: '0' }}>
              <li style={{ marginBottom: '8px' }}>✔ Be respectful and kind to other members</li>
              <li style={{ marginBottom: '8px' }}>✔ No spam or self-promotion without approval</li>
              <li style={{ marginBottom: '8px' }}>✔ Keep content relevant to the group topic</li>
              <li style={{ marginBottom: '8px' }}>✔ No hate speech or discriminatory content</li>
            </ul>
            <button style={{
              backgroundColor: '#2d88ff',
              border: 'none',
              color: '#ffffff',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '16px',
            }}>Edit Group Settings</button>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Moderator Team</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div style={{
              backgroundColor: '#3a3b3c',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <p><strong>Alex Johnson</strong></p>
              <p>Admin</p>
            </div>
            <div style={{
              backgroundColor: '#3a3b3c',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <p><strong>Sarah Williams</strong></p>
              <p>Moderator</p>
            </div>
            <div style={{
              backgroundColor: '#3a3b3c',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <p><strong>David Chen</strong></p>
              <p>Moderator</p>
            </div>
            <div style={{
              backgroundColor: '#3a3b3c',
              padding: '16px',
              borderRadius: '8px',
              textAlign: 'center',
            }}>
              <p><strong>Lisa Park</strong></p>
              <p>Moderator</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupAdmin;
