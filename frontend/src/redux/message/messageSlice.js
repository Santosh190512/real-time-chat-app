import { createSlice } from "@reduxjs/toolkit";
import { fetchMessagesThunk, sendMessageThunk } from "./messageThunk";

const messageSlice = createSlice({
  name: "message",
  initialState: {
    messages: [],
    typingUsers: [],
    loading: false,
    error: null,
  },
  reducers: {
    addRealtimeMessage: (state, action) => {
      const exists = state.messages.some((message) => message.id === action.payload.id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    addSocketMessage: (state, action) => {
      const exists = state.messages.some((message) => message.id === action.payload.id);
      if (!exists) {
        state.messages.push(action.payload);
      }
    },
    addTypingUser: (state, action) => {
      if (!state.typingUsers.includes(action.payload)) {
        state.typingUsers.push(action.payload);
      }
    },
    clearTypingUsers: (state) => {
      state.typingUsers = [];
    },
    updateMessageStatus: (state, action) => {
      const msg = state.messages.find((message) => message.id === action.payload.id);
      if (msg) {
        msg.status = action.payload.status;
      }
    },
    clearMessages: (state) => {
      state.messages = [];
      state.typingUsers = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessagesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessagesThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.results || action.payload;
      })
      .addCase(fetchMessagesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendMessageThunk.fulfilled, (state, action) => {
        const exists = state.messages.some((message) => message.id === action.payload.id);
        if (!exists) {
          state.messages.push(action.payload);
        }
      });
  },
});

export const {
  addRealtimeMessage,
  addSocketMessage,
  addTypingUser,
  clearMessages,
  clearTypingUsers,
  updateMessageStatus,
} = messageSlice.actions;

export default messageSlice.reducer;
