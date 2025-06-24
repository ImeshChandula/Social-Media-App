/**
 * Facebook-like Feed Algorithm
 * Handles post ordering, engagement-based ranking, refresh behavior, and more
 */

class FeedAlgorithm {
    constructor() {
        this.WEIGHTS = {
            RECENCY: 0.3,           // How recent the post is
            ENGAGEMENT: 0.4,        // Likes, comments, shares
            RELATIONSHIP: 0.2,      // How close user is to author
            CONTENT_TYPE: 0.1       // Media posts vs text posts
        };

        this.ENGAGEMENT_WEIGHTS = {
            LIKE: 1,
            COMMENT: 3,             // Comments are more valuable than likes
            SHARE: 5,               // Shares are most valuable
            RECENT_COMMENT: 8       // Recent comments boost post to top
        };

        this.TIME_DECAY_HOURS = 24; // Posts older than 24h get less weight
        this.REFRESH_RANDOMIZATION = 0.15; // 15% randomization on refresh
    }

    /**
     * Main algorithm to sort and rank posts for feed
     * @param {Array} posts - Array of post objects
     * @param {String} currentUserId - Current user's ID
     * @param {Array} userFriends - Array of user's friend IDs
     * @param {Object} options - Additional options
     * @returns {Array} Sorted posts
     */
    generateFeed(posts, currentUserId, userFriends = [], options = {}) {
        const {
            isRefresh = false,
            lastSeenPosts = [],
            userInteractions = {},
            prioritizeEngagement = true
        } = options;

        // Calculate scores for each post
        const scoredPosts = posts.map(post => {
            const score = this.calculatePostScore(post, currentUserId, userFriends, userInteractions);
            return {
                ...post,
                feedScore: score,
                isNew: !lastSeenPosts.includes(post.id)
            };
        });

        // Apply different sorting strategies
        let sortedPosts;
        
        if (prioritizeEngagement) {
            sortedPosts = this.sortByEngagementAndRecency(scoredPosts);
        } else {
            sortedPosts = this.sortByRecency(scoredPosts);
        }

        // Apply refresh randomization
        if (isRefresh) {
            sortedPosts = this.applyRefreshRandomization(sortedPosts);
        }

        // Promote posts with recent activity
        sortedPosts = this.promoteRecentActivity(sortedPosts);

        // Ensure diversity (avoid too many posts from same author)
        sortedPosts = this.ensureDiversity(sortedPosts);

        return sortedPosts;
    }

    /**
     * Calculate comprehensive score for a post
     */
    calculatePostScore(post, currentUserId, userFriends, userInteractions = {}) {
        const recencyScore = this.calculateRecencyScore(post);
        const engagementScore = this.calculateEngagementScore(post);
        const relationshipScore = this.calculateRelationshipScore(post, currentUserId, userFriends);
        const contentTypeScore = this.calculateContentTypeScore(post);
        const userInteractionScore = this.calculateUserInteractionScore(post, userInteractions);

        const totalScore = 
            (recencyScore * this.WEIGHTS.RECENCY) +
            (engagementScore * this.WEIGHTS.ENGAGEMENT) +
            (relationshipScore * this.WEIGHTS.RELATIONSHIP) +
            (contentTypeScore * this.WEIGHTS.CONTENT_TYPE) +
            userInteractionScore;

        return Math.max(0, totalScore);
    }

    /**
     * Calculate recency score (newer posts get higher scores)
     */
    calculateRecencyScore(post) {
        const now = new Date();
        const postTime = new Date(post.createdAt);
        const hoursOld = (now - postTime) / (1000 * 60 * 60);

        if (hoursOld < 1) return 1.0;
        if (hoursOld < 6) return 0.8;
        if (hoursOld < 24) return 0.6;
        if (hoursOld < 72) return 0.4;
        return 0.2;
    }

    /**
     * Calculate engagement score based on likes, comments, shares
     */
    calculateEngagementScore(post) {
        const likes = post.likeCount || 0;
        const comments = post.commentCount || 0;
        const shares = post.shareCount || 0;

        // Check for recent comments (last 2 hours)
        const recentComments = this.getRecentComments(post, 2);

        const engagementScore = 
            (likes * this.ENGAGEMENT_WEIGHTS.LIKE) +
            (comments * this.ENGAGEMENT_WEIGHTS.COMMENT) +
            (shares * this.ENGAGEMENT_WEIGHTS.SHARE) +
            (recentComments * this.ENGAGEMENT_WEIGHTS.RECENT_COMMENT);

        // Normalize score (assuming max realistic engagement)
        return Math.min(engagementScore / 100, 1.0);
    }

    /**
     * Calculate relationship score (closer friends get higher scores)
     */
    calculateRelationshipScore(post, currentUserId, userFriends) {
        if (post.author === currentUserId) {
            return 1.0; // User's own posts
        }

        if (userFriends.includes(post.author)) {
            return 0.8; // Friend's posts
        }

        return 0.3; // Public posts from non-friends
    }

    /**
     * Calculate content type score (media posts vs text)
     */
    calculateContentTypeScore(post) {
        if (post.media && post.media.length > 0) {
            if (post.mediaType === 'video') return 0.9;
            if (post.mediaType === 'image') return 0.7;
        }
        return 0.5; // Text posts
    }

