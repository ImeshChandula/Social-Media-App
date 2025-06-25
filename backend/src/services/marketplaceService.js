const { connectFirebase } = require('../config/firebase');
const MarketPlace = require('../models/MarketPlace');

const { db } = connectFirebase();

class MarketPlaceService {
    constructor () {
        this.collection = db.collection('marketplace');
    }

    async findById(id) {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists) {
                return null;
            }

            return new MarketPlace(doc.id, doc.data());
        } catch (error) {
            throw error;
        }
    }

    async create(data) {
        try {
            data.createdAt = new Date().toISOString();

            const docRef = await this.collection.add(data);
            return new MarketPlace(docRef.id, data);
        } catch (error) {
            throw error;
        }
    }

    async findAll() {
        try {
            let updatedItemsCount = 0;
            try {
                updatedItemsCount = await this.updateExpiredItems();
            } catch (err) {
                console.error("Failed to update expired items:", err.message);
            }
            console.log(`✅ Updated ${updatedItemsCount} expired items at ${new Date().toLocaleString()}`);
            
            const docRef = await this.collection.orderBy('createdAt', 'desc').get();

            if (docRef.empty) {
                return [];
            }

            const data = docRef.docs.map(doc => new MarketPlace(doc.id, doc.data()));
            return data;
        } catch (error) {
            throw error;
        }
    }

    async findAllByUserId(userId) {
        try {
            let updatedItemsCount = 0;
            try {
                updatedItemsCount = await this.updateExpiredItems();
            } catch (err) {
                console.error("Failed to update expired items:", err.message);
            }
            console.log(`✅ Updated ${updatedItemsCount} expired items at ${new Date().toLocaleString()}`);

            const docRef = await this.collection
                .where('author', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();

            if (docRef.empty) {
                return [];
            } 

            const data = docRef.docs.map(doc => new MarketPlace(doc.id, doc.data()));
            return data;
        } catch (error) {
            throw error;
        }
    }

    async findAllActive () {
        try {
            let updatedItemsCount = 0;
            try {
                updatedItemsCount = await this.updateExpiredItems();
            } catch (err) {
                console.error("Failed to update expired items:", err.message);
            }
            console.log(`✅ Updated ${updatedItemsCount} expired items at ${new Date().toLocaleString()}`);

            const docRef = await this.collection
                .where('isAccept', '==', true)
                .where('isAvailable', '==', true)
                .orderBy('createdAt', 'desc')
                .get();

            console.log("Total docs found: " + docRef.size);
            if (docRef.empty) {
                return [];
            }

            const data = docRef.docs.map(doc => new MarketPlace(doc.id, doc.data()));
            return data;
        } catch (error) {
            throw error;
        }
    }

    async updateById(id, updateData) {
        try {
            updateData.updatedAt = new Date().toISOString();
        
            await this.collection.doc(id).update(updateData);
        
            const updatedRef = await this.findById(id);
            return updatedRef;
        } catch (error) {
            throw error;
        }
    }

    async deleteById(id) {
        try {
            await this.collection.doc(id).delete();
            return true;
        } catch (error) {
            throw error;
        }
    }

    async debugCollection() {
        try {
            // Get ALL documents without any filters
            const allDocs = await this.collection.get();
            console.log("Total documents in collection:", allDocs.size);
            
            if (allDocs.size > 0) {
                allDocs.docs.forEach(doc => {
                    const data = doc.data();
                    console.log(`Doc ID: ${doc.id}`);
                    console.log(`isAccept: ${data.isAccept} (type: ${typeof data.isAccept})`);
                    console.log(`isAvailable: ${data.isAvailable} (type: ${typeof data.isAvailable})`);
                    console.log("---");
                });
            }
        } catch (error) {
            console.error("Error fetching all docs:", error);
        }
    }

    async updateExpiredItems() {
        try {
            const currentDate = new Date().toISOString();

            const expiredItemsRef = await this.collection
                .where('expiresAt', '<', currentDate)
                .where('isAvailable', '==', true)
                .get();

            if (expiredItemsRef.empty) {
                console.log('No expired items found to update');
                return 0;
            }

            // Batch update for better performance
            const batch = db.batch();
            let updateCount = 0;

            expiredItemsRef.docs.forEach(doc => {
                batch.update(doc.ref, {
                    isAvailable: false,
                    updatedAt: new Date().toISOString(),
                    status: 'expired' // Optional: update status as well
                });
                updateCount++;
            });

            await batch.commit();
            console.log(`Updated ${updateCount} expired items`);
            return updateCount;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = MarketPlaceService;