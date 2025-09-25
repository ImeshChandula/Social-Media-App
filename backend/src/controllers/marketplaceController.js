const MarketPlaceService = require('../services/marketplaceService');
const MarketplaceFeedAlgorithm = require('../algorithms/MarketFeedAlgorithm');
const populateAuthor = require('../utils/populateAuthor');
const { uploadImages, deleteImages } = require('../storage/firebaseStorage');

const marketplaceService = new MarketPlaceService();
const feedAlgorithm = new MarketplaceFeedAlgorithm();


const createItem = async (req, res) => {
	try {
        const { images, ...rest } = req.body;

        if (!rest.category || !rest.title || !rest.price || !rest.currency || !rest.contactDetails) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const item = await marketplaceService.create(rest);
        if (!item) {
            return res.status(400).json({ success: false, message: "Failed to create item"});
        }

        const updateData = { author: req.user.id };
        if (images) {
            const resultURLs = await uploadImages(images, 'marketplace');
            updateData.images = resultURLs;
        }

        const updatedItem = await marketplaceService.updateById(item.id, updateData);
        if (!updatedItem) {
            return res.status(400).json({ success: false, message: "Failed to upload media"});
        }

        return res.status(201).json({ success: true, message: "Item created successfully", data: updatedItem});
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

const getAllItems = async (req, res) => {
	try {
        const items = await marketplaceService.findAll();
        if (!items) {
            return res.status(400).json({success: false, message: "Error in getting all items"});
        }

        const populatedItems = await populateAuthor(items);
        if (!populatedItems) {
            return res.status(400).json({success: false, message: "Error in populate author"});
        }

        return res.status(200).json({ success: true, message: "All items received successfully", count: populatedItems.length, data: populatedItems});
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

const getAllActiveItems = async (req, res) => {
	try {
        // Extract query parameters for algorithm configuration
        const { 
            strategy = 'hybrid',    // Default strategy
            userId = null,          // User ID for personalization
            refresh = 'true'       // Force refresh flag
        } = req.query;

        const activeItems = await marketplaceService.findAllActive();
        if (!activeItems) {
            return res.status(400).json({success: false, message: "Error in getting active items"});
        }

        const populatedActiveItems = await populateAuthor(activeItems);
        if (!populatedActiveItems) {
            return res.status(400).json({success: false, message: "Error in populate author"});
        }

        // Apply the ordering algorithm
        let orderedItems;
        
        // Check if we should apply new ordering (respect caching)
        if (refresh === 'true' || feedAlgorithm.shouldReshuffle()) {
            orderedItems = feedAlgorithm.getOrderedItems(
                populatedActiveItems, 
                strategy, 
                userId
            );
        } else {
            // For frequent requests, add minimal randomness to existing order
            orderedItems = feedAlgorithm.addRandomness(populatedActiveItems, 0.1);
        }

        // Log algorithm usage for debugging (remove in production)
        console.log(`Feed algorithm used: ${strategy}, User: ${userId || 'anonymous'}, Items: ${orderedItems.length}`);

        return res.status(200).json({ 
            success: true, 
            message: "Active items received successfully", 
            count: orderedItems.length, 
            data: orderedItems,
            meta: {
                strategy: strategy,
                userId: userId,
                timestamp: new Date().toISOString(),
                totalItems: orderedItems.length
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

// ===== Optional - Add user interaction tracking =====
const trackUserInteraction = async (req, res) => {
    try {
        const { userId, itemId, action } = req.body; // action: 'view', 'like', 'contact'
        
        if (!userId || !itemId || !action) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: userId, itemId, action"
            });
        }

        if (action !== 'view' || action !== 'like' || action !== 'contact') {
            return res.status(400).json({ success: false, message: "Invalid action"});
        }

        // Get item details (you might need to implement this)
        const item = await marketplaceService.findById(itemId);
        if (item) {
            feedAlgorithm.updateUserPreferences(userId, item, action);
        }

        return res.status(200).json({
            success: true,
            message: "User interaction tracked successfully"
        });

    } catch (error) {
        console.error('Error tracking user interaction:', error);
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};


const getAllMyItems = async (req, res) => {
	try {
        const myItems = await marketplaceService.findAllByUserId(req.user.id);
        if (!myItems) {
            return res.status(400).json({success: false, message: "Error in getting my items"});
        }

        const populatedMyItems = await populateAuthor(myItems);
        if (!populatedMyItems) {
            return res.status(400).json({success: false, message: "Error in populate author"});
        }

        return res.status(200).json({ success: true, message: "My items received successfully", count: populatedMyItems.length, data: populatedMyItems});
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

const updateItem = async (req, res) => {
	try {
        const itemId = req.params.id;
        const { images, ...rest } = req.body;

        const item = await marketplaceService.findById(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found"});
        }

        if (item.author !== req.user.id && (req.user.role !== "admin" && req.user.role !== "super_admin")) {
            return res.status(403).json({ success: false, message: "Unauthorized: You can not update others items" });
        }

        if (req.body.isAccept && (req.user.role !== "admin" && req.user.role !== "super_admin")) {
            return res.status(403).json({ success: false, message: "Unauthorized: You can not update isAccept field" });
        }

        if (req.body.isAvailable && item.author !== req.user.id) {
            return res.status(403).json({ success: false, message: "Unauthorized: You can not update isAvailable field" });
        }

        const updateData = { ...rest };

        // Handle images only if they have changed
        if (images != undefined) {
            const resultURLs = await uploadImages(images, 'marketplace');
            updateData.images = resultURLs;
        }

        const updatedItem = await marketplaceService.updateById(itemId, updateData);
        if (!updatedItem) {
            return res.status(400).json({ success: false, message: "Failed to update item data"});
        }

        return res.status(200).json({ success: true, message: "Item updated successfully", data: updatedItem});
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

const deleteItem = async (req, res) => {
	try {
        const currentUserId = req.user.id;
        const itemId = req.params.id;

        const item = await marketplaceService.findById(itemId);
        if (!item) {
            return res.status(404).json({ success: false, message: "Item not found"});
        }

        if (req.user.role !== 'super_admin' && item.author !== currentUserId) {
            return res.status(403).json({ success: false, message: 'Unauthorized: You can only delete your own posts' });
        }

        await deleteImages(item.images);

        const deleteResult = await marketplaceService.deleteById(itemId);
        
        return res.status(200).json({ success: true, message: "Item deleted successfully"});
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

module.exports = {createItem, getAllItems, getAllMyItems, getAllActiveItems, trackUserInteraction, updateItem, deleteItem};
