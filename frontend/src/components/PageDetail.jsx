// PageDetail.jsx
import React, { useState, useEffect } from 'react';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import PostCard from '../components/PostCard'; // Assuming this exists

const PageDetail = ({ show, onClose, pageId, isOwner }) => {
  const [page, setPage] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ content: '', media: '', mediaType: '', tags: '', privacy: 'public', location: '' });
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    if (show) {
      fetchPage();
      fetchPosts();
    }
  }, [show, pageId]);

  const fetchPage = async () => {
    try {
      const res = await axiosInstance.get(`/pages/${pageId}`);
      if (res.data.success) {
        setPage(res.data.page);
      }
    } catch (error) {
      console.error('Error fetching page:', error);
      toast.error('Failed to load page details');
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/pages/${pageId}/posts`);
      if (res.data.success) {
        setPosts(res.data.posts || []);
      }
    } catch (error) {
      console.error('Error fetching page posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const res = await axiosInstance.post(`/pages/${pageId}/follow`);
      if (res.data.success) {
        toast.success('Followed successfully!');
        fetchPage();
      }
    } catch (error) {
      toast.error('Failed to follow');
    }
  };

  const handleUnfollow = async () => {
    try {
      const res = await axiosInstance.post(`/pages/${pageId}/unfollow`);
      if (res.data.success) {
        toast.success('Unfollowed successfully!');
        fetchPage();
      }
    } catch (error) {
      toast.error('Failed to unfollow');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreatePost = async () => {
    try {
      const res = await axiosInstance.post(`/pages/${pageId}/posts`, formData);
      if (res.data.success) {
        toast.success('Post created!');
        setShowCreatePost(false);
        fetchPosts();
      }
    } catch (error) {
      toast.error('Failed to create post');
    }
  };

  if (!show) return null;

  return (
    <div 
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, backdropFilter: 'blur(5px)' }}
    >
      <div className="bg-white rounded shadow border p-4" style={{ maxWidth: '800px', width: '100%' }}>
        <div className="d-flex justify-content-between mb-4">
          <h4 className="text-dark">{page?.pageName}</h4>
          <button className="btn btn-outline-secondary" onClick={onClose}>Close</button>
        </div>
        <p className="text-muted">{page?.description}</p>
        <div className="mb-3">
          {!page?.isFollowing ? (
            <button className="btn btn-primary" onClick={handleFollow}>Follow</button>
          ) : (
            <button className="btn btn-secondary" onClick={handleUnfollow}>Unfollow</button>
          )}
        </div>
        {isOwner && (
          <button className="btn btn-success mb-3" onClick={() => setShowCreatePost(true)}>Create Post</button>
        )}
        {showCreatePost && isOwner && (
          <div className="mb-4">
            <textarea className="form-control mb-2" name="content" value={formData.content} onChange={handleInputChange} placeholder="Content"></textarea>
            <input className="form-control mb-2" name="media" value={formData.media} onChange={handleInputChange} placeholder="Media URL" />
            <input className="form-control mb-2" name="mediaType" value={formData.mediaType} onChange={handleInputChange} placeholder="Media Type" />
            <button className="btn btn-primary" onClick={handleCreatePost}>Submit Post</button>
          </div>
        )}
        <h5 className="text-dark">Posts</h5>
        {loading ? <p>Loading posts...</p> : (
          posts.map(post => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};

export default PageDetail;