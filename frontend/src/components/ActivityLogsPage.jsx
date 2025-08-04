import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

// Simple CSS styles
const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    color: "#333",
  },
  header: {
    textAlign: "center",
    color: "#4a4a4a",
    borderBottom: "2px solid #eee",
    paddingBottom: "10px",
  },
  section: {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  listItem: {
    borderBottom: "1px solid #ddd",
    padding: "10px 0",
  },
  listItemLast: {
    borderBottom: "none",
  },
  mutedText: {
    color: "#888",
    fontSize: "0.9em",
  },
  pre: {
    backgroundColor: "#eee",
    padding: "15px",
    borderRadius: "5px",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
  },
  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "20px",
  },
  button: {
    padding: "10px 15px",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    borderRadius: "5px",
    cursor: "pointer",
    margin: "0 5px",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
};

function ActivityLogsPage() {
  const [activityHistory, setActivityHistory] = useState([]);
  const [activityStats, setActivityStats] = useState(null);
  const [activityTypes, setActivityTypes] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchAllActivityData = async () => {
      setLoading(true);
      try {
        const [historyRes, statsRes, typesRes] = await Promise.all([
          axiosInstance.get(
            `/activities/my-history?page=${currentPage}&limit=10`
          ),
          axiosInstance.get("/activities/my-stats"),
          axiosInstance.get("/activities/types"),
        ]);

        setActivityHistory(historyRes.data?.data || []);
        setPagination(historyRes.data?.pagination || null);
        setActivityStats(statsRes.data?.data || {});
        setActivityTypes(typesRes.data?.data || {});
      } catch (error) {
        console.error("Error loading activity logs:", error);
        toast.error("Failed to load activity data");
      } finally {
        setLoading(false);
      }
    };

    fetchAllActivityData();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= (pagination?.totalPages || 1)) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <div className="spinner-border" role="status"></div>
        <p>Loading activity logs...</p>
      </div>
    );
  }

  return (
    <div style={styles.container} className="container py-5">
      <h2 style={styles.header}>📋 My Activity Logs</h2>

      <div style={{ ...styles.section, marginBottom: "20px" }}>
        <h5>📊 Activity Stats</h5>
        {activityStats && Object.keys(activityStats).length > 0 ? (
          <pre style={styles.pre}>
            {JSON.stringify(activityStats, null, 2)}
          </pre>
        ) : (
          <p>No stats available.</p>
        )}
      </div>

      <div style={{ ...styles.section, marginBottom: "20px" }}>
        <h5>🗂️ Activity Types & Categories</h5>
        {activityTypes && Object.keys(activityTypes).length > 0 ? (
          <pre style={styles.pre}>
            {JSON.stringify(activityTypes, null, 2)}
          </pre>
        ) : (
          <p>No type data available.</p>
        )}
      </div>

      <div style={styles.section}>
        <h5>📜 Recent Activity History</h5>
        {activityHistory.length === 0 ? (
          <p>No activity found.</p>
        ) : (
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {activityHistory.map((activity, index) => (
              <li
                key={activity.id || index}
                style={
                  index === activityHistory.length - 1
                    ? styles.listItemLast
                    : styles.listItem
                }
              >
                <strong>{activity.activityType || "Unknown Type"}</strong> —{" "}
                {activity.description || "No description"} <br />
                <small style={styles.mutedText}>
                  {new Date(activity.createdAt).toLocaleString()} | Category:{" "}
                  {activity.category || "N/A"}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            style={
              currentPage === 1
                ? { ...styles.button, ...styles.disabledButton }
                : styles.button
            }
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          <span style={{ margin: "0 10px" }}>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            style={
              currentPage === pagination.totalPages
                ? { ...styles.button, ...styles.disabledButton }
                : styles.button
            }
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

export default ActivityLogsPage;