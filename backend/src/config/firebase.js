const admin = require('firebase-admin');
require('dotenv').config();

// Validate required environment variables
const validateEnvVars = () => {
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL', 
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_STORAGE_BUCKET'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  }
};

// Initialize Firebase with service account credentials
const connectFirebase = () => {
  try {
    // Validate environment variables
    validateEnvVars();

    if (admin.apps.length === 0) {

      // Use environment variables (.env)
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        }),
        // Add database URL for full Realtime Database access (optional)
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      });
      
      console.log('✅ Firebase Connected!');
    }
    return {
      db: admin.firestore(),
      auth: admin.auth(),
      storage: admin.storage(),
      messaging: admin.messaging(),
      admin
    };
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectFirebase, admin };