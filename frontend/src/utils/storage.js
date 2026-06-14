export const storage = {
  getAccessToken: () => localStorage.getItem("access"),
  getRefreshToken: () => localStorage.getItem("refresh"),
  setTokens: (access, refresh) => {
    localStorage.setItem("access", access);
    localStorage.setItem("refresh", refresh);
  },
  clearTokens: () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  },
};
