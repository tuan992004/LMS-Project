import { create } from "zustand"
import { toast } from "sonner"
import { authService } from "../service/authService"

/**
 * @type {import('../type/store').AuthState}
 */
export const useAuthStore = create((set, get) => ({
  accessToken: null,
  user: null,
  loading: false,

  setAccessToken: (accessToken) => {
    set({ accessToken });
  },

  clearState: () => {
    set({ accessToken: null, user: null, loading: false })
  },

  logIn: async (username, password) => {
    username = username?.trim(); //Đề phòng có dấu cách ở đầu hoặc cuối username//
    try {
      set({ loading: true })
      const { accessToken } = await authService.logIn(username, password)

      get().setAccessToken(accessToken)

      const user = await get().fetchMe();

      toast.success("Đăng nhập thành công 🎉!")
      return user;
    } catch (error) {
      set({ loading: false })

      toast.error(
        error?.response?.data?.message || "Invalid username or password"
      )

      throw error
    } finally {
      set({ loading: false })
    }
  },

  logOut: () => {
    try {
      get().clearState();
      authService.logOut();
    } catch (error) {
      toast.error("Lỗi xảy ra khi Đăng xuất, hãy thử lại")
    }
  },

  fetchMe: async () => {
    try {
      set({ loading: true });
      const user = await authService.fetchMe();

      set({ user });
      return user;
    } catch (error) {
      console.error(error)
      set({ user: null, accessToken: null });
      toast.error("Lỗi xảy ra khi lấy dữ liệu người dùng")
    } finally {
      set({ loading: false })
    }
  },

  refresh: async () => {
    try {
      set({ loading: true })
      const { user, fetchMe, setAccessToken } = get();
      const accessToken = await authService.refresh();

      setAccessToken(accessToken)

      if (!user) {
        await fetchMe();
      }
    } catch (error) {
      if (error?.response?.status !== 401) {
        console.error(error);
        toast.error("Phiên đăng nhập đã hết hạn")
      }
      get().clearState();
    } finally {
      set({ loading: false })
    }
  }
}))

