
import api from "./api";

// Xóa loại nghỉ phép
export async function deleteLeaveType(id) {
	const res = await api.delete(`/api/v1/leave-types/${id}`);
	return res.data;
}

// Lấy danh sách loại nghỉ phép (theo API mới)
export async function getLeaveRequestTypes() {
	const res = await api.get("/api/v1/leave-requests/types");
	return res.data;
}

// Tạo mới loại nghỉ phép
export async function createLeaveType(data) {
	const res = await api.post("/api/v1/leave-types", data);
	return res.data;
}

// Tìm kiếm loại nghỉ phép
export async function searchLeaveTypes(params) {
	const res = await api.get("/api/v1/leave-types/search", { params });
	return res.data;
}

// Lấy chi tiết loại nghỉ phép theo id hoặc code
export async function getLeaveTypeDetail(id) {
	const res = await api.get(`/api/v1/leave-types/${id}`);
	return res.data;
}

// Cập nhật loại nghỉ phép
export async function updateLeaveType(id, data) {
	const res = await api.put(`/api/v1/leave-types/${id}`, data);
	return res.data;
}
