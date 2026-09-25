import api from "./api";

// Lấy danh sách đơn nghỉ phép toàn công ty (theo quyền)
export async function getAllLeaveRequests({ from_date, to_date, department_code, keywords, status, page = 1, size = 10 }) {
  const params = { from_date, to_date, page, size };
  if (department_code) params.department_code = department_code;
  if (keywords) params.keywords = keywords;
  if (status) params.status = status;
  const res = await api.get("/api/v1/leave-requests/all", { params });
  return res.data?.data || { items: [], total: 0, page: 1, size: 10 };
}
