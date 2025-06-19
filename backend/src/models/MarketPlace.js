
class MarketPlace {
    constructor (id, data){
        this.id = id;
        this.author = data.author;

        this.category = data.category;
        this.title = data.title;
        this.description = data.description;
        this.price = data.price;
        this.currency = data.currency;
        this.contactDetails = data.contactDetails;
        this.location = data.location;
        this.conditionType = data.conditionType;
        this.images = data.images || []; // Only for cases where images are added later
        this.quantity = data.quantity;
        this.isNegotiable = data.isNegotiable;
        this.isAvailable = data.isAvailable;
        this.isAccept = data.isAccept;
        this.status = data.status;
        this.expiresAt = data.expiresAt;
        this.tags = data.tags;

        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }
}

module.exports = MarketPlace;