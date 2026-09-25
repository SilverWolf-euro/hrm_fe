import React, { useState, useEffect } from "react";
import EmployeeAttendanceCalendar from "./EmployeeAttendanceCalendar";
import AttendanceSummary from "./AttendanceSummary";
// import { searchWorkLocation } from "../services/workLocationService";
import employeeService from "../services/employeeService";

// Hàm chuyển đổi dữ liệu từ API về format bảng
function convertApiDataToTable(apiData, year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  // Detect factory flat format where API returns rows with position_name and check_in_shift_1 etc.
  if (Array.isArray(apiData) && apiData.length > 0 && (apiData[0].position_name || apiData[0].check_in_shift_1 !== undefined)) {
    const grouped = {};
    apiData.forEach(row => {
      const empId = row.emp_id || row.employee_id || "";
      if (!grouped[empId]) grouped[empId] = { emp_id: row.emp_id || row.employee_id, full_name: row.full_name || row.employeeName, attendance: {} };
      let day = null;
      if (row.attendance_date) {
        try {
          const d = new Date(row.attendance_date);
          if (!isNaN(d.getTime())) day = d.getDate();
        } catch (e) {}
      }
      if (!day && row.date) {
        try {
          const d = new Date(row.date);
          if (!isNaN(d.getTime())) day = d.getDate();
        } catch (e) {}
      }
      if (!day && row.position_name && String(row.position_name).includes('/')) {
        const parts = String(row.position_name).split('/');
        if (parts.length >= 1 && !isNaN(Number(parts[0]))) {
          day = Number(parts[0]);
        }
      }
      
      if (!day || isNaN(day)) return;
      grouped[empId].attendance[String(day)] = {
        shift_id: row.attendance_code || row.shift_id || "",
        clock_in: row.check_in_shift_1 || row.check_in_shift_2 || row.clock_in || "",
        clock_out: row.check_out_shift_1 || row.check_out_shift_2 || row.clock_out || "",
        check_in_shift_1: row.check_in_shift_1 || null,
        check_out_shift_1: row.check_out_shift_1 || null,
        check_in_shift_2: row.check_in_shift_2 || null,
        check_out_shift_2: row.check_out_shift_2 || null,
        is_late: row.is_late || false,
        late_minutes: row.late_minutes || 0,
        early_minutes: row.early_minutes || 0,
        leave_code: row.leave_code || null,
      };
    });

    return Object.values(grouped).map(emp => {
      const records = daysInMonth.map(day => {
        const att = emp.attendance[String(day)] || {};
        return {
          date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
          shiftId: att.shift_id || "",
          checkIn: att.clock_in || "",
          checkOut: att.clock_out || "",
          checkInShift1: att.check_in_shift_1 || null,
          checkOutShift1: att.check_out_shift_1 || null,
          checkInShift2: att.check_in_shift_2 || null,
          checkOutShift2: att.check_out_shift_2 || null,
          status: att.is_late ? "LATE" : "",
          leaveType: att.leave_code || null,
          paidDays: 1,
          canEdit: true,
          early_minutes: att.early_minutes || 0,
          is_late: att.is_late || false,
          is_leave_early: att.is_leave_early || false,
          late_minutes: att.late_minutes || 0,
        };
      });
      return {
        employeeId: emp.emp_id,
        employeeName: emp.full_name,
        records,
      };
    });
  }

  return apiData.map(emp => {
    const records = daysInMonth.map(day => {
      const att = emp.attendance && emp.attendance[String(day)] ? emp.attendance[String(day)] : {};
      return {
        date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        shiftId: att.shift_id || "",
        checkIn: att.clock_in || att.check_in_shift_1 || att.check_in_shift_2 || "",
        checkOut: att.clock_out || att.check_out_shift_1 || att.check_out_shift_2 || "",
        // keep backwards-compatible shift fields (may be undefined)
        checkInShift1: att.check_in_shift_1 || null,
        checkOutShift1: att.check_out_shift_1 || null,
        checkInShift2: att.check_in_shift_2 || null,
        checkOutShift2: att.check_out_shift_2 || null,
        status: att.is_late ? "LATE" : "OK",
        leaveType: att.leave_code || null, // Nếu có trường loại nghỉ thì map vào đây
        paidDays: 1, // Nếu có trường số công thì map vào đây
        canEdit: true,
        early_minutes: att.early_minutes || 0,
        is_late: att.is_late || false,
        is_leave_early: att.is_leave_early || false,
        late_minutes: att.late_minutes || 0,
      };
    });
    return {
      employeeId: emp.emp_id,
      employeeName: emp.full_name,
      records,
    };
  });
}

