const AppealService = require('../services/appealService');
const UserService = require('../services/userService');
const transporter = require('../config/nodemailer');
const populateAuthor = require('../utils/populateAuthor');
const {BAN_APPEAL_TEMPLATE} = require('../utils/emailTemplates');

const appealService = new AppealService();

const createAppeal = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserService.findById(req.user.id);

        if (req.user.accountStatus !== "banned") {
            return res.status(400).json({ success: false, message: "Your account is not banned"});
        }

        if (email !== user.email) {
            return res.status(400).json({
                success: false,
                message: "Your email does not match with your registered email"
            });
        }

        const hasPending = await appealService.hasPendingAppeals(user.email);
        if (hasPending) {
            return res.status(400).json({ 
                success: false, 
                message: "You already have a pending appeal. Please wait for it to be reviewed."
            });
        }

        const appealData = {
            author: req.user.id,
            ...req.body
        }

        const appeal = await appealService.create(appealData);
        if (!appeal) {
            return res.status(400).json({ success: false, message: "Failed to create appeal"});
        }

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: appeal.email,
            subject: "Ban Appeal response",
            html: BAN_APPEAL_TEMPLATE.replace("{{appealNumber}}", appeal.appealNumber)
        };

        const mailResult = await transporter.sendMail(mailOptions);
        if (!mailResult) {
            return res.status(500).json({ success: false, message: "Failed to send mail"});
        }

        return res.status(201).json({ 
            success: true, 
            message: "Ban Appeal created successfully. Response message was sent to your email.",
            data: appeal
        });
    } catch (error) {
        return res.status(500).json({ 
			success: false, 
			message: "Server error", 
			error: error.message 
		});
    }
};


const getAllAppeals = async (req, res) => {
    try {
        const appeals = await appealService.findAll();

        const populatedAppeals = await populateAuthor(appeals);
        if (!populatedAppeals) {
            return res.status(400).json({success: false, message: "Error in populate author"})
        }

        const cleanedAppeals = populatedAppeals.map(appeal => {
            const { username, email, ...cleanedAppeal } = appeal;
            return cleanedAppeal;
        });

        return res.status(200).json({ success: true, message: "Appeals received successfully", count: cleanedAppeals.length, data: cleanedAppeals});
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};


const deleteAppeal = async (req, res) => {
    try {
        const appealId = req.params.id;

        const appeal = await appealService.findById(appealId);
        if (!appeal){
            return res.status(404).json({ success: false, message: "Appeal not found"});
        }

        const result = await appealService.deleteById(appealId);
        if (!result) {
            return res.status(400).json({ success: false, message: "Failed to delete appeal"});
        }

        return res.status(200).json({ success: true, message: "Appeal deleted successfully"});
    } catch (error) {
        return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};



module.exports = {createAppeal, getAllAppeals, deleteAppeal};