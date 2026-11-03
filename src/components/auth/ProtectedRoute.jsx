import React from "react";
import { Navigate } from "react-router-dom";
import { usePermissions } from "../../utils/auth";
import { DEFAULT_ROUTE } from "../../constants/menuConfig";

const ProtectedRoute = ({ element, requiredPermission }) => {
  const { loaded, hasPermission } = usePermissions();

  if (!localStorage.getItem("accessToken")) {
    return <Navigate to="/login" replace />;
  }

  // Quyền chưa có trong RAM (vd: reload trang) => chờ refreshToken nạp lại quyền
  if (!loaded) return null;

  if (!hasPermission(requiredPermission)) {
    // Không có quyền => chuyển về trang mặc định
    return <Navigate to={DEFAULT_ROUTE} replace />;
  }

  return element;
};

export default ProtectedRoute;
