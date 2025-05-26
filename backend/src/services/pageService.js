const { connectFirebase } = require('../config/firebase');
const Page = require('../models/Page');

const { db } = connectFirebase();

class PageService {
    constructor() {
        this.collection = db.collection('pages');
    }

    async createPage(pageData) {
        try {
            pageData.createdAt = new Date().toISOString();
            
            const docRef = await this.collection.add(pageData);
            return new Page(docRef.id, pageData);
        } catch (error) {
            throw error;
        }
    }

}


module.exports = PageService;