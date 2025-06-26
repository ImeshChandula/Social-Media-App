import React, {useState, useEffect} from 'react';
import { axiosInstance } from "../lib/axios";
import toast from 'react-hot-toast';
import '../styles/TicketsHead.css';
import TicketsHeadSkeleton from './TicketsHeadSkeleton';

const TicketsHead = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get('/dashboard/appealSummery');
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
                            <path d="M9 12l2 2 4-4"/>
                            <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z"/>
                            <path d="M3 12v7c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-7"/>
                        </svg>
                    </div>
                    <div className="tk-title-text">
                        <h1 className="tk-main-title">Appeal Center</h1>
                        <p className="tk-subtitle">Review and manage user ban appeals</p>
                    </div>
                </div>
                
                <div className="tk-stats-section">
                    <div className="tk-stat-card">
                        <div className="tk-stat-number">{summary?.pending || 0}</div>
                        <div className="tk-stat-label">Pending</div>
                    </div>
                    <div className="tk-stat-card">
                        <div className="tk-stat-number">{summary?.total || 0}</div>
                        <div className="tk-stat-label">Total</div>
                    </div>
                    <div className="tk-stat-card tk-stat-urgent">
                        <div className="tk-stat-number">{summary?.urgent || 0}</div>
                        <div className="tk-stat-label">Urgent</div>
                    </div>
                </div>
            </div>
        </div>
    </header>
  )
}

export default TicketsHead