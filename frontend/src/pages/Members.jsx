import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import {
    getAllSuggestedFriends,
    getAllPendingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getAllFriends,
} from "../lib/friendService";

function Members() {
    const [suggested, setSuggested] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [friends, setFriends] = useState([]);
    const [activeTab, setActiveTab] = useState("suggestions");
    const [loading, setLoading] = useState(true);

    const currentUserId = JSON.parse(localStorage.getItem("user"))?.id;

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [sug, pend, fr] = await Promise.all([
                getAllSuggestedFriends(),
                getAllPendingRequests(),
                getAllFriends(),
            ]);

            if (sug.data.success) setSuggested(sug.data.data.suggestedFriends);

            if (pend.data.success) {
                const all = pend.data.data;
                setSentRequests(all.filter((r) => r.senderId === currentUserId));
                setReceivedRequests(all.filter((r) => r.receiverId === currentUserId));
            }

            if (fr.data.success) setFriends(fr.data.data);
        } catch (error) {
            console.error("Error loading members data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const handleSendRequest = async (id) => {
        try {
            await sendFriendRequest(id);
            await loadAllData();
        } catch (err) {
            console.error("Failed to send request:", err);
        }
    };

    const handleAcceptRequest = async (id) => {
        try {
            await acceptFriendRequest(id);
            await loadAllData();
        } catch (err) {
            console.error("Failed to accept request:", err);
        }
    };

    const handleRejectRequest = async (id) => {
        try {
            await rejectFriendRequest(id);
            await loadAllData();
        } catch (err) {
            console.error("Failed to reject request:", err);
        }
    };

    // Exclude IDs already interacted with
    const sentIds = new Set(sentRequests.map((r) => r.receiverId));
    const receivedIds = new Set(receivedRequests.map((r) => r.senderId));
    const friendIds = new Set(friends.map((f) => f.id));
    const interactedIds = new Set([...sentIds, ...receivedIds, ...friendIds]);
    const filteredSuggestions = suggested.filter(p => !interactedIds.has(p.id));

    return (
        <div className="p-4 text-white">
            <ul className="nav nav-tabs mb-3">
                {["suggestions", "sent", "received", "friends"].map((tab) => (
                    <li className="nav-item" key={tab}>
                        <button
                            className={`nav-link ${activeTab === tab ? "active" : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}{" "}
                            {tab === "suggestions" && `(${filteredSuggestions.length})`}
                            {tab === "sent" && `(${sentRequests.length})`}
                            {tab === "received" && `(${receivedRequests.length})`}
                            {tab === "friends" && `(${friends.length})`}
                        </button>
                    </li>
                ))}
            </ul>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    {activeTab === "suggestions" && (
                        <div className="row">
                            {filteredSuggestions.length === 0 ? (
                                <p>No friend suggestions available.</p>
                            ) : (
                                filteredSuggestions.map((user) => (
                                    <div className="col-md-3" key={user.id}>
                                        <div className="card bg-dark text-white mb-3">
                                            <img
                                                src={user.profilePicture || "https://via.placeholder.com/150"}
                                                alt="profile"
                                                className="card-img-top"
                                                style={{ height: "160px", objectFit: "cover" }}
                                            />
                                            <div className="card-body">
                                                <h5>{user.firstName} {user.lastName}</h5>
                                                <button
                                                    onClick={() => handleSendRequest(user.id)}
                                                    className="btn btn-success w-100"
                                                    disabled={sentIds.has(user.id)}
                                                >
                                                    {sentIds.has(user.id) ? "Request Sent" : "Add Friend"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "sent" && (
                        <div className="row">
                            {sentRequests.length === 0 ? (
                                <p>No sent requests.</p>
                            ) : (
                                sentRequests.map((req) => (
                                    <div className="col-md-4" key={req._id}>
                                        <div className="card bg-secondary text-white p-3 mb-3">
                                            <span>{req.receiverName || "Unknown User"}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "received" && (
                        <div className="row">
                            {receivedRequests.length === 0 ? (
                                <p>No received requests.</p>
                            ) : (
                                receivedRequests.map((req) => (
                                    <div className="col-md-4" key={req._id}>
                                        <div className="card bg-dark text-white p-3 mb-3">
                                            <span>{req.senderName || "Someone"}</span>
                                            <div className="mt-2 d-flex gap-2">
                                                <button
                                                    className="btn btn-sm btn-success"
                                                    onClick={() => handleAcceptRequest(req.senderId)}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleRejectRequest(req.senderId)}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "friends" && (
                        <div className="row">
                            {friends.length === 0 ? (
                                <p>No friends yet.</p>
                            ) : (
                                friends.map((f) => (
                                    <div key={f.id} className="col-md-3">
                                        <div className="card bg-success text-white mb-3">
                                            <img
                                                src={f.profilePicture || "https://via.placeholder.com/150"}
                                                alt="friend"
                                                className="card-img-top"
                                                style={{ height: "160px", objectFit: "cover" }}
                                            />
                                            <div className="card-body">
                                                <h5>{f.firstName} {f.lastName}</h5>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Members;
