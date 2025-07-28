// const { admin, getFirestore } = require('../config/firebase');
// const UserActivity = require('../models/UserActivity');

// class ActivityService {
//   static collectionName = 'userActivities';


//     // updating 25/07
//     // Improved helper method to get database instance
//   static getDB() {
//     try {
//       // Method 1: Try using the getFirestore function
//       if (typeof getFirestore === 'function') {
//         const db = getFirestore();
//         if (db) {
//           console.log('✅ Database instance obtained via getFirestore');
//           return db;
//         }
//       }

//       // Method 2: Try getting firestore directly from admin
//       if (admin && admin.firestore) {
//         const db = admin.firestore();
//         if (db) {
//           console.log('✅ Database instance obtained via admin.firestore');
//           return db;
//         }
//       }

//       // Method 3: Check if admin is initialized
//       if (admin.apps && admin.apps.length > 0) {
//         const db = admin.firestore();
//         console.log('✅ Database instance obtained from initialized admin');
//         return db;
//       }

//       throw new Error('Firebase admin not properly initialized');
//     } catch (error) {
//       console.error('❌ Error getting database instance:', error);
//       console.error('❌ Admin object:', admin);
//       console.error('❌ Admin apps length:', admin.apps ? admin.apps.length : 'undefined');
//       throw new Error(`Database connection failed: ${error.message}`);
//     }
//   } //ends 25/07


//   /**
//    * Log user activity
//    * @param {string} userId - User ID
//    * @param {string} activityType - Type of activity
//    * @param {Object} options - Additional options
//    * @returns {Promise<string>} Activity ID
//    */
//   static async logActivity(userId, activityType, options = {}) {
//     try {
//       const {
//         metadata = {},
//         ipAddress = '',
//         userAgent = '',
//         location = '',
//         deviceType = 'unknown',
//         browserInfo = ''
//       } = options;

//       // Generate description
//       const description = UserActivity.generateDescription(activityType, metadata);

//       // Create activity object
//       const activityData = {
//         userId,
//         activityType,
//         description,
//         metadata,
//         ipAddress,
//         userAgent,
//         location,
//         deviceType,
//         browserInfo,
//         createdAt: new Date().toISOString(),
//         updatedAt: new Date().toISOString()
//       };

//       // Save to Firebase
//       const docRef = await db.collection(this.collectionName).add(activityData);
      
//       console.log(`Activity logged for user ${userId}: ${activityType}`);
//       return docRef.id;
//     } catch (error) {
//       console.error('Error logging activity:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get user activities with pagination and filtering
//    * @param {string} userId - User ID
//    * @param {Object} options - Query options
//    * @returns {Promise<Object>} Activities with pagination info
//    */
//   static async getUserActivities(userId, options = {}) {
//     try {

//         // updates 25/07

//       console.log(`🔍 Getting activities for user: ${userId}`);
//       console.log(`🔍 Options:`, options);
      
//       // Get database instance with detailed logging
//       console.log('🔍 Getting database instance...');
//       const db = this.getDB();
//       console.log('🔍 Database instance type:', typeof db);
//       console.log('🔍 Database instance:', !!db);
      
//       if (!db) {
//         throw new Error('Database instance is null or undefined');
//       }

//       if (typeof db.collection !== 'function') {
//         throw new Error('Database instance does not have collection method');
//       } // end updates 25/07

//       const {
//         page = 1,
//         limit = 20,
//         category = null,
//         activityType = null,
//         startDate = null,
//         endDate = null,
//         sortOrder = 'desc'
//       } = options;

//       console.log('🔍 Creating base query...');//25/07
//       let query = db.collection(this.collectionName)
//         .where('userId', '==', userId);

//       // Apply filters
//       if (activityType) {
//         console.log('🔍 Adding activityType filter:', activityType);//25/07
//         query = query.where('activityType', '==', activityType);
//       }

//       if (startDate) {
//         console.log('🔍 Adding startDate filter:', startDate); // 25/07
//         query = query.where('createdAt', '>=', startDate);
//       }

//       if (endDate) {
//         console.log('🔍 Adding endDate filter:', endDate); //25/07
//         query = query.where('createdAt', '<=', endDate);
//       }

//       // Apply sorting
//       console.log('🔍 Adding sort order:', sortOrder); //25/07
//       query = query.orderBy('createdAt', sortOrder);

