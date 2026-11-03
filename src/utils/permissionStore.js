import jwt_decode from "jwt-decode";

// ========================
// PERMISSION STORE (RAM)
// ========================
// Quyền chỉ lưu trong biến module (RAM), KHÔNG lưu localStorage/cookie.
// Reload trang => RAM bị xoá => cần gọi refreshToken để lấy lại quyền.

let state = {
  loaded: false, // đã lấy được quyền từ token hay chưa
  permissions: [],
  roles: [],
};

const listeners = new Set();

const emit = () => listeners.forEach((listener) => listener());

export const subscribePermissions = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getPermissionState = () => state;

// Giải mã token và nạp quyền vào RAM (BE dùng claim "perms", fallback "permissions")
export const setPermissionsFromToken = (token) => {
  try {
    const decoded = jwt_decode(token);
    state = {
      loaded: true,
      permissions: decoded.perms || decoded.permissions || [],
      roles: decoded.roles || [],
    };
  } catch (error) {
    console.error("[Permission] Invalid token:", error);
    state = { loaded: false, permissions: [], roles: [] };
  }
  emit();
};

export const clearPermissions = () => {
  state = { loaded: false, permissions: [], roles: [] };
  emit();
};
