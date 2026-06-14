import api from "./axios";

export const getChats = () => api.get("/chats/rooms/");
export const getChat = (roomId) => api.get(`/chats/rooms/${roomId}/`);
export const createChat = (userId) => api.post("/chats/rooms/private/", { user_id: userId });
export const startChatByPhone = (phoneNumber) =>
  api.post("/chats/rooms/start/", { phone_number: phoneNumber });
export const createGroup = (payload) => api.post("/chats/rooms/create_group/", payload);
export const addMember = (roomId, userId) =>
  api.post(`/chats/rooms/${roomId}/add_member/`, { user_id: userId });
export const removeMember = (roomId, userId) =>
  api.post(`/chats/rooms/${roomId}/remove_member/`, { user_id: userId });
export const leaveGroup = (roomId) => api.post(`/chats/rooms/${roomId}/leave_group/`);
