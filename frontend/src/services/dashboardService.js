import { axiosInstance } from "../lib/axios";

const dashboardService  = {
    userSummery: async () => {
        try {
            const res = await axiosInstance.get('/dashboard/userSummery');
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default dashboardService;