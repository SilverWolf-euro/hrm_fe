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

  async createPosition(position) {
    const res = await api.post('/api/v1/positions', position);
    return res.data;
  },
  async getPositionById(id) {
    const res = await api.get(`/api/v1/positions/${id}`);
    return res.data;
  },
  async updatePosition(id, position) {
    const res = await api.put(`/api/v1/positions/${id}`, position);
    return res.data;
  },
  async deletePosition(id) {
    const res = await api.delete(`/api/v1/positions/${id}`);
    return res.data;
  }


};

export default positionService;
