import React, { useState, useMemo } from "react";

const CURRENT_YEAR = new Date().getFullYear();
const UNITS = ["Tất cả đơn vị", "Nhà máy", "Văn phòng"];

// Demo data
const EMPLOYEES = [
  {
    employeeCode: "NV00001",
    name: "Nguyễn Văn A",
    title: "Nhân viên",
    department: "Hành chính",
    unit: "Nhà máy",
    joinDate: "10/05/2025",
    lastYearRemain: 2,
    seniorityMonths: 8, // tháng làm việc chính thức
    bonusLeave: 0,
    usedLeave: 1,
    approvedLeave: 1,
  },
  {
    employeeCode: "NV00002",
    name: "Nguyễn Thị B",
    title: "Quản lý",
    department: "Sản xuất",
    unit: "Nhà máy",
    joinDate: "20/05/2025",
    lastYearRemain: 1,
    seniorityMonths: 7.5,
    bonusLeave: 0,
    usedLeave: 0,
    approvedLeave: 0,
  },
  // ... thêm mẫu
];

function calcStandardLeave() {
  return 12;
}
function calcCurrentYearLeave(joinDate) {
  // Tính số NP năm nay theo ngày ký HĐLĐ
  const [d, m, y] = joinDate.split("/").map(Number);
  if (y < CURRENT_YEAR) return 12;
  if (m > 12 || m < 1) return 0;
  // Nếu lên chính thức trước ngày 15 thì +1, sau 15 thì +0.5 cho tháng đó
  let months = 12 - m + 1;
  if (d <= 15) months += 0;
  else months -= 0.5;
  return Math.max(months, 0);
}
function calcSeniorityLeave(months) {
  // Cứ 60 tháng (5 năm) được +1 ngày phép
  return Math.floor(months / 60);
}
function calcTotalLeave(current, lastYear, seniority, bonus, cancel) {
  return current + lastYear + seniority + bonus - cancel;
}

