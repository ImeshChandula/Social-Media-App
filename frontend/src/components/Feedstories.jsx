import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import Stories from "./Stories";
import StoryViewer from "./StoryView";
import toast from "react-hot-toast";

const Feedstories = ({ type = "all" }) => {
  const [stories, setStories] = useState([]);
  const [groupedStories, setGroupedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserStories, setSelectedUserStories] = useState(null);
  const [showStoryViewer, setShowStoryViewer] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Get current user ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await axiosInstance.get("/users/myProfile");
        setCurrentUserId(res.data.user.id);
      } catch (err) {
        console.error("Failed to fetch current user:", err);
      }
    };
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        setError(null);

        let endpoint;
        if (type === "me") {
          endpoint = "/stories/me";
        } else {
          // Use the new combined feed endpoint that includes both user and page stories
          endpoint = "/feed/stories";
        }

        console.log(`Fetching stories from endpoint: ${endpoint}`);

        const res = await axiosInstance.get(endpoint);

        console.log('Raw API response:', res.data);

        let processedStories = [];
        if (type === "me") {
          // Handle "me" endpoint response (user's own stories only)
          const userStories = Array.isArray(res.data.stories) ? res.data.stories : [];
          processedStories = userStories.map(story => ({
            ...story,
            _id: story._id || story.id,
            user: story.user || {
              id: story.userId || 'unknown',
              username: story.user?.username || 'Unknown User',
              profilePicture: story.user?.profilePicture || 'https://via.placeholder.com/40',
              firstName: story.user?.firstName || '',
              lastName: story.user?.lastName || ''
            }
          }));

          // Group stories by user for "me" type
          const grouped = groupStoriesByUser(processedStories);
          setGroupedStories(grouped);
          console.log('Processed user stories:', processedStories);
        } else {
          // Handle combined feed endpoint response (users + pages)
          const feedStories = Array.isArray(res.data.stories) ? res.data.stories : [];
          
          // Enhanced handling of user data from backend for both users and pages
          const grouped = feedStories.map(group => {
            const userData = group.user || {};
            
            // Enhanced user data processing for pages
            const processedUser = {
              id: userData.id || 'unknown',
              username: userData.username || userData.pageName || `user_${userData.id || 'unknown'}`,
              profilePicture: userData.profilePicture || 'https://via.placeholder.com/40',
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              // Page-specific fields
              pageName: userData.pageName || undefined,
              isPage: userData.isPage || userData.type === 'page' || false,
              type: userData.type || 'user'
            };

            return {
              user: processedUser,
              stories: (group.stories || []).map(story => ({
                ...story,
                _id: story._id || story.id,
                user: processedUser,
                // Preserve page story information
                authorType: story.authorType || (processedUser.isPage ? 'page' : 'user')
              })).filter(story => 
                story.privacy === 'friends' || story.privacy === 'public'
              ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            };
          }).filter(group => group.stories.length > 0);

          setGroupedStories(grouped);
          
          // Flatten for individual story processing if needed
          processedStories = grouped.flatMap(group => group.stories);
          console.log('Processed combined feed stories:', processedStories);
          
          // Debug logging for user data
          console.log('User/Page data in grouped stories:', grouped.map(g => ({
            userId: g.user.id,
            username: g.user.username,
            firstName: g.user.firstName,
            lastName: g.user.lastName,
            pageName: g.user.pageName,
            isPage: g.user.isPage,
            type: g.user.type,
            authorType: g.stories[0]?.authorType,
            displayName: getDisplayName(g.user)
          })));
        }

        setStories(processedStories);

        // Mark stories as viewed for feed (not for "me")
        if (type !== "me" && processedStories.length > 0) {
          await Promise.all(
            processedStories.map(story =>
              story._id ? markStoryAsViewed(story._id) : Promise.resolve()
            )
          );
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message || "Failed to load stories. Please try again.";
        console.error("Fetch stories error:", err.response || err);
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [type]);

  // Function to group stories by user
  const groupStoriesByUser = (stories) => {
    const grouped = stories.reduce((acc, story) => {
      const userId = story.user?.id || story.userId;
      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: []
        };
      }
      acc[userId].stories.push(story);
      return acc;
    }, {});

    return Object.values(grouped);
  };

  const markStoryAsViewed = async (storyId) => {
    try {
      console.log(`Marking story ${storyId} as viewed`);
      const res = await axiosInstance.put(`/stories/${storyId}/view`);
      setStories(prev =>
        prev.map(story =>
          story._id === storyId
            ? { ...story, viewCount: res.data.viewCount || story.viewCount, viewers: res.data.viewers || story.viewers }
            : story
        )
      );
    } catch (err) {
      console.error(`Failed to mark story ${storyId} as viewed:`, err.response || err);
    }
  };

  const handleDelete = (storyId) => {
    console.log(`Deleting story ${storyId}`);
    
    // Update individual stories array
    setStories(prev => prev.filter(story => story._id !== storyId));
    
    // Update grouped stories as well
    setGroupedStories(prev => 
      prev.map(group => ({
        ...group,
        stories: group.stories.filter(story => story._id !== storyId)
      })).filter(group => group.stories.length > 0)
    );

    // Close story viewer if no stories left
    if (selectedUserStories) {
      const updatedStories = selectedUserStories.stories.filter(story => story._id !== storyId);
      if (updatedStories.length === 0) {
        setShowStoryViewer(false);
        setSelectedUserStories(null);
      } else {
        setSelectedUserStories(prev => ({
          ...prev,
          stories: updatedStories
        }));
      }
    }

    toast.success('Story deleted successfully');
  };

  const handleUpdate = (updatedStory) => {
    console.log(`Updating story ${updatedStory._id}`);
    
    // Update individual stories array
    setStories(prev =>
      prev.map(story =>
        story._id === updatedStory._id ? { ...story, ...updatedStory } : story
      )
    );

    // Update grouped stories as well
    setGroupedStories(prev =>
      prev.map(group => ({
        ...group,
        stories: group.stories.map(story =>
          story._id === updatedStory._id ? { ...story, ...updatedStory } : story
        )
      }))
    );

    // Update selected user stories if story viewer is open
    if (selectedUserStories) {
      setSelectedUserStories(prev => ({
        ...prev,
        stories: prev.stories.map(story =>
          story._id === updatedStory._id ? { ...story, ...updatedStory } : story
        )
      }));
    }

    toast.success('Story updated successfully');
  };

  const handleStoryClick = (userStories) => {
    setSelectedUserStories(userStories);
    setShowStoryViewer(true);
  };

  const handleCloseStoryViewer = () => {
    setShowStoryViewer(false);
    setSelectedUserStories(null);
  };

  // Helper function to get story preview
  const getStoryPreview = (story) => {
    if (story.media) {
      return story.media;
    }
    return null;
  };

  // Helper function to check if story belongs to current user
  const isUserStory = (story) => {
    return currentUserId && (story.userId === currentUserId || story.user?.id === currentUserId);
  };

  // Enhanced helper function to get display name with page support
  const getDisplayName = (user) => {
    if (!user) return 'Unknown User';
    
    // For pages, prioritize pageName
    if (user.isPage || user.type === 'page') {
      return user.pageName || user.username || 'Unknown Page';
    }
    
    // For regular users, use full name if available
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    // Fallback to individual names
    if (user.firstName) return user.firstName;
    if (user.lastName) return user.lastName;
    if (user.username && user.username !== 'Unknown User') {
      return user.username;
    }
    
    // Final fallback
    return 'Unknown User';
  };

  console.log('Current state:', { loading, error, stories, groupedStories });

  return (
    <div className="container my-4">
      {loading && (
        <div className="d-flex align-items-center my-3">
          <div className="spinner-border text-light me-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <span className="text-white fs-5">Loading stories...</span>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-danger d-flex align-items-center my-3" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {error}
        </div>
      )}

      {!loading && !error && groupedStories.length === 0 && (
        <div className="text-center my-3">
          <p className="text-white fs-5">
            {type === "me" ? "You haven't posted any stories yet" : "No stories to show"}
          </p>
        </div>
      )}

      {!loading && !error && groupedStories.length > 0 && (
        <>
          <h2 className="text-white mb-3 fs-4">
            {type === "me" ? "Your Stories" : "Stories"}
          </h2>
          <div
            className="d-flex overflow-x-auto pb-3"
            style={{
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              minHeight: '160px'
            }}
          >
            {groupedStories.map((group, index) => {
              const latestStory = group.stories[0]; // Get the latest story for preview
              const storyPreview = getStoryPreview(latestStory);
              const isPage = group.user?.isPage || group.user?.type === 'page';
              
              return (
                <div
                  key={group.user?.id || `user-${index}`}
                  className="flex-shrink-0 mx-2 story-group"
                  style={{ width: '120px', scrollSnapAlign: 'start', cursor: 'pointer' }}
                  onClick={() => handleStoryClick(group)}
                >
                  <div className="story-preview-container">
                    <div className="story-ring position-relative">
                      {/* Story preview background */}
                      {storyPreview ? (
                        <div 
                          className="story-background"
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            backgroundImage: `url(${storyPreview})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            border: isPage ? '3px solid #1877f2' : '3px solid #e91e63'
                          }}
                        />
                      ) : (
                        <div 
                          className="story-background"
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: isPage 
                              ? 'linear-gradient(135deg, #1877f2 0%, #0d47a1 100%)'
                              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: isPage ? '3px solid #1877f2' : '3px solid #e91e63',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <span 
                            className="text-white text-center"
                            style={{ 
                              fontSize: '10px', 
                              fontWeight: 'bold',
                              wordBreak: 'break-word',
                              padding: '2px'
                            }}
                          >
                            {latestStory.content ? latestStory.content.substring(0, 20) + (latestStory.content.length > 20 ? '...' : '') : 'Story'}
                          </span>
                        </div>
                      )}
                      
                      {/* Profile picture overlay */}
                      <img
                        src={group.user?.profilePicture || 'https://via.placeholder.com/30'}
                        alt={group.user?.username || 'User'}
                        className="story-profile-overlay"
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          border: '2px solid white',
                          objectFit: 'cover',
                          position: 'absolute',
                          bottom: '0',
                          right: '0'
                        }}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/30';
                        }}
                      />
                      
                      {/* Page indicator */}
                      {isPage && (
                        <div
                          className="page-indicator"
                          style={{
                            position: 'absolute',
                            top: '-2px',
                            left: '-2px',
                            background: '#1877f2',
                            color: 'white',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            border: '2px solid white'
                          }}
                          title="Page Story"
                        >
                          P
                        </div>
                      )}
                    </div>
                    
                    <div className="story-info mt-2">
                      <p className="text-white text-center mb-0" style={{ fontSize: '12px', fontWeight: '600' }}>
                        {getDisplayName(group.user)}
                      </p>
                      <p className="text-muted text-center mb-0" style={{ fontSize: '10px' }}>
                        {group.stories.length} {group.stories.length === 1 ? 'story' : 'stories'}
                        {isPage && (
                          <span className="text-info"> • Page</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {showStoryViewer && selectedUserStories && (
        <StoryViewer
          userStories={selectedUserStories}
          onClose={handleCloseStoryViewer}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          isUserPost={type === "me"}
          currentUserId={currentUserId}
        />
      )}

      <style jsx>{`
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
        
        .story-group:hover .story-ring {
          transform: scale(1.05);
          transition: transform 0.2s ease;
        }
        
        .story-preview-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .story-ring {
          position: relative;
          transition: transform 0.2s ease;
        }
        
        .story-background {
          display: block;
        }
        
        .story-profile-overlay {
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .page-indicator {
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        /* Responsive design for smaller screens */
        @media (max-width: 768px) {
          .story-group {
            width: 100px !important;
          }
          
          .story-background {
            width: 70px !important;
            height: 70px !important;
          }
          
          .story-profile-overlay {
            width: 20px !important;
            height: 20px !important;
          }
          
          .page-indicator {
            width: 18px !important;
            height: 18px !important;
            font-size: 8px !important;
          }
          
          .story-info p {
            font-size: 10px !important;
          }
          
          .story-info p:last-child {
            font-size: 8px !important;
          }
        }

        /* Loading animation for story rings */
        .story-ring.loading {
          opacity: 0.7;
        }

        /* Enhanced hover effects */
        .story-group:hover .page-indicator {
          background: #0d47a1;
        }

        .story-group:active .story-ring {
          transform: scale(0.95);
        }

        /* Better text truncation */
        .story-info p {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }

        @media (max-width: 768px) {
          .story-info p {
            max-width: 100px;
          }
        }
      `}</style>
    </div>
  );
};

export default Feedstories;