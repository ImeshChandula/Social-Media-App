import { useState, useEffect } from "react";
import { 
  FaUser, FaCalendarAlt, FaFilter, FaDownload, FaTrash, FaEye, 
  FaChartBar, FaSearch, FaSort, FaFileExport, FaClock, FaTimes 
} from "react-icons/fa";
import { IoStatsChart } from "react-icons/io5";
import { BsActivity } from "react-icons/bs";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import useAuthStore from "../store/authStore";

const ActivityManagement = () => {
  const { authUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all-activities');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  
  // Filters state
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    userId: '',
    category: '',
    activityType: '',
    startDate: '',
    endDate: '',
    sortOrder: 'desc',
    period: 'month'
  });
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 20,
    total: 0
  });
  
  const [activityTypes, setActivityTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  
  // User search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-search-container')) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchActivityTypes();
  }, []);

  // Fetch data when filters or tab changes
  useEffect(() => {
    if (activeTab === 'all-activities' || activeTab === 'user-activities') {
      fetchActivities();
    } else if (activeTab === 'stats') {
      fetchStats();
    }
  }, [filters, activeTab]);

  // Utility functions
  const buildQueryString = (params) => {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value && value !== '') urlParams.append(key, value);
    });
    return urlParams.toString() ? `?${urlParams.toString()}` : "";
  };

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // User search functions
  const searchUsers = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/users/admin/search?q=${encodeURIComponent(query)}&limit=10`);
      if (response.data.success) {
        setSearchResults(response.data.data || []);
        setShowSearchResults(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
        toast.error('No users found');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      if (error.response) {
        if (error.response.status === 403) {
          toast.error('You do not have permission to search users');
        } else if (error.response.status === 400) {
          toast.error('Invalid search query');
        } else {
          toast.error('Failed to search users. Please try again.');
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearchUsers = debounce(searchUsers, 300);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    debouncedSearchUsers(query);
  };

  const selectUser = (user) => {
    setFilters(prev => ({
      ...prev,
      userId: user.id,
      page: 1
    }));
    setSearchTerm(user.username);
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
    setFilters(prev => ({
      ...prev,
      userId: '',
      page: 1
    }));
  };

  // Data fetching functions
  const fetchActivityTypes = async () => {
    try {
      const response = await axiosInstance.get('/activities/types');
      if (response.data.success) {
        setActivityTypes(response.data.data.activityTypes || []);
        setCategories(response.data.data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching activity types:', error);
      toast.error('Failed to fetch activity types');
    }
  };

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const queryParams = {
        page: filters.page,
        limit: filters.limit,
        sortOrder: filters.sortOrder
      };

      if (filters.userId) queryParams.userId = filters.userId;
      if (filters.category) queryParams.category = filters.category;
      if (filters.activityType) queryParams.activityType = filters.activityType;
      if (filters.startDate) queryParams.startDate = filters.startDate;
      if (filters.endDate) queryParams.endDate = filters.endDate;

      const queryString = buildQueryString(queryParams);
      
      let endpoint;
      if (activeTab === 'user-activities' && filters.userId) {
        endpoint = `/activities/admin/user/${filters.userId}${queryString}`;
      } else {
        endpoint = `/activities/admin/all-history${queryString}`;
      }
      
      console.log('Fetching activities from endpoint:', endpoint); // Debug log
      const response = await axiosInstance.get(endpoint);
      console.log('API response:', response.data); // Debug log

      if (response.data.success) {
        const activitiesData = response.data.data || [];
        const paginationData = response.data.pagination || {};
        setActivities(activitiesData);
        setPagination({
          currentPage: paginationData.currentPage || 1,
          totalPages: paginationData.totalPages || 1,
          limit: paginationData.limit || filters.limit,
          total: paginationData.total || activitiesData.length
        });
      } else {
        console.warn('API returned success: false', response.data.message); // Debug log
        setActivities([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          limit: filters.limit,
          total: 0
        });
        toast.error('No activities found for the selected criteria');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        limit: filters.limit,
        total: 0
      });
      toast.error(`Failed to fetch activities: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      let endpoint = `/activities/my-stats?period=${filters.period}`;
      if (filters.userId && authUser?.role === 'super_admin') {
        endpoint = `/activities/admin/user/${filters.userId}/stats?period=${filters.period}`;
      }

      console.log('Fetching stats from endpoint:', endpoint); // Debug log
      const response = await axiosInstance.get(endpoint);
      console.log('Stats API response:', response.data); // Debug log
      
      if (response.data.success) {
        setStats(response.data.data || {});
      } else {
        setStats({});
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({});
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const clearAllFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      userId: '',
      category: '',
      activityType: '',
      startDate: '',
      endDate: '',
      sortOrder: 'desc',
      period: 'month'
    });
    clearSearch();
  };

  const viewActivityDetails = async (activityId) => {
    try {
      const response = await axiosInstance.get(`/activities/${activityId}`);
      if (response.data.success) {
        setSelectedActivity(response.data.data);
        setShowActivityModal(true);
      }
    } catch (error) {
      console.error('Error fetching activity details:', error);
      toast.error('Failed to fetch activity details');
    }
  };

  const exportActivities = async (format = 'json') => {
    try {
      const response = await axiosInstance.get(`/activities/export?format=${format}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });

      const data = response.data;
      const blob = new Blob([format === 'csv' ? data : JSON.stringify(data, null, 2)], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `activities-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting activities:', error);
      toast.error('Failed to export data');
    }
  };

  const cleanupOldActivities = async () => {
    if (!window.confirm('Are you sure you want to delete activities older than 365 days? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await axiosInstance.delete('/activities/admin/cleanup', {
        data: { daysOld: 365 }
      });

      if (response.data.success) {
        toast.success(`Successfully deleted ${response.data.deletedCount} old activities`);
        fetchActivities();
      }
    } catch (error) {
      console.error('Error cleaning up activities:', error);
      toast.error('Failed to cleanup old activities');
    }
  };

  // Utility functions for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      'login': 'success',
      'logout': 'secondary',
      'post_create': 'primary',
      'post_update': 'info',
      'post_delete': 'danger',
      'comment_create': 'primary',
      'like': 'warning',
      'friend_request_send': 'info',
      'profile_update': 'success'
    };
    return colors[type] || 'secondary';
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return filters.userId || filters.category || filters.activityType || 
           filters.startDate || filters.endDate;
  };

  return (
    <div className="container-fluid p-4" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h3 mb-1 text-dark fw-bold">
                <BsActivity className="me-3 text-primary" />
                Activity Management
              </h1>
              <p className="text-muted mb-0">Monitor and analyze user activities across your platform</p>
            </div>
            {authUser?.role === 'super_admin' && (
              <div className="btn-group" role="group">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => exportActivities('json')}
                  title="Export as JSON"
                >
                  <FaFileExport className="me-2" />
                  Export JSON
                </button>
                <button
                  className="btn btn-outline-success"
                  onClick={() => exportActivities('csv')}
                  title="Export as CSV"
                >
                  <FaFileExport className="me-2" />
                  Export CSV
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={cleanupOldActivities}
                  title="Cleanup Old Activities"
                >
                  <FaTrash className="me-2" />
                  Cleanup
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-body p-0">
              <nav className="nav nav-pills nav-justified">
                <button
                  className={`nav-link py-3 px-4 ${activeTab === 'all-activities' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all-activities')}
                  style={{ 
                    borderRadius: 0, 
                    backgroundColor: activeTab === 'all-activities' ? '#0d6efd' : 'transparent',
                    color: activeTab === 'all-activities' ? 'white' : '#6c757d',
                    border: 'none'
                  }}
                >
                  <BsActivity className="me-2" />
                  All Activities
                  {hasActiveFilters() && <span className="badge bg-warning text-dark ms-2">Filtered</span>}
                </button>
                <button
                  className={`nav-link py-3 px-4 ${activeTab === 'user-activities' ? 'active' : ''}`}
                  onClick={() => setActiveTab('user-activities')}
                  style={{ 
                    borderRadius: 0,
                    backgroundColor: activeTab === 'user-activities' ? '#0d6efd' : 'transparent',
                    color: activeTab === 'user-activities' ? 'white' : '#6c757d',
                    border: 'none'
                  }}
                >
                  <FaUser className="me-2" />
                  User Activities
                  {filters.userId && <span className="badge bg-info ms-2">{searchTerm}</span>}
                </button>
                <button
                  className={`nav-link py-3 px-4 ${activeTab === 'stats' ? 'active' : ''}`}
                  onClick={() => setActiveTab('stats')}
                  style={{ 
                    borderRadius: 0,
                    backgroundColor: activeTab === 'stats' ? '#0d6efd' : 'transparent',
                    color: activeTab === 'stats' ? 'white' : '#6c757d',
                    border: 'none'
                  }}
                >
                  <IoStatsChart className="me-2" />
                  Statistics
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-bottom py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0 text-dark">
                  <FaFilter className="me-2 text-primary" />
                  Filters & Search
                </h5>
                {hasActiveFilters() && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={clearAllFilters}
                  >
                    <FaTimes className="me-1" />
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
            <div className="card-body">
              <div className="row g-3">
                {/* User Search */}
                <div className="col-xl-3 col-lg-4 col-md-6">
                  <label className="form-label fw-semibold text-dark">
                    <FaUser className="me-1 text-primary" />
                    Search User
                  </label>
                  <div className="user-search-container position-relative mb-2">
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaSearch className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search by username..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={clearSearch}
                          title="Clear search"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                    {showSearchResults && (
                      <div 
                        className="dropdown-menu show position-absolute w-100 mt-1 shadow-lg border-0" 
                        style={{ zIndex: 1000, maxHeight: '250px', overflowY: 'auto' }}
                      >
                        {searchResults.map((user) => (
                          <button
                            key={user.id}
                            type="button"
                            className="dropdown-item d-flex align-items-center py-2 px-3"
                            onClick={() => selectUser(user)}
                          >
                            <div className="me-3">
                              {user.profilePicture ? (
                                <img
                                  src={user.profilePicture}
                                  alt={user.username}
                                  className="rounded-circle"
                                  style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                />
                              ) : (
                                <div 
                                  className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                                  style={{ width: '32px', height: '32px', fontSize: '14px' }}
                                >
                                  {user.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex-grow-1">
                              <div className="fw-semibold text-dark">{user.username}</div>
                              <small className="text-muted">{user.email}</small>
                            </div>
                            <small className="text-muted">#{user.id}</small>
                          </button>
                        ))}
                        {searchResults.length === 0 && searchTerm && (
                          <div className="dropdown-item text-muted py-2 px-3">
                            No users found matching "{searchTerm}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {filters.userId && (
                    <div className="alert alert-info py-2 mb-2">
                      <div className="d-flex align-items-center">
                        <div className="me-2">
                          {searchResults.find(u => u.id === filters.userId)?.profilePicture ? (
                            <img
                              src={searchResults.find(u => u.id === filters.userId)?.profilePicture}
                              alt={searchResults.find(u => u.id === filters.userId)?.username}
                              className="rounded-circle"
                              style={{ width: '24px', height: '24px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div 
                              className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                              style={{ width: '24px', height: '24px', fontSize: '12px' }}
                            >
                              {searchTerm.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-semibold">{searchTerm}</div>
                          <small>ID: {filters.userId}</small>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Category Filter */}
                <div className="col-xl-2 col-lg-3 col-md-6">
                  <label className="form-label fw-semibold text-dark">Category</label>
                  <select
                    className="form-select"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Activity Type Filter */}
                <div className="col-xl-2 col-lg-3 col-md-6">
                  <label className="form-label fw-semibold text-dark">Activity Type</label>
                  <select
                    className="form-select"
                    value={filters.activityType}
                    onChange={(e) => handleFilterChange('activityType', e.target.value)}
                  >
                    <option value="">All Types</option>
                    {activityTypes.map(type => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Filters */}
                <div className="col-xl-2 col-lg-3 col-md-6">
                  <label className="form-label fw-semibold text-dark">
                    <FaCalendarAlt className="me-1 text-primary" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  />
                </div>

                <div className="col-xl-2 col-lg-3 col-md-6">
                  <label className="form-label fw-semibold text-dark">
                    <FaCalendarAlt className="me-1 text-primary" />
                    End Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={filters.endDate}
                    min={filters.startDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  />
                </div>

                {/* Sort and Period */}
                <div className="col-xl-1 col-lg-2 col-md-6">
                  <label className="form-label fw-semibold text-dark">
                    <FaSort className="me-1 text-primary" />
                    Sort
                  </label>
                  <select
                    className="form-select"
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  >
                    <option value="desc">Latest</option>
                    <option value="asc">Oldest</option>
                  </select>
                </div>

                {activeTab === 'stats' && (
                  <div className="col-xl-2 col-lg-3 col-md-6">
                    <label className="form-label fw-semibold text-dark">
                      <FaClock className="me-1 text-primary" />
                      Period
                    </label>
                    <select
                      className="form-select"
                      value={filters.period}
                      onChange={(e) => handleFilterChange('period', e.target.value)}
                    >
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters() && (
                <div className="row mt-3">
                  <div className="col-12">
                    <div className="bg-light rounded p-3">
                      <h6 className="text-muted mb-2">Active Filters:</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {filters.userId && (
                          <span className="badge bg-info fs-6 py-2 px-3">
                            <FaUser className="me-1" />
                            {searchTerm}
                            <button 
                              type="button" 
                              className="btn-close btn-close-white ms-2" 
                              style={{ fontSize: '10px' }}
                              onClick={clearSearch}
                            ></button>
                          </span>
                        )}
                        {filters.category && (
                          <span className="badge bg-success fs-6 py-2 px-3">
                            Category: {filters.category}
                            <button 
                              type="button" 
                              className="btn-close btn-close-white ms-2" 
                              style={{ fontSize: '10px' }}
                              onClick={() => handleFilterChange('category', '')}
                            ></button>
                          </span>
                        )}
                        {filters.activityType && (
                          <span className="badge bg-warning text-dark fs-6 py-2 px-3">
                            Type: {filters.activityType.replace(/_/g, ' ')}
                            <button 
                              type="button" 
                              className="btn-close ms-2" 
                              style={{ fontSize: '10px' }}
                              onClick={() => handleFilterChange('activityType', '')}
                            ></button>
                          </span>
                        )}
                        {filters.startDate && (
                          <span className="badge bg-secondary fs-6 py-2 px-3">
                            From: {filters.startDate}
                            <button 
                              type="button" 
                              className="btn-close btn-close-white ms-2" 
                              style={{ fontSize: '10px' }}
                              onClick={() => handleFilterChange('startDate', '')}
                            ></button>
                          </span>
                        )}
                        {filters.endDate && (
                          <span className="badge bg-secondary fs-6 py-2 px-3">
                            To: {filters.endDate}
                            <button 
                              type="button" 
                              className="btn-close btn-close-white ms-2" 
                              style={{ fontSize: '10px' }}
                              onClick={() => handleFilterChange('endDate', '')}
                            ></button>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {(activeTab === 'all-activities' || activeTab === 'user-activities') && (
        <div className="row">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-bottom d-flex justify-content-between align-items-center py-3">
                <div>
                  <h5 className="mb-1 text-dark">
                    {activeTab === 'all-activities' ? 'All Activities' : 'User Activities'}
                    {filters.userId && activeTab === 'user-activities' && (
                      <span className="text-muted ms-2">- {searchTerm}</span>
                    )}
                  </h5>
                  <small className="text-muted">
                    {pagination.total} total activities found
                  </small>
                </div>
                <div className="d-flex align-items-center gap-3">
                  {loading && (
                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  )}
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small">Show:</span>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: 'auto' }}
                      value={filters.limit}
                      onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-muted small">per page</span>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted mt-3">Loading activities...</p>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="mb-4">
                      <BsActivity size={64} className="text-muted" />
                    </div>
                    <h4 className="text-muted mb-3">No activities found</h4>
                    <p className="text-muted mb-4">
                      {hasActiveFilters() 
                        ? 'No activities match your current filter criteria. Try adjusting your filters.' 
                        : 'No activities have been recorded yet.'
                      }
                    </p>
                    {hasActiveFilters() && (
                      <button 
                        className="btn btn-primary"
                        onClick={clearAllFilters}
                      >
                        <FaTimes className="me-2" />
                        Clear All Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead style={{ backgroundColor: '#f8f9fa' }}>
                          <tr>
                            <th className="border-0 text-muted fw-semibold py-3 px-4" style={{ minWidth: '160px' }}>
                              <FaClock className="me-2" />
                              Date & Time
                            </th>
                            <th className="border-0 text-muted fw-semibold py-3 px-4" style={{ minWidth: '140px' }}>
                              <FaUser className="me-2" />
                              User
                            </th>
                            <th className="border-0 text-muted fw-semibold py-3 px-4" style={{ minWidth: '140px' }}>
                              <BsActivity className="me-2" />
                              Activity Type
                            </th>
                            <th className="border-0 text-muted fw-semibold py-3 px-4">
                              Description
                            </th>
                            <th className="border-0 text-muted fw-semibold py-3 px-4">
                              Category
                            </th>
                            <th className="border-0 text-muted fw-semibold py-3 px-4">
                              IP Address
                            </th>
                            <th className="border-0 text-muted fw-semibold py-3 px-4" width="80">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {activities.map((activity, index) => (
                            <tr key={activity.id} style={{ borderLeft: `4px solid ${index % 2 === 0 ? '#e9ecef' : 'transparent'}` }}>
                              <td className="py-3 px-4">
                                <div className="small text-dark fw-medium">
                                  {new Date(activity.createdAt).toLocaleDateString()}
                                </div>
                                <div className="small text-muted">
                                  {new Date(activity.createdAt).toLocaleTimeString()}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {activity.user ? (
                                  <div className="d-flex align-items-center">
                                    <div className="me-2">
                                      {activity.user.profilePicture ? (
                                        <img
                                          src={activity.user.profilePicture}
                                          alt={activity.user.username}
                                          className="rounded-circle"
                                          style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                        />
                                      ) : (
                                        <div 
                                          className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                                          style={{ width: '32px', height: '32px', fontSize: '14px' }}
                                        >
                                          {activity.user.username.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <div className="fw-semibold text-dark">{activity.user.username}</div>
                                      <small className="text-muted">{activity.user.email}</small>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-muted fst-italic">Unknown User</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`badge bg-${getActivityTypeColor(activity.activityType)} px-3 py-2`}>
                                  {activity.activityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div 
                                  style={{ maxWidth: '300px' }} 
                                  className="text-dark"
                                  title={activity.description}
                                >
                                  {activity.description.length > 100 
                                    ? `${activity.description.substring(0, 100)}...` 
                                    : activity.description
                                  }
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {activity.category ? (
                                  <span className="badge bg-light text-dark border px-2 py-1">
                                    {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)}
                                  </span>
                                ) : (
                                  <span className="text-muted small">N/A</span>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <code className="small text-muted">
                                  {activity.ipAddress || 'N/A'}
                                </code>
                              </td>
                              <td className="py-3 px-4">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => viewActivityDetails(activity.id)}
                                  title="View Details"
                                >
                                  <FaEye />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="card-footer bg-white border-top">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="text-muted small">
                            Showing {Math.min((pagination.currentPage - 1) * pagination.limit + 1, pagination.total)} to{' '}
                            {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of{' '}
                            {pagination.total} entries
                          </div>
                          <nav aria-label="Activity pagination">
                            <ul className="pagination pagination-sm mb-0">
                              <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => handlePageChange(1)}
                                  disabled={pagination.currentPage === 1}
                                >
                                  First
                                </button>
                              </li>
                              <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                                  disabled={pagination.currentPage === 1}
                                >
                                  Previous
                                </button>
                              </li>
                              {(() => {
                                const pages = [];
                                const start = Math.max(1, pagination.currentPage - 2);
                                const end = Math.min(pagination.totalPages, pagination.currentPage + 2);
                                
                                for (let i = start; i <= end; i++) {
                                  pages.push(
                                    <li key={i} className={`page-item ${pagination.currentPage === i ? 'active' : ''}`}>
                                      <button
                                        className="page-link"
                                        onClick={() => handlePageChange(i)}
                                      >
                                        {i}
                                      </button>
                                    </li>
                                  );
                                }
                                return pages;
                              })()}
                              <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                                  disabled={pagination.currentPage === pagination.totalPages}
                                >
                                  Next
                                </button>
                              </li>
                              <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => handlePageChange(pagination.totalPages)}
                                  disabled={pagination.currentPage === pagination.totalPages}
                                >
                                  Last
                                </button>
                              </li>
                            </ul>
                          </nav>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="row">
          {loading ? (
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mt-3">Loading statistics...</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Main Stats Cards */}
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="card h-100 shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <div className="card-body text-center text-white">
                    <div className="mb-3">
                      <FaChartBar size={40} />
                    </div>
                    <h2 className="fw-bold mb-1">{stats.totalActivities || 0}</h2>
                    <h6 className="mb-0 opacity-75">Total Activities</h6>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="card h-100 shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                  <div className="card-body text-center text-white">
                    <div className="mb-3">
                      <FaUser size={40} />
                    </div>
                    <h2 className="fw-bold mb-1">{stats.uniqueUsers || 0}</h2>
                    <h6 className="mb-0 opacity-75">Unique Users</h6>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="card h-100 shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                  <div className="card-body text-center text-white">
                    <div className="mb-3">
                      <FaCalendarAlt size={40} />
                    </div>
                    <h2 className="fw-bold mb-1">{stats.mostActiveDay || 'N/A'}</h2>
                    <h6 className="mb-0 opacity-75">Most Active Day</h6>
                  </div>
                </div>
              </div>
              
              <div className="col-lg-3 col-md-6 mb-4">
                <div className="card h-100 shadow-sm border-0" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                  <div className="card-body text-center text-white">
                    <div className="mb-3">
                      <BsActivity size={40} />
                    </div>
                    <h2 className="fw-bold mb-1">{stats.mostCommonType ? stats.mostCommonType.replace(/_/g, ' ') : 'N/A'}</h2>
                    <h6 className="mb-0 opacity-75">Most Common Type</h6>
                  </div>
                </div>
              </div>

              {/* Categories Breakdown */}
              {stats.byCategory && Object.keys(stats.byCategory).length > 0 && (
                <div className="col-12 mb-4">
                  <div className="card shadow-sm border-0">
                    <div className="card-header bg-white border-bottom py-3">
                      <h5 className="mb-0 text-dark">
                        <IoStatsChart className="me-2 text-primary" />
                        Activities by Category
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        {Object.entries(stats.byCategory).map(([category, count]) => (
                          <div key={category} className="col-lg-3 col-md-4 col-sm-6">
                            <div className="card border-0 bg-light h-100">
                              <div className="card-body text-center">
                                <h4 className="text-primary fw-bold">{count}</h4>
                                <h6 className="text-dark mb-0">
                                  {category.charAt(0).toUpperCase() + category.slice(1)}
                                </h6>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity Types Breakdown */}
              {stats.byType && Object.keys(stats.byType).length > 0 && (
                <div className="col-12 mb-4">
                  <div className="card shadow-sm border-0">
                    <div className="card-header bg-white border-bottom py-3">
                      <h5 className="mb-0 text-dark">
                        <BsActivity className="me-2 text-primary" />
                        Activities by Type
                      </h5>
                    </div>
                    <div className="card-body">
                      <div className="row g-3">
                        {Object.entries(stats.byType).map(([type, count]) => (
                          <div key={type} className="col-lg-3 col-md-4 col-sm-6">
                            <div className="card border-0 bg-light h-100">
                              <div className="card-body text-center">
                                <span className={`badge bg-${getActivityTypeColor(type)} mb-2 px-3 py-2`}>
                                  {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                <h4 className="text-dark fw-bold mb-0">{count}</h4>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty State for Stats */}
              {(!stats.totalActivities || stats.totalActivities === 0) && (
                <div className="col-12">
                  <div className="card shadow-sm border-0">
                    <div className="card-body text-center py-5">
                      <div className="mb-4">
                        <IoStatsChart size={64} className="text-muted" />
                      </div>
                      <h4 className="text-muted mb-3">No statistics available</h4>
                      <p className="text-muted mb-4">
                        No activity data found for the selected period
                        {filters.userId && ` for user ${searchTerm}`}.
                      </p>
                      <p className="text-muted small">
                        Try selecting a different time period or clearing your filters.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Activity Detail Modal */}
      {showActivityModal && selectedActivity && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white border-0">
                <h5 className="modal-title fw-bold">
                  <FaEye className="me-2" />
                  Activity Details
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowActivityModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="border-start border-primary border-4 ps-3">
                      <label className="text-muted small fw-bold mb-1">ACTIVITY TYPE</label>
                      <div>
                        <span className={`badge bg-${getActivityTypeColor(selectedActivity.activityType)} fs-6 px-3 py-2`}>
                          {selectedActivity.activityType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="border-start border-info border-4 ps-3">
                      <label className="text-muted small fw-bold mb-1">DATE & TIME</label>
                      <div className="fw-semibold text-dark">
                        {formatDate(selectedActivity.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="border-start border-success border-4 ps-3">
                      <label className="text-muted small fw-bold mb-2">DESCRIPTION</label>
                      <div className="bg-light rounded p-3">
                        <p className="mb-0 text-dark">{selectedActivity.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border-start border-warning border-4 ps-3">
                      <label className="text-muted small fw-bold mb-1">CATEGORY</label>
                      <div>
                        {selectedActivity.category ? (
                          <span className="badge bg-light text-dark border px-3 py-2">
                            {selectedActivity.category}
                          </span>
                        ) : (
                          <span className="text-muted fst-italic">No category</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border-start border-danger border-4 ps-3">
                      <label className="text-muted small fw-bold mb-1">IP ADDRESS</label>
                      <div>
                        <code className="bg-light px-2 py-1 rounded">
                          {selectedActivity.ipAddress || 'Unknown'}
                        </code>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="border-start border-secondary border-4 ps-3">
                      <label className="text-muted small fw-bold mb-1">ACTIVITY ID</label>
                      <div>
                        <code className="bg-light px-2 py-1 rounded">
                          #{selectedActivity.id}
                        </code>
                      </div>
                    </div>
                  </div>
                  {selectedActivity.user && (
                    <div className="col-12">
                      <div className="border-start border-info border-4 ps-3">
                        <label className="text-muted small fw-bold mb-2">USER INFORMATION</label>
                        <div className="bg-light rounded p-3">
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              {selectedActivity.user.profilePicture ? (
                                <img
                                  src={selectedActivity.user.profilePicture}
                                  alt={selectedActivity.user.username}
                                  className="rounded-circle"
                                  style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                                />
                              ) : (
                                <div 
                                  className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                                  style={{ width: '48px', height: '48px', fontSize: '18px' }}
                                >
                                  {selectedActivity.user.username.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <h6 className="fw-bold text-dark mb-1">{selectedActivity.user.username}</h6>
                              <p className="text-muted mb-1">{selectedActivity.user.email}</p>
                              <small className="text-muted">User ID: {selectedActivity.user.id}</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedActivity.metadata && Object.keys(selectedActivity.metadata).length > 0 && (
                    <div className="col-12">
                      <div className="border-start border-dark border-4 ps-3">
                        <label className="text-muted small fw-bold mb-2">ADDITIONAL METADATA</label>
                        <div className="bg-dark rounded p-3">
                          <pre className="text-light mb-0 small" style={{ maxHeight: '200px', overflow: 'auto' }}>
                            {JSON.stringify(selectedActivity.metadata, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer bg-light border-0">
                <button
                  type="button"
                  className="btn btn-secondary px-4"
                  onClick={() => setShowActivityModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityManagement;