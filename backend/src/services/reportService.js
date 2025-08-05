// const { connectFirebase } = require('../config/firebase');
// const Report = require('../models/Report');

// const { db } = connectFirebase();
// const reportCollection = db.collection('reports');

// const ReportService = {
//     // Helper method to safely create Report instances
//     _createReportSafely(docId, docData) {
//         try {
//             if (!docId) {
//                 console.warn('Document ID is missing');
//                 return null;
//             }
            
//             if (!docData) {
//                 console.warn(`Document data is missing for ID ${docId}`);
//                 return null;
//             }

//             return new Report(docId, docData);
//         } catch (error) {
//             console.error(`Error creating Report instance for ID ${docId}:`, error);
//             return null;
//         }
//     },

//     // Create a new report
//     async create(reportData) {
//         try {
//             reportData.createdAt = new Date().toISOString();
//             reportData.status = 'pending';

//             const docRef = await reportCollection.add(reportData);
//             return this._createReportSafely(docRef.id, reportData);
//         } catch (error) {
//             console.error('Error creating report:', error);
//             throw error;
//         }
//     },

//     // Find report by ID
//     async findById(id) {
//         try {
//             const doc = await reportCollection.doc(id).get();
//             if (!doc.exists) {
//                 return null;
//             }

//             return this._createReportSafely(doc.id, doc.data());
//         } catch (error) {
//             console.error('Error finding report by ID:', error);
//             throw error;
//         }
//     },

//     // Find all reports for a specific post
//     async findByPostId(postId) {
//         try {
//             const reportRef = await reportCollection
//                 .where('postId', '==', postId)
//                 .orderBy('createdAt', 'desc')
//                 .get();
            
//             if (reportRef.empty) {
//                 return [];
//             }
            
//             const reports = [];
//             reportRef.docs.forEach(doc => {
//                 const report = this._createReportSafely(doc.id, doc.data());
//                 if (report) {
//                     reports.push(report);
//                 }
//             });
            
//             return reports;
//         } catch (error) {
//             console.error('Error finding reports by post ID:', error);
//             throw error;
//         }
//     },

//     // Find all pending reports for admin dashboard
//     async findPendingReports() {
//         try {
//             const reportRef = await reportCollection
//                 .where('status', '==', 'pending')
//                 .orderBy('createdAt', 'desc')
//                 .get();
            
//             if (reportRef.empty) {
//                 return [];
//             }
            
//             const reports = [];
//             reportRef.docs.forEach(doc => {
//                 const report = this._createReportSafely(doc.id, doc.data());
//                 if (report) {
//                     reports.push(report);
//                 }
//             });
            
//             return reports;
//         } catch (error) {
//             console.error('Error finding pending reports:', error);
//             throw error;
//         }
//     },

//     // Find all reports (for admin dashboard)
//     async findAll() {
//         try {
//             const reportRef = await reportCollection
//                 .orderBy('createdAt', 'desc')
//                 .get();
            
//             if (reportRef.empty) {
//                 return [];
//             }
            
//             const reports = [];
//             reportRef.docs.forEach(doc => {
//                 const report = this._createReportSafely(doc.id, doc.data());
//                 if (report) {
//                     reports.push(report);
//                 }
//             });
            
//             return reports;
//         } catch (error) {
//             console.error('Error finding all reports:', error);
//             throw error;
//         }
//     },

//     // Update report status
//     async updateById(id, updateData) {
//         try {
//             updateData.reviewedAt = new Date().toISOString();
            
//             await reportCollection.doc(id).update(updateData);
            
//             const updatedReport = await this.findById(id);
//             return updatedReport;
//         } catch (error) {
//             console.error('Error updating report:', error);
//             throw error;
//         }
//     },

//     // Delete report
//     async deleteById(id) {
//         try {
//             await reportCollection.doc(id).delete();
//             return true;
//         } catch (error) {
//             console.error('Error deleting report:', error);
//             throw error;
//         }
//     },

//     // Check if user has already reported a post
//     async hasUserReported(postId, userId) {
//         try {
//             const reportRef = await reportCollection
//                 .where('postId', '==', postId)
//                 .where('reportedBy', '==', userId)
//                 .limit(1)
//                 .get();
            
//             return !reportRef.empty;
//         } catch (error) {
//             console.error('Error checking if user has reported:', error);
//             throw error;
//         }
//     }
// };

