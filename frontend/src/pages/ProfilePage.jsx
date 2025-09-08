import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { axiosInstance } from "../lib/axios";
import { useNavigate } from "react-router-dom";
import UserPosts from "../components/UserPosts";
import EnhancedBioSection from "../components/EnhancedBioSection";
import EnhancedUserStats from "../components/EnhancedUserStats";
import PostCard from "../components/PostCard";
import toast from "react-hot-toast";
import CompletePagesSection from "../components/CompletePagesSection"; // Import the complete pages section
import PagePostsManagement from "../components/PagePostsManagement";

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'favorites', 'pages'
  const [selectedPage, setSelectedPage] = useState(null);
  const [showPagePosts, setShowPagePosts] = useState(false);
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

  // Fetch favorite posts
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

  // Handle like updates for favorites
  const handleLikeUpdate = (postId, newLikeCount, newIsLiked) => {
    setFavorites(prevFavorites =>
      prevFavorites.map(post =>
        post._id === postId || post.id === postId
          ? {
            ...post,
            likeCount: newLikeCount,
            isLiked: newIsLiked
          }
          : post
      )
    );
  };

  // Handle delete post from favorites
  const handleDeletePost = (postId) => {
    setFavorites(prevFavorites => 
      prevFavorites.filter(post => post._id !== postId && post.id !== postId)
    );
  };

  // Handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowFavorites(false);
    setShowPagePosts(false);
    setSelectedPage(null);
  };

  // Handle page selection for viewing posts
  const handleViewPagePosts = (page) => {
    setSelectedPage(page);
    setShowPagePosts(true);
    setActiveTab('page-posts');
  };

  const renderTabContent = () => {
    if (showPagePosts && selectedPage) {
      return (
        <div className="mt-4">
          <div className="mb-4">
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setShowPagePosts(false);
                setSelectedPage(null);
                setActiveTab('pages');
              }}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Pages
            </button>
          </div>
          <PagePostsManagement
            pageId={selectedPage.id || selectedPage._id}
            pageName={selectedPage.pageName}
            isOwner={true}
          />
        </div>
      );
    }

    switch (activeTab) {
      case 'favorites':
        return (
          <div className="mt-4">
            {loadingFavorites ? (
              <div className="text-center my-4">
                <div className="text-white normal-loading-spinner">
                  Loading favorites<span className="dot-flash">.</span>
                  <span className="dot-flash">.</span>
                  <span className="dot-flash">.</span>
                </div>
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center text-muted my-4">
                <p>No favorite posts yet</p>
              </div>
            ) : (
              <div style={{ textAlign: 'left' }}>
                {favorites.map((post, index) => (
                  <motion.div
                    key={post._id || post.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="mb-3"
                    style={{ textAlign: 'left' }}
                  >
                    <PostCard
                      post={post}
                      isUserPost={false}
                      onLikeUpdate={handleLikeUpdate}
                      onDeletePost={handleDeletePost}
                      disableNavigation={true}
                      alignLeft={true}
                      showAsFavorite={true}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case 'pages':
        return (
          <div className="mt-4">
            <CompletePagesSection onViewPagePosts={handleViewPagePosts} />
          </div>
        );

      case 'posts':
      default:
        return (
          <div className="mt-4" style={{ textAlign: 'left' }}>
            <UserPosts />
          </div>
        );
    }
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
              <button className="btn btn-outline-info" onClick={() => navigate("/activity-logs")}>
                Activity Logs
              </button>
            </div>
          </div>

          {/* Stats */}
          <EnhancedUserStats user={user} isOwnProfile={true} />

          {/* Bio */}
          <EnhancedBioSection user={user} />

          {/* Navigation Tabs */}
          <div className="my-4">
            <div className="d-flex justify-content-center flex-wrap gap-2">
              <button
                className={`btn ${activeTab === 'posts' ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => handleTabChange('posts')}
              >
                
                My Posts
              </button>
              <button
                className={`btn ${activeTab === 'favorites' ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => {
                  handleTabChange('favorites');
                  if (!showFavorites) fetchFavorites();
                  setShowFavorites(true);
                }}
              >
                
                ❤️ Favorites
              </button>
              <button
                className={`btn ${activeTab === 'pages' ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => handleTabChange('pages')}
              >
                
                My Pages
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + (showPagePosts ? '-page-posts' : '')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderTabContent()}
            </motion.div>
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}

export default ProfilePage;