// Hàm tạo mảng ngày trong tháng
function getDaysInMonth(year, month) {
  const days = [];
  const last = new Date(year, month, 0).getDate();
  for (let i = 1; i <= last; i++) {
    days.push(i);
  }
  return days;
}

function AttendanceDetailModal({ open, record, onClose, onSave }) {
  const [edit, setEdit] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (record) {
      setEdit(record);
    }
  }, [record]);

  if (!open || !record || !edit) return null;

  // Hiển thị trạng thái đi muộn, về sớm, đúng giờ, không có dữ liệu hoặc thiếu giờ vào/ra
  let statusContent = null;
  // Kiểm tra không có dữ liệu (không có checkIn/checkOut)
  const isNoData = !edit.checkIn && !edit.checkOut;
  if (isNoData) {
    statusContent = <div className="bg-red-100 text-red-600 rounded px-2 py-1">Không có dữ liệu</div>;
  } else {
    const missingIn = !edit.checkIn;
    const missingOut = !edit.checkOut;
    const missingMsgs = [];
    if (missingIn) missingMsgs.push(<div key="in" className="bg-orange-100 text-orange-700 rounded px-2 py-1 mb-1">Chưa chấm công giờ vào</div>);
    if (missingOut) missingMsgs.push(<div key="out" className="bg-orange-100 text-orange-700 rounded px-2 py-1 mb-1">Chưa chấm công giờ ra</div>);
    if (edit.late_minutes > 0 && edit.early_minutes > 0) {
      statusContent = (
        <>
          {missingMsgs}
          <div className="bg-red-100 text-red-600 rounded px-2 py-1 mb-1">Đi muộn {edit.late_minutes} phút</div>
          <div className="bg-yellow-100 text-yellow-700 rounded px-2 py-1">Về sớm {edit.early_minutes} phút</div>
        </>
      );
    } else if (edit.late_minutes > 0) {
      statusContent = (
        <>
          {missingMsgs}
          <div className="bg-red-100 text-red-600 rounded px-2 py-1">Đi muộn {edit.late_minutes} phút</div>
        </>
      );
    } else if (edit.early_minutes > 0) {
      statusContent = (
        <>
          {missingMsgs}
          <div className="bg-yellow-100 text-yellow-700 rounded px-2 py-1">Về sớm {edit.early_minutes} phút</div>
        </>
      );
    } else if (missingMsgs.length > 0) {
      statusContent = <>{missingMsgs}</>;
    } else {
      statusContent = <div className="bg-green-100 text-green-600 rounded px-2 py-1">Đúng giờ</div>;
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg min-w-[350px] relative">
        <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={onClose}>×</button>
        <h3 className="font-bold mb-4">Chấm công ngày {edit.date ? edit.date.slice(8, 10) + "/" + edit.date.slice(5, 7) : ""}</h3>
        <div className="mb-2">
          <label className="block text-xs mb-1">Số công hưởng</label>
          <input className="border rounded px-2 py-1 w-full" type="number" min={0} value={edit.paidDays} disabled={!isEdit} onChange={e => setEdit({ ...edit, paidDays: Number(e.target.value) })} />
        </div>
        <div className="mb-2">
          <label className="block text-xs mb-1">Giờ vào</label>
          <input className="border rounded px-2 py-1 w-full" value={edit.checkIn || ""} disabled={!isEdit} onChange={e => setEdit({ ...edit, checkIn: e.target.value })} />
        </div>
        <div className="mb-2">
          <label className="block text-xs mb-1">Giờ ra</label>
          <input className="border rounded px-2 py-1 w-full" value={edit.checkOut || ""} disabled={!isEdit} onChange={e => setEdit({ ...edit, checkOut: e.target.value })} />
        </div>
        <div className="mb-2">
          <label className="block text-xs mb-1">Trạng thái</label>
          {statusContent}
        </div>
        {/* <div className="flex justify-end gap-2 mt-4">
          <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>Hủy</button>
          {edit.canEdit && !isEdit && (
            <button type="button" className="px-4 py-2 rounded bg-blue-600 text-white" onClick={() => setIsEdit(true)}>Chỉnh sửa</button>
          )}
          {isEdit && (
            <button type="button" className="px-4 py-2 rounded bg-blue-500 text-white" onClick={() => { setIsEdit(false); onSave(edit); }}>Lưu</button>
          )}
        </div> */}
      </div>
    </div>
  );
}

