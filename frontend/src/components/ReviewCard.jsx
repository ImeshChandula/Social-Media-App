import React, { useState } from 'react';
import { FaEllipsisH, FaEdit, FaTrash, FaReply, FaTimes, FaCheck, FaImage, FaVideo } from 'react-icons/fa';
import { StarRatingDisplay, StarRatingInput } from './StarRating';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const ReviewCard = ({ review, pageId, currentUserId, canReply, onUpdate, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(review.content || '');
  const [editRating, setEditRating] = useState(review.rating);
  const [loading, setLoading] = useState(false);

  // Reply states
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replies, setReplies] = useState(review.replies || []);
  const [editingReplyId, setEditingReplyId] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState('');

  const isOwner = review.userId === currentUserId || review.user?.id === currentUserId;

  const handleUpdate = async () => {
    if (editRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!editContent.trim()) {
      toast.error('Review content cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.put(`/pages/${pageId}/reviews/${review.id}`, {
        rating: editRating,
        content: editContent.trim()
      });

      if (res?.data?.success) {
        toast.success('Review updated successfully');
        onUpdate(res.data.review);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error updating review:', err);
      toast.error(err.response?.data?.message || 'Failed to update review');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.delete(`/pages/${pageId}/reviews/${review.id}`);

      if (res?.data?.success) {
        toast.success('Review deleted successfully');
        onDelete(review.id);
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      toast.error(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error('Reply content cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.post(`/pages/${pageId}/reviews/${review.id}/reply`, {
        content: replyContent.trim()
      });

      if (res?.data?.success) {
        toast.success('Reply added successfully');
        setReplies([...replies, res.data.reply]);
        setReplyContent('');
        setShowReplyForm(false);
      }
    } catch (err) {
      console.error('Error adding reply:', err);
      toast.error(err.response?.data?.message || 'Failed to add reply');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReply = async (replyId) => {
    if (!editReplyContent.trim()) {
      toast.error('Reply content cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.put(
        `/pages/${pageId}/reviews/${review.id}/reply/${replyId}`,
        { content: editReplyContent.trim() }
      );

      if (res?.data?.success) {
        toast.success('Reply updated successfully');
        setReplies(replies.map(r => r.id === replyId ? res.data.reply : r));
        setEditingReplyId(null);
        setEditReplyContent('');
      }
    } catch (err) {
      console.error('Error updating reply:', err);
      toast.error(err.response?.data?.message || 'Failed to update reply');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!window.confirm('Are you sure you want to delete this reply?')) {
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.delete(
        `/pages/${pageId}/reviews/${review.id}/reply/${replyId}`
      );

      if (res?.data?.success) {
        toast.success('Reply deleted successfully');
        setReplies(replies.filter(r => r.id !== replyId));
      }
    } catch (err) {
      console.error('Error deleting reply:', err);
      toast.error(err.response?.data?.message || 'Failed to delete reply');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className="card border-0 shadow-sm mb-3">
      <div className="card-body">
        {/* Review Header */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex gap-3 flex-grow-1">
            <img
              src={review.user?.profilePicture || '/default-avatar.png'}
              alt={`${review.user?.firstName || ''} ${review.user?.lastName || ''}`}
              className="rounded-circle"
              style={{ width: '48px', height: '48px', objectFit: 'cover' }}
            />
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <strong className="text-dark">
                    {review.user?.firstName} {review.user?.lastName}
                  </strong>
                  <div className="mt-1">
                    {isEditing ? (
                      <StarRatingInput rating={editRating} onRatingChange={setEditRating} size={18} />
                    ) : (
                      <StarRatingDisplay rating={review.rating} size={16} showNumber />
                    )}
                  </div>
                  <div className="text-secondary small">{formatDate(review.createdAt)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Menu */}
          {(isOwner || canReply) && (
            <div className="position-relative">
              <button
                className="btn btn-sm btn-light"
                onClick={() => setShowMenu(!showMenu)}
              >
                <FaEllipsisH />
              </button>
              {showMenu && (
                <div className="position-absolute end-0 mt-1 bg-white border rounded shadow-sm" style={{ minWidth: '150px', zIndex: 10 }}>
                  {isOwner && (
                    <>
                      <button
                        className="dropdown-item d-flex align-items-center"
                        onClick={() => {
                          setIsEditing(true);
                          setShowMenu(false);
                        }}
                      >
                        <FaEdit className="me-2" /> Edit
                      </button>
                      <button
                        className="dropdown-item d-flex align-items-center text-danger"
                        onClick={() => {
                          handleDelete();
                          setShowMenu(false);
                        }}
                      >
                        <FaTrash className="me-2" /> Delete
                      </button>
                    </>
                  )}
                  {canReply && !isOwner && (
                    <button
                      className="dropdown-item d-flex align-items-center"
                      onClick={() => {
                        setShowReplyForm(true);
                        setShowMenu(false);
                      }}
                    >
                      <FaReply className="me-2" /> Reply
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Review Content */}
        {isEditing ? (
          <div className="mb-3">
            <textarea
              className="form-control mb-2"
              rows="3"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              maxLength={1000}
            />
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-primary"
                onClick={handleUpdate}
                disabled={loading}
              >
                <FaCheck className="me-1" /> Save
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(review.content || '');
                  setEditRating(review.rating);
                }}
                disabled={loading}
              >
                <FaTimes className="me-1" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {review.content && (
              <p className="text-dark mb-3">{review.content}</p>
            )}
          </>
        )}

        {/* Media Display */}
        {review.media && review.media.length > 0 && !isEditing && (
          <div className="mb-3">
            {review.mediaType === 'image' ? (
              <div className="row g-2">
                {review.media.map((url, index) => (
                  <div key={index} className={`col-${review.media.length === 1 ? '12' : '6'}`}>
                    <img
                      src={url}
                      alt={`Review media ${index + 1}`}
                      className="w-100 rounded"
                      style={{ maxHeight: '300px', objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => window.open(url, '_blank')}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="row g-2">
                {review.media.map((url, index) => (
                  <div key={index} className="col-12">
                    <video
                      src={url}
                      controls
                      className="w-100 rounded"
                      style={{ maxHeight: '400px' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reply Button for Page Admins/Moderators */}
        {canReply && !showReplyForm && !isEditing && (
          <button
            className="btn btn-sm btn-outline-primary mb-3"
            onClick={() => setShowReplyForm(true)}
          >
            <FaReply className="me-1" /> Reply
          </button>
        )}

        {/* Reply Form */}
        {showReplyForm && (
          <div className="bg-light p-3 rounded mb-3">
            <textarea
              className="form-control mb-2"
              rows="2"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              maxLength={500}
            />
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-primary"
                onClick={handleReply}
                disabled={loading || !replyContent.trim()}
              >
                {loading ? 'Posting...' : 'Post Reply'}
              </button>
              <button
                className="btn btn-sm btn-secondary"
                onClick={() => {
                  setShowReplyForm(false);
                  setReplyContent('');
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Replies Section */}
        {replies.length > 0 && (
          <div className="mt-3 pt-3 border-top">
            <h6 className="text-dark fw-semibold mb-3">
              Replies ({replies.length})
            </h6>
            {replies.map((reply) => {
              const isReplyOwner = reply.userId === currentUserId || reply.user?.id === currentUserId;
              const isEditingThisReply = editingReplyId === reply.id;

              return (
                <div key={reply.id} className="d-flex gap-2 mb-3 ms-4">
                  <img
                    src={reply.user?.profilePicture || '/default-avatar.png'}
                    alt={`${reply.user?.firstName || ''} ${reply.user?.lastName || ''}`}
                    className="rounded-circle"
                    style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                  />
                  <div className="flex-grow-1">
                    <div className="bg-light p-2 rounded">
                      <div className="d-flex justify-content-between align-items-start">
                        <strong className="text-dark small">
                          {reply.user?.firstName} {reply.user?.lastName}
                        </strong>
                        {(isReplyOwner || canReply) && (
                          <div className="dropdown">
                            <button
                              className="btn btn-sm btn-link text-secondary p-0"
                              data-bs-toggle="dropdown"
                            >
                              <FaEllipsisH size={12} />
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end">
                              {isReplyOwner && (
                                <>
                                  <li>
                                    <button
                                      className="dropdown-item small"
                                      onClick={() => {
                                        setEditingReplyId(reply.id);
                                        setEditReplyContent(reply.content);
                                      }}
                                    >
                                      <FaEdit className="me-2" /> Edit
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      className="dropdown-item small text-danger"
                                      onClick={() => handleDeleteReply(reply.id)}
                                    >
                                      <FaTrash className="me-2" /> Delete
                                    </button>
                                  </li>
                                </>
                              )}
                              {canReply && !isReplyOwner && (
                                <li>
                                  <button
                                    className="dropdown-item small text-danger"
                                    onClick={() => handleDeleteReply(reply.id)}
                                  >
                                    <FaTrash className="me-2" /> Delete
                                  </button>
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                      {isEditingThisReply ? (
                        <div className="mt-2">
                          <textarea
                            className="form-control form-control-sm mb-2"
                            rows="2"
                            value={editReplyContent}
                            onChange={(e) => setEditReplyContent(e.target.value)}
                            maxLength={500}
                          />
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm btn-primary"
                              onClick={() => handleUpdateReply(reply.id)}
                              disabled={loading}
                            >
                              <FaCheck /> Save
                            </button>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => {
                                setEditingReplyId(null);
                                setEditReplyContent('');
                              }}
                              disabled={loading}
                            >
                              <FaTimes /> Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mb-0 small text-dark mt-1">{reply.content}</p>
                      )}
                    </div>
                    <div className="text-secondary small ms-2 mt-1">
                      {formatDate(reply.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;