//       // Apply pagination
//       const offset = (page - 1) * limit;
//       if (offset > 0) {
//         console.log('🔍 Applying pagination offset:', offset); //25/07
//         const offsetSnapshot = await query.limit(offset).get();
//         if (!offsetSnapshot.empty) {
//           const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
//           query = query.startAfter(lastDoc);
//         }
//       }

//       console.log('🔍 Executing query...'); //25/07
//       const snapshot = await query.limit(limit).get();
//       console.log('🔍 Query executed, documents found:', snapshot.size); //25/07
      
//       // Convert to UserActivity objects
//       let activities = snapshot.docs.map(doc => {
//         const data = doc.data();
//         return new UserActivity(doc.id, data);
//       });

//       // Apply category filter (client-side since Firebase doesn't support computed fields)
//       if (category) {
//         console.log('🔍 Applying category filter:', category); //25/07
//         activities = activities.filter(activity => activity.getCategory() === category);
//       }

//       // Get total count for pagination (approximate)
//       console.log('🔍 Getting total count...'); //25/07
//       const totalSnapshot = await db.collection(this.collectionName)
//         .where('userId', '==', userId)
//         .get();
      
//       const total = totalSnapshot.size;
//       const totalPages = Math.ceil(total / limit);

//       e.log(`✅ Found ${activities.length} activities for user ${userId}`); //25/07

//       return {
//         activities,
//         pagination: {
//           currentPage: page,
//           totalPages,
//           totalItems: total,
//           itemsPerPage: limit,
//           hasNext: page < totalPages,
//           hasPrev: page > 1
//         }
//       };
//     } catch (error) {
//       console.error('Error fetching user activities:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get all users' activities (for super admin)
//    * @param {Object} options - Query options
//    * @returns {Promise<Object>} Activities with pagination info
//    */
//   static async getAllActivities(options = {}) {
//     try {
//       const {
//         page = 1,
//         limit = 50,
//         userId = null,
//         category = null,
//         activityType = null,
//         startDate = null,
//         endDate = null,
//         sortOrder = 'desc'
//       } = options;

//       let query = db.collection(this.collectionName);

//       // Apply filters
//       if (userId) {
//         query = query.where('userId', '==', userId);
//       }

//       if (activityType) {
//         query = query.where('activityType', '==', activityType);
//       }

//       if (startDate) {
//         query = query.where('createdAt', '>=', startDate);
//       }

//       if (endDate) {
//         query = query.where('createdAt', '<=', endDate);
//       }

//       // Apply sorting
//       query = query.orderBy('createdAt', sortOrder);

//       // Apply pagination
//       const offset = (page - 1) * limit;
//       if (offset > 0) {
//         const offsetSnapshot = await query.limit(offset).get();
//         if (!offsetSnapshot.empty) {
//           const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
//           query = query.startAfter(lastDoc);
//         }
//       }

//       const snapshot = await query.limit(limit).get();
      
//       // Convert to UserActivity objects
//       let activities = snapshot.docs.map(doc => {
//         const data = doc.data();
//         return new UserActivity(doc.id, data);
//       });

//       // Apply category filter
//       if (category) {
//         activities = activities.filter(activity => activity.getCategory() === category);
//       }

//       // Get total count
//       const totalSnapshot = await db.collection(this.collectionName).get();
//       const total = totalSnapshot.size;
//       const totalPages = Math.ceil(total / limit);

//       return {
//         activities,
//         pagination: {
//           currentPage: page,
//           totalPages,
//           totalItems: total,
//           itemsPerPage: limit,
//           hasNext: page < totalPages,
//           hasPrev: page > 1
//         }
//       };
//     } catch (error) {
//       console.error('Error fetching all activities:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get activity statistics for a user
//    * @param {string} userId - User ID
//    * @param {string} period - Time period ('today', 'week', 'month', 'year')
//    * @returns {Promise<Object>} Activity statistics
//    */
//   static async getActivityStats(userId, period = 'month') {
//     try {
//       const now = new Date();
//       let startDate;

//       switch (period) {
//         case 'today':
//           startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//           break;
//         case 'week':
//           startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
//           break;
//         case 'month':
//           startDate = new Date(now.getFullYear(), now.getMonth(), 1);
//           break;
//         case 'year':
//           startDate = new Date(now.getFullYear(), 0, 1);
//           break;
//         default:
//           startDate = new Date(now.getFullYear(), now.getMonth(), 1);
//       }

//       const snapshot = await db.collection(this.collectionName)
//         .where('userId', '==', userId)
//         .where('createdAt', '>=', startDate.toISOString())
//         .get();

//       const activities = snapshot.docs.map(doc => doc.data());
      
