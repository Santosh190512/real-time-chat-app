import { createSlice } from "@reduxjs/toolkit";
import {
  addMemberThunk,
  createChatThunk,
  createGroupThunk,
  fetchChatsThunk,
  leaveGroupThunk,
  removeMemberThunk,
  startChatByPhoneThunk,
} from "./chatThunk";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: [],
    activeChat: null,
    loading: false,
    error: null,
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    updateChatFromMessage: (state, action) => {
      const message = action.payload;
      const chat = state.chats.find((item) => item.id === message.room);
      if (!chat) return;

      chat.last_message = {
        id: message.id,
        content: message.content,
        sender: message.sender,
        sender_name: message.sender_display_name || message.sender_name,
        created_at: message.created_at,
      };

      state.chats = [chat, ...state.chats.filter((item) => item.id !== message.room)];
      if (state.activeChat?.id === message.room) {
        state.activeChat = chat;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatsThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload.results || action.payload;
      })
      .addCase(fetchChatsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createChatThunk.fulfilled, (state, action) => {
        state.activeChat = action.payload;
        const exists = state.chats.some((chat) => chat.id === action.payload.id);
        if (!exists) {
          state.chats.unshift(action.payload);
        }
      })
      .addCase(startChatByPhoneThunk.fulfilled, (state, action) => {
        state.activeChat = action.payload;
        const exists = state.chats.some((chat) => chat.id === action.payload.id);
        if (!exists) {
          state.chats.unshift(action.payload);
        }
      })
      .addCase(createGroupThunk.fulfilled, (state, action) => {
        state.activeChat = action.payload;
        state.chats.unshift(action.payload);
      })
      .addCase(addMemberThunk.fulfilled, (state, action) => {
        state.chats = action.payload.results || action.payload;
      })
      .addCase(removeMemberThunk.fulfilled, (state, action) => {
        state.chats = action.payload.results || action.payload;
      })
      .addCase(leaveGroupThunk.fulfilled, (state, action) => {
        state.chats = state.chats.filter((chat) => chat.id !== action.payload);
        if (state.activeChat?.id === action.payload) {
          state.activeChat = null;
        }
      });
  },
});

export const { setActiveChat, updateChatFromMessage } = chatSlice.actions;

export default chatSlice.reducer;
