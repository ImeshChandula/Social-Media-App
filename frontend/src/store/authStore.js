import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { clearCookiesForAllDomains } from "../config/domain.config";

const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,
    isLoggingIn: false,
    isSigningUp: false,
    isUpdating: false,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/checkCurrent");

            set({ authUser: res.data });
            console.log("Auth user set:", res.data);
        } catch (error) {
            console.log("Error in checkAuth: ", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });

        try {
            if (!data.email || !data.password) {
                throw new Error("Email and password are required");
            }

            const res = await axiosInstance.post("/auth/login", data);
            if (res.data && res.data.user) {
                set({ authUser: res.data.user });
                toast.success(res.data.message);
                return res.data;
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.response.data.message);
        } finally {
            set({ isLoggingIn: false });
        }
    },

    register: async (data) => {
        set({ isSigningUp: true });

        try {
            const res = await axiosInstance.post("/auth/register", data);

            if (res.data && res.data.newUser && res.data.success) {
                set({ authUser: res.data.newUser })
                toast.success(res.data.message);
                return res.data;
            } else {
                throw new Error("Invalid response from server");
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                "Failed to create account. Please try again.";
            toast.error(errorMessage);
            throw error;
        } finally {
            set({ isSigningUp: false });
        }
    },

    logout: async () => {
        try {
            try {
                await axiosInstance.post("/auth/logout");
            // eslint-disable-next-line no-unused-vars
            } catch (err) {
                console.warn('Backend logout failed, proceeding with frontend cleanup');
            }
            
            clearCookiesForAllDomains('jwt');

            localStorage.removeItem('jwt');
            localStorage.removeItem('authToken');
            sessionStorage.removeItem('jwt');
            sessionStorage.removeItem('authToken');

            set({ authUser: null });

            setTimeout(() => {
                window.location.href = '/login';
            }, 500);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Logout failed';
            toast.error(errorMsg);

            set({ authUser: null });
        }
    },
}));

export default useAuthStore;