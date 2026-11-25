import api from "./api";

// Spec HRM UI v1 §8.3
const approvalFlowService = {
  async requestTypes() {
    const res = await api.get("/api/v1/request-types");
    return res.data?.data || [];
  },
  // → { items: [{ id, name, isActive, applicantLevelLabel, requestTypesLabel, departmentsLabel, stepCount }], page, size, total }
  async list(params = {}) {
    const clean = Object.fromEntries(Object.entries({ page: 1, size: 20, ...params }).filter(([, v]) => v !== "" && v != null));
    const res = await api.get("/api/v1/approval-flows", { params: clean });
    return res.data?.data;
  },
  async get(id) {
    const res = await api.get(`/api/v1/approval-flows/${id}`);
    return res.data?.data;
  },
  // body: { name, isActive, applicantLevel, allRequestTypes, requestTypes, allDepartments, departmentIds, steps }
  async create(body) {
    const res = await api.post("/api/v1/approval-flows", body);
    return res.data?.data;
  },
  async update(id, body) {
    const res = await api.put(`/api/v1/approval-flows/${id}`, body);
    return res.data?.data;
  },
};

export default approvalFlowService;
