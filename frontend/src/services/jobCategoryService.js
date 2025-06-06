import { axiosInstance } from "../lib/axios";

const jobCategoryService  = {
    
    getActiveCategories: async () => {
        try {
            const response = await axiosInstance.get('/jobCategories/active');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
  
    getAllCategories: async () => {
        try {
            const response = await axiosInstance.get('/jobCategories/getAll');
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    createCategory: async (categoryData) => {
        try {
            const response = await axiosInstance.post('/jobCategories/create', categoryData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateCategory: async (id, categoryData) => {
        try {
            const response = await axiosInstance.patch(`/jobCategories/update/${id}`, categoryData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deleteCategory: async (id) => {
        try {
            const response = await axiosInstance.delete(`/jobCategories/delete/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deactivateCategory: async (id) => {
        try {
            const response = await axiosInstance.patch(`/jobCategories/update/${id}`, {
                isActive: false
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    activateCategory: async (id) => {
        try {
            const response = await axiosInstance.patch(`/jobCategories/update/${id}`, {
                isActive: true
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
}

export default jobCategoryService ;