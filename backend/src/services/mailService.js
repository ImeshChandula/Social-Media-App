const { connectFirebase } = require('../config/firebase');
const Mail = require('../models/Mail');

const { db } = connectFirebase();

class MailService {
    constructor () {
        this.collection = db.collection('mails');
    }

    async findById(id) {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists) {
                return null;
            }

            return new Mail(doc.id, doc.data());
        } catch (error) {
            throw error;
        }
    }

    async create(data) {
        try {
            data.createdAt = new Date().toISOString();

            const docRef = await this.collection.add(data);
            return new Mail(docRef.id, data);
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
            const data = docRef.docs.map(doc => new Mail(doc.id, doc.data()));
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
};

module.exports = MailService;