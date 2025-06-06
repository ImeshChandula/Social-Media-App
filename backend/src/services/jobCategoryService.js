const { connectFirebase } = require('../config/firebase');
const JobCategory = require('../models/JobCategory');

const { db } = connectFirebase();

class JobCategoryService {
    constructor () {
        this.collection = db.collection('jobCategories');
    }

    // find by id
    async findById(id) {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists) {
                return null;
            }

            return new JobCategory(doc.id, doc.data());
        } catch (error) {
            throw error;
        }
    }

    // find by job name
    async findByJobName(name) {
        try {
            const jobRef = await this.collection.where('name', '==', name).get();
            
            if (jobRef.empty) {
                return null;
            }

            const jobCategory = jobRef.docs.map(doc => new JobCategory(doc.id, doc.data()));
            return jobCategory
        } catch (error) {
            throw error;
        }
    }

    // Create new job category
    async create(categoryData) {
        try {
            categoryData.createdAt = new Date().toISOString();

            const docRef = await this.collection.add(categoryData);
            return new JobCategory(docRef.id, categoryData);
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
            const jobCategories = jobRef.docs.map(doc => new JobCategory(doc.id, doc.data()));
            return jobCategories;
        } catch (error) {
            throw error;
        }
    }

    // get all active
    async findAllActive() {
        try {
            const jobRef = await this.collection.where('isActive', '==', true).orderBy('name').get();
            
            if (jobRef.empty) {
                return [];
            }

            const jobCategory = jobRef.docs.map(doc => new JobCategory(doc.id, doc.data()));
            return jobCategory
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

module.exports = JobCategoryService;