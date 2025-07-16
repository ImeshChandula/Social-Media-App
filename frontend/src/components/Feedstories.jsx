
// import { useEffect, useState } from "react";
// import { axiosInstance } from "../lib/axios";
// import Stories from "./Stories";

// const Feedstories = ({ type = "all" }) => {
//   const [stories, setStories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);


//   useEffect(() => {
//     const fetchFeed = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         console.log(`Fetching stories from endpoint: ${type === "me" ? "/stories/me" : "/stories/feed"}`);

//         const endpoint = type === "me" ? "/stories/me" : "/stories/feed";
//         const res = await axiosInstance.get(endpoint);

//         console.log('Raw API response:', res.data);

//         let processedStories = [];
//         if (type === "me") {
//           // Handle "me" endpoint response
//           const userStories = Array.isArray(res.data.stories) ? res.data.stories : [];
//           processedStories = userStories.map(story => ({
//             ...story,
//             _id: story._id || story.id, // Normalize ID field
//             user: story.user || {
//               id: story.userId || 'unknown',
//               username: story.user?.username || 'Unknown User',
//               profilePicture: story.user?.profilePicture || 'https://via.placeholder.com/40',
//               firstName: story.user?.firstName || '',
//               lastName: story.user?.lastName || ''
//             }
//           }));
//           console.log('Processed user stories:', processedStories);
//         } else {
//           // Handle "feed" endpoint response
//           const feedStories = Array.isArray(res.data.stories) ? res.data.stories : [];
//           processedStories = feedStories.flatMap(group => {
//             const groupStories = Array.isArray(group.stories) ? group.stories : [];
//             return groupStories.map(story => ({
//               ...story,
//               _id: story._id || story.id, // Normalize ID field
//               user: group.user || {
//                 id: story.userId || 'unknown',
//                 username: group.user?.username || 'Unknown User',
//                 profilePicture: group.user?.profilePicture || 'https://via.placeholder.com/40',
//                 firstName: group.user?.firstName || '',
//                 lastName: group.user?.lastName || ''
//               }
//             }));
//           });

//           // Filter for friends' and public stories old---
//           processedStories = processedStories.filter(story =>
//             story.privacy === 'friends' || story.privacy === 'public'
//           );


//           // Sort by createdAt (newest first)
//           processedStories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//           console.log('Processed feed stories:', processedStories);
//         }

//         setStories(processedStories);

//         // Mark stories as viewed for feed (not for "me")
//         if (type !== "me" && processedStories.length > 0) {
//           await Promise.all(
//             processedStories.map(story =>
//               story._id ? markStoryAsViewed(story._id) : Promise.resolve()
//             )
//           );
//         }
//       } catch (err) {
//         const errorMessage = err.response?.data?.message || "Failed to load stories. Please try again.";
//         console.error("Fetch stories error:", err.response || err);
//         setError(errorMessage);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFeed();
//   }, [type]);

//   const markStoryAsViewed = async (storyId) => {
//     try {
//       console.log(`Marking story ${storyId} as viewed`);
//       const res = await axiosInstance.put(`/stories/${storyId}/view`);
//       setStories(prev =>
//         prev.map(story =>
//           story._id === storyId
//             ? { ...story, viewCount: res.data.viewCount || story.viewCount, viewers: res.data.viewers || story.viewers }
//             : story
//         )
//       );
//     } catch (err) {
//       console.error(`Failed to mark story ${storyId} as viewed:`, err.response || err);
//     }
//   };

//   const handleDelete = (storyId) => {
//     console.log(`Deleting story ${storyId}`);
//     setStories(prev => prev.filter(story => story._id !== storyId));
//   };

//   const handleUpdate = (updatedStory) => {
//     console.log(`Updating story ${updatedStory._id}`);
//     setStories(prev =>
//       prev.map(story =>
//         story._id === updatedStory._id ? { ...story, ...updatedStory } : story
//       )
//     );
//   };

//   console.log('Current state:', { loading, error, stories });

//   return (
//     <div className="container my-4">
//       {loading && (
//         <div className="d-flex align-items-center my-3">
//           <div className="spinner-border text-light me-3" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//           <span className="text-white fs-5">Loading stories...</span>
//         </div>
//       )}

//       {!loading && error && (
//         <div className="alert alert-danger d-flex align-items-center my-3" role="alert">
//           <i className="bi bi-exclamation-triangle-fill me-2"></i>
//           {error}
//         </div>
//       )}

