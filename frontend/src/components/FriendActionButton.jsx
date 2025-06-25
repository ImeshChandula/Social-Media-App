import React, { useState } from "react";
import { motion } from "framer-motion";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const FriendActionButton = ({ userId, isFriend, friendRequestSent, onStatusChange }) => {
    const [loading, setLoading] = useState(false);

    const handleSendRequest = async () => {
        setLoading(true);
        try {
            const res = await axiosInstance.post(`/friends/friend-request/send/${userId}`);
            if (res.data.success) {
                toast.success("Friend request sent");
                onStatusChange({ isFriend: false, friendRequestSent: true });
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
                onStatusChange({ friendRequestSent: false });
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
                onStatusChange({ isFriend: false });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to remove friend");
        } finally {
            setLoading(false);
        }
    };

    if (isFriend === null || friendRequestSent === null) {
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
