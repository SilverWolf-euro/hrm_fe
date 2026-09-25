import api from "./api";


export async function getAllCategories2() {
  const res = await api.get("/api/Category/GetAllCategories2");
  return res.data?.object || [];
}


export async function getCommonByCategoryId(categoryId) {
  const res = await api.get(`/api/Common/GetCommonByCategoryId/${categoryId}`);
  return res.data?.object || [];
}

export async function insertCommon(common) {
  const res = await api.post("/api/Common/InsertCommon", common);
  return res.data;
}

export async function updateCommon(common) {
  const res = await api.post("/api/Common/UpdateCommon", common);
  return res.data;
}
