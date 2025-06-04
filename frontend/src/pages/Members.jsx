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
import toast from "react-hot-toast";

// Connect to the socket server
const socket = io("http://localhost:5000");

function Members() {
    const [suggested, setSuggested] = useState([]);
    const [sent, setSent] = useState([]);
    const [received, setReceived] = useState([]);
    const [friends, setFriends] = useState([]);
    const [activeTab, setActiveTab] = useState("suggestions");
    const [loading, setLoading] = useState(true);

    const getCurrentUserId = () => {
        const user = JSON.parse(localStorage.getItem("user"));
        return user?.id;
    };

    const loadAll = async () => {
        setLoading(true);
        try {
            const [sug, pend, fr] = await Promise.all([
                getAllSuggestedFriends(),
                getAllPendingRequests(),
                getAllFriends(),
            ]);

            const me = getCurrentUserId();

            if (sug.data.success) {
                setSuggested(sug.data.data.suggestedFriends);
            }

            if (pend.data.success) {
                const all = pend.data.data;
                setSent(all.filter((r) => r.senderId === me));
                setReceived(all.filter((r) => r.receiverId === me));
            }

            if (fr.data.success) {
                setFriends(fr.data.data);
            }
        } catch (e) {
            console.error("Error loading data:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();

        const userId = getCurrentUserId();
        socket.emit("join", userId);

        socket.on("friend_request_update", () => {
            loadAll();
        });

        return () => {
            socket.off("friend_request_update");
        };
    }, []);

    const handleSend = async (id) => {
        try {
            await sendFriendRequest(id);
            socket.emit("friend_request_update", id);
            await loadAll();
            toast.success("Friend request sent!");
        } catch (err) {
            console.error("Send failed:", err);
            toast.error("Failed to send request.");
        }
    };

    const handleAccept = async (id) => {
        try {
            await acceptFriendRequest(id);
            socket.emit("friend_request_update", id);
            await loadAll();
            toast.success("Friend request accepted!");
        } catch (err) {
            console.error("Accept failed:", err);
            toast.error("Failed to accept request.");
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectFriendRequest(id);
            socket.emit("friend_request_update", id);
            await loadAll();
            toast.success("Friend request rejected!");
        } catch (err) {
            console.error("Reject failed:", err);
            toast.error("Failed to reject request.");
        }
    };

    const currentUserId = getCurrentUserId();
    const sentIds = new Set(sent.map((r) => r.receiverId));
    const receivedIds = new Set(received.map((r) => r.senderId));
    const friendIds = new Set(friends.map((f) => f.id));
    const excludedIds = new Set([...sentIds, ...receivedIds, ...friendIds]);
    const filteredSuggestions = suggested.filter(p => !excludedIds.has(p.id));

    const renderCard = (user, actions = null) => (
        <div className="col-md-3" key={user.id || user._id}>
            <div className="card bg-dark text-white mb-3">
                <img
                    src={user.profilePicture || 'https://via.placeholder.com/150'}
                    className="card-img-top"
                    alt="user"
                    style={{ height: "160px", objectFit: "cover" }}
                />
                <div className="card-body">
                    <h5>{user.firstName || user.senderName || user.receiverName || "User"}</h5>
                    {actions}
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-4 text-white">
            <ul className="nav nav-tabs">
                {["suggestions", "sent", "received", "friends"].map((tab) => (
                    <li className="nav-item" key={tab}>
                        <button
                            className={`nav-link ${activeTab === tab ? "active" : ""}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    </li>
                ))}
            </ul>

            <div className="mt-4">
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        {activeTab === "suggestions" && (
                            <div className="row">
                                {filteredSuggestions.length === 0 ? (
                                    <p>No suggestions.</p>
                                ) : (
                                    filteredSuggestions.map((p) =>
                                        renderCard(p, (
                                            <button
                                                onClick={() => handleSend(p.id)}
                                                className="btn btn-success w-100"
                                            >
                                                Add Friend
                                            </button>
                                        ))
                                    )
                                )}
                            </div>
                        )}

                        {activeTab === "sent" && (
                            <div className="row">
                                {sent.length === 0 ? (
                                    <p>No sent requests.</p>
                                ) : (
                                    sent.map((r) =>
                                        renderCard({
                                            ...r,
                                            firstName: r.receiverName,
                                            id: r._id
                                        })
                                    )
                                )}
                            </div>
                        )}

                        {activeTab === "received" && (
                            <div className="row">
                                {received.length === 0 ? (
                                    <p>No received requests.</p>
                                ) : (
                                    received.map((r) =>
                                        renderCard({
                                            ...r,
                                            firstName: r.senderName,
                                            id: r.senderId
                                        }, (
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-sm btn-success w-100"
                                                    onClick={() => handleAccept(r.senderId)}
                                                >
                                                    Accept
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger w-100"
                                                    onClick={() => handleReject(r.senderId)}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ))
                                    )
                                )}
                            </div>
                        )}

                        {activeTab === "friends" && (
                            <div className="row">
                                {friends.length === 0 ? (
                                    <p>No friends yet.</p>
                                ) : (
                                    friends.map((f) => renderCard(f))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default Members;
