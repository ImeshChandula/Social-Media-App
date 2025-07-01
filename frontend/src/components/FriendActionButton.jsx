import React, { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const FriendActionButton = ({ userId }) => {
    const [loading, setLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(true);
    const [friendStatus, setFriendStatus] = useState(null); // "friend", "pending", "received", "none"

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await axiosInstance.get(`/friends/friend-status/${userId}`);
                if (res.data.success) {
                    setFriendStatus(res.data.data.friendStatus);
                }
            } catch (err) {
                console.log("Error: " + err);
                toast.error("Failed to get friend status");
            } finally {
                setStatusLoading(false);
            }
        };
        fetchStatus();
    }, [userId]);

    const handleSendRequest = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.post(`/friends/friend-request/send/${userId}`);
            if (res.data.success) {
                toast.success("Friend request sent");
                setFriendStatus("pending");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send friend request");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.delete(`/friends/friend-request/cancel/${userId}`);
            if (res.data.success) {
                toast.success("Friend request cancelled");
                setFriendStatus("none");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to cancel friend request");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFriend = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.delete(`/friends/removeFriend/${userId}`);
            if (res.data.success) {
                toast.success("Friend removed");
                setFriendStatus("none");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to remove friend");
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.post(`/friends/friend-request/accept/${userId}`);
            if (res.data.success) {
                toast.success("Friend request accepted");
                setFriendStatus("friend");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to accept request");
        } finally {
            setLoading(false);
        }
    };

    const handleRejectRequest = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.post(`/friends/friend-request/reject/${userId}`);
            if (res.data.success) {
                toast.success("Friend request rejected");
                setFriendStatus("none");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to reject request");
        } finally {
            setLoading(false);
        }
    };

    if (statusLoading || friendStatus === null) {
        return <button className="btn btn-secondary" disabled>Checking status...</button>;
    }

    if (friendStatus === "friend") {
        return (
            <motion.button
                className="btn btn-danger"
                onClick={handleRemoveFriend}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
                style={{ display: "block", margin: "0 auto" }}
            >
                {loading ? "Removing..." : "Remove Friend"}
            </motion.button>
        );
    }

    if (friendStatus === "pending") {
        return (
            <motion.button
                className="btn btn-warning"
                onClick={handleCancelRequest}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
                style={{ display: "block", margin: "0 auto" }}
            >
                {loading ? "Canceling..." : "Cancel Request"}
            </motion.button>
        );
    }

    if (friendStatus === "requested") {
        return (
            <div className="d-flex justify-content-center gap-2">
                <motion.button
                    className="btn btn-success"
                    onClick={handleAcceptRequest}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loading}
                >
                    {loading ? "Accepting..." : "Accept"}
                </motion.button>
                <motion.button
                    className="btn btn-danger"
                    onClick={handleRejectRequest}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loading}
                >
                    {loading ? "Rejecting..." : "Reject"}
                </motion.button>
            </div>
        );
    }

    return (
        <motion.button
            className="btn btn-success"
            onClick={handleSendRequest}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            style={{ display: "block", margin: "0 auto" }}
        >
            {loading ? "Sending..." : "Add Friend"}
        </motion.button>
    );
};

export default FriendActionButton;
