import api from "./api";

/**
 * Lấy báo cáo biến động nhân sự
 * @param {string} from_date - yyyy-mm-dd
 * @param {string} to_date - yyyy-mm-dd
 * @param {string} type_report - "tháng" hoặc giá trị khác nếu cần
 * @returns {Promise<any>}
 */
export async function fetchHRMovementReport({ from_date, to_date, type_report = "tháng" }) {
  const url = `/api/v1/report/changes_employee?from_date=${from_date}&to_date=${to_date}&type_report=${type_report}`;
  const res = await api.get(url);
  return res.data;
}

/**
 * Lấy báo cáo chấm công ngày
 * @param {string} date_day - yyyy-mm-dd
 * @returns {Promise<any>}
 */
export async function fetchAttendanceDailyReport(date_day) {
  const url = `/api/v1/report/daily_report?date_day=${date_day}`;
  const res = await api.get(url);
  return res.data;
}