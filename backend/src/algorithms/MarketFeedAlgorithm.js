/**
 * Marketplace Feed Ordering Algorithm
 * 
 * This module provides various algorithms to randomize and diversify
 * the order of items in a marketplace feed for better user experience.
 */

class MarketplaceFeedAlgorithm {
    constructor() {
        this.lastShuffleTime = null;
        this.shuffleInterval = 5 * 60 * 1000; // 5 minutes in milliseconds
        this.userSessionData = new Map(); // In production, use Redis or database
    }

    /**
     * Main method to get ordered items based on strategy
     * @param {Array} items - Array of marketplace items
     * @param {string} strategy - Ordering strategy ('random', 'weighted', 'category-mixed', 'time-based')
     * @param {string} userId - User ID for personalized ordering
     * @returns {Array} Ordered items
     */
    getOrderedItems(items, strategy = 'weighted', userId = null) {
        if (!items || items.length === 0) return [];

        switch (strategy) {
            case 'random':
                return this.shuffleArray([...items]);
            
            case 'weighted':
                return this.weightedShuffle([...items]);
            
            case 'category-mixed':
                return this.categoryMixedOrder([...items]);
            
            case 'time-based':
                return this.timeBasedOrder([...items]);
            
            case 'personalized':
                return this.personalizedOrder([...items], userId);
            
            case 'engagement-based':
                return this.engagementBasedOrder([...items]);
            
            default:
                return this.hybridAlgorithm([...items], userId);
        }
    }

    // Simple random shuffle using Fisher-Yates algorithm
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Weighted shuffle considering item properties
    // Newer items, negotiable items, and items with images get higher weight
    weightedShuffle(items) {
        const now = new Date();
        
        // Calculate weights for each item
        const weightedItems = items.map(item => {
            let weight = 1;
            
            // Boost newer items (items created in last 24 hours get 2x weight)
            const itemAge = now - new Date(item.createdAt);
            const oneDayMs = 24 * 60 * 60 * 1000;
            if (itemAge < oneDayMs) weight *= 2;
            
            // Boost negotiable items
            if (item.isNegotiable) weight *= 1.5;
            
            // Boost items with images
            if (item.images && item.images.length > 0) weight *= 1.3;
            
            // Boost items with complete location
            if (item.location.city && item.location.country) weight *= 1.2;
            
            // Reduce weight for very expensive items to mix price ranges
            if (item.price > 1000) weight *= 0.8;
            
            return { ...item, _weight: weight };
        });

        // Sort by weight with some randomness
        return weightedItems
            .sort((a, b) => {
                const randomFactor = (Math.random() - 0.5) * 0.3; // 30% randomness
                return (b._weight - a._weight) + randomFactor;
            })
            .map(item => {
                const { _weight, ...cleanItem } = item;
                return cleanItem;
            });
    }

