
class Report {
    constructor(id, reportData) {
        // Add safety check for reportData
        if (!reportData || typeof reportData !== 'object') {
            console.warn(`Report constructor called with invalid data for ID ${id}:`, reportData);
            reportData = {}; // Fallback to empty object
        }

        this.id = id;
        this.postId = reportData.postId;
        this.reportedBy = reportData.reportedBy; // User ID who reported
        this.postAuthor = reportData.postAuthor; // Original post author ID
        this.reason = reportData.reason || '';
        this.status = reportData.status || 'pending'; // 'pending', 'accepted', 'declined'
        this.reviewedBy = reportData.reviewedBy || null; // Admin who reviewed
        this.reviewNote = reportData.reviewNote || null; // Admin's review note
        this.createdAt = reportData.createdAt || new Date().toISOString();
        this.reviewedAt = reportData.reviewedAt || null;
    }
}

module.exports = Report;