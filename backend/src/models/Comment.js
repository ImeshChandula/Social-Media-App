// Comment table
class Comment {
  constructor(id, commentData) {
    this.id = id;
    this.post = commentData.post;
    this.user = commentData.user;
    this.text = commentData.text;
    this.media = commentData.media || null;

    this.likes = commentData.likes || [];
    this.replies = commentData.replies || [];
    
    this.createdAt = commentData.createdAt || new Date().toISOString();
    this.updatedAt = commentData.updatedAt || new Date().toISOString();
  };

  
  
  // get like count
  get likeCount() {
    return this.likes.length;
  };

}

module.exports=Comment;