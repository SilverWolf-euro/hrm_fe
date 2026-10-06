import React, { useEffect, useState } from "react";
import workShiftService from "../services/workShiftService";
import { getDepartments } from "../services/departmentService";

import dayjs from "dayjs";



const UNITS = [
  { label: "Tất cả", value: "All" },
  { label: "Văn phòng", value: "2" },
  { label: "Nhà máy", value: "4" },
];

// Tách chuỗi nhiều ca từ API ("HC + C3 + C5" hoặc "HC;C3;C5") thành mảng mã ca
function parseShiftCodes(value) {
  return (value || "").split(/[;+]/).map(s => s.trim()).filter(Boolean);
}

function getWeekRange(date) {
  const start = dayjs(date).startOf("week").add(1, "day"); // Thứ 2
  const end = start.add(6, "day"); // Chủ nhật
  return [start, end];
}

export default function WorkShiftSummary() {
  // State cho popup chọn ca
  const [popup, setPopup] = useState({ open: false, emp: null, date: null, currentShift: "" });
  // Danh sách ca được chọn (cho phép chọn nhiều), gửi API dạng "id1;id2"
  const [selectedShift, setSelectedShift] = useState([]);
  const [shiftOptions, setShiftOptions] = useState([]);
  const [unit, setUnit] = useState("");
  const [department, setDepartment] = useState("");
  const [search, setSearch] = useState("");
  const [week, setWeek] = useState(getWeekRange(new Date()));
  const [data, setData] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Lấy dữ liệu phân ca
  useEffect(() => {
    const [from, to] = week;
    workShiftService.getWorkShiftDetail({
      date_from: from.format("YYYY-MM-DD"),
      date_to: to.format("YYYY-MM-DD"),
      department_id: department,
      scope: unit,
      text: search
    })
      .then(res => setData(res.data))
      .catch(() => setData([]));
  }, [unit, department, search, week]);

  // Lấy danh sách phòng ban khi đổi đơn vị
  useEffect(() => {
    if (!unit) {
      setDepartments([]);
      setDepartment("");
      return;
    }
    // Gọi API lấy phòng ban
    getDepartments().then(list => {
      setDepartments(Array.isArray(list) ? list : []);
      setDepartment("");
    });
  }, [unit]);

  // Xử lý dữ liệu thành dạng bảng, đảm bảo data luôn là mảng
  const employees = {};
  (Array.isArray(data) ? data : []).forEach(item => {
    if (!employees[item.emp_id]) {
      employees[item.emp_id] = {
        emp_id: item.emp_id,
        full_name: item.full_name,
        shifts: {},
        workShiftIds: {},
      };
    }
    const dayKey = dayjs(item.work_date).format("YYYY-MM-DD");
    // Lưu shift_id (chỉ lấy shift_id, không dùng id làm fallback)
    employees[item.emp_id].shifts[dayKey] = item.shift_id;
    // Lưu work_shift_id để truyền lại khi cập nhật phân ca
    employees[item.emp_id].workShiftIds[dayKey] = item.work_shift_id || "";
  });

  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(week[0].add(i, "day"));
  }

  return (
    <div className="p-4 bg-white min-h-screen">
      <h2 className="text-xl font-bold uppercase mb-4">Bảng phân ca</h2>
      {/* Thanh công cụ bộ lọc và thời gian */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          className="px-2 py-1 rounded hover:bg-gray-200"
          onClick={() => setWeek([week[0].subtract(7, "day"), week[1].subtract(7, "day")])}
        >
          &#8592;
        </button>
        {/* Chọn khoảng thời gian */}
        <input
          type="date"
          className="border rounded px-2 py-1"
          value={week[0].format("YYYY-MM-DD")}
          onChange={e => {
            const newStart = dayjs(e.target.value);
            setWeek([newStart, newStart.add(6, "day")]);
          }}
          style={{ width: 140 }}
        />
        <span className="font-semibold">-</span>
        <input
          type="date"
          className="border rounded px-2 py-1"
          value={week[1].format("YYYY-MM-DD")}
          onChange={e => {
            const newEnd = dayjs(e.target.value);
            setWeek([newEnd.subtract(6, "day"), newEnd]);
          }}
          style={{ width: 140 }}
        />
        <button
          className="px-2 py-1 rounded hover:bg-gray-200"
          onClick={() => setWeek([week[0].add(7, "day"), week[1].add(7, "day")])}
        >
          &#8594;
        </button>
        <select value={unit} onChange={e => setUnit(e.target.value)} className="border rounded px-2 py-1">
          {UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
        </select>
        <select value={department} onChange={e => setDepartment(e.target.value)} disabled={!departments.length} className="border rounded px-2 py-1">
          <option value="">Tất cả phòng ban</option>
          {departments.map(d => (
            <option key={d.code} value={d.code}>{d.name_vi}</option>
          ))}
        </select>
        <input
          placeholder="Tìm mã/tên NV"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-2 py-1"
          style={{ minWidth: 180 }}
        />
        {/* <button className="ml-auto bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700">Thêm mới</button> */}
      </div>

      {/* Bảng phân ca */}
      <div className="overflow-x-auto">
        <table className="min-w-max w-full border-collapse">
          <thead>
            <tr>
              <th className="bg-gray-100 border text-left px-4 py-2 w-56 font-bold text-sm">Nhân viên</th>
              {days.map(d => {
                const weekday = d.day();
                // 0: Chủ nhật, 1: Thứ 2, ... 6: Thứ 7
                const weekdayVN =
                  weekday === 0 ? "CN"
                  : `Th ${weekday + 1}`;
                return (
                  <th
                    key={d.format("YYYY-MM-DD")}
                    className="bg-gray-100 border px-3 py-2 text-center font-bold text-sm min-w-[90px]"
                  >
                    {weekdayVN + " " + d.format("DD/MM")}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {Object.values(employees)
              .sort((a, b) => a.full_name.localeCompare(b.full_name))
              .map(emp => (
                <tr key={emp.emp_id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2 align-top text-left whitespace-nowrap">
                    <span className="font-medium text-base">{emp.full_name}</span>
                    <br />
                    <span className="text-xs text-gray-500">{emp.emp_id}</span>
                  </td>
                  {days.map(d => {
                    const shiftCode = emp.shifts[d.format("YYYY-MM-DD")] || "";
                    // Tìm shift_name từ shiftOptions hoặc data nếu có, fallback về shiftCode
                    let shiftLabel = shiftCode;
                    // Luôn đồng bộ shift_id với id, chỉ hiển thị shift_name nếu khớp id
                    // shiftCode có thể gồm nhiều ca ("HC + C3 + C5")
                    if (shiftCode && Array.isArray(shiftOptions) && shiftOptions.length > 0) {
                      shiftLabel = parseShiftCodes(shiftCode).map(code => {
                        const found = shiftOptions.find(opt => opt.value === code);
                        return found ? found.label + ` (${found.value})` : code;
                      }).join(" + ");
                    }
                    return (
                      <td
                        key={d.format("YYYY-MM-DD")}
                        className="border px-3 py-2 text-center align-middle font-semibold text-sm group relative"
                        style={{ minWidth: 90 }}
                      >
                        {shiftLabel}
                        <button
                          className="absolute top-1 right-1 px-2 py-1 text-xs bg-blue-500 text-white rounded shadow hover:bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                          style={{ zIndex: 2 }}
                          onClick={async () => {
                            setPopup({ open: true, emp, date: d, currentShift: shiftCode, workShiftId: emp.workShiftIds[d.format("YYYY-MM-DD")] || "" });
                            setSelectedShift(parseShiftCodes(shiftCode));
                            // Lấy danh sách ca làm việc nếu chưa có
                            if (shiftOptions.length === 0) {
                              try {
                                const res = await workShiftService.getWorkShiftList();
                                const list = res?.data || [];
                                setShiftOptions(list.map(item => ({
                                  label: item.shift_name || item.shift_id || item.id,
                                  value: item.id
                                })));
                              } catch (e) {
                                setShiftOptions([]);
                              }
                            }
                          }}
                        >Chỉnh sửa</button>
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {/* Popup chọn ca làm việc */}
      {popup.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] relative">
            <div className="font-semibold text-base mb-2">
              Chọn ca làm việc cho {popup.emp?.full_name}
            </div>
            <div className="text-sm text-gray-500 mb-2">
              {popup.date?.format("dddd, DD/MM")}
            </div>
            <div className="mb-4">
              {shiftOptions.length === 0 ? (
                <div className="text-gray-400 text-sm">Đang tải danh sách ca...</div>
              ) : (
                shiftOptions.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 mb-1 cursor-pointer">
                    <input
                      type="checkbox"
                      name="shift"
                      value={opt.value}
                      checked={selectedShift.includes(opt.value)}
                      onChange={e => setSelectedShift(prev =>
                        e.target.checked ? [...prev, opt.value] : prev.filter(v => v !== opt.value)
                      )}
                    />
                    {opt.label}
                  </label>
                ))
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setPopup({ open: false, emp: null, date: null, currentShift: "" })}
              >Đóng</button>
              <button
                className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={async () => {
                  if (!popup.emp || !popup.date || selectedShift.length === 0) return;
                  const id = `${popup.emp.emp_id}_${popup.date.format("YYYYMMDD")}`;
                  try {
                    await workShiftService.updateWorkShiftDetail(id, {
                      id,
                      shift_id: selectedShift.join(";"),
                      emp_id: popup.emp.emp_id,
                      work_date: popup.date.format("YYYY-MM-DD"),
                      work_shift_id: popup.workShiftId || ""
                    });
                    // Sau khi cập nhật thành công, reload lại dữ liệu bảng
                    setPopup({ open: false, emp: null, date: null, currentShift: "" });
                    setSelectedShift([]);
                    // Reload bảng bằng cách gọi lại API
                    const [from, to] = week;
                    workShiftService.getWorkShiftDetail({
                      date_from: from.format("YYYY-MM-DD"),
                      date_to: to.format("YYYY-MM-DD"),
                      department_id: department,
                      scope: unit,
                      text: search
                    })
                      .then(res => setData(res.data))
                      .catch(() => setData([]));
                  } catch (e) {
                    alert("Cập nhật ca làm việc thất bại!");
                  }
                }}
                disabled={
                  selectedShift.length === 0 ||
                  [...selectedShift].sort().join(";") === parseShiftCodes(popup.currentShift).sort().join(";")
                }
              >Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
