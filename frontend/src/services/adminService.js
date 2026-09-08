import api from "./api";

export const adminApi = {
  getMetrics: async () => {
    return (await api.get("/admin/metrics")).data;
  },
  getUsers: async (role) => {
    const params = role ? { role } : {};
    return (await api.get("/admin/users", { params })).data;
  },
  updateUser: async (id, data) => {
    return (await api.put(`/admin/users/${id}`, data)).data;
  },
  deleteUser: async (id) => {
    return (await api.delete(`/admin/users/${id}`)).data;
  },
  getAnalytics: async (params) => {
    return (await api.get("/admin/analytics", { params })).data;
  },
  getSettings: async () => (await api.get("/settings")).data,
  updateSettings: async (data) => (await api.put("/settings", data)).data,
};