const LEAVE_TYPE_SYMBOLS = ["L", "P", "N", "CĐ", "TS", "CT", "TN"];

export default function AttendanceScreen() {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  // Khu vực: Văn phòng (2), Nhà máy (4)
  const [area, setArea] = useState("Văn phòng");
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showEmpCalendar, setShowEmpCalendar] = useState(false);
  const [empCalendarData, setEmpCalendarData] = useState(null);
  const [showSummary, setShowSummary] = useState(false);

  const days = getDaysInMonth(year, month);

  // Hàm fetch dữ liệu từ API (gọi qua service)
  const fetchAttendance = async (month, year, area) => {
    try {
      // Xác định work_location cố định: Văn phòng = 2, Nhà máy = 4
      const work_location = area === "Văn phòng" ? 2 : 4;
      const apiData = await employeeService.getAttendanceByMonthYear(month, year, work_location);
      setData(convertApiDataToTable(apiData, year, month));
    } catch (err) {
      setData([]);
      alert("Lỗi khi lấy dữ liệu chấm công!");
    }
  };

  // Lấy dữ liệu khi đổi tháng/năm/khu vực
  useEffect(() => {
    fetchAttendance(month, year, area);
  }, [month, year, area]);

  const handleSync = () => {
    fetchAttendance(month, year, area);
    alert("Đồng bộ dữ liệu thành công!");
  };

  const handleDownload = async () => {
    try {
      const work_location = area === "Văn phòng" ? 2 : 4;
      const response = await employeeService.downloadAttendanceByMonthYear(month, year, work_location);
      
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `ChamCong_${area === "Văn phòng" ? "VP" : "NM"}_${month}_${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert("Lỗi khi tải file chấm công!");
    }
  };

  const handleSummary = () => {
    setShowSummary(true);
  };
  const openDetailModal = (record, empIdx, dayIdx) => {
    setSelected({ ...record, empIdx, dayIdx });
    setShowModal(true);
  };
  const handleSaveDetail = (edit) => {
    setData(prev => prev.map((emp, i) =>
      i === selected.empIdx
        ? { ...emp, records: emp.records.map((r, j) => j === selected.dayIdx ? edit : r) }
        : emp
    ));
    setShowModal(false);
  };

  // Danh sách khu vực cố định
  const workLocations = ["Văn phòng", "Nhà máy"];

  // Hàm lấy thứ trong tuần (bắt đầu từ Thứ 2)
  function getWeekdayName(year, month, day) {
    const date = new Date(year, month - 1, day);
    const weekday = date.getDay();
    const weekdays = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];
    return weekdays[weekday];
  }

  // Format time string like "08:04:34" -> "08:04" (hide seconds). If falsy -> "--:--".
  function formatHM(timeStr) {
    if (!timeStr && timeStr !== "00:00:00") return "--:--";
    const parts = String(timeStr).split(":");
    if (parts.length >= 2) return parts[0].padStart(2, "0") + ":" + parts[1].padStart(2, "0");
    return String(timeStr).slice(0,5);
  }

  // Return true if checkIn > checkOut (shift passes to next day). Accepts strings like "23:00:00" or "08:03:27".
  function isNextDayShift(checkIn, checkOut) {
    if (!checkIn || !checkOut) return false;
    const toSeconds = s => {
      const p = String(s).split(":");
      const h = Number(p[0] || 0);
      const m = Number(p[1] || 0);
      const sec = Number(p[2] || 0);
      return h * 3600 + m * 60 + sec;
    };
    try {
      return toSeconds(checkIn) > toSeconds(checkOut);
    } catch (e) {
      return false;
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold uppercase mb-4">Bảng chấm công</h2>
      <div className="flex gap-2 mb-4 items-end">
        <div>
          <label className="block text-sm mb-1">Tháng</label>
          <input type="number" min={1} max={12} value={month} onChange={e => setMonth(Number(e.target.value))} className="border rounded px-2 py-1 w-20" />
        </div>
        <div>
          <label className="block text-sm mb-1">Năm</label>
          <input type="number" min={2000} max={2100} value={year} onChange={e => setYear(Number(e.target.value))} className="border rounded px-2 py-1 w-24" />
        </div>
        <div>
          <label className="block text-sm mb-1">Khu vực</label>
          <select value={area} onChange={e => setArea(e.target.value)} className="border rounded px-2 py-1">
            {workLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSync}>Đồng bộ</button>
        <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleDownload}>Tải file</button>
        <button className="bg-slate-800 text-white px-4 py-2 rounded" onClick={handleSummary}>Tổng hợp công</button>
      </div>
      <div className="overflow-x-auto" style={{ maxHeight: '70vh' }}>
        <table className="min-w-max border text-xs" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 sticky left-0 top-0 z-20 bg-gray-100" style={{ width: 50, minWidth: 50, maxWidth: 50 }}>STT</th>
              <th className="border px-2 py-1 sticky top-0 z-20 bg-gray-100" style={{ left: 50, width: 80, minWidth: 80, maxWidth: 80 }}>Mã NV</th>
              <th className="border px-2 py-1 sticky top-0 z-20 bg-gray-100" style={{ left: 130, width: 140, minWidth: 140, maxWidth: 140 }}>Họ và tên</th>
              {days.map((day, idx) => {
                const date = new Date(year, month - 1, day);
                const weekday = date.getDay();
                const isSunday = weekday === 0;
                return (
                  <th
                    key={"weekday-" + day}
                    className={
                      "border px-2 py-1 text-center sticky top-0 z-10 bg-gray-100 " +
                      (isSunday ? "text-red-600 font-bold" : "")
                    }
                    style={{ width: 110, minWidth: 110, maxWidth: 110 }}
                  >
                    <div className="leading-4">
                      <div>{getWeekdayName(year, month, day)}</div>
                      <div>{String(day).padStart(2, "0")}</div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {data.map((emp, empIdx) => (
              <tr key={emp.employeeId}>
                <td className="border px-2 py-1 text-center sticky left-0 bg-white z-10" style={{ width: 50, minWidth: 50, maxWidth: 50 }}>{empIdx + 1}</td>
                <td className="border px-2 py-1 font-bold text-blue-700 sticky bg-white z-10" style={{ left: 50, width: 80, minWidth: 80, maxWidth: 80 }}>{emp.employeeId}</td>
                <td
                  className="border px-2 py-1 text-blue-700 underline cursor-pointer hover:text-blue-900 sticky bg-white z-10"
                  style={{ left: 130, width: 140, minWidth: 140, maxWidth: 140 }}
                  onClick={() => { setEmpCalendarData(emp); setShowEmpCalendar(true); }}
                >
                  {emp.employeeName}
                </td>
                {days.map((day, dayIdx) => {
                  const rec = emp.records[dayIdx] && Object.keys(emp.records[dayIdx]).length > 0
                    ? emp.records[dayIdx]
                    : {
                        date: `${year}-${String(month).padStart(2, "0")}-${String(days[dayIdx]).padStart(2, "0")}`,
                        shiftId: "",
                        checkIn: "",
                        checkOut: "",
                        status: "",
                        leaveType: null,
                        paidDays: 1,
                        canEdit: false,
                      };
                  // Xác định thứ trong tuần
                  const dateObj = new Date(year, month - 1, day);
                  const weekday = dateObj.getDay();
                  // Kiểm tra không có dữ liệu và không phải T7 (6), CN (0)
                  const isNoData = !rec.checkIn && !rec.checkOut && !rec.checkInShift1 && !rec.checkOutShift1 && !rec.checkInShift2 && !rec.checkOutShift2;
                  let cellClass = "border px-2 py-1 text-center cursor-pointer ";
                  // Nếu là ô không có dữ liệu trong tuần (không phải T7, CN) thì tô nền đỏ nhạt
                  if (isNoData) {
                    if (weekday === 0) cellClass += "bg-gray-100 "; // Chủ nhật
                    else if (weekday === 6) cellClass += "bg-gray-50 "; // Thứ 7
                    else cellClass += "bg-red-100 "; // Ngày trong tuần: đỏ nhạt
                  }
                  if (rec.status === "ABSENT" || rec.status === "LATE" || rec.status === "EARLY") {
                    cellClass += "bg-red-100 ";
                  }
                  return (
                    <td
                      key={dayIdx}
                      style={{ width: 110, minWidth: 110, maxWidth: 110 }}
                      className={cellClass}
                      onClick={area === "Nhà máy" ? undefined : () => openDetailModal(rec, empIdx, dayIdx)}
                    >
                      {rec.leaveType ? (
                        <>
                          <span className="font-bold text-blue-600 block">{rec.leaveType}</span>
                          {area !== "Nhà máy" && rec.shiftId && <span>{rec.shiftId}<br /></span>}
                          {/* Prefer detailed shift fields when provided (factory API) */}
                          { (rec.checkInShift1 || rec.checkOutShift1 || rec.checkInShift2 || rec.checkOutShift2) ? (
                            <div className={"text-sm " + ((!rec.checkInShift1 || !rec.checkOutShift1) ? "text-orange-500" : "") }>
                              {area === "Nhà máy" ? (
                                <>
                                  {rec.checkInShift1 || rec.checkOutShift1 ? (
                                    <div>{formatHM(rec.checkInShift1)} - {formatHM(rec.checkOutShift1)}{isNextDayShift(rec.checkInShift1, rec.checkOutShift1) ? ' (+1)' : ''}</div>
                                  ) : null}
                                  {rec.checkInShift2 || rec.checkOutShift2 ? (
                                    <div>{formatHM(rec.checkInShift2)} - {formatHM(rec.checkOutShift2)}{isNextDayShift(rec.checkInShift2, rec.checkOutShift2) ? ' (+1)' : ''}</div>
                                  ) : null}
                                </>
                              ) : (
                                <>
                                  {rec.checkInShift1 || rec.checkOutShift1 ? (
                                    <div>Ca 1: {formatHM(rec.checkInShift1)} - {formatHM(rec.checkOutShift1)}{isNextDayShift(rec.checkInShift1, rec.checkOutShift1) ? ' (+1)' : ''}</div>
                                  ) : null}
                                  {rec.checkInShift2 || rec.checkOutShift2 ? (
                                    <div>Ca 2: {formatHM(rec.checkInShift2)} - {formatHM(rec.checkOutShift2)}{isNextDayShift(rec.checkInShift2, rec.checkOutShift2) ? ' (+1)' : ''}</div>
                                  ) : null}
                                </>
                              )}
                            </div>
                          ) : (
                            <span className={(!rec.checkIn || !rec.checkOut) ? "text-orange-500" : ""}>
                              {area === "Nhà máy" ? (
                                <>
                                  {formatHM(rec.checkIn)} - {formatHM(rec.checkOut)}{isNextDayShift(rec.checkIn, rec.checkOut) ? ' (+1)' : ''}
                                </>
                              ) : (
                                <>
                                  {rec.checkIn || "--:--"} - {rec.checkOut || "--:--"}
                                </>
                              )}
                            </span>
                          )}
                        </>
                      ) : (rec.shiftId || rec.checkIn || rec.checkOut || rec.checkInShift1 || rec.checkOutShift1 || rec.checkInShift2 || rec.checkOutShift2) ? (
                        <>
                          {area !== "Nhà máy" && rec.shiftId && <span>{rec.shiftId}<br /></span>}
                          { (rec.checkInShift1 || rec.checkOutShift1 || rec.checkInShift2 || rec.checkOutShift2) ? (
                            <div className={"text-sm " + ((!rec.checkInShift1 || !rec.checkOutShift1) ? "text-orange-500" : "") }>
                              {area === "Nhà máy" ? (
                                <>
                                  {rec.checkInShift1 || rec.checkOutShift1 ? (
                                    <div>{formatHM(rec.checkInShift1)} - {formatHM(rec.checkOutShift1)}{isNextDayShift(rec.checkInShift1, rec.checkOutShift1) ? ' (+1)' : ''}</div>
                                  ) : null}
                                  {rec.checkInShift2 || rec.checkOutShift2 ? (
                                    <div>{formatHM(rec.checkInShift2)} - {formatHM(rec.checkOutShift2)}{isNextDayShift(rec.checkInShift2, rec.checkOutShift2) ? ' (+1)' : ''}</div>
                                  ) : null}
                                </>
                              ) : (
                                <>
                                  {rec.checkInShift1 || rec.checkOutShift1 ? (
                                    <div>Ca 1: {formatHM(rec.checkInShift1)} - {formatHM(rec.checkOutShift1)}{isNextDayShift(rec.checkInShift1, rec.checkOutShift1) ? ' (+1)' : ''}</div>
                                  ) : null}
                                  {rec.checkInShift2 || rec.checkOutShift2 ? (
                                    <div>Ca 2: {formatHM(rec.checkInShift2)} - {formatHM(rec.checkOutShift2)}{isNextDayShift(rec.checkInShift2, rec.checkOutShift2) ? ' (+1)' : ''}</div>
                                  ) : null}
                                </>
                              )}
                            </div>
                          ) : (
                            <span className={(!rec.checkIn || !rec.checkOut) ? "text-orange-500" : ""}>
                              {area === "Nhà máy" ? (
                                <>
                                  {formatHM(rec.checkIn)} - {formatHM(rec.checkOut)}{isNextDayShift(rec.checkIn, rec.checkOut) ? ' (+1)' : ''}
                                </>
                              ) : (
                                <>
                                  {rec.checkIn || "--:--"} - {rec.checkOut || "--:--"}
                                </>
                              )}
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-gray-400">--</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AttendanceDetailModal
        open={showModal}
        record={selected}
        onClose={() => setShowModal(false)}
        onSave={handleSaveDetail}
        leaveTypes={LEAVE_TYPE_SYMBOLS}
      />
      {showEmpCalendar && empCalendarData && (
        <EmployeeAttendanceCalendar
          employee={empCalendarData}
          year={year}
          month={month}
          area={area}
          onClose={() => setShowEmpCalendar(false)}
        />
      )}
    {showSummary && (
      <AttendanceSummary
        onClose={() => setShowSummary(false)}
        area={area}
      />
    )}
    </div>
    
  );
}
