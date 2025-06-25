const { connectFirebase } = require('../config/firebase');
const { db } = connectFirebase();

class MarketPlaceScheduler {
    constructor() {
        this.collection = db.collection('marketplace');
        this.intervalId = null;
        this.isRunning = false;
    }

    /**
     * Updates all expired items to set isAvailable = false
     * @returns {Promise<number>} Number of items updated
     */
    async updateExpiredItems() {
        try {
            const currentDate = new Date().toISOString();
            
            // Find all items where expiresAt is less than current date and isAvailable is still true
            const expiredItemsRef = await this.collection
                .where('expiresAt', '<', currentDate)
                .where('isAvailable', '==', true)
                .get();

            if (expiredItemsRef.empty) {
                console.log('No expired items found to update');
                return 0;
            }

            // Batch update for better performance
            const batch = db.batch();
            let updateCount = 0;

            expiredItemsRef.docs.forEach(doc => {
                batch.update(doc.ref, {
                    isAvailable: false,
                    updatedAt: new Date().toISOString(),
                    status: 'expired'
                });
                updateCount++;
            });

            await batch.commit();
            console.log(`✅ Updated ${updateCount} expired items at ${new Date().toLocaleString()}`);
            return updateCount;

        } catch (error) {
            console.error('❌ Error updating expired items:', error);
            throw error;
        }
    }

    /**
     * Start the scheduled expiration checker
     * @param {number} intervalMinutes - How often to check (in minutes)
     */
    startExpirationChecker(intervalMinutes = 60) {
        if (this.isRunning) {
            console.log('⚠️  Expiration checker is already running');
            return;
        }

        console.log(`🚀 Starting expiration checker - will run every ${intervalMinutes} minutes`);
        this.isRunning = true;
        
        // Run immediately on start
        this.runExpirationCheck();

        // Then run at intervals
        this.intervalId = setInterval(async () => {
            await this.runExpirationCheck();
        }, intervalMinutes * 60 * 1000);
    }

    /**
     * Stop the scheduled expiration checker
     */
    stopExpirationChecker() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.isRunning = false;
            console.log('🛑 Expiration checker stopped');
        }
    }

    /**
     * Run a single expiration check
     */
    async runExpirationCheck() {
        try {
            console.log(`🔍 Running expiration check at ${new Date().toLocaleString()}`);
            const updatedCount = await this.updateExpiredItems();
            
            if (updatedCount > 0) {
                console.log(`✅ Expiration check completed: ${updatedCount} items updated`);
            } else {
                console.log('ℹ️  No expired items found');
            }
        } catch (error) {
            console.error('❌ Error in scheduled expiration check:', error);
        }
    }

    /**
     * Check if the scheduler is currently running
     */
    isSchedulerRunning() {
        return this.isRunning;
    }

    /**
     * Get scheduler status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            intervalId: this.intervalId !== null,
            lastCheck: new Date().toISOString()
        };
    }

    /**
     * Run manual expiration check (one-time)
     */
    async runManualCheck() {
        console.log('🔧 Running manual expiration check...');
        return await this.runExpirationCheck();
    }
}

module.exports = MarketPlaceScheduler;