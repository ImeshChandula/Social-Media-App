import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { axiosInstance } from '../lib/axios';
import VideoFeed from '../components/VideoFeed';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('For You');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categories = ["For You", "Live", "Music", "News", "Technology", "My Videos"];

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axiosInstance.get('/posts/feed/videos');
        const videoList = res.data.posts || [];

        const updatedVideos = videoList.map(video => ({
          ...video,
          mediaUrl: video.mediaUrl?.startsWith('http')
            ? video.mediaUrl
            : `${import.meta.env.VITE_APP_API_URL}/uploads/${video.mediaUrl}`
        }));

        setVideos(updatedVideos);
      } catch (err) {
        setError('Failed to fetch videos.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title?.toLowerCase().includes(searchTerm.toLowerCase());
    if (selectedCategory === 'For You') return matchesSearch;
    if (selectedCategory === 'My Videos') return video.isMyVideo && matchesSearch;
    return matchesSearch; // You can extend this logic later for real categories
  });

  return (
    <div className="container mt-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2 className="fs-2 mb-0">Videos</h2>
        <input
          type="text"
          placeholder="Search Videos"
          className="form-control"
          style={{ width: '300px', height: '45px', borderRadius: '25px', fontSize: '16px', backgroundColor: '#f1f1f1' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Category Tabs */}
      <div className="d-flex mb-4 gap-3 flex-wrap">
        {categories.map((cat, idx) => (
          <button
            key={idx}
            className={`btn ${selectedCategory === cat ? 'btn-success' : 'btn-outline-secondary'}`}
            style={{ borderRadius: '25px', fontSize: '16px', padding: '8px 20px' }}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 mb-4">
          <div style={{ backgroundColor: "#6A6A6AFF", borderRadius: "12px", padding: "20px", minHeight: "300px" }}>
            <h5 className="mb-4 text-dark">Your Videos</h5>
            <ul className="list-unstyled fs-6">
              <li className="mb-3">📌 Watch Later</li>
              <li className="mb-3">💾 Saved Videos</li>
              <li className="mb-3">❤️ Liked Videos</li>
            </ul>
          </div>
        </div>

        {/* Main Feed */}
        <div className="col-md-9">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <VideoFeed videos={filteredVideos} selectedCategory={selectedCategory} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Videos;
