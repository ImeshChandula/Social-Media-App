import React, { useEffect, useState, useMemo } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

// --- Theme & Styles ---
const theme = {
  colors: {
    primary: "#4f46e5",
    primaryHover: "#4338ca",
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
    maxWidth: "1200px",
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

// --- Components ---
const Card = ({ title, icon, children }) => (
  <div style={styles.card}>
    <h3 style={styles.sectionTitle}>{icon} {title}</h3>
    {children}
  </div>
);

const ActivityHistoryItem = ({ activity, isLast }) => (
  <li style={{ ...styles.historyItem.base, ...(isLast ? styles.historyItem.last : {}) }}>
    <div style={styles.historyItem.icon}><ActivityIcon /></div>
    <div style={styles.historyItem.content}>
      <span style={styles.historyItem.description}>
        {activity.activityType || "Unknown Type"} — {activity.description || "No description"}
      </span>
      <small style={styles.historyItem.meta}>
        {new Date(activity.createdAt).toLocaleString()} | Category: {activity.category || "N/A"}
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
    const noNumbers = key.replace(/[0-9]/g, ""); // Remove digits
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

// --- Hook ---
const useActivityData = (currentPage) => {
  const [data, setData] = useState({ history: [], stats: null, types: null, pagination: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      setLoading(true);
      try {
        const requests = [axiosInstance.get(`/activities/my-history?page=${currentPage}&limit=10`)];
        if (currentPage === 1) {
          requests.push(
            axiosInstance.get("/activities/my-stats"),
            axiosInstance.get("/activities/types")
          );
        }

        const [historyRes, statsRes, typesRes] = await Promise.all(requests);

        setData(prev => ({
          history: historyRes.data.data || [],
          pagination: historyRes.data.pagination || null,
          stats: statsRes?.data?.data || prev.stats,
          types: typesRes?.data?.data || prev.types,
        }));
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch activity data.");
      } finally {
        setLoading(false);
      }
    };
    fetchActivityData();
  }, [currentPage]);

  return { ...data, loading };
};

// --- Main Page ---
const ActivityLogsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { history, stats, types, pagination, loading } = useActivityData(currentPage);

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

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Activity Logs</h2>

      <Card title="Activity Statistics" icon={<StatsIcon />}>{memoStats}</Card>
      <Card title="Activity Types" icon={<TypesIcon />}>{memoTypes}</Card>

      <Card title="Recent Activity History" icon={<ActivityIcon />}>
        {history.length === 0 ? (
          <p style={styles.emptyState}>No activity found.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, margin: `-${theme.spacing.md} -${theme.spacing.sm}` }}>
            {history.map((activity, index) => (
              <ActivityHistoryItem key={activity.id || index} activity={activity} isLast={index === history.length - 1} />
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
