const { connectFirebase } = require('../config/firebase');
const { APPEAL_STATUS, APPEAL_PRIORITY} = require('../enums/appeal');
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

    async hasPendingAppeals(userId) {
        try {
            const querySnapshot = await this.collection
                .where('userId', '==', userId)
                .where('status', 'in', [APPEAL_STATUS.PENDING, APPEAL_STATUS.UNDER_REVIEW])
                .get();
            
            if (querySnapshot.empty) {
                return null;
            }

            return new Appeal(querySnapshot.id, querySnapshot.data());
        } catch (error) {}
    }
}

module.exports = AppealService;