import api from "./api";

// Spec HRM UI v1 §8.1. Các hàm cũ (getPositions, getPositionsByDepartment...) giữ nguyên cho màn hình khác.
const positionService = {
  async getPositions(params = {}) {
    return api.get("/api/v1/positions", { params });
  },
  async getPositionsByDepartment(code) {
    if (!code) throw new Error("Department code is required");
    return api.get(`/api/v1/positions/by-department/${code}`);
  },

  // List phân trang: { keyword, level, isActive, page, size } → { items, page, size, total }
  async search(params = {}) {
    const clean = Object.fromEntries(Object.entries({ page: 1, size: 20, ...params }).filter(([, v]) => v !== "" && v != null));
    const res = await api.get("/api/v1/positions", { params: clean });
    return res.data?.data;
  },
  // [{ id, name, level, isActive }]
  async options(activeOnly = true) {
    const res = await api.get("/api/v1/positions/options", { params: { activeOnly } });
    return res.data?.data || [];
  },
  // [{ level, label, positions }] – chỉ cấp có chức vụ hoạt động
  async levels() {
    const res = await api.get("/api/v1/positions/levels");
    return res.data?.data || [];
  },
  // { ...position, usedInFlows }
  async getPositionById(id) {
    const res = await api.get(`/api/v1/positions/${id}`);
    return res.data?.data;
  },
  // body { name, level, isActive }
  async createPosition(position) {
    const res = await api.post("/api/v1/positions", position);
    return res.data;
  },
  async updatePosition(id, position) {
    const res = await api.put(`/api/v1/positions/${id}`, position);
    return res.data;
  },
  async deletePosition(id) {
    const res = await api.delete(`/api/v1/positions/${id}`);
    return res.data;
  },
};

export default positionService;