//       {!loading && !error && stories.length === 0 && (
//         <div className="text-center my-3">
//           <p className="text-white fs-5">
//             {type === "me" ? "You haven't posted any stories yet" : "No stories to show"}
//           </p>
//         </div>
//       )}

//       {!loading && !error && stories.length > 0 && (
//         <>
//           <h2 className="text-white mb-3 fs-4">{type === "me" ? "Your Stories" : "Stories"}</h2>
//           <div
//             className="d-flex overflow-x-auto pb-3"
//             style={{
//               scrollSnapType: 'x mandatory',
//               WebkitOverflowScrolling: 'touch',
//               scrollbarWidth: 'none',
//               msOverflowStyle: 'none',
//               minHeight: '160px'
//             }}
//           >
//             {stories.map(story => (
//               <div
//                 key={story._id || `story-${Math.random()}`}
//                 className="flex-shrink-0 mx-2"
//                 style={{ width: '120px', scrollSnapAlign: 'start' }}
//               >
//                 <Stories
//                   post={story}
//                   isUserPost={type === "me"}
//                   onDelete={handleDelete}
//                   onStoriesUpdate={handleUpdate}
//                   isPreview={true}
//                 />
//               </div>
//             ))}
//           </div>
//         </>
//       )}

//       <style jsx>{`
//         .overflow-x-auto::-webkit-scrollbar {
//           display: none;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Feedstories;


// new-----------------------------------------------------------------------------------------------

import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import Stories from "./Stories";
import StoryViewer from "./StoryView"; // You'll need to create this component

const Feedstories = ({ type = "all" }) => {
  const [stories, setStories] = useState([]);
  const [groupedStories, setGroupedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUserStories, setSelectedUserStories] = useState(null);
  const [showStoryViewer, setShowStoryViewer] = useState(false);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`Fetching stories from endpoint: ${type === "me" ? "/stories/me" : "/stories/feed"}`);

        const endpoint = type === "me" ? "/stories/me" : "/stories/feed";
        const res = await axiosInstance.get(endpoint);

        console.log('Raw API response:', res.data);

        let processedStories = [];
        if (type === "me") {
          // Handle "me" endpoint response
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
          // Handle "feed" endpoint response
          const feedStories = Array.isArray(res.data.stories) ? res.data.stories : [];
          
          // The backend already groups stories by user, so we can use this structure
          const grouped = feedStories.map(group => ({
            user: group.user || {
              id: 'unknown',
              username: 'Unknown User',
              profilePicture: 'https://via.placeholder.com/40',
              firstName: '',
              lastName: ''
            },
            stories: (group.stories || []).map(story => ({
              ...story,
              _id: story._id || story.id,
              user: group.user
            })).filter(story => 
              story.privacy === 'friends' || story.privacy === 'public'
            ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          })).filter(group => group.stories.length > 0);

          setGroupedStories(grouped);
          
          // Flatten for individual story processing if needed
          processedStories = grouped.flatMap(group => group.stories);
          console.log('Processed feed stories:', processedStories);
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
    setStories(prev => prev.filter(story => story._id !== storyId));
    
    // Update grouped stories as well
    setGroupedStories(prev => 
      prev.map(group => ({
        ...group,
        stories: group.stories.filter(story => story._id !== storyId)
      })).filter(group => group.stories.length > 0)
    );
  };

  const handleUpdate = (updatedStory) => {
    console.log(`Updating story ${updatedStory._id}`);
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

  // Helper function to get display name
  const getDisplayName = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username || 'Unknown User';
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
          <h2 className="text-white mb-3 fs-4">{type === "me" ? "Your Stories" : "Stories"}</h2>
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
            {groupedStories.map(group => {
              const latestStory = group.stories[0]; // Get the latest story for preview
              const storyPreview = getStoryPreview(latestStory);
              
              return (
                <div
                  key={group.user.id || `user-${Math.random()}`}
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
                            border: '3px solid #1877f2'
                          }}
                        />
                      ) : (
                        <div 
                          className="story-background"
                          style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: '3px solid #1877f2',
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
                        src={group.user.profilePicture || 'https://via.placeholder.com/30'}
                        alt={group.user.username}
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
                      />
                    </div>
                    
                    <div className="story-info mt-2">
                      <p className="text-white text-center mb-0" style={{ fontSize: '12px', fontWeight: '600' }}>
                        {getDisplayName(group.user)}
                      </p>
                      <p className="text-muted text-center mb-0" style={{ fontSize: '10px' }}>
                        {group.stories.length} {group.stories.length === 1 ? 'story' : 'stories'}
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
      `}</style>
    </div>
  );
};

export default Feedstories;