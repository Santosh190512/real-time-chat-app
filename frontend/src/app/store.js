import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../redux/auth/authSlice";
import chatReducer from "../redux/chat/chatSlice";
import messageReducer from "../redux/message/messageSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    message: messageReducer,
  },
});
