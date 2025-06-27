import React, { useEffect, useState } from 'react';
import { axiosInstance } from "../lib/axios";
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
  role: '', // change to 'banned' to show create appeal button
};

/* helper ─ now handles ISO strings, Date objects AND Firestore timestamps */
const formatDate = (value) => {
  if (!value) return 'N/A';

  let date;
  // 1️⃣  Already a JS Date
  if (value instanceof Date) {
    date = value;
  }
  // 2️⃣  ISO string
  else if (typeof value === 'string') {
    date = new Date(value);
  }
  // 3️⃣  Firestore Timestamp (v9 SDK → { seconds, nanoseconds })
  else if (typeof value === 'object' && ('seconds' in value || '_seconds' in value)) {
    // support both `seconds` and `_seconds`
    const secs = value.seconds ?? value._seconds;
    date = new Date(secs * 1000);
  }
  // 4️⃣  Anything else we don’t recognise
  else {
    return 'N/A';
  }

  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

const TicketsContent = () => {
  const [appeals, setAppeals] = useState([]);
  const [editAppeal, setEditAppeal] = useState(null); // Fixed variable name
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [editForm, setEditForm] = useState({
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
      const res = await axiosInstance.get('appeal/getAll');
      const normalised = (res.data.data || []).map(a => ({
     ...a,
     id: a.id ?? a._id,          // ensures every row has .id
   }));
   setAppeals(normalised);
    } catch (err) {
      console.error("Error fetching appeals:", err);
      alert(err.response?.data?.message || 'Failed to fetch appeals');
    }
  };

  const openEditModal = (appeal) => {
    setEditAppeal(appeal); // Fixed variable name
    setEditForm({
      status: appeal.status || '',
      priority: appeal.priority || '',
      adminNotes: appeal.adminNotes || '',
      responseMessage: appeal.responseMessage || ''
    });
  };

  const handleUpdate = async () => {
    const { status, priority, adminNotes, responseMessage } = editForm;
    if (!status || !priority || !adminNotes.trim() || !responseMessage.trim()) {
      return alert('All fields are required.');
    }

    try {
      await axiosInstance.patch(`appeal/update/${editAppeal.id || editAppeal._id}`, editForm);
      alert('Appeal updated successfully');
      setEditAppeal(null); // Close modal
      setEditForm({ status: '', priority: '', adminNotes: '', responseMessage: '' }); // Reset form
      fetchAppeals();
    } catch (err) {
      console.error("Error updating appeal:", err);
      alert(err.response?.data?.message || 'Failed to update appeal');
    }
  };

  const handleCreate = async () => {
    if (!newAppeal.appealReason?.trim()) {
      alert("Appeal Reason is required.");
      return;
    }

    try {
      await axiosInstance.post('appeal/create', newAppeal);
      alert("Appeal submitted successfully");
      setCreating(false);
      setNewAppeal({ appealReason: '', additionalInfo: '', contactMethod: 'email' });
      fetchAppeals();
    } catch (err) {
      console.error("Error creating appeal:", err);
      alert(err.response?.data?.message || 'Failed to create appeal');
    }
  };

  const confirmDelete = async () => {
    try {
      await axiosInstance.delete(`appeal/delete/${deleteId}`);
      alert("Appeal deleted successfully");
      setDeleteId(null);
      fetchAppeals();
    } catch (err) {
      console.error("Error deleting appeal:", err);
      alert(err.response?.data?.message || 'Failed to delete appeal');
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
            <textarea
              value={newAppeal.appealReason}
              onChange={(e) => setNewAppeal({ ...newAppeal, appealReason: e.target.value })}
            />

            <label>Additional Info</label>
            <textarea
              value={newAppeal.additionalInfo}
              onChange={(e) => setNewAppeal({ ...newAppeal, additionalInfo: e.target.value })}
            />

            <label>Contact Method</label>
            <select
              value={newAppeal.contactMethod}
              onChange={(e) => setNewAppeal({ ...newAppeal, contactMethod: e.target.value })}
            >
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
              <th>adminNotes</th>
              <th>Status</th>
              <th>Priority</th>
              <th>responseMessage</th>
              <th>Reason</th>
              <th>Additional</th>
              <th>Incident Date</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
  {appeals.map((appeal) => (
    <tr key={appeal.id}>
      <td data-label="Appeal No.">{appeal.appealNumber}</td>
      <td data-label="User">{appeal.author?.username || 'Unknown'}</td>
      <td data-label="Email">{appeal.author?.email || 'N/A'}</td>
      <td data-label="Admin Notes">{appeal.adminNotes}</td>
      <td data-label="Status">
        <span className={`badge status-${appeal.status}`}>{appeal.status}</span>
      </td>
      <td data-label="Priority">
        <span className={`badge priority-${appeal.priority}`}>{appeal.priority}</span>
      </td>
      <td data-label="Response">{appeal.responseMessage}</td>
      <td data-label="Reason">{appeal.appealReason}</td>
      <td data-label="Additional">{appeal.additionalInfo}</td>
      <td data-label="Incident">{formatDate(appeal.incidentDate)}</td>
      <td data-label="Created">{formatDate(appeal.createdAt)}</td>
      <td data-label="Actions">
        <div style={{ display:'flex', gap:'6px' }}>
          <button className="edit-btn" onClick={() => openEditModal(appeal)}>Take Action</button>
          <button className="cancel-btn" onClick={() => setDeleteId(appeal.id)}>Delete</button>
        </div>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </div>

      {editAppeal && (
        <div className="modal">
          <div className="modal-box">
            <h3>Edit Appeal: {editAppeal.appealNumber}</h3>

            <label>Status</label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
            >
              <option value="">Select Status</option>
              {Object.values(APPEAL_STATUS).map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
              ))}
            </select>

            <label>Priority</label>
            <select
              value={editForm.priority}
              onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
            >
              <option value="">Select Priority</option>
              {Object.values(APPEAL_PRIORITY).map((p) => (
                <option key={p} value={p}>{p.toUpperCase()}</option>
              ))}
            </select>

            <label>Admin Notes</label>
            <textarea
              value={editForm.adminNotes}
              onChange={(e) => setEditForm({ ...editForm, adminNotes: e.target.value })}
              maxLength={2000}
            />

            <label>Response Message</label>
            <textarea
              value={editForm.responseMessage}
              onChange={(e) => setEditForm({ ...editForm, responseMessage: e.target.value })}
              maxLength={2000}
            />

            <div className="modal-actions">
              <button className="save-btn" onClick={handleUpdate}>Save</button>
              <button className="cancel-btn" onClick={() => setEditAppeal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

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