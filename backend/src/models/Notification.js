const NotificationTypes = {
  POST: 'post',
  STORY: 'story',
  COMMENT: 'comment',
  LIKE_POST: 'like_post',
  REPLY: 'reply',
  LIKE_REPLY: 'like_reply',
  FRIEND_REQUEST: 'friend_request',
  ACCEPT_REQUEST: 'accept_request'
};

const NotificationEntityTypes = {
  POST: 'post',
  STORY: 'story',
  COMMENT: 'comment',
  REPLY: 'reply',
  USER: 'user'
};


module.exports = { NotificationTypes, NotificationEntityTypes };
