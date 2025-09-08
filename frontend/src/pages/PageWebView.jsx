import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import PostCard from "../components/PostCard";
import CreatePagePost from "../components/CreatePagePost";
import CreatePageStory from "../components/CreatePageStory";
import StoryViewer from "../components/StoryView";  
import WhatsAppContactButton from "../components/WhatsAppContactButton";
import useAuthStore from "../store/authStore";
import '../styles/PageWebView.css';
import {
  FaEdit,
  FaImage,
  FaUserCircle,
  FaUndo,
  FaSave,
} from "react-icons/fa";

const PageWebView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  // Content states
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingStories, setLoadingStories] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  
  // Create content modal states
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateStory, setShowCreateStory] = useState(false);
  
  // Story viewer states
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [pageStories, setPageStories] = useState(null);

  useEffect(() => {
    fetchPageDetails();
  }, [id]);

  useEffect(() => {
    if (page && activeTab === 'posts') {
      fetchPagePosts();
    } else if (page && activeTab === 'stories') {
      fetchPageStories();
    }
  }, [page, activeTab]);

  const fetchPageDetails = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/pages/${id}`);
      if (res?.data?.success) {
        const pageData = res.data.page;
        console.log('📄 Page Data Received:', pageData);
        console.log('👤 Current User ID:', authUser?.id);
        console.log('🏠 Page Owner ID:', pageData.owner?.id || pageData.owner);
        console.log('✅ Is Owner from API:', pageData.isOwner);
        
        setPage(pageData);
        setIsFollowing(pageData.isFollowing || false);
        
        
        const ownershipCheck = pageData.isOwner || 
                              (authUser && (
                                pageData.owner === authUser.id || 
                                pageData.owner?.id === authUser.id
                              ));
        
        console.log('🔧 Final Ownership Check:', ownershipCheck);
        setIsOwner(ownershipCheck);
      }
    } catch (err) {
      console.error('Error fetching page:', err);
      if (err.response?.status === 404) {
        toast.error("Page not found");
        navigate("/profile");
      } else {
        toast.error("Failed to load page");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPagePosts = async () => {
    setLoadingPosts(true);
    try {
      const res = await axiosInstance.get(`/pages/${id}/posts`);
      if (res?.data?.success) {
        setPosts(res.data.posts || []);
      }
    } catch (err) {
      console.error('Error fetching page posts:', err);
      toast.error("Failed to load page posts");
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchPageStories = async () => {
    setLoadingStories(true);
    try {
      const res = await axiosInstance.get(`/pages/${id}/stories`);
      if (res?.data?.success) {
        setStories(res.data.stories || []);
      }
    } catch (err) {
      console.error('Error fetching page stories:', err);
      toast.error("Failed to load page stories");
    } finally {
      setLoadingStories(false);
    }
  };

  // Function to handle profile picture click for story viewing
  const handleProfilePictureClick = async () => {
    try {
      console.log('📖 Profile picture clicked, fetching page stories...');
      const res = await axiosInstance.get(`/pages/${id}/stories`);
      
      if (res?.data?.success && res.data.stories?.length > 0) {
        // Filter active stories
        const now = new Date();
        const activeStories = res.data.stories.filter(story => {
          const expiresAt = new Date(story.expiresAt);
          return story.isActive && expiresAt > now;
        });

        if (activeStories.length > 0) {
          // Format stories for the story viewer
          const formattedStories = {
            user: {
              id: page.id,
              firstName: '',
              lastName: '',
              username: page.username || page.pageName,
              profilePicture: page.profilePicture,
              pageName: page.pageName,
              isPage: true,
              type: 'page'
            },
            stories: activeStories.map(story => ({
              ...story,
              _id: story._id || story.id,
              user: {
                id: page.id,
                firstName: '',
                lastName: '',
                username: page.username || page.pageName,
                profilePicture: page.profilePicture,
                pageName: page.pageName,
                isPage: true,
                type: 'page'
              },
              authorType: 'page'
            }))
          };

          setPageStories(formattedStories);
          setShowStoryViewer(true);
        } else {
          toast.info("No active stories available");
        }
      } else {
        toast.info("No stories available");
      }
    } catch (err) {
      console.error('Error fetching page stories for viewer:', err);
      toast.error("Failed to load stories");
    }
  };

  // Check if page has active stories for profile picture indicator
  const hasActiveStories = () => {
    if (!stories || stories.length === 0) return false;
    
    const now = new Date();
    return stories.some(story => {
      const expiresAt = new Date(story.expiresAt);
      return story.isActive && expiresAt > now;
    });
  };

  const handleFollow = async () => {
    if (!page) return;
    
    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const res = await axiosInstance.post(`/pages/${id}/${endpoint}`);
      
      if (res?.data?.success) {
        setIsFollowing(!isFollowing);
        
        toast.success(isFollowing ? "Unfollowed page" : "Following page");
      }
    } catch (err) {
      console.error('Error following/unfollowing page:', err);
      toast.error(err.response?.data?.message || "Failed to update follow status");
    }
  };

  const handleEditProfileUpdate = (updatedData) => {
    setPage(prev => ({ ...prev, ...updatedData }));
    setShowEditProfile(false);
    toast.success("Page profile updated successfully!");
  };

  const handleCreatePost = () => {
    console.log('🚀 Create Post Clicked - Is Owner:', isOwner);
    if (!isOwner) {
      toast.error("You don't have permission to create posts for this page");
      return;
    }
    setShowCreatePost(true);
  };

  const handleCreateStory = () => {
    console.log('📖 Create Story Clicked - Is Owner:', isOwner);
    if (!isOwner) {
      toast.error("You don't have permission to create stories for this page");
      return;
    }
    setShowCreateStory(true);
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreatePost(false);
    setActiveTab('posts');
    toast.success("Page post created successfully!");
  };

  const handleStoryCreated = (newStory) => {
    setStories(prev => [newStory, ...prev]);
    setShowCreateStory(false);
    setActiveTab('stories');
    toast.success("Page story created successfully!");
  };

  // Story management functions
  const handleStoryDelete = (storyId) => {
    setStories(prev => prev.filter(story => story._id !== storyId));
    
    // Update story viewer if open
    if (pageStories) {
      const updatedStories = pageStories.stories.filter(story => story._id !== storyId);
      if (updatedStories.length === 0) {
        setShowStoryViewer(false);
        setPageStories(null);
      } else {
        setPageStories(prev => ({
          ...prev,
          stories: updatedStories
        }));
      }
    }
    
    toast.success('Story deleted successfully');
  };

  const handleStoryUpdate = (updatedStory) => {
    setStories(prev =>
      prev.map(story =>
        story._id === updatedStory._id ? { ...story, ...updatedStory } : story
      )
    );

    // Update story viewer if open
    if (pageStories) {
      setPageStories(prev => ({
        ...prev,
        stories: prev.stories.map(story =>
          story._id === updatedStory._id ? { ...story, ...updatedStory } : story
        )
      }));
    }

    toast.success('Story updated successfully');
  };

  const handleDeletePost = (postId) => {
    setPosts(prevPosts => prevPosts.filter(post => (post._id || post.id) !== postId));
    toast.success("Post deleted successfully");
  };

  const updatePostLike = (postId, isLiked, likeCount) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        const currentPostId = post._id || post.id;
        if (currentPostId === postId) {
          return { 
            ...post, 
            isLiked, 
            likeCount: Math.max(0, likeCount)
          };
        }
        return post;
      })
    );
  };

  const reportPost = async (postId, reason) => {
    try {
      const response = await axiosInstance.post(`/posts/report/${postId}`, {
        reason: reason.trim()
      });

      if (response.data.success) {
        setPosts(prevPosts => prevPosts.filter(post => {
          const currentPostId = post._id || post.id;
          return currentPostId !== postId;
        }));
        
        toast.success("Post reported successfully");
        return { success: true, message: "Post reported successfully" };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Failed to report post";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-white normal-loading-spinner">
          Loading page<span className="dot-flash">.</span>
          <span className="dot-flash">.</span>
          <span className="dot-flash">.</span>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <h3 className="text-white">Page Not Found</h3>
          <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: "#1a1a1a" }}>
      {/* Cover Photo Section */}
      <div className="position-relative">
        <div
          className="w-100"
          style={{
            height: "300px",
            backgroundImage: page.coverPhoto 
              ? `url(${page.coverPhoto})` 
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}
        >
          <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-25"></div>
        </div>

        {/* Profile Picture and Basic Info */}
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="position-relative" style={{ marginTop: "-80px" }}>
                <div className="d-flex flex-column flex-md-row align-items-center align-items-md-start gap-4">
                  {/* Enhanced Profile Picture with Story Ring */}
                  <motion.div
                    className="position-relative"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div 
                      className="profile-picture-container position-relative"
                      onClick={handleProfilePictureClick}
                      style={{ 
                        cursor: hasActiveStories() ? 'pointer' : 'default',
                        borderRadius: '50%',
                        padding: hasActiveStories() ? '4px' : '0',
                        background: hasActiveStories() 
                          ? 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)'
                          : 'transparent'
                      }}
                    >
                      <img
                        src={page.profilePicture || "/default-page-avatar.png"}
                        alt={page.pageName}
                        className="rounded-circle border border-4 border-white shadow-lg"
                        style={{
                          width: "160px",
                          height: "160px",
                          objectFit: "cover",
                          backgroundColor: "white"
                        }}
                      />
                      
                      {/* Story indicator */}
                      {hasActiveStories() && (
                        <div
                          className="story-indicator position-absolute"
                          style={{
                            bottom: '10px',
                            right: '10px',
                            background: '#1877f2',
                            color: 'white',
                            borderRadius: '50%',
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            border: '3px solid white',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                          }}
                        >
                          📖
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Page Info */}
                  <div className="text-center text-md-start flex-grow-1 mt-3">
                    <motion.h1 
                      className="text-white fw-bold mb-2"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {page.pageName}
                    </motion.h1>
                    
                    {page.username && (
                      <motion.p 
                        className="text-info fs-5 mb-2"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        @{page.username}
                      </motion.p>
                    )}

                    <motion.div 
                      className="d-flex justify-content-center justify-content-md-start align-items-center gap-4 mb-3"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="text-center">
                        <div className="text-white fw-bold fs-4">{page.followersCount || page.followers?.length || 0}</div>
                        <div className="text-white-50 small">Followers</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white fw-bold fs-4">{page.postsCount || page.posts?.length || 0}</div>
                        <div className="text-white-50 small">Posts</div>
                      </div>
                      <div className="text-center">
                        <div className="text-white fw-bold fs-4">{stories.length}</div>
                        <div className="text-white-50 small">Stories</div>
                      </div>
                    </motion.div>

                    {/* Action Buttons - Enhanced with WhatsApp Contact */}
                    <motion.div 
                      className="d-flex justify-content-center justify-content-md-start gap-2 flex-wrap"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {!isOwner && (
                        <>
                          {/* Follow Button */}
                          <button
                            className={`btn ${isFollowing ? 'btn-outline-secondary' : 'btn-primary'} px-4`}
                            onClick={handleFollow}
                          >
                            <i className={`fas ${isFollowing ? 'fa-user-minus' : 'fa-user-plus'} me-2`}></i>
                            {isFollowing ? 'Following' : 'Follow'}
                          </button>
                          
                          {/* WhatsApp Contact Button - Only show for non-owners if page has phone */}
                          {page.phone && (
                            <WhatsAppContactButton 
                              pageId={id} 
                              pageName={page.pageName}
                              className="me-2"
                              size="md"
                            />
                          )}
                        </>
                      )}
                      
                      {/* About Button */}
                      <button
                        className="btn btn-outline-light px-4"
                        onClick={() => setShowAbout(true)}
                      >
                        
                        👤 About
                      </button>

                      {/* Owner-only buttons */}
                      {isOwner && (
                        <>
                          <button
                            className="btn btn-success px-3"
                            onClick={handleCreatePost}
                            title="Create Post"
                          >
                            
                             + Create Post
                          </button>
                          
                          <button
                            className="btn btn-info px-3"
                            onClick={handleCreateStory}
                            title="Create Story"
                          >
                            
                           + Create Story
                          </button>
                          
                          <button
                            className="btn btn-outline-success px-3"
                            onClick={() => setShowEditProfile(true)}
                          >
                            
                            Edit
                          </button>
                        </>
                      )}
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            {/* Tab Navigation */}
            <ul className="nav nav-pills mb-4 justify-content-center">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'posts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('posts')}
                >
                  <i className="fas fa-images me-2"></i>
                  Posts ({posts.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'stories' ? 'active' : ''}`}
                  onClick={() => setActiveTab('stories')}
                >
                  
                  Stories ({stories.length})
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === 'about' ? 'active' : ''}`}
                  onClick={() => setActiveTab('about')}
                >
                  
                  About
                </button>
              </li>
            </ul>

            {/* Tab Content */}
            <div className="tab-content">
              {/* Posts Tab */}
              {activeTab === 'posts' && (
                <div className="tab-pane fade show active">
                  {loadingPosts ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading posts...</span>
                      </div>
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="row">
                      {posts.map((post) => (
                        <div key={post._id || post.id} className="col-12 mb-4">
                          <PostCard
                            post={post}
                            isUserPost={isOwner}
                            onLikeUpdate={updatePostLike}
                            onDeletePost={handleDeletePost}
                            onReportPost={reportPost}
                            disableNavigation={false}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="fas fa-images text-white-50" style={{ fontSize: "4rem" }}></i>
                      <h5 className="text-white mt-3">No posts yet</h5>
                      <p className="text-white-50">
                        {isOwner ? "Start sharing content by creating your first post!" : "This page hasn't posted anything yet."}
                      </p>
                      {isOwner && (
                        <button className="btn btn-primary mt-3" onClick={handleCreatePost}>
                          
                           + Create First Post
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Stories Tab */}
              {activeTab === 'stories' && (
                <div className="tab-pane fade show active">
                  {loadingStories ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading stories...</span>
                      </div>
                    </div>
                  ) : stories.length > 0 ? (
                    <div className="row g-3">
                      {stories.map((story) => (
                        <div key={story._id || story.id} className="col-md-6 col-lg-4">
                          <div className="card bg-dark border-secondary h-100">
                            <div className="card-body">
                              {story.media ? (
                                <img
                                  src={story.media}
                                  alt="Story"
                                  className="img-fluid rounded mb-3"
                                  style={{ height: "200px", objectFit: "cover", width: "100%" }}
                                />
                              ) : (
                                <div 
                                  className="d-flex align-items-center justify-content-center rounded mb-3"
                                  style={{
                                    height: "200px",
                                    background: "linear-gradient(45deg,#405de6,#5851db,#833ab4,#c13584)"
                                  }}
                                >
                                  <p className="text-white text-center mb-0">
                                    {story.content}
                                  </p>
                                </div>
                              )}
                              {story.caption && (
                                <p className="text-white small">{story.caption}</p>
                              )}
                              <small className="text-muted">
                                {new Date(story.createdAt).toLocaleDateString()} • 
                                {story.viewCount || 0} views
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      
                      <h5 className="text-white mt-3">No stories yet</h5>
                      <p className="text-white-50">
                        {isOwner ? "Share quick updates with your followers!" : "This page hasn't shared any stories yet."}
                      </p>
                      {isOwner && (
                        <button className="btn btn-info mt-3" onClick={handleCreateStory}>
                          
                           + Create First Story
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* About Tab */}
              {activeTab === 'about' && (
                <AboutSection page={page} isOwner={isOwner} pageId={id} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content bg-dark text-white border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">Create Page Post</h5>
                <button 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowCreatePost(false)}
                ></button>
              </div>
              <div className="modal-body">
                <CreatePagePost
                  pageId={id}
                  pageData={page}
                  onPostCreated={handlePostCreated}
                  onCancel={() => setShowCreatePost(false)}
                  isModal={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Story Modal */}
      {showCreateStory && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content bg-dark text-white border-secondary">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">Create Page Story</h5>
                <button 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowCreateStory(false)}
                ></button>
              </div>
              <div className="modal-body">
                <CreatePageStory
                  pageId={id}
                  pageData={page}
                  onStoryCreated={handleStoryCreated}
                  onCancel={() => setShowCreateStory(false)}
                  isModal={true}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story Viewer Modal */}
      {showStoryViewer && pageStories && (
        <StoryViewer
          userStories={pageStories}
          onClose={() => {
            setShowStoryViewer(false);
            setPageStories(null);
          }}
          onDelete={handleStoryDelete}
          onUpdate={handleStoryUpdate}
          isUserPost={isOwner}
          currentUserId={authUser?.id}
        />
      )}

      {/* About Modal */}
      <AboutModal 
        show={showAbout}
        onClose={() => setShowAbout(false)}
        page={page}
        isOwner={isOwner}
      />

      {/* Edit Profile Modal */}
      {isOwner && (
        <EditProfileModal 
          show={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          page={page}
          onUpdate={handleEditProfileUpdate}
        />
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .profile-picture-container:hover {
          transform: scale(1.02);
          transition: transform 0.2s ease;
        }
        
        .story-indicator {
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

// About Section Component - Updated with WhatsApp Contact
const AboutSection = ({ page, isOwner, pageId }) => (
  <div className="row">
    <div className="col-lg-8">
      <div className="card bg-dark border-secondary mb-4">
        <div className="card-body">
          <h5 className="card-title text-white mb-3">
            <i className="fas fa-align-left me-2 text-primary"></i>
            Description
          </h5>
          <p className="text-white-50 mb-0" style={{ lineHeight: "1.6" }}>
            {page.description || "No description available"}
          </p>
        </div>
      </div>
    </div>
    <div className="col-lg-4">
      <div className="card bg-dark border-secondary mb-4">
        <div className="card-body">
          <h5 className="card-title text-white mb-3">
            <i className="fas fa-info me-2 text-primary"></i>
            Page Info
          </h5>
          
          <div className="mb-3">
            <strong className="text-white-50">Category:</strong>
            <div className="text-white">
              <span className="badge bg-info mt-1">
                {page.category ? page.category.charAt(0).toUpperCase() + page.category.slice(1) : 'Uncategorized'}
              </span>
            </div>
          </div>

          {page.phone && (
            <div className="mb-3">
              <strong className="text-white-50">Phone:</strong>
              <div className="text-white d-flex align-items-center justify-content-between">
                <div>
                  <i className="fas fa-phone me-2"></i>
                  {page.phone}
                </div>
                {!isOwner && (
                  <WhatsAppContactButton 
                    pageId={pageId} 
                    pageName={page.pageName}
                    size="sm"
                  />
                )}
              </div>
            </div>
          )}

          {page.email && (
            <div className="mb-3">
              <strong className="text-white-50">Email:</strong>
              <div className="text-white">
                <i className="fas fa-envelope me-2"></i>
                {page.email}
              </div>
            </div>
          )}

          {page.address && (
            <div className="mb-0">
              <strong className="text-white-50">Address:</strong>
              <div className="text-white">
                <i className="fas fa-map-marker-alt me-2"></i>
                {page.address}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Page Owner Card */}
      {page.owner && (
        <div className="card bg-dark border-secondary">
          <div className="card-body">
            <h5 className="card-title text-white mb-3">
              <i className="fas fa-user-circle me-2 text-primary"></i>
              Page Owner
            </h5>
            <div className="d-flex align-items-center">
              <img
                src={page.owner.profilePicture || "/default-avatar.png"}
                alt={`${page.owner.firstName} ${page.owner.lastName}`}
                className="rounded-circle me-3"
                style={{ width: "50px", height: "50px", objectFit: "cover" }}
              />
              <div>
                <div className="text-white fw-bold">
                  {page.owner.firstName} {page.owner.lastName}
                </div>
                {page.owner.username && (
                  <div className="text-info small">@{page.owner.username}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

// About Modal Component - Updated with WhatsApp Contact
import { FaInfoCircle, FaAlignLeft, FaChartBar, FaAddressBook, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

const AboutModal = ({ show, onClose, page, isOwner }) => {
  if (!show || !page) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border rounded-3 shadow-sm">
          {/* Header */}
          <div className="modal-header border-0 bg-light">
            <h5 className="modal-title d-flex align-items-center text-dark">
              <FaInfoCircle className="me-2 text-primary" />
              About {page.pageName}
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          {/* Body */}
          <div className="modal-body bg-white">
            <div className="row g-4">
              {/* Left column */}
              <div className="col-md-6">
                <div className="text-center mb-3">
                  <img
                    src={page.profilePicture || "/default-page-avatar.png"}
                    alt={page.pageName}
                    className="rounded-circle mb-3"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                      border: "3px solid #e0e0e0",
                    }}
                  />
                  <h5 className="text-dark fw-bold">{page.pageName}</h5>
                  {page.username && (
                    <p className="text-muted">@{page.username}</p>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div className="col-md-6">
                <h6 className="text-primary mb-2 d-flex align-items-center">
                  <FaAlignLeft className="me-2" />
                  Description
                </h6>
                <p className="text-muted mb-4">
                  {page.description || "No description available"}
                </p>

                <h6 className="text-primary mb-2 d-flex align-items-center">
                  <FaChartBar className="me-2" />
                  Statistics
                </h6>
                <div className="row text-center">
                  <div className="col-6">
                    <div className="fw-bold fs-5 text-dark">
                      {page.followersCount || 0}
                    </div>
                    <div className="text-muted small">Followers</div>
                  </div>
                  <div className="col-6">
                    <div className="fw-bold fs-5 text-dark">
                      {page.postsCount || 0}
                    </div>
                    <div className="text-muted small">Posts</div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="my-4 text-muted" />

            {/* Contact Details */}
            <h6 className="text-primary mb-3 d-flex align-items-center">
              <FaAddressBook className="me-2" />
              Contact Details
            </h6>
            <div className="row g-3">
              <div className="col-md-6">
                <strong className="text-muted">Category:</strong>
                <div>
                  <span className="badge bg-primary-subtle text-dark border">
                    {page.category
                      ? page.category.charAt(0).toUpperCase() +
                        page.category.slice(1)
                      : "Uncategorized"}
                  </span>
                </div>
              </div>

              {page.phone && (
                <div className="col-md-6">
                  <strong className="text-muted">Phone:</strong>
                  <div className="d-flex align-items-center justify-content-between text-dark">
                    <div>
                      <FaPhone className="me-2 text-secondary" />
                      {page.phone}
                    </div>
                    {!isOwner && (
                      <WhatsAppContactButton
                        pageId={page.id}
                        pageName={page.pageName}
                        size="sm"
                      />
                    )}
                  </div>
                </div>
              )}

              {page.email && (
                <div className="col-md-6">
                  <strong className="text-muted">Email:</strong>
                  <div className="text-dark">
                    <FaEnvelope className="me-2 text-secondary" />
                    {page.email}
                  </div>
                </div>
              )}

              {page.address && (
                <div className="col-12">
                  <strong className="text-muted">Address:</strong>
                  <div className="text-dark">
                    <FaMapMarkerAlt className="me-2 text-secondary" />
                    {page.address}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer bg-light border-0">
            <button className="btn btn-outline-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



// Edit Profile Modal Component
const EditProfileModal = ({ show, onClose, page, onUpdate }) => {
  const [formData, setFormData] = useState({
    description: "",
    profilePicture: "",
    coverPhoto: "",
  });
  const [loading, setLoading] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  useEffect(() => {
    if (show && page) {
      setFormData({
        description: page.description || "",
        profilePicture: page.profilePicture || "",
        coverPhoto: page.coverPhoto || "",
      });
      setProfilePreview(page.profilePicture || "");
      setCoverPreview(page.coverPhoto || "");
    }
  }, [show, page]);

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        if (type === "profile") {
          setProfileImageFile(file);
          setProfilePreview(base64);
          setFormData((prev) => ({ ...prev, profilePicture: base64 }));
        } else {
          setCoverImageFile(file);
          setCoverPreview(base64);
          setFormData((prev) => ({ ...prev, coverPhoto: base64 }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.put(
        `/pages/${page.id || page._id}/profile`,
        formData
      );

      if (res?.data?.success) {
        onUpdate(res.data.page);
        toast.success("Page profile updated successfully!");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    if (page) {
      setFormData({
        description: page.description || "",
        profilePicture: page.profilePicture || "",
        coverPhoto: page.coverPhoto || "",
      });
      setProfilePreview(page.profilePicture || "");
      setCoverPreview(page.coverPhoto || "");
      setProfileImageFile(null);
      setCoverImageFile(null);
    }
  };

  if (!show || !page) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border rounded-3 shadow-sm">
          {/* Header */}
          <div className="modal-header bg-light border-0">
            <h5 className="modal-title d-flex align-items-center text-dark">
              <FaEdit className="me-2 text-success" />
              Edit Page Profile
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body bg-white">
              <div className="alert alert-info bg-info bg-opacity-10 border border-info border-opacity-25 mb-4">
                <small className="d-flex align-items-center">
                  <FaInfoCircle className="me-2 text-info" />
                  Update your page’s visual appearance and description. Images
                  should be under 5MB.
                </small>
              </div>

              {/* Cover Photo */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <FaImage className="me-2 text-secondary" />
                  Cover Photo
                </label>
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, "cover")}
                    />
                    <small className="text-muted">
                      Recommended: 1200x300px or similar wide format
                    </small>
                  </div>
                  <div className="col-md-4">
                    {coverPreview && (
                      <div className="position-relative">
                        <img
                          src={coverPreview}
                          alt="Cover Preview"
                          className="rounded"
                          style={{
                            width: "100%",
                            height: "60px",
                            objectFit: "cover",
                          }}
                        />
                        {coverImageFile && (
                          <span className="badge bg-success position-absolute top-0 end-0">
                            Updated
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Picture */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <FaUserCircle className="me-2 text-secondary" />
                  Profile Picture
                </label>
                <div className="row align-items-center">
                  <div className="col-md-8">
                    <input
                      type="file"
                      className="form-control"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, "profile")}
                    />
                    <small className="text-muted">
                      Recommended: Square image (500x500px or similar)
                    </small>
                  </div>
                  <div className="col-md-4">
                    {profilePreview && (
                      <div className="position-relative">
                        <img
                          src={profilePreview}
                          alt="Profile Preview"
                          className="rounded-circle"
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                          }}
                        />
                        {profileImageFile && (
                          <span className="badge bg-success position-absolute top-0 end-0">
                            Updated
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  <FaAlignLeft className="me-2 text-secondary" />
                  Page Description <span className="text-danger">*</span>
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Tell people what your page is about..."
                  required
                  maxLength={500}
                />
                <small className="text-muted">
                  {formData.description.length}/500 characters
                </small>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer bg-light border-0">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={resetForm}
              >
                <FaUndo className="me-2" />
                Reset
              </button>
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave className="me-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


export default PageWebView;