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
  FaArrowLeft,
  FaThumbsUp,
  FaUserPlus,
  FaEnvelope,
  FaShare,
  FaEllipsisH,
  FaMapMarkerAlt,
  FaPhone,
  FaClock,
  FaGlobe,
  FaStar,
  FaVideo,
  FaCalendar,
  FaInfoCircle,
  FaAlignLeft,
  FaChartBar,
  FaAddressBook
} from "react-icons/fa";
import useThemeStore from "../store/themeStore";

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
  const { isDarkMode } = useThemeStore();

  // Content states
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingStories, setLoadingStories] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

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
    if (page && (activeTab === 'home' || activeTab === 'posts')) {
      fetchPagePosts();
    } else if (page && activeTab === 'reviews') {
      // Fetch reviews if you have an endpoint
    }
  }, [page, activeTab]);

  const fetchPageDetails = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/pages/${id}`);
      if (res?.data?.success) {
        const pageData = res.data.page;
        setPage(pageData);
        setIsFollowing(pageData.isFollowing || false);

        const ownershipCheck = pageData.isOwner ||
          (authUser && (
            pageData.owner === authUser.id ||
            pageData.owner?.id === authUser.id
          ));

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

  const handleProfilePictureClick = async () => {
    try {
      const res = await axiosInstance.get(`/pages/${id}/stories`);

      if (res?.data?.success && res.data.stories?.length > 0) {
        const now = new Date();
        const activeStories = res.data.stories.filter(story => {
          const expiresAt = new Date(story.expiresAt);
          return story.isActive && expiresAt > now;
        });

        if (activeStories.length > 0) {
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
    if (!isOwner) {
      toast.error("You don't have permission to create posts for this page");
      return;
    }
    setShowCreatePost(true);
  };

  const handleCreateStory = () => {
    if (!isOwner) {
      toast.error("You don't have permission to create stories for this page");
      return;
    }
    setShowCreateStory(true);
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
    setShowCreatePost(false);
    toast.success("Page post created successfully!");
  };

  const handleStoryCreated = (newStory) => {
    setStories(prev => [newStory, ...prev]);
    setShowCreateStory(false);
    toast.success("Page story created successfully!");
  };

  const handleStoryDelete = (storyId) => {
    setStories(prev => prev.filter(story => story._id !== storyId));

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
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="text-center">
          <h3 className={`${isDarkMode ? "text-white" : "text-black"}`}>Page Not Found</h3>
          <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100">
      {/* Header Section */}
      <div className="shadow-sm">
        {/* Cover Photo */}
        <div className="position-relative" style={{ height: "400px" }}>
          <img
            src={page.coverPhoto || "https://via.placeholder.com/1200x400/667eea/ffffff?text=Cover+Photo"}
            alt="Cover"
            className="w-100 h-100"
            style={{ objectFit: "cover", borderRadius: "10px" }}
          />

        </div>

        {/* Page Info Header */}
        <div className="container" style={{ marginTop: "-80px", position: "relative" }}>
          <div className="row">
            <div className="col-12">
              <div className="d-flex align-items-center justify-content-between flex-wrap mb-3">
                {/* Back Button */}
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => navigate(-1)}
                  title="Go back"
                >
                  <FaArrowLeft className="text-dark" />
                </button>
                {/* Action Buttons */}
                <div className="d-flex gap-2">
                  {!isOwner ? (
                    <>
                      <button
                        className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                        onClick={handleFollow}
                      >
                        <FaThumbsUp className="me-2" />
                        {isFollowing ? 'Followed' : 'Follow'}
                      </button>
                      <button className="btn btn-light">
                        <FaShare className="me-2" />
                        Share
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-light" onClick={() => setShowEditProfile(true)}>
                        <FaEdit className="me-2" />
                        Edit Page
                      </button>

                    </>
                  )}
                </div>
              </div>
              <div className="d-flex align-items-end justify-content-between flex-wrap">
                {/* Profile Picture */}
                <div className="d-flex align-items-end gap-3">
                  <div
                    className="position-relative"
                    onClick={handleProfilePictureClick}
                    style={{
                      cursor: hasActiveStories() ? 'pointer' : 'default',
                    }}
                  >
                    <img
                      src={page.profilePicture || "/default-page-avatar.png"}
                      alt={page.pageName}
                      className="rounded-circle border-5 border-white"
                      style={{
                        width: "168px",
                        height: "168px",
                        objectFit: "cover",
                        backgroundColor: "white"
                      }}
                    />
                    {hasActiveStories() && (
                      <div
                        className="position-absolute"
                        style={{
                          bottom: '10px',
                          right: '10px',
                          background: '#1877f2',
                          color: 'white',
                          borderRadius: '50%',
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: '4px solid white'
                        }}
                      >
                        <FaImage size={16} />
                      </div>
                    )}
                  </div>

                  {/* Page Name & Stats */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <h1 className={`mb-0 ${isDarkMode ? "text-white" : "text-black"}`} style={{ fontSize: "32px", fontWeight: "700" }}>
                        {page.pageName}
                      </h1>

                    </div>
                    <div className="text-secondary mt-1">
                      {page.category && (
                        <span className="me-3">{page.category.charAt(0).toUpperCase() + page.category.slice(1)}</span>
                      )}
                    </div>
                    <div className="d-flex gap-3 mt-2 text-dark">

                      <span className={`mb-0 ${isDarkMode ? "text-white" : "text-black"}`}>
                        < FaUserPlus className="me-1" />
                        <strong>{page.followersCount || 0}</strong> Followers
                      </span>

                      <span className={`mb-0 ${isDarkMode ? "text-white" : "text-black"}`}>
                        <FaThumbsUp className="me-1" />
                        <strong>{stories.length || 0}</strong> Stories
                      </span>

                      <span className={`mb-0 ${isDarkMode ? "text-white" : "text-black"}`}>
                        <FaMapMarkerAlt className="me-1" />
                        <strong>{page.postsCount || 0}</strong> Posts
                      </span>

                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="border-top mt-3">
                <ul className="nav nav-tabs border-0" style={{ marginLeft: "0" }}>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'home' ? 'active' : ''} border-0`}
                      onClick={() => setActiveTab('home')}
                      style={{
                        color: activeTab === 'home' ? '#1877f2' : '#4a5568',
                        borderBottom: activeTab === 'home' ? '3px solid #1877f2' : 'none',
                        fontWeight: '600'
                      }}
                    >
                      Home
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'about' ? 'active' : ''} border-0`}
                      onClick={() => setActiveTab('about')}
                      style={{
                        color: activeTab === 'about' ? '#1877f2' : '#4a5568',
                        borderBottom: activeTab === 'about' ? '3px solid #1877f2' : 'none',
                        fontWeight: '600'
                      }}
                    >
                      About
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'posts' ? 'active' : ''} border-0`}
                      onClick={() => setActiveTab('posts')}
                      style={{
                        color: activeTab === 'posts' ? '#1877f2' : '#4a5568',
                        borderBottom: activeTab === 'posts' ? '3px solid #1877f2' : 'none',
                        fontWeight: '600'
                      }}
                    >
                      Posts
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'photos' ? 'active' : ''} border-0`}
                      onClick={() => setActiveTab('photos')}
                      style={{
                        color: activeTab === 'photos' ? '#1877f2' : '#4a5568',
                        borderBottom: activeTab === 'photos' ? '3px solid #1877f2' : 'none',
                        fontWeight: '600'
                      }}
                    >
                      Photos
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      className={`nav-link ${activeTab === 'videos' ? 'active' : ''} border-0`}
                      onClick={() => setActiveTab('videos')}
                      style={{
                        color: activeTab === 'videos' ? '#1877f2' : '#4a5568',
                        borderBottom: activeTab === 'videos' ? '3px solid #1877f2' : 'none',
                        fontWeight: '600'
                      }}
                    >
                      Videos
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-4">
        <div className="row">
          {/* Left Sidebar - About Section */}
          <div className="col-lg-5 col-xl-4 mb-4">
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <h5 className="card-title fw-bold text-dark mb-3">About</h5>
                <p className="text-secondary mb-3">
                  {page.description || "No description available"}
                </p>
                <button className={`nav-link ${activeTab === 'about' ? 'active' : ''} btn btn-light w-100`}
                  onClick={() => setActiveTab('about')}>
                  See more</button>
              </div>
            </div>

            {/* Contact Info Card */}
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <h6 className="fw-bold text-dark mb-3">Contact Info</h6>

                {page.address && (
                  <div className="d-flex align-items-start mb-3">
                    <FaMapMarkerAlt className="mt-1 me-3 text-secondary" />
                    <div>
                      <div className="text-secondary small">Address</div>
                      <div className="text-dark">{page.address}</div>
                    </div>
                  </div>
                )}

                {page.phone && (
                  <div className="d-flex align-items-start mb-3">
                    <FaPhone className="mt-1 me-3 text-secondary" />
                    <div className="flex-grow-1">
                      <div className="text-secondary small">Phone</div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-dark">{page.phone}</span>
                        {!isOwner && (
                          <WhatsAppContactButton
                            pageId={id}
                            pageName={page.pageName}
                            size="sm"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {page.email && (
                  <div className="d-flex align-items-start mb-3">
                    <FaEnvelope className="mt-1 me-3 text-secondary" />
                    <div>
                      <div className="text-secondary small">Email</div>
                      <div className="text-dark">{page.email}</div>
                    </div>
                  </div>
                )}

                {page.website && (
                  <div className="d-flex align-items-start">
                    <FaGlobe className="mt-1 me-3 text-secondary" />
                    <div>
                      <div className="text-secondary small">Website</div>
                      <a href={page.website} target="_blank" rel="noopener noreferrer" className="text-primary">
                        {page.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Reviews Card 
            <div className="card border-0 shadow-sm mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold text-dark mb-0">Reviews</h6>
                  <div className="text-warning">
                    <FaStar /> <strong>4.7</strong> <span className="text-secondary">(3)</span>
                  </div>
                </div>
                */}
            {/* Sample Review 1 
                <div className="mb-3 pb-3 border-bottom">
                  <div className="d-flex gap-2 mb-2">
                    <img
                      src="https://via.placeholder.com/40"
                      alt="Reviewer"
                      className="rounded-circle"
                      style={{ width: "40px", height: "40px" }}
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong className="text-dark">Priya Sharma</strong>
                          <span className="badge bg-success ms-2" style={{ fontSize: "10px" }}>✓</span>
                        </div>
                      </div>
                      <div className="text-warning small">
                        <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                      </div>
                      <div className="text-secondary small">1 week ago</div>
                    </div>
                  </div>
                  <p className="mb-0 small text-dark">
                    Excellent service and innovative solutions. TechCorp helped transform our business operations completely. Highly recommended!
                  </p>
                </div>

                {/* Sample Review 2 
                <div className="mb-3">
                  <div className="d-flex gap-2 mb-2">
                    <img
                      src="https://via.placeholder.com/40"
                      alt="Reviewer"
                      className="rounded-circle"
                      style={{ width: "40px", height: "40px" }}
                    />
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong className="text-dark">Rajesh Kumar</strong>
                          <span className="badge bg-success ms-2" style={{ fontSize: "10px" }}>✓</span>
                        </div>
                      </div>
                      <div className="text-warning small">
                        <FaStar /><FaStar /><FaStar /><FaStar />
                      </div>
                      <div className="text-secondary small">2 weeks ago</div>
                    </div>
                  </div>
                  <p className="mb-0 small text-dark">
                    Outstanding technical support and cutting-edge technology. The team is professional and delivers on time.
                  </p>
                </div>

                <button className="btn btn-light w-100 mt-2">See all 3 reviews</button>
              </div>
            </div>
                  */}
            {/* Get in Touch Card */}
            <div className="card border-0 shadow-sm" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              <div className="card-body text-white">
                <h5 className="fw-bold mb-2">Get in Touch</h5>
                <p className="mb-3">Ready to transform your business? Contact us today!</p>
                <WhatsAppContactButton
                  className="btn btn-light w-100"
                  pageId={page.id}
                  pageName={page.pageName}
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Right Content - Posts Feed */}
          <div className="col-lg-7 col-xl-8">
            {/* Create Post Card - Only for owners */}
            {isOwner && activeTab === 'home' && (
              <div className="card border-0 shadow-sm mb-3">
                <div className="card-body">
                  <div className="d-flex gap-2">
                    <img
                      src={page.profilePicture || "/default-page-avatar.png"}
                      alt={page.pageName}
                      className="rounded-circle"
                      style={{ width: "40px", height: "40px", objectFit: "cover" }}
                    />
                    <button
                      className="btn btn-light w-100 text-start"
                      onClick={handleCreatePost}
                      style={{ borderRadius: "20px", backgroundColor: "#f0f2f5" }}
                    >
                      What's on your mind?
                    </button>
                  </div>
                  <hr />
                  <div className="d-flex justify-content-around">
                    <button className="btn btn-light flex-grow-1 me-1" onClick={handleCreateStory}>
                      <FaVideo className="text-danger me-2" />
                      Story
                    </button>
                    <button className="btn btn-light flex-grow-1 mx-1" onClick={handleCreatePost}>
                      <FaImage className="text-success me-2" />
                      Photo/Video
                    </button>
                    <button className="btn btn-light flex-grow-1 ms-1">
                      <FaCalendar className="text-primary me-2" />
                      Event
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Posts List */}
            {(activeTab === 'home' || activeTab === 'posts') && (
              <>
                {loadingPosts ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading posts...</span>
                    </div>
                  </div>
                ) : posts.length > 0 ? (
                  <>
                    {posts.map((post) => (
                      <div key={post._id || post.id} className="mb-3">
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
                  </>
                ) : (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body text-center py-5">
                      <FaImage size={64} className="text-secondary mb-3" />
                      <h5 className="text-dark">No posts yet</h5>
                      <p className="text-secondary">
                        {isOwner ? "Start sharing content by creating your first post!" : "This page hasn't posted anything yet."}
                      </p>
                      {isOwner && (
                        <button className="btn btn-primary mt-3" onClick={handleCreatePost}>
                          Create First Post
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* About Tab Content */}
            {activeTab === 'about' && (
              <AboutTabContent page={page} isOwner={isOwner} pageId={id} />
            )}

            {/* Reviews Tab Content */}
            {activeTab === 'reviews' && (
              <ReviewsTabContent page={page} />
            )}

            {/* Photos Tab Content */}
            {activeTab === 'photos' && (
              <PhotosTabContent posts={posts} />
            )}

            {/* Videos Tab Content */}
            {activeTab === 'videos' && (
              <VideosTabContent posts={posts} />
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold text-dark">Create Post</h5>
                <button
                  className="btn-close"
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

      {/* Edit Profile Modal */}
      {isOwner && (
        <EditProfileModal
          show={showEditProfile}
          onClose={() => setShowEditProfile(false)}
          page={page}
          onUpdate={handleEditProfileUpdate}
        />
      )}
    </div>
  );
};

// About Tab Content Component
const AboutTabContent = ({ page, isOwner, pageId }) => (
  <div className="card border-0 shadow-sm">
    <div className="card-body">
      <h5 className="fw-bold text-dark mb-4">About</h5>

      <div className="mb-4">
        <h6 className="fw-bold text-dark mb-2">Overview</h6>
        <p className="text-secondary">
          {page.description || "No description available"}
        </p>
      </div>

      <div className="mb-4">
        <h6 className="fw-bold text-dark mb-3">Page Info</h6>

        {page.category && (
          <div className="mb-3">
            <strong className="text-dark">Category:</strong>
            <div className="mt-1">
              <span className="badge bg-light text-dark border">
                {page.category.charAt(0).toUpperCase() + page.category.slice(1)}
              </span>
            </div>
          </div>
        )}

        {page.address && (
          <div className="mb-3">
            <strong className="text-dark">Address:</strong>
            <div className="mt-1 text-secondary">
              <FaMapMarkerAlt className="me-2" />
              {page.address}
            </div>
          </div>
        )}

        {page.phone && (
          <div className="mb-3">
            <strong className="text-dark">Phone:</strong>
            <div className="mt-1 text-secondary d-flex justify-content-between align-items-center">
              <span>
                <FaPhone className="me-2" />
                {page.phone}
              </span>
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
            <strong className="text-dark">Email:</strong>
            <div className="mt-1 text-secondary">
              <FaEnvelope className="me-2" />
              {page.email}
            </div>
          </div>
        )}
      </div>

      {page.owner && (
        <div>
          <h6 className="fw-bold text-dark mb-3">Page Transparency</h6>
          <div className="d-flex align-items-center p-3 bg-light rounded">
            <img
              src={page.owner.profilePicture || "/default-avatar.png"}
              alt={`${page.owner.firstName} ${page.owner.lastName}`}
              className="rounded-circle me-3"
              style={{ width: "48px", height: "48px", objectFit: "cover" }}
            />
            <div>
              <div className="fw-bold text-dark">
                {page.owner.firstName} {page.owner.lastName}
              </div>
              <div className="text-secondary small">Page Owner</div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

// Reviews Tab Content Component
const ReviewsTabContent = ({ page }) => (
  <div className="card border-0 shadow-sm">
    <div className="card-body">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="fw-bold text-dark mb-1">Reviews</h5>
          <div className="text-warning">
            <FaStar /><FaStar /><FaStar /><FaStar className="text-secondary" /><FaStar className="text-secondary" />
            <span className="ms-2 text-dark"><strong>4.7</strong> out of 5</span>
          </div>
          <div className="text-secondary small">3 reviews</div>
        </div>
        <button className="btn btn-primary">Write a Review</button>
      </div>

      <hr />

      {/* Review 1 */}
      <div className="mb-4">
        <div className="d-flex gap-3 mb-2">
          <img
            src="https://via.placeholder.com/48"
            alt="Reviewer"
            className="rounded-circle"
            style={{ width: "48px", height: "48px" }}
          />
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <strong className="text-dark">Priya Sharma</strong>
                <span className="badge bg-success ms-2" style={{ fontSize: "10px" }}>✓</span>
                <div className="text-warning small mt-1">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                </div>
                <div className="text-secondary small">1 week ago</div>
              </div>
            </div>
            <p className="mt-2 mb-0 text-dark">
              Excellent service and innovative solutions. TechCorp helped transform our business operations completely. Highly recommended!
            </p>
          </div>
        </div>
      </div>

      {/* Review 2 */}
      <div className="mb-4">
        <div className="d-flex gap-3 mb-2">
          <img
            src="https://via.placeholder.com/48"
            alt="Reviewer"
            className="rounded-circle"
            style={{ width: "48px", height: "48px" }}
          />
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <strong className="text-dark">Rajesh Kumar</strong>
                <span className="badge bg-success ms-2" style={{ fontSize: "10px" }}>✓</span>
                <div className="text-warning small mt-1">
                  <FaStar /><FaStar /><FaStar /><FaStar />
                </div>
                <div className="text-secondary small">2 weeks ago</div>
              </div>
            </div>
            <p className="mt-2 mb-0 text-dark">
              Outstanding technical support and cutting-edge technology. The team is professional and delivers on time.
            </p>
          </div>
        </div>
      </div>

      {/* Review 3 */}
      <div className="mb-4">
        <div className="d-flex gap-3 mb-2">
          <img
            src="https://via.placeholder.com/48"
            alt="Reviewer"
            className="rounded-circle"
            style={{ width: "48px", height: "48px" }}
          />
          <div className="flex-grow-1">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <strong className="text-dark">Amit Patel</strong>
                <span className="badge bg-success ms-2" style={{ fontSize: "10px" }}>✓</span>
                <div className="text-warning small mt-1">
                  <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                </div>
                <div className="text-secondary small">1 month ago</div>
              </div>
            </div>
            <p className="mt-2 mb-0 text-dark">
              Great experience working with TechCorp Solutions. Their innovative approach and dedication to excellence is commendable.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Photos Tab Content Component
const PhotosTabContent = ({ posts }) => {
  const photoPosts = posts.filter(post => post.image || post.media);

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <h5 className="fw-bold text-dark mb-4">Photos</h5>
        {photoPosts.length > 0 ? (
          <div className="row g-2">
            {photoPosts.map((post, index) => (
              <div key={post._id || post.id} className="col-4">
                <div className="ratio ratio-1x1">
                  <img
                    src={post.image || post.media}
                    alt={`Photo ${index + 1}`}
                    className="rounded"
                    style={{ objectFit: "cover", cursor: "pointer" }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <FaImage size={64} className="text-secondary mb-3" />
            <p className="text-secondary">No photos available</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Videos Tab Content Component
const VideosTabContent = ({ posts }) => {
  const videoPosts = posts.filter(post => post.video);

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <h5 className="fw-bold text-dark mb-4">Videos</h5>
        {videoPosts.length > 0 ? (
          <div className="row g-3">
            {videoPosts.map((post) => (
              <div key={post._id || post.id} className="col-12">
                <video
                  src={post.video}
                  controls
                  className="w-100 rounded"
                  style={{ maxHeight: "400px" }}
                />
                {post.content && (
                  <p className="mt-2 text-dark">{post.content}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <FaVideo size={64} className="text-secondary mb-3" />
            <p className="text-secondary">No videos available</p>
          </div>
        )}
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
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold text-dark">
              <FaEdit className="me-2" />
              Edit Page Profile
            </h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="alert alert-info mb-4">
                <small className="d-flex align-items-center">
                  <FaInfoCircle className="me-2" />
                  Update your page's visual appearance and description. Images should be under 5MB.
                </small>
              </div>

              {/* Cover Photo */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  <FaImage className="me-2" />
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
                    <small className="text-secondary">
                      Recommended: 1200x400px or similar wide format
                    </small>
                  </div>
                  <div className="col-md-4">
                    {coverPreview && (
                      <div className="position-relative">
                        <img
                          src={coverPreview}
                          alt="Cover Preview"
                          className="rounded w-100"
                          style={{ height: "60px", objectFit: "cover" }}
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
                <label className="form-label fw-semibold text-dark">
                  <FaUserCircle className="me-2" />
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
                    <small className="text-secondary">
                      Recommended: Square image (500x500px or similar)
                    </small>
                  </div>
                  <div className="col-md-4">
                    {profilePreview && (
                      <div className="position-relative text-center">
                        <img
                          src={profilePreview}
                          alt="Profile Preview"
                          className="rounded-circle"
                          style={{ width: "80px", height: "80px", objectFit: "cover" }}
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
                <label className="form-label fw-semibold text-dark">
                  <FaAlignLeft className="me-2" />
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
                <small className="text-secondary">
                  {formData.description.length}/500 characters
                </small>
              </div>
            </div>

            <div className="modal-footer border-top">
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
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
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