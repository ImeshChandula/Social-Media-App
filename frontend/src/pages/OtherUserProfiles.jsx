import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { axiosInstance } from "../lib/axios";

const OtherUserProfiles = () => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.get(`/users/getUserByUsername/${username}`);
        setUser(res.data.user || res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [username]);

  if (loading) {
    return <p className="text-white-50 loading-spinner">Loading user profile...</p>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!user) {
    return <p className="text-white-50">User not found.</p>;
  }

  return (
    <motion.div
      className="container text-center py-5 mt-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Profile Picture */}
      <motion.img
        src={user.profilePicture}
        alt={`${user.firstName || user.username}'s avatar`}
        className="rounded-circle border border-white shadow profile-pic-animate mb-3"
        style={{ width: "120px", height: "120px", objectFit: "cover" }}
        whileHover={{ scale: 1.05 }}
      />

      {/* User Name */}
      <h2 className="fw-bold mb-1">
        {user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.username}
      </h2>

      {/* Username and Email */}
      <p className="text-white-50 mb-3">@{user.username}</p>
      <p className="text-white-50 mb-3">{user.email}</p>

      {/* Bio */}
      <div className="bg-dark rounded p-3 text-white-50 mb-4 text-start">
        <h5 className="text-white">Bio</h5>
        <p>{user.bio || "This user has not added a bio yet."}</p>
      </div>

      {/* Optional Extra Fields */}
      {user.location && (
        <p className="text-white-50 mb-1">
          <strong>Location:</strong> {user.location}
        </p>
      )}
      {user.birthday && (
        <p className="text-white-50 mb-1">
          <strong>Birthday:</strong> {new Date(user.birthday).toLocaleDateString()}
        </p>
      )}
      {user.accountStatus && (
        <p className="text-white-50 mb-0">
          <strong>Account Status:</strong> {user.accountStatus}
        </p>
      )}
    </motion.div>
  );
};

export default OtherUserProfiles;
