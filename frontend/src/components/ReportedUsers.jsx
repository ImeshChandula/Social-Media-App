import React, { useState, useEffect } from 'react';
import { Flag, User, Calendar, Eye, Check, X, Ban, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { useNavigate } from 'react-router-dom';

const ReportedUsers = () => {
  const [reportedUsers, setReportedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReportedUsers();
  }, []);

  const fetchReportedUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/users/reported-users');
      if (response.data.success) {
        setReportedUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching reported users:', error);
      toast.error('Failed to load reported users');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewReport = async (reportId, status) => {
    try {
      setReviewLoading(true);
      const response = await axiosInstance.patch(`/users/report-review/${reportId}`, {
        status,
        reviewNote: reviewNote.trim()
      });

      if (response.data.success) {
        toast.success(`Report ${status} successfully`);
        setReviewModal(null);
        setReviewNote('');
        fetchReportedUsers(); // Refresh data
      }
    } catch (error) {
      console.error('Error reviewing report:', error);
      toast.error(error.response?.data?.message || 'Failed to review report');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleBanUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to ban ${userName}? This action will set their account status to banned.`)) {
      try {
        const response = await axiosInstance.patch(`/users/updateProfile/${userId}`, {
          accountStatus: 'banned'
        });

        if (response.data.success) {
          toast.success(`User ${userName} has been banned successfully`);
          fetchReportedUsers(); // Refresh data
        }
      } catch (error) {
        console.error('Error banning user:', error);
        toast.error('Failed to ban user');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'accepted': return '#10b981';
      case 'declined': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const styles = {
    container: {
      padding: '24px',
      backgroundColor: '#111',
      minHeight: '100vh'
    },
    header: {
      marginBottom: '32px'
    },
    title: {
      color: '#fff',
      fontSize: '28px',
      fontWeight: '700',
      margin: '0 0 8px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    subtitle: {
      color: '#9ca3af',
      fontSize: '16px',
      margin: 0
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      color: '#fff'
    },
    grid: {
      display: 'grid',
      gap: '24px',
      gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))'
    },
    userCard: {
      backgroundColor: '#1f1f1f',
      border: '1px solid #333',
      borderRadius: '12px',
      padding: '24px',
      position: 'relative'
    },
    userHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '20px'
    },
    avatar: {
      width: '56px',
      height: '56px',
      borderRadius: '50%',
      objectFit: 'cover',
      cursor: 'pointer'
    },
    userInfo: {
      flex: 1
    },
    userName: {
      color: '#fff',
      fontSize: '18px',
      fontWeight: '600',
      margin: '0 0 4px 0',
      cursor: 'pointer'
    },
    userHandle: {
      color: '#9ca3af',
      fontSize: '14px',
      margin: '0 0 4px 0'
    },
    userStatus: {
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '12px',
      fontWeight: '500',
      textTransform: 'capitalize'
    },
    activeStatus: {
      backgroundColor: '#065f46',
      color: '#10b981'
    },
    bannedStatus: {
      backgroundColor: '#7f1d1d',
      color: '#ef4444'
    },
    reportStats: {
      display: 'flex',
      gap: '16px',
      marginBottom: '20px',
      padding: '12px',
      backgroundColor: '#2a2a2a',
      borderRadius: '8px'
    },
    statItem: {
      textAlign: 'center'
    },
    statNumber: {
      color: '#fff',
      fontSize: '20px',
      fontWeight: '700',
      margin: 0
    },
    statLabel: {
      color: '#9ca3af',
      fontSize: '12px',
      margin: 0
    },
    reportsSection: {
      marginBottom: '20px'
    },
    sectionTitle: {
      color: '#fff',
      fontSize: '16px',
      fontWeight: '600',
      marginBottom: '12px'
    },
    reportItem: {
      backgroundColor: '#2a2a2a',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '12px',
      border: '1px solid #333'
    },
    reportHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    },
    reportStatus: {
      padding: '4px 8px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: '500',
      textTransform: 'capitalize'
    },
    reportReason: {
      color: '#e5e7eb',
      fontSize: '14px',
      lineHeight: '1.5',
      marginBottom: '8px'
    },
    reportDate: {
      color: '#9ca3af',
      fontSize: '12px'
    },
    actionButtons: {
      display: 'flex',
      gap: '8px',
      flexWrap: 'wrap'
    },
    button: {
      padding: '8px 16px',
      borderRadius: '6px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.2s'
    },
    viewButton: {
      backgroundColor: '#374151',
      color: '#fff'
    },
    acceptButton: {
      backgroundColor: '#065f46',
      color: '#10b981'
    },
    rejectButton: {
      backgroundColor: '#7f1d1d',
      color: '#ef4444'
    },
    banButton: {
      backgroundColor: '#92400e',
      color: '#f59e0b'
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modalContent: {
      backgroundColor: '#1f1f1f',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      border: '1px solid #333'
    },
    modalTitle: {
      color: '#fff',
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '20px'
    },
    textarea: {
      width: '100%',
      minHeight: '100px',
      padding: '12px',
      backgroundColor: '#2a2a2a',
      border: '1px solid #444',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '14px',
      resize: 'vertical',
      fontFamily: 'inherit',
      marginBottom: '16px'
    },
    modalButtons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end'
    },
    cancelButton: {
      padding: '10px 20px',
      backgroundColor: 'transparent',
      border: '1px solid #444',
      borderRadius: '6px',
      color: '#fff',
      cursor: 'pointer'
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div>Loading reported users...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>
          <Flag size={28} />
          Reported Users
        </h1>
        <p style={styles.subtitle}>
          Review and manage user reports ({reportedUsers.length} users reported)
        </p>
      </div>

      {reportedUsers.length === 0 ? (
        <div style={{...styles.loadingContainer, flexDirection: 'column', gap: '16px'}}>
          <AlertTriangle size={48} color="#6b7280" />
          <p>No reported users found</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {reportedUsers.map((reportedUser) => (
            <div key={reportedUser.user.id} style={styles.userCard}>
              <div style={styles.userHeader}>
                <img
                  src={reportedUser.user.profilePicture || "https://avatar.iran.liara.run/public/1.png"}
                  alt={reportedUser.user.username}
                  style={styles.avatar}
                  onClick={() => navigate(`/profile/${reportedUser.user.id}`)}
                />
                <div style={styles.userInfo}>
                  <h3 
                    style={styles.userName}
                    onClick={() => navigate(`/profile/${reportedUser.user.id}`)}
                  >
                    {reportedUser.user.firstName} {reportedUser.user.lastName}
                  </h3>
                  <p style={styles.userHandle}>@{reportedUser.user.username}</p>
                  <span 
                    style={{
                      ...styles.userStatus,
                      ...(reportedUser.user.accountStatus === 'active' ? styles.activeStatus : styles.bannedStatus)
                    }}
                  >
                    {reportedUser.user.accountStatus}
                  </span>
                </div>
              </div>

              <div style={styles.reportStats}>
                <div style={styles.statItem}>
                  <p style={styles.statNumber}>{reportedUser.totalReports}</p>
                  <p style={styles.statLabel}>Total Reports</p>
                </div>
                <div style={styles.statItem}>
                  <p style={styles.statNumber}>{reportedUser.pendingReports}</p>
                  <p style={styles.statLabel}>Pending</p>
                </div>
                <div style={styles.statItem}>
                  <p style={{...styles.statNumber, fontSize: '14px'}}>
                    {formatDate(reportedUser.lastReportDate).split(',')[0]}
                  </p>
                  <p style={styles.statLabel}>Last Report</p>
                </div>
              </div>

              <div style={styles.reportsSection}>
                <h4 style={styles.sectionTitle}>Recent Reports</h4>
                {reportedUser.reports.slice(0, 2).map((report) => (
                  <div key={report.id} style={styles.reportItem}>
                    <div style={styles.reportHeader}>
                      <span 
                        style={{
                          ...styles.reportStatus,
                          backgroundColor: getStatusColor(report.status) + '20',
                          color: getStatusColor(report.status)
                        }}
                      >
                        {report.status}
                      </span>
                      <span style={styles.reportDate}>
                        {formatDate(report.createdAt)}
                      </span>
                    </div>
                    <p style={styles.reportReason}>
                      {report.reason.length > 100 
                        ? `${report.reason.substring(0, 100)}...` 
                        : report.reason}
                    </p>
                  </div>
                ))}
              </div>

              <div style={styles.actionButtons}>
                <button
                  onClick={() => setSelectedReport(reportedUser)}
                  style={{...styles.button, ...styles.viewButton}}
                >
                  <Eye size={14} />
                  View All Reports
                </button>
                
                {reportedUser.pendingReports > 0 && (
                  <>
                    <button
                      onClick={() => setReviewModal({
                        type: 'accept',
                        reportId: reportedUser.reports.find(r => r.status === 'pending')?.id,
                        userName: `${reportedUser.user.firstName} ${reportedUser.user.lastName}`
                      })}
                      style={{...styles.button, ...styles.acceptButton}}
                    >
                      <Check size={14} />
                      Accept Report
                    </button>
                    <button
                      onClick={() => setReviewModal({
                        type: 'decline',
                        reportId: reportedUser.reports.find(r => r.status === 'pending')?.id,
                        userName: `${reportedUser.user.firstName} ${reportedUser.user.lastName}`
                      })}
                      style={{...styles.button, ...styles.rejectButton}}
                    >
                      <X size={14} />
                      Decline Report
                    </button>
                  </>
                )}

                {reportedUser.reports.some(r => r.status === 'accepted') && reportedUser.user.accountStatus !== 'banned' && (
                  <button
                    onClick={() => handleBanUser(reportedUser.user.id, `${reportedUser.user.firstName} ${reportedUser.user.lastName}`)}
                    style={{...styles.button, ...styles.banButton}}
                  >
                    <Ban size={14} />
                    Ban User
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All Reports Modal */}
      {selectedReport && (
        <div style={styles.modal} onClick={(e) => e.target === e.currentTarget && setSelectedReport(null)}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>
              All Reports for {selectedReport.user.firstName} {selectedReport.user.lastName}
            </h3>
            <div style={{maxHeight: '400px', overflowY: 'auto'}}>
              {selectedReport.reports.map((report) => (
                <div key={report.id} style={{...styles.reportItem, marginBottom: '16px'}}>
                  <div style={styles.reportHeader}>
                    <span 
                      style={{
                        ...styles.reportStatus,
                        backgroundColor: getStatusColor(report.status) + '20',
                        color: getStatusColor(report.status)
                      }}
                    >
                      {report.status}
                    </span>
                    <span style={styles.reportDate}>
                      {formatDate(report.createdAt)}
                    </span>
                  </div>
                  <p style={styles.reportReason}>{report.reason}</p>
                  {report.reviewNote && (
                    <div style={{marginTop: '8px', padding: '8px', backgroundColor: '#333', borderRadius: '4px'}}>
                      <p style={{color: '#9ca3af', fontSize: '12px', margin: '0 0 4px 0'}}>Admin Review:</p>
                      <p style={{color: '#e5e7eb', fontSize: '13px', margin: 0}}>{report.reviewNote}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={styles.modalButtons}>
              <button
                onClick={() => setSelectedReport(null)}
                style={styles.cancelButton}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div style={styles.modal} onClick={(e) => e.target === e.currentTarget && setReviewModal(null)}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>
              {reviewModal.type === 'accept' ? 'Accept' : 'Decline'} Report for {reviewModal.userName}
            </h3>
            <textarea
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder={`Add a note explaining why you're ${reviewModal.type}ing this report...`}
              style={styles.textarea}
            />
            <div style={styles.modalButtons}>
              <button
                onClick={() => {setReviewModal(null); setReviewNote('');}}
                style={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReviewReport(reviewModal.reportId, reviewModal.type === 'accept' ? 'accepted' : 'declined')}
                disabled={reviewLoading}
                style={{
                  ...styles.button,
                  ...(reviewModal.type === 'accept' ? styles.acceptButton : styles.rejectButton)
                }}
              >
                {reviewLoading ? 'Processing...' : (reviewModal.type === 'accept' ? 'Accept Report' : 'Decline Report')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportedUsers;

// responsive--------------------------------------------------------------------------------------------
// import React, { useState, useEffect } from 'react';
// import { Flag, User, Calendar, Eye, Check, X, Ban, AlertTriangle } from 'lucide-react';
// import toast from 'react-hot-toast';
// import { axiosInstance } from '../lib/axios';
// import { useNavigate } from 'react-router-dom';

// const ReportedUsers = () => {
//   const [reportedUsers, setReportedUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedReport, setSelectedReport] = useState(null);
//   const [reviewModal, setReviewModal] = useState(null);
//   const [reviewNote, setReviewNote] = useState('');
//   const [reviewLoading, setReviewLoading] = useState(false);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchReportedUsers();
//   }, []);

//   const fetchReportedUsers = async () => {
//     try {
//       setLoading(true);
//       const response = await axiosInstance.get('/users/reported-users');
//       if (response.data.success) {
//         setReportedUsers(response.data.data);
//       }
//     } catch (error) {
//       console.error('Error fetching reported users:', error);
//       toast.error('Failed to load reported users');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleReviewReport = async (reportId, status) => {
//     try {
//       setReviewLoading(true);
//       const response = await axiosInstance.patch(`/users/report-review/${reportId}`, {
//         status,
//         reviewNote: reviewNote.trim()
//       });

//       if (response.data.success) {
//         toast.success(`Report ${status} successfully`);
//         setReviewModal(null);
//         setReviewNote('');
//         fetchReportedUsers(); // Refresh data
//       }
//     } catch (error) {
//       console.error('Error reviewing report:', error);
//       toast.error(error.response?.data?.message || 'Failed to review report');
//     } finally {
//       setReviewLoading(false);
//     }
//   };

//   const handleBanUser = async (userId, userName) => {
//     if (window.confirm(`Are you sure you want to ban ${userName}? This action will set their account status to banned.`)) {
//       try {
//         const response = await axiosInstance.patch(`/users/updateProfile/${userId}`, {
//           accountStatus: 'banned'
//         });

//         if (response.data.success) {
//           toast.success(`User ${userName} has been banned successfully`);
//           fetchReportedUsers(); // Refresh data
//         }
//       } catch (error) {
//         console.error('Error banning user:', error);
//         toast.error('Failed to ban user');
//       }
//     }
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'pending': return '#f59e0b';
//       case 'accepted': return '#10b981';
//       case 'declined': return '#ef4444';
//       default: return '#6b7280';
//     }
//   };

//   const styles = {
//     container: {
//       padding: '16px',
//       backgroundColor: '#111',
//       minHeight: '100vh',
//       '@media (min-width: 768px)': {
//         padding: '24px'
//       }
//     },
//     header: {
//       marginBottom: '24px',
//       '@media (min-width: 768px)': {
//         marginBottom: '32px'
//       }
//     },
//     title: {
//       color: '#fff',
//       fontSize: '20px',
//       fontWeight: '700',
//       margin: '0 0 8px 0',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '8px',
//       '@media (min-width: 768px)': {
//         fontSize: '28px',
//         gap: '12px'
//       }
//     },
//     subtitle: {
//       color: '#9ca3af',
//       fontSize: '14px',
//       margin: 0,
//       '@media (min-width: 768px)': {
//         fontSize: '16px'
//       }
//     },
//     loadingContainer: {
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       minHeight: '200px',
//       color: '#fff'
//     },
//     grid: {
//       display: 'grid',
//       gap: '16px',
//       gridTemplateColumns: '1fr',
//       '@media (min-width: 640px)': {
//         gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
//         gap: '20px'
//       },
//       '@media (min-width: 1024px)': {
//         gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
//         gap: '24px'
//       }
//     },
//     userCard: {
//       backgroundColor: '#1f1f1f',
//       border: '1px solid #333',
//       borderRadius: '12px',
//       padding: '16px',
//       position: 'relative',
//       '@media (min-width: 768px)': {
//         padding: '20px'
//       },
//       '@media (min-width: 1024px)': {
//         padding: '24px'
//       }
//     },
//     userHeader: {
//       display: 'flex',
//       alignItems: 'center',
//       gap: '12px',
//       marginBottom: '16px',
//       '@media (min-width: 768px)': {
//         gap: '16px',
//         marginBottom: '20px'
//       }
//     },
//     avatar: {
//       width: '48px',
//       height: '48px',
//       borderRadius: '50%',
//       objectFit: 'cover',
//       cursor: 'pointer',
//       '@media (min-width: 768px)': {
//         width: '56px',
//         height: '56px'
//       }
//     },
//     userInfo: {
//       flex: 1,
//       minWidth: 0 // Allows text truncation
//     },
//     userName: {
//       color: '#fff',
//       fontSize: '16px',
//       fontWeight: '600',
//       margin: '0 0 4px 0',
//       cursor: 'pointer',
//       overflow: 'hidden',
//       textOverflow: 'ellipsis',
//       whiteSpace: 'nowrap',
//       '@media (min-width: 768px)': {
//         fontSize: '18px'
//       }
//     },
//     userHandle: {
//       color: '#9ca3af',
//       fontSize: '13px',
//       margin: '0 0 4px 0',
//       overflow: 'hidden',
//       textOverflow: 'ellipsis',
//       whiteSpace: 'nowrap',
//       '@media (min-width: 768px)': {
//         fontSize: '14px'
//       }
//     },
//     userStatus: {
//       fontSize: '11px',
//       padding: '3px 6px',
//       borderRadius: '12px',
//       fontWeight: '500',
//       textTransform: 'capitalize',
//       '@media (min-width: 768px)': {
//         fontSize: '12px',
//         padding: '4px 8px'
//       }
//     },
//     activeStatus: {
//       backgroundColor: '#065f46',
//       color: '#10b981'
//     },
//     bannedStatus: {
//       backgroundColor: '#7f1d1d',
//       color: '#ef4444'
//     },
//     reportStats: {
//       display: 'flex',
//       gap: '12px',
//       marginBottom: '16px',
//       padding: '12px',
//       backgroundColor: '#2a2a2a',
//       borderRadius: '8px',
//       '@media (min-width: 768px)': {
//         gap: '16px',
//         marginBottom: '20px'
//       }
//     },
//     statItem: {
//       textAlign: 'center',
//       flex: 1
//     },
//     statNumber: {
//       color: '#fff',
//       fontSize: '16px',
//       fontWeight: '700',
//       margin: 0,
//       '@media (min-width: 768px)': {
//         fontSize: '20px'
//       }
//     },
//     statLabel: {
//       color: '#9ca3af',
//       fontSize: '10px',
//       margin: 0,
//       '@media (min-width: 768px)': {
//         fontSize: '12px'
//       }
//     },
//     reportsSection: {
//       marginBottom: '16px',
//       '@media (min-width: 768px)': {
//         marginBottom: '20px'
//       }
//     },
//     sectionTitle: {
//       color: '#fff',
//       fontSize: '14px',
//       fontWeight: '600',
//       marginBottom: '12px',
//       '@media (min-width: 768px)': {
//         fontSize: '16px'
//       }
//     },
//     reportItem: {
//       backgroundColor: '#2a2a2a',
//       padding: '12px',
//       borderRadius: '8px',
//       marginBottom: '8px',
//       border: '1px solid #333',
//       '@media (min-width: 768px)': {
//         padding: '16px',
//         marginBottom: '12px'
//       }
//     },
//     reportHeader: {
//       display: 'flex',
//       justifyContent: 'space-between',
//       alignItems: 'center',
//       marginBottom: '6px',
//       flexWrap: 'wrap',
//       gap: '4px',
//       '@media (min-width: 768px)': {
//         marginBottom: '8px',
//         flexWrap: 'nowrap'
//       }
//     },
//     reportStatus: {
//       padding: '3px 6px',
//       borderRadius: '12px',
//       fontSize: '11px',
//       fontWeight: '500',
//       textTransform: 'capitalize',
//       '@media (min-width: 768px)': {
//         padding: '4px 8px',
//         fontSize: '12px'
//       }
//     },
//     reportReason: {
//       color: '#e5e7eb',
//       fontSize: '13px',
//       lineHeight: '1.4',
//       marginBottom: '6px',
//       wordBreak: 'break-word',
//       '@media (min-width: 768px)': {
//         fontSize: '14px',
//         lineHeight: '1.5',
//         marginBottom: '8px'
//       }
//     },
//     reportDate: {
//       color: '#9ca3af',
//       fontSize: '11px',
//       '@media (min-width: 768px)': {
//         fontSize: '12px'
//       }
//     },
//     actionButtons: {
//       display: 'flex',
//       gap: '6px',
//       flexWrap: 'wrap',
//       '@media (min-width: 768px)': {
//         gap: '8px'
//       }
//     },
//     button: {
//       padding: '6px 12px',
//       borderRadius: '6px',
//       border: 'none',
//       fontSize: '12px',
//       fontWeight: '500',
//       cursor: 'pointer',
//       display: 'flex',
//       alignItems: 'center',
//       gap: '4px',
//       transition: 'all 0.2s',
//       minHeight: '36px',
//       '@media (min-width: 768px)': {
//         padding: '8px 16px',
//         fontSize: '14px',
//         gap: '6px'
//       }
//     },
//     viewButton: {
//       backgroundColor: '#374151',
//       color: '#fff',
//       flex: '1 0 auto',
//       '@media (min-width: 640px)': {
//         flex: '0 0 auto'
//       }
//     },
//     acceptButton: {
//       backgroundColor: '#065f46',
//       color: '#10b981',
//       flex: '1 0 auto',
//       '@media (min-width: 640px)': {
//         flex: '0 0 auto'
//       }
//     },
//     rejectButton: {
//       backgroundColor: '#7f1d1d',
//       color: '#ef4444',
//       flex: '1 0 auto',
//       '@media (min-width: 640px)': {
//         flex: '0 0 auto'
//       }
//     },
//     banButton: {
//       backgroundColor: '#92400e',
//       color: '#f59e0b',
//       flex: '1 0 auto',
//       '@media (min-width: 640px)': {
//         flex: '0 0 auto'
//       }
//     },
//     modal: {
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: 'rgba(0, 0, 0, 0.8)',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       zIndex: 1000,
//       padding: '16px',
//       '@media (min-width: 768px)': {
//         padding: '20px'
//       }
//     },
//     modalContent: {
//       backgroundColor: '#1f1f1f',
//       borderRadius: '12px',
//       padding: '20px',
//       maxWidth: '500px',
//       width: '100%',
//       maxHeight: '90vh',
//       overflowY: 'auto',
//       border: '1px solid #333',
//       '@media (min-width: 768px)': {
//         padding: '24px',
//         maxWidth: '600px'
//       }
//     },
//     modalTitle: {
//       color: '#fff',
//       fontSize: '18px',
//       fontWeight: '600',
//       marginBottom: '16px',
//       lineHeight: '1.3',
//       '@media (min-width: 768px)': {
//         fontSize: '20px',
//         marginBottom: '20px'
//       }
//     },
//     textarea: {
//       width: '100%',
//       minHeight: '80px',
//       padding: '12px',
//       backgroundColor: '#2a2a2a',
//       border: '1px solid #444',
//       borderRadius: '8px',
//       color: '#fff',
//       fontSize: '14px',
//       resize: 'vertical',
//       fontFamily: 'inherit',
//       marginBottom: '16px',
//       boxSizing: 'border-box',
//       '@media (min-width: 768px)': {
//         minHeight: '100px'
//       }
//     },
//     modalButtons: {
//       display: 'flex',
//       gap: '8px',
//       justifyContent: 'flex-end',
//       flexWrap: 'wrap',
//       '@media (min-width: 768px)': {
//         gap: '12px',
//         flexWrap: 'nowrap'
//       }
//     },
//     cancelButton: {
//       padding: '8px 16px',
//       backgroundColor: 'transparent',
//       border: '1px solid #444',
//       borderRadius: '6px',
//       color: '#fff',
//       cursor: 'pointer',
//       fontSize: '14px',
//       minHeight: '36px',
//       '@media (min-width: 768px)': {
//         padding: '10px 20px'
//       }
//     },
//     emptyState: {
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       gap: '16px',
//       padding: '40px 20px',
//       textAlign: 'center'
//     }
//   };

//   // Apply responsive styles using CSS-in-JS with media queries
//   const responsiveStyles = `
//     @media (max-width: 639px) {
//       .responsive-grid {
//         grid-template-columns: 1fr !important;
//         gap: 16px !important;
//       }
//       .responsive-buttons {
//         flex-direction: column !important;
//       }
//       .responsive-buttons button {
//         width: 100% !important;
//         justify-content: center !important;
//       }
//       .responsive-modal-buttons {
//         flex-direction: column-reverse !important;
//       }
//       .responsive-modal-buttons button {
//         width: 100% !important;
//       }
//     }
//   `;

//   if (loading) {
//     return (
//       <div style={styles.loadingContainer}>
//         <div>Loading reported users...</div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <style>{responsiveStyles}</style>
//       <div style={styles.container}>
//         <div style={styles.header}>
//           <h1 style={styles.title}>
//             <Flag size={window.innerWidth >= 768 ? 28 : 24} />
//             Reported Users
//           </h1>
//           <p style={styles.subtitle}>
//             Review and manage user reports ({reportedUsers.length} users reported)
//           </p>
//         </div>

//         {reportedUsers.length === 0 ? (
//           <div style={{...styles.loadingContainer, ...styles.emptyState}}>
//             <AlertTriangle size={48} color="#6b7280" />
//             <p>No reported users found</p>
//           </div>
//         ) : (
//           <div className="responsive-grid" style={styles.grid}>
//             {reportedUsers.map((reportedUser) => (
//               <div key={reportedUser.user.id} style={styles.userCard}>
//                 <div style={styles.userHeader}>
//                   <img
//                     src={reportedUser.user.profilePicture || "https://avatar.iran.liara.run/public/1.png"}
//                     alt={reportedUser.user.username}
//                     style={styles.avatar}
//                     onClick={() => navigate(`/profile/${reportedUser.user.id}`)}
//                   />
//                   <div style={styles.userInfo}>
//                     <h3 
//                       style={styles.userName}
//                       onClick={() => navigate(`/profile/${reportedUser.user.id}`)}
//                       title={`${reportedUser.user.firstName} ${reportedUser.user.lastName}`}
//                     >
//                       {reportedUser.user.firstName} {reportedUser.user.lastName}
//                     </h3>
//                     <p style={styles.userHandle} title={`@${reportedUser.user.username}`}>
//                       @{reportedUser.user.username}
//                     </p>
//                     <span 
//                       style={{
//                         ...styles.userStatus,
//                         ...(reportedUser.user.accountStatus === 'active' ? styles.activeStatus : styles.bannedStatus)
//                       }}
//                     >
//                       {reportedUser.user.accountStatus}
//                     </span>
//                   </div>
//                 </div>

//                 <div style={styles.reportStats}>
//                   <div style={styles.statItem}>
//                     <p style={styles.statNumber}>{reportedUser.totalReports}</p>
//                     <p style={styles.statLabel}>Total Reports</p>
//                   </div>
//                   <div style={styles.statItem}>
//                     <p style={styles.statNumber}>{reportedUser.pendingReports}</p>
//                     <p style={styles.statLabel}>Pending</p>
//                   </div>
//                   <div style={styles.statItem}>
//                     <p style={{...styles.statNumber, fontSize: window.innerWidth >= 768 ? '14px' : '12px'}}>
//                       {formatDate(reportedUser.lastReportDate).split(',')[0]}
//                     </p>
//                     <p style={styles.statLabel}>Last Report</p>
//                   </div>
//                 </div>

//                 <div style={styles.reportsSection}>
//                   <h4 style={styles.sectionTitle}>Recent Reports</h4>
//                   {reportedUser.reports.slice(0, 2).map((report) => (
//                     <div key={report.id} style={styles.reportItem}>
//                       <div style={styles.reportHeader}>
//                         <span 
//                           style={{
//                             ...styles.reportStatus,
//                             backgroundColor: getStatusColor(report.status) + '20',
//                             color: getStatusColor(report.status)
//                           }}
//                         >
//                           {report.status}
//                         </span>
//                         <span style={styles.reportDate}>
//                           {formatDate(report.createdAt)}
//                         </span>
//                       </div>
//                       <p style={styles.reportReason}>
//                         {report.reason.length > (window.innerWidth >= 768 ? 100 : 80) 
//                           ? `${report.reason.substring(0, window.innerWidth >= 768 ? 100 : 80)}...` 
//                           : report.reason}
//                       </p>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="responsive-buttons" style={styles.actionButtons}>
//                   <button
//                     onClick={() => setSelectedReport(reportedUser)}
//                     style={{...styles.button, ...styles.viewButton}}
//                   >
//                     <Eye size={14} />
//                     <span>View All</span>
//                   </button>
                  
//                   {reportedUser.pendingReports > 0 && (
//                     <>
//                       <button
//                         onClick={() => setReviewModal({
//                           type: 'accept',
//                           reportId: reportedUser.reports.find(r => r.status === 'pending')?.id,
//                           userName: `${reportedUser.user.firstName} ${reportedUser.user.lastName}`
//                         })}
//                         style={{...styles.button, ...styles.acceptButton}}
//                       >
//                         <Check size={14} />
//                         <span>Accept</span>
//                       </button>
//                       <button
//                         onClick={() => setReviewModal({
//                           type: 'decline',
//                           reportId: reportedUser.reports.find(r => r.status === 'pending')?.id,
//                           userName: `${reportedUser.user.firstName} ${reportedUser.user.lastName}`
//                         })}
//                         style={{...styles.button, ...styles.rejectButton}}
//                       >
//                         <X size={14} />
//                         <span>Decline</span>
//                       </button>
//                     </>
//                   )}

//                   {reportedUser.reports.some(r => r.status === 'accepted') && reportedUser.user.accountStatus !== 'banned' && (
//                     <button
//                       onClick={() => handleBanUser(reportedUser.user.id, `${reportedUser.user.firstName} ${reportedUser.user.lastName}`)}
//                       style={{...styles.button, ...styles.banButton}}
//                     >
//                       <Ban size={14} />
//                       <span>Ban User</span>
//                     </button>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* View All Reports Modal */}
//         {selectedReport && (
//           <div style={styles.modal} onClick={(e) => e.target === e.currentTarget && setSelectedReport(null)}>
//             <div style={styles.modalContent}>
//               <h3 style={styles.modalTitle}>
//                 All Reports for {selectedReport.user.firstName} {selectedReport.user.lastName}
//               </h3>
//               <div style={{maxHeight: '60vh', overflowY: 'auto'}}>
//                 {selectedReport.reports.map((report) => (
//                   <div key={report.id} style={{...styles.reportItem, marginBottom: '16px'}}>
//                     <div style={styles.reportHeader}>
//                       <span 
//                         style={{
//                           ...styles.reportStatus,
//                           backgroundColor: getStatusColor(report.status) + '20',
//                           color: getStatusColor(report.status)
//                         }}
//                       >
//                         {report.status}
//                       </span>
//                       <span style={styles.reportDate}>
//                         {formatDate(report.createdAt)}
//                       </span>
//                     </div>
//                     <p style={styles.reportReason}>{report.reason}</p>
//                     {report.reviewNote && (
//                       <div style={{marginTop: '8px', padding: '8px', backgroundColor: '#333', borderRadius: '4px'}}>
//                         <p style={{color: '#9ca3af', fontSize: '12px', margin: '0 0 4px 0'}}>Admin Review:</p>
//                         <p style={{color: '#e5e7eb', fontSize: '13px', margin: 0}}>{report.reviewNote}</p>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </div>
//               <div className="responsive-modal-buttons" style={styles.modalButtons}>
//                 <button
//                   onClick={() => setSelectedReport(null)}
//                   style={styles.cancelButton}
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Review Modal */}
//         {reviewModal && (
//           <div style={styles.modal} onClick={(e) => e.target === e.currentTarget && setReviewModal(null)}>
//             <div style={styles.modalContent}>
//               <h3 style={styles.modalTitle}>
//                 {reviewModal.type === 'accept' ? 'Accept' : 'Decline'} Report for {reviewModal.userName}
//               </h3>
//               <textarea
//                 value={reviewNote}
//                 onChange={(e) => setReviewNote(e.target.value)}
//                 placeholder={`Add a note explaining why you're ${reviewModal.type}ing this report...`}
//                 style={styles.textarea}
//               />
//               <div className="responsive-modal-buttons" style={styles.modalButtons}>
//                 <button
//                   onClick={() => {setReviewModal(null); setReviewNote('');}}
//                   style={styles.cancelButton}
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => handleReviewReport(reviewModal.reportId, reviewModal.type === 'accept' ? 'accepted' : 'declined')}
//                   disabled={reviewLoading}
//                   style={{
//                     ...styles.button,
//                     ...(reviewModal.type === 'accept' ? styles.acceptButton : styles.rejectButton)
//                   }}
//                 >
//                   {reviewLoading ? 'Processing...' : (reviewModal.type === 'accept' ? 'Accept Report' : 'Decline Report')}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default ReportedUsers;