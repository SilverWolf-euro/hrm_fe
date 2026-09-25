import React, { useEffect, useState } from "react";
import { createDepartment, getDepartmentById, updateDepartment, getDepartments } from "../services/departmentService";

export default function DepartmentModal({ open, mode = "view", departmentId, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ code: "", name_vi: "", parent: [] });
  const [allDepartments, setAllDepartments] = useState([]);
  const [selectedParentToAdd, setSelectedParentToAdd] = useState("");

  useEffect(() => {
    if (!open) return;

    // load all departments for parent selection
    getDepartments()
      .then(res => {
        const list = (res && res.data && res.data.data) || (res && res.data) || res || [];
        setAllDepartments(Array.isArray(list) ? list : []);
      })
      .catch(() => setAllDepartments([]));

    if ((mode === "edit" || mode === "view") && departmentId) {
      setLoading(true);
      getDepartmentById(departmentId)
        .then(res => {
          const data = (res && res.data && res.data.data) || (res && res.data) || res || {};
          setForm({
            code: data.code || data.department_code || "",
            name_vi: data.name_vi || data.name || data.department_name || "",
            parent: Array.isArray(data.parent) ? data.parent : (data.parent ? [data.parent] : []),
          });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (mode === "create") {
      setForm({ code: "", name_vi: "", parent: [] });
    }
  }, [open, mode, departmentId]);

  const handleChange = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const addParent = (code) => {
    if (!code) return;
    setForm(f => {
      const arr = Array.isArray(f.parent) ? [...f.parent] : [];
      if (!arr.includes(code)) arr.push(code);
      return { ...f, parent: arr };
    });
    setSelectedParentToAdd("");
  };

  const removeParent = (code) => {
    setForm(f => ({ ...f, parent: (f.parent || []).filter(p => p !== code) }));
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (mode === "view") {
      onClose && onClose();
      return;
    }
    if (!form.code || !form.name_vi) {
      alert("Vui lòng nhập mã và tên phòng ban.");
      return;
    }
    setLoading(true);
    try {
      const payload = { code: form.code, name_vi: form.name_vi, parent: form.parent };
      if (mode === "create") {
        await createDepartment(payload);
      } else if (mode === "edit" && departmentId) {
        await updateDepartment(departmentId, payload);
      }
      onSaved && onSaved();
      onClose && onClose();
    } catch (err) {
      alert("Lỗi khi lưu phòng ban.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const title = mode === "create" ? "Tạo phòng ban" : mode === "edit" ? "Chỉnh sửa phòng ban" : "Chi tiết phòng ban";

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
              <label className="block mb-1">Mã phòng ban</label>
              <input
                className="border rounded px-2 py-1 w-full"
                value={form.code}
                onChange={e => handleChange('code', e.target.value)}
                disabled={mode === 'view'}
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Tên phòng ban</label>
              <input
                className="border rounded px-2 py-1 w-full"
                value={form.name_vi}
                onChange={e => handleChange('name_vi', e.target.value)}
                disabled={mode === 'view'}
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1">Phòng ban cha</label>
              {mode !== 'view' ? (
                <div className="flex gap-2 items-center">
                  <select
                    className="border rounded px-2 py-1 flex-1"
                    value={selectedParentToAdd}
                    onChange={e => setSelectedParentToAdd(e.target.value)}
                  >
                    <option value="">-- Chọn phòng ban --</option>
                    {allDepartments.map(d => (
                      <option key={d.code || d.id} value={d.code}>{(d.name_vi || d.name || d.code) + ' (' + (d.code || d.id) + ')'}</option>
                    ))}
                  </select>
                  <button type="button" className="px-3 py-1 bg-gray-200 rounded" onClick={() => addParent(selectedParentToAdd)}>Thêm</button>
                </div>
              ) : (
                <div className="text-sm text-gray-600">{(form.parent || []).join(', ') || '-'}</div>
              )}

              <div className="mt-2 flex flex-wrap gap-2">
                {(form.parent || []).map(code => {
                  const dep = allDepartments.find(d => (d.code || d.id) === code) || {};
                  const label = dep.name_vi || dep.name || code;
                  return (
                    <div key={code} className="px-2 py-1 bg-blue-100 text-blue-800 rounded flex items-center gap-2">
                      <span>{label}</span>
                      {mode !== 'view' && (
                        <button type="button" className="text-sm text-gray-600" onClick={() => removeParent(code)}>x</button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" className="px-4 py-2 rounded border" onClick={onClose}>Hủy</button>
              {mode !== 'view' ? (
                <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">{loading ? 'Đang lưu...' : 'Lưu'}</button>
              ) : (
                <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>Đóng</button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
