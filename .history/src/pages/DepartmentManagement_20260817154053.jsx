import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDepartments, deleteDepartment } from "../services/departmentService";

export default function DepartmentManagement() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getDepartments();
      const list = Array.isArray(res) ? res : (res.data || res || []);
      setDepartments(list);
    } catch (e) {
      setDepartments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa phòng ban này?")) return;
    try {
      await deleteDepartment(id);
      fetch();
    } catch (e) {
      alert("Xóa thất bại");
    }
  };

  const filtered = departments.filter(d => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (d.name_vi || d.name || d.code || "").toLowerCase().includes(s) || (d.code || "").toLowerCase().includes(s);
  });

  return (
    <div className="p-6 bg-white rounded shadow mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Quản lý phòng ban</h2>
        <div className="flex items-center gap-2">
          <input
            placeholder="Tìm kiếm mã hoặc tên phòng ban"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2"
            style={{ minWidth: 280 }}
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => navigate('/department/new')}>
            + Thêm phòng ban
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-2 text-left">Mã</th>
              <th className="border px-2 py-2 text-left">Tên phòng ban</th>
              <th className="border px-2 py-2 text-left">Phòng ban cha</th>
              <th className="border px-2 py-2 text-left">Khu vực</th>
              <th className="border px-2 py-2 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center">Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-gray-500">Không có dữ liệu.</td></tr>
            ) : (
              filtered.map(dep => (
                <tr key={dep.id}>
                  <td className="border px-2 py-2">{dep.code}</td>
                  <td className="border px-2 py-2">{dep.name_vi || dep.name || '-'}</td>
                  <td className="border px-2 py-2">{Array.isArray(dep.parent) && dep.parent.length ? dep.parent.join(', ') : (dep.parent || '-')}</td>
                  <td className="border px-2 py-2">{dep.area || '-'}</td>
                  <td className="border px-2 py-2 text-center">
                    <button className="text-blue-600 mr-2" onClick={() => navigate(`/department/edit/${dep.id}`)}>✏️</button>
                    <button className="text-red-600" onClick={() => handleDelete(dep.id)}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
