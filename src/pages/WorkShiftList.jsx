import React, { useEffect, useState } from 'react';
import workShiftService from '../services/workShiftService';
import { FaRegEdit, FaRegTrashAlt } from 'react-icons/fa';
import WorkShiftForm from '../components/WorkShiftForm';

function calcWorkingHours(start, end, breakMinutes = 0) {
  // start, end: 'HH:mm' string
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  let startMins = sh * 60 + sm;
  let endMins = eh * 60 + em;
  if (endMins < startMins) endMins += 24 * 60; // qua ngày
  const total = endMins - startMins - breakMinutes;
  return total % 60 === 0 ? `${total / 60}h` : `${(total / 60).toFixed(1)}h`;
}

const WorkShiftList = () => {
  const [shifts, setShifts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchShifts = async (text = '') => {
    setLoading(true);
    setError('');
    try {
      const res = await workShiftService.getWorkShiftList(text);
      // Giả sử res.data là mảng, sắp xếp theo thời gian tạo mới nhất
      setShifts(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError('Lỗi khi tải danh sách ca làm việc.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchShifts(search);
  };

  const handleAdd = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (shift) => {
    setEditData(shift);
    setShowForm(true);
  };

  const handleDelete = (shift) => {
    if (window.confirm('Bạn có chắc muốn xóa ca này?')) {
      workShiftService.deleteWorkShift(shift.id).then(() => {
        fetchShifts(search);
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Danh sách ca làm việc</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleAdd}>
          + Thêm ca làm việc
        </button>
      </div>
      <form className="flex mb-4 gap-2" onSubmit={handleSearch}>
        <input
          className="border px-3 py-2 rounded flex-1"
          placeholder="Nhập tên ca..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="bg-gray-800 text-white px-4 py-2 rounded" type="submit">Tìm kiếm</button>
      </form>
      {loading ? (
        <div>Đang tải...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : shifts.length === 0 ? (
        <div>Không có kết quả phù hợp với yêu cầu tìm kiếm.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Mã ca</th>
                <th className="p-2 border">Tên ca</th>
                <th className="p-2 border">Giờ bắt đầu ca</th>
                <th className="p-2 border">Giờ kết thúc ca</th>
                <th className="p-2 border">Giờ công</th>
                <th className="p-2 border">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map(shift => (
                <tr key={shift.id}>
                  <td className="p-2 border text-blue-700 font-semibold cursor-pointer" onClick={() => handleEdit(shift)}>{shift.id}</td>
                  <td className="p-2 border">{shift.shift_name}</td>
                  <td className="p-2 border">{shift.start_time}</td>
                  <td className="p-2 border">{shift.end_time}</td>
                  <td className="p-2 border">{calcWorkingHours(shift.start_time, shift.end_time, shift.break_minutes)}</td>
                  <td className="p-2 border">
                    <div className="flex items-center justify-center gap-3">
                      <button className="text-blue-600" title="Sửa" onClick={() => handleEdit(shift)}>
                        <FaRegEdit size={18} />
                      </button>
                      <button className="text-red-600" title="Xóa" onClick={() => handleDelete(shift)}>
                        <FaRegTrashAlt size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-0 max-w-2xl w-full relative">
            <WorkShiftForm
              onClose={() => setShowForm(false)}
              onSuccess={() => {
                setShowForm(false);
                fetchShifts(search);
              }}
              initialData={editData}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkShiftList;

