import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const useAuthStore = create((set) => ({
    authUser: null,
    isCheckingAuth: true,
    isLoggingIn: false,

    checkAuth: async() => {
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

    login: async(data) => {
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
    
}));

export default useAuthStore;