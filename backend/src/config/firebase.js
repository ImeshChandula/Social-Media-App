const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase with service account credentials
const connectFirebase = () => {
  try {
    if (admin.apps.length === 0) {
      // Use environment variables (.env)
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        // Add database URL for full Realtime Database access (optional)
        databaseURL: process.env.FIREBASE_DATABASE_URL
      });
      
      console.log('Firebase Connected!');
    }
    return {
      db: admin.firestore(),
      messaging: admin.messaging()
    };
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectFirebase, admin };