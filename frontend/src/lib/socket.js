import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_APP_NODE_ENV === 'development'
    ? import.meta.env.VITE_APP_DEVELOPMENT_API_URL
    : import.meta.env.VITE_APP_PRODUCTION_API_URL

const socket = io(API_URL, {
    withCredentials: true,
});

export default socket;