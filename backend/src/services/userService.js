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

    // Get a user by username
    async findByUsername(username) {
        try {
        const snapshot = await userCollection.where('username', '==', username).get();
        
        if (snapshot.empty) {
            return null;
        }

        const userDoc = snapshot.docs[0];
        return new User(userDoc.id, userDoc.data());
        } catch (error) {
        console.error('Error finding user by username:', error);
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