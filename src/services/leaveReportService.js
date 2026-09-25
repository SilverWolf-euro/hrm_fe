import api from "./api";

// Lấy báo cáo tổng hợp tình hình sử dụng phép của nhân viên theo năm, hỗ trợ phân trang và lọc theo phòng ban/từ khóa.
export async function getLeaveReportSummary({ year, month, department_code, keywords, page = 1, size = 10 }) {
  const params = {};
  if (year) params.year = year;
  if (month) params.month = month;
  if (department_code) params.department_code = department_code;
  if (keywords) params.keywords = keywords;
  if (page) params.page = page;
  if (size) params.size = size;
  const res = await api.get("/api/v1/leave-report/summary", { params });
  return res.data;
}
