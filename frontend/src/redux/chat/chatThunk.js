import { createAsyncThunk } from "@reduxjs/toolkit";

import { addMember, createChat, createGroup, getChats, leaveGroup, removeMember, startChatByPhone } from "../../api/chatApi";

const getErrorPayload = (err) => err.response?.data || { detail: err.message };

export const fetchChatsThunk = createAsyncThunk("chat/fetchChats", async (_, thunkAPI) => {
  try {
    const res = await getChats();
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(getErrorPayload(err));
  }
});

export const createChatThunk = createAsyncThunk("chat/createChat", async (userId, thunkAPI) => {
  try {
    const res = await createChat(userId);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(getErrorPayload(err));
  }
});

export const startChatByPhoneThunk = createAsyncThunk("chat/startChatByPhone", async (phoneNumber, thunkAPI) => {
  try {
    const res = await startChatByPhone(phoneNumber);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(getErrorPayload(err));
  }
});

export const createGroupThunk = createAsyncThunk("chat/createGroup", async (payload, thunkAPI) => {
  try {
    const res = await createGroup(payload);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(getErrorPayload(err));
  }
});

export const addMemberThunk = createAsyncThunk(
  "chat/addMember",
  async ({ roomId, userId }, thunkAPI) => {
    try {
      await addMember(roomId, userId);
      const res = await getChats();
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(getErrorPayload(err));
    }
  }
);

export const removeMemberThunk = createAsyncThunk(
  "chat/removeMember",
  async ({ roomId, userId }, thunkAPI) => {
    try {
      await removeMember(roomId, userId);
      const res = await getChats();
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(getErrorPayload(err));
    }
  }
);

export const leaveGroupThunk = createAsyncThunk("chat/leaveGroup", async (roomId, thunkAPI) => {
  try {
    await leaveGroup(roomId);
    return roomId;
  } catch (err) {
    return thunkAPI.rejectWithValue(getErrorPayload(err));
  }
});
