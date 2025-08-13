import React, { useEffect, useState, useMemo } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

// --- Theme & Styles ---
const theme = {
  colors: {
    primary: "#4f46e5",
    secondary: "#059669",
    danger: "#dc2626",
    text: "#111827",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
    background: "#f9fafb",
    cardBg: "#ffffff",
    disabled: "#d1d5db",
    disabledText: "#9ca3af",
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
};

// --- Icons ---
const ActivityIcon = () => <span role="img" aria-label="activity">📋</span>;
const StatsIcon = () => <span role="img" aria-label="stats">📊</span>;
const TypesIcon = () => <span role="img" aria-label="types">🗂️</span>;
const ExportIcon = () => <span role="img" aria-label="export">📤</span>;

// --- Components ---
const Card = ({ title, icon, children }) => (
  <div style={styles.card}>
    <h3 style={styles.sectionTitle}>{icon} {title}</h3>
    {children}
  </div>
);

const Button = ({ variant = "primary", onClick, disabled, children }) => (
  <button
    style={{
      ...styles.button.base,
      ...styles.button[variant],
      ...(disabled ? { opacity: 0.6, cursor: "not-allowed" } : {}),
    }}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
);

const ActivityHistoryItem = ({ activity, isLast }) => (
  <li style={{ ...styles.historyItem.base, ...(isLast ? styles.historyItem.last : {}) }}>
    <div style={styles.historyItem.icon}>
      <ActivityIcon />
    </div>
    <div style={styles.historyItem.content}>
      <span style={styles.historyItem.description}>
        {activity.activityType || "Unknown Type"} — {activity.description || "No description"}
      </span>
      <small style={styles.historyItem.meta}>
        {activity.createdAt
          ? new Date(activity.createdAt).toLocaleString()
          : "Unknown Date"} | Category: {activity.category || "N/A"}
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
        Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
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
    return (
      <div style={styles.renderData.nested}>
        <RenderData data={value} />
      </div>
    );
  };

  return (
    <ul style={styles.renderData.list}>
      {Object.entries(data).map(([key, value], index, arr) => (
        <li
          key={key}
          style={{
            ...styles.renderData.item,
            ...(index === arr.length - 1 ? { borderBottom: "none" } : {}),
          }}
        >
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
const useActivityData = (currentPage, filters) => {
  const [data, setData] = useState({
    history: [],
    stats: null,
    types: null,
    pagination: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivityData = async () => {
      setLoading(true);
      setError(null);
      try {
        const requests = [
          axiosInstance.get(
            `/activities/my-history?page=${currentPage}&limit=10${buildQueryString(filters)}`
          ),
        ];
        if (currentPage === 1) {
          requests.push(axiosInstance.get("/activities/my-stats"));
          requests.push(axiosInstance.get("/activities/types"));
        }

        const responses = await Promise.all(requests);

        // Log responses for debugging
        console.log("API Responses for my-activity:", responses);

        // Handle empty data gracefully
        const historyData = responses[0]?.data?.data || [];
        const paginationData = responses[0]?.data?.pagination || null;

        setData((prev) => ({
          ...prev,
          history: historyData,
          pagination: paginationData,
          stats: responses[1]?.data?.data || prev.stats,
          types: responses.find((r) => r?.data?.data?.activityTypes)?.data?.data || prev.types,
        }));
      } catch (err) {
        console.error("Fetch error for my-activity:", err.response || err);
        const errorMessage =
          err.response?.status === 404
            ? "No activities found"
            : err.response?.data?.message || "Failed to fetch activity data";
        setError(errorMessage);
        if (errorMessage !== "No activities found") {
          toast.error(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [currentPage, filters]);

  return { ...data, loading, error };
};

const buildQueryString = (filters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  return params.toString() ? `&${params.toString()}` : "";
};

// --- Main Component ---
const ActivityLogsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category: "",
    activityType: "",
    startDate: "",
    endDate: "",
    period: "month",
  });

  const { history, stats, types, pagination, loading, error } = useActivityData(
    currentPage,
    filters
  );

  // Reset page when changing filters
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleExportData = async (format = "json") => {
    try {
      const response = await axiosInstance.get(`/activities/export?format=${format}`, {
        responseType: format === "csv" ? "blob" : "json",
      });

      const data = response.data;
      const blob = new Blob([format === "csv" ? data : JSON.stringify(data, null, 2)], {
        type: format === "csv" ? "text/csv" : "application/json",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `activity-export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Data exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Export error:", error.response || error);
      toast.error("Failed to export data");
    }
  };

  const memoStats = useMemo(
    () => (stats ? <RenderData data={stats} /> : <p style={styles.emptyState}>No stats available</p>),
    [stats]
  );
  const memoTypes = useMemo(
    () => (types ? <RenderData data={types} /> : <p style={styles.emptyState}>No type data available</p>),
    [types]
  );

  if (loading && currentPage === 1) {
    return (
      <div style={styles.container}>
        <h2 style={styles.header}>Activity Logs</h2>
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Activity Logs</h2>

      {/* Error Display */}
      {error && error !== "No activities found" && (
        <p style={{ ...styles.emptyState, color: theme.colors.danger }}>
          Error: {error}
        </p>
      )}

      {/* Filters */}
      <Card title="Filters & Controls" icon={<ActivityIcon />}>
        <div style={styles.controlsRow}>
          <select
            style={styles.select}
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
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
            onChange={(e) => handleFilterChange("activityType", e.target.value)}
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
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
          />

          <input
            type="date"
            style={styles.input}
            placeholder="End Date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
          />

          <Button variant="primary" onClick={() => handleExportData("json")}>
            <ExportIcon /> Export JSON
          </Button>

          <Button variant="secondary" onClick={() => handleExportData("csv")}>
            <ExportIcon /> Export CSV
          </Button>
        </div>
      </Card>

      {/* My Activity Content */}
      <Card title="My Activity History" icon={<ActivityIcon />}>
        {history.length > 0 ? (
          <ul style={styles.renderData.list}>
            {history.map((activity, index) => (
              <ActivityHistoryItem
                key={activity.id || index}
                activity={activity}
                isLast={index === history.length - 1}
              />
            ))}
          </ul>
        ) : (
          <p style={styles.emptyState}>
            {loading ? "Loading..." : error === "No activities found" ? "No activity history available" : "No activity history available"}
          </p>
        )}
      </Card>
      <Card title="Activity Statistics" icon={<StatsIcon />}>{memoStats}</Card>
      <Card title="Activity Types" icon={<TypesIcon />}>{memoTypes}</Card>

      <Pagination pagination={pagination} currentPage={currentPage} onPageChange={setCurrentPage} />
    </div>
  );
};

export default ActivityLogsPage;