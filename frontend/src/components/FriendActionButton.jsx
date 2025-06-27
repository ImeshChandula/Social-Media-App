import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const FriendActionButton = ({ userId }) => {
    const [loading, setLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(true);
    const [isFriend, setIsFriend] = useState(null);
    const [friendRequestSent, setFriendRequestSent] = useState(null);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const res = await axiosInstance.get(`/friends/friend-status/${userId}`);
                if (res.data.success) {
                    const status = res.data.data.friendStatus;
                    setIsFriend(status === "friend");
                    setFriendRequestSent(status === "pending");
                }
            } catch (err) {
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
                setIsFriend(false);
                setFriendRequestSent(true);
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
                setFriendRequestSent(false);
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
                setIsFriend(false);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to remove friend");
        } finally {
            setLoading(false);
        }
    };

    if (statusLoading || isFriend === null || friendRequestSent === null) {
        return <button className="btn btn-secondary" disabled>Checking status...</button>;
    }

    let label = "";
    let onClick = null;
    let btnClass = "";

    if (isFriend) {
        label = loading ? "Removing..." : "Remove Friend";
        onClick = handleRemoveFriend;
        btnClass = "btn btn-danger";
    } else if (friendRequestSent) {
        label = loading ? "Canceling..." : "Cancel Request";
        onClick = handleCancelRequest;
        btnClass = "btn btn-warning";
    } else {
        label = loading ? "Sending..." : "Add Friend";
        onClick = handleSendRequest;
        btnClass = "btn btn-success";
    }

    return (
        <motion.button
            className={btnClass}
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            style={{ display: "block", margin: "0 auto" }}
        >
            {label}
        </motion.button>
    );
};

export default FriendActionButton;
