import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import employeeService from "../services/employeeService";
function HRReportScreen() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ attendance_code: "", full_name: "", work_location: 2 });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await employeeService.getList(filters);
      setData(res);
    } catch (err) {
      setError("Không thể tải dữ liệu nhân viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [filters]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Danh sách nhân sự</h1>
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => navigate("/profile")}
        >
          Thêm nhân viên
        </button> 
      </div>
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Mã nhân viên</label>
          <input
            type="text"
            className="border rounded px-3 py-2"
            placeholder="Tìm theo mã nhân viên"
            value={filters.attendance_code}
            onChange={e => setFilters(f => ({ ...f, attendance_code: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tên nhân viên</label>
          <input
            type="text"
            className="border rounded px-3 py-2"
            placeholder="Tìm theo tên nhân viên"
            value={filters.full_name}
            onChange={e => setFilters(f => ({ ...f, full_name: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Địa điểm làm việc</label>
          <select
            className="border rounded px-3 py-2 min-w-[120px]"
            value={filters.work_location}
            onChange={e => setFilters(f => ({ ...f, work_location: e.target.value === '' ? '' : Number(e.target.value) }))}
          >
            <option value={''}>Tất cả</option>
            <option value={2}>Văn phòng</option>
            <option value={4}>Nhà máy</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="text-center text-gray-500 py-8">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">STT</th>
                <th className="border px-2 py-1">Mã Nhân Viên</th>
                <th className="border px-2 py-1">Tên Nhân Viên</th>
                <th className="border px-2 py-1">Ngày Sinh</th>
                <th className="border px-2 py-1">Phòng ban</th>
                <th className="border px-2 py-1">Chức vụ</th>
                <th className="border px-2 py-1">Số điện thoại</th>
                <th className="border px-2 py-1">Số điện thoại cá nhân</th>
                <th className="border px-2 py-1">Email công ty</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr><td colSpan={9} className="border px-2 py-1 text-center text-gray-400">Không có dữ liệu</td></tr>
              ) : data.map((emp, idx) => (
                <tr key={emp.id}>
                  <td className="border px-2 py-1 text-center">{idx + 1}</td>
                  <td className="border px-2 py-1 text-blue-600 underline cursor-pointer" onClick={() => navigate(`/profile/${emp.id}`)}>{emp.attendance_code}</td>
                  <td className="border px-2 py-1 text-left">{emp.full_name}</td>
                  <td className="border px-2 py-1 text-left">{emp.birth_date ? dayjs(emp.birth_date).format('DD/MM/YYYY') : ""}</td>
                  <td className="border px-2 py-1 text-left">{emp.department_name}</td>
                  <td className="border px-2 py-1 text-left">{emp.position_title}</td>
                  <td className="border px-2 py-1 text-left">{emp.company_phone}</td>
                  <td className="border px-2 py-1 text-left">{emp.personal_phone}</td>
                  <td className="border px-2 py-1 text-left">{emp.company_email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
export default HRReportScreen;
