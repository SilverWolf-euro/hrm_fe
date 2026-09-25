import React, { useState, useMemo } from "react";
import LeaveRequestDetail from "./LeaveRequestDetail";
// Sample data for demo
const LEAVE_REQUEST_SAMPLE = [
  {
    applicationCode: "RP-2026-001",
    createdDate: "01/03/2026",
    employeeCode: "NV00003",
    name: "Phạm Văn D",
    department: "Phòng Kỹ thuật",
    leaveType: "Nghỉ phép có hưởng lương",
    leaveDays: 3,
    status: "Chờ duyệt",
  },
  {
    applicationCode: "RP-2026-004",
    createdDate: "01/03/2026",
    employeeCode: "NV00005",
    name: "Võ Thị E",
    department: "Phòng Marketing",
    leaveType: "Không lương",
    leaveDays: 10,
    status: "Đã duyệt",
  },
  {
    applicationCode: "RP-2026-005",
    createdDate: "01/03/2026",
    employeeCode: "NV00008",
    name: "Lữ Văn H",
    department: "Phòng Kinh Doanh",
    leaveType: "Không lương",
    leaveDays: 6,
    status: "Đã duyệt",
  },
  {
    applicationCode: "RP-2026-006",
    createdDate: "01/03/2026",
    employeeCode: "NV00006",
    name: "Trần Thị K",
    department: "Phòng Hành Chính",
    leaveType: "Nghỉ chế độ",
    leaveDays: 1,
    status: "Từ chối",
  },
  {
    applicationCode: "RP-2026-007",
    createdDate: "01/03/2026",
    employeeCode: "NV00009",
    name: "Hoàng Văn M",
    department: "Phòng Kỹ thuật",
    leaveType: "Nghỉ phép có hưởng lương",
    leaveDays: 3,
    status: "Đã duyệt",
  },
  {
    applicationCode: "RP-2026-008",
    createdDate: "05/03/2026",
    employeeCode: "NV00010",
    name: "Đỗ Thị N",
    department: "Phòng Marketing",
    leaveType: "Không lương",
    leaveDays: 15,
    status: "Đã duyệt",
  },
];

const DEPARTMENTS = [
  "Tất cả phòng ban",
  "Phòng Kỹ thuật",
  "Phòng Marketing",
  "Phòng Kinh Doanh",
  "Phòng Hành Chính",
];

const STATUS_COLORS = {
  "Chờ duyệt": "bg-gray-400 text-white",
  "Đang duyệt": "bg-yellow-400 text-white",
  "Đã duyệt": "bg-green-500 text-white",
  "Từ chối": "bg-red-500 text-white",
};

export default function LeaveRequestList({ userRole = "HR", userDepartment = "Phòng Kỹ thuật" }) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [department, setDepartment] = useState(userRole === "MANAGER" ? userDepartment : "Tất cả phòng ban");
  const [search, setSearch] = useState("");
  const [data, setData] = useState(LEAVE_REQUEST_SAMPLE);
  const [viewIdx, setViewIdx] = useState(null);

  // Filtering logic
  const filtered = useMemo(() => {
    let result = data;
    // Filter by date range (createdDate)
    if (fromDate && toDate) {
      const from = fromDate.split("-").reverse().join("/");
      const to = toDate.split("-").reverse().join("/");
      result = result.filter(e => {
        const created = e.createdDate.split("/").reverse().join("/");
        return created >= from && created <= to;
      });
    }
    // Filter by department
    if (department && department !== "Tất cả phòng ban") {
      result = result.filter(e => e.department === department);
    }
    // Role-based filter
    if (userRole === "MANAGER") {
      result = result.filter(e => e.department === userDepartment);
    } else if (userRole === "DIRECTOR") {
      result = result.filter(e => e.leaveDays >= 7);
    }
    // Search
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      result = result.filter(e =>
        e.applicationCode.toLowerCase().includes(s) ||
        e.employeeCode.toLowerCase().includes(s) ||
        e.name.toLowerCase().includes(s)
      );
    }
    // Sort by createdDate (desc)
    result = result.slice().sort((a, b) => {
      const [da, ma, ya] = a.createdDate.split("/").map(Number);
      const [db, mb, yb] = b.createdDate.split("/").map(Number);
      const dateA = new Date(ya, ma - 1, da);
      const dateB = new Date(yb, mb - 1, db);
      return dateB - dateA;
    });
    return result;
  }, [data, fromDate, toDate, department, search, userRole, userDepartment]);

  return (
    <div className="p-6">
      <div className="text-xl font-bold mb-4">DANH SÁCH ĐƠN NGHỈ PHÉP</div>
      <div className="flex gap-4 mb-4 items-end">
        <div>
          <label className="block text-xs mb-1">Từ ngày</label>
          <input className="border rounded px-2 py-1" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs mb-1">Đến ngày</label>
          <input className="border rounded px-2 py-1" type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs mb-1">Phòng ban</label>
          <select
            className="border rounded px-2 py-1"
            value={department}
            onChange={e => setDepartment(e.target.value)}
            disabled={userRole === "MANAGER"}
          >
            {DEPARTMENTS.map(dep => (
              <option key={dep} value={dep}>{dep}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs mb-1">Tìm kiếm mã đơn, mã NV, tên NV</label>
          <div className="flex gap-2">
            <input
              className="border rounded px-2 py-1 flex-1"
              placeholder="Tìm kiếm..."
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
              <th className="border px-2 py-1">STT</th>
              <th className="border px-2 py-1">Mã đơn</th>
              <th className="border px-2 py-1">Ngày tạo đơn</th>
              <th className="border px-2 py-1">Mã NV</th>
              <th className="border px-2 py-1">Nhân viên</th>
              <th className="border px-2 py-1">Phòng ban</th>
              <th className="border px-2 py-1">Loại nghỉ</th>
              <th className="border px-2 py-1">Số ngày</th>
              <th className="border px-2 py-1">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center text-gray-500">Không có kết quả phù hợp.</td></tr>
            ) : (
              filtered.map((item, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1 text-center">{i+1}</td>
                  <td className="border px-2 py-1 text-blue-700 font-bold cursor-pointer underline" onClick={() => setViewIdx(i)}>{item.applicationCode}</td>
                  <td className="border px-2 py-1 text-center">{item.createdDate}</td>
                  <td className="border px-2 py-1">{item.employeeCode}</td>
                  <td className="border px-2 py-1">{item.name}</td>
                  <td className="border px-2 py-1">{item.department}</td>
                  <td className="border px-2 py-1">{item.leaveType}</td>
                  <td className="border px-2 py-1 text-center">{item.leaveDays}</td>
                  <td className={`border px-2 py-1 text-center`}>
                    <span className={`inline-block rounded-md px-3 py-1 text-xs font-semibold ${STATUS_COLORS[item.status] || "bg-gray-200 text-gray-700"}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Popup chi tiết đơn nghỉ phép */}
      {viewIdx !== null && filtered[viewIdx] && (
        <LeaveRequestDetail
          data={filtered[viewIdx]}
          userRole={userRole}
          onClose={() => setViewIdx(null)}
          onApprove={updated => {
            // Cập nhật trạng thái đơn trong danh sách
            setData(prev => prev.map((d, idx) => idx === viewIdx ? updated : d));
            setViewIdx(null);
          }}
          onReject={updated => {
            setData(prev => prev.map((d, idx) => idx === viewIdx ? updated : d));
            setViewIdx(null);
          }}
        />
      )}
    </div>
  );
}
