// import { axiosInstance } from "../lib/axios";

// const dashboardService  = {
//     userSummery: async () => {
//         try {
//             const res = await axiosInstance.get('/dashboard/userSummery');
//             return res.data;
//         } catch (error) {
//             throw error.response?.data || error;
//         }
//     }
// };



// export default dashboardService;

import { axiosInstance } from "../lib/axios";

const dashboardService = {
    userSummery: async () => {
        try {
            const res = await axiosInstance.get('/dashboard/userSummery');
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    profileReportSummary: async () => {
        try {
            const res = await axiosInstance.get('/dashboard/profileReportSummary');
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    appealSummery: async () => {
        try {
            const res = await axiosInstance.get('/dashboard/appealSummery');
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    messageSummary: async () => {
        try {
            const res = await axiosInstance.get('/dashboard/messageSummery');
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    categorySummery: async () => {
        try {
            const res = await axiosInstance.get('/dashboard/categorySummery');
            return res.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    }
};

export default dashboardService;