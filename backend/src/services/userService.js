const { connectFirebase } = require('../config/firebase');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const {db} = connectFirebase();
const userCollection = db.collection('users');

const UserService = {
    /// Create a new user
    async create(userData) {
        try {
            // Validate userData
            if (!userData || !userData.email || !userData.password) {
                throw new Error('Email and password are required');
            }

            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);

            const userRef = await userCollection.add({...userData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            return new User(userRef.id, userData);
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    },

    // Compare password
    async comparePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    },

    // Get all users
    async findAll() {
        try {
            const usersRef = await userCollection.get();

            if (usersRef.empty) {
                return [];
            }

            return usersRef.docs.map(doc => new User(doc.id, doc.data()));
        } catch (error) {
            console.error('Error finding all users:', error);
            throw error;
        }
    },

    // Get a user by ID
    async findById(id) {
        try {
            const userDoc = await userCollection.doc(id).get();
            if (!userDoc.exists) {
                return null;
            }
        
            const userData = userDoc.data();
            return new User(userDoc.id, userData);
        } catch (error) {
            console.error('Error finding user for that ID:', error);
            throw error;
        }
    },

    // Search users by name (searches both username, firstName, and lastName)
    async searchUsers(searchTerm, limit = 10) {
        try {
            if (!searchTerm || searchTerm.trim().length === 0) {
                return [];
            }

            const searchTermLower = searchTerm.toLowerCase().trim();
            const users = [];

            // Search by username
            const usernameQuery = await userCollection
                .where('username', '>=', searchTermLower)
                .where('username', '<=', searchTermLower + '\uf8ff')
                .limit(limit)
                .get();

            usernameQuery.docs.forEach(doc => {
                users.push(new User(doc.id, doc.data()));
            });

            // Search by firstName
            const firstNameQuery = await userCollection
                .where('firstName', '>=', searchTermLower)
                .where('firstName', '<=', searchTermLower + '\uf8ff')
                .limit(limit)
                .get();

            firstNameQuery.docs.forEach(doc => {
                // Avoid duplicates
                if (!users.find(user => user.id === doc.id)) {
                    users.push(new User(doc.id, doc.data()));
                }
            });

            // Search by lastName
            const lastNameQuery = await userCollection
                .where('lastName', '>=', searchTermLower)
                .where('lastName', '<=', searchTermLower + '\uf8ff')
                .limit(limit)
                .get();

            lastNameQuery.docs.forEach(doc => {
                // Avoid duplicates
                if (!users.find(user => user.id === doc.id)) {
                    users.push(new User(doc.id, doc.data()));
                }
            });

            // Sort by relevance (exact matches first, then partial matches)
            users.sort((a, b) => {
                const aUsername = a.username.toLowerCase();
                const bUsername = b.username.toLowerCase();
                const aFirstName = a.firstName.toLowerCase();
                const bFirstName = b.firstName.toLowerCase();
                const aLastName = a.lastName.toLowerCase();
                const bLastName = b.lastName.toLowerCase();
                const aFullName = `${aFirstName} ${aLastName}`;
                const bFullName = `${bFirstName} ${bLastName}`;

                // Exact username match gets highest priority
                if (aUsername === searchTermLower) return -1;
                if (bUsername === searchTermLower) return 1;

                // Exact full name match
                if (aFullName === searchTermLower) return -1;
                if (bFullName === searchTermLower) return 1;

                // Username starts with search term
                if (aUsername.startsWith(searchTermLower) && !bUsername.startsWith(searchTermLower)) return -1;
                if (bUsername.startsWith(searchTermLower) && !aUsername.startsWith(searchTermLower)) return 1;

                // First name starts with search term
                if (aFirstName.startsWith(searchTermLower) && !bFirstName.startsWith(searchTermLower)) return -1;
                if (bFirstName.startsWith(searchTermLower) && !aFirstName.startsWith(searchTermLower)) return 1;

                // Alphabetical order
                return aUsername.localeCompare(bUsername);
            });

            return users.slice(0, limit);
        } catch (error) {
            console.error('Error searching users:', error);
            throw error;
        }
    },

    // Get a user by email
    async findByEmail(email) {
        try {
            const userRef = await userCollection.where('email', '==', email).get();
            
            if (userRef.empty){
                return null;
            }

            const userDoc = userRef.docs[0];
            return new User(userDoc.id, userDoc.data());
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    },

    // Get a user by phone
    async findByPhone(phone) {
        try {
            const userRef = await userCollection.where('phone', '==', phone).get();
            
            if (userRef.empty){
                return null;
            }

            const userDoc = userRef.docs[0];
            return new User(userDoc.id, userDoc.data());
        } catch (error) {
            console.error('Error finding user by phone:', error);
            throw error;
        }
    },

    // Update a user
    async updateById(id, updateData) {
        try {
            const userDoc = await userCollection.doc(id).get();

            if (!userDoc.exists) {
                return false;
            }

            if (updateData.username) {
                updateData.username = updateData.username.toLowerCase();
            }

            updateData.updatedAt = new Date().toISOString();
        
            await userCollection.doc(id).update(updateData);
        
            const updatedUser = await UserService.findById(id);
            return updatedUser;
        } catch (error) {
            throw error;
        }
    },

    // Delete a user
    async deleteById(id) {
        try {
            const userDoc = await userCollection.doc(id).get();

            if (!userDoc.exists) {
                return false;
            }

            await userCollection.doc(id).delete();
            return true;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },
};

module.exports = UserService;