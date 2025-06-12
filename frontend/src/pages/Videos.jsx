import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { axiosInstance } from '../lib/axios';
import VideoCard from '../components/VideoCard';
import toast from 'react-hot-toast';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideoPosts = async () => {
      try {
        const response = await axiosInstance.get('/posts/feed/videos');
        if (response.data.success) {
          setVideos(response.data.posts || []);
        } else {
          setVideos([]);
          toast.error(response.data.message || 'Failed to fetch videos');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || err.message || 'Failed to fetch videos');
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoPosts();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="row">
        {videos.length > 0 ? (
          videos.map(video => (
            <div key={video._id} className="col-12 col-sm-6 col-lg-4">
              <VideoCard video={video} />
            </div>
          ))
        ) : (
          <div className="col-12 text-center">
            <p>No videos available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Videos;
