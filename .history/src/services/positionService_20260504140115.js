import api from "./api";

const positionService = {
  async getPositions(params = {}) {
    return api.get("/api/v1/positions", { params });
  },
  async getPositionsByDepartment(code) {
    if (!code) throw new Error("Department code is required");
    return api.get(`/api/v1/positions/by-department/${code}`);
  },
  // Thêm các hàm khác nếu cần
};

export default positionService;
