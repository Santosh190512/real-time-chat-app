import { createAsyncThunk } from "@reduxjs/toolkit";

import { getProfile, loginUser, phoneLoginUser, registerUser, updateProfile } from "../../api/authApi";
import { storage } from "../../utils/storage";

const getErrorPayload = (err) => err.response?.data || { detail: err.message };

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (formData, thunkAPI) => {
    try {
      const res = await registerUser(formData);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(getErrorPayload(err));
    }
  }
);

export const loginThunk = createAsyncThunk("auth/login", async (formData, thunkAPI) => {
  try {
    const res = await loginUser(formData);
    storage.setTokens(res.data.access, res.data.refresh);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(getErrorPayload(err));
  }
});

export const phoneLoginThunk = createAsyncThunk("auth/phoneLogin", async (formData, thunkAPI) => {
  try {
    const res = await phoneLoginUser(formData);
    storage.setTokens(res.data.access, res.data.refresh);
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(getErrorPayload(err));
  }
});

export const profileThunk = createAsyncThunk("auth/profile", async (_, thunkAPI) => {
  try {
    const res = await getProfile();
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(getErrorPayload(err));
  }
});

export const updateProfileThunk = createAsyncThunk(
  "auth/updateProfile",
  async (data, thunkAPI) => {
    try {
      const res = await updateProfile(data);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(getErrorPayload(err));
    }
  }
);
