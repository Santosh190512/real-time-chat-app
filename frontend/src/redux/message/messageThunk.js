import { createAsyncThunk } from "@reduxjs/toolkit";

import { getMessages, sendMessage } from "../../api/messageApi";

const getErrorPayload = (err) => err.response?.data || { detail: err.message };

export const fetchMessagesThunk = createAsyncThunk(
  "message/fetchMessages",
  async (conversationId, thunkAPI) => {
    try {
      const res = await getMessages(conversationId);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(getErrorPayload(err));
    }
  }
);

export const sendMessageThunk = createAsyncThunk(
  "message/sendMessage",
  async ({ conversationId, data }, thunkAPI) => {
    try {
      const res = await sendMessage(conversationId, data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(getErrorPayload(err));
    }
  }
);
