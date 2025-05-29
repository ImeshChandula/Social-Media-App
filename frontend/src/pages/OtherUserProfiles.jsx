import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { axiosInstance } from "../lib/axios";
import OtherUserPosts from "../components/OtherUserPosts";

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
      className="container text-center mt-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Cover Photo */}
      <div className="position-relative mb-5">
        <motion.img
          src={user?.coverPhoto}
          alt="Cover"
          className="img-fluid w-100 rounded"
          style={{ objectFit: "cover", height: "200px" }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 50 }}
        />

        <motion.img
          src={user?.profilePicture}
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
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <h4 className="fw-bold">
          {user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : "Unnamed User"}
        </h4>
        <p className="text-white-50 mb-3">@{user?.username}</p>
        <div className="d-flex justify-content-center flex-wrap gap-2">
          <motion.button
            className="btn btn-success"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Add Friend
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="row mt-3 text-white-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <div className="col-4 col-md-2 offset-md-3">
          <div><strong>{user?.friends?.length}</strong></div>
          <div>Friends</div>
        </div>
        <div className="col-4 col-md-2">
          <div><strong>{user?.photosCount || 0}</strong></div>
          <div>Photos</div>
        </div>
        <div className="col-4 col-md-2">
          <div><strong>{user?.videosCount || 0}</strong></div>
          <div>Videos</div>
        </div>
      </motion.div>

      <motion.div
        className="mt-4 p-3 bg-dark rounded text-start text-white-50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <h5 className="text-white mb-3">Bio</h5>

        {user?.bio && (
          <p className="mb-1">
            <strong className="text-white">About:</strong> {user.bio}
          </p>
        )}

        {user?.location && (
          <p className="mb-1">
            <strong className="text-white">Location:</strong> {user.location}
          </p>
        )}

        {user?.birthday && (
          <p className="mb-1">
            <strong className="text-white">Birthday:</strong> {new Date(user.birthday).toLocaleDateString()}
          </p>
        )}

        {user?.accountStatus && (
          <p className="mb-0">
            <strong className="text-white">Account Status:</strong> {user.accountStatus}
          </p>
        )}
      </motion.div>

      {/* User Posts */}
      <div className="mt-5">
        <OtherUserPosts />
      </div>
    </motion.div>
  );
};

export default OtherUserProfiles;
