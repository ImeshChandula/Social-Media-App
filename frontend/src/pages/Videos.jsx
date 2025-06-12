import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { axiosInstance } from '../lib/axios';
import VideoFeed from '../components/VideoFeed';
import toast from 'react-hot-toast';
import '../styles/Videos.css';
import PostLikeButton from '../components/PostLikeButton';

const Videos = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    const fetchVideoPosts = async () => {
      try {
        const response = await axiosInstance.get('/posts/feed/videos');
        if (response.data.success) {
          setVideos(response.data.posts || []);
        }else{
          setVideos([]);
          toast.error(response.data.message || 'Failed to fetch videos');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Failed to fetch videos');
        console.error('Error fetching videos:', err);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoPosts();
  }, []);

  if (loading) return <p>Loading videos...</p>;
  
  return(
    <div>
      {videos.map(videos => (
        <div key={videos._id} className="video-item">
          <h3>{videos.title}</h3>
          <video controls width="100%">
            <source src={videos.media} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          <p>{videos.description}</p>
          <p>Posted by: {videos.user?.username || 'Unknown'}</p>
          <p>Date: {new Date(videos.createdAt).toLocaleDateString()}</p> 
        </div>
      ))}
    </div>
  );
};

export default Videos;
