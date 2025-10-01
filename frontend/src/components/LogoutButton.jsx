import React from "react";
import { FaSignOutAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import useAuthStore from "../store/authStore";
import useThemeStore from "../store/themeStore";
import toast from "react-hot-toast";

function LogoutButton({ className = "", style = {}, onAfterLogout }) {
    const { logout } = useAuthStore();
    const { isDarkMode } = useThemeStore();
    const MySwal = withReactContent(Swal);

    const handleLogout = async () => {
        const result = await MySwal.fire({
            title: "Are you sure?",
            text: "You will be logged out from your account.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Logout",
            cancelButtonText: "Cancel",
            background: isDarkMode ? "#1f2937" : "#ffffff",
            color: isDarkMode ? "#f9fafb" : "#111827",
            customClass: {
                popup: "swal2-popup-custom",
                title: "swal2-title-custom",
                htmlContainer: "swal2-html-custom",
                confirmButton: "swal2-confirm-custom",
                cancelButton: "swal2-cancel-custom",
            },
            heightAuto: false,
        });

        if (!result.isConfirmed) return;

        try {
            await logout();
            toast.success("Logged out successfully!");
            if (onAfterLogout) onAfterLogout();
        } catch (error) {
            console.error("Logout failed:", error);
            toast.error("Logout failed. Please try again.");
        }
    };

    return (
        <button
            className={`nav-link d-flex align-items-center gap-3 px-2 py-2 rounded bg-transparent border-0 w-100 text-start ${className}`}
            onClick={handleLogout}
            style={{ fontSize: "1rem", ...style }}
        >
            <FaSignOutAlt /> Logout
        </button>
    );
}

export default LogoutButton;
