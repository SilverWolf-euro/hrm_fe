import api from "./api";

export async function getDepartments() {
  const res = await api.get('/api/v1/department');
  return res.data;
}

export async function createDepartment(department) {
  const res = await api.post('/api/v1/department', department);
  return res.data;
}

export async function getDepartmentById(id) {
  const res = await api.get(`/api/v1/department/${id}`);
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


