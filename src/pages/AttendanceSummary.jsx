import React, { useEffect, useState } from "react";
import { searchWorkLocation } from "../services/workLocationService";
import workShiftService from "../services/workShiftService";

function getFirstDayOfMonth(year, month) {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

const columns = [
  "STT", "Mã NV", "Họ và tên", "Chức vụ", "Công TV", "Công CT", "Ngày phép", "Ngày nghỉ chế độ", "Ngày lễ", "Giờ ngày thường", "Giờ ngày nghỉ", "Giờ ngày lễ", "Tổng số ngày hưởng lương", "Hỗ trợ ăn giữa ca"
];

export default function AttendanceSummary({ onClose, area }) {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    searchWorkLocation().then(res => {
      setLocations(res);
      // Ưu tiên chọn khu vực theo props area nếu có
      if (res.length > 0) {
        let matched = null;
        if (area) {
          matched = res.find(loc => {
            if (typeof loc.name === "string") {
              return (area === "Văn phòng" && loc.name.includes("Văn phòng")) ||
                     (area === "Nhà máy" && loc.name.includes("Nhà máy"));
            }
            return false;
          });
        }
        setSelectedLocation((matched && (matched.id || matched.worklocation_id)) || res[0].id || res[0].worklocation_id || "");
      }
    });
  }, [area]);

  const fetchData = async () => {
    if (!selectedLocation) return;
    setLoading(true);
    const dateSum = getFirstDayOfMonth(year, month);
    try {
      const res = await workShiftService.getAttendanceSummary(dateSum, selectedLocation);
      setData(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [selectedLocation, year, month]);

  const handleExport = () => {
    // Xuất excel đơn giản: chuyển table thành CSV
    let csv = columns.join(",") + "\n";
    data.forEach((row, idx) => {
      csv += [
        idx + 1,
        row.employee_code,
        row.employee_name,
        row.position,
        row.probation_days,
        row.official_days,
        row.leave_days,
        row.benefit_days,
        row.holiday_days,
        row.ot_normal,
        row.ot_weekend,
        row.ot_holiday,
        row.total_paid_days,
        row.meal_support
      ].join(",") + "\n";
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_summary_${year}_${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-6xl relative">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-bold">Bảng tổng hợp công Văn phòng - Tháng {month}/{year}</div>
          <button className="px-3 py-1 bg-gray-200 rounded" onClick={onClose}>Đóng</button>
        </div>
        <div className="flex gap-4 mb-4">
          <div>
            <label>Khu vực:</label>
            <select value={selectedLocation} onChange={e => setSelectedLocation(e.target.value)} className="border rounded px-2 py-1 ml-2">
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Tháng:</label>
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className="border rounded px-2 py-1 ml-2">
              {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
            </select>
          </div>
          <div>
            <label>Năm:</label>
            <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="border rounded px-2 py-1 ml-2 w-20" />
          </div>
          <button className="bg-blue-600 text-white px-4 rounded" onClick={fetchData}>Tải dữ liệu</button>
          <button className="bg-green-600 text-white px-4 rounded" onClick={handleExport}>Xuất Excel</button>
        </div>
        <div className="overflow-auto max-h-[60vh]">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                {columns.map(col => <th key={col} className="border px-2 py-1">{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length} className="text-center">Đang tải...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={columns.length} className="text-center text-gray-500">Không có dữ liệu.</td></tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={row.employee_id || idx}>
                    <td className="border px-2 py-1">{idx + 1}</td>
                    <td className="border px-2 py-1">{row.employee_id}</td>
                    <td className="border px-2 py-1">{row.full_name}</td>
                    <td className="border px-2 py-1">{row.position_name}</td>
                    <td className="border px-2 py-1 text-center">{row.total_work_day_tv}</td>
                    <td className="border px-2 py-1 text-center">{row.total_work_day_ct}</td>
                    <td className="border px-2 py-1 text-center">{row.total_leave_day}</td>
                    <td className="border px-2 py-1 text-center">{row.total_benefit_leave}</td>
                    <td className="border px-2 py-1 text-center">{row.total_holiday}</td>
                    <td className="border px-2 py-1 text-center">{row.total_ot_time}</td>
                    <td className="border px-2 py-1 text-center">{row.total_ot_time_weekend}</td>
                    <td className="border px-2 py-1 text-center">{row.total_ot_time_holiday}</td>
                    <td className="border px-2 py-1 text-center">{row.total_paid_days}</td>
                    <td className="border px-2 py-1 text-center">{row.total_meal_days}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button className="bg-blue-700 text-white px-4 py-2 rounded" onClick={() => setShowConfirm(true)}>Chuyển tính lương</button>
        </div>
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg min-w-[350px] relative">
              <div className="mb-4 text-lg font-bold">Xác nhận chốt công chuyển sang tính lương</div>
              <div className="mb-4">Bạn có chắc chắn muốn chốt công? Sau khi xác nhận sẽ không thể chỉnh sửa dữ liệu chấm công nữa.</div>
              <div className="flex gap-2 justify-end">
                <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowConfirm(false)}>Hủy</button>
                <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={() => { setShowConfirm(false); alert('Đã chốt công!'); }}>Xác nhận</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
