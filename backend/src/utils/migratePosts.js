// utils/migratePosts.js - Script to add category field to existing video posts

const { connectFirebase } = require('../config/firebase');
const { db } = connectFirebase();

const VALID_VIDEO_CATEGORIES = ['Music', 'Sports', 'Education', 'Entertainment', 'News'];

const migratePosts = async () => {
    try {
        console.log('Starting post migration to add category field...');
        
        const postsCollection = db.collection('posts');
        
        // Get all video posts without category
        const videoPosts = await postsCollection
            .where('mediaType', '==', 'video')
            .get();
        
        console.log(`Found ${videoPosts.size} video posts to migrate`);
        
        const batch = db.batch();
        let updateCount = 0;
        
        videoPosts.docs.forEach((doc) => {
            const postData = doc.data();
            
            // Only update if category field doesn't exist or is empty
            if (!postData.category) {
                // Assign a default category (you might want to make this smarter based on content)
                const defaultCategory = 'Entertainment'; // or analyze content to determine category
                
                batch.update(doc.ref, { 
                    category: defaultCategory,
                    updatedAt: new Date().toISOString()
                });
                
                updateCount++;
                console.log(`Migrating post ${doc.id} - adding category: ${defaultCategory}`);
            }
        });
        
        if (updateCount > 0) {
            await batch.commit();
            console.log(`Successfully migrated ${updateCount} video posts with category field`);
        } else {
            console.log('No posts needed migration');
        }
        
        // Get all non-video posts and ensure they don't have category field
        const nonVideoPosts = await postsCollection
            .where('mediaType', '!=', 'video')
            .get();
        
        console.log(`Checking ${nonVideoPosts.size} non-video posts...`);
        
        const cleanupBatch = db.batch();
        let cleanupCount = 0;
        
        nonVideoPosts.docs.forEach((doc) => {
            const postData = doc.data();
            
            // Remove category field from non-video posts if it exists
            if (postData.category) {
                cleanupBatch.update(doc.ref, { 
                    category: admin.firestore.FieldValue.delete(),
                    updatedAt: new Date().toISOString()
                });
                
                cleanupCount++;
                console.log(`Removing category from non-video post ${doc.id}`);
            }
        });
        
        if (cleanupCount > 0) {
            await cleanupBatch.commit();
            console.log(`Cleaned up ${cleanupCount} non-video posts`);
        }
        
        console.log('Migration completed successfully!');
        
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
};

// Function to run the migration
const runMigration = async () => {
    try {
        await migratePosts();
        console.log('✅ Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
};

// Run migration if this file is executed directly
if (require.main === module) {
    runMigration();
}

module.exports = { migratePosts };