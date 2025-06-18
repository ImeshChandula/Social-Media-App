import React, { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { axiosInstance } from "../lib/axios";
import { useNavigate } from "react-router-dom";
import UserPosts from "../components/UserPosts";
import EnhancedBioSection from "../components/EnhancedBioSection ";
import EnhancedUserStats from "../components/EnhancedUserStats";
import toast from "react-hot-toast";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  //const [error, setError] = useState("");
  const navigate = useNavigate();
  //const [showStoryModal, setShowStoryModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/users/myProfile");
        setUser(res.data.user || res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile. Please login.")
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
      className="container text-center py-5 py-md-0 mt-5 mt-md-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {loading ? (
        <p className="text-white-50 normal-loading-spinner my-5">Loading<span className="dot-flash">.</span><span className="dot-flash">.</span><span className="dot-flash">.</span></p>
      ) : (
        <>
          {/* Cover Photo */}
          <div className="position-relative mb-5 pt-3 mt-1 mt-md-0">
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
          <EnhancedUserStats user={user} isOwnProfile={true} />

          {/* bio section */}
          <EnhancedBioSection user={user} />

          {/* User Posts */}
          <div>
            <UserPosts />
          </div>
        </>
      )}
    </motion.div>
  );
}

export default ProfilePage;