    /**
     * Calculate score based on user's past interactions
     */
    calculateUserInteractionScore(post, userInteractions) {
        const authorInteractions = userInteractions[post.author] || {};
        const likesGiven = authorInteractions.likes || 0;
        const commentsGiven = authorInteractions.comments || 0;

        // Users who interact more with an author see more of their posts
        return Math.min((likesGiven * 0.1 + commentsGiven * 0.2) / 10, 0.5);
    }

    /**
     * Get count of recent comments within specified hours
     */
    getRecentComments(post, withinHours = 2) {
        if (!post.comments || post.comments.length === 0) return 0;

        const cutoffTime = new Date(Date.now() - (withinHours * 60 * 60 * 1000));
        return post.comments.filter(comment => 
            new Date(comment.createdAt) > cutoffTime
        ).length;
    }

    /**
     * Sort posts by engagement and recency combined
     */
    sortByEngagementAndRecency(posts) {
        return posts.sort((a, b) => {
            // First, prioritize posts with recent activity
            const aRecentActivity = this.getRecentComments(a, 1);
            const bRecentActivity = this.getRecentComments(b, 1);

            if (aRecentActivity !== bRecentActivity) {
                return bRecentActivity - aRecentActivity;
            }

            // Then sort by feed score
            if (Math.abs(a.feedScore - b.feedScore) > 0.1) {
                return b.feedScore - a.feedScore;
            }

            // Finally, sort by recency
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }

    /**
     * Sort posts purely by recency
     */
    sortByRecency(posts) {
        return posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    /**
     * Apply randomization when user refreshes to show different content
     */
    applyRefreshRandomization(posts) {
        return posts.map(post => ({
            ...post,
            feedScore: post.feedScore + (Math.random() - 0.5) * this.REFRESH_RANDOMIZATION
        })).sort((a, b) => b.feedScore - a.feedScore);
    }

    /**
     * Promote posts with recent comments to the top
     */
    promoteRecentActivity(posts) {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));

        return posts.sort((a, b) => {
            // Check if posts have recent comments (within 1 hour)
            const aHasRecentActivity = this.hasRecentActivity(a, oneHourAgo);
            const bHasRecentActivity = this.hasRecentActivity(b, oneHourAgo);

            if (aHasRecentActivity && !bHasRecentActivity) return -1;
            if (!aHasRecentActivity && bHasRecentActivity) return 1;

            // If both or neither have recent activity, maintain existing order
            return 0;
        });
    }

    /**
     * Check if post has recent activity
     */
    hasRecentActivity(post, cutoffTime) {
        if (!post.comments || post.comments.length === 0) return false;

        return post.comments.some(comment => 
            new Date(comment.createdAt) > cutoffTime
        );
    }

    /**
     * Ensure diversity by limiting consecutive posts from same author
     */
    ensureDiversity(posts) {
        const result = [];
        const authorPostCount = {};
        const maxConsecutivePosts = 2;

        for (const post of posts) {
            const authorId = post.author;
            
            // Count recent posts from this author
            const recentPostsFromAuthor = result
                .slice(-maxConsecutivePosts)
                .filter(p => p.author === authorId).length;

            if (recentPostsFromAuthor < maxConsecutivePosts) {
                result.push(post);
            } else {
                // Find a good position to insert this post later
                const insertIndex = this.findDiverseInsertPosition(result, post);
                result.splice(insertIndex, 0, post);
            }
        }

        return result;
    }

    /**
     * Find appropriate position to insert post for diversity
     */
    findDiverseInsertPosition(existingPosts, newPost) {
        for (let i = existingPosts.length - 1; i >= 0; i--) {
            if (existingPosts[i].author !== newPost.author) {
                return i + 1;
            }
        }
        return existingPosts.length;
    }

    /**
     * Filter out posts user has already seen (for infinite scroll)
     */
    filterSeenPosts(posts, seenPostIds) {
        return posts.filter(post => !seenPostIds.includes(post.id));
    }

    /**
     * Get trending posts (high engagement in short time)
     */
    getTrendingPosts(posts, hours = 6) {
        const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
        
        return posts
            .filter(post => new Date(post.createdAt) > cutoffTime)
            .sort((a, b) => {
                const aEngagement = (a.likeCount || 0) + (a.commentCount || 0) * 2 + (a.shareCount || 0) * 3;
                const bEngagement = (b.likeCount || 0) + (b.commentCount || 0) * 2 + (b.shareCount || 0) * 3;
                return bEngagement - aEngagement;
            });
    }

    /**
     * Personalize feed based on user's interaction history
     */
    personalizeFeed(posts, userInteractionData) {
        // Boost posts from authors user frequently interacts with
        return posts.map(post => {
            const authorInteractions = userInteractionData[post.author] || { likes: 0, comments: 0 };
            const interactionBoost = (authorInteractions.likes * 0.1 + authorInteractions.comments * 0.2) / 10;
            
            return {
                ...post,
                feedScore: (post.feedScore || 0) + interactionBoost
            };
        }).sort((a, b) => (b.feedScore || 0) - (a.feedScore || 0));
    }
}

module.exports = FeedAlgorithm;