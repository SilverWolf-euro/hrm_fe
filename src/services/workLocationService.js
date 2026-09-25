import api from "./api";

// Lấy danh sách địa điểm làm việc
export const searchWorkLocation = async () => {
  const res = await api.get("/api/v1/employee/search_work_location");
  return res.data;
};

