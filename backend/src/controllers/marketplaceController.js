const MarketPlaceService = require('../services/marketplaceService');
const { handleMediaUpload } = require('../utils/handleMediaUpload');
const populateAuthor = require('../utils/populateAuthor');

const marketplaceService = new MarketPlaceService();

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
            const mediaType = "image";

            const result = await handleMediaUpload(images, mediaType);
            if (!result.success) {
                return res.status(result.code).json({
                    success: false,
                    error: result.error,
                    message: result.message,
                    ...(result.suggestion && { suggestion: result.suggestion }),
                    ...(result.maxSize && { maxSize: result.maxSize })
                });
            }

            updateData.images = result.imageUrl;
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
        const activeItems = await marketplaceService.findAllActive();
        if (!activeItems) {
            return res.status(400).json({success: false, message: "Error in getting active items"});
        }

        const populatedActiveItems = await populateAuthor(activeItems);
        if (!populatedActiveItems) {
            return res.status(400).json({success: false, message: "Error in populate author"});
        }

        return res.status(200).json({ success: true, message: "Active items received successfully", count: populatedActiveItems.length, data: populatedActiveItems});
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
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

        if (item.author !== req.user.id && (req.user.role !== "admin" || req.user.role !== "super_admin")) {
            return res.status(403).json({ success: false, message: "Unauthorized: You can not update others items" });
        }

        if (req.body.isAccept && (req.user.role !== "admin" || req.user.role !== "super_admin")){
            return res.status(403).json({ success: false, message: "Unauthorized: You can not update isAccept field" });
        }

        let updatedItem = await marketplaceService.updateById(itemId, rest);
        if (!updatedItem) {
            return res.status(400).json({ success: false, message: "Failed to update item data"});
        }

        const updateData = {};
        if (images != undefined) {
            const mediaType = "image";

            const result = await handleMediaUpload(images, mediaType);
            if (!result.success) {
                return res.status(result.code).json({
                    success: false,
                    error: result.error,
                    message: result.message,
                    ...(result.suggestion && { suggestion: result.suggestion }),
                    ...(result.maxSize && { maxSize: result.maxSize })
                });
            }

            updateData.images = result.imageUrl;
        }

        updatedItem = await marketplaceService.updateById(itemId, updateData);
        if (!updatedItem) {
            return res.status(400).json({ success: false, message: "Failed to update item images"});
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

        const deleteResult = await marketplaceService.deleteById(itemId);
        
        return res.status(200).json({ success: true, message: "Item deleted successfully"});
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

module.exports = {createItem, getAllItems, getAllMyItems, getAllActiveItems, updateItem, deleteItem}