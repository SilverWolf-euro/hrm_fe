import React, { useEffect, useState } from "react";
import positionService from "../services/positionService";

export default function PositionModal({ open, mode = "view", positionId, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ s_code: "", s_name_vi: "", s_parent_code: [], n_level: 0 });
  const [allPositions, setAllPositions] = useState([]);
  const [selectedParentToAdd, setSelectedParentToAdd] = useState("");

  useEffect(() => {
    if (!open) return;

    // load all positions for parent selection
    positionService.getPositions()
      .then(res => {
        const list = (res && res.data && res.data.data) || (res && res.data) || res || [];
        setAllPositions(Array.isArray(list) ? list : []);
      })
      .catch(() => setAllPositions([]));

    if ((mode === "edit" || mode === "view") && positionId) {
      setLoading(true);
      positionService.getPositionById(positionId)
        .then(res => {
          const data = (res && res.data && res.data.data) || (res && res.data) || res || {};
          setForm({
            s_code: data.s_code || data.code || "",
            s_name_vi: data.s_name_vi || data.s_name || data.name_vi || "",
            s_parent_code: Array.isArray(data.s_parent_code) ? data.s_parent_code : (data.s_parent_code ? [data.s_parent_code] : []),
            n_level: typeof data.n_level === 'number' ? data.n_level : (data.n_level || 0),
          });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (mode === "create") {
      setForm({ s_code: "", s_name_vi: "", s_parent_code: [], n_level: 0 });
    }
  }, [open, mode, positionId]);

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const addParent = (code) => {
    if (!code) return;
    setForm(f => {
      const arr = Array.isArray(f.s_parent_code) ? [...f.s_parent_code] : [];
      if (!arr.includes(code)) arr.push(code);
      return { ...f, s_parent_code: arr };
    });
    setSelectedParentToAdd("");
  };

  const removeParent = (code) => {
    setForm(f => ({ ...f, s_parent_code: (f.s_parent_code || []).filter(p => p !== code) }));
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (mode === "view") { onClose && onClose(); return; }
    if (!form.s_code || !form.s_name_vi) { alert("Vui lòng nhập mã và tên chức vụ."); return; }
    setLoading(true);
    try {
      const payload = { s_code: form.s_code, s_name_vi: form.s_name_vi, s_parent_code: form.s_parent_code, n_level: form.n_level };
      if (mode === "create") await positionService.createPosition(payload);
      else if (mode === "edit" && positionId) await positionService.updatePosition(positionId, payload);
      onSaved && onSaved();
      onClose && onClose();
    } catch (err) {
      alert("Lỗi khi lưu chức vụ.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const title = mode === "create" ? "Tạo chức vụ" : mode === "edit" ? "Chỉnh sửa chức vụ" : "Chi tiết chức vụ";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        {loading ? (
          <div>Đang tải...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block mb-1">Mã chức vụ</label>
              <input className="border rounded px-2 py-1 w-full" value={form.s_code} onChange={e => handleChange('s_code', e.target.value)} disabled={mode === 'view'} />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Tên chức vụ</label>
              <input className="border rounded px-2 py-1 w-full" value={form.s_name_vi} onChange={e => handleChange('s_name_vi', e.target.value)} disabled={mode === 'view'} />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Chức vụ cha</label>
              {mode !== 'view' ? (
                <div className="flex gap-2 items-center">
                  <select className="border rounded px-2 py-1 flex-1" value={selectedParentToAdd} onChange={e => setSelectedParentToAdd(e.target.value)}>
                    <option value="">-- Chọn chức vụ --</option>
                    {allPositions.map(p => (
                      <option key={p.s_code || p.id} value={p.s_code}>{(p.s_name_vi || p.s_name_en || p.s_code) + ' (' + (p.s_code || p.id) + ')'}</option>
                    ))}
                  </select>
                  <button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={() => addParent(selectedParentToAdd)}>Thêm</button>
                </div>
              ) : (
                <div className="text-sm text-gray-600">{(form.s_parent_code || []).join(', ') || '-'}</div>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {(form.s_parent_code || []).map(code => {
                  const pos = allPositions.find(p => (p.s_code || p.id) === code) || {};
                  const label = pos.s_name_vi || pos.s_name_en || code;
                  return (
                    <div key={code} className="px-2 py-1 bg-blue-100 text-blue-800 rounded flex items-center gap-2">
                      <span>{label}</span>
                      {mode !== 'view' && (<button type="button" className="text-sm text-gray-600" onClick={() => removeParent(code)}>x</button>)}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mb-3">
              <label className="block mb-1">Cấp bậc (n_level)</label>
              <input type="number" className="border rounded px-2 py-1 w-32" value={form.n_level} onChange={e => handleChange('n_level', parseInt(e.target.value || '0', 10))} disabled={mode === 'view'} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" className="px-4 py-2 rounded border" onClick={onClose}>Hủy</button>
              {mode !== 'view' ? (<button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">{loading ? 'Đang lưu...' : 'Lưu'}</button>) : (<button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>Đóng</button>)}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
