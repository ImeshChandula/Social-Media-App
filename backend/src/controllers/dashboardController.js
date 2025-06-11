const ROLES = require("../enums/roles");
const UserService = require('../services/userService');
const PostService = require('../services/postService');
const StoryService = require('../services/storyService');
const JobCategoryService = require('../services/jobCategoryService');

const jobCategoryService = new JobCategoryService();

const userSummery = async (req, res) => {
    try {
        const users = await UserService.findAll();

        const summary = {
            totalUsers: users.length,
            activeUsers: 0,
            inactiveUsers: 0,
            bannedUsers: 0,
            roleUsers: 0,
            roleAdmins: 0,
            roleSuperAdmins: 0,
        };

        for (const user of users) {
            if (user.accountStatus === "active")
                summary.activeUsers++;
            if (user.accountStatus === "inactive")
                summary.inactiveUsers++;
            if (user.accountStatus === "banned")
                summary.bannedUsers++;

            switch (user.role) {
                case ROLES.USER:
                    summary.roleUsers++;
                    break;
                case ROLES.ADMIN:
                    summary.roleAdmins++;
                    break;
                case ROLES.SUPER_ADMIN:
                    summary.roleSuperAdmins++;
                    break;
            }
        }

        return res.status(200).json({ success: true, data: summary });
    } catch (error) {
        console.error('Error in user summary:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const aaaa = async (req, res) => {
    try {} catch (error) {}
};

module.exports = {userSummery};