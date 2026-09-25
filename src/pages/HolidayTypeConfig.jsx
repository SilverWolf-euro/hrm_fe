import React, { useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import dayjs from "dayjs";
import api from "../services/api";
import HolidayCreate from "../components/HolidayCreate";
import HolidayDetailModal from "../components/HolidayDetailModal";
import HolidayUpdateModal from "../components/HolidayUpdateModal";
import { deleteHoliday, getHolidayList } from "../services/holidayTypeService";



const CURRENT_YEAR = new Date().getFullYear();

export default function HolidayList() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getHolidayList(year);
      setList(data);
    } catch {
      setList([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [year]);

  const handleShowDetail = (id) => {
    setSelectedId(id);
    setShowDetail(true);
  };

  const handleShowUpdate = (id) => {
    setSelectedId(id);
    setShowUpdate(true);
  };

  const handleShowDelete = (id) => {
    setSelectedId(id);
    setDeleteError("");
    setShowDelete(true);
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteHoliday(selectedId);
      setShowDelete(false);
      setDeleteLoading(false);
      fetchData();
    } catch {
      setDeleteError("Xóa không thành công. Vui lòng thử lại!");
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-xl font-bold">Danh sách ngày nghỉ lễ</div>
        <div>
          <select
            className="border rounded px-3 py-2"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          >
            {[...Array(5)].map((_, i) => {
              const y = CURRENT_YEAR + i;
              return <option key={y} value={y}>Năm {y}</option>;
            })}
          </select>
        </div>
        <button
          className="bg-slate-800 text-white px-4 py-2 rounded flex items-center gap-2"
          style={{ minWidth: 160 }}
          onClick={() => setShowCreate(true)}
        >
          <span style={{ fontSize: 20, fontWeight: "bold" }}>+</span> Thêm ngày nghỉ lễ
        </button>
        {showCreate && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-0 rounded shadow-lg min-w-[400px] relative">
              <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={() => setShowCreate(false)}>×</button>
              <HolidayCreate
                onSuccess={() => { setShowCreate(false); fetchData(); }}
                onCancel={() => setShowCreate(false)}
              />
            </div>
          </div>
        )}
        {showDetail && (
          <HolidayDetailModal
            open={showDetail}
            holidayId={selectedId}
            onClose={() => setShowDetail(false)}
          />
        )}
        {showUpdate && (
          <HolidayUpdateModal
            open={showUpdate}
            holidayId={selectedId}
            onSuccess={() => { setShowUpdate(false); fetchData(); }}
            onCancel={() => setShowUpdate(false)}
          />
        )}
      </div>
      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Tên ngày nghỉ</th>
            <th className="border px-2 py-1">Thời gian</th>
            <th className="border px-2 py-1">Đơn vị áp dụng</th>
            <th className="border px-2 py-1">Ghi chú</th>
            <th className="border px-2 py-1">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} className="text-center">Đang tải...</td></tr>
          ) : list.length === 0 ? (
            <tr><td colSpan={5} className="text-center text-gray-500">Không có dữ liệu.</td></tr>
          ) : (
            list.map(item => (
              <tr key={item.id}>
                <td className="border px-2 py-1">
                  <button className="text-blue-700 underline" onClick={() => handleShowDetail(item.id)}>{item.name}</button>
                </td>
                <td className="border px-2 py-1">{item.time_range}</td>
                <td className="border px-2 py-1">{item.apply_unit === "ALL" ? "Toàn công ty" : item.apply_unit}</td>
                <td className="border px-2 py-1">{item.description}</td>
                <td className="border px-2 py-1 text-center">
                  <button className="text-blue-600 hover:text-blue-900 mr-2" title="Cập nhật" onClick={() => handleShowUpdate(item.id)}>
                    <FiEdit2 size={18} />
                  </button>
                  <button className="text-red-600 hover:text-red-900" title="Xóa" onClick={() => handleShowDelete(item.id)}>
                    <FiTrash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {/* Popup xác nhận xóa */}
      {showDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg min-w-[350px] relative">
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={() => setShowDelete(false)}>×</button>
            <h3 className="font-bold mb-4 text-lg text-red-600">Xác nhận xóa ngày nghỉ lễ</h3>
            <div className="mb-4">Bạn có chắc chắn muốn xóa ngày nghỉ này không? Thao tác này không thể hoàn tác.</div>
            {deleteError && <div className="text-red-500 mb-2">{deleteError}</div>}
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setShowDelete(false)} disabled={deleteLoading}>Hủy</button>
              <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={handleDelete} disabled={deleteLoading}>{deleteLoading ? "Đang xóa..." : "Xóa"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}