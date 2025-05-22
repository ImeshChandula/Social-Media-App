// Post table
class Post {
    constructor(id, postData) {
        this.id = id;
        this.author = postData.author;
        this.content = postData.content;
        this.media = postData.media || [];
        this.mediaType = postData.mediaType || null;
        this.tags = postData.tags || [];
        this.privacy = postData.privacy || 'public';
        this.location = postData.location || null;

        this.likes = postData.likes || [];
        this.comments = postData.comments || [];
        this.shares = postData.shares || [];

        this.isEdited = postData.isEdited || false;
        this.editHistory = postData.editHistory || [];

        this.createdAt = postData.createdAt || new Date().toISOString();
        this.updatedAt = postData.updatedAt || new Date().toISOString();
    };


    // get comment count
    get commentCount() {
        return this.comments.length;
    };

    // get like count
    get likeCount() {
        return this.likes.length;
    };

    // get share count
    get shareCount() {
        return this.shares.length;
    };


}


module.exports = Post;