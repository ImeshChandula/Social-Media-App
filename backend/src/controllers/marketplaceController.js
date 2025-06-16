const MarketPlaceService = require('../services/marketplaceService');

const marketplaceService = new MarketPlaceService();

const createItem = async (req, res) => {
	try {
        const itemData = {
            author: req.user.id,
            ...req.body
        }
        const item = await marketplaceService.create(itemData);
        if (!item) {
            return res.status(400).json({ success: false, message: "Failed to create item"});
        }

        return res.status(201).json({ success: true, message: "Item created successfully", data: item});
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

module.exports = {createItem}