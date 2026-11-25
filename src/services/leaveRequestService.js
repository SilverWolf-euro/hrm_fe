import api from "./api";

// Lấy danh sách đơn xin nghỉ của nhân viên hiện tại
export async function getMyLeaveRequests() {
  const res = await api.get("/api/v1/leave-requests/me");
  return res.data?.data || [];
}

// Tạo đơn xin nghỉ
export async function createLeaveRequest(formData) {
  // formData là instance của FormData đã append các trường
  const res = await api.post("/api/v1/leave-requests", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// Lấy chi tiết đơn xin nghỉ
export async function getLeaveRequestDetail(code) {
  const res = await api.get(`/api/v1/leave-requests/${code}`);
  return res.data?.data;
}

/**
 * Phê duyệt hoặc từ chối đơn nghỉ phép
 * @param {string} code - Mã đơn nghỉ
 * @param {string} action - 'APPROVED' hoặc 'REJECTED'
 * @param {string} comment - Lý do hoặc nhận xét
 * @returns {Promise}
 */
export function approveOrRejectLeaveRequest(code, action, comment) {
  return api.patch(`/api/v1/leave-requests/${code}/status`, {
    action,
    comment,
  });
}

// Engine luồng duyệt mới (Spec HRM UI v1 §8.4)
export function approveLeaveRequestV2(code, note) {
  return api.post(`/api/v1/leave-requests/${code}/approve`, { note: note || "" });
}

export function rejectLeaveRequestV2(code, note) {
  return api.post(`/api/v1/leave-requests/${code}/reject`, { note });
}

export async function getPendingMyApproval({ page = 1, size = 20 } = {}) {
  const res = await api.get("/api/v1/leave-requests/pending-my-approval", { params: { page, size } });
  return res.data?.data || { items: [], total: 0, page, size };
}

export function recallLeaveRequest(code) {
  return api.patch(`/api/v1/leave-requests/${code}/recall`);
}