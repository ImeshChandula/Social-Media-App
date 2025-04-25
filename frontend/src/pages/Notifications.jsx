import React from "react";

const notifications = Array(6).fill({
    user: "Emma Watson",
    message: "commented on your photo",
    time: "Just now",
});

function NotificationPage() {
    return (
        <div className="notification-wrapper d-flex flex-column flex-md-row min-vh-100 bg-black text-white">
            {/* Notification Panel */}
            <div className="flex-grow-1 bg-dark text-white p-3 p-md-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                    <h4 className="fw-bold mb-2 mb-md-0">Notifications</h4>
                    <span className="text-success fw-semibold cursor-pointer">Mark all as read</span>
                </div>

                <div className="notification-list overflow-auto" style={{ maxHeight: "70vh" }}>
                    {notifications.map((note, index) => (
                        <div className="notification-item d-flex align-items-start p-3 mb-2" key={index}>
                            <div
                                className="avatar bg-secondary rounded-circle me-3 flex-shrink-0"
                                style={{ width: "40px", height: "40px" }}
                            ></div>
                            <div>
                                <strong>{note.user}</strong> {note.message}
                                <div className="text-muted-dark" style={{ fontSize: "12px" }}>{note.time}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-3">
                    <span className="text-success fw-bold cursor-pointer">See more notifications</span>
                </div>
            </div>
        </div>
    );
}

export default NotificationPage;