// module.exports = ReportService;

// v3---------------------------------------------------

const { connectFirebase } = require('../config/firebase');
const Report = require('../models/Report');

const { db } = connectFirebase();
const reportCollection = db.collection('reports');

const ReportService = {
    // Helper method to safely create Report instances
    _createReportSafely(docId, docData) {
        try {
            if (!docId) {
                console.warn('Document ID is missing');
                return null;
            }
            
            if (!docData) {
                console.warn(`Document data is missing for ID ${docId}`);
                return null;
            }

            return new Report(docId, docData);
        } catch (error) {
            console.error(`Error creating Report instance for ID ${docId}:`, error);
            return null;
        }
    },

    // Create a new report
    async create(reportData) {
        try {
            reportData.createdAt = new Date().toISOString();
            reportData.status = 'pending';

            const docRef = await reportCollection.add(reportData);
            return this._createReportSafely(docRef.id, reportData);
        } catch (error) {
            console.error('Error creating report:', error);
            throw error;
        }
    },

    // Find report by ID
    async findById(id) {
        try {
            const doc = await reportCollection.doc(id).get();
            if (!doc.exists) {
                return null;
            }

            return this._createReportSafely(doc.id, doc.data());
        } catch (error) {
            console.error('Error finding report by ID:', error);
            throw error;
        }
    },

    // Find all reports for a specific post
    async findByPostId(postId) {
        try {
            // Use single field query to avoid composite index requirement
            const reportRef = await reportCollection
                .where('postId', '==', postId)
                .get(); // Remove orderBy to avoid composite index
            
            if (reportRef.empty) {
                return [];
            }
            
            const reports = [];
            reportRef.docs.forEach(doc => {
                const report = this._createReportSafely(doc.id, doc.data());
                if (report) {
                    reports.push(report);
                }
            });
            
            // Sort in memory by createdAt (most recent first)
            reports.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });
            
            return reports;
        } catch (error) {
            console.error('Error finding reports by post ID:', error);
            throw error;
        }
    },

    // Find all pending reports for admin dashboard
    async findPendingReports() {
        try {
            // Use single field query to avoid composite index requirement
            const reportRef = await reportCollection
                .where('status', '==', 'pending')
                .get(); // Remove orderBy to avoid composite index
            
            if (reportRef.empty) {
                return [];
            }
            
            const reports = [];
            reportRef.docs.forEach(doc => {
                const report = this._createReportSafely(doc.id, doc.data());
                if (report) {
                    reports.push(report);
                }
            });
            
            // Sort in memory by createdAt (most recent first)
            reports.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });
            
            return reports;
        } catch (error) {
            console.error('Error finding pending reports:', error);
            throw error;
        }
    },

    // Find all reports (for admin dashboard)
    async findAll() {
        try {
            // Use simple query without orderBy to avoid index requirement
            const reportRef = await reportCollection.get();
            
            if (reportRef.empty) {
                return [];
            }
            
            const reports = [];
            reportRef.docs.forEach(doc => {
                const report = this._createReportSafely(doc.id, doc.data());
                if (report) {
                    reports.push(report);
                }
            });
            
            // Sort in memory by createdAt (most recent first)
            reports.sort((a, b) => {
                const dateA = new Date(a.createdAt || 0);
                const dateB = new Date(b.createdAt || 0);
                return dateB - dateA;
            });
            
            return reports;
        } catch (error) {
            console.error('Error finding all reports:', error);
            throw error;
        }
    },

    // Update report status
    async updateById(id, updateData) {
        try {
            updateData.reviewedAt = new Date().toISOString();
            
            await reportCollection.doc(id).update(updateData);
            
            const updatedReport = await this.findById(id);
            return updatedReport;
        } catch (error) {
            console.error('Error updating report:', error);
            throw error;
        }
    },

    // Delete report
    async deleteById(id) {
        try {
            await reportCollection.doc(id).delete();
            return true;
        } catch (error) {
            console.error('Error deleting report:', error);
            throw error;
        }
    },

    // Check if user has already reported a post
    async hasUserReported(postId, userId) {
        try {
            const reportRef = await reportCollection
                .where('postId', '==', postId)
                .where('reportedBy', '==', userId)
                .limit(1)
                .get();
            
            return !reportRef.empty;
        } catch (error) {
            console.error('Error checking if user has reported:', error);
            throw error;
        }
    }
};

module.exports = ReportService;