const { APPEAL_STATUS, APPEAL_PRIORITY} = require('../enums/appeal');

// Appeal class
class Appeal {
    constructor (id, appealData) {
        this.id = id;

        // User Information
        this.username = appealData.username;
        this.email = appealData.email;
        this.author = appealData.author;
        
        // Appeal Details
        this.appealReason = appealData.appealReason;
        this.additionalInfo = appealData.additionalInfo;
        this.incidentDate = appealData.incidentDate;
        this.contactMethod = appealData.contactMethod;
        
        // Admin Fields
        this.adminNotes = appealData.adminNotes;
        this.reviewedAt = appealData.reviewedAt;
        this.responseMessage = appealData.responseMessage;
        
        // Metadata
        this.appealNumber = appealData.appealNumber;
        
        // Communication History
        this.communications= appealData.communications;

        // System Fields
        this.status = appealData.status;
        this.priority = appealData.priority;

        this.createdAt = appealData.createdAt || new Date().toISOString();
        this.updatedAt = appealData.updatedAt || new Date().toISOString();
    }

    generateAppealNumber() {
        if (!this.appealNumber) {
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            this.appealNumber = `APP-${timestamp}-${random}`;
        }
        return this.appealNumber;
    }
}

module.exports = Appeal;