//       // Calculate statistics
//       const stats = {
//         totalActivities: activities.length,
//         categories: {},
//         activityTypes: {},
//         dailyActivity: {}
//       };

//       activities.forEach(activity => {
//         const activityObj = new UserActivity('temp', activity);
//         const category = activityObj.getCategory();
//         const type = activity.activityType;
//         const date = new Date(activity.createdAt).toDateString();

//         // Count by category
//         stats.categories[category] = (stats.categories[category] || 0) + 1;
        
//         // Count by activity type
//         stats.activityTypes[type] = (stats.activityTypes[type] || 0) + 1;
        
//         // Count by date
//         stats.dailyActivity[date] = (stats.dailyActivity[date] || 0) + 1;
//       });

//       return stats;
//     } catch (error) {
//       console.error('Error getting activity stats:', error);
//       throw error;
//     }
//   }

//   /**
//    * Delete old activities (for cleanup)
//    * @param {number} daysOld - Delete activities older than this many days
//    * @returns {Promise<number>} Number of deleted activities
//    */
//   static async deleteOldActivities(daysOld = 365) {
//     try {
//       const cutoffDate = new Date();
//       cutoffDate.setDate(cutoffDate.getDate() - daysOld);
      
//       const snapshot = await db.collection(this.collectionName)
//         .where('createdAt', '<', cutoffDate.toISOString())
//         .get();

//       if (snapshot.empty) {
//         return 0;
//       }

//       // Delete in batches
//       const batch = db.batch();
//       let deleteCount = 0;

//       snapshot.docs.forEach(doc => {
//         batch.delete(doc.ref);
//         deleteCount++;
//       });

//       await batch.commit();
      
//       console.log(`Deleted ${deleteCount} old activities`);
//       return deleteCount;
//     } catch (error) {
//       console.error('Error deleting old activities:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get activity by ID
//    * @param {string} activityId - Activity ID
//    * @returns {Promise<UserActivity|null>} Activity object
//    */
//   static async getActivityById(activityId) {
//     try {
//       const doc = await db.collection(this.collectionName).doc(activityId).get();
      
//       if (!doc.exists) {
//         return null;
//       }

//       return new UserActivity(doc.id, doc.data());
//     } catch (error) {
//       console.error('Error getting activity by ID:', error);
//       throw error;
//     }
//   }

//   /**
//    * Update activity metadata (if needed)
//    * @param {string} activityId - Activity ID
//    * @param {Object} updates - Updates to apply
//    * @returns {Promise<boolean>} Success status
//    */
//   static async updateActivity(activityId, updates) {
//     try {
//       await db.collection(this.collectionName)
//         .doc(activityId)
//         .update({
//           ...updates,
//           updatedAt: new Date().toISOString()
//         });
      
//       return true;
//     } catch (error) {
//       console.error('Error updating activity:', error);
//       throw error;
//     }
//   }
// }

// module.exports = ActivityService;


// src/services/activityService.js - NO INDEXES REQUIRED VERSION-----------------------------------------

const { admin } = require('../config/firebase');
const UserActivity = require('../models/UserActivity');

class ActivityService {
  static collectionName = 'userActivities';

  // Helper method to get database instance
  static getDB() {
    try {
      const db = admin.firestore();
      if (!db) {
        throw new Error('Firebase database not initialized');
      }
      return db;
    } catch (error) {
      console.error('Error getting database instance:', error);
      throw new Error('Database connection failed');
    }
  }

  /**
   * Log user activity
   */
  static async logActivity(userId, activityType, options = {}) {
    try {
      console.log(`🔍 Logging activity: ${activityType} for user: ${userId}`);
      
      const db = this.getDB();
      
      const {
        metadata = {},
        ipAddress = '',
        userAgent = '',
        location = '',
        deviceType = 'unknown',
        browserInfo = ''
      } = options;


      // CLEAN UNDEFINED VALUES - This fixes the error!
      const cleanMetadata = this.cleanUndefinedValues(metadata);

      const description = UserActivity.generateDescription(activityType, metadata);

      const activityData = {
        userId,
        activityType,
        description,
        metadata: cleanMetadata, // Ensure metadata is cleaned
        ipAddress,
        userAgent,
        location,
        deviceType,
        browserInfo,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Double-check: Clean the entire activity data
      const cleanActivityData = this.cleanUndefinedValues(activityData);
      

      const docRef = await db.collection(this.collectionName).add(activityData);
      
      console.log(`✅ Activity logged successfully: ${activityType} (ID: ${docRef.id})`);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error logging activity:', error);
      return null;
    }
  }

 // 🔥 ADD THIS HELPER METHOD to ActivityService class
static cleanUndefinedValues(obj) {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => this.cleanUndefinedValues(item));
  }
  
