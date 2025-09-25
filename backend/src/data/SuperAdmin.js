const SUPER_ADMIN_DATA = {
    USER_NAME: process.env.SUPER_ADMIN_USER_NAME || "superAdmin",
    EMAIL: process.env.SUPER_ADMIN_EMAIL || "superadmin@test.lk",
    PHONE : process.env.SUPER_ADMIN_PHONE || "+94772244999",
    PASSWORD: process.env.SUPER_ADMIN_PASSWORD || "super123",
    FIRST_NAME: process.env.SUPER_ADMIN_FIRST_NAME || "Super",
    LAST_NAME: process.env.SUPER_ADMIN_LAST_NAME || "Admin",
};

export default SUPER_ADMIN_DATA;