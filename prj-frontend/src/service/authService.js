import { api } from "../lib/axios";

export const authService = {
  logIn: async (username, password) => {
    username = username?.trim(); //Đề phòng có dấu cách ở đầu hoặc cuối username//
    const res = await api.post(
      "auth/login",
      { username, password },
      { withCredentials: true }
    );

    return res.data;
  },

    logOut: async () => {
    const res = await api.post(
      "/auth/logout",
      null,
      { withCredentials: true }
    );

    return res.data;
  },
  
    fetchMe: async () => {
      const res = await api.get("/users/me", {  withCredentials: true})
      return res.data.user;
  },
    refresh: async () => {
      const res = await api.post("/auth/refresh")
      return res.data.accessToken;
    }
};  

export default authService;