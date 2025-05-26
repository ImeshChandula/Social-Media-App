import React, { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import socket from "../lib/socket";

function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axiosInstance.get("/api/notifications");
        setNotifications(res.data.notifications || res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();

    // Listen for new notifications via socket
    socket.on("new_notification", (newNote) => {
      console.log("Received real-time notification:", newNote);
      setNotifications((prev) => [newNote, ...prev]);
    });

    // Clean up on unmount
    return () => {
      socket.off("new_notification");
    };
  }, []);

  return (
    <div className="notification-wrapper d-flex flex-column flex-md-row min-vh-100 bg-black text-white">
      <div className="flex-grow-1 bg-dark text-white p-3 p-md-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <h4 className="fw-bold mb-2 mb-md-0">Notifications</h4>
          <span className="text-success fw-semibold cursor-pointer">Mark all as read</span>
        </div>

        {loading ? (
          <p className="text-white-50">Loading notifications...</p>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : notifications.length === 0 ? (
          <p className="text-white-50">No new notifications.</p>
        ) : (
          <div className="notification-list overflow-auto" style={{ maxHeight: "70vh" }}>
            {notifications.map((note, index) => (
              <div
                className="notification-item d-flex align-items-start p-3 mb-2 border border-secondary rounded"
                key={index}
              >
                <div
                  className="avatar bg-secondary rounded-circle text-white d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                  style={{ width: "40px", height: "40px" }}
                >
                  {note.user?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <strong>{note.user || "Unknown User"}</strong>: {note.message}
                  <div className="text-muted-dark" style={{ fontSize: "12px" }}>
                    {new Date(note.createdAt || note.time).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-3">
          <span className="text-success fw-bold cursor-pointer">See more notifications</span>
        </div>
      </div>
    </div>
  );
}

export default NotificationPage;
