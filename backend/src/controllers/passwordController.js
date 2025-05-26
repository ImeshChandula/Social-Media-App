const UserService = require('../services/userService');
const transporter = require('../config/nodemailer');
const bcrypt = require('bcrypt');


const requestOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({success: false, message: "Email is required"});
        }

        const user = await UserService.findByEmail(email);
        if (!user) {
            return res.status(404).json({success: false, message: "User not found"});
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        const userData = {};

        userData.resetOto = otp;
        userData.resetOtpExpiredAt = new Date(Date.now() + 2.5 * 60 * 1000).toISOString(); // expires at 2 minutes 30 seconds from now

        const updateUser = await UserService.updateById(user.id, userData);
        if (!updateUser) {
            return res.status(400).json({success: false, message: "OTP creation failed"});
        }

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: updateUser.email,
            subject: "Password Reset OTP",
            text: `Your OTP for resetting password is: ${otp}. Use this OTP to reset your Password within 2 minutes 30 seconds from now.`
        };

        const mailResult = await transporter.sendMail(mailOptions);
        if (!mailResult) {
            return res.status(500).json({ success: false, message: "Failed to send mail"});
        }

        res.status(200).json({success: true, message: "Reset password OTP sent to your email"});
    } catch (error) {
        console.error('Send Reset OTP error:', error.message);
        res.status(500).json({success: false, message: error.message });
    }
};


const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword} = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({success: false, message: "Email, OTP, Password are required"});
        }

        const user = await UserService.findByEmail(email);
        if (!user) {
            return res.status(404).json({success: false, message: "User not available"});
        }

        if (user.resetOtp === '' || user.resetOtp !== otp) {
            return res.status(400).json({success: false, message: "Invalid OTP"});
        }

        if (user.resetOtpExpiredAt < new Date().toISOString()) {
            return res.status(400).json({success: false, message: "OTP Expired"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updateUserData = {
            password: hashedPassword,
            resetOtp: '',
            resetOtpExpiredAt: new Date().toISOString(),
        };

        await UserService.updateById(user.id, updateUserData);

        res.status(201).json({success: true, message: "Password has been reset successfully"})
    } catch (error) {
        console.error('Reset password error:', error.message);
        res.status(500).json({success: false, message: error.message });
    }
};


module.exports = { requestOtp, resetPassword };