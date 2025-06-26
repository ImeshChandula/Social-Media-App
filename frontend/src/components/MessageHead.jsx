import React, {useState, useEffect} from 'react';
import { axiosInstance } from "../lib/axios";
import toast from 'react-hot-toast';
import '../styles/TicketsHead.css'
import TicketsHeadSkeleton from './TicketsHeadSkeleton';

const MessageHead = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true);

            const response = await axiosInstance.get('/dashboard/messageSummery');
            if (response.data.success) {
                setSummary(response.data.data);
            }
        } catch (error) {
            const message =
                error?.response?.data?.message || // Backend-sent message
                error?.message ||                 // General JS error
                'Something went wrong while fetching categories';

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
    return (
      <TicketsHeadSkeleton />
    );
  }


  return (
    <header className="tk-appeals-header">
        <div className="tk-header-container">
            <div className="tk-header-content">
                <div className="tk-title-section">
                    <div className="tk-icon-wrapper">
                        <svg className="tk-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 8h16c1.1 0 2 .9 2 2v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2z"/>
                            <rect x="18" y="6" width="4" height="3" rx="0.5" fill="currentColor"/>
                            <line x1="6" y1="12" x2="14" y2="12" strokeWidth="1"/>
                            <line x1="4" y1="20" x2="4" y2="22"/>
                            <line x1="20" y1="20" x2="20" y2="22"/>
                        </svg>
                    </div>
                    <div className="tk-title-text">
                        <h1 className="tk-main-title">Message Center</h1>
                        <p className="tk-subtitle">Review and manage user messages</p>
                    </div>
                </div>
                
                <div className="tk-stats-section">
                    <div className="tk-stat-card">
                        <div className="tk-stat-number">{summary?.total || 0}</div>
                        <div className="tk-stat-label">Total</div>
                    </div>
                    <div className="tk-stat-card tk-stat-urgent">
                        <div className="tk-stat-number">{summary?.unread || 0}</div>
                        <div className="tk-stat-label">Unread</div>
                    </div>
                </div>
            </div>
        </div>
    </header>
  )
}

export default MessageHead