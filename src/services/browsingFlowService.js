import api from "./api";

// Lấy danh sách cấu hình luồng duyệt
export function getApprovalSettings(params) {
  return api.get("/api/v1/approval-settings", { params });
}

// Tạo mới cấu hình duyệt đơn
export function createApprovalSetting(data) {
  return api.post("/api/v1/approval-settings", data);
}

// Lấy danh mục loại đơn
export function getApprovalRequestTypes(params) {
  return api.get("/api/v1/approval-settings/request-types", { params });
}

// Lấy chi tiết cấu hình duyệt theo ID
export function getApprovalSettingDetail(id) {
  return api.get(`/api/v1/approval-settings/${id}`);
}

// Cập nhật cấu hình duyệt theo ID
export function updateApprovalSetting(id, data) {
  return api.put(`/api/v1/approval-settings/${id}`, data);
}

// Xóa cấu hình duyệt theo ID
export function deleteApprovalSetting(id) {
  return api.delete(`/api/v1/approval-settings/${id}`);
}
