import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { axiosInstance } from "../lib/axios";
import { useNavigate } from "react-router-dom";
import UserPosts from "../components/UserPosts";
import EnhancedBioSection from "../components/EnhancedBioSection";
import EnhancedUserStats from "../components/EnhancedUserStats";
import PostCard from "../components/PostCard";
import toast from "react-hot-toast";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/users/myProfile");
        setUser(res.data.user || res.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile. Please login.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleEditProfile = () => navigate("/edit-profile");
  const handleCreatePost = () => navigate("/create-post");
  const handleCreateStory = () => navigate("/create-story");

  // ✅ Fetch favorite posts
  const fetchFavorites = async () => {
    try {
      setLoadingFavorites(true);
      const res = await axiosInstance.get("/posts/favorites");
      if (res.data.success) {
        setFavorites(res.data.posts || []);
      } else {
        toast.error(res.data.message || "Failed to load favorites");
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      toast.error("Failed to fetch favorites");
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handleToggleFavorites = () => {
    if (!showFavorites) fetchFavorites();
    setShowFavorites(!showFavorites);
  };

  return (
    <motion.div
      className="container text-center py-5 mt-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {loading ? (
        <p className="text-white-50 normal-loading-spinner my-5">
          Loading<span className="dot-flash">.</span>
          <span className="dot-flash">.</span>
          <span className="dot-flash">.</span>
        </p>
      ) : (
        <>
          {/* Cover Photo */}
          <div className="position-relative mb-5 pt-3">
            <motion.img
              src={user?.coverPhoto}
              alt="Cover"
              className="img-fluid w-100 rounded"
              style={{ objectFit: "cover", height: "200px" }}
            />
            <motion.img
              src={user?.profilePicture}
              alt="Profile"
              className="rounded-circle border border-white shadow"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                position: "absolute",
                bottom: "-60px",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            />
          </div>

          {/* User Info */}
          <div className="mt-5 py-3">
            <h4 className="fw-bold">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : "Unnamed User"}
            </h4>
            <p className="text-white-50 mb-3">{user?.email}</p>
            <div className="d-flex justify-content-center flex-wrap gap-2">
              <button className="btn btn-success" onClick={handleEditProfile}>
                Edit Profile
              </button>
              <button className="btn btn-success" onClick={handleCreatePost}>
                Create Post
              </button>
              <button className="btn btn-secondary" onClick={handleCreateStory}>
                Add to Story
              </button>
            </div>
          </div>

          {/* Stats */}
          <EnhancedUserStats user={user} isOwnProfile={true} />

          {/* Bio */}
          <EnhancedBioSection user={user} />

          {/* ✅ Favorites Toggle Button */}
          <div className="my-4">
            <button
              className={`btn ${showFavorites ? "btn-primary" : "btn-outline-primary"}`}
              onClick={handleToggleFavorites}
            >
              {showFavorites ? "Show My Posts" : "Show Favorites"}
            </button>
          </div>

          {/* ✅ Favorites or Posts */}
          {showFavorites ? (
            loadingFavorites ? (
              <p className="text-center">Loading favorites...</p>
            ) : favorites.length === 0 ? (
              <p className="text-center text-muted">No favorite posts yet</p>
            ) : (
              <div className="mt-4">
                {favorites.map((post) => (
                  <PostCard key={post._id || post.id} post={post} />
                ))}
              </div>
            )
          ) : (
            <div>
              <UserPosts />
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}

export default ProfilePage;
