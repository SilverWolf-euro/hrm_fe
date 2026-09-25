import React, { useState, useMemo } from "react";
import EmployeeTerminationForm from "../components/EmployeeTerminationForm";
import EmployeeTerminationDetail from "../components/EmployeeTerminationDetail";

// Sample data for demo
const EMPLOYEE_TERMINATED_SAMPLE = [
  {
    applicationDate: "15/06/2025",
    employeeCode: "DMQ201",
    name: "Đặng Minh Q.",
    position: "Công nhân SX chính",
    department: "Bộ phận SX Nhôm",
    location: "Nhà máy",
    leaveDate: "27/06/2025",
    joinDate: "01/06/2023",
    reason: "2 năm 6 tháng",
    workTime: "2 năm 6 tháng",
    leaveReason: "Tự nguyện",
    contractType: "Chính thức",
    applicationStatus : "Đã duyệt",
    approval: [
      { approver: "Trần Văn A.", approverPosition: "Giám đốc", date: "20/06/2025", status: "Đã duyệt" },
      { approver: "Nguyễn Thị B.", approverPosition: "Trưởng phòng", date: "22/06/2025", status: "Đã duyệt" },
      { approver: "Lê Văn C.", approverPosition: "Nhân sự", date: "25/06/2025", status: "Đã duyệt" },
    ]
  },
  {
    applicationDate: "16/06/2025",
    employeeCode: "DMQ202",
    name: "Đặng Minh K.",
    position: "Trưởng phòng",
    department: "Bộ phận Kinh doanh",
    location: "Văn phòng",
    leaveDate: "02/06/2025",
    joinDate: "11/06/2023",
    reason: "2 năm 6 tháng",
    workTime: "2 năm 6 tháng",
    leaveReason: "Tự nguyện",
    contractType: "Chính thức",
    applicationStatus: "Từ chối",
    approval: [
      { approver: "Trần Văn A.", approverPosition: "Giám đốc", date: "20/06/2025", status: "Từ chối" },
      { approver: "Lê Văn C.", approverPosition: "Nhân sự", date: "25/06/2025", status: "Chờ duyệt" },
    ]
  },
  {
    applicationDate: "16/06/2025",
    employeeCode: "DMQ203",
    name: "Đặng Minh H.",
    position: "Nhân viên IT",
    department: "AURA",
    location: "Văn phòng",
    leaveDate: "02/06/2025",
    joinDate: "11/06/2023",
    reason: "2 năm 6 tháng",
    workTime: "2 năm 6 tháng",
    leaveReason: "Tự nguyện",
    contractType: "Chính thức",
    applicationStatus: "Đang duyệt",
    approval: [
      { approver: "Trần Văn A.", approverPosition: "Giám đốc", date: "20/06/2025", status: "Đang duyệt" },
      { approver: "Nguyễn Thị B.", approverPosition: "Trưởng phòng", date: "22/06/2025", status: "Đang duyệt" },
      { approver: "Lê Văn C.", approverPosition: "Nhân sự", date: "25/06/2025", status: "Đang duyệt" },
    ]
  },
  // ... add more sample rows as needed
];

