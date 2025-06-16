const { connectFirebase } = require('../config/firebase');
const { db } = connectFirebase();

async function backfillCreatedAt() {
  try {
    const commentsCollection = db.collection('comments');
    const snapshot = await commentsCollection.get();
    const batch = db.batch();

    snapshot.forEach(doc => {
      const data = doc.data();
      if (!data.createdAt) {
        const updatedAt = data.updatedAt || new Date().toISOString();
        batch.update(doc.ref, { createdAt: updatedAt });
      }
    });

    await batch.commit();
    console.log("✅ Backfill complete: createdAt timestamps added.");
  } catch (error) {
    console.error("❌ Error during backfill:", error);
  }
}

// Run it
backfillCreatedAt();
