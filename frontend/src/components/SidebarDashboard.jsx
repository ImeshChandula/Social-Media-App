import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FaBars, FaTimes, FaSignOutAlt, FaFlag } from "react-icons/fa";
import { FaUsersGear } from "react-icons/fa6";
import { IoMdArrowRoundBack } from "react-icons/io";
import { BsFileEarmarkPostFill, BsActivity } from "react-icons/bs";
import { TbCategoryFilled } from "react-icons/tb";
import { FaFacebookMessenger } from "react-icons/fa6";
import { IoTicketSharp } from "react-icons/io5";
import BuzadsLogo from "../assets/buzadsLogo.jpg";
import BuzadsText from "../assets/buzadsText.jpg";
import { SiMarketo } from "react-icons/si";
import { MdPages } from "react-icons/md"; // Add this import
import styles from "../styles/DashboardStyle";
import useAuthStore from "../store/authStore";

const SidebarDashboard = ({ collapsed, setCollapsed }) => {
    const [mobileVisible, setMobileVisible] = useState(false);
    const { authUser, logout } = useAuthStore();

    const shortcuts = [
        ...(authUser.role === "super_admin" ? [
            { name: "Manage Users", path: "/dashboard/users", icon: <FaUsersGear /> },
            { name: "Activity Management", path: "/dashboard/activitymanagement", icon: <BsActivity /> }
        ] : []),
        { name: "Page Management", path: "/dashboard/pagemanagement", icon: <MdPages /> },
        { name: "Manage Posts", path: "/dashboard/posts", icon: <BsFileEarmarkPostFill /> },
        { name: "Manage Categories", path: "/dashboard/job-category", icon: <TbCategoryFilled /> },
        { name: "Manage Marketplace", path: "/dashboard/manage-marketplace", icon: <SiMarketo /> },
        { name: "Messages", path: "/dashboard/mails", icon: <FaFacebookMessenger /> },
        { name: "Tickets / Appeals", path: "/dashboard/tickets", icon: <IoTicketSharp /> },
        { name: "Back to Home", path: "/", icon: <IoMdArrowRoundBack /> },
    ];

    const handleResize = () => {
        if (window.innerWidth >= 768) {
            setMobileVisible(false);
        }
    };

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        if (window.innerWidth < 768) {
            setMobileVisible(!mobileVisible);
        } else {
            setCollapsed(!collapsed);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const closeMobileSidebar = () => {
        if (window.innerWidth < 768) {
            setMobileVisible(false);
        }
    };

    const sidebarWidth = collapsed ? "80px" : "250px";

    // Custom NavLink component that handles the active state for tabs within Users page
    const CustomNavLink = ({ to, children, icon, name }) => {
        return (
            <NavLink
                to={to}
                onClick={closeMobileSidebar}
                className={({ isActive }) => {
                    // Check if we're on the users page and this is the users link
                    const isUsersPage = window.location.pathname.includes('/dashboard/users');
                    const isUsersLink = to === '/dashboard/users';

                    // Check if we're on the pagemanagement page and this is the pagemanagement link
                    const isPageManagementPage = window.location.pathname.includes('/dashboard/pagemanagement');
                    const isPageManagementLink = to === '/dashboard/pagemanagement';

                    // If we're on users page and this is the users link, show as active
                    // If we're on pagemanagement page and this is the pagemanagement link, show as active
                    const shouldBeActive = isActive ||
                        (isUsersPage && isUsersLink) ||
                        (isPageManagementPage && isPageManagementLink);

                    return `nav-link d-flex align-items-center gap-3 px-2 py-2 rounded ${shouldBeActive ? "bg-dark text-white fw-bold" : "text-white"
                        }`;
                }}
                style={{ fontSize: "1rem" }}
            >
                {icon}
                {!collapsed && name}
            </NavLink>
        );
    };

    return (
        <>
            {/* Mobile Top Bar */}
            <div className="d-flex d-md-none align-items-center justify-content-between text-white px-3 py-2" style={styles.backgroundColor}>
                <button
                    className="toggle-btn"
                    onClick={toggleSidebar}
                    aria-label="Toggle sidebar"
                >
                    {mobileVisible ? <FaTimes /> : <FaBars />}
                </button>
                <span className="fw-bold">Facebook</span>
            </div>

            {/* Overlay (for mobile) */}
            {mobileVisible && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                    style={{ zIndex: 998 }}
                    onClick={closeMobileSidebar}
                />
            )}

            {/* Sidebar */}
            <div
                className={`bg-black text-white p-3 flex-column position-fixed top-0 ${mobileVisible ? "d-flex" : "d-none"
                    } d-md-flex`}
                style={{
                    width: sidebarWidth,
                    height: "100vh",
                    overflowY: "auto",
                    zIndex: 999,
                    transition: "all 0.3s ease",
                }}
            >
                {/* Logo and Search */}
                <div className="d-flex justify-content-center align-items-center mb-2">
                    <img src={BuzadsText} alt="Buzads Logo" className="h-12 w-auto" />
                </div>

                {/* Shortcuts */}
                {!collapsed && (
                    <>
                        <h6
                            className="text-uppercase px-2 text-white mb-3 border-bottom border-secondary"
                            style={{ fontSize: "0.9rem" }}
                        >
                            Your Shortcuts
                        </h6>
                        <ul className="nav flex-column">
                            {shortcuts.map(({ name, path, icon }) => (
                                <li className="nav-item mb-2" key={name}>
                                    <CustomNavLink
                                        to={path}
                                        icon={icon}
                                        name={name}
                                    />
                                </li>
                            ))}

                            {/* Logout */}
                            <li className="nav-item mb-2">
                                <button
                                    className="nav-link d-flex align-items-center gap-3 px-2 py-2 rounded text-white bg-transparent border-0 w-100 text-start"
                                    onClick={() => {
                                        closeMobileSidebar();
                                        handleLogout();
                                    }}
                                    style={{ fontSize: "1rem" }}
                                >
                                    <FaSignOutAlt />
                                    {!collapsed && "Logout"}
                                </button>
                            </li>
                        </ul>
                    </>
                )}

                {/* Collapsed Icons Only */}
                {collapsed && (
                    <ul className="nav flex-column">
                        {shortcuts.map(({ name, path, icon }) => (
                            <li className="nav-item mb-2" key={name} title={name}>
                                <CustomNavLink
                                    to={path}
                                    icon={icon}
                                    name=""
                                />
                            </li>
                        ))}

                        {/* Logout (collapsed) */}
                        <li className="nav-item mb-2" title="Logout">
                            <button
                                className="nav-link d-flex align-items-center justify-content-center px-2 py-2 rounded text-white bg-transparent border-0 w-100"
                                onClick={() => {
                                    closeMobileSidebar();
                                    handleLogout();
                                }}
                                style={{ fontSize: "1rem" }}
                            >
                                <FaSignOutAlt />
                            </button>
                        </li>
                    </ul>
                )}
            </div>
        </>
    )
}

export default SidebarDashboard