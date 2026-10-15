import api from "./api";

// ===== Vai trò & chức năng (euro-hrm: /api/v1/auth/...) =====
export function getAllUsersFunction(signal) {
  return api.get("/api/v1/auth/functions", { signal });
}

export function getAllUsersRoles(signal) {
  return api.get("/api/v1/auth/roles", { signal });
}

export function createRolePermission(data) {
  return api.post("/api/v1/auth/roles-permissions", data);
}

export function getRolePermissionById(roleId, signal) {
  return api.get(`/api/v1/auth/roles-permissions/${roleId}`, { signal });
}

export function createUserPermission(data) {
  return api.post("/api/v1/auth/user-permissions", data);
}

export function getUserPermissionById(userId, signal) {
  return api.get(`/api/v1/auth/user-permissions/${userId}`, { signal });
}

// ===== Tài khoản (euro-hrm: /api/v1/user/...) =====
export function getUserList(signal) {
  return api.get("/api/v1/user", { signal });
}

// body: { email, user_name, password }
export function createUser(data) {
  return api.post("/api/v1/user/create", data);
}

// body: { email, password } — backend hiện chỉ hỗ trợ đổi mật khẩu theo email
export function updateUserPassword(data) {
  return api.put("/api/v1/user/update", data);
}
