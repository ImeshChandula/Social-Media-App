const AppealService = require('../services/appealService');
const UserService = require('../services/userService');
const transporter = require('../config/nodemailer');

const appealService = new AppealService();

const createAppeal = async (req, res) => {
    try {
        const {username, email, appealReason, additionalInfo, incidentDate, contactMethod} = req.body;
        const user = await UserService.findById(req.user.id);

        if (req.body.email !== user.email) {
            return res.status(400).json({
                success: false,
                message: "Your email dos not match with your registered email"
            });
        }

        const hasPending = await appealService.hasPendingAppeals(user.id);
        if (hasPending) {
            return res.status(400).json({ 
                success: false, 
                message: "You already have a pending appeal. Please wait for it to be reviewed."
            });
        }

        const randomNumber = String(Math.floor(100000 + Math.random() * 900000));

        const appealData = {
            username, 
            email, 
            appealReason, 
            additionalInfo, 
            incidentDate, 
            contactMethod, 
            appealNumber: randomNumber,
        }

        const appeal = await appealService.create(appealData);
        if (!appeal) {
            return res.status(400).json({
                success: false,
                message: "Error creating appeal"
            });
        }


        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: appeal.email,
            subject: "Ban Appeal response",
            html: `
                <h2>Ban Appeal Submitted Successfully</h2>
                <p>Your ban appeal has been received and is being reviewed.</p>
                <p><strong>Appeal Number:</strong> ${appeal.appealNumber}</p>
                <p>You will receive an email notification once your appeal has been reviewed.</p>
                <p>This typically takes 3-5 business days.</p>
                <p>Thank you for your patience.</p>
                `
        };

        const mailResult = await transporter.sendMail(mailOptions);
        if (!mailResult) {
            return res.status(500).json({ success: false, message: "Failed to send mail"});
        }

        return res.status(201).json({ 
            success: true, 
            message: "Ban Appeal created successfully",
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


module.exports = {createAppeal};