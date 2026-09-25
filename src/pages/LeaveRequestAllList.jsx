import React, { useEffect, useState, useMemo } from "react";
import { getAllLeaveRequests } from "../services/leaveRequestAllService";
import { getDepartments } from "../services/departmentService";
// import LeaveRequestAllDetail from "./LeaveRequestAllDetail";
import LeaveRequestDetail from "./LeaveRequestDetail";

const STATUS_COLORS = {
  "Chờ duyệt": "bg-orange-500 text-white",
  "Đang duyệt": "bg-yellow-400 text-white",
  "Đã duyệt": "bg-green-500 text-white",
  "Từ chối": "bg-red-500 text-white",
};



export default function LeaveRequestAllList() {

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [viewCode, setViewCode] = useState(null);
  
  useEffect(() => {
    getDepartments().then(setDepartments).catch(() => setDepartments([]));
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [fromDate, toDate, department, search, status, page, size]);

  async function fetchData() {
    setLoading(true);
    const res = await getAllLeaveRequests({
      from_date: fromDate,
      to_date: toDate,
      department_code: department || undefined,
      keywords: search,
      status: status || undefined,
      page,
      size,
    });
    setData(res.items || []);
    setTotal(res.total || 0);
    setLoading(false);
  }

  // Đã bỏ các filter ở client để hiển thị tất cả các bản ghi đúng với dữ liệu phân trang từ API
  const filtered = useMemo(() => {
    return data;
  }, [data]);

  // Tính tổng số trang
  const totalPages = Math.ceil(total / size);

  // Render phân trang
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    // Tính toán danh sách các trang cần hiển thị
    let pageNumbers = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (page <= 4) {
        pageNumbers = [1, 2, 3, 4, 5, '...', totalPages];
      } else if (page >= totalPages - 3) {
        pageNumbers = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
      } else {
        pageNumbers = [1, '...', page - 1, page, page + 1, '...', totalPages];
      }
    }

    const pages = pageNumbers.map((p, index) => {
      if (p === '...') {
        return <span key={`ellipsis-${index}`} className="px-2">...</span>;
      }
      return (
        <button
          key={p}
          className={
            "px-3 py-1 border rounded mx-1 " +
            (p === page ? "bg-blue-600 text-white" : "bg-white hover:bg-blue-100")
          }
          onClick={() => setPage(p)}
          disabled={p === page}
        >
          {p}
        </button>
      );
    });
    return (
      <div className="flex justify-center items-center mt-4">
        <button
          className="px-3 py-1 border rounded mx-1"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          &lt;
        </button>
        {pages}
        <button
          className="px-3 py-1 border rounded mx-1"
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        >
          &gt;
        </button>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="text-xl font-bold mb-4">Danh sách đơn nghỉ nhân viên</div>
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
          >
            <option value="">Tất cả phòng ban</option>
            {departments && departments.map(dep => (
              <option key={dep.code} value={dep.code}>
                {dep.name_vi || dep.name_en || dep.name || dep.code}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Trạng thái</label>
          <select
            className="border rounded px-2 py-1"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ duyệt</option>
            <option value="IN_PROGRESS">Đang duyệt</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="REJECTED">Từ chối</option>
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
            <button className="bg-slate-800 text-white px-4 rounded" onClick={e => { e.preventDefault(); fetchData(); }}>Tìm kiếm</button>
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
              <th className="border px-2 py-1">Ngày bắt đầu nghỉ</th>
              <th className="border px-2 py-1">Ngày kết thúc nghỉ</th>
              <th className="border px-2 py-1">Số ngày</th>
              <th className="border px-2 py-1">Trạng thái</th>
              <th className="border px-2 py-1">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={12} className="text-center">Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={12} className="text-center text-gray-500">Không có kết quả phù hợp.</td></tr>
            ) : (
              filtered.map((item, i) => {
                // Parse ngày bắt đầu/kết thúc từ duration_leaves
                let from = "", to = "";
                if (item.duration_leaves) {
                  const parts = item.duration_leaves.split(" - ");
                  from = parts[0] || "";
                  to = parts[1] || "";
                }
                return (
                  <tr key={item.leave_code}>
                    <td className="border px-2 py-1 text-center">{i + 1}</td>
                    <td className="border px-2 py-1 text-blue-700 font-bold cursor-pointer underline" onClick={() => setViewCode(item.leave_code)}>{item.leave_code}</td>
                    <td className="border px-2 py-1 text-center">{item.created_date?.slice(0, 10).split("-").reverse().join("/")}</td>
                    <td className="border px-2 py-1">{item.employee_code}</td>
                    <td className="border px-2 py-1">{item.employee_name}</td>
                    <td className="border px-2 py-1">{item.department_name}</td>
                    <td className="border px-2 py-1">{item.leave_name}</td>
                    <td className="border px-2 py-1 text-center">{from}</td>
                    <td className="border px-2 py-1 text-center">{to}</td>
                    <td className="border px-2 py-1 text-center">{item.total_days}</td>
                    <td className={`border px-2 py-1 text-center`}>
                      <span className={`inline-block rounded-md px-3 py-1 text-xs font-semibold ${STATUS_COLORS[item.statusDisplay] || "bg-gray-200 text-gray-700"}`}>
                        {item.statusDisplay}
                      </span>
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <button className="text-blue-600 hover:text-blue-900" title="Xem chi tiết" onClick={() => setViewCode(item.leave_code)}>
                        👁
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {renderPagination()}
      {/* Popup chi tiết đơn nghỉ phép */}
      {viewCode && (
        <LeaveRequestDetail
          code={viewCode}
          onClose={() => setViewCode(null)}
          onApproveOrReject={() => {
            setViewCode(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
