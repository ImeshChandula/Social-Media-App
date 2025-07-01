import React, { useState, useEffect } from 'react';
import { axiosInstance } from "../lib/axios";
import toast from 'react-hot-toast';
import '../styles/AppealManager.css';

const APPEAL_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CLOSED: 'closed',
};

const APPEAL_PRIORITY = {
  HANDLED: 'handled',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

const AppealManager = () => {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    priority: '',
    adminNotes: '',
    responseMessage: ''
  });

  // Fetch appeals data
  const fetchAppeals = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/appeal/getAll');
      
      if (response.data.success) {
        setAppeals(response.data.data);
      } else {
        console.error(response.data.message || 'Failed to fetch appeals');
        toast.error(response.data.message || 'Failed to fetch appeals');
      }
    } catch (error) {
      console.error('Error fetching appeals:', error);
      toast.error(error.response?.data?.message || 'Server error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, []);

  // Handle update button click
  const handleUpdateClick = (appeal) => {
    setSelectedAppeal(appeal);
    setUpdateForm({
      status: appeal.status,
      priority: appeal.priority,
      adminNotes: appeal.adminNotes || '',
      responseMessage: appeal.responseMessage || ''
    });
    setShowUpdateModal(true);
  };

  // Handle delete button click
  const handleDeleteClick = (appeal) => {
    setSelectedAppeal(appeal);
    setShowDeleteModal(true);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setUpdateForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update appeal
  const handleUpdate = async () => {
    try {
        if (updateForm.adminNotes === '' || updateForm.adminNotes === undefined) {
            toast.error("Admin Notes are required");
            return;
        }

        if (updateForm.responseMessage === '' || updateForm.responseMessage === undefined) {
            toast.error("Admin Notes are required");
            return;
        }

        const response = await axiosInstance.patch(`/appeal/update/${selectedAppeal.id}`, updateForm);

        if (response.data.success) {
            setShowUpdateModal(false);
            fetchAppeals(); // Refresh the data
            toast.success(response.data.message);
        } else {
            console.error(response.data.message || 'Failed to update appeals');
            toast.error(response.data.message || 'Failed to update appeals');
        }
    } catch (error) {
      console.error('Error updating appeal:', error);
      toast.error(error.response?.data?.message || 'Server error');
    }
  };

  // Delete appeal
  const handleDelete = async () => {
    try {
      const response = await axiosInstance.delete(`/appeal/delete/${selectedAppeal.id}`);

      if (response.data.success) {
        setShowDeleteModal(false);
        fetchAppeals(); // Refresh the data
        toast.success(response.data.message);
      } else {
        console.error('Failed to delete appeal');
        toast.error(response.data.message || 'Failed to delete appeals');
      }
    } catch (error) {
      console.error('Error deleting appeal:', error);
      toast.error(error.response?.data?.message || 'Server error');
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'ti-co-status-pending';
      case 'under_review': return 'ti-co-status-review';
      case 'approved': return 'ti-co-status-approved';
      case 'rejected': return 'ti-co-status-rejected';
      case 'closed': return 'ti-co-status-closed';
      default: return 'ti-co-status-default';
    }
  };

  // Get priority badge class
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'ti-co-priority-urgent';
      case 'high': return 'ti-co-priority-high';
      case 'medium': return 'ti-co-priority-medium';
      case 'low': return 'ti-co-priority-low';
      case 'handled': return 'ti-co-priority-handled';
      default: return 'ti-co-priority-default';
    }
  };

  if (loading) {
    return (
      <div className="ti-co-container">
        <div className="ti-co-loading">
          <div className="ti-co-spinner"></div>
          <p>Loading appeals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ti-co-container">
      <div className="ti-co-header">
        <h1 className="ti-co-title">Appeal Management</h1>
        <button className="ti-co-refresh-btn" onClick={fetchAppeals}>
          Refresh
        </button>
      </div>

      {/*<div className="ti-co-stats">
        <div className="ti-co-stat-card">
          <h3>Total Appeals</h3>
          <span className="ti-co-stat-number">{appeals.length}</span>
        </div>
      </div>*/}

      <div className="ti-co-appeals-grid">
        {appeals.map((appeal) => (
          <div key={appeal.id} className="ti-co-appeal-card">
            <div className="ti-co-card-header">
              <div className="ti-co-appeal-number">#{appeal.appealNumber}</div>
              <div className="ti-co-badges">
                <span className={`ti-co-badge ${getStatusClass(appeal.status)}`}>
                  {appeal.status.replace('_', ' ')}
                </span>
                <span className={`ti-co-badge ${getPriorityClass(appeal.priority)}`}>
                  {appeal.priority}
                </span>
              </div>
            </div>

            <div className="ti-co-card-body">
              <div className="ti-co-author-info">
                <img 
                  src={appeal.author.profilePicture} 
                  alt={appeal.author.username}
                  className="ti-co-avatar"
                />
                <div>
                  <div className="ti-co-author-name">{appeal.author.username}</div>
                  <div className="ti-co-author-email">{appeal.author.email}</div>
                </div>
              </div>

              <div className="ti-co-appeal-content">
                <h4>Appeal Reason</h4>
                <p>{appeal.appealReason}</p>
                
                {appeal.additionalInfo && (
                  <>
                    <h4>Additional Information</h4>
                    <p>{appeal.additionalInfo}</p>
                  </>
                )}

                <div className="ti-co-meta-info">
                  <div className="ti-co-meta-item">
                    <strong>Contact Method:</strong> {appeal.contactMethod}
                  </div>
                  <div className="ti-co-meta-item">
                    <strong>Created:</strong> {formatDate(appeal.createdAt)}
                  </div>
                  <div className="ti-co-meta-item">
                    <strong>Updated:</strong> {formatDate(appeal.updatedAt)}
                  </div>
                </div>

                {appeal.adminNotes && (
                  <div className="ti-co-admin-notes">
                    <strong>Admin Notes:</strong> {appeal.adminNotes}
                  </div>
                )}

                {appeal.responseMessage && (
                  <div className="ti-co-response">
                    <strong>Response:</strong> {appeal.responseMessage}
                  </div>
                )}
              </div>
            </div>

            <div className="ti-co-card-actions">
              <button 
                className="ti-co-btn ti-co-btn-primary"
                onClick={() => handleUpdateClick(appeal)}
              >
                Update
              </button>
              <button 
                className="ti-co-btn ti-co-btn-danger"
                onClick={() => handleDeleteClick(appeal)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="ti-co-modal-overlay">
          <div className="ti-co-modal">
            <div className="ti-co-modal-header">
              <h2>Update Appeal</h2>
              <button 
                className="ti-co-close-btn"
                onClick={() => setShowUpdateModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="ti-co-modal-body">
              <div className="ti-co-form-group">
                <label>Status</label>
                <select 
                  value={updateForm.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="ti-co-select"
                >
                  {Object.entries(APPEAL_STATUS).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value.replace('_', ' ').toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ti-co-form-group">
                <label>Priority</label>
                <select 
                  value={updateForm.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="ti-co-select"
                >
                  {Object.entries(APPEAL_PRIORITY).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ti-co-form-group">
                <label>Admin Notes</label>
                <textarea 
                  value={updateForm.adminNotes}
                  onChange={(e) => handleInputChange('adminNotes', e.target.value)}
                  className="ti-co-textarea"
                  rows="3"
                  placeholder="Enter admin notes..."
                />
              </div>

              <div className="ti-co-form-group">
                <label>Response Message</label>
                <textarea 
                  value={updateForm.responseMessage}
                  onChange={(e) => handleInputChange('responseMessage', e.target.value)}
                  className="ti-co-textarea"
                  rows="3"
                  placeholder="Enter response message..."
                />
              </div>
            </div>

            <div className="ti-co-modal-footer">
              <button 
                className="ti-co-btn ti-co-btn-secondary"
                onClick={() => setShowUpdateModal(false)}
              >
                Cancel
              </button>
              <button 
                className="ti-co-btn ti-co-btn-primary"
                onClick={handleUpdate}
              >
                Update Appeal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="ti-co-modal-overlay">
          <div className="ti-co-modal ti-co-modal-small">
            <div className="ti-co-modal-header">
              <h2>Delete Appeal</h2>
              <button 
                className="ti-co-close-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="ti-co-modal-body">
              <p>Are you sure you want to delete this appeal?</p>
              <p><strong>Appeal Number:</strong> {selectedAppeal?.appealNumber}</p>
              <p><strong>Author:</strong> {selectedAppeal?.author.username}</p>
              <p className="ti-co-warning">This action cannot be undone.</p>
            </div>

            <div className="ti-co-modal-footer">
              <button 
                className="ti-co-btn ti-co-btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="ti-co-btn ti-co-btn-danger"
                onClick={handleDelete}
              >
                Delete Appeal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppealManager;