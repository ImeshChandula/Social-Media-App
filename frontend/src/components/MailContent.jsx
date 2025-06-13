import React, { useState, useEffect } from 'react';
import { axiosInstance } from "../lib/axios";
import toast from 'react-hot-toast';
import '../styles/MailContent.css';

const MailContent = ({ searchTerm = '', currentFilter = 'all', refreshTrigger = 0, onMailCountChange }) => {
    const [mails, setMails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMails, setSelectedMails] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);

    // Fetch all mails
    const fetchMails = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/support/getAllMails');

            if (response.data.success) {
                setMails(response.data.data || []);
            }

            // Update mail counts in parent component
            if (onMailCountChange) {
                const unreadCount = response.data.unreadCount || 0;
                onMailCountChange(response.data.totalCount, unreadCount);
            }
        } catch (error) {
            setError(error.message);
            toast.error(error.response?.data?.message || 'Server error');
        } finally {
            setLoading(false);
        }
    };

    // Mark single mail as read
    const markAsRead = async (mailId) => {
        try {
            const response = await axiosInstance.patch(`/support/markAsRead/${mailId}`);

            if (response.data.success) {
                toast.success(response.data.message);
                fetchMails();
            }
        } catch (error) {
            console.error('Error marking mail as read:', error);
            setError(error.message);
            toast.error(error.response?.data?.message || 'Server error');
        }
    };

    // Handle bulk mark as read
    const markSelectedAsRead = async () => {
        try {
            const promises = Array.from(selectedMails).map(mailId => 
                axiosInstance.patch(`/support/markAsRead/${mailId}`)
            );

            await Promise.all(promises);

            setSelectedMails(new Set());
            setSelectAll(false);

            fetchMails();
        } catch (error) {
            console.error('Error marking selected mails as read:', error);
            toast.error(error.response?.data?.message || 'Server error');
        }
    };

    // Handle individual mail selection
    const toggleMailSelection = (mailId) => {
        const newSelectedMails = new Set(selectedMails);
        if (newSelectedMails.has(mailId)) {
            newSelectedMails.delete(mailId);
        } else {
            newSelectedMails.add(mailId);
        }

        setSelectedMails(newSelectedMails);
        setSelectAll(newSelectedMails.size === filteredMails.length);
    };

    // Handle select all
    const toggleSelectAll = () => {
        if (selectAll) {
            setSelectedMails(new Set());
        } else {
            setSelectedMails(new Set(filteredMails.map(mail => mail.id)));
        }
        setSelectAll(!selectAll);
    };

    // Filter mails based on search term and current filter
    const filteredMails = mails.filter(mail => {
        // Search filter
        const matchesSearch = searchTerm === '' || 
        mail.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mail.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mail.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mail.name?.toLowerCase().includes(searchTerm.toLowerCase());

        // Category filter - Note: using subject as category since your API uses subject field
        let matchesFilter = true;
        switch (currentFilter) {
        case 'unread':
            matchesFilter = !mail.isRead;
            break;
        case 'support':
            matchesFilter = mail.subject === 'support';
            break;
        case 'feedback':
            matchesFilter = mail.subject === 'feedback';
            break;
        case 'general':
            matchesFilter = mail.subject === 'general';
            break;
        default:
            matchesFilter = true;
        }

        return matchesSearch && matchesFilter;
    });

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays - 1} days ago`;
        
        return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
        });
    };

    // Get category icon - using subject field
    const getCategoryIcon = (subject) => {
        switch (subject) {
        case 'support': return '🛠️';
        case 'feedback': return '💬';
        case 'general': return '📝';
        default: return '📧';
        }
    };

    useEffect(() => {
        fetchMails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshTrigger]); 

    if (loading) {
        return (
        <div className="mail-content">
            <div className="mail-loading-container">
            <div className="mail-loading-spinner"></div>
            <p>Loading mails...</p>
            </div>
        </div>
        );
    }

    if (error) {
        return (
        <div className="mail-content">
            <div className="mail-error-container">
            <div className="mail-error-icon">⚠️</div>
            <h3>Error Loading Mails</h3>
            <p>{error}</p>
            <button onClick={fetchMails} className="retry-btn">
                Try Again
            </button>
            </div>
        </div>
        );
    }


  return (
    <div className="mail-content">
        {/* Bulk Actions Bar */}
        {selectedMails.size > 0 && (
            <div className="bulk-actions-bar">
            <div className="selection-info">
                <span>{selectedMails.size} mail{selectedMails.size !== 1 ? 's' : ''} selected</span>
            </div>
            <div className="bulk-actions">
                <button 
                onClick={markSelectedAsRead}
                className="bulk-action-btn mark-read-btn"
                >
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                Mark as Read
                </button>
                <button 
                onClick={() => setSelectedMails(new Set())}
                className="bulk-action-btn cancel-btn"
                >
                Cancel
                </button>
            </div>
            </div>
        )}

        {/* Mail List Header */}
        <div className="mail-list-header">
            <div className="select-all-container">
            <label className="mail-checkbox-container">
                <input
                type="checkbox"
                checked={selectAll}
                onChange={toggleSelectAll}
                disabled={filteredMails.length === 0}
                />
                <span className="mail-checkmark"></span>
            </label>
            <span className="select-all-label">
                {filteredMails.length > 0 ? `Select All (${filteredMails.length})` : 'No mails'}
            </span>
            </div>
            <button onClick={fetchMails} className="refresh-list-btn">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Refresh
            </button>
        </div>

        {/* Mail List */}
        <div className="mail-list">
            {filteredMails.length === 0 ? (
            <div className="no-mails">
                <div className="no-mails-icon">📭</div>
                <h3>No Mails Found</h3>
                <p>
                {searchTerm || currentFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'No mails available at the moment.'}
                </p>
            </div>
            ) : (
            filteredMails.map((mail) => (
                <div 
                key={mail.id} 
                className={`mail-item ${!mail.isRead ? 'unread' : ''} ${selectedMails.has(mail.id) ? 'selected' : ''}`}
                >
                <div className="mail-checkbox">
                    <label className="mail-checkbox-container">
                    <input
                        type="checkbox"
                        checked={selectedMails.has(mail.id)}
                        onChange={() => toggleMailSelection(mail.id)}
                    />
                    <span className="mail-checkmark"></span>
                    </label>
                </div>

                <div className="mail-info">
                    <div className="mail-header-row">
                    <div className="mail-sender">
                        <span className="sender-email">{mail.email}</span>
                        <span className="sender-name">{mail.name}</span>
                    </div>
                    <div className="mail-meta">
                        <span className="mail-category">
                        {getCategoryIcon(mail.subject)}
                        {mail.subject}
                        </span>
                        <span className="mail-date">{formatDate(mail.createdAt)}</span>
                    </div>
                    </div>

                    <div className="mail-subject">
                    {mail.subject} - {mail.name}
                    {!mail.isRead && <span className="unread-indicator"></span>}
                    </div>

                    <div className="mail-preview">
                    {mail.message.substring(0, 150)}
                    {mail.message.length > 150 && '...'}
                    </div>
                </div>

                <div className="mail-actions">
                    {!mail.isRead && (
                    <button 
                        onClick={() => markAsRead(mail.id)}
                        className="mark-read-btn"
                        title="Mark as read"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                    </button>
                    )}
                    <button className="view-mail-btn" title="View full message">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                    </button>
                </div>
                </div>
            ))
            )}
        </div>
        </div>
  )
}

export default MailContent