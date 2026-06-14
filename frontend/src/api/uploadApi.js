import { uploadMessage } from "./messageApi";

export const uploadChatFile = async (roomId, payload) => {
  const response = await uploadMessage(roomId, payload);
  return response.data;
};
