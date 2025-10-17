import React, { useState, useEffect } from 'react';
import { FaStar, FaPen, FaFilter } from 'react-icons/fa';
import { StarRatingDisplay } from './StarRating';
import ReviewCard from './ReviewCard';
import CreateReviewModal from './CreateReviewModal';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const ReviewsSection = ({ pageId, page, isOwner }) => {
  const { authUser } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [filterRating, setFilterRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Check if current user can reply to reviews (page admin/moderator)
  const canReply = isOwner || (page && (
    page.roles?.mainAdmin === authUser?.id ||
    page.roles?.admins?.includes(authUser?.id) ||
    page.roles?.moderators?.some(mod => 
      mod.userId === authUser?.id && mod.permissions?.replyToReviews
    )
  ));

  useEffect(() => {
    fetchReviews();
  }, [pageId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/pages/${pageId}/reviews`);
      if (res?.data?.success) {
        setReviews(res.data.reviews || []);
        setAverageRating(res.data.averageRating || 0);
        setTotalReviews(res.data.totalReviews || 0);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewCreated = (newReview) => {
    setReviews([newReview, ...reviews]);
    setTotalReviews(totalReviews + 1);
    // Recalculate average rating
    const newTotal = reviews.reduce((sum, r) => sum + r.rating, 0) + newReview.rating;
    setAverageRating(newTotal / (reviews.length + 1));
    setShowCreateModal(false);
  };

  const handleReviewUpdated = (updatedReview) => {
    setReviews(reviews.map(r => r.id === updatedReview.id ? updatedReview : r));
    // Recalculate average rating
    const newTotal = reviews
      .map(r => r.id === updatedReview.id ? updatedReview.rating : r.rating)
      .reduce((sum, rating) => sum + rating, 0);
    setAverageRating(newTotal / reviews.length);
  };

  const handleReviewDeleted = (reviewId) => {
    const deletedReview = reviews.find(r => r.id === reviewId);
    const updatedReviews = reviews.filter(r => r.id !== reviewId);
    setReviews(updatedReviews);
    setTotalReviews(totalReviews - 1);
    
    // Recalculate average rating
    if (updatedReviews.length > 0) {
      const newTotal = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
      setAverageRating(newTotal / updatedReviews.length);
    } else {
      setAverageRating(0);
    }
  };

  // Calculate rating distribution
  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });
    return distribution;
  };

  const distribution = getRatingDistribution();

  // Filter reviews by rating
  const filteredReviews = filterRating > 0
    ? reviews.filter(r => r.rating === filterRating)
    : reviews;

  if (loading) {
    return (
      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading reviews...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          {/* Reviews Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h5 className="fw-bold text-dark mb-2">Customer Reviews</h5>
              <div className="d-flex align-items-center gap-3">
                <StarRatingDisplay rating={averageRating} size={20} showNumber />
                <span className="text-secondary">
                  Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            {authUser && !isOwner && (
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateModal(true)}
              >
                <FaPen className="me-2" />
                Write a Review
              </button>
            )}
          </div>

          {/* Rating Distribution */}
          {totalReviews > 0 && (
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="fw-semibold text-dark mb-0">Rating Breakdown</h6>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FaFilter className="me-1" />
                  Filter
                </button>
              </div>
              
              {showFilters && (
                <div className="row g-2 mb-3">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div key={rating} className="col-6 col-md-4">
                      <button
                        className={`btn btn-sm w-100 ${
                          filterRating === rating ? 'btn-primary' : 'btn-outline-secondary'
                        }`}
                        onClick={() => setFilterRating(filterRating === rating ? 0 : rating)}
                      >
                        <FaStar className="text-warning me-1" />
                        {rating} Star{rating !== 1 ? 's' : ''} ({distribution[rating]})
                      </button>
                    </div>
                  ))}
                  {filterRating > 0 && (
                    <div className="col-12">
                      <button
                        className="btn btn-sm btn-link text-secondary"
                        onClick={() => setFilterRating(0)}
                      >
                        Clear Filter
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="mb-2">
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = distribution[rating] || 0;
                  const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                  
                  return (
                    <div key={rating} className="d-flex align-items-center gap-2 mb-2">
                      <span className="text-dark small" style={{ width: '60px' }}>
                        {rating} <FaStar size={12} className="text-warning" />
                      </span>
                      <div className="progress flex-grow-1" style={{ height: '8px' }}>
                        <div
                          className="progress-bar bg-warning"
                          role="progressbar"
                          style={{ width: `${percentage}%` }}
                          aria-valuenow={percentage}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        ></div>
                      </div>
                      <span className="text-secondary small" style={{ width: '40px' }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filter Info */}
          {filterRating > 0 && (
            <div className="alert alert-info d-flex justify-content-between align-items-center">
              <span>
                Showing {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''} with {filterRating} star{filterRating !== 1 ? 's' : ''}
              </span>
              <button
                className="btn btn-sm btn-light"
                onClick={() => setFilterRating(0)}
              >
                Show All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews List */}
      {filteredReviews.length > 0 ? (
        filteredReviews.map(review => (
          <ReviewCard
            key={review.id}
            review={review}
            pageId={pageId}
            currentUserId={authUser?.id}
            canReply={canReply}
            onUpdate={handleReviewUpdated}
            onDelete={handleReviewDeleted}
          />
        ))
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">
            <FaStar size={64} className="text-secondary mb-3" />
            <h5 className="text-dark">
              {filterRating > 0 
                ? `No ${filterRating}-star reviews yet` 
                : 'No reviews yet'}
            </h5>
            <p className="text-secondary">
              {filterRating > 0 
                ? 'Try a different rating filter' 
                : 'Be the first to share your experience!'}
            </p>
            {authUser && !isOwner && filterRating === 0 && (
              <button
                className="btn btn-primary mt-3"
                onClick={() => setShowCreateModal(true)}
              >
                Write the First Review
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create Review Modal */}
      <CreateReviewModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        pageId={pageId}
        onReviewCreated={handleReviewCreated}
      />
    </>
  );
};

export default ReviewsSection;