    // Category-mixed ordering to ensure variety
    // Prevents clustering of same category items
    categoryMixedOrder(items) {
        const categories = {};
        
        // Group items by category
        items.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item);
        });

        // Shuffle items within each category
        Object.keys(categories).forEach(category => {
            categories[category] = this.shuffleArray(categories[category]);
        });

        // Interleave categories
        const result = [];
        const categoryKeys = Object.keys(categories);
        let maxLength = Math.max(...Object.values(categories).map(arr => arr.length));

        for (let i = 0; i < maxLength; i++) {
            for (const category of categoryKeys) {
                if (categories[category][i]) {
                    result.push(categories[category][i]);
                }
            }
        }

        return result;
    }

    // Time-based ordering with rotation
    // Different time periods favor different item characteristics
    timeBasedOrder(items) {
        const hour = new Date().getHours();
        let sortedItems = [...items];

        if (hour >= 6 && hour < 12) {
            // Morning: Favor newer items
            sortedItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        } else if (hour >= 12 && hour < 18) {
            // Afternoon: Favor items with images
            sortedItems.sort((a, b) => {
                const aImages = (a.images || []).length;
                const bImages = (b.images || []).length;
                return bImages - aImages;
            });
        } else {
            // Evening/Night: Favor negotiable items
            sortedItems.sort((a, b) => {
                if (a.isNegotiable && !b.isNegotiable) return -1;
                if (!a.isNegotiable && b.isNegotiable) return 1;
                return 0;
            });
        }

        // Add some randomness to the sorted result
        return this.addRandomness(sortedItems, 0.3);
    }

    // Personalized ordering based on user preferences
    personalizedOrder(items, userId) {
        if (!userId) return this.weightedShuffle(items);

        // Get user session data (in production, this would come from database)
        const userData = this.userSessionData.get(userId) || {
            viewedCategories: [],
            priceRange: { min: 0, max: Infinity },
            preferredCondition: null,
            viewCount: 0
        };

        const personalizedItems = items.map(item => {
            let score = Math.random(); // Base randomness

            // Boost items in user's viewed categories
            if (userData.viewedCategories.includes(item.category)) {
                score += 0.3;
            }

            // Boost items in user's price range
            if (item.price >= userData.priceRange.min && item.price <= userData.priceRange.max) {
                score += 0.2;
            }

            // Boost items matching preferred condition
            if (userData.preferredCondition === item.conditionType) {
                score += 0.2;
            }

            return { ...item, _score: score };
        });

        return personalizedItems
            .sort((a, b) => b._score - a._score)
            .map(item => {
                const { _score, ...cleanItem } = item;
                return cleanItem;
            });
    }

    // Engagement-based ordering
    // Simulates ordering based on item engagement metrics
    engagementBasedOrder(items) {
        return items
            .map(item => {
                // Simulate engagement score based on item characteristics
                let engagementScore = Math.random() * 10;
                
                if (item.images && item.images.length > 0) engagementScore += 3;
                if (item.isNegotiable) engagementScore += 2;
                if (item.description && item.description.length > 50) engagementScore += 1;
                if (item.tags && item.tags.length > 0) engagementScore += 1;
                
                return { ...item, _engagement: engagementScore };
            })
            .sort((a, b) => b._engagement - a._engagement)
            .map(item => {
                const { _engagement, ...cleanItem } = item;
                return cleanItem;
            });
    }

    // Hybrid algorithm combining multiple strategies
    // This is the recommended default approach
    hybridAlgorithm(items, userId = null) {
        const strategies = ['weighted', 'category-mixed', 'time-based'];
        const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
        
        // 70% of the time use weighted shuffle, 30% use random strategy
        if (Math.random() < 0.7) {
            return this.weightedShuffle(items);
        } else {
            return this.getOrderedItems(items, randomStrategy, userId);
        }
    }

    // Add controlled randomness to a sorted array
    addRandomness(sortedArray, randomnessFactor = 0.2) {
        const result = [...sortedArray];
        const swapCount = Math.floor(result.length * randomnessFactor);
        
        for (let i = 0; i < swapCount; i++) {
            const idx1 = Math.floor(Math.random() * result.length);
            const idx2 = Math.floor(Math.random() * result.length);
            [result[idx1], result[idx2]] = [result[idx2], result[idx1]];
        }
        
        return result;
    }

    // Session-based caching to avoid re-shuffling too frequently
    shouldReshuffle() {
        const now = Date.now();
        if (!this.lastShuffleTime || (now - this.lastShuffleTime) > this.shuffleInterval) {
            this.lastShuffleTime = now;
            return true;
        }
        return false;
    }

    // Update user preferences based on interaction
    updateUserPreferences(userId, item, action) {
        if (!userId) return;

        let userData = this.userSessionData.get(userId) || {
            viewedCategories: [],
            priceRange: { min: 0, max: Infinity },
            preferredCondition: null,
            viewCount: 0
        };

        if (action === 'view') {
            if (!userData.viewedCategories.includes(item.category)) {
                userData.viewedCategories.push(item.category);
            }
            userData.viewCount++;
            
            // Update price range based on viewed items
            if (userData.viewCount === 1) {
                userData.priceRange = { min: item.price * 0.5, max: item.price * 2 };
            } else {
                userData.priceRange.min = Math.min(userData.priceRange.min, item.price * 0.8);
                userData.priceRange.max = Math.max(userData.priceRange.max, item.price * 1.5);
            }
        }

        this.userSessionData.set(userId, userData);
    }
}

module.exports = MarketplaceFeedAlgorithm;

