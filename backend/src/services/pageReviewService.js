const { connectFirebase } = require('../config/firebase');
const PageReview = require('../models/PageReview');

const { db } = connectFirebase();

class PageReviewService {
    constructor() {
        this.collection = db.collection('pageReviews');
    }

    // Create a new review
    async createReview(reviewData) {
        try {
            reviewData.createdAt = new Date().toISOString();
            reviewData.updatedAt = new Date().toISOString();
            reviewData.isActive = true;
            reviewData.replies = [];

            const docRef = await this.collection.add(reviewData);
            return new PageReview(docRef.id, reviewData);
        } catch (error) {
            console.error('Error creating review:', error);
            throw error;
        }
    }

    // Find review by ID
    async findById(id) {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists) {
                return null;
            }
            return new PageReview(doc.id, doc.data());
        } catch (error) {
            console.error('Error finding review by ID:', error);
            throw error;
        }
    }

    // Find all reviews for a page
    async findByPageId(pageId) {
        try {
            const snapshot = await this.collection
                .where('pageId', '==', pageId)
                .where('isActive', '==', true)
                .get();

            if (snapshot.empty) {
                return [];
            }

            const reviews = snapshot.docs.map(doc => new PageReview(doc.id, doc.data()));

            // Sort by creation date (newest first)
            reviews.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });

            return reviews;
        } catch (error) {
            console.error('Error finding reviews by page ID:', error);
            throw error;
        }
    }

    // Find reviews by user
    async findByUserId(userId) {
        try {
            const snapshot = await this.collection
                .where('userId', '==', userId)
                .where('isActive', '==', true)
                .get();

            if (snapshot.empty) {
                return [];
            }

            const reviews = snapshot.docs.map(doc => new PageReview(doc.id, doc.data()));

            // Sort by creation date (newest first)
            reviews.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });

            return reviews;
        } catch (error) {
            console.error('Error finding reviews by user ID:', error);
            throw error;
        }
    }

    // Update review
    async updateById(id, updateData) {
        try {
            updateData.updatedAt = new Date().toISOString();
            await this.collection.doc(id).update(updateData);
            return await this.findById(id);
        } catch (error) {
            console.error('Error updating review:', error);
            throw error;
        }
    }

    // Delete review (soft delete)
    async deleteById(id) {
        try {
            await this.collection.doc(id).update({
                isActive: false,
                updatedAt: new Date().toISOString()
            });
            return true;
        } catch (error) {
            console.error('Error deleting review:', error);
            throw error;
        }
    }

    // Add reply to review
    async addReply(reviewId, replyData) {
        try {
            const review = await this.findById(reviewId);
            if (!review) {
                throw new Error('Review not found');
            }

            const reply = {
                id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                userId: replyData.userId,
                content: replyData.content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const replies = review.replies || [];
            replies.push(reply);

            await this.updateById(reviewId, { replies });
            return reply;
        } catch (error) {
            console.error('Error adding reply:', error);
            throw error;
        }
    }

    // Update reply
    async updateReply(reviewId, replyId, content) {
        try {
            const review = await this.findById(reviewId);
            if (!review) {
                throw new Error('Review not found');
            }

            const replies = review.replies || [];
            const replyIndex = replies.findIndex(r => r.id === replyId);

            if (replyIndex === -1) {
                throw new Error('Reply not found');
            }

            replies[replyIndex].content = content;
            replies[replyIndex].updatedAt = new Date().toISOString();

            await this.updateById(reviewId, { replies });
            return replies[replyIndex];
        } catch (error) {
            console.error('Error updating reply:', error);
            throw error;
        }
    }

    // Delete reply
    async deleteReply(reviewId, replyId) {
        try {
            const review = await this.findById(reviewId);
            if (!review) {
                throw new Error('Review not found');
            }

            const replies = review.replies || [];
            const updatedReplies = replies.filter(r => r.id !== replyId);

            await this.updateById(reviewId, { replies: updatedReplies });
            return true;
        } catch (error) {
            console.error('Error deleting reply:', error);
            throw error;
        }
    }

    // Get average rating for a page
    async getAverageRating(pageId) {
        try {
            const reviews = await this.findByPageId(pageId);
            if (reviews.length === 0) {
                return { average: 0, count: 0 };
            }

            const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
            const average = sum / reviews.length;

            return {
                average: Math.round(average * 10) / 10, // Round to 1 decimal
                count: reviews.length
            };
        } catch (error) {
            console.error('Error calculating average rating:', error);
            throw error;
        }
    }
}

module.exports = new PageReviewService();