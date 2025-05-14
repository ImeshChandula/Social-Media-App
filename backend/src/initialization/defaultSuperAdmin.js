const User = require("../models/User");
require('dotenv').config();

const createDefaultSuperAdmin = async (req, res) => {
    try {
        // check if super admin already exists
        const email = process.env.SUPER_ADMIN_EMAIL;
        const existingSuperAdmin = await User.findByEmail(email);
        
        
        if (!existingSuperAdmin) {
            // user data object
            const superAdmin = new User({
                username: process.env.SUPER_ADMIN_USER_NAME,
                email: process.env.SUPER_ADMIN_EMAIL,
                password: process.env.SUPER_ADMIN_PASSWORD,
                firstName: process.env.SUPER_ADMIN_FIRST_NAME,
                lastName: process.env.SUPER_ADMIN_LAST_NAME,
                role: "super_admin",
            });
    
            await superAdmin.save();
            console.log("Default Super Admin created: \nEmail: superadmin@test.lk \nPassword: super123");
        } else {
            superAdmin = existingSuperAdmin;
            console.log("Default Super Admin already exists. \nEmail: superadmin@test.lk \nPassword: super123");
        }
    } catch (err) {
        console.error(err.message);
        if (req && res) {
            res.status(500).send('Server error');
        }
    }
};


// If you want to call this function directly during server startup
const initializeDefaultSuperAdmin = async () => {
    try {
        await createDefaultSuperAdmin();
        console.log("Super admin initialization completed");
    } catch (err) {
        console.error("Failed to initialize super admin:", err.message);
    }
};

module.exports = {
    createDefaultSuperAdmin,
    initializeDefaultSuperAdmin
};