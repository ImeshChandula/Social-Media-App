import { axiosInstance } from "../lib/axios";

export const getAllSuggestedFriends = () =>
    axiosInstance.get("/friends/allSuggestFriends");

export const sendFriendRequest = (id) =>
    axiosInstance.post(`/friends/friend-request/send/${id}`);

export const acceptFriendRequest = (id) =>
    axiosInstance.post(`/friends/friend-request/accept/${id}`);

export const rejectFriendRequest = (id) =>
    axiosInstance.post(`/friends/friend-request/reject/${id}`);

export const getAllPendingRequests = () =>
    axiosInstance.get(`/friends/friend-requests/getAll`);

export const getAllFriends = () =>
    axiosInstance.get(`/friends/allFriends`);

export const removeFriend = (id) =>
    axiosInstance.delete(`/friends/removeFriend/${id}`);