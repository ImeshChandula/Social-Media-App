// src/api/storyAPI.js
import { axiosInstance } from "../lib/axios";
export const getFeedStories = () => {
    return axiosInstance.get("/stories/feed");
};

export const createStory = (formData) => {
    return axiosInstance.post("/stories/createStory", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const getStoryById = (id) => {
    return axiosInstance.get(`/stories/${id}`);
};

export const markStoryAsViewed = (id) => {
    return axiosInstance.put(`/stories/${id}/view`);
};

export const updateStory = (id, updatedData) => {
    return axiosInstance.patch(`/stories/update/${id}`, updatedData);
};

export const deleteStory = (id) => {
    return axiosInstance.delete(`/stories/delete/${id}`);
};