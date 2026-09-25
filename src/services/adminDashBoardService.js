import api from "./api";

export async function getFullProgress(params) {
  const res = await api.post("/api/PO/GetFullProgress", params);
  return res.data;
}

