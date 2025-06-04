import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { axiosInstance } from "../lib/axios";
import { Trash2, Heart, MessageCircle, Share2, Calendar, User, MapPin, Tag, Video, Image, Eye, EyeOff } from 'lucide-react';
import styles from '../styles/PostManagementStyles';

const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState({});
    const [hoveredCard, setHoveredCard] = useState(null);
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile screen
    useEffect(() => {
        const checkMobile = () => {
        setIsMobile(window.innerWidth <= 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Apply responsive styles dynamically
    const getResponsiveStyles = (baseStyles, mobileStyles = {}) => {
        if (isMobile) {
        return { ...baseStyles, ...mobileStyles };
        }
        return baseStyles;
    };

    // Function to parse media URLs
    const parseMediaUrls = (media) => {
        if (!media) {
        return [];
    }
    
    // If it's already an array, return it after filtering empty values
    if (Array.isArray(media)) {
        return media.filter(url => url && typeof url === 'string' && url.trim().length > 0);
    }
    
    // If it's a string, split by comma and filter out empty strings
    if (typeof media === 'string') {
        return media.split(',').map(url => url.trim()).filter(url => url.length > 0);
    }
    
    // For any other type, return empty array
    return [];
    };

    // Fetch all posts
    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
        setLoading(true);
        
        const response = await axiosInstance.get('/posts/allPosts');

        if (response.data.success) {
            //const data = await response.json();
            setPosts(response.data.posts || []);
        } else {
            console.error('Failed to fetch posts');
            toast.error('Failed to fetch posts');
            setPosts([]);
        }
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error(error.response.data?.message || 'Server error');
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            setDeleteLoading(prev => ({ ...prev, [postId]: true }));
            
            const response = await axiosInstance.delete(`/api/delete/${postId}`);

            if (response.data.success) {
                // Remove post from state
                setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
                toast.success(response.data.message || 'Post deleted successfully!');
            } else {
                toast.error(`Failed to delete post: ${response.data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('Error deleting post. Please try again.');
        } finally {
            setDeleteLoading(prev => ({ ...prev, [postId]: false }));
        }
    };

  return (
    <div style={getResponsiveStyles(styles.contentWrapper, { padding: isMobile ? '15px' : '20px' })}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={getResponsiveStyles(styles.title, { fontSize: isMobile ? '2rem' : '2.5rem' })}>
            Post Management
          </h1>
          <p style={getResponsiveStyles(styles.subtitle, { fontSize: isMobile ? '1rem' : '1.1rem' })}>
            Manage all posts across your platform
          </p>
        </div>

        <div style={styles.statsCard}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>
            Total Posts: {posts.length}
          </h3>
          <p style={{ margin: 0, opacity: 0.8 }}>
            Monitor and manage all user posts from your admin dashboard
          </p>
        </div>

        {loading ? (
          <div style={styles.loading}>Loading posts...</div>
        ) : posts.length === 0 ? (
          <div style={styles.noData}>No posts found</div>
        ) : (
          <div style={getResponsiveStyles(styles.postsGrid, { 
            gridTemplateColumns: '1fr',
            gap: isMobile ? '20px' : '25px'
          })}>
            {posts.map((post) => {
              const mediaUrls = parseMediaUrls(post.media);
              
              return (
              <div
                key={post.id}
                style={getResponsiveStyles(
                  {
                    ...styles.postCard,
                    ...(hoveredCard === post.id && !isMobile ? styles.postCardHover : {})
                  },
                  { 
                    padding: isMobile ? '20px' : '25px',
                    borderRadius: isMobile ? '15px' : '20px'
                  }
                )}
                onMouseEnter={() => !isMobile && setHoveredCard(post.id)}
                onMouseLeave={() => !isMobile && setHoveredCard(null)}
              >
                <div style={getResponsiveStyles(styles.authorSection, {
                  flexDirection: isMobile ? 'row' : 'row',
                  alignItems: 'center',
                  gap: '12px'
                })}>
                  <img
                    src={post.author?.profilePicture || '/default-avatar.png'}
                    alt={`${post.author?.firstName || 'User'} ${post.author?.lastName || ''}`}
                    style={getResponsiveStyles(styles.avatar, {
                      width: isMobile ? '45px' : '50px',
                      height: isMobile ? '45px' : '50px'
                    })}
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <div style={styles.authorInfo}>
                    <div style={getResponsiveStyles(styles.authorName, {
                      fontSize: isMobile ? '1rem' : '1.1rem'
                    })}>
                      {post.author ? `${post.author.firstName} ${post.author.lastName}` : 'Unknown User'}
                    </div>
                    <div style={styles.username}>@{post.author?.username || 'unknown'}</div>
                  </div>
                </div>

                <div style={styles.postContent}>{post.content}</div>

                {mediaUrls.length > 0 && (
                  <div style={styles.mediaContainer}>
                    {mediaUrls.length === 1 ? (
                      // Single media item
                      post.mediaType === 'video' ? (
                        <video
                          src={mediaUrls[0]}
                          style={styles.media}
                          controls
                          muted
                          preload="metadata"
                          onError={(e) => {
                            console.error('Video failed to load:', mediaUrls[0]);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <img
                          src={mediaUrls[0]}
                          alt="Post media"
                          style={styles.media}
                          onError={(e) => {
                            console.error('Image failed to load:', mediaUrls[0]);
                            e.target.style.display = 'none';
                          }}
                        />
                      )
                    ) : (
                      // Multiple images
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: mediaUrls.length === 2 ? '1fr 1fr' : 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '8px',
                        borderRadius: '12px',
                        overflow: 'hidden'
                      }}>
                        {mediaUrls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Post media ${index + 1}`}
                            style={{
                              width: '100%',
                              height: mediaUrls.length <= 2 ? '200px' : '150px',
                              objectFit: 'cover',
                              borderRadius: '8px'
                            }}
                            onError={(e) => {
                              console.error(`Image ${index + 1} failed to load:`, url);
                              e.target.style.display = 'none';
                            }}
                          />
                        ))}
                      </div>
                    )}
                    <div style={styles.mediaType}>
                      {post.mediaType === 'video' ? <Video size={14} /> : <Image size={14} />}
                      {post.mediaType} {mediaUrls.length > 1 && `(${mediaUrls.length})`}
                    </div>
                  </div>
                )}

                <div style={getResponsiveStyles(styles.metaInfo, {
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '8px' : '15px',
                  alignItems: 'flex-start'
                })}>
                  <div style={styles.metaItem}>
                    <Calendar size={14} />
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                  <div style={styles.metaItem}>
                    {post.privacy === 'public' ? <Eye size={14} /> : <EyeOff size={14} />}
                    <span style={styles.privacyBadge}>{post.privacy}</span>
                  </div>
                  {post.isEdited && (
                    <div style={styles.metaItem}>
                      <span style={{ color: '#f56565' }}>Edited</span>
                    </div>
                  )}
                </div>

                <div style={getResponsiveStyles(styles.statsRow, {
                  flexDirection: isMobile ? 'row' : 'row',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: isMobile ? '10px' : '0'
                })}>
                  <div style={styles.statItem}>
                    <Heart size={16} />
                    {post.likeCount || 0} likes
                  </div>
                  <div style={styles.statItem}>
                    <MessageCircle size={16} />
                    {post.commentCount || 0} comments
                  </div>
                  <div style={styles.statItem}>
                    <Share2 size={16} />
                    {post.shareCount || 0} shares
                  </div>
                </div>

                <div style={getResponsiveStyles(styles.actions, {
                  justifyContent: isMobile ? 'center' : 'flex-end'
                })}>
                  <button
                    style={getResponsiveStyles(styles.deleteButton, {
                      padding: isMobile ? '8px 16px' : '10px 20px',
                      fontSize: isMobile ? '0.8rem' : '0.9rem'
                    })}
                    onClick={() => handleDeletePost(post.id)}
                    disabled={deleteLoading[post.id]}
                    onMouseEnter={(e) => {
                      if (!isMobile) {
                        Object.assign(e.target.style, styles.deleteButtonHover);
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isMobile) {
                        Object.assign(e.target.style, styles.deleteButton);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                    {deleteLoading[post.id] ? 'Deleting...' : 'Delete Post'}
                  </button>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  )
}

export default PostManagement