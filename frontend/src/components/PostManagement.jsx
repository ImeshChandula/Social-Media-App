import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { axiosInstance } from "../lib/axios";
import { 
    Trash2, Heart, MessageCircle, Share2, Calendar, User, MapPin, Tag, 
    Video, Image, Eye, EyeOff, AlertTriangle, Shield, UserX, AlertCircle,
    Check, X, Clock, ChevronDown, ChevronRight, Ban
} from 'lucide-react';
import styles from '../styles/PostManagementStyles';
import { useNavigate } from 'react-router-dom';

const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    const [reportedPosts, setReportedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportedLoading, setReportedLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState({});
    const [hoveredCard, setHoveredCard] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [showReportActionModal, setShowReportActionModal] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [expandedReports, setExpandedReports] = useState({});
    const [actionLoading, setActionLoading] = useState({});

    const navigate = useNavigate();

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
        if (!media) return [];
        if (Array.isArray(media)) {
            return media.filter(url => url && typeof url === 'string' && url.trim().length > 0);
        }
        if (typeof media === 'string') {
            return media.split(',').map(url => url.trim()).filter(url => url.length > 0);
        }
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
                setPosts(response.data.posts || []);
            } else {
                console.error('Failed to fetch posts');
                toast.error('Failed to fetch posts');
                setPosts([]);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error(error.response?.data?.message || 'Server error');
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch reported posts
    const fetchReportedPosts = async () => {
        try {
            setReportedLoading(true);
            const response = await axiosInstance.get('/posts/reported');
            if (response.data.success) {
                setReportedPosts(response.data.posts || []);
            } else {
                console.error('Failed to fetch reported posts');
                toast.error('Failed to fetch reported posts');
                setReportedPosts([]);
            }
        } catch (error) {
            console.error('Error fetching reported posts:', error);
            toast.error(error.response?.data?.message || 'Error fetching reported posts');
            setReportedPosts([]);
        } finally {
            setReportedLoading(false);
        }
    };

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'reported' && reportedPosts.length === 0) {
            fetchReportedPosts();
        }
    };

    const handleDeletePost = async (id) => {
        try {
            setDeleteLoading(prev => ({ ...prev, [id]: true }));
            const response = await axiosInstance.delete(`/posts/delete/${id}`);
            
            if (response.data.success) {
                setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
                setReportedPosts(prevPosts => prevPosts.filter(post => post.id !== id));
                toast.success(response.data.message || 'Post deleted successfully!');
            } else {
                toast.error(`Failed to delete post: ${response.data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('Error deleting post. Please try again.');
        } finally {
            setDeleteLoading(prev => ({ ...prev, [id]: false }));
            setShowDeleteModal(null);
        }
    };

    const handleAcceptReport = async (reportId, postId, action) => {
        try {
            setActionLoading(prev => ({ ...prev, [`${reportId}_${action}`]: true }));
            const response = await axiosInstance.patch(`/posts/reports/accept/${reportId}`, { action });
            
            if (response.data.success) {
                toast.success(`Report accepted and ${action.replace('_', ' ')} action taken`);
                
                // Remove from reported posts list
                setReportedPosts(prev => prev.filter(post => post.id !== postId));
                
                // If post was deleted, also remove from all posts
                if (action === 'delete_post') {
                    setPosts(prev => prev.filter(post => post.id !== postId));
                }
                
                setShowReportActionModal(null);
            } else {
                toast.error(response.data.message || 'Failed to accept report');
            }
        } catch (error) {
            console.error('Error accepting report:', error);
            toast.error(error.response?.data?.message || 'Error processing report');
        } finally {
            setActionLoading(prev => ({ ...prev, [`${reportId}_${action}`]: false }));
        }
    };

    const handleDeclineReport = async (reportId, postId, reason = '') => {
        try {
            setActionLoading(prev => ({ ...prev, [`${reportId}_decline`]: true }));
            const response = await axiosInstance.patch(`/posts/reports/decline/${reportId}`, { 
                reason: reason || 'No violation found' 
            });
            
            if (response.data.success) {
                toast.success('Report declined successfully');
                
                // Remove from reported posts list
                setReportedPosts(prev => prev.filter(post => post.id !== postId));
                
                setShowReportActionModal(null);
            } else {
                toast.error(response.data.message || 'Failed to decline report');
            }
        } catch (error) {
            console.error('Error declining report:', error);
            toast.error(error.response?.data?.message || 'Error processing report');
        } finally {
            setActionLoading(prev => ({ ...prev, [`${reportId}_decline`]: false }));
        }
    };

    const handleNavigateToProfile = (userId) => {
        navigate(`/profile/${userId}`);
    };

    const toggleReportExpand = (postId) => {
        setExpandedReports(prev => ({
            ...prev,
            [postId]: !prev[postId]
        }));
    };

    // Tab styles
    const tabStyles = {
        container: {
            display: 'flex',
            marginBottom: '20px',
            borderBottom: '2px solid #e2e8f0',
            gap: '0'
        },
        tab: {
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: '3px solid transparent',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            color: '#64748b',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
        },
        activeTab: {
            color: '#3b82f6',
            borderBottomColor: '#3b82f6'
        }
    };

    // Modal styles
    const modalStyles = {
        overlay: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: isMobile ? '20px' : '40px'
        },
        modal: {
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: isMobile ? '20px' : '30px',
            maxWidth: isMobile ? '90vw' : '500px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        },
        title: {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: '15px',
            color: '#1a202c'
        },
        text: {
            marginBottom: '20px',
            color: '#4a5568',
            lineHeight: '1.5'
        },
        actions: {
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
            flexWrap: 'wrap'
        },
        button: {
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
        }
    };

    const renderPost = (post, isReported = false) => {
        const mediaUrls = parseMediaUrls(post.media);
        const author = post.author || {
            id: post.authorId,
            firstName: post.firstName,
            lastName: post.lastName,
            username: post.username,
            profilePicture: post.profilePicture
        };
        
        return (
            <div
                key={post.id}
                style={getResponsiveStyles(
                    {
                        ...styles.postCard,
                        ...(hoveredCard === post.id && !isMobile ? styles.postCardHover : {}),
                        ...(isReported ? { borderLeft: '4px solid #f56565' } : {})
                    },
                    {
                        padding: isMobile ? '20px' : '25px',
                        borderRadius: isMobile ? '15px' : '20px'
                    }
                )}
                onMouseEnter={() => !isMobile && setHoveredCard(post.id)}
                onMouseLeave={() => !isMobile && setHoveredCard(null)}
            >
                {/* Report indicator for reported posts */}
                {isReported && (
                    <div style={{
                        border: '1px solid #feb2b2',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        backgroundColor: '#fef5f5'
                    }}>
                        {/* Report Header */}
                        <div 
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 16px',
                                backgroundColor: '#fed7d7',
                                borderRadius: '12px 12px 0 0',
                                fontSize: '0.95rem',
                                color: '#c53030',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                            onClick={() => toggleReportExpand(post.id)}
                        >
                            <AlertTriangle size={18} />
                            <span>⚠️ {post.reportCount} Report{post.reportCount > 1 ? 's' : ''} - Click to view details</span>
                            <div style={{ marginLeft: 'auto' }}>
                                {expandedReports[post.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </div>
                        </div>

                        {/* Always show basic report info */}
                        <div style={{
                            padding: '12px 16px',
                            borderBottom: expandedReports[post.id] ? '1px solid #feb2b2' : 'none'
                        }}>
                            <div style={{ 
                                display: 'grid', 
                                gap: '8px',
                                fontSize: '0.9rem',
                                color: '#721c24'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                    <span style={{ fontWeight: '600', minWidth: '70px' }}>Reasons:</span>
                                    <span style={{ 
                                        backgroundColor: '#fbb6ce', 
                                        padding: '2px 8px', 
                                        borderRadius: '6px',
                                        fontSize: '0.85rem'
                                    }}>
                                        {post.reportReasons}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontWeight: '600', minWidth: '70px' }}>Reported:</span>
                                    <span>{new Date(post.lastReportedAt).toLocaleDateString()} at {new Date(post.lastReportedAt).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Expanded report details */}
                        {expandedReports[post.id] && (
                            <div style={{
                                padding: '12px 16px',
                                backgroundColor: '#fdf2f8'
                            }}>
                                <h4 style={{ 
                                    margin: '0 0 12px 0', 
                                    fontSize: '0.95rem', 
                                    color: '#be185d',
                                    fontWeight: '600'
                                }}>
                                    📋 Detailed Report Information
                                </h4>
                                
                                <div style={{ 
                                    display: 'grid', 
                                    gap: '10px',
                                    fontSize: '0.85rem'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '8px',
                                        padding: '8px',
                                        backgroundColor: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #f3e8ff'
                                    }}>
                                        <User size={14} style={{ color: '#7c3aed', marginTop: '2px' }} />
                                        <div>
                                            <strong style={{ color: '#581c87' }}>Reported by:</strong>
                                            <div style={{ marginTop: '4px' }}>
                                                {post.reporterNames.split(', ').map((reporter, index) => (
                                                    <span 
                                                        key={index}
                                                        style={{
                                                            display: 'inline-block',
                                                            backgroundColor: '#e0e7ff',
                                                            color: '#3730a3',
                                                            padding: '2px 6px',
                                                            borderRadius: '4px',
                                                            fontSize: '0.8rem',
                                                            marginRight: '6px',
                                                            marginBottom: '4px'
                                                        }}
                                                    >
                                                        👤 {reporter}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '8px',
                                        padding: '8px',
                                        backgroundColor: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #fef3c7'
                                    }}>
                                        <Tag size={14} style={{ color: '#d97706', marginTop: '2px' }} />
                                        <div>
                                            <strong style={{ color: '#92400e' }}>Report Reasons:</strong>
                                            <div style={{ marginTop: '4px' }}>
                                                {post.reportReasons.split(', ').map((reason, index) => (
                                                    <span 
                                                        key={index}
                                                        style={{
                                                            display: 'inline-block',
                                                            backgroundColor: '#fef3c7',
                                                            color: '#92400e',
                                                            padding: '3px 8px',
                                                            borderRadius: '6px',
                                                            fontSize: '0.8rem',
                                                            marginRight: '6px',
                                                            marginBottom: '4px',
                                                            border: '1px solid #fbbf24'
                                                        }}
                                                    >
                                                        ⚠️ {reason}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px',
                                        backgroundColor: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #ddd6fe'
                                    }}>
                                        <Clock size={14} style={{ color: '#7c3aed' }} />
                                        <div style={{ color: '#581c87' }}>
                                            <strong>Timeline:</strong> Last report submitted on {new Date(post.lastReportedAt).toLocaleDateString()} at {new Date(post.lastReportedAt).toLocaleTimeString()}
                                        </div>
                                    </div>

                                    {post.reportCount > 1 && (
                                        <div style={{
                                            padding: '8px',
                                            backgroundColor: '#fee2e2',
                                            borderRadius: '6px',
                                            border: '1px solid #fecaca',
                                            color: '#991b1b',
                                            fontSize: '0.8rem',
                                            fontWeight: '500'
                                        }}>
                                            🚨 High Priority: This post has received multiple reports ({post.reportCount} total)
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Author section */}
                <div
                    onClick={() => handleNavigateToProfile(author.id)}
                    style={getResponsiveStyles(styles.authorSection, {
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer'
                    })}
                    className='cursor-pointer'
                >
                    <img
                        src={author.profilePicture || '/default-avatar.png'}
                        alt={`${author.firstName || 'User'} ${author.lastName || ''}`}
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
                            {author.firstName && author.lastName ? 
                                `${author.firstName} ${author.lastName}` : 'Unknown User'
                            }
                        </div>
                        <div style={styles.username}>
                            @{author.username || 'unknown'}
                        </div>
                    </div>
                </div>

                <div style={styles.postContent}>{post.content}</div>

                {/* Media rendering */}
                {mediaUrls.length > 0 && (
                    <div style={styles.mediaContainer}>
                        {mediaUrls.length === 1 ? (
                            post.mediaType === 'video' ? (
                                <video
                                    src={mediaUrls[0]}
                                    style={{
                                        ...styles.media,
                                        aspectRatio: 'auto',
                                        maxHeight: '600px',
                                        width: '100%',
                                        objectFit: 'contain'
                                    }}
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
                                    style={{
                                        ...styles.media,
                                        aspectRatio: 'auto',
                                        maxHeight: '600px',
                                        width: '100%',
                                        objectFit: 'contain'
                                    }}
                                    onError={(e) => {
                                        console.error('Image failed to load:', mediaUrls[0]);
                                        e.target.style.display = 'none';
                                    }}
                                />
                            )
                        ) : (
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

                {/* Meta info */}
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

                {/* Stats row */}
                <div style={getResponsiveStyles(styles.statsRow, {
                    flexDirection: 'row',
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

                {/* Actions */}
                <div style={getResponsiveStyles(styles.actions, {
                    justifyContent: isMobile ? 'center' : 'flex-end',
                    gap: '10px'
                })}>
                    {isReported && (
                        <button
                            style={{
                                ...getResponsiveStyles(styles.deleteButton, {
                                    padding: isMobile ? '8px 16px' : '10px 20px',
                                    fontSize: isMobile ? '0.8rem' : '0.9rem'
                                }),
                                backgroundColor: '#3b82f6',
                                color: 'white'
                            }}
                            onClick={() => setShowReportActionModal({
                                reportId: post.id, // Assuming this is the report ID - adjust based on your data structure
                                postId: post.id,
                                postContent: post.content.substring(0, 100) + '...',
                                author: author,
                                reportCount: post.reportCount,
                                reportReasons: post.reportReasons,
                                reporterNames: post.reporterNames
                            })}
                        >
                            <Shield size={16} />
                            Review Report
                        </button>
                    )}
                    <button
                        style={getResponsiveStyles(styles.deleteButton, {
                            padding: isMobile ? '8px 16px' : '10px 20px',
                            fontSize: isMobile ? '0.8rem' : '0.9rem'
                        })}
                        onClick={() => setShowDeleteModal({
                            id: post.id,
                            username: author.username || 'unknown',
                            authorName: author.firstName && author.lastName ? 
                                `${author.firstName} ${author.lastName}` : 'Unknown User'
                        })}
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
                        Delete Post
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div style={getResponsiveStyles(styles.contentWrapper, { padding: isMobile ? '15px' : '20px' })}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={getResponsiveStyles(styles.title, { fontSize: isMobile ? '2rem' : '2.5rem' })}>
                        Post Management
                    </h1>
                    <p style={getResponsiveStyles(styles.subtitle, { fontSize: isMobile ? '1rem' : '1.1rem' })}>
                        Manage all posts and handle reported content
                    </p>
                </div>

                {/* Tab navigation */}
                <div style={tabStyles.container}>
                    <button
                        style={{
                            ...tabStyles.tab,
                            ...(activeTab === 'all' ? tabStyles.activeTab : {})
                        }}
                        onClick={() => handleTabChange('all')}
                    >
                        <Eye size={18} />
                        All Posts ({posts.length})
                    </button>
                    <button
                        style={{
                            ...tabStyles.tab,
                            ...(activeTab === 'reported' ? tabStyles.activeTab : {})
                        }}
                        onClick={() => handleTabChange('reported')}
                    >
                        <AlertTriangle size={18} />
                        Reported Posts ({reportedPosts.length})
                    </button>
                </div>

                {/* Stats card */}
                <div style={styles.statsCard}>
                    <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>
                        {activeTab === 'all' ? `Total Posts: ${posts.length}` : `Reported Posts: ${reportedPosts.length}`}
                    </h3>
                    <p style={{ margin: 0, opacity: 0.8 }}>
                        {activeTab === 'all' 
                            ? 'Monitor and manage all user posts from your admin dashboard'
                            : 'Review and take action on reported posts'
                        }
                    </p>
                </div>

                {/* Loading states */}
                {((activeTab === 'all' && loading) || (activeTab === 'reported' && reportedLoading)) ? (
                    <div style={styles.loading}>Loading posts...</div>
                ) : activeTab === 'all' ? (
                    posts.length === 0 ? (
                        <div style={styles.noData}>No posts found</div>
                    ) : (
                        <div style={getResponsiveStyles(styles.postsGrid, {
                            gridTemplateColumns: '1fr',
                            gap: isMobile ? '20px' : '25px'
                        })}>
                            {posts.map((post) => renderPost(post, false))}
                        </div>
                    )
                ) : (
                    reportedPosts.length === 0 ? (
                        <div style={styles.noData}>No reported posts found</div>
                    ) : (
                        <div style={getResponsiveStyles(styles.postsGrid, {
                            gridTemplateColumns: '1fr',
                            gap: isMobile ? '20px' : '25px'
                        })}>
                            {reportedPosts.map((post) => renderPost(post, true))}
                        </div>
                    )
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div style={modalStyles.overlay}>
                        <div style={modalStyles.modal}>
                            <h3 style={modalStyles.title}>Delete Post</h3>
                            <p style={modalStyles.text}>
                                Are you sure you want to delete this post by "{showDeleteModal.authorName}" (@{showDeleteModal.username})? This action cannot be undone.
                            </p>

                            <div style={modalStyles.actions}>
                                <button
                                    onClick={() => setShowDeleteModal(null)}
                                    style={{
                                        ...modalStyles.button,
                                        backgroundColor: '#f7fafc',
                                        color: '#4a5568',
                                        border: '1px solid #e2e8f0'
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeletePost(showDeleteModal.id)}
                                    style={{
                                        ...modalStyles.button,
                                        backgroundColor: '#e53e3e',
                                        color: 'white'
                                    }}
                                    disabled={deleteLoading[showDeleteModal.id]}
                                >
                                    <Trash2 size={16} />
                                    {deleteLoading[showDeleteModal.id] ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Report Action Modal */}
                {showReportActionModal && (
                    <div style={modalStyles.overlay}>
                        <div style={{...modalStyles.modal, maxWidth: isMobile ? '95vw' : '600px'}}>
                            <h3 style={modalStyles.title}>📋 Review Reported Post</h3>
                            
                            {/* Post Information */}
                            <div style={{ 
                                backgroundColor: '#f8fafc', 
                                padding: '16px', 
                                borderRadius: '8px', 
                                marginBottom: '20px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <h4 style={{ margin: '0 0 12px 0', color: '#2d3748', fontSize: '1rem' }}>
                                    📝 Post Details
                                </h4>
                                <div style={{ marginBottom: '10px' }}>
                                    <strong style={{ color: '#4a5568' }}>Author:</strong> 
                                    <span style={{ marginLeft: '8px' }}>
                                        {showReportActionModal.author.firstName} {showReportActionModal.author.lastName} 
                                        <span style={{ 
                                            color: '#718096', 
                                            backgroundColor: '#edf2f7', 
                                            padding: '2px 6px', 
                                            borderRadius: '4px', 
                                            marginLeft: '8px',
                                            fontSize: '0.85rem'
                                        }}>
                                            @{showReportActionModal.author.username}
                                        </span>
                                    </span>
                                </div>
                                <div style={{ marginBottom: '10px' }}>
                                    <strong style={{ color: '#4a5568' }}>Content:</strong>
                                    <div style={{ 
                                        marginTop: '6px',
                                        padding: '8px',
                                        backgroundColor: 'white',
                                        borderRadius: '6px',
                                        border: '1px solid #e2e8f0',
                                        fontStyle: 'italic',
                                        color: '#2d3748'
                                    }}>
                                        "{showReportActionModal.postContent}"
                                    </div>
                                </div>
                            </div>

                            {/* Report Information */}
                            <div style={{ 
                                backgroundColor: '#fef5f5', 
                                padding: '16px', 
                                borderRadius: '8px', 
                                marginBottom: '20px',
                                border: '1px solid #feb2b2'
                            }}>
                                <h4 style={{ margin: '0 0 12px 0', color: '#c53030', fontSize: '1rem' }}>
                                    🚨 Report Information
                                </h4>
                                
                                <div style={{ marginBottom: '12px' }}>
                                    <strong style={{ color: '#c53030' }}>Total Reports:</strong> 
                                    <span style={{ 
                                        marginLeft: '8px',
                                        backgroundColor: '#fed7d7',
                                        color: '#c53030',
                                        padding: '2px 8px',
                                        borderRadius: '12px',
                                        fontSize: '0.9rem',
                                        fontWeight: '600'
                                    }}>
                                        {showReportActionModal.reportCount}
                                    </span>
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <strong style={{ color: '#c53030' }}>Report Reasons:</strong>
                                    <div style={{ marginTop: '6px' }}>
                                        {showReportActionModal.reportReasons.split(', ').map((reason, index) => (
                                            <span 
                                                key={index}
                                                style={{
                                                    display: 'inline-block',
                                                    backgroundColor: '#fbb6ce',
                                                    color: '#be185d',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.85rem',
                                                    marginRight: '8px',
                                                    marginBottom: '6px',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                ⚠️ {reason}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '0' }}>
                                    <strong style={{ color: '#c53030' }}>Reported by:</strong>
                                    <div style={{ marginTop: '6px' }}>
                                        {showReportActionModal.reporterNames.split(', ').map((reporter, index) => (
                                            <span 
                                                key={index}
                                                style={{
                                                    display: 'inline-block',
                                                    backgroundColor: '#e0e7ff',
                                                    color: '#3730a3',
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    fontSize: '0.85rem',
                                                    marginRight: '8px',
                                                    marginBottom: '6px',
                                                    fontWeight: '500'
                                                }}
                                            >
                                                👤 {reporter}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <p style={{...modalStyles.text, fontSize: '1rem', fontWeight: '500', color: '#2d3748'}}>
                                Choose an appropriate action to take on this reported post:
                            </p>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                                gap: '10px',
                                marginBottom: '20px'
                            }}>
                                <button
                                    onClick={() => handleDeclineReport(
                                        showReportActionModal.reportId, 
                                        showReportActionModal.postId
                                    )}
                                    style={{
                                        ...modalStyles.button,
                                        backgroundColor: '#48bb78',
                                        color: 'white',
                                        justifyContent: 'center'
                                    }}
                                    disabled={actionLoading[`${showReportActionModal.reportId}_decline`]}
                                >
                                    <X size={16} />
                                    {actionLoading[`${showReportActionModal.reportId}_decline`] ? 'Processing...' : 'Decline Report'}
                                </button>

                                <button
                                    onClick={() => handleAcceptReport(
                                        showReportActionModal.reportId, 
                                        showReportActionModal.postId, 
                                        'warn_user'
                                    )}
                                    style={{
                                        ...modalStyles.button,
                                        backgroundColor: '#ed8936',
                                        color: 'white',
                                        justifyContent: 'center'
                                    }}
                                    disabled={actionLoading[`${showReportActionModal.reportId}_warn_user`]}
                                >
                                    <AlertCircle size={16} />
                                    {actionLoading[`${showReportActionModal.reportId}_warn_user`] ? 'Processing...' : 'Warn User'}
                                </button>

                                <button
                                    onClick={() => handleAcceptReport(
                                        showReportActionModal.reportId, 
                                        showReportActionModal.postId, 
                                        'suspend_user'
                                    )}
                                    style={{
                                        ...modalStyles.button,
                                        backgroundColor: '#f56565',
                                        color: 'white',
                                        justifyContent: 'center'
                                    }}
                                    disabled={actionLoading[`${showReportActionModal.reportId}_suspend_user`]}
                                >
                                    <Ban size={16} />
                                    {actionLoading[`${showReportActionModal.reportId}_suspend_user`] ? 'Processing...' : 'Suspend User'}
                                </button>

                                <button
                                    onClick={() => handleAcceptReport(
                                        showReportActionModal.reportId, 
                                        showReportActionModal.postId, 
                                        'delete_post'
                                    )}
                                    style={{
                                        ...modalStyles.button,
                                        backgroundColor: '#e53e3e',
                                        color: 'white',
                                        justifyContent: 'center'
                                    }}
                                    disabled={actionLoading[`${showReportActionModal.reportId}_delete_post`]}
                                >
                                    <Trash2 size={16} />
                                    {actionLoading[`${showReportActionModal.reportId}_delete_post`] ? 'Processing...' : 'Delete Post'}
                                </button>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <button
                                    onClick={() => setShowReportActionModal(null)}
                                    style={{
                                        ...modalStyles.button,
                                        backgroundColor: '#f7fafc',
                                        color: '#4a5568',
                                        border: '1px solid #e2e8f0'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostManagement;