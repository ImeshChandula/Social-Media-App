import React, { useState, useEffect } from 'react';
import { Briefcase, ShoppingBag, Users, TrendingUp, FileText } from 'lucide-react';
import { axiosInstance } from "../lib/axios";
import toast from 'react-hot-toast';
import '../styles/CategoryHead.css';

const CategoryHead = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/dashboard/categorySummery');
            
            if (response.data.success) {
                setData(response.data.data);
            } 
        } catch (error) {
            setError(error.response.data?.message);
            toast.error(error.response.data?.message || 'Server error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
        <div className="cg-container">
            <div className="cg-loading">
            <div className="cg-spinner"></div>
            <p className="cg-loading-text">Loading categories...</p>
            </div>
        </div>
        );
    }

    if (error) {
        return (
        <div className="cg-container">
            <div className="cg-error">
            <div className="cg-error-icon">⚠️</div>
            <h3 className="cg-error-title">Oops! Something went wrong</h3>
            <p className="cg-error-message">{error}</p>
            <button 
                className="cg-retry-btn"
                onClick={fetchCategories}
            >
                Try Again
            </button>
            </div>
        </div>
        );
    }


  return (
    <div className="cg-container">
      <div className="cg-header">
        <div className="cg-header-content">
          <h1 className="cg-title">
            <TrendingUp className="cg-title-icon" />
            Category Dashboard
          </h1>
          <p className="cg-subtitle">
            Overview of job categories, market segments, and page categories
          </p>
        </div>
        <div className="cg-stats">
          <div className="cg-stat">
            <span className="cg-stat-number">
              {data?.simplifiedJobCategories?.length || 0}
            </span>
            <span className="cg-stat-label">Job Categories</span>
          </div>
          <div className="cg-stat">
            <span className="cg-stat-number">
              {data?.simplifiedMarketCategories?.length || 0}
            </span>
            <span className="cg-stat-label">Market Categories</span>
          </div>
          <div className="cg-stat">
            <span className="cg-stat-number">
              {data?.simplifiedPageCategories?.length || 0}
            </span>
            <span className="cg-stat-label">Page Categories</span>
          </div>
        </div>
      </div>

      <div className="cg-grid">
        {/* Job Categories Section */}
        <div className="cg-section">
          <div className="cg-section-header">
            <div className="cg-section-title">
              <Briefcase className="cg-section-icon" />
              <h2>Job Categories</h2>
            </div>
            <div className="cg-badge">
              {data?.simplifiedJobCategories?.length || 0} Categories
            </div>
          </div>
          
          <div className="cg-cards">
            {data?.simplifiedJobCategories?.map((job) => (
              <div key={job.id} className="cg-card cg-job-card">
                <div className="cg-card-header">
                  <h3 className="cg-card-title">{job.name}</h3>
                  <div className="cg-card-actions">
                    <button className="cg-action-btn">
                      <Users size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Categories Section */}
        <div className="cg-section">
          <div className="cg-section-header">
            <div className="cg-section-title">
              <ShoppingBag className="cg-section-icon" />
              <h2>Market Categories</h2>
            </div>
            <div className="cg-badge">
              {data?.simplifiedMarketCategories?.length || 0} Categories
            </div>
          </div>
          
          <div className="cg-cards">
            {data?.simplifiedMarketCategories?.map((market) => (
              <div key={market.id} className="cg-card cg-market-card">
                <div className="cg-card-header">
                  <h3 className="cg-card-title">{market.name}</h3>
                  <div className="cg-card-actions">
                    <button className="cg-action-btn">
                      <TrendingUp size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Page Categories Section */}
        <div className="cg-section">
          <div className="cg-section-header">
            <div className="cg-section-title">
              <FileText className="cg-section-icon" />
              <h2>Page Categories</h2>
            </div>
            <div className="cg-badge">
              {data?.simplifiedPageCategories?.length || 0} Categories
            </div>
          </div>
          
          <div className="cg-cards">
            {data?.simplifiedPageCategories?.map((page) => (
              <div key={page.id} className="cg-card cg-page-card">
                <div className="cg-card-header">
                  <h3 className="cg-card-title">{page.name}</h3>
                  <div className="cg-card-actions">
                    <button className="cg-action-btn">
                      <FileText size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cg-footer">
        <button 
          className="cg-refresh-btn"
          onClick={fetchCategories}
        >
          <TrendingUp size={18} />
          Refresh Data
        </button>
      </div>
    </div>
  )
}

export default CategoryHead