const ROLES = require("../enums/roles");
const UserService = require('../services/userService');
const PostService = require('../services/postService');
const StoryService = require('../services/storyService');
const CategoryService = require('../services/categoryService');
const AppealService = require('../services/appealService');
const MailService = require('../services/mailService');

const categoryService = new CategoryService();
const appealService = new AppealService();
const mailService = new MailService();

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

const appealSummery = async (req, res) => {
    try {
        const summaryData = {};

        const total = await appealService.findAll();
        const pending = await appealService.findAllByStatus("pending");
        const underReview = await appealService.findAllByStatus("under_review");
        const approved = await appealService.findAllByStatus("approved");
        const rejected = await appealService.findAllByStatus("rejected");
        const closed = await appealService.findAllByStatus("closed");
        const urgent = await appealService.findAllByPriority("urgent");

        if (!total || !pending || !underReview || !approved || !rejected || !closed || !urgent) {
            return res.status(400).json({ success: false, message: "Failed to get data"});
        }

        summaryData.total = total.length;
        summaryData.pending = pending.length;
        summaryData.underReview = underReview.length;
        summaryData.approved = approved.length;
        summaryData.rejected = rejected.length;
        summaryData.closed = closed.length;
        summaryData.urgent = urgent.length;

        return res.status(200).json({ success: true, message: "Appeal summary fetched successfully", data: summaryData});
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

const messageSummary = async (req, res) => {
	try {
        const mails = await mailService.findAll();
        if (!mails) {
            return res.status(400).json({ success: false, message: "Failed to fetch messages"});
        }

        const unreadCount = mails.filter(mail => !mail.isRead).length;

        const summaryData = {
            total: mails.length,
            unread: unreadCount
        };

        return res.status(200).json({ success: true, message: "Message summary fetched successfully", data: summaryData});
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

const categorySummery = async (req, res) => {
	try {
        const jobCategories = await categoryService.findAllActiveByField("job_role");
        const marketCategories = await categoryService.findAllActiveByField("marketplace");

        if (!jobCategories || !marketCategories) {
            return res.status(400).json({ success: false, message: "Failed to fetch categories"});
        }

        const simplifiedJobCategories = jobCategories.map(category => ({
            id: category.id,
            name: category.name
        }));

        const simplifiedMarketCategories = marketCategories.map(category => ({
            id: category.id,
            name: category.name
        }));

        return res.status(200).json({ 
            success: true, 
            message: "Categories received successfully", 
            data: {
                simplifiedJobCategories, 
                simplifiedMarketCategories
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

module.exports = {userSummery, appealSummery, messageSummary, categorySummery};