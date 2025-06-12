import React from 'react';

const VideoCard = ({ video }) => {
  return (
    <div className="card shadow-sm mb-4 border-0 rounded-4">
      {video.media ? (
        <video
          className="card-img-top rounded-top-4"
          src={video.media}
          controls
          style={{ height: '250px', objectFit: 'contain' }}
        />
      ) : (
        <div
          className="d-flex align-items-center justify-content-center bg-dark text-white"
          style={{ height: '220px' }}
        >
          <p className="mb-0">No Video Available</p>
        </div>
      )}

      <div className="card-body bg-light rounded-bottom-4">
        <p className="card-text text-black mb-1">{video.content || 'No Content'}</p>
        <small className="text-muted d-block">
          Posted by: {video.user?.username || 'Unknown'}
        </small>
        <small className="text-muted">
          {new Date(video.createdAt).toLocaleDateString()}
        </small>
      </div>
    </div>
  );
};

export default VideoCard;
