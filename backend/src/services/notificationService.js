const { connectFirebase } = require('../config/firebase');
const admin = require('firebase-admin');

const { db, messaging } = connectFirebase();

class NotificationService {
    // Create notification
    async createNotification(recipientId, senderId, type, entityId, entityType, message, additionalData = {}) {
        try {
        // Create notification document
        const notificationRef = db.collection('notifications').doc();
        
        await notificationRef.set({
            recipientId,
            senderId,
            type,
            entityId,
            entityType,
            isRead: false,
            message,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            data: additionalData
        });

        // Increment user's notification counter
        const userRef = db.collection('users').doc(recipientId);
        await userRef.update({
            notificationCount: admin.firestore.FieldValue.increment(1)
        });

        // Emit real-time notification (check if io is available)
            if (global.io) {
                // Create the notification object to emit
                const realtimeNotification = {
                    id: notificationRef.id,
                    recipientId,
                    senderId,
                    type,
                    entityId,
                    entityType,
                    message,
                    timestamp: new Date(),
                    isRead: false,
                    data: additionalData
                };
                
                // Emit to the specific user's room
                global.io.to(`user_${recipientId}`).emit('new_notification', realtimeNotification);
                
                // Also emit notification count update
                global.io.to(`user_${recipientId}`).emit('notification_count_update', {
                    userId: recipientId,
                    increment: 1
                });
            }
        
        return notificationRef.id;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    };

    // Send push notification
    async sendPushNotification(userId, title, body, data = {}) {
        try {
            // Get user's device tokens
            const deviceTokens = await this.getDeviceTokensForUser(userId);
            
            if (deviceTokens.length === 0) {
                return { success: false, message: 'No devices registered for user' };
            }
            
            const message = {
                notification: {
                    title,
                    body
                },
                data,
                tokens: deviceTokens
            };
            
            const response = await messaging.sendMulticast(message);
            return {
                success: true,
                successCount: response.successCount,
                failureCount: response.failureCount
            };
        } catch (error) {
        console.error('Error sending push notification:', error);
        throw error;
        }
    };

    // Get user's device tokens
    async getDeviceTokensForUser(userId) {
        try {
            const devices = await db.collection('devices')
                .where('userId', '==', userId)
                .get();
            
            const tokens = [];
            devices.forEach(device => {
                tokens.push(device.data().token);
            });
            
            return tokens;
        } catch (error) {
            console.error('Error getting device tokens:', error);
            throw error;
        }
    };

    // Get notifications for user
    async getNotificationsForUser(userId, limit = 20, offset = 0) {
        try {
            const notificationsRef = db.collection('notifications');
            const query = notificationsRef
                .where('recipientId', '==', userId)
                .orderBy('timestamp', 'desc')
                .limit(limit)
                .offset(offset);
            
            const snapshot = await query.get();
            
            const notifications = [];
            snapshot.forEach(doc => {
                notifications.push({
                id: doc.id,
                ...doc.data()
                });
            });
            
            return notifications;
        } catch (error) {
            console.error('Error getting notifications:', error);
            throw error;
        }
    };

    // Mark notification as read
    async markAsRead(notificationId) {
        try {
            const notificationRef = db.collection('notifications').doc(notificationId);
            await notificationRef.update({
                isRead: true
            });

            // Emit real-time update for marking as read
            if (global.io) {
                const notificationDoc = await notificationRef.get();
                if (notificationDoc.exists) {
                    const notificationData = notificationDoc.data();
                    global.io.to(`user_${notificationData.recipientId}`).emit('notification_read', {
                        notificationId,
                        recipientId: notificationData.recipientId
                    });
                }
            }
            
            return { success: true };
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    };

    // Mark all notifications as read for a user
    async markAllAsRead(userId) {
        try {
            const batch = db.batch();
            
            const unreadQuery = await db.collection('notifications')
                .where('recipientId', '==', userId)
                .where('isRead', '==', false)
                .get();
            
            unreadQuery.forEach(doc => {
                batch.update(doc.ref, { isRead: true });
            });
            
            await batch.commit();
            
            // Update user's notification counter
            await db.collection('users').doc(userId).update({
                notificationCount: 0,
                lastNotificationRead: admin.firestore.FieldValue.serverTimestamp()
            });

            // Emit real-time update for marking all as read
            if (global.io) {
                global.io.to(`user_${userId}`).emit('all_notifications_read', {
                    userId,
                    count: unreadQuery.size
                });
                
                global.io.to(`user_${userId}`).emit('notification_count_update', {
                    userId,
                    newCount: 0
                });
            }
            
            return { success: true, count: unreadQuery.size };
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
            throw error;
        }
    };
};

module.exports = new NotificationService();