class Mail {
  constructor(id, data) {
    this.id = id;
    this.name = data.name;
    this.email = data.email;
    this.subject = data.subject;
    this.message = data.message;
    this.author = data.author;
    
    this.isRead = data.isRead !== undefined ? data.isRead : false;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = Mail;