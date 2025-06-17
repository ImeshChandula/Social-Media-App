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
}

module.exports = MarketPlaceService;