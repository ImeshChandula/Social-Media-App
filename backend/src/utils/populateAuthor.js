const UserService = require('../services/userService');

/**
 * Populates the `author` field with full user data
 * @param {Array|Object} data - A JobCategory object or array of JobCategory objects
 * @returns {Promise<Array|Object>} - Same structure with populated author field
 */
const populateAuthor = async (data) => {
    const populateOne = async (category) => {
        // Handle both string ID and object with ID
        const authorId = typeof category.author === 'string' 
            ? category.author 
            : category?.author?.id;
            
        if (authorId) {
            try {
                const user = await UserService.findById(authorId);
                if (user) {
                    category.author = {
                        id: user.id,
                        email: user.email,
                        username: `${user.firstName} ${user.lastName}`,
                        profilePicture: user.profilePicture,
                    };
                } else {
                    category.author = null;
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                category.author = null;
            }
        }
        return category;
    };

    if (Array.isArray(data)) {
        return Promise.all(data.map(populateOne));
    } else {
        return populateOne(data);
    }
};

module.exports = populateAuthor;
