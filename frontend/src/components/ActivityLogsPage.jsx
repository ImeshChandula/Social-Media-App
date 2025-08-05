import React, { useEffect, useState, useMemo } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

// --- Theme & Styles ---
const theme = {
  colors: {
    primary: "#4f46e5",
    primaryHover: "#4338ca",
    secondary: "#059669",
    secondaryHover: "#047857",
    danger: "#dc2626",
    dangerHover: "#b91c1c",
    warning: "#d97706",
    warningHover: "#b45309",
    text: "#111827",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
    background: "#f9fafb",
    cardBg: "#ffffff",
    disabled: "#d1d5db",
    disabledText: "#9ca3af",
    success: "#10b981",
    info: "#3b82f6",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  borderRadius: "12px",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)",
  fontFamily: "'Inter', sans-serif",
};

const styles = {
  container: {
    fontFamily: theme.fontFamily,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    maxWidth: "1400px",
    margin: "0 auto",
    padding: theme.spacing.xl,
  },
  header: {
    textAlign: "center",
    fontSize: "2.5rem",
    fontWeight: "700",
    paddingBottom: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  tabContainer: {
    display: "flex",
    borderBottom: `2px solid ${theme.colors.border}`,
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.xs,
  },
  tab: {
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    border: "none",
    backgroundColor: "transparent",
    color: theme.colors.textSecondary,
    fontWeight: "600",
    fontSize: "1rem",
    cursor: "pointer",
    borderBottom: "3px solid transparent",
    transition: "all 0.2s ease",
  },
  tabActive: {
    color: theme.colors.primary,
    borderBottomColor: theme.colors.primary,
  },
  card: {
    backgroundColor: theme.colors.cardBg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius,
    boxShadow: theme.boxShadow,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    marginBottom: theme.spacing.md,
    display: "flex",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  emptyState: {
    textAlign: "center",
    padding: `${theme.spacing.xl} ${theme.spacing.md}`,
    color: theme.colors.textSecondary,
  },
  controlsRow: {
    display: "flex",
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    flexWrap: "wrap",
    alignItems: "center",
  },
  input: {
    padding: "10px 12px",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: "8px",
    fontSize: "0.875rem",
    minWidth: "120px",
  },
  select: {
    padding: "10px 12px",
    border: `1px solid ${theme.colors.border}`,
    borderRadius: "8px",
    fontSize: "0.875rem",
    backgroundColor: theme.colors.cardBg,
    minWidth: "150px",
  },
  button: {
    base: {
      padding: "10px 16px",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "0.875rem",
      fontWeight: "600",
      transition: "all 0.2s ease",
      display: "inline-flex",
      alignItems: "center",
      gap: theme.spacing.xs,
    },
    primary: {
      backgroundColor: theme.colors.primary,
      color: "white",
    },
    secondary: {
      backgroundColor: theme.colors.secondary,
      color: "white",
    },
    danger: {
      backgroundColor: theme.colors.danger,
      color: "white",
    },
    warning: {
      backgroundColor: theme.colors.warning,
      color: "white",
    },
    outline: {
      backgroundColor: "transparent",
      color: theme.colors.text,
      border: `1px solid ${theme.colors.border}`,
    },
  },
  historyItem: {
    base: {
      display: "flex",
      gap: theme.spacing.md,
      padding: `${theme.spacing.md} ${theme.spacing.sm}`,
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    last: {
      borderBottom: "none",
    },
    icon: {
      color: theme.colors.primary,
      marginTop: "2px",
    },
    content: {
      display: "flex",
      flexDirection: "column",
      gap: theme.spacing.xs,
      width: "100%",
    },
    description: { fontWeight: "500" },
    meta: {
      color: theme.colors.textSecondary,
      fontSize: "0.875rem",
    },
  },
  renderData: {
    list: { listStyle: "none", padding: 0, margin: 0 },
    item: {
      display: "grid",
      gridTemplateColumns: "180px 1fr",
      gap: theme.spacing.md,
      padding: `${theme.spacing.sm} 0`,
      borderBottom: `1px solid ${theme.colors.border}`,
    },
    key: { fontWeight: "600" },
    value: { wordBreak: "break-word" },
    nested: {
      marginTop: theme.spacing.sm,
      borderLeft: `2px solid ${theme.colors.border}`,
      paddingLeft: theme.spacing.md,
    },
  },
  pagination: {
    container: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    button: {
      padding: "10px 16px",
      border: `1px solid ${theme.colors.border}`,
      backgroundColor: theme.colors.cardBg,
      color: theme.colors.text,
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "0.875rem",
      fontWeight: "500",
    },
    buttonDisabled: {
      backgroundColor: theme.colors.disabled,
      color: theme.colors.disabledText,
      cursor: "not-allowed",
    },
    pageInfo: {
      fontSize: "0.875rem",
      color: theme.colors.textSecondary,
    },
  },
  skeleton: {
    base: {
      backgroundColor: "#e5e7eb",
      borderRadius: "4px",
      animation: "pulse 1.5s ease-in-out infinite",
    },
    title: { width: "40%", height: "24px", marginBottom: theme.spacing.md },
    line: { width: "100%", height: "16px", marginBottom: theme.spacing.sm },
    lineShort: { width: "60%", height: "16px", marginBottom: theme.spacing.sm },
  },
  adminPanel: {
    backgroundColor: "#fef3c7",
    border: "1px solid #f59e0b",
    borderRadius: theme.borderRadius,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  adminTitle: {
    color: "#92400e",
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
};

// --- Icons ---
const ActivityIcon = () => <span role="img" aria-label="activity">📋</span>;
const StatsIcon = () => <span role="img" aria-label="stats">📊</span>;
const TypesIcon = () => <span role="img" aria-label="types">🗂️</span>;
const AdminIcon = () => <span role="img" aria-label="admin">⚙️</span>;
const ExportIcon = () => <span role="img" aria-label="export">📤</span>;
const SearchIcon = () => <span role="img" aria-label="search">🔍</span>;
const CleanupIcon = () => <span role="img" aria-label="cleanup">🧹</span>;

// --- Components ---
const Card = ({ title, icon, children, className = "" }) => (
  <div style={{ ...styles.card, className }}>
    <h3 style={styles.sectionTitle}>{icon} {title}</h3>
    {children}
  </div>
);

const TabButton = ({ active, onClick, children }) => (
  <button
    style={{
      ...styles.tab,
      ...(active ? styles.tabActive : {}),
    }}
    onClick={onClick}
  >
    {children}
  </button>
);

const Button = ({ variant = "primary", onClick, disabled, children, ...props }) => (
  <button
    style={{
      ...styles.button.base,
      ...styles.button[variant],
      ...(disabled ? { opacity: 0.6, cursor: "not-allowed" } : {}),
    }}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

const ActivityHistoryItem = ({ activity, isLast, showUser = false }) => (
  <li style={{ ...styles.historyItem.base, ...(isLast ? styles.historyItem.last : {}) }}>
    <div style={styles.historyItem.icon}><ActivityIcon /></div>
    <div style={styles.historyItem.content}>
      <span style={styles.historyItem.description}>
        {activity.activityType || "Unknown Type"} — {activity.description || "No description"}
      </span>
      <small style={styles.historyItem.meta}>
        {new Date(activity.createdAt).toLocaleString()} | Category: {activity.category || "N/A"}
        {showUser && activity.user && (
          <> | User: {activity.user.username} ({activity.user.firstName} {activity.user.lastName})</>
        )}
      </small>
    </div>
  </li>
);

const Pagination = ({ pagination, onPageChange, currentPage }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <nav style={styles.pagination.container}>
      <button
        style={{
          ...styles.pagination.button,
          ...(currentPage === 1 ? styles.pagination.buttonDisabled : {}),
        }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← Previous
      </button>
      <span style={styles.pagination.pageInfo}>
        Page {pagination.currentPage} of {pagination.totalPages}
      </span>
      <button
        style={{
          ...styles.pagination.button,
          ...(currentPage === pagination.totalPages ? styles.pagination.buttonDisabled : {}),
        }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === pagination.totalPages}
      >
        Next →
      </button>
    </nav>
  );
};

const RenderData = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return <p style={styles.emptyState}>Not available</p>;
  }

  const cleanKey = (key) => {
    const noNumbers = key.replace(/[0-9]/g, "");
    const readable = noNumbers.replace(/_/g, " ").trim();
    return readable.charAt(0).toUpperCase() + readable.slice(1);
  };

  const renderValue = (value) => {
    if (typeof value !== "object" || value === null) {
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
        return new Date(value).toLocaleString();
      }
      return String(value);
    }
    return <div style={styles.renderData.nested}><RenderData data={value} /></div>;
  };

  return (
    <ul style={styles.renderData.list}>
      {Object.entries(data).map(([key, value], index, arr) => (
        <li key={key} style={{ ...styles.renderData.item, ...(index === arr.length - 1 ? { borderBottom: "none" } : {}) }}>
          <span style={styles.renderData.key}>{cleanKey(key)}</span>
          <div style={styles.renderData.value}>{renderValue(value)}</div>
        </li>
      ))}
    </ul>
  );
};

const SkeletonLoader = () => (
  <>
    <div style={styles.card}>
      <div style={{ ...styles.skeleton.base, ...styles.skeleton.title }} />
      <div style={{ ...styles.skeleton.base, ...styles.skeleton.line }} />
      <div style={{ ...styles.skeleton.base, ...styles.skeleton.lineShort }} />
    </div>
    <div style={styles.card}>
      <div style={{ ...styles.skeleton.base, ...styles.skeleton.title }} />
      <div style={{ ...styles.skeleton.base, ...styles.skeleton.line }} />
    </div>
  </>
);

// --- Hooks ---
const useActivityData = (currentPage, filters, activeTab) => {
  const [data, setData] = useState({ 
    history: [], 
    stats: null, 
    types: null, 
    pagination: null,
    allHistory: [],
    userStats: null,
    specificActivity: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      setLoading(true);
      try {
        const requests = [];
        
        if (activeTab === 'my-activity') {
          requests.push(axiosInstance.get(`/activities/my-history?page=${currentPage}&limit=10${buildQueryString(filters)}`));
          if (currentPage === 1) {
            requests.push(axiosInstance.get("/activities/my-stats"));
            requests.push(axiosInstance.get("/activities/types"));
          }
        } else if (activeTab === 'all-activities') {
          requests.push(axiosInstance.get(`/activities/admin/all-history?page=${currentPage}&limit=10${buildQueryString(filters)}`));
        } else if (activeTab === 'user-activity' && filters.userId) {
          requests.push(axiosInstance.get(`/activities/admin/user/${filters.userId}?page=${currentPage}&limit=10${buildQueryString(filters)}`));
        }

        const responses = await Promise.all(requests);
        
        setData(prev => ({
          ...prev,
          history: activeTab === 'my-activity' ? (responses[0]?.data?.data || []) : prev.history,
          allHistory: activeTab === 'all-activities' ? (responses[0]?.data?.data || []) : prev.allHistory,
          pagination: responses[0]?.data?.pagination || null,
          stats: responses[1]?.data?.data || prev.stats,
          types: responses[2]?.data?.data || prev.types,
        }));
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch activity data.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchActivityData();
  }, [currentPage, filters, activeTab]);

  return { ...data, loading };
};

const buildQueryString = (filters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  return params.toString() ? `&${params.toString()}` : '';
};

// --- Main Component ---
const ActivityLogsPage = () => {
  const [activeTab, setActiveTab] = useState('my-activity');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    activityType: '',
    startDate: '',
    endDate: '',
    userId: '',
    period: 'month'
  });
  const [userRole, setUserRole] = useState('user'); // This should come from your auth context
  const [selectedUser, setSelectedUser] = useState('');

  const { history, allHistory, stats, types, pagination, loading } = useActivityData(currentPage, filters, activeTab);

  // Reset page when changing tabs or filters
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExportData = async (format = 'json') => {
    try {
      const response = await axiosInstance.get(`/activities/export?format=${format}`, {
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      const blob = new Blob([format === 'csv' ? response.data : JSON.stringify(response.data, null, 2)], {
        type: format === 'csv' ? 'text/csv' : 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `activity-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    }
  };

  const handleCleanupActivities = async () => {
    if (!window.confirm('Are you sure you want to cleanup old activities? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await axiosInstance.delete('/activities/admin/cleanup', {
        data: { daysOld: 365 }
      });
      toast.success(`Successfully deleted ${response.data.deletedCount} old activities`);
    } catch (error) {
      console.error('Cleanup error:', error);
      toast.error('Failed to cleanup activities');
    }
  };

  const fetchUserActivity = async () => {
    if (!selectedUser) {
      toast.error('Please enter a user ID');
      return;
    }
    
    try {
      const response = await axiosInstance.get(`/activities/admin/user/${selectedUser}`);
      // Handle user-specific activity data
      toast.success('User activity loaded');
    } catch (error) {
      console.error('User activity error:', error);
      toast.error('Failed to fetch user activity');
    }
  };

  const memoStats = useMemo(() => stats ? <RenderData data={stats} /> : <p style={styles.emptyState}>No stats available</p>, [stats]);
  const memoTypes = useMemo(() => types ? <RenderData data={types} /> : <p style={styles.emptyState}>No type data available</p>, [types]);

  if (loading && currentPage === 1) {
    return (
      <div style={styles.container}>
        <h2 style={styles.header}>Activity Logs</h2>
        <SkeletonLoader />
      </div>
    );
  }

  const currentHistory = activeTab === 'my-activity' ? history : allHistory;

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Activity Logs</h2>

      {/* Tab Navigation */}
      <div style={styles.tabContainer}>
        <TabButton
          active={activeTab === 'my-activity'}
          onClick={() => setActiveTab('my-activity')}
        >
          <ActivityIcon /> My Activity
        </TabButton>
        {userRole === 'super_admin' && (
          <>
            <TabButton
              active={activeTab === 'all-activities'}
              onClick={() => setActiveTab('all-activities')}
            >
              <AdminIcon /> All Activities
            </TabButton>
            <TabButton
              active={activeTab === 'admin-tools'}
              onClick={() => setActiveTab('admin-tools')}
            >
              <SearchIcon /> Admin Tools
            </TabButton>
          </>
        )}
      </div>

      {/* Filters */}
      <Card title="Filters & Controls" icon={<SearchIcon />}>
        <div style={styles.controlsRow}>
          <select
            style={styles.select}
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="authentication">Authentication</option>
            <option value="content">Content</option>
            <option value="interaction">Interaction</option>
            <option value="social">Social</option>
            <option value="profile">Profile</option>
            <option value="activity">Activity</option>
            <option value="marketplace">Marketplace</option>
            <option value="other">Other</option>
          </select>

          <select
            style={styles.select}
            value={filters.activityType}
            onChange={(e) => handleFilterChange('activityType', e.target.value)}
          >
            <option value="">All Activity Types</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="post_create">Post Create</option>
            <option value="post_update">Post Update</option>
            <option value="post_delete">Post Delete</option>
            <option value="comment_create">Comment Create</option>
            <option value="profile_update">Profile Update</option>
          </select>

          <input
            type="date"
            style={styles.input}
            placeholder="Start Date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />

          <input
            type="date"
            style={styles.input}
            placeholder="End Date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />

          <Button variant="primary" onClick={() => handleExportData('json')}>
            <ExportIcon /> Export JSON
          </Button>

          <Button variant="secondary" onClick={() => handleExportData('csv')}>
            <ExportIcon /> Export CSV
          </Button>
        </div>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'my-activity' && (
        <>
          <Card title="Activity Statistics" icon={<StatsIcon />}>{memoStats}</Card>
          <Card title="Activity Types" icon={<TypesIcon />}>{memoTypes}</Card>
        </>
      )}

      {activeTab === 'admin-tools' && userRole === 'super_admin' && (
        <div style={styles.adminPanel}>
          <h3 style={styles.adminTitle}>Admin Tools</h3>
          <div style={styles.controlsRow}>
            <input
              type="text"
              style={styles.input}
              placeholder="User ID"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            />
            <Button variant="primary" onClick={fetchUserActivity}>
              <SearchIcon /> Get User Activity
            </Button>
            <Button variant="danger" onClick={handleCleanupActivities}>
              <CleanupIcon /> Cleanup Old Activities
            </Button>
          </div>
        </div>
      )}

      {/* Activity History */}
      <Card title={activeTab === 'all-activities' ? "All Users Activity History" : "Recent Activity History"} icon={<ActivityIcon />}>
        {currentHistory.length === 0 ? (
          <p style={styles.emptyState}>No activity found.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: `-${theme.spacing.md} -${theme.spacing.sm}` }}>
            {currentHistory.map((activity, index) => (
              <ActivityHistoryItem 
                key={activity.id || index} 
                activity={activity} 
                isLast={index === currentHistory.length - 1}
                showUser={activeTab === 'all-activities'}
              />
            ))}
          </ul>
        )}
      </Card>

      <Pagination
        pagination={pagination}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ActivityLogsPage;