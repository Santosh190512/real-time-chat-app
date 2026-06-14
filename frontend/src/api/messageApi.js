import api from "./axios";

export const getMessages = (roomId) => api.get(`/messages/${roomId}/messages/`);
export const sendMessage = (roomId, data) => api.post(`/messages/${roomId}/messages/`, data);
export const uploadMessage = (roomId, payload) =>
  api.post(`/messages/${roomId}/messages/`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
