const { default: DEFAULT_COVER_PHOTO } = require('../data/AppInfo');
const { default: SUPER_ADMIN_DATA } = require('../data/SuperAdmin');
const ACCOUNT_STATUS = require('../enums/account_status');
const USER_ROLES = require('../enums/roles');
const UserService = require('../services/userService');
require('dotenv').config();

const createDefaultSuperAdmin = async (req, res) => {
    try {
        // check if super admin already exists
        const email = SUPER_ADMIN_DATA.EMAIL;
        const existingSuperAdmin = await UserService.findByEmail(email);
        
        
        if (!existingSuperAdmin) {
            // generate a num between 1-100
            const index = Math.floor(Math.random() * 100) + 1;
            const randomAvatar = `https://avatar.iran.liara.run/public/${index}.png`;
            const defaultCover = DEFAULT_COVER_PHOTO || "https://static.cognitoforms.com/website/assets/default-video-cover-photo.Djn4Ebbl.png";
        
            const superAdminData = {
                username: SUPER_ADMIN_DATA.USER_NAME,
                email: SUPER_ADMIN_DATA.EMAIL,
                phone: SUPER_ADMIN_DATA.PHONE,
                password: SUPER_ADMIN_DATA.PASSWORD,
                firstName: SUPER_ADMIN_DATA.FIRST_NAME,
                lastName: SUPER_ADMIN_DATA.LAST_NAME,
                _isPasswordModified: false,

                profilePicture: randomAvatar,
                coverPhoto: defaultCover,
                bio: '',
                location: '',
                birthday: null,
                jobCategory: "None",

                friends: [],
                friendRequests: [],
                favorites: [],

                resetOtp: '',
                resetOtpExpiredAt: new Date().toISOString(),

                isActive: true,
                isPublic: true,
                lastLogin: new Date().toISOString(),

                role: USER_ROLES.SUPER_ADMIN,
                accountStatus: ACCOUNT_STATUS.ACTIVE,
                notificationCount: 0
            };
    
            await UserService.create(superAdminData);
            console.log(`✅ Default Super Admin created...`);
        } else {
            console.log(`✅ Default Super Admin already exists...`);
        }
    } catch (error) {
        console.error(error.message);
        if (req && res) {
            res.status(500).send('❌ Server error while default account creating');
        }
    }
};


// If you want to call this function directly during server startup
const initializeDefaultSuperAdmin = async () => {
    try {
        await createDefaultSuperAdmin();
        console.log("✅ Super admin initialization completed...");
    } catch (error) {
        console.error("❌ Failed to initialize super admin:", error.message);
    }
};

module.exports = {
    createDefaultSuperAdmin,
    initializeDefaultSuperAdmin
};