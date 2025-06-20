const { connectFirebase } = require('../config/firebase');
const { APPEAL_STATUS } = require('../enums/appeal');
const Appeal = require('../models/Appeal');

const { db } = connectFirebase();

class AppealService {
    constructor () {
        this.collection = db.collection('appeals');
    }

    async findById(id) {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists) {
                return null;
            }

            return new Appeal(doc.id, doc.data());
        } catch (error) {
            throw error;
        }
    }

    async create(data) {
        try {
            data.createdAt = new Date().toISOString();

            const docRef = await this.collection.add(data);
            return new Appeal(docRef.id, data);
        } catch (error) {
            throw error;
        }
    }

    async hasPendingAppeals(email) {
        try {
            const querySnapshot = await this.collection
                .where('email', '==', email)
                .where('status', 'in', [APPEAL_STATUS.PENDING, APPEAL_STATUS.UNDER_REVIEW])
                .get();

            console.log('Found appeals:', querySnapshot.size);

            // Return true if any pending/under review appeals exist
            return !querySnapshot.empty;
        } catch (error) {
            console.error('Error checking pending appeals:', error);
            throw error;
        }
    }

    async findAll() {
        try {
            const docRef = await this.collection.orderBy('createdAt', 'desc').get();

            if (docRef.empty) {
                return [];
            }
            const data = docRef.docs.map(doc => new Appeal(doc.id, doc.data()));
            return data;
        } catch (error) {
            throw error;
        }
    }

    async findAllByStatus(status) {
        try {
            const docRef = await this.collection.where('status', '==', status).get();

            if (docRef.empty) {
                return [];
            }
            const data = docRef.docs.map(doc => new Appeal(doc.id, doc.data()));
            return data;
        } catch (error) {
            throw error;
        }
    }

    async findAllByPriority(priority) {
        try {
            const docRef = await this.collection.where('priority', '==', priority).get();

            if (docRef.empty) {
                return [];
            }
            const data = docRef.docs.map(doc => new Appeal(doc.id, doc.data()));
            return data;
        } catch (error) {
            throw error;
        }
    }

    async findAllUrgent(status, priority) {
        try {
            const docRef = await this.collection
                .where('status', '==', status)
                .where('priority', '==', priority)
                .get();

            if (docRef.empty) {
                return [];
            }
            const data = docRef.docs.map(doc => new Appeal(doc.id, doc.data()));
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

module.exports = AppealService;