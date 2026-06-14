import api from "./axios";

export const registerUser = (data) => api.post("/accounts/register/", data);
export const loginUser = (data) => api.post("/token/", data);
export const phoneLoginUser = (data) => api.post("/accounts/phone-login/", data);
export const getProfile = () => api.get("/accounts/profile/");
export const updateProfile = (data) => api.patch("/accounts/profile/", data);
export const getUsers = () => api.get("/accounts/users/");
export const searchUsers = (query) => api.get(`/accounts/search/?q=${query}`);
export const changePassword = (data) => api.post("/accounts/change-password/", data);
export const logoutUser = () => api.post("/accounts/logout/");
