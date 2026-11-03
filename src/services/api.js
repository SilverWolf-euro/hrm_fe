
import axios from "axios";
import jwt_decode from "jwt-decode";
import { setPermissionsFromToken, clearPermissions } from "../utils/permissionStore";

// ========================
// LOGOUT FUNCTION
// ========================
export const logout = () => {
  localStorage.removeItem("accessToken");
  clearPermissions();
  window.location.href = "/login";
};

const api = axios.create({
  baseURL: process.env.REACT_APP_BASE_API,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ========================
// REFRESH CONTROL
// ========================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// ========================
// FUNCTION REFRESH TOKEN
// ========================
// Dùng chung 1 promise để các nơi gọi đồng thời (interceptor, nạp quyền) chỉ refresh 1 lần
let refreshPromise = null;

export const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = doRefreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

const doRefreshAccessToken = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    logout();
    return Promise.reject(new Error("No token"));
  }

  console.log("[API] Pre-refresh token:", token);

  const res = await axios.post(
    `${process.env.REACT_APP_BASE_API}/api/v1/refreshToken`,
    null,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const newToken = res.data?.access_token || res.data;

  if (!newToken) throw new Error("No new token");

  localStorage.setItem("accessToken", newToken);
  api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
  // Token mới mang quyền mới nhất từ DB => nạp lại vào RAM
  setPermissionsFromToken(newToken);

  return newToken;
};

// ========================
// REQUEST INTERCEPTOR
// ========================
api.interceptors.request.use(
  async (config) => {
    // Không xử lý token cho các API đăng nhập hoặc refresh token
    if (config.url && (config.url.includes("/login") || config.url.includes("/refreshToken"))) {
      return config;
    }

    let token = localStorage.getItem("accessToken");

    if (!token) return config;

    try {
      const decoded = jwt_decode(token);
      const now = Date.now() / 1000;
      const remainingTime = decoded.exp - now;

      // 👉 chỉ refresh khi còn < 2 phút
      if (remainingTime < 2 * 60) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const newToken = await refreshAccessToken();
            processQueue(null, newToken);
            token = newToken;
          } catch (err) {
            processQueue(err, null);
            logout();
            throw err;
          } finally {
            isRefreshing = false;
          }
        } else {
          // nếu đang refresh thì chờ
          token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
        }
      }
    } catch (err) {
      console.log("[API] Decode/refresh error:", err);
      logout();
      return Promise.reject(err);
    }

    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ========================
// RESPONSE INTERCEPTOR
// ========================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 403: quyền trong token có thể đã cũ => refreshToken lấy quyền mới, thử lại 1 lần
    if (error.response?.status === 403 && !originalRequest._permRetry) {
      originalRequest._permRetry = true;
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(error);
      }
    }

    if (!error.response || error.response.status !== 401) {
      return Promise.reject(error);
    }

    // tránh loop vô hạn
    if (originalRequest._retry) {
      logout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers["Authorization"] = "Bearer " + token;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken();

      processQueue(null, newToken);

      originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      logout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;