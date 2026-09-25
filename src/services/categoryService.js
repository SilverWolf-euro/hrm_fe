// src/services/categoryService.js
import api from "./api";

const API = "/api/Category";


export async function getAllCategories() {
  const res = await api.get(`${API}/GetAllCategories`);
  return Array.isArray(res.data) ? res.data : [];
}


export async function getCategoryById(id) {
  const res = await api.get(`${API}/GetCategoryById/${id}`);
  return res.data ?? {};
}

export async function insertCategory(category) {
  const res = await api.post(`${API}/InsertCategory`, category);
  return res.data ?? {};
}

export async function updateCategory(id, category) {
  const payload = {
    categoryCode: category.categoryCode,
    categoryName: category.categoryName,
    description: category.description,
    status: category.status ?? 0,
    type: category.type ?? 0,
    updateAt: new Date().toISOString(),
    isDelete: category.isDelete ?? 0,
  };
  const res = await api.put(`${API}/UpdateCategory/${id}`, payload);
  return res.data ?? {};
}

export async function deleteCategory(id) {
  await api.delete(`${API}/DeleteCategory/${id}`);
  return true;
}
