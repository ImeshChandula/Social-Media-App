//new code-----------------------------------------------------------------------------------------

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { axiosInstance } from "../lib/axios";
import OtherUserPosts from "../components/OtherUserPosts";
import EnhancedUserStats from "../components/EnhancedUserStats";
import EnhancedBioSection from "../components/EnhancedBioSection";
import FriendActionButton from "../components/FriendActionButton";
import { User, Lock } from "lucide-react";

const OtherUserProfiles = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <p className="text-white-50 text-center mt-5 normal-loading-spinner">
        Loading user profile<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span>
      </p>
    );
  }

  if (error) return <div className="alert alert-danger mt-5">{error}</div>;
  if (!user) return <p className="text-white-50 text-center mt-5">User not found.</p>;

  return (
    <motion.div
      className="container text-center py-5 py-md-0 mt-5 mt-md-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {user.isPublic ? (
        <>
          {/* PUBLIC PROFILE - Full Content */}
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

          {/* Bio */}
          <EnhancedBioSection user={user} />

          {/* Posts */}
          <div className="mt-3">
            <OtherUserPosts userId={user._id || id} />
          </div>
        </>
      ) : (
        <>
          {/* PRIVATE PROFILE - Limited Content */}
          {/* Profile Picture Only (No Cover Photo) */}
          <div className="position-relative mb-5 pt-5 mt-3">
            <motion.img
              src={user.profilePicture}
              alt="Profile"
              className="rounded-circle border border-white shadow profile-pic-animate"
              whileHover={{ scale: 1.05 }}
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                margin: "0 auto",
              }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            />
          </div>

          {/* Limited User Info */}
          <motion.div
            className="mt-4 py-3"
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

          {/* Private Profile Notice */}
          <motion.div
            className="mt-4 p-4 bg-dark bg-opacity-50 rounded"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="d-flex align-items-center justify-content-center mb-3">
              <Lock className="me-2" size={24} color="#6c757d" />
              <h5 className="text-white-50 mb-0">Private Profile</h5>
            </div>
            <p className="text-white-50 mb-3">
              This profile is private. Only friends can see posts, photos, and profile details.
            </p>
            
            {/* Limited Friends Count (if available) */}
            {user.friendsCount !== undefined && (
              <div className="d-flex justify-content-center">
                <div className="text-center mx-3">
                  <h6 className="text-white fw-bold mb-0">{user.friendsCount}</h6>
                  <small className="text-white-50">Friends</small>
                </div>
              </div>
            )}
          </motion.div>

          {/* Limited Photos Section (if limitedPhotos is provided from backend) */}
          {user.limitedPhotos && user.limitedPhotos.length > 0 && (
            <motion.div
              className="mt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h6 className="text-white mb-3">Recent Photos</h6>
              <div className="row g-2">
                {user.limitedPhotos.slice(0, 6).map((photo, index) => (
                  <div key={photo.id || index} className="col-4 col-md-2">
                    <img
                      src={photo.image}
                      alt={`Photo ${index + 1}`}
                      className="img-fluid rounded"
                      style={{ 
                        aspectRatio: "1/1", 
                        objectFit: "cover",
                        filter: "brightness(0.8)" 
                      }}
                    />
                  </div>
                ))}
              </div>
              {user.limitedPhotos.length > 6 && (
                <p className="text-white-50 mt-2 small">
                  And {user.limitedPhotos.length - 6} more photos...
                </p>
              )}
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default OtherUserProfiles;