  if (typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = this.cleanUndefinedValues(value);
      }
    }
    return cleaned;
  }
  
  return obj;
}

  /**
   * Get user activities with NO INDEXES REQUIRED
   * Uses simple queries and processes data client-side
   */
  static async getUserActivities(userId, options = {}) {
    try {
      console.log(`🔍 Getting activities for user: ${userId}`);
      
      const db = this.getDB();
      
      const {
        page = 1,
        limit = 20,
        category = null,
        activityType = null,
        startDate = null,
        endDate = null,
        sortOrder = 'desc'
      } = options;

      // SIMPLE QUERY - Only filter by userId (NO INDEXES NEEDED)
      console.log('🔍 Executing simple query (no indexes required)...');
      const snapshot = await db.collection(this.collectionName)
        .where('userId', '==', userId)
        .get(); // No .orderBy() = No index required!

      console.log(`🔍 Found ${snapshot.size} total activities for user`);

      if (snapshot.empty) {
        return {
          activities: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: limit,
            hasNext: false,
            hasPrev: false
          }
        };
      }

      // Convert to UserActivity objects
      let activities = snapshot.docs.map(doc => {
        const data = doc.data();
        return new UserActivity(doc.id, data);
      });

      console.log(`🔍 Processing ${activities.length} activities client-side...`);

      // Apply ALL filters CLIENT-SIDE (no indexes needed)
      if (activityType) {
        console.log(`🔍 Filtering by activityType: ${activityType}`);
        activities = activities.filter(activity => activity.activityType === activityType);
      }

      if (startDate) {
        console.log(`🔍 Filtering by startDate: ${startDate}`);
        activities = activities.filter(activity => activity.createdAt >= startDate);
      }

      if (endDate) {
        console.log(`🔍 Filtering by endDate: ${endDate}`);
        activities = activities.filter(activity => activity.createdAt <= endDate);
      }

      if (category) {
        console.log(`🔍 Filtering by category: ${category}`);
        activities = activities.filter(activity => activity.getCategory() === category);
      }

      // Sort CLIENT-SIDE (no indexes needed)
      console.log(`🔍 Sorting by createdAt (${sortOrder})...`);
      activities.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });

      // Apply pagination CLIENT-SIDE
      console.log(`🔍 Applying pagination: page ${page}, limit ${limit}...`);
      const total = activities.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedActivities = activities.slice(startIndex, endIndex);

      console.log(`✅ Returning ${paginatedActivities.length} activities (${total} total)`);

      return {
        activities: paginatedActivities,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('❌ Error fetching user activities:', error);
      throw error;
    }
  }

  /**
   * Get all activities (for super admin) - NO INDEXES REQUIRED
   */
  static async getAllActivities(options = {}) {
    try {
      console.log(`🔍 Getting all activities (admin)`);
      
      const db = this.getDB();
      
      const {
        page = 1,
        limit = 50,
        userId = null,
        category = null,
        activityType = null,
        startDate = null,
        endDate = null,
        sortOrder = 'desc'
      } = options;

      // SIMPLE QUERY - Get all activities (NO INDEXES NEEDED)
      console.log('🔍 Executing simple query for all activities...');
      const snapshot = await db.collection(this.collectionName).get();

      console.log(`🔍 Found ${snapshot.size} total activities`);

      if (snapshot.empty) {
        return {
          activities: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalItems: 0,
            itemsPerPage: limit,
            hasNext: false,
            hasPrev: false
          }
        };
      }

      // Convert to UserActivity objects
      let activities = snapshot.docs.map(doc => {
        const data = doc.data();
        return new UserActivity(doc.id, data);
      });

      // Apply ALL filters CLIENT-SIDE
      if (userId) {
        console.log(`🔍 Filtering by userId: ${userId}`);
        activities = activities.filter(activity => activity.userId === userId);
      }

      if (activityType) {
        console.log(`🔍 Filtering by activityType: ${activityType}`);
        activities = activities.filter(activity => activity.activityType === activityType);
      }

      if (startDate) {
        console.log(`🔍 Filtering by startDate: ${startDate}`);
        activities = activities.filter(activity => activity.createdAt >= startDate);
      }

      if (endDate) {
        console.log(`🔍 Filtering by endDate: ${endDate}`);
        activities = activities.filter(activity => activity.createdAt <= endDate);
      }

      if (category) {
        console.log(`🔍 Filtering by category: ${category}`);
        activities = activities.filter(activity => activity.getCategory() === category);
      }

      // Sort CLIENT-SIDE
      console.log(`🔍 Sorting by createdAt (${sortOrder})...`);
      activities.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      });

      // Apply pagination CLIENT-SIDE
      const total = activities.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedActivities = activities.slice(startIndex, endIndex);

      console.log(`✅ Returning ${paginatedActivities.length} activities (${total} total)`);

      return {
        activities: paginatedActivities,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('❌ Error fetching all activities:', error);
      throw error;
    }
  }

  /**
   * Get activity statistics - NO INDEXES REQUIRED
   */
  static async getActivityStats(userId, period = 'month') {
    try {
      console.log(`🔍 Getting activity stats for user: ${userId}, period: ${period}`);
      
      const db = this.getDB();
      
      // SIMPLE QUERY - Only filter by userId
      const snapshot = await db.collection(this.collectionName)
        .where('userId', '==', userId)
        .get();

      const activities = snapshot.docs.map(doc => doc.data());
      
      // Filter by period CLIENT-SIDE
      const now = new Date();
      let startDate;

      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const filteredActivities = activities.filter(activity => 
        new Date(activity.createdAt) >= startDate
      );

      // Calculate statistics CLIENT-SIDE
      const stats = {
        totalActivities: filteredActivities.length,
        categories: {},
        activityTypes: {},
        dailyActivity: {}
      };

      filteredActivities.forEach(activity => {
        const activityObj = new UserActivity('temp', activity);
        const category = activityObj.getCategory();
        const type = activity.activityType;
        const date = new Date(activity.createdAt).toDateString();

        stats.categories[category] = (stats.categories[category] || 0) + 1;
        stats.activityTypes[type] = (stats.activityTypes[type] || 0) + 1;
        stats.dailyActivity[date] = (stats.dailyActivity[date] || 0) + 1;
      });

      console.log(`✅ Generated stats for user ${userId}: ${stats.totalActivities} activities`);
      
      return stats;
    } catch (error) {
      console.error('❌ Error getting activity stats:', error);
      throw error;
    }
  }

  /**
   * Get activity by ID - NO INDEXES REQUIRED
   */
  static async getActivityById(activityId) {
    try {
      console.log(`🔍 Getting activity by ID: ${activityId}`);
      
      const db = this.getDB();
      
      const doc = await db.collection(this.collectionName).doc(activityId).get();
      
      if (!doc.exists) {
        console.log(`❌ Activity not found: ${activityId}`);
        return null;
      }

      const activity = new UserActivity(doc.id, doc.data());
      console.log(`✅ Found activity: ${activityId}`);
      
      return activity;
    } catch (error) {
      console.error('❌ Error getting activity by ID:', error);
      throw error;
    }
  }

  /**
   * Delete old activities - NO INDEXES REQUIRED
   */
  static async deleteOldActivities(daysOld = 365) {
    try {
      console.log(`🔍 Deleting activities older than ${daysOld} days`);
      
      const db = this.getDB();
      
      // Get all activities and filter client-side
      const snapshot = await db.collection(this.collectionName).get();
      
      if (snapshot.empty) {
        console.log('✅ No activities to delete');
        return 0;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      // Filter old activities CLIENT-SIDE
      const oldDocs = snapshot.docs.filter(doc => {
        const data = doc.data();
        return new Date(data.createdAt) < cutoffDate;
      });

      if (oldDocs.length === 0) {
        console.log('✅ No old activities found');
        return 0;
      }

      // Delete in batches
      const batch = db.batch();
      oldDocs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      
      console.log(`✅ Deleted ${oldDocs.length} old activities`);
      return oldDocs.length;
    } catch (error) {
      console.error('❌ Error deleting old activities:', error);
      throw error;
    }
  }

  /**
   * Update activity - NO INDEXES REQUIRED
   */
  static async updateActivity(activityId, updates) {
    try {
      console.log(`🔍 Updating activity: ${activityId}`);
      
      const db = this.getDB();
      
      await db.collection(this.collectionName)
        .doc(activityId)
        .update({
          ...updates,
          updatedAt: new Date().toISOString()
        });
      
      console.log(`✅ Updated activity: ${activityId}`);
      return true;
    } catch (error) {
      console.error('❌ Error updating activity:', error);
      throw error;
    }
  }
}

module.exports = ActivityService;