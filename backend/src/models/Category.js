class Category {
  constructor(id, categoryData) {
    this.id = id;
    this.categoryFor = categoryData.categoryFor; // job_role, marketplace, other
    this.name = categoryData.name;
    this.description = categoryData.description || '';
    this.author = categoryData.author;
    this.isActive = categoryData.isActive !== undefined ? categoryData.isActive : true;
    this.createdAt = categoryData.createdAt || new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }
}

module.exports = Category;