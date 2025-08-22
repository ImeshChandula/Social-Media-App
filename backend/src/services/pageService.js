const { connectFirebase } = require('../config/firebase');
const Page = require('../models/Page');

const { db } = connectFirebase();

class PageService {
    constructor() {
        this.collection = db.collection('pages');
    }

    // Create a new page
    async createPage(pageData) {
        try {
            pageData.createdAt = new Date().toISOString();
            pageData.updatedAt = new Date().toISOString();
            
            const docRef = await this.collection.add(pageData);
            return new Page(docRef.id, pageData);
        } catch (error) {
            console.error('Error creating page:', error);
            throw error;
        }
    }

    // Find page by ID
    async findById(id) {
        try {
            const doc = await this.collection.doc(id).get();
            if (!doc.exists) {
                return null;
            }
            return new Page(doc.id, doc.data());
        } catch (error) {
            console.error('Error finding page by ID:', error);
            throw error;
        }
    }

    // Find pages by owner (Remove orderBy to avoid composite index)
    async findByOwner(ownerId) {
        try {
            const snapshot = await this.collection
                .where('owner', '==', ownerId)
                .get(); // Removed .orderBy('createdAt', 'desc')
            
            if (snapshot.empty) {
                return [];
            }

            const pages = snapshot.docs.map(doc => new Page(doc.id, doc.data()));
            
            // Sort in memory instead of in query
            pages.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA; // Descending order (newest first)
            });

            return pages;
        } catch (error) {
            console.error('Error finding pages by owner:', error);
            throw error;
        }
    }

    // Get all published pages(Remove orderBy to avoid composite index)
    async findAll(filters = {}) {
        try {
            let query = this.collection.where('isPublished', '==', true);

            if (filters.category) {
                query = query.where('category', '==', filters.category);
            }

            const snapshot = await query.get(); // Removed .orderBy('createdAt', 'desc')
            
            if (snapshot.empty) {
                return [];
            }

            const pages = snapshot.docs.map(doc => new Page(doc.id, doc.data()));
            
            // Sort in memory instead of in query
            pages.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA; // Descending order (newest first)
            });

            return pages;
        } catch (error) {
            console.error('Error finding all pages:', error);
            throw error;
        }
    }

    // Search pages by name(Simplified search without orderBy)
    async searchPages(searchTerm, limit = 10) {
        try {
            if (!searchTerm || searchTerm.trim().length === 0) {
                return [];
            }

            const searchTermLower = searchTerm.toLowerCase().trim();
            
            // Simple query without orderBy to avoid composite index
            const snapshot = await this.collection
                .where('isPublished', '==', true)
                .get();

            const pages = [];
            snapshot.docs.forEach(doc => {
                const pageData = doc.data();
                const pageName = (pageData.pageName || '').toLowerCase();
                
                // Filter by search term in memory
                if (pageName.includes(searchTermLower)) {
                    pages.push(new Page(doc.id, pageData));
                }
            });

            // Sort by relevance and creation date
            pages.sort((a, b) => {
                const aName = (a.pageName || '').toLowerCase();
                const bName = (b.pageName || '').toLowerCase();
                
                // Exact matches first
                if (aName === searchTermLower && bName !== searchTermLower) return -1;
                if (bName === searchTermLower && aName !== searchTermLower) return 1;
                
                // Starts with search term
                if (aName.startsWith(searchTermLower) && !bName.startsWith(searchTermLower)) return -1;
                if (bName.startsWith(searchTermLower) && !aName.startsWith(searchTermLower)) return 1;
                
                // Then by creation date (newest first)
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });

            return pages.slice(0, limit);
        } catch (error) {
            console.error('Error searching pages:', error);
            throw error;
        }
    }

    // Update page
    async updateById(id, updateData) {
        try {
            updateData.updatedAt = new Date().toISOString();
            
            await this.collection.doc(id).update(updateData);
            
            return await this.findById(id);
        } catch (error) {
            console.error('Error updating page:', error);
            throw error;
        }
    }

    // Delete page
    async deleteById(id) {
        try {
            await this.collection.doc(id).delete();
            return true;
        } catch (error) {
            console.error('Error deleting page:', error);
            throw error;
        }
    }

    // Add follower to page
    async addFollower(pageId, userId) {
        try {
            const page = await this.findById(pageId);
            if (!page) {
                throw new Error('Page not found');
            }

            const followers = page.followers || [];
            if (!followers.includes(userId)) {
                followers.push(userId);
                await this.updateById(pageId, { followers });
            }

            return await this.findById(pageId);
        } catch (error) {
            console.error('Error adding follower:', error);
            throw error;
        }
    }

    // Remove follower from page
    async removeFollower(pageId, userId) {
        try {
            const page = await this.findById(pageId);
            if (!page) {
                throw new Error('Page not found');
            }

            const followers = page.followers || [];
            const updatedFollowers = followers.filter(id => id !== userId);
            
            await this.updateById(pageId, { followers: updatedFollowers });
            return await this.findById(pageId);
        } catch (error) {
            console.error('Error removing follower:', error);
            throw error;
        }
    }

    // Get pages pending approval 
    async getPendingApproval() {
        try {
            const snapshot = await this.collection
                .where('approvalStatus', '==', 'pending')
                .get(); // Removed .orderBy('createdAt', 'desc')
            
            if (snapshot.empty) {
                return [];
            }

            const pages = snapshot.docs.map(doc => new Page(doc.id, doc.data()));
            
            // Sort in memory instead of in query
            pages.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA; // Descending order (newest first)
            });

            return pages;
        } catch (error) {
            console.error('Error finding pending pages:', error);
            throw error;
        }
    }

    // Check if username is available
    async isUsernameAvailable(username, excludePageId = null) {
        try {
            if (!username) {
                return true; // Username is optional
            }

            let query = this.collection.where('username', '==', username.toLowerCase());
            
            const snapshot = await query.get();
            
            if (snapshot.empty) {
                return true;
            }

            // If excluding a specific page (for updates), check if it's the only match
            if (excludePageId) {
                return snapshot.docs.length === 1 && snapshot.docs[0].id === excludePageId;
            }

            return false;
        } catch (error) {
            console.error('Error checking username availability:', error);
            throw error;
        }
    }

    // Get all pages without any filtering (for admin dashboard)
    async findAllPages() {
        try {
            const snapshot = await this.collection.get();
            
            if (snapshot.empty) {
                return [];
            }

            const pages = snapshot.docs.map(doc => new Page(doc.id, doc.data()));
            
            // Sort in memory
            pages.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });

            return pages;
        } catch (error) {
            console.error('Error finding all pages:', error);
            throw error;
        }
    }
}

module.exports = new PageService();