const FILTER_TYPES = [
  { label: "Theo tháng", value: "month" },
  { label: "Theo quý", value: "quarter" },
  { label: "Theo năm", value: "year" },
  { label: "Từ ngày - đến ngày", value: "range" },
];

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("vi-VN");
}
export default function EmployeeTerminationList() {
  const [filterType, setFilterType] = useState("month");
  const [month, setMonth] = useState("");
  const [quarter, setQuarter] = useState("");
  const [year, setYear] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState(EMPLOYEE_TERMINATED_SAMPLE);
  const [viewIdx, setViewIdx] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Filtering logic
  const filtered = useMemo(() => {
    let result = data;
    // Filter by time
    if (filterType === "month" && month && year) {
      result = result.filter(e => {
        const [d, m, y] = e.leaveDate.split("/").map(Number);
        return m === Number(month) && y === Number(year);
      });
    } else if (filterType === "quarter" && quarter && year) {
      const months = {
        "1": [1, 2, 3],
        "2": [4, 5, 6],
        "3": [7, 8, 9],
        "4": [10, 11, 12],
      };
      result = result.filter(e => {
        const [d, m, y] = e.leaveDate.split("/").map(Number);
        return months[quarter].includes(m) && y === Number(year);
      });
    } else if (filterType === "year" && year) {
      result = result.filter(e => {
        const [d, m, y] = e.leaveDate.split("/").map(Number);
        return y === Number(year);
      });
    } else if (filterType === "range" && fromDate && toDate) {
      const from = fromDate.split("-").reverse().join("/");
      const to = toDate.split("-").reverse().join("/");
      result = result.filter(e => {
        const leave = e.leaveDate.split("/").reverse().join("/");
        return leave >= from && leave <= to;
      });
    }
    // Search
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      result = result.filter(e =>
        e.employeeCode.toLowerCase().includes(s) ||
        e.name.toLowerCase().includes(s)
      );
    }
    // Sort by leaveDate (desc)
    result = result.slice().sort((a, b) => {
      const [da, ma, ya] = a.leaveDate.split("/").map(Number);
      const [db, mb, yb] = b.leaveDate.split("/").map(Number);
      const dateA = new Date(ya, ma - 1, da);
      const dateB = new Date(yb, mb - 1, db);
      return dateB - dateA;
    });
    return result;
  }, [data, filterType, month, quarter, year, fromDate, toDate, search]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="text-xl font-bold">DANH SÁCH NHÂN SỰ NGHỈ VIỆC</div>
        <button className="bg-fuchsia-600 text-white px-4 py-2 rounded" onClick={() => setShowForm(true)}>Thôi việc nhân sự</button>
      </div>
      <div className="flex gap-4 mb-4 items-end">
        <div>
          <label className="block text-xs font-semibold mb-1">Loại lọc</label>
          <select className="border rounded px-2 py-1" value={filterType} onChange={e => setFilterType(e.target.value)}>
            {FILTER_TYPES.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {filterType === "month" && (
          <>
            <div>
              <label className="block text-xs mb-1">Tháng</label>
              <select className="border rounded px-2 py-1" value={month} onChange={e => setMonth(e.target.value)}>
                <option value="">Chọn tháng</option>
                {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>{i+1}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Năm</label>
              <input className="border rounded px-2 py-1 w-20" type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="Chọn năm" />
            </div>
          </>
        )}
        {filterType === "quarter" && (
          <>
            <div>
              <label className="block text-xs mb-1">Quý</label>
              <select className="border rounded px-2 py-1" value={quarter} onChange={e => setQuarter(e.target.value)}>
                <option value="">Chọn quý</option>
                {[1,2,3,4].map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Năm</label>
              <input className="border rounded px-2 py-1 w-20" type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="Chọn năm" />
            </div>
          </>
        )}
        {filterType === "year" && (
          <div>
            <label className="block text-xs mb-1">Năm</label>
            <input className="border rounded px-2 py-1 w-20" type="number" value={year} onChange={e => setYear(e.target.value)} placeholder="Chọn năm" />
          </div>
        )}
        {filterType === "range" && (
          <>
            <div>
              <label className="block text-xs mb-1">Từ ngày</label>
              <input className="border rounded px-2 py-1" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs mb-1">Đến ngày</label>
              <input className="border rounded px-2 py-1" type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
          </>
        )}
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Lọc</button>
        <div className="flex-1">
          <label className="block text-xs mb-1">Tìm kiếm theo mã NV, tên NV</label>
          <div className="flex gap-2">
            <input className="border rounded px-2 py-1 flex-1" placeholder="Tìm kiếm theo mã NV, tên NV..." value={search} onChange={e => setSearch(e.target.value)} />
            <button className="bg-slate-800 text-white px-4 rounded" onClick={e => e.preventDefault()}>Tìm kiếm</button>
          </div>
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Xuất Excel</button>
        <button className="bg-green-500 text-white px-4 py-2 rounded">Xem báo cáo</button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-blue-100">
              <th className="border px-2 py-1">STT</th>
              <th className="border px-2 py-1">Mã nhân viên</th>
              <th className="border px-2 py-1">Họ và tên</th>
              <th className="border px-2 py-1">Chức vụ</th>
              <th className="border px-2 py-1">Phòng/bộ phận</th>
              <th className="border px-2 py-1">Địa điểm làm việc</th>
              <th className="border px-2 py-1">Ngày dừng làm việc</th>
              <th className="border px-2 py-1">Thời gian làm việc</th>
              <th className="border px-2 py-1">Lý do nghỉ việc</th>
              <th className="border px-2 py-1">Loại HĐLĐ</th>
              <th className="border px-2 py-1">Trạng thái</th>
              <th className="border px-2 py-1">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={12} className="text-center text-gray-500">Không có kết quả phù hợp với yêu cầu tìm kiếm.</td></tr>
            ) : (
              filtered.map((item, i) => {
                // Giả lập trạng thái tạo quyết định nghỉ việc (demo: nếu có field decisionCreated)
                const decisionCreated = item.decisionCreated;
                // Giả lập role và lượt duyệt (cần thay bằng logic thực tế)
                const userRole = "MANAGER"; // demo, lấy từ context thực tế
                const isCurrentApprover = true; // demo, kiểm tra đúng lượt duyệt
                // Logic enable/disable
                const canApproveOrReject = (item.applicationStatus === "Chờ duyệt" || item.applicationStatus === "Đang duyệt") && isCurrentApprover;
                const canCreateDecision = item.applicationStatus === "Đã duyệt" && !decisionCreated;
                return (
                  <tr key={i}>
                    <td className="border px-2 py-1 text-center">{i+1}</td>
                    <td className="border px-2 py-1 text-blue-700 font-bold cursor-pointer underline" onClick={() => setViewIdx(i)}>{item.employeeCode}</td>
                    <td className="border px-2 py-1">{item.name}</td>
                    <td className="border px-2 py-1">{item.position}</td>
                    <td className="border px-2 py-1">{item.department}</td>
                    <td className="border px-2 py-1">{item.location}</td>
                    <td className="border px-2 py-1 text-center">{item.leaveDate}</td>
                    <td className="border px-2 py-1 text-center">{item.workTime}</td>
                    <td className="border px-2 py-1">{item.leaveReason}</td>
                    <td className="border px-2 py-1">{item.contractType}</td>
                    <td className="border px-2 py-1 text-center">
                      <span
                        className={
                          'inline-block rounded-md px-3 py-1 text-xs font-semibold ' +
                          (item.applicationStatus === 'Chờ duyệt' ? 'bg-gray-400 text-white' :
                           item.applicationStatus === 'Đang duyệt' ? 'bg-yellow-400 text-white' :
                           item.applicationStatus === 'Đã duyệt' ? 'bg-green-500 text-white' :
                           item.applicationStatus === 'Từ chối' ? 'bg-red-500 text-white' :
                           'bg-gray-200 text-gray-700')
                        }
                      >
                        {item.applicationStatus}
                      </span>
                    </td>
                    <td className="border px-2 py-1 min-w-[120px] flex gap-2 justify-center items-center">
                      {/* Xem chi tiết */}
                      <button
                        title="Xem chi tiết"
                        className={`rounded-md p-1.5 border transition ${viewIdx === i ? 'bg-blue-100 border-blue-400' : 'bg-white border-blue-200 hover:bg-blue-50 hover:border-blue-400'}`}
                        style={{ color: '#2563eb' }}
                        onClick={() => setViewIdx(i)}
                      >
                        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                          <path d="M10 4.167c-4.167 0-7.5 3.333-7.5 5.833s3.333 5.833 7.5 5.833 7.5-3.333 7.5-5.833-3.333-5.833-7.5-5.833zm0 10c-2.5 0-4.583-2.083-4.583-4.167S7.5 5.833 10 5.833s4.583 2.083 4.583 4.167S12.5 14.167 10 14.167zm0-6.25a2.083 2.083 0 100 4.166 2.083 2.083 0 000-4.166z" fill="#2563eb"/>
                        </svg>
                      </button>
                      {/* Duyệt */}
                      <button
                        title="Duyệt"
                        className="rounded-md p-1.5 border border-green-200 bg-white hover:bg-green-50 hover:border-green-400 transition disabled:opacity-50"
                        style={{ color: '#22c55e' }}
                        disabled={!canApproveOrReject}
                        onClick={() => alert('Duyệt đơn: ' + item.employeeCode)}
                      >
                        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                          <path d="M7.5 13.333l-3.333-3.333 1.175-1.175L7.5 10.983l7.158-7.158 1.175 1.175L7.5 13.333z" fill="#22c55e"/>
                        </svg>
                      </button>
                      {/* Từ chối */}
                      <button
                        title="Từ chối"
                        className="rounded-md p-1.5 border border-red-200 bg-white hover:bg-red-50 hover:border-red-400 transition disabled:opacity-50"
                        style={{ color: '#ef4444' }}
                        disabled={!canApproveOrReject}
                        onClick={() => alert('Từ chối đơn: ' + item.employeeCode)}
                      >
                        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                          <path d="M6.667 6.667l6.666 6.666m0-6.666l-6.666 6.666" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                      {/* Tạo quyết định nghỉ việc */}
                      <button
                        title="Tạo QĐ nghỉ việc"
                        className="rounded-md p-1.5 border border-fuchsia-200 bg-white hover:bg-fuchsia-50 hover:border-fuchsia-400 transition disabled:opacity-50"
                        style={{ color: '#a21caf' }}
                        disabled={!canCreateDecision}
                        onClick={() => alert('Tạo quyết định nghỉ việc cho: ' + item.employeeCode)}
                      >
                        <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                          <rect x="4" y="4" width="12" height="16" rx="2" fill="#a21caf"/>
                          <rect x="7" y="8" width="6" height="2" rx="1" fill="#fff"/>
                          <rect x="7" y="12" width="6" height="2" rx="1" fill="#fff"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {/* Popup chi tiết nghỉ việc */}
      {viewIdx !== null && filtered[viewIdx] && (
        <EmployeeTerminationDetail data={filtered[viewIdx]} onClose={() => setViewIdx(null)} />
      )}
      {/* Form thêm nhân sự nghỉ việc */}
      <EmployeeTerminationForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={form => {
          setData(prev => [
            {
              employeeCode: form.employeeCode,
              name: form.name,
              position: "", // Có thể bổ sung trường này nếu form có
              department: form.department,
              location: form.location,
              leaveDate: form.leaveDate ? form.leaveDate.split("-").reverse().join("/") : "",
              joinDate: "", // Có thể bổ sung trường này nếu form có
              reason: "",
              workTime: "", // Có thể tính toán nếu có joinDate
              leaveReason: form.leaveReason,
              contractType: "", // Có thể bổ sung trường này nếu form có
              // Các trường khác nếu cần
            },
            ...prev
          ]);
        }}
      />
    </div>
  );
}
