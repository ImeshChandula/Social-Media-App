const { connectFirebase } = require('../config/firebase');
const Category = require('../models/Category');

const { db } = connectFirebase();

class CategoryService {
    constructor () {
        this.collection = db.collection('categories');
    }

    // find by id
    async findById(id) {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists) {
                return null;
            }

            return new Category(doc.id, doc.data());
        } catch (error) {
            throw error;
        }
    }

    // find by job name
    async findByNameAndField(name, field) {
        try {
            const jobRef = await this.collection
                .where('categoryFor', '==', field)
                .where('name', '==', name)
                .get();
            
            if (jobRef.empty) {
                return null;
            }

            const category = jobRef.docs.map(doc => new Category(doc.id, doc.data()));
            return category
        } catch (error) {
            throw error;
        }
    }

    // Create new job category
    async create(categoryData) {
        try {
            categoryData.createdAt = new Date().toISOString();

            const docRef = await this.collection.add(categoryData);
            return new Category(docRef.id, categoryData);
        } catch (error) {
            throw error;
        }
    }

    // get all job categories
    async findAll() {
        try {
            const jobRef = await this.collection.orderBy('createdAt', 'desc').get();

            if (jobRef.empty) {
                return [];
            }
            const categories = jobRef.docs.map(doc => new Category(doc.id, doc.data()));
            return categories;
        } catch (error) {
            throw error;
        }
    }

    async findAllByField(field) {
        try {
            const jobRef = await this.collection
                .where('categoryFor', '==', field)
                .orderBy('createdAt', 'desc')
                .get();

            if (jobRef.empty) {
                return [];
            }
            const categories = jobRef.docs.map(doc => new Category(doc.id, doc.data()));
            return categories;
        } catch (error) {
            throw error;
        }
    }

    // get all active
    async findAllActiveByField(field) {
        try {
            const jobRef = await this.collection
            .where('categoryFor', '==', field)
            .where('isActive', '==', true)
            .orderBy('name')
            .get();

        if (jobRef.empty) {
            return [];
        }

        const categories = jobRef.docs.map(doc => new Category(doc.id, doc.data()));
        return categories;
        } catch (error) {
            throw error;
        }
    }

    // Update category
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

    // delete category
    async deleteById(id) {
        try {
            await this.collection.doc(id).delete();
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = CategoryService;