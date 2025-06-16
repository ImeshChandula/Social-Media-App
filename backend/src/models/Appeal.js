const { APPEAL_STATUS, APPEAL_PRIORITY} = require('../enums/appeal');

// Appeal class
class Appeal {
    constructor (id, appealData) {
        this.id = id;

        // User Information
        this.username = appealData.username;
        this.email = appealData.email;
        
        // Appeal Details
        this.appealReason = appealData.appealReason;
        this.additionalInfo = appealData.additionalInfo || null;
        this.incidentDate = appealData.incidentDate || null;
        this.contactMethod = appealData.contactMethod || 'email';
        
        // System Fields
        this.status = appealData.status || APPEAL_STATUS.PENDING;
        this.priority = appealData.priority || APPEAL_PRIORITY.MEDIUM;
        this.createdAt = appealData.createdAt || new Date().toISOString();
        this.updatedAt = new Date().toISOString();
        
        // Admin Fields
        this.assignedAdmin = appealData.assignedAdmin || null;
        this.adminNotes = appealData.adminNotes || '';
        this.reviewedAt = appealData.reviewedAt || null;
        this.responseMessage = appealData.responseMessage || '';
        
        // Tracking
        this.ipAddress = appealData.ipAddress || null;
        this.userAgent = appealData.userAgent || null;
        
        // Metadata
        this.attachments = appealData.attachments || [];
        this.tags = appealData.tags || [];
        this.appealNumber = appealData.appealNumber || '';
        
        // Communication History
        this.communications= appealData.communications || [];
    }
}

module.exports = Appeal;