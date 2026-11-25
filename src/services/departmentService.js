import api from "./api";

// Danh sách đầy đủ (mảng) – dùng cho các màn hình cũ
export async function getDepartments() {
  const res = await api.get("/api/v1/department");
  return res.data;
}

// Spec HRM UI v1 §8.2 – list phân trang: { keyword, area, isActive, page, size } → { items, page, size, total }
export async function searchDepartments(params = {}) {
  const clean = Object.fromEntries(Object.entries({ page: 1, size: 20, ...params }).filter(([, v]) => v !== "" && v != null));
  const res = await api.get("/api/v1/department", { params: clean });
  return res.data?.data;
}

// [{ id, code, name, parentId, isActive }] – excludeId loại chính nó + con cháu; includeId luôn giữ
export async function getDepartmentOptions({ activeOnly = true, excludeId, includeId } = {}) {
  const params = { activeOnly };
  if (excludeId) params.excludeId = excludeId;
  if (includeId) params.includeId = includeId;
  const res = await api.get("/api/v1/department/options", { params });
  return res.data?.data || [];
}

// Cây phòng ban kèm employeeCount (gồm phòng ban con)
export async function getDepartmentTree() {
  const res = await api.get("/api/v1/department/tree");
  return res.data?.data || [];
}

// { ...department, positionIds }
export async function getDepartmentById(id) {
  const res = await api.get(`/api/v1/department/${id}`);
  return res.data;
}

// body { parentId, name, area, isActive, positionIds }
export async function createDepartment(department) {
  const res = await api.post("/api/v1/department", department);
  return res.data;
}

export async function updateDepartment(id, department) {
  const res = await api.put(`/api/v1/department/${id}`, department);
  return res.data;
}

export async function deleteDepartment(id) {
  const res = await api.delete(`/api/v1/department/${id}`);
  return res.data;
}

export const AREA_OPTIONS = [
  { value: "HN_OFFICE", label: "Văn phòng Hà Nội", short: "Văn phòng HN" },
  { value: "FACTORY", label: "Nhà máy", short: "Nhà máy" },
];

export const areaShortLabel = (v) => AREA_OPTIONS.find((a) => a.value === v)?.short || "-";
