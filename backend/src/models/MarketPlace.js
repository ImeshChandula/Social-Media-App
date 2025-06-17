
class MarketPlace {
    constructor (id, data){
        this.id = id;
        this.author = data.author;

        this.category = data.category;
        this.title = data.title;
        this.description = data.description || '';
        this.price = data.price || 0;
        this.currency = data.currency || "USD";
        this.contactDetails = {
            phone: data.contactDetails?.phone || '',
            email: data.contactDetails?.email || '',
            whatsapp: data.contactDetails?.whatsapp || ''
        };
        this.location = {
            city: data.location?.city || '',
            state: data.location?.state || '',
            country: data.location?.country || '',
            postalCode: data.location?.postalCode || ''
        };
        this.conditionType = data.conditionType || "new"; // 'new', 'like_new', 'good', 'fair', 'poor'
        this.images = data.images || [];
        this.quantity = data.quantity || 1;

        this.isNegotiable = data.isNegotiable !== undefined ? data.isNegotiable : false;
        this.isAvailable = data.isAvailable !== undefined ? data.isAvailable : true;
        this.isAccept = data.isAccept !== undefined ? data.isAccept : true;
        this.status = data.status || "active"; // 'active', 'sold', 'expired', 'removed', 'pending'
        this.expiresAt = data.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        this.tags = data.tags || [];

        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }
}

module.exports = MarketPlace;