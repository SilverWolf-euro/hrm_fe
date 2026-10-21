import React, { useEffect, useState } from "react";
import { searchWorkLocation } from "../services/workLocationService";
import workShiftService from "../services/workShiftService";
import { saveAs } from "file-saver";

function getFirstDayOfMonth(year, month) {
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

// Dùng chung cho bảng hiển thị và file Excel để luôn khớp cột/dữ liệu
const columns = [
  { title: "STT", width: 6, center: true, value: (row, idx) => idx + 1 },
  { title: "Mã NV", width: 12, value: row => row.employee_id },
  { title: "Họ và tên", width: 28, value: row => row.full_name },
  { title: "Chức vụ", width: 22, value: row => row.position_name },
  { title: "Công TV", width: 10, center: true, value: row => row.total_work_day_tv },
  { title: "Công CT", width: 10, center: true, value: row => row.total_work_day_ct },
  { title: "Ngày phép", width: 11, center: true, value: row => row.total_leave_day },
  { title: "Ngày nghỉ chế độ", width: 14, center: true, value: row => row.total_benefit_leave },
  { title: "Ngày lễ", width: 10, center: true, value: row => row.total_holiday },
  { title: "Giờ ngày thường", width: 14, center: true, value: row => row.total_ot_time },
  { title: "Giờ ngày nghỉ", width: 13, center: true, value: row => row.total_ot_time_weekend },
  { title: "Giờ ngày lễ", width: 12, center: true, value: row => row.total_ot_time_holiday },
  { title: "Tổng số ngày hưởng lương", width: 16, center: true, value: row => row.total_paid_days },
  { title: "Hỗ trợ ăn giữa ca", width: 14, center: true, value: row => row.total_meal_days },
];

// Giữ số là số trong Excel (API có thể trả về chuỗi "1.5")
function toCellValue(v) {
  if (v === null || v === undefined) return "";
  if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) return Number(v);
  return v;
}

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

  const handleExport = async () => {
    if (data.length === 0) {
      alert("Không có dữ liệu để xuất.");
      return;
    }
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(`Tháng ${month}-${year}`);
    const location = locations.find(loc => String(loc.id) === String(selectedLocation));
    const border = {
      top: { style: "thin" }, left: { style: "thin" },
      bottom: { style: "thin" }, right: { style: "thin" },
    };

    sheet.columns = columns.map(col => ({ width: col.width }));

    // Tiêu đề
    sheet.mergeCells(1, 1, 1, columns.length);
    const titleCell = sheet.getCell(1, 1);
    titleCell.value = `Bảng tổng hợp công - Tháng ${month}/${year}`;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: "center" };
    sheet.mergeCells(2, 1, 2, columns.length);
    const locationCell = sheet.getCell(2, 1);
    locationCell.value = `Khu vực: ${location ? location.name : ""}`;
    locationCell.alignment = { horizontal: "center" };

    // Header
    const headerRow = sheet.getRow(4);
    headerRow.values = columns.map(col => col.title);
    headerRow.height = 32;
    headerRow.eachCell(cell => {
      cell.font = { bold: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.border = border;
    });

    // Dữ liệu
    data.forEach((row, idx) => {
      const excelRow = sheet.addRow(columns.map(col => toCellValue(col.value(row, idx))));
      excelRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = border;
        if (columns[colNumber - 1].center) cell.alignment = { horizontal: "center" };
      });
    });

    sheet.views = [{ state: "frozen", ySplit: 4 }];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `BangTongHopCong_${year}_${String(month).padStart(2, "0")}.xlsx`);
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
                {columns.map(col => <th key={col.title} className="border px-2 py-1">{col.title}</th>)}
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
                    {columns.map(col => (
                      <td key={col.title} className={`border px-2 py-1${col.center ? " text-center" : ""}`}>
                        {col.value(row, idx)}
                      </td>
                    ))}
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
