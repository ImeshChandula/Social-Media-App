const UserService = require('../services/userService');
const transporter = require('../config/nodemailer');
const MailService = require('../services/mailService');
const populateAuthor = require('../utils/populateAuthor');

const mailService = new MailService();


const sendMail = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const user = await UserService.findById(req.user.id);

        if (req.body.email !== user.email) {
            return res.status(400).json({ success: false, message: "Your email is mismatch to your registered email"});
        }

        const mailData = {
            name: name,
            email: email,
            subject: subject,
            message: message,
            author: req.user.id
        }

        const mail = await mailService.create(mailData);
        if (!mail) {
            return res.status(400).json({ success: false, message: "Error creating mail"});
        }

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: mail.email,
            subject: "Support",
            text: "We have received your message and our team will support to you. Thank you for messaging us."
        };

        const mailResult = await transporter.sendMail(mailOptions);
        if (!mailResult) {
            return res.status(500).json({ success: false, message: "Failed to send mail"});
        }

        return res.status(200).json({
            success: true, 
            message: "Mail sent successfully"
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
};

const getAllMails = async (req, res) => {
    try {
        const mails = await mailService.findAll();

        const populatedMails = await populateAuthor(mails);
        if (!populatedMails) {
            return res.status(400).json({success: false, message: "Error in populate author"})
        }

        const unreadCount = populatedMails.filter(mail => !mail.isRead).length;

        return res.status(200).json({ 
            success: true, 
            message: "All mails received successfully", 
            totalCount: populatedMails.length, 
            unreadCount: unreadCount,
            data: populatedMails
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: "Server error", 
            error: error.message 
        });
    }
};

const markAsRead = async (req, res) => {
    try {
        const mailId = req.params.id;

        const mail = await mailService.findById(mailId);
        if (!mail) {
            return res.status(404).json({success: false, message: "Mail not found"});
        }

        if (mail.isRead) {
            return res.status(400).json({success: false, message: "Mail ia already read"});
        }

        const updateData = {
            isRead: true
        };

        const updatedMail = await mailService.updateById(mailId, updateData);
        if (!updatedMail) {
            return res.status(400).json({success: false, message: "Mark as read is failed"});
        }

        return res.status(200).json({ 
            success: true, 
            message: "Mark as read is successfully",  
            data: updatedMail
        });
    } catch (error) {
        return res.status(500).json({ 
			success: false, 
			message: "Server error", 
			error: error.message 
		});
    }
};

module.exports = {sendMail, getAllMails, markAsRead};