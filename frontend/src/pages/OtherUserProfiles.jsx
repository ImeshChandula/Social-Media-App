import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import OtherUserPosts from "../components/OtherUserPosts";
import EnhancedUserStats from "../components/EnhancedUserStats";
import EnhancedBioSection from "../components/EnhancedBioSection";
import FriendActionButton from "../components/FriendActionButton";
import UserInPrivateStatus from "../components/UserInPrivateStatus";

const OtherUserProfiles = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [friendStatus, setFriendStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      await fetchStatus();
      await fetchUser();
    };
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.get(`/users/getUserById/${id}`);
        const fetchedUser = res.data.user || res.data;
        setUser(fetchedUser);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

  const fetchStatus = async () => {
    try {
        const res = await axiosInstance.get(`/friends/friend-status/${id}`);
        if (res.data.success) {
            setFriendStatus(res.data.data.friendStatus);
        }
    } catch (err) {
        console.log("Error: " + err);
        toast.error("Failed to get friend status");
    } 
  };

  if (loading) {
    return (
      <p className="text-white-50 text-center mt-5 normal-loading-spinner">
        Loading user profile<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
      </p>
    );
  }

  if (error) return <div className="alert alert-danger mt-5">{error}</div>;
  if (!user) return <p className="text-white-50 text-center mt-5">User not found.</p>;

  // Helper function to determine if content should be shown
  const shouldShowContent = () => {
    if (user.isPublic === true) return true;
    if (user.isPublic === false && friendStatus === "friend") return true;
    return false;
  };

  return (
    <motion.div
      className="container text-center py-5 py-md-0 mt-5 mt-md-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Cover Photo & Profile Picture */}
      <div className="position-relative mb-5 pt-3 mt-1 mt-md-0">
        <motion.img
          src={user.coverPhoto}
          alt="Cover"
          className="img-fluid w-100 rounded"
          style={{ objectFit: "cover", height: "200px" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 50 }}
        />
        <motion.img
          src={user.profilePicture}
          alt="Profile"
          className="rounded-circle border border-white shadow profile-pic-animate"
          whileHover={{ scale: 1.05 }}
          style={{
            width: "120px",
            height: "120px",
            objectFit: "cover",
            position: "absolute",
            bottom: "-60px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1,
          }}
        />
      </div>

      {/* User Info */}
      <motion.div
        className="mt-5 py-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h4 className="fw-bold text-white">
          {user.firstName || user.lastName
            ? `${user.firstName} ${user.lastName}`
            : "Unnamed User"}
        </h4>
        <p className="text-white-50">@{user.username}</p>

        <div className="d-flex justify-content-center">
          <FriendActionButton userId={id} />
        </div>

      </motion.div>

      {/* Stats */}
      <EnhancedUserStats user={user} />

      {shouldShowContent() ? (
        <>
          {/* Bio */}
          <EnhancedBioSection user={user} />

          {/* Posts */}
          <div className="mt-3">
            <OtherUserPosts userId={user._id || id} />
          </div>
        </>
      ) : (
        <>
          {/* Private */}
          <UserInPrivateStatus />
        </>
      )}
    </motion.div>
  );
};

export default OtherUserProfiles;