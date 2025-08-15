import { useState, useEffect } from "react";
import { 
  FaUser, FaCalendarAlt, FaFilter, FaDownload, FaTrash, FaEye, 
  FaChartBar, FaSearch, FaSort, FaFileExport, FaClock 
} from "react-icons/fa";
import { IoStatsChart } from "react-icons/io5";
import { BsActivity } from "react-icons/bs";
import useAuthStore from "../store/authStore";

const ActivityManagement = () => {
  const { authUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('all-activities');
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
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
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Fetch activity types and categories on component mount
  useEffect(() => {
    fetchActivityTypes();
  }, []);

  // Fetch data when filters change
  useEffect(() => {
    if (activeTab === 'all-activities') {
      fetchAllActivities();
    } else if (activeTab === 'user-activities' && selectedUser) {
      fetchUserActivities(selectedUser);
    } else if (activeTab === 'stats') {
      fetchStats();
    }
  }, [filters, activeTab, selectedUser]);

  const fetchActivityTypes = async () => {
    try {
      const response = await fetch(`/activities/types?_t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      if (response.status === 304) {
        console.warn('Received 304 for fetchActivityTypes, expected 200');
      }
      const data = await response.json();
      if (data.success) {
        setActivityTypes(data.data.activityTypes || []);
        setCategories(data.data.categories || []);
      } else {
        setActivityTypes([]);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching activity types:', error);
      setActivityTypes([]);
      setCategories([]);
    }
  };

  const fetchAllActivities = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        sortOrder: filters.sortOrder,
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.category && { category: filters.category }),
        ...(filters.activityType && { activityType: filters.activityType }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        _t: Date.now()
      });

      const response = await fetch(`/activities/admin/all-history?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (response.status === 304) {
        console.warn('Received 304 for fetchAllActivities, expected 200');
      }
      const data = await response.json();
      if (data.success) {
        setActivities(data.data || []);
        setPagination({
          currentPage: data.pagination?.currentPage || 1,
          totalPages: data.pagination?.totalPages || 1,
          limit: data.pagination?.limit || filters.limit,
          total: data.pagination?.total || 0
        });
      } else {
        setActivities([]);
        setPagination({ currentPage: 1, totalPages: 1, limit: filters.limit, total: 0 });
      }
    } catch (error) {
      console.error('Error fetching all activities:', error);
      setActivities([]);
      setPagination({ currentPage: 1, totalPages: 1, limit: filters.limit, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserActivities = async (userId) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: filters.page,
        limit: filters.limit,
        sortOrder: filters.sortOrder,
        ...(filters.category && { category: filters.category }),
        ...(filters.activityType && { activityType: filters.activityType }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        _t: Date.now()
      });

      const response = await fetch(`/activities/admin/user/${userId}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (response.status === 304) {
        console.warn('Received 304 for fetchUserActivities, expected 200');
      }
      const data = await response.json();
      if (data.success) {
        setActivities(data.data || []);
        setPagination({
          currentPage: data.pagination?.currentPage || 1,
          totalPages: data.pagination?.totalPages || 1,
          limit: data.pagination?.limit || filters.limit,
          total: data.pagination?.total || 0
        });
      } else {
        setActivities([]);
        setPagination({ currentPage: 1, totalPages: 1, limit: filters.limit, total: 0 });
      }
    } catch (error) {
      console.error('Error fetching user activities:', error);
      setActivities([]);
      setPagination({ currentPage: 1, totalPages: 1, limit: filters.limit, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      let endpoint = `/activities/my-stats?period=${filters.period}&_t=${Date.now()}`;
      if (selectedUser) {
        endpoint = `/activities/admin/user/${selectedUser}/stats?period=${filters.period}&_t=${Date.now()}`;
      }

      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (response.status === 304) {
        console.warn('Received 304 for fetchStats, expected 200');
      }
      const data = await response.json();
      if (data.success) {
        setStats(data.data || {});
      } else {
        setStats({});
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const viewActivityDetails = async (activityId) => {
    try {
      const response = await fetch(`/activities/${activityId}?_t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (response.status === 304) {
        console.warn('Received 304 for viewActivityDetails, expected 200');
      }
      const data = await response.json();
      if (data.success) {
        setSelectedActivity(data.data);
        setShowActivityModal(true);
      }
    } catch (error) {
      console.error('Error fetching activity details:', error);
    }
  };

  const exportActivities = async (format = 'json') => {
    try {
      const response = await fetch(`/activities/export?format=${format}&_t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });

      if (response.status === 304) {
        console.warn('Received 304 for exportActivities, expected 200');
      }
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activities-export.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting activities:', error);
    }
  };

  const cleanupOldActivities = async () => {
    if (!window.confirm('Are you sure you want to delete activities older than 365 days? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/activities/admin/cleanup?_t=${Date.now()}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ daysOld: 365 })
      });

      if (response.status === 304) {
        console.warn('Received 304 for cleanupOldActivities, expected 200');
      }
      const data = await response.json();
      if (data.success) {
        alert(`Successfully deleted ${data.deletedCount} old activities`);
        fetchAllActivities(); // Refresh the list
      }
    } catch (error) {
      console.error('Error cleaning up activities:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (newPage) => {
    // Ensure newPage is within valid bounds
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };

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

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 mb-0">
          <BsActivity className="me-2" />
          Activity Management
        </h2>
        {authUser?.role === 'super_admin' && (
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => exportActivities('json')}
              title="Export as JSON"
            >
              <FaFileExport className="me-1" />
              JSON
            </button>
            <button
              className="btn btn-outline-success btn-sm"
              onClick={() => exportActivities('csv')}
              title="Export as CSV"
            >
              <FaFileExport className="me-1" />
              CSV
            </button>
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={cleanupOldActivities}
              title="Cleanup Old Activities"
            >
              <FaTrash className="me-1" />
              Cleanup
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'all-activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('all-activities')}
          >
            <BsActivity className="me-2" />
            All Activities
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'user-activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('user-activities')}
          >
            <FaUser className="me-2" />
            User Activities
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <IoStatsChart className="me-2" />
            Statistics
          </button>
        </li>
      </ul>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            {activeTab === 'user-activities' && (
              <div className="col-md-3">
                <label className="form-label">User ID</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter user ID"
                  value={selectedUser || ''}
                  onChange={(e) => setSelectedUser(e.target.value)}
                />
              </div>
            )}
            
            <div className="col-md-2">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label">Activity Type</label>
              <select
                className="form-select"
                value={filters.activityType}
                onChange={(e) => handleFilterChange('activityType', e.target.value)}
              >
                <option value="">All Types</option>
                {activityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            <div className="col-md-1">
              <label className="form-label">Sort</label>
              <select
                className="form-select"
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              >
                <option value="desc">Newest</option>
                <option value="asc">Oldest</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {(activeTab === 'all-activities' || activeTab === 'user-activities') && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              {activeTab === 'all-activities' ? 'All Activities' : 'User Activities'}
            </h5>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted">
                {pagination.total || 0} total activities
              </span>
            </div>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Date/Time</th>
                        <th>User</th>
                        <th>Activity Type</th>
                        <th>Description</th>
                        <th>Category</th>
                        <th>IP Address</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((activity) => (
                        <tr key={activity.id}>
                          <td>
                            <small>{formatDate(activity.createdAt)}</small>
                          </td>
                          <td>
                            {activity.user ? (
                              <div>
                                <strong>{activity.user.username}</strong>
                                <br />
                                <small className="text-muted">{activity.user.email}</small>
                              </div>
                            ) : (
                              <span className="text-muted">Unknown User</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge bg-${getActivityTypeColor(activity.activityType)}`}>
                              {activity.activityType}
                            </span>
                          </td>
                          <td>
                            <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {activity.description}
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              {activity.category || 'N/A'}
                            </span>
                          </td>
                          <td>
                            <small>{activity.ipAddress || 'N/A'}</small>
                          </td>
                          <td>
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
                {pagination.totalPages > 1 && pagination.currentPage && (
                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div>
                      Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of{' '}
                      {pagination.total} entries
                    </div>
                    <nav>
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                          >
                            Previous
                          </button>
                        </li>
                        {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                          const page = pagination.currentPage - 2 + i;
                          if (page < 1 || page > pagination.totalPages) return null;
                          return (
                            <li key={page} className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </button>
                            </li>
                          );
                        })}
                        <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                          >
                            Next
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div className="row">
          <div className="col-12 mb-3">
            <div className="card">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label">Period</label>
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
                  {authUser?.role === 'super_admin' && (
                    <div className="col-md-3">
                      <label className="form-label">User ID (Optional)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Leave empty for all users"
                        value={selectedUser || ''}
                        onChange={(e) => setSelectedUser(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="col-12 text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title text-primary">Total Activities</h5>
                    <h2 className="text-primary">{stats.totalActivities || 0}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title text-success">Unique Users</h5>
                    <h2 className="text-success">{stats.uniqueUsers || 0}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title text-warning">Most Active Day</h5>
                    <h2 className="text-warning">{stats.mostActiveDay || 'N/A'}</h2>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <h5 className="card-title text-info">Most Common Type</h5>
                    <h2 className="text-info">{stats.mostCommonType || 'N/A'}</h2>
                  </div>
                </div>
              </div>

              {stats.byCategory && (
                <div className="col-12 mt-4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="mb-0">Activities by Category</h5>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        {Object.entries(stats.byCategory).map(([category, count]) => (
                          <div key={category} className="col-md-4 mb-3">
                            <div className="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                              <span className="fw-medium">{category}</span>
                              <span className="badge bg-primary">{count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
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
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Activity Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowActivityModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <strong>Activity Type:</strong>
                    <br />
                    <span className={`badge bg-${getActivityTypeColor(selectedActivity.activityType)}`}>
                      {selectedActivity.activityType}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <strong>Date/Time:</strong>
                    <br />
                    {formatDate(selectedActivity.createdAt)}
                  </div>
                  <div className="col-12">
                    <strong>Description:</strong>
                    <br />
                    {selectedActivity.description}
                  </div>
                  <div className="col-md-6">
                    <strong>Category:</strong>
                    <br />
                    {selectedActivity.category || 'N/A'}
                  </div>
                  <div className="col-md-6">
                    <strong>IP Address:</strong>
                    <br />
                    {selectedActivity.ipAddress || 'N/A'}
                  </div>
                  <div className="col-md-6">
                    <strong>Device Type:</strong>
                    <br />
                    {selectedActivity.deviceType || 'N/A'}
                  </div>
                  <div className="col-md-6">
                    <strong>Browser:</strong>
                    <br />
                    {selectedActivity.browserInfo || 'N/A'}
                  </div>
                  {selectedActivity.metadata && (
                    <div className="col-12">
                      <strong>Additional Data:</strong>
                      <br />
                      <pre className="bg-light p-2 rounded">
                        {JSON.stringify(selectedActivity.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
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