export default function LeaveSummaryTable({ userRole = "HR" }) {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [unit, setUnit] = useState(UNITS[0]);
  const [search, setSearch] = useState("");
  const [data, setData] = useState(EMPLOYEES);
  const [editIdx, setEditIdx] = useState(null);
  const [editUsedLeave, setEditUsedLeave] = useState(0);
  const [editBonusLeave, setEditBonusLeave] = useState(0);

  // Filtered data
  const filtered = useMemo(() => {
    let result = data;
    if (unit !== UNITS[0]) {
      result = result.filter(e => e.unit === unit);
    }
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      result = result.filter(e =>
        e.employeeCode.toLowerCase().includes(s) ||
        e.name.toLowerCase().includes(s)
      );
    }
    return result;
  }, [data, unit, search]);

  // Edit handler
  const handleEdit = idx => {
    setEditIdx(idx);
    setEditUsedLeave(filtered[idx].usedLeave);
    setEditBonusLeave(filtered[idx].bonusLeave);
  };
  const handleSave = idx => {
    const emp = filtered[idx];
    setData(prev => prev.map(e =>
      e.employeeCode === emp.employeeCode
        ? { ...e, usedLeave: editUsedLeave, bonusLeave: editBonusLeave }
        : e
    ));
    setEditIdx(null);
  };

  return (
    <div className="p-6">
      <div className="text-xl font-bold mb-4">Bảng tổng hợp nghỉ phép năm</div>
      <div className="flex gap-4 mb-4 items-end">
        <div>
          <label className="block text-xs mb-1">Năm</label>
          <select className="border rounded px-2 py-1" value={year} onChange={e => setYear(Number(e.target.value))}>
            {[CURRENT_YEAR, CURRENT_YEAR-1, CURRENT_YEAR-2].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Đơn vị</label>
          <select className="border rounded px-2 py-1" value={unit} onChange={e => setUnit(e.target.value)}>
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs mb-1">Tìm kiếm mã NV, tên NV</label>
          <div className="flex gap-2">
            <input
              className="border rounded px-2 py-1 flex-1"
              placeholder="Nhập mã hoặc tên nhân viên..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button className="bg-slate-800 text-white px-4 rounded" onClick={e => e.preventDefault()}>Tìm kiếm</button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-blue-100">
              <th className="border px-2 py-1">Mã NV</th>
              <th className="border px-2 py-1">Họ và tên</th>
              <th className="border px-2 py-1">Chức danh</th>
              <th className="border px-2 py-1">Phòng ban</th>
              <th className="border px-2 py-1">Số NP tiêu chuẩn (1)</th>
              <th className="border px-2 py-1">Số NP năm nay (2)</th>
              <th className="border px-2 py-1">Số NP năm trước chuyển sang (3)</th>
              <th className="border px-2 py-1">Số NP tăng theo thâm niên (4)</th>
              <th className="border px-2 py-1">Số NP được thưởng khác (5)</th>
              <th className="border px-2 py-1">Số NP bị hủy (6)</th>
              <th className="border px-2 py-1">Tổng số NP được dùng cả năm (7)</th>
              <th className="border px-2 py-1">Số NP được sử dụng đến tháng hiện tại (8)</th>
              <th className="border px-2 py-1">Số NP đã sử dụng (9)</th>
              <th className="border px-2 py-1">Số NP còn lại cả năm (10)</th>
              <th className="border px-2 py-1">Số NP còn lại đến tháng hiện tại (11)</th>
              {userRole === "HR" && <th className="border px-2 py-1">Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={16} className="text-center text-gray-500">Không có kết quả phù hợp.</td></tr>
            ) : (
              filtered.map((item, i) => {
                const standardLeave = calcStandardLeave();
                const currentYearLeave = calcCurrentYearLeave(item.joinDate);
                const seniorityLeave = calcSeniorityLeave(item.seniorityMonths);
                const cancelLeave = 0; // demo
                const totalLeave = calcTotalLeave(currentYearLeave, item.lastYearRemain, seniorityLeave, item.bonusLeave, cancelLeave);
                const usedLeave = item.usedLeave;
                const approvedLeave = item.approvedLeave;
                const remainYear = totalLeave - usedLeave;
                const remainMonth = approvedLeave - usedLeave;
                return (
                  <tr key={item.employeeCode}>
                    <td className="border px-2 py-1">{item.employeeCode}</td>
                    <td className="border px-2 py-1">{item.name}</td>
                    <td className="border px-2 py-1">{item.title}</td>
                    <td className="border px-2 py-1">{item.department}</td>
                    <td className="border px-2 py-1 text-center">{standardLeave}</td>
                    <td className="border px-2 py-1 text-center">{currentYearLeave}</td>
                    <td className="border px-2 py-1 text-center">{item.lastYearRemain}</td>
                    <td className="border px-2 py-1 text-center">{seniorityLeave}</td>
                    <td className="border px-2 py-1 text-center">{editIdx === i ? (
                      <input type="number" className="border rounded px-2 py-1 w-16" value={editBonusLeave} onChange={e => setEditBonusLeave(Number(e.target.value))} />
                    ) : item.bonusLeave}</td>
                    <td className="border px-2 py-1 text-center">{cancelLeave}</td>
                    <td className="border px-2 py-1 text-center">{totalLeave}</td>
                    <td className="border px-2 py-1 text-center">{approvedLeave}</td>
                    <td className="border px-2 py-1 text-center">{editIdx === i ? (
                      <input type="number" className="border rounded px-2 py-1 w-16" value={editUsedLeave} onChange={e => setEditUsedLeave(Number(e.target.value))} />
                    ) : usedLeave}</td>
                    <td className="border px-2 py-1 text-center">{remainYear}</td>
                    <td className="border px-2 py-1 text-center">{remainMonth}</td>
                    {userRole === "HR" && (
                      <td className="border px-2 py-1 text-center">
                        {editIdx === i ? (
                          <>
                            <button className="bg-green-500 text-white px-2 py-1 rounded mr-1" onClick={() => handleSave(i)}>Lưu</button>
                            <button className="bg-gray-400 text-white px-2 py-1 rounded" onClick={() => setEditIdx(null)}>Hủy</button>
                          </>
                        ) : (
                          <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => handleEdit(i)}>Sửa</button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
