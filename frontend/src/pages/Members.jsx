import React, { useEffect, useState } from "react";
import {
    getAllSuggestedFriends,
    getAllPendingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
} from "../lib/friendService";

function Members() {
    const [suggested, setSuggested] = useState([]);
    const [sent, setSent] = useState([]);
    const [received, setReceived] = useState([]);
    const [loading, setLoading] = useState(true);

    const getCurrentUserId = () => {
        const user = JSON.parse(localStorage.getItem("user"));
        return user?.id;
    };

    const loadAll = async () => {
        setLoading(true);
        try {
            const [sug, pend] = await Promise.all([
                getAllSuggestedFriends(),
                getAllPendingRequests(),
            ]);

            if (sug.data.success) {
                setSuggested(sug.data.data.suggestedFriends);
            }

            if (pend.data.success) {
                const me = getCurrentUserId();
                const all = pend.data.data;
                setSent(all.filter((r) => r.senderId === me));
                setReceived(all.filter((r) => r.receiverId === me));
            }
        } catch (e) {
            console.error("Error loading members:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    const handleSend = async (id) => {
        try {
            await sendFriendRequest(id);
            await loadAll();
        } catch (err) {
            console.error("Send request failed:", err);
        }
    };

    const handleAccept = async (id) => {
        try {
            await acceptFriendRequest(id);
            await loadAll();
        } catch (err) {
            console.error("Accept failed:", err);
        }
    };

    const handleReject = async (id) => {
        try {
            await rejectFriendRequest(id);
            await loadAll();
        } catch (err) {
            console.error("Reject failed:", err);
        }
    };

    // Remove suggested friend if already sent a request
    const sentIds = new Set(sent.map((r) => r.receiverId));
    const filteredSuggested = suggested.filter((p) => !sentIds.has(p.id));

    return (
        <div className="p-4 text-white">
            <h4>People You May Know</h4>
            {loading ? <p>Loading...</p> : (
                <div className="row">
                    {filteredSuggested.length === 0 ? <p>No suggestions.</p> : filteredSuggested.map((p) => (
                        <div className="col-md-3" key={p.id}>
                            <div className="card bg-dark text-white mb-3">
                                <img
                                    src={p.profilePicture || 'https://via.placeholder.com/150'}
                                    className="card-img-top"
                                    alt="user"
                                    style={{ height: "160px", objectFit: "cover" }}
                                />
                                <div className="card-body">
                                    <h5>{p.firstName} {p.lastName}</h5>
                                    <button
                                        onClick={() => handleSend(p.id)}
                                        className="btn btn-success w-100"
                                    >
                                        Add Friend
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <h5 className="mt-5">📤 Sent Friend Requests</h5>
            {sent.length === 0 ? <p>None</p> : (
                <div className="row">
                    {sent.map(r => (
                        <div key={r._id} className="col-md-4">
                            <div className="card bg-secondary text-white p-3 mb-3">
                                <span>{r.receiverName || "Friend"}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <h5 className="mt-5">📥 Received Friend Requests</h5>
            {received.length === 0 ? <p>None</p> : (
                <div className="row">
                    {received.map(r => (
                        <div key={r._id} className="col-md-4">
                            <div className="card bg-dark text-white p-3 mb-3">
                                <span>{r.senderName || "Someone"}</span>
                                <div className="mt-2 d-flex gap-2">
                                    <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => handleAccept(r.senderId)}
                                    >
                                        Accept
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleReject(r.senderId)}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Members;
