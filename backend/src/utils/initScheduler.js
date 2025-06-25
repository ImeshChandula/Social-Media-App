const MarketPlaceScheduler = require('../services/marketPlaceSchedulerService');

let scheduler = null;

// Initialize and start the MarketPlace expiration scheduler
function initializeScheduler(intervalMinutes = 60) {
    if (scheduler && scheduler.isSchedulerRunning()) {
        console.log('⚠️  Scheduler is already running');
        return scheduler;
    }

    scheduler = new MarketPlaceScheduler();
    scheduler.startExpirationChecker(intervalMinutes);
    
    console.log('🚀 MarketPlace expiration scheduler initialized');
    return scheduler;
}

// Stop the scheduler
function stopScheduler() {
    if (scheduler) {
        scheduler.stopExpirationChecker();
        scheduler = null;
    }
}

// Get the current scheduler instance
function getScheduler() {
    return scheduler;
}

// Setup graceful shutdown handlers
function setupGracefulShutdown() {
    process.on('SIGINT', () => {
        console.log('\n🛑 Shutting down gracefully...');
        stopScheduler();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        console.log('\n🛑 Shutting down gracefully...');
        stopScheduler();
        process.exit(0);
    });
}

// Auto-initialize with default settings when imported
function autoInit(intervalMinutes = 60) {
    initializeScheduler(intervalMinutes);
    setupGracefulShutdown();
}

module.exports = {
    initializeScheduler,
    stopScheduler,
    getScheduler,
    setupGracefulShutdown,
    autoInit
};