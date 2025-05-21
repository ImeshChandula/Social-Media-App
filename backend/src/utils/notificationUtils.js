const notificationService = require('../services/notificationService');
const { NotificationTypes, NotificationEntityTypes } = require('../models/Notification');

const notificationUtils = {
    /**
   * Send a like notification when someone likes a post
   * @param {string} recipientId - User ID of the post owner
   * @param {string} senderId - User ID of the person who liked the post
   * @param {string} postId - ID of the post that was liked
   * @param {string} senderName - Name of the person who liked the post
   */
    async sendLikePostNotification(recipientId, senderId, postId, senderName) {
    if (recipientId === senderId) return; // Don't notify users of their own actions
    
    const message = `${senderName} liked your post`;
    
    await notificationService.createNotification(
      recipientId,
      senderId,
      NotificationTypes.LIKE_POST,
      postId,
      NotificationEntityTypes.POST,
      message,
      { postId }
    );
    
    await notificationService.sendPushNotification(
      recipientId, 
      'New Like', 
      message,
      {
        type: NotificationTypes.LIKE_POST,
        entityId: postId,
        entityType: NotificationEntityTypes.POST
      }
    );
  },
  
  /**
   * Send a comment notification when someone comments on a post
   * @param {string} recipientId - User ID of the post owner
   * @param {string} senderId - User ID of the commenter
   * @param {string} postId - ID of the post
   * @param {string} commentId - ID of the comment
   * @param {string} senderName - Name of the commenter
   * @param {string} commentPreview - Preview of the comment content
   */
  async sendCommentNotification(recipientId, senderId, postId, commentId, senderName, commentPreview) {
    if (recipientId === senderId) return; // Don't notify users of their own actions
    
    const message = `${senderName} commented on your post: "${commentPreview}"`;
    
    await notificationService.createNotification(
      recipientId,
      senderId,
      NotificationTypes.COMMENT,
      commentId,
      NotificationEntityTypes.COMMENT,
      message,
      { postId, commentId }
    );
    
    await notificationService.sendPushNotification(
      recipientId, 
      'New Comment', 
      message,
      {
        type: NotificationTypes.COMMENT,
        entityId: commentId,
        entityType: NotificationEntityTypes.COMMENT,
        postId
      }
    );
  },
  
  /**
   * Send a reply notification when someone replies to a comment
   * @param {string} recipientId - User ID of the comment owner
   * @param {string} senderId - User ID of the person replying
   * @param {string} postId - ID of the parent post
   * @param {string} commentId - ID of the parent comment
   * @param {string} replyId - ID of the reply
   * @param {string} senderName - Name of the person replying
   * @param {string} replyPreview - Preview of the reply content
   */
  async sendReplyNotification(recipientId, senderId, postId, commentId, replyId, senderName, replyPreview) {
    if (recipientId === senderId) return; // Don't notify users of their own actions
    
    const message = `${senderName} replied to your comment: "${replyPreview}"`;
    
    await notificationService.createNotification(
      recipientId,
      senderId,
      NotificationTypes.REPLY,
      replyId,
      NotificationEntityTypes.REPLY,
      message,
      { postId, commentId, replyId }
    );
    
    await notificationService.sendPushNotification(
      recipientId, 
      'New Reply', 
      message,
      {
        type: NotificationTypes.REPLY,
        entityId: replyId,
        entityType: NotificationEntityTypes.REPLY,
        postId,
        commentId
      }
    );
  },
  
  /**
   * Send a like notification when someone likes a reply
   * @param {string} recipientId - User ID of the reply owner
   * @param {string} senderId - User ID of the person who liked the reply
   * @param {string} postId - ID of the parent post
   * @param {string} replyId - ID of the reply that was liked
   * @param {string} senderName - Name of the person who liked the reply
   */
  async sendLikeReplyNotification(recipientId, senderId, postId, replyId, senderName) {
    if (recipientId === senderId) return; // Don't notify users of their own actions
    
    const message = `${senderName} liked your reply`;
    
    await notificationService.createNotification(
      recipientId,
      senderId,
      NotificationTypes.LIKE_REPLY,
      replyId,
      NotificationEntityTypes.REPLY,
      message,
      { postId, replyId }
    );
    
    await notificationService.sendPushNotification(
      recipientId, 
      'New Like', 
      message,
      {
        type: NotificationTypes.LIKE_REPLY,
        entityId: replyId,
        entityType: NotificationEntityTypes.REPLY,
        postId
      }
    );
  },
  
  /**
   * Send a friend request notification
   * @param {string} recipientId - User ID of the user receiving the friend request
   * @param {string} senderId - User ID of the user sending the friend request
   * @param {string} senderName - Name of the user sending the friend request
   */
  async sendFriendRequestNotification(recipientId, senderId, senderName) {
    const message = `${senderName} sent you a friend request`;
    
    await notificationService.createNotification(
      recipientId,
      senderId,
      NotificationTypes.FRIEND_REQUEST,
      senderId,
      NotificationEntityTypes.USER,
      message,
      {}
    );
    
    await notificationService.sendPushNotification(
      recipientId, 
      'Friend Request', 
      message,
      {
        type: NotificationTypes.FRIEND_REQUEST,
        entityId: senderId,
        entityType: NotificationEntityTypes.USER
      }
    );
  },
  
  /**
   * Send a friend request accepted notification
   * @param {string} recipientId - User ID of the user who sent the original request
   * @param {string} senderId - User ID of the user who accepted the request
   * @param {string} senderName - Name of the user who accepted the request
   */
  async sendAcceptRequestNotification(recipientId, senderId, senderName) {
    const message = `${senderName} accepted your friend request`;
    
    await notificationService.createNotification(
      recipientId,
      senderId,
      NotificationTypes.ACCEPT_REQUEST,
      senderId,
      NotificationEntityTypes.USER,
      message,
      {}
    );
    
    await notificationService.sendPushNotification(
      recipientId, 
      'Friend Request Accepted', 
      message,
      {
        type: NotificationTypes.ACCEPT_REQUEST,
        entityId: senderId,
        entityType: NotificationEntityTypes.USER
      }
    );
  },
  
  /**
   * Send a new post notification to all friends when a user creates a post
   * @param {Array<string>} friendIds - Array of user IDs of friends to notify
   * @param {string} senderId - User ID of the post creator
   * @param {string} postId - ID of the newly created post
   * @param {string} senderName - Name of the post creator
   * @param {string} postPreview - Preview of the post content
   */
  async sendNewPostNotification(friendIds, senderId, postId, senderName, postPreview) {
    const message = `${senderName} shared a new post: "${postPreview}"`;
    
    for (const friendId of friendIds) {
      await notificationService.createNotification(
        friendId,
        senderId,
        NotificationTypes.POST,
        postId,
        NotificationEntityTypes.POST,
        message,
        { postId }
      );
      
      await notificationService.sendPushNotification(
        friendId, 
        'New Post', 
        message,
        {
          type: NotificationTypes.POST,
          entityId: postId,
          entityType: NotificationEntityTypes.POST
        }
      );
    }
  },
  
  /**
   * Send a new story notification to all friends when a user creates a story
   * @param {Array<string>} friendIds - Array of user IDs of friends to notify
   * @param {string} senderId - User ID of the story creator
   * @param {string} storyId - ID of the newly created story
   * @param {string} senderName - Name of the story creator
   */
  async sendNewStoryNotification(friendIds, senderId, storyId, senderName) {
    const message = `${senderName} added a new story`;
    
    for (const friendId of friendIds) {
      await notificationService.createNotification(
        friendId,
        senderId,
        NotificationTypes.STORY,
        storyId,
        NotificationEntityTypes.STORY,
        message,
        { storyId }
      );
      
      await notificationService.sendPushNotification(
        friendId, 
        'New Story', 
        message,
        {
          type: NotificationTypes.STORY,
          entityId: storyId,
          entityType: NotificationEntityTypes.STORY
        }
      );
    }
  }
};

module.exports = notificationUtils;