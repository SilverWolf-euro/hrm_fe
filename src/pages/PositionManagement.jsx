import React, { useEffect, useState } from "react";
import positionService from "../services/positionService";
import PositionModal from "../components/PositionModal";

export default function PositionManagement() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await positionService.getPositions();
      const list = (res && res.data && res.data.data) || (res && res.data) || res || [];
      setPositions(Array.isArray(list) ? list : []);
    } catch (e) {
      setPositions([]);
    }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa chức vụ này?")) return;
    try {
      await positionService.deletePosition(id);
      fetch();
    } catch (e) {
      alert("Xóa thất bại");
    }
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [modalPosId, setModalPosId] = useState(null);

  const openCreate = () => { setModalMode('create'); setModalPosId(null); setModalOpen(true); };
  const openEdit = (id) => { setModalMode('edit'); setModalPosId(id); setModalOpen(true); };
  const openView = (id) => { setModalMode('view'); setModalPosId(id); setModalOpen(true); };

  const filtered = positions.filter(p => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (p.s_name_vi || p.s_name_en || p.s_code || "").toLowerCase().includes(s) || (p.s_code || "").toLowerCase().includes(s);
  });

  return (
    <div className="p-6 bg-white rounded shadow mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Quản lý chức vụ</h2>
        <div className="flex items-center gap-2">
          <input placeholder="Tìm kiếm mã hoặc tên chức vụ" value={search} onChange={e=>setSearch(e.target.value)} className="border rounded px-3 py-2" style={{ minWidth: 280 }} />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={openCreate}>+ Thêm chức vụ</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-2 text-left">Mã</th>
              <th className="border px-2 py-2 text-left">Tên</th>
              <th className="border px-2 py-2 text-left">Chức vụ cha</th>
              <th className="border px-2 py-2 text-left">Cấp bậc</th>
              <th className="border px-2 py-2 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (<tr><td colSpan={5} className="text-center">Đang tải...</td></tr>) : filtered.length === 0 ? (<tr><td colSpan={5} className="text-center text-gray-500">Không có dữ liệu.</td></tr>) : (
              filtered.map(pos => (
                <tr key={pos.id}>
                  <td className="border px-2 py-2">{pos.s_code}</td>
                  <td className="border px-2 py-2"><button className="text-left text-blue-600 underline" onClick={() => openView(pos.id)}>{pos.s_name_vi || pos.s_name_en || '-'}</button></td>
                  <td className="border px-2 py-2">{Array.isArray(pos.s_parent_code) && pos.s_parent_code.length ? pos.s_parent_code.join(', ') : (pos.s_parent_code || '-')}</td>
                  <td className="border px-2 py-2">{pos.n_level ?? '-'}</td>
                  <td className="border px-2 py-2 text-center">
                    <button className="text-blue-600 mr-2" title="Chỉnh sửa" onClick={() => openEdit(pos.id)}>✏️</button>
                    {!(modalOpen && modalMode === 'view' && modalPosId === pos.id) && (
                      <button className="text-red-600" title="Xóa" onClick={() => handleDelete(pos.id)}>🗑️</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PositionModal open={modalOpen} mode={modalMode} positionId={modalPosId} onClose={() => setModalOpen(false)} onSaved={() => fetch()} />
    </div>
  );
}
