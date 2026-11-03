import { useEffect, useSyncExternalStore } from "react";
import { refreshAccessToken, logout } from "../services/api";
import {
  getPermissionState,
  subscribePermissions,
} from "./permissionStore";

const ADMIN = "admin";

// Lấy danh sách quyền từ RAM (đã giải mã từ JWT)
export const getUserPermissionsFromToken = () => getPermissionState().permissions;

const isAdmin = ({ permissions, roles }) =>
  permissions.includes(ADMIN) ||
  roles.some((role) => String(role).toLowerCase() === ADMIN);

export const hasPermission = (requiredPermission) => {
  if (!requiredPermission) return true; // Không yêu cầu quyền => luôn cho qua

  const current = getPermissionState();
  if (isAdmin(current)) return true; // Admin có mọi quyền

  return current.permissions.includes(requiredPermission);
};

// Mất quyền trong RAM (reload trang, ...) => gọi refreshToken để lấy lại quyền
export const ensurePermissions = async () => {
  if (getPermissionState().loaded) return;
  if (!localStorage.getItem("accessToken")) return;

  try {
    await refreshAccessToken();
  } catch (err) {
    console.error("[Permission] Không lấy lại được quyền:", err);
    logout();
  }
};

// Hook: re-render khi quyền trong RAM thay đổi; tự gọi lấy lại quyền nếu chưa có
export const usePermissions = () => {
  const state = useSyncExternalStore(subscribePermissions, getPermissionState);

  useEffect(() => {
    if (!state.loaded) ensurePermissions();
  }, [state.loaded]);

  return { loaded: state.loaded, permissions: state.permissions, hasPermission };
};
