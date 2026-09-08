import api from "./api";

export const stopsApi = {
  getAll: async () => (await api.get("/stops")).data,
  getById: async (id) => (await api.get(`/stops/${id}`)).data,
  create: async (data) => (await api.post("/stops", data)).data,
  update: async (id, data) => (await api.put(`/stops/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/stops/${id}`)).data,
};

export const routesApi = {
  getAll: async () => (await api.get("/routes")).data,
  getById: async (id) => (await api.get(`/routes/${id}`)).data,
  create: async (data) => (await api.post("/routes", data)).data,
  update: async (id, data) => (await api.put(`/routes/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/routes/${id}`)).data,
};

export const shuttlesApi = {
  getAll: async () => (await api.get("/shuttles")).data,
  getById: async (id) => (await api.get(`/shuttles/${id}`)).data,
  create: async (data) => (await api.post("/shuttles", data)).data,
  update: async (id, data) => (await api.put(`/shuttles/${id}`, data)).data,
  updateStatus: async (id, data) => (await api.patch(`/shuttles/${id}/telemetry`, data)).data,
  resolveBreakdown: async (id) => (await api.post(`/shuttles/${id}/breakdown/resolve`)).data,
  disable: async (id) => (await api.post(`/shuttles/${id}/breakdown/disable`)).data,
  delete: async (id) => (await api.delete(`/shuttles/${id}`)).data,
};

export const driverApi = {
  getAssignedShuttle: async () => (await api.get("/drivers/me/shuttle")).data,
  getTrip: async () => (await api.get("/drivers/me/trip")).data,
  startTrip: async () => (await api.post("/drivers/me/trip/start")).data,
  endTrip: async () => (await api.post("/drivers/me/trip/end")).data,
  report: async (data) => (await api.post("/drivers/me/report", data)).data,
  markStopReached: async () => (await api.post("/drivers/me/stop/reached")).data,
};

export const driversApi = {
  getAll: async () => (await api.get("/drivers")).data,
  getById: async (id) => (await api.get(`/drivers/${id}`)).data,
  create: async (data) => (await api.post("/drivers", data)).data,
  update: async (id, data) => (await api.put(`/drivers/${id}`, data)).data,
  delete: async (id) => (await api.delete(`/drivers/${id}`)).data,
};

export const alertsApi = {
  getAll: async () => (await api.get("/alerts")).data,
  create: async (data) => (await api.post("/alerts", data)).data,
  delete: async (id) => (await api.delete(`/alerts/${id}`)).data,
};
