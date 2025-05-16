const User = require("../models/User");
require('dotenv').config();

const createDefaultSuperAdmin = async (req, res) => {
    try {
        // check if super admin already exists
        const email = process.env.SUPER_ADMIN_EMAIL;
        const existingSuperAdmin = await User.findByEmail(email);
        
        
        if (!existingSuperAdmin) {
            // generate a num between 1-100
            const index = Math.floor(Math.random() * 100) + 1;
            const randomAvatar = `https://avatar.iran.liara.run/public/${index}.png`;
            const defaultCover = process.env.DEFAULT_COVER_PHOTO || "https://static.cognitoforms.com/website/assets/default-video-cover-photo.Djn4Ebbl.png";
        
            const superAdminData = {
                username: process.env.SUPER_ADMIN_USER_NAME,
                email: process.env.SUPER_ADMIN_EMAIL,
                password: process.env.SUPER_ADMIN_PASSWORD,
                firstName: process.env.SUPER_ADMIN_FIRST_NAME,
                lastName: process.env.SUPER_ADMIN_LAST_NAME,
                role: "super_admin",
                profilePicture: randomAvatar,
                coverPhoto: defaultCover
            };
    
            await User.create(superAdminData);
            console.log(`Default Super Admin created: \nEmail: ${process.env.SUPER_ADMIN_EMAIL} \nPassword: ${process.env.SUPER_ADMIN_PASSWORD}`);
        } else {
            superAdmin = existingSuperAdmin;
            console.log(`Default Super Admin already exists. \nEmail: ${process.env.SUPER_ADMIN_EMAIL} \nPassword: ${process.env.SUPER_ADMIN_PASSWORD}`);
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