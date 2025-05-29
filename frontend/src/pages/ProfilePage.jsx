import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { axiosInstance } from "../lib/axios";
import { useNavigate } from "react-router-dom";
import UserPosts from "../components/UserPosts";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [showStoryModal, setShowStoryModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/users/myProfile");
        setUser(res.data.user || res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile. Please login.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  const handleCreatePost = () => {
    navigate("/create-post");
  };

  const handleCreateStory = () => {
    navigate("/create-story");
  };

  return (
    <motion.div
      className="container text-center py-5 py-md-0 mt-2 mt-md-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {loading ? (
        <p className="text-white-50 loading-spinner">Loading...</p>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <>
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
            <p className="text-white-50 mb-3">{user?.email}</p>
            <div className="d-flex justify-content-center flex-wrap gap-2">
              <motion.button
                className="btn btn-success"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEditProfile}
              >
                Edit Profile
              </motion.button>

              <motion.button
                className="btn btn-success"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreatePost}
              >
                Create Post
              </motion.button>

              <motion.button
                className="btn btn-secondary"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateStory}
              >
                Add to Story
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
            <UserPosts />
          </div>
        </>
      )}
    </motion.div>
  );
}

export default ProfilePage;
