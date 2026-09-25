import React, { useEffect, useState } from "react";
import { searchLeaveTypes, deleteLeaveType } from "../services/leaveTypeService";

import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import LeaveTypeDetailModal from "../components/LeaveTypeDetailModal";
import LeaveTypeUpdate from "../components/LeaveTypeUpdate";

const LEAVE_TYPE_OPTIONS = [
  { label: "Tất cả", value: "" },
  { label: "Nghỉ hưởng lương", value: "PAID" },
  { label: "Nghỉ không lương", value: "UNPAID" },
  { label: "Nghỉ chế độ", value: "BENEFIT" }
];


export default function LeaveTypeConfig() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDetailId, setShowDetailId] = useState(null);
  const [showUpdateId, setShowUpdateId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType) params.leave_type = filterType;
      if (search) params.keywords = search;
      const res = await searchLeaveTypes(params);
      setList(res.data || []);
    } catch (e) {
      setList([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [filterType]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold">Danh sách loại nghỉ </div>
          <button
            className="bg-slate-800 text-white px-4 py-2 rounded flex items-center gap-2"
            style={{ minWidth: 120 }}
            onClick={() => navigate('/leave-types/create')}
          >
            <span style={{ fontSize: 20, fontWeight: 'bold' }}>+</span> Thêm mới
          </button>
        </div>
        <form className="flex gap-4 mb-4" onSubmit={handleSearch}>
          <div>
            <label className="block text-sm mb-1">Loại</label>
            <select
              className="border rounded px-2 py-1"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              {LEAVE_TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">Tìm kiếm</label>
            <div className="flex gap-2">
              <input
                className="border rounded px-2 py-1 flex-1"
                placeholder="Nhập tên loại nghỉ..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <button className="bg-slate-800 text-white px-4 rounded" type="submit">Tìm kiếm</button>
            </div>
          </div>
        </form>
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">Ký hiệu</th>
              <th className="border px-2 py-1">Tên loại nghỉ</th>
              <th className="border px-2 py-1">Loại</th>
              <th className="border px-2 py-1">Số công hưởng</th>
              <th className="border px-2 py-1">Số ngày nghỉ tối đa</th>
              <th className="border px-2 py-1">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center">Đang tải...</td></tr>
            ) : list.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-gray-500">Không có kết quả phù hợp.</td></tr>
            ) : (
              list.map((item, i) => (
                <tr key={item.leave_id || i}>
                  <td className="border px-2 py-1 font-bold text-blue-700">{item.leave_code}</td>
                  <td className="border px-2 py-1">
                    <button className="text-left text-blue-700 hover:underline" onClick={e => {e.preventDefault(); setShowDetailId(item.leave_id);}}>
                      {item.leave_name}
                    </button>
                  </td>
                  <td className="border px-2 py-1">
                    {item.leave_category === "PAID" && <span className="bg-gree+n-100 text-green-700 px-2 py-1 rounded">Nghỉ hưởng lương</span>}
                    {item.leave_category === "UNPAID" && <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">Nghỉ không lương</span>}
                    {item.leave_category === "BENEFIT" && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Nghỉ chế độ</span>}
                  </td>
                  <td className="border px-2 py-1 text-center">{item.paid_days}</td>
                  <td className="border px-2 py-1 text-center">{item.max_days_per_request === 0 ? "Không giới hạn" : item.max_days_per_request}</td>
                  <td className="border px-2 py-1 text-center">
                    <button className="text-blue-600 hover:text-blue-900 mr-2" title="Cập nhật" onClick={() => setShowUpdateId(item.leave_id)}> <FiEdit2 size={18} /> </button>
                    <button className="text-red-600 hover:text-red-900" title="Xóa" onClick={() => setDeleteId(item.leave_id)}> <FiTrash2 size={18} /> </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      <LeaveTypeDetailModal
        open={!!showDetailId}
        leaveTypeId={showDetailId}
        onClose={() => setShowDetailId(null)}
      />
      {showUpdateId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-0 rounded shadow-lg min-w-[400px] relative">
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={() => setShowUpdateId(null)}>×</button>
            <LeaveTypeUpdate
              leaveTypeId={showUpdateId}
              onSuccess={() => { setShowUpdateId(null); fetchData(); }}
              onCancel={() => setShowUpdateId(null)}
            />
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg min-w-[350px] relative">
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={() => setDeleteId(null)}>×</button>
            <div className="mb-4 text-lg font-bold">Xác nhận xóa</div>
            <div className="mb-4">Bạn có muốn xóa loại nghỉ phép này không?</div>
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setDeleteId(null)} disabled={deleteLoading}>Hủy</button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white"
                disabled={deleteLoading}
                onClick={async () => {
                  setDeleteLoading(true);
                  try {
                    await deleteLeaveType(deleteId);
                    setDeleteId(null);
                    fetchData();
                  } catch {
                    alert('Xóa thất bại!');
                  }
                  setDeleteLoading(false);
                }}
              >{deleteLoading ? 'Đang xóa...' : 'Xóa'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}