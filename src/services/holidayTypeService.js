// Lấy danh sách ngày nghỉ lễ theo năm (trả về mảng data)

import api from "./api";


export async function getHolidayList(year) {
	const res = await api.get("/api/v1/holiday_config/search", { params: { year } });
	return res.data?.data || [];
}
// Lấy danh sách ngày nghỉ lễ theo năm
export async function searchHolidays(params) {
	const res = await api.get("/api/v1/holiday_config/search", { params });
	return res.data;
}

// Tạo mới ngày nghỉ lễ
export async function createHoliday(data) {
	const res = await api.post("/api/v1/holiday_config", data);
	return res.data;
}

// Lấy chi tiết ngày nghỉ lễ
export async function getHolidayDetail(id) {
	const res = await api.get(`/api/v1/holiday_config/${id}`);
	return res.data;
}

// Cập nhật ngày nghỉ lễ
export async function updateHoliday(id, data) {
	const res = await api.put(`/api/v1/holiday_config/${id}` , data);
	return res.data;
}

// Xóa ngày nghỉ lễ
export async function deleteHoliday(id) {
	const res = await api.delete(`/api/v1/holiday_config/${id}`);
	return res.data;
}
