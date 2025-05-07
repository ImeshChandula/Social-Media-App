const User = require("../models/User");
const jwt = require('jsonwebtoken');

const createDefaultSuperAdmin = async (req, res) => {
    try {
        // check if super admin already exists
        const existingSuperAdmin = await User.findOne({ email: "superadmin@test.lk" });
        
        
        if (!existingSuperAdmin) {
            const defaultUsername = "superAdmin";
            const defaultEmail = "superadmin@test.lk";
            const defaultPassword = "super123";
            const defaultFirstName = "Super";
            const defaultLastName = "Admin";
            const defaultRole = "super_admin";

            const superAdmin = new User({
                username: defaultUsername,
                email: defaultEmail,
                password: defaultPassword,
                firstName: defaultFirstName,
                lastName: defaultLastName,
                role: defaultRole,
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