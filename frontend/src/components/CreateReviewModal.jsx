import React, { useState } from 'react';
import { FaTimes, FaStar, FaImage, FaVideo, FaTrash } from 'react-icons/fa';
import { StarRatingInput } from './StarRating';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

const CreateReviewModal = ({ show, onClose, pageId, onReviewCreated }) => {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [reviewType, setReviewType] = useState('text');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [mediaType, setMediaType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMediaChange = (e, type) => {
    const files = Array.from(e.target.files);
    const maxFiles = type === 'image' ? 6 : 2;

    if (files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} ${type}${maxFiles > 1 ? 's' : ''} allowed`);
      return;
    }

    // Validate file sizes
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} is too large. Maximum 10MB per file`);
        return;
      }
    }

    setMediaType(type);
    setMediaFiles(files);

    // Create previews
    const previews = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === files.length) {
          setMediaPreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });

    // Update review type based on content and media
    if (content.trim() && type === 'image') {
      setReviewType('image_text');
    } else if (content.trim() && type === 'video') {
      setReviewType('video_text');
    } else if (type === 'image') {
      setReviewType('image');
    } else if (type === 'video') {
      setReviewType('video');
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);

    // Update review type based on content and media
    if (newContent.trim() && mediaType === 'image') {
      setReviewType('image_text');
    } else if (newContent.trim() && mediaType === 'video') {
      setReviewType('video_text');
    } else if (newContent.trim() && !mediaType) {
      setReviewType('text');
    } else if (!newContent.trim() && mediaType === 'image') {
      setReviewType('image');
    } else if (!newContent.trim() && mediaType === 'video') {
      setReviewType('video');
    } else if (!newContent.trim() && !mediaType) {
      setReviewType('text'); // Default to text type
    }
  };

  const removeMedia = () => {
    setMediaFiles([]);
    setMediaPreviews([]);
    setMediaType('');
    if (content.trim()) {
      setReviewType('text');
    } else {
      setReviewType('text');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!content.trim() && mediaFiles.length === 0) {
      toast.error('Please add content or media to your review');
      return;
    }

    setLoading(true);

    try {
      // Build form data based on what's available
      const formData = {
        rating,
        reviewType
      };

      // Only add content if it exists
      if (content.trim()) {
        formData.content = content.trim();
      }

      // Only add media fields if there are media files
      if (mediaFiles.length > 0 && mediaPreviews.length > 0) {
        formData.media = mediaPreviews;
        formData.mediaType = mediaType;
      }

      const res = await axiosInstance.post(`/pages/${pageId}/reviews`, formData);

      if (res?.data?.success) {
        toast.success('Review posted successfully!');
        onReviewCreated(res.data.review);
        handleClose();
      }
    } catch (err) {
      console.error('Error creating review:', err);
      toast.error(err.response?.data?.message || 'Failed to post review');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setContent('');
    setReviewType('text');
    setMediaFiles([]);
    setMediaPreviews([]);
    setMediaType('');
    onClose();
  };

  if (!show) return null;

  return (
    <div 
      className="modal fade show d-block" 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
      onClick={(e) => {
        // Close modal if clicking on backdrop
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        className="modal-dialog modal-lg modal-dialog-centered"
        style={{ maxHeight: '90vh', margin: '1.75rem auto' }}
      >
        <div 
          className="modal-content border-0 shadow"
          style={{ 
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Fixed Header */}
          <div className="modal-header border-bottom" style={{ flexShrink: 0 }}>
            <h5 className="modal-title fw-bold text-dark">Write a Review</h5>
            <button 
              className="btn-close" 
              onClick={handleClose}
              type="button"
            ></button>
          </div>

          {/* Scrollable Body */}
          <div 
            className="modal-body" 
            style={{ 
              overflowY: 'auto',
              overflowX: 'hidden',
              flexGrow: 1,
              flexShrink: 1
            }}
          >
            <form id="reviewForm" onSubmit={handleSubmit}>
              {/* Rating Input */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  Your Rating <span className="text-danger">*</span>
                </label>
                <div style={{ minWidth: '300px' }}>
                  <StarRatingInput rating={rating} onRatingChange={setRating} size={32} />
                </div>
                {rating === 0 && (
                  <small className="text-muted d-block mt-1">
                    Click on the stars to rate this page
                  </small>
                )}
              </div>

              {/* Content Input */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  Your Review {mediaFiles.length === 0 && <span className="text-muted small">(required)</span>}
                </label>
                <textarea
                  className="form-control"
                  rows="4"
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Share your experience with this page..."
                  maxLength={1000}
                />
                <small className="text-secondary">
                  {content.length}/1000 characters
                </small>
              </div>

              {/* Media Upload */}
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark">
                  Add Photos or Videos <span className="text-muted small">(optional)</span>
                </label>
                <div className="d-flex gap-2 flex-wrap">
                  <label className="btn btn-outline-primary">
                    <FaImage className="me-2" />
                    Add Photos
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="d-none"
                      onChange={(e) => handleMediaChange(e, 'image')}
                      disabled={mediaType === 'video'}
                    />
                  </label>
                  <label className="btn btn-outline-primary">
                    <FaVideo className="me-2" />
                    Add Videos
                    <input
                      type="file"
                      multiple
                      accept="video/*"
                      className="d-none"
                      onChange={(e) => handleMediaChange(e, 'video')}
                      disabled={mediaType === 'image'}
                    />
                  </label>
                </div>
                <small className="text-secondary d-block mt-2">
                  Maximum 6 images or 2 videos (10MB each)
                </small>
              </div>

              {/* Media Previews */}
              {mediaPreviews.length > 0 && (
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold text-dark">
                      {mediaType === 'image' ? 'Photos' : 'Videos'} ({mediaPreviews.length})
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={removeMedia}
                    >
                      <FaTrash className="me-1" />
                      Remove All
                    </button>
                  </div>
                  <div className="row g-2">
                    {mediaPreviews.map((preview, index) => (
                      <div key={index} className={`col-${mediaPreviews.length === 1 ? '12' : mediaPreviews.length === 2 ? '6' : '4'}`}>
                        {mediaType === 'image' ? (
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-100 rounded"
                            style={{ height: '150px', objectFit: 'cover' }}
                          />
                        ) : (
                          <video
                            src={preview}
                            className="w-100 rounded"
                            style={{ height: '150px', objectFit: 'cover' }}
                            controls
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="alert alert-info">
                <small>
                  <strong>Note:</strong> Your rating is required. Please add either text content or media (photos/videos) to your review. Your review will be visible to everyone who visits this page.
                </small>
              </div>
            </form>
          </div>

          {/* Fixed Footer */}
          <div className="modal-footer border-top" style={{ flexShrink: 0 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="reviewForm"
              className="btn btn-primary"
              disabled={loading || rating === 0}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Posting...
                </>
              ) : (
                'Post Review'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateReviewModal;