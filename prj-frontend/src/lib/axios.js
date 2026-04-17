import axios from "axios";
import { useAuthStore } from "../stores/userAuthStore";

export const api = axios.create({
    baseURL: import.meta.env.MODE === 'development' ? "http://localhost:5001/api" : "/api",
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const { accessToken } = useAuthStore.getState();

    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
})

//tự động gọi refresh api khi access token hết hạn
api.interceptors.response.use((res) => res, async (error) => {
    const originalRequest = error.config;

    //Những api không cần check
    //Những api không cần check
    // Prevent infinite loop: Don't refresh if the failed request was ALREADY a login or refresh attempt
    if (originalRequest.url.includes("auth/login") || originalRequest.url.includes("auth/refresh")) {
        return Promise.reject(error);
    }

    originalRequest._retryCount = originalRequest._retryCount || 0;

    if (error.response?.status === 403) {
        window.location.href = "/unauthorized";
        return Promise.reject(error);
    }

    if (error.response?.status === 401 && originalRequest._retryCount < 4) {
        originalRequest._retryCount += 1;
        try {
            const res = await api.post("/auth/refresh");
            const newAccessToken = res.data.accessToken;

            useAuthStore.getState().setAccessToken(newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
            return api(originalRequest);
        } catch (refreshError) {
            useAuthStore.getState().clearState();
            return Promise.reject(refreshError);
        }
    }

    return Promise.reject(error);
})