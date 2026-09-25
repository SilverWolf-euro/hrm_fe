import api from "./api";

export async function getDepartments() {
  const res = await api.get('/api/v1/department');
  return res.data;
}


