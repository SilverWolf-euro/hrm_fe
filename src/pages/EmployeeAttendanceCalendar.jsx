
import React from "react";


function getDaysInMonth(year, month) {
  const days = [];
  const last = new Date(year, month, 0).getDate();
  for (let i = 1; i <= last; i++) {
    days.push(i);
  }
  return days;
}

function getFirstDayOfWeek(year, month) {
  // 0: Sunday, 1: Monday, ...
  return new Date(year, month - 1, 1).getDay();
}

// Format time string like "08:04:34" -> "08:04" (hide seconds). If falsy -> "--:--".
function formatHM(timeStr) {
  if (!timeStr && timeStr !== "00:00:00") return "--:--";
  const parts = String(timeStr).split(":");
  if (parts.length >= 2) return parts[0].padStart(2, "0") + ":" + parts[1].padStart(2, "0");
  return String(timeStr).slice(0,5);
}

// Return true if checkIn > checkOut (shift passes to next day) based on HH:MM or HH:MM:SS strings
function isNextDayShift(checkIn, checkOut) {
  if (!checkIn || !checkOut) return false;
  const toMinutes = s => {
    const p = String(s).split(":");
    const h = Number(p[0] || 0);
    const m = Number(p[1] || 0);
    return h * 60 + m;
  };
  try {
    return toMinutes(checkIn) > toMinutes(checkOut);
  } catch (e) {
    return false;
  }
}

const WEEKDAYS = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

export default function EmployeeAttendanceCalendar({ employee, year, month, onClose, area }) {
  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month); // 0: Sunday
  // Chuyển về 0: Monday, 6: Sunday
  const startOffset = (firstDay + 6) % 7;
  const totalCells = Math.ceil((days.length + startOffset) / 7) * 7;
  const cells = [];
  for (let i = 0; i < totalCells; i++) {
    if (i < startOffset || i >= days.length + startOffset) {
      cells.push(null);
    } else {
      cells.push(days[i - startOffset]);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 min-w-[900px] max-w-[98vw] relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={onClose}>×</button>
        <div className="font-bold text-lg mb-2">Chi tiết bảng công tháng {month}/{year}</div>
        <div className="mb-2 text-blue-700 font-semibold">
          {employee.employeeName} <span className="text-xs font-normal">{employee.employeeId}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="border text-xs w-full">
            <thead>
              <tr className="bg-gray-100">
                {WEEKDAYS.map((wd, idx) => (
                  <th key={wd} className={"border px-2 py-1 " + (idx === 6 ? "text-red-500" : "")}>{wd}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: totalCells / 7 }).map((_, rowIdx) => (
                <tr key={rowIdx}>
                  {Array.from({ length: 7 }).map((_, colIdx) => {
                    const cellIdx = rowIdx * 7 + colIdx;
                    const day = cells[cellIdx];
                    let rec = null;
                    if (day) rec = employee.records[day - 1] || {};
                    // Nếu có id thì coi là shiftName
                    if (rec && rec.id && !rec.shiftName) rec.shiftName = rec.id;
                    let cellClass = "border align-top px-2 py-1 min-h-[70px] ";
                    if (colIdx === 6) cellClass += "text-red-500 ";
                    // Nếu là ngày trong tuần (không phải T7, CN) và không có dữ liệu thì tô đỏ nhạt
                    const isNoData = day && (!rec || (!rec.shiftName && !rec.leaveType && !rec.checkIn && !rec.checkOut));
                    if (isNoData && colIdx !== 5 && colIdx !== 6) cellClass += "bg-red-100 ";
                    if (rec && (rec.leaveType || rec.status === "ABSENT" || rec.status === "LATE" || rec.status === "EARLY")) cellClass += "bg-red-50 ";
                    return (
                      <td key={colIdx} className={cellClass} style={{height: 70}}>
                        {day ? (
                          <div>
                            <div className="font-bold text-base mb-1" style={{color: colIdx === 6 ? '#e11d48' : undefined}}>{day.toString().padStart(2, '0')}</div>
                            {rec && rec.leaveType ? (
                              <div className="font-bold text-red-500 text-sm">{rec.leaveType}</div>
                            ) : (rec && (rec.shiftId || rec.checkIn || rec.checkOut || rec.checkInShift1 || rec.checkOutShift1)) ? (
                              <>
                                {area !== "Nhà máy" && rec.shiftId && <div className="text-green-700 font-semibold text-xs">{rec.shiftId}</div>}
                                {(rec.checkInShift1 || rec.checkOutShift1 || rec.checkInShift2 || rec.checkOutShift2) ? (
                                  <div className="text-xs">
                                    {area === "Nhà máy" ? (
                                      <>
                                        {rec.checkInShift1 || rec.checkOutShift1 ? (
                                          <div>{formatHM(rec.checkInShift1)}{" — "}{formatHM(rec.checkOutShift1)}{isNextDayShift(rec.checkInShift1, rec.checkOutShift1) ? ' (+1)' : ''}</div>
                                        ) : null}
                                        {rec.checkInShift2 || rec.checkOutShift2 ? (
                                          <div>{formatHM(rec.checkInShift2)}{" — "}{formatHM(rec.checkOutShift2)}{isNextDayShift(rec.checkInShift2, rec.checkOutShift2) ? ' (+1)' : ''}</div>
                                        ) : null}
                                      </>
                                    ) : (
                                      <>
                                        {rec.checkInShift1 || rec.checkOutShift1 ? (
                                          <div>Ca 1: <span className={rec.status === 'LATE' ? 'text-red-500 font-bold' : ''}>{formatHM(rec.checkInShift1)}</span>{" — "}<span className={rec.status === 'EARLY' ? 'text-red-500 font-bold' : ''}>{formatHM(rec.checkOutShift1)}</span>{isNextDayShift(rec.checkInShift1, rec.checkOutShift1) ? ' (+1)' : ''}</div>
                                        ) : null}
                                        {rec.checkInShift2 || rec.checkOutShift2 ? (
                                          <div>Ca 2: <span className={rec.status === 'LATE' ? 'text-red-500 font-bold' : ''}>{formatHM(rec.checkInShift2)}</span>{" — "}<span className={rec.status === 'EARLY' ? 'text-red-500 font-bold' : ''}>{formatHM(rec.checkOutShift2)}</span>{isNextDayShift(rec.checkInShift2, rec.checkOutShift2) ? ' (+1)' : ''}</div>
                                        ) : null}
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  (rec.checkIn || rec.checkOut) && (
                                    <div className="text-xs">
                                      <span className={rec.status === 'LATE' ? 'text-red-500 font-bold' : ''}>{area === "Nhà máy" ? formatHM(rec.checkIn) : (rec.checkIn || '--:--')}</span>
                                      {" — "}
                                      <span className={rec.status === 'EARLY' ? 'text-red-500 font-bold' : ''}>{area === "Nhà máy" ? formatHM(rec.checkOut) : (rec.checkOut || '--:--')}</span>
                                      {area === "Nhà máy" && isNextDayShift(rec.checkIn, rec.checkOut) ? ' (+1)' : ''}
                                    </div>
                                  )
                                )}
                              </>
                            ) : null}
                          </div>
                        ) : (
                          <div className="text-gray-300 font-bold">{(rowIdx === totalCells / 7 - 1 && colIdx === 0) ? (cells.length - days.length).toString().padStart(2, '0') : ''}</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
