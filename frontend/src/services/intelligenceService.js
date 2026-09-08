import api from "./api";

export const intelligenceApi = {
  getNearestStops: async (lat, lng) => {
    const params = lat && lng ? `?lat=${lat}&lng=${lng}` : "";
    return (await api.get(`/intelligence/nearest-stops${params}`)).data;
  },
  planTrip: async (originStopId, destinationStopId) => {
    return (await api.post("/intelligence/plan-trip", { originStopId, destinationStopId })).data;
  },
  getShuttleEta: async (shuttleId, stopId) => {
    return (await api.get(`/intelligence/eta/${shuttleId}/${stopId}`)).data;
  },
};
