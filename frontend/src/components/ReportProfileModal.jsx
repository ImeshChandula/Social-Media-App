import React, { useState } from 'react';
import { Flag, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';

const ReportProfileModal = ({ isOpen, onClose, userId, userName }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (reason.trim().length < 5) {
      toast.error('Reason must be at least 5 characters long');
      return;
    }

    if (reason.trim().length > 500) {
      toast.error('Reason cannot exceed 500 characters');
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.post(`/users/report/${userId}`, {
        reason: reason.trim()
      });

      if (response.data.success) {
        toast.success('Profile reported successfully');
        setReason('');
        onClose();
      }
    } catch (error) {
      console.error('Error reporting profile:', error);
      const message = error.response?.data?.message || 'Failed to report profile';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    },
    modal: {
      backgroundColor: '#1a1a1a',
      borderRadius: '12px',
      padding: '24px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '90vh',
      overflowY: 'auto',
      border: '1px solid #333'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      paddingBottom: '16px',
      borderBottom: '1px solid #333'
    },
    title: {
      color: '#fff',
      fontSize: '20px',
      fontWeight: '600',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: '#999',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    userInfo: {
      backgroundColor: '#2a2a2a',
      padding: '16px',
      borderRadius: '8px',
      marginBottom: '20px',
      border: '1px solid #333'
    },
    userName: {
      color: '#fff',
      fontSize: '16px',
      fontWeight: '500',
      margin: 0
    },
    userHandle: {
      color: '#999',
      fontSize: '14px',
      margin: '4px 0 0 0'
    },
    formGroup: {
      marginBottom: '20px'
    },
    label: {
      display: 'block',
      color: '#fff',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '8px'
    },
    textarea: {
      width: '100%',
      minHeight: '120px',
      padding: '12px',
      backgroundColor: '#2a2a2a',
      border: '1px solid #444',
      borderRadius: '8px',
      color: '#fff',
      fontSize: '14px',
      resize: 'vertical',
      fontFamily: 'inherit'
    },
    characterCount: {
      textAlign: 'right',
      fontSize: '12px',
      color: '#999',
      marginTop: '4px'
    },
    warningText: {
      color: '#fbbf24',
      fontSize: '12px',
      marginTop: '8px',
      padding: '8px',
      backgroundColor: '#451a03',
      borderRadius: '6px',
      border: '1px solid #92400e'
    },
    buttons: {
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '24px'
    },
    cancelButton: {
      padding: '10px 20px',
      backgroundColor: 'transparent',
      border: '1px solid #444',
      borderRadius: '6px',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500'
    },
    submitButton: {
      padding: '10px 20px',
      backgroundColor: '#ef4444',
      border: 'none',
      borderRadius: '6px',
      color: '#fff',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    submitButtonDisabled: {
      backgroundColor: '#7f1d1d',
      cursor: 'not-allowed'
    }
  };

  return (
    <div style={modalStyles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={modalStyles.modal}>
        <div style={modalStyles.header}>
          <h3 style={modalStyles.title}>
            <Flag size={20} />
            Report Profile
          </h3>
          <button
            onClick={onClose}
            style={modalStyles.closeButton}
            onMouseEnter={(e) => e.target.style.color = '#fff'}
            onMouseLeave={(e) => e.target.style.color = '#999'}
          >
            <X size={20} />
          </button>
        </div>

        <div style={modalStyles.userInfo}>
          <p style={modalStyles.userName}>Reporting: {userName}</p>
          <p style={modalStyles.userHandle}>This report will be reviewed by administrators</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={modalStyles.formGroup}>
            <label style={modalStyles.label}>
              Reason for reporting *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please explain why you're reporting this profile. Be specific about any violations of community guidelines or inappropriate behavior."
              style={modalStyles.textarea}
              maxLength={500}
              required
            />
            <div style={modalStyles.characterCount}>
              {reason.length}/500 characters
            </div>
          </div>

          <div style={modalStyles.warningText}>
            ⚠️ False reports may result in action against your account. Please only report content that violates our community guidelines.
          </div>

          <div style={modalStyles.buttons}>
            <button
              type="button"
              onClick={onClose}
              style={modalStyles.cancelButton}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || reason.trim().length < 5}
              style={{
                ...modalStyles.submitButton,
                ...(loading || reason.trim().length < 5 ? modalStyles.submitButtonDisabled : {})
              }}
            >
              <Flag size={16} />
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportProfileModal;