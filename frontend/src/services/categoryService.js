import { axiosInstance } from "../lib/axios";

const CategoryService  = {
    
    getActiveCategories: async () => {
        try {
            const field = "job_role";
            const response = await axiosInstance.get(`/categories/active/${field}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
  
    getAllCategories: async () => {
        try {
            const field = "job_role";
            const response = await axiosInstance.get(`/categories/getAll/${field}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    createCategory: async (categoryData) => {
        try {
            const response = await axiosInstance.post('/categories/create', categoryData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    updateCategory: async (id, categoryData) => {
        try {
            const response = await axiosInstance.patch(`/categories/update/${id}`, categoryData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deleteCategory: async (id) => {
        try {
            const response = await axiosInstance.delete(`/categories/delete/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    deactivateCategory: async (id) => {
        try {
            const response = await axiosInstance.patch(`/categories/update/${id}`, {
                isActive: false
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },

    activateCategory: async (id) => {
        try {
            const response = await axiosInstance.patch(`/categories/update/${id}`, {
                isActive: true
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error;
        }
    },
}

export default CategoryService ;