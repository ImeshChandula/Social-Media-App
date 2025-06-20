import React, { useState, useEffect } from 'react';
import { axiosInstance } from "../lib/axios";
import '../styles/TicketsHead.css';

const TicketsHead = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appeals, setAppeals] = useState([]);

  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    try {
      const res = await axiosInstance.get('/appeal/getAll');
      const data = res.data.data;
      setAppeals(data);
      calculateStats(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching appeals", err);
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const pending = data.filter(a => a.status === 'pending').length;
    const reviewed = data.filter(a => ['approved', 'rejected', 'closed'].includes(a.status)).length;
    const urgent = data.filter(a => a.priority === 'urgent').length;
    const total = data.length;

    setSummary({ pending, reviewed, urgent, total });
  };

  if (loading) {
    return (
      <header className="tk-appeals-header">
        <div className="tk-header-container">
          <div className="tk-header-content">
            <div className="tk-title-section">
              <div className="tk-icon-wrapper">
                <svg className="tk-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4" />
                  <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z" />
                  <path d="M3 12v7c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-7" />
                </svg>
              </div>
              <div className="tk-title-text">
                <h1 className="tk-main-title">Appeal Management</h1>
                <p className="tk-subtitle">Review and manage user ban appeals</p>
              </div>
            </div>
            <div className="tk-stats-section">
              <div className="tk-stat-card">
                <div className="tk-stat-number">...</div>
                <div className="tk-stat-label">Pending</div>
              </div>
              <div className="tk-stat-card">
                <div className="tk-stat-number">...</div>
                <div className="tk-stat-label">Total</div>
              </div>
              <div className="tk-stat-card tk-stat-urgent">
                <div className="tk-stat-number">...</div>
                <div className="tk-stat-label">Urgent</div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="tk-appeals-header">
      <div className="tk-header-container">
        <div className="tk-header-content">
          <div className="tk-title-section">
            <div className="tk-icon-wrapper">
              <svg className="tk-header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4" />
                <path d="M21 12c.552 0 1-.448 1-1V5c0-.552-.448-1-1-1H3c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1h18z" />
                <path d="M3 12v7c0 .552.448 1 1 1h16c.552 0 1-.448 1-1v-7" />
              </svg>
            </div>
            <div className="tk-title-text">
              <h1 className="tk-main-title">Appeal Management</h1>
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
  );
};

export default TicketsHead;
