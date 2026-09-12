import { create } from "zustand";
import {
  loginApi,
  registerApi,
  logoutApi,
  getMeApi,
  updateProfileApi,
} from "../services/authService";

const initialToken = localStorage.getItem("token") || null;

export const useAuthStore = create((set, get) => ({
  user: null,
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
  isLoading: Boolean(initialToken),
  error: null,
  toastMessage: null,

  clearError: () => set({ error: null }),
  clearToast: () => set({ toastMessage: null }),

  updateFavorites: (type, favorites) => {
    const field = type === "route" ? "favoriteRoutes" : type === "stop" ? "favoriteStops" : "favoriteShuttles";
    set((state) => ({ user: state.user ? { ...state.user, [field]: favorites } : state.user }));
  },

  setToast: (msg) => {
    set({ toastMessage: msg });
    setTimeout(() => {
      set({ toastMessage: null });
    }, 4000);
  },

  fetchMe: async () => {
    const { token } = get();
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const res = await getMeApi();
      if (res.success && res.data?.user) {
        set({
          user: res.data.user,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        localStorage.removeItem("token");
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (_err) {
      localStorage.removeItem("token");
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await loginApi(email, password);
      if (res.success && res.data?.token) {
        const { token, user } = res.data;
        localStorage.setItem("token", token);
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          toastMessage: `Welcome back, ${user.name}!`,
        });
        return { success: true, user };
      } else {
        const msg = res.message || "Login failed";
        set({ error: msg, isLoading: false });
        return { success: false, error: msg };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to log in";
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  register: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const res = await registerApi(formData);
      if (res.success && res.data?.token) {
        const { token, user } = res.data;
        localStorage.setItem("token", token);
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          toastMessage: `Account created! Welcome, ${user.name}`,
        });
        return { success: true, user };
      } else {
        const msg = res.message || "Registration failed";
        set({ error: msg, isLoading: false });
        return { success: false, error: msg };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to register";
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  logout: async () => {
    try {
      await logoutApi();
    } catch (_err) {
      // ignore
    } finally {
      localStorage.removeItem("token");
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        toastMessage: "Successfully logged out.",
      });
    }
  },

  updateProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await updateProfileApi(data);
      if (res.success && res.data?.user) {
        set({
          user: res.data.user,
          isLoading: false,
          toastMessage: "Profile updated successfully!",
        });
        return { success: true, user: res.data.user };
      } else {
        const msg = res.message || "Profile update failed";
        set({ error: msg, isLoading: false });
        return { success: false, error: msg };
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to update profile";
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },
}));
