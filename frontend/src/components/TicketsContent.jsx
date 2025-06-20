import React, { useEffect, useState } from 'react';
import { axiosInstance } from "../lib/axios";
import TicketsHead from './TicketsHead';
import '../styles/TicketsContent.css';

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

const user = {
  role: '', // change to 'banned' to see Create button
};

const TicketsContent = () => {
  const [appeals, setAppeals] = useState([]);
  const [editingAppeal, setEditingAppeal] = useState(null);
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [formData, setFormData] = useState({
    status: '',
    priority: '',
    adminNotes: '',
    responseMessage: ''
  });

  const [newAppeal, setNewAppeal] = useState({
    appealReason: '',
    additionalInfo: '',
    contactMethod: 'email'
  });

  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    try {
      const res = await axiosInstance.get('/appeal/getAll');
      const data = res.data.data;
      setAppeals(data);
    } catch (err) {
      console.error("Error fetching appeals", err);
    }
  };


  const openEditModal = (appeal) => {
    setEditingAppeal(appeal);
    setFormData({
      status: appeal.status || '',
      priority: appeal.priority || '',
      adminNotes: appeal.adminNotes || '',
      responseMessage: appeal.responseMessage || ''
    });
  };

  const handleUpdate = async () => {
    if (!formData.adminNotes || !formData.responseMessage) {
      alert("Admin Notes and Response Message are required.");
      return;
    }

    try {
      await axiosInstance.patch(`/appeal/update/${editingAppeal.id}`, formData);
      alert('Appeal updated successfully');
      setEditingAppeal(null);
      fetchAppeals();
    } catch (err) {
      console.error("Update failed", err);
      alert('Update failed');
    }
  };

  const handleCreate = async () => {
    if (!newAppeal.appealReason) {
      alert("Appeal Reason is required.");
      return;
    }

    try {
      await axiosInstance.post('/appeal/create', newAppeal);
      alert("Appeal submitted");
      setCreating(false);
      setNewAppeal({ appealReason: '', additionalInfo: '', contactMethod: 'email' });
    } catch (err) {
      console.error("Create failed", err);
      alert("Failed to create appeal");
    }
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`/appeal/delete/${deleteId}`);
      alert("Appeal deleted");
      setDeleteId(null);
      fetchAppeals();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="tickets-wrapper">
      
      {user.role === 'banned' && (
        <button className="edit-btn" onClick={() => setCreating(!creating)}>
          {creating ? 'Cancel New Appeal' : 'Create New Appeal'}
        </button>
      )}

      {creating && (
        <div className="modal">
          <div className="modal-box">
            <h3>Create New Appeal</h3>

            <label>Appeal Reason</label>
            <textarea value={newAppeal.appealReason} onChange={(e) => setNewAppeal({ ...newAppeal, appealReason: e.target.value })} />

            <label>Additional Info</label>
            <textarea value={newAppeal.additionalInfo} onChange={(e) => setNewAppeal({ ...newAppeal, additionalInfo: e.target.value })} />

            <label>Contact Method</label>
            <select value={newAppeal.contactMethod} onChange={(e) => setNewAppeal({ ...newAppeal, contactMethod: e.target.value })}>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>

            <div className="modal-actions">
              <button className="save-btn" onClick={handleCreate}>Submit</button>
              <button className="cancel-btn" onClick={() => setCreating(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="tickets-table-wrapper">
        <table className="tickets-table">
          <thead>
            <tr>
              <th>Appeal No.</th>
              <th>User</th>
              <th>Email</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appeals.length === 0 ? (
              <tr><td colSpan="7">No appeals found.</td></tr>
            ) : (
              appeals.map((appeal) => (
                <tr key={appeal.id}>
                  <td>{appeal.appealNumber}</td>
                  <td>{appeal.author?.username}</td>
                  <td>{appeal.author?.email}</td>
                  <td><span className={`badge status-${appeal.status}`}>{appeal.status}</span></td>
                  <td><span className={`badge priority-${appeal.priority}`}>{appeal.priority}</span></td>
                  <td>{appeal.appealReason}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="edit-btn" onClick={() => openEditModal(appeal)}>Take Action</button>
                      <button className="cancel-btn small-btn" onClick={() => setDeleteId(appeal.id)}>Delete</button>

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingAppeal && (
        <div className="modal">
          <div className="modal-box">
            <h3>Edit Appeal: {editingAppeal.appealNumber}</h3>

            <label>Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <option value="">Select Status</option>
              {Object.values(APPEAL_STATUS).map(s => (
                <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>

            <label>Priority</label>
            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
              <option value="">Select Priority</option>
              {Object.values(APPEAL_PRIORITY).map(p => (
                <option key={p} value={p}>{p.toUpperCase()}</option>
              ))}
            </select>

            <label>Admin Notes</label>
            <textarea value={formData.adminNotes} onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })} maxLength={2000} />

            <label>Response Message</label>
            <textarea value={formData.responseMessage} onChange={(e) => setFormData({ ...formData, responseMessage: e.target.value })} maxLength={2000} />

            <div className="modal-actions">
              <button className="save-btn" onClick={handleUpdate}>Save</button>
              <button className="cancel-btn" onClick={() => setEditingAppeal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal">
          <div className="modal-box">
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete this appeal?</p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="save-btn" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketsContent;
