import React, { useState, useEffect } from "react";
import { updateApprovalSetting, getApprovalRequestTypes } from "../services/browsingFlowService";
import { getDepartments } from "../services/departmentService";
import positionService from "../services/positionService";

export default function ApprovalSettingUpdateModal({ open, onClose, setting, onUpdated }) {
  const [form, setForm] = useState({
    request_types: setting?.request_types || (setting?.request_type ? [setting.request_type] : []),
    department_code: setting?.department_code || "",
    position_code: setting?.position_code || "",
    steps: Array.isArray(setting?.steps) ? setting.steps : []
  });
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [stepPositions, setStepPositions] = useState([]); // array of positions for each step
  const [requestTypes, setRequestTypes] = useState([]);
  // Load danh sách phòng ban khi mở modal
  useEffect(() => {
    if (!open) return;
    getDepartments().then(depts => setDepartments(depts || []));
    getApprovalRequestTypes().then(res => setRequestTypes(res.data?.data || []));
  }, [open]);

  // Load danh sách vị trí khi chọn phòng ban chính
  useEffect(() => {
    if (!form.department_code) {
      setPositions([]);
      return;
    }
    positionService.getPositionsByDepartment(form.department_code)
      .then(res => {
        // Đảm bảo lấy đúng mảng data
        if (res && Array.isArray(res.data)) setPositions(res.data);
        else if (res && res.data && Array.isArray(res.data.data)) setPositions(res.data.data);
        else setPositions([]);
      });
  }, [form.department_code]);

  // Load danh sách vị trí cho từng bước duyệt
  useEffect(() => {
    const fetchAll = async () => {
      if (!Array.isArray(form.steps) || form.steps.length === 0) {
        setStepPositions([]);
        return;
      }
      const arr = await Promise.all(
        form.steps.map(async (step) => {
          if (!step.approver_department) return [];
          try {
            const res = await positionService.getPositionsByDepartment(step.approver_department);
            // Đảm bảo luôn trả về mảng đúng
            if (res && Array.isArray(res.data)) return res.data;
            if (res && res.data && Array.isArray(res.data.data)) return res.data.data;
            return [];
          } catch {
            return [];
          }
        })
      );
      setStepPositions(Array.isArray(arr) ? arr : []);
    };
    fetchAll();
  }, [form.steps.map(s => s.approver_department).join(",")]);

  useEffect(() => {
    setForm({
      request_types: setting?.request_types || (setting?.request_type ? [setting.request_type] : []),
      department_code: setting?.department_code || "",
      position_code: setting?.position_code || "",
      steps: Array.isArray(setting?.steps) ? setting.steps : []
    });
  }, [setting]);

  // Xử lý thay đổi input cơ bản
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Xử lý thay đổi loại đơn (nhiều lựa chọn, phân tách bằng dấu phẩy)
  const handleRequestTypesChange = e => {
    setForm({ ...form, request_types: e.target.value.split(",").map(s => s.trim()).filter(Boolean) });
  };

  // Xử lý thay đổi step
  const handleStepChange = (idx, field, value) => {
    const steps = [...form.steps];
    steps[idx] = { ...steps[idx], [field]: value };
    setForm({ ...form, steps });
  };

  // Thêm bước duyệt
  const handleAddStep = () => {
    setForm({ ...form, steps: [...form.steps, { approver_department: "", approver_position: "", step_order: form.steps.length + 1 }] });
  };

  // Xóa bước duyệt
  const handleRemoveStep = idx => {
    const steps = form.steps.filter((_, i) => i !== idx).map((s, i) => ({ ...s, step_order: i + 1 }));
    setForm({ ...form, steps });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateApprovalSetting(setting.id, form);
      onUpdated && onUpdated();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 min-w-[800px] max-h-[90vh] overflow-y-auto relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-bold mb-4">Cập nhật cấu hình duyệt</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block mb-1">Loại đơn</label>
            <select
              name="request_types"
              value={form.request_types[0] || ""}
              onChange={e => setForm({ ...form, request_types: [e.target.value] })}
              className="border rounded px-2 py-1 w-full"
              required
            >
              <option value="">-- Chọn loại đơn --</option>
              {requestTypes.map(type => (
                <option key={type.code} value={type.code}>{type.name_vi || type.description || type.code}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="block mb-1">Phòng ban</label>
            <select
              name="department_code"
              value={form.department_code}
              onChange={handleChange}
              className="border rounded px-2 py-1 w-full"
              required
            >
              <option value="">-- Chọn phòng ban --</option>
              {departments.map(d => (
                <option key={d.code} value={d.code}>{d.name_vi || d.name || d.code}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="block mb-1">Vị trí</label>
            <select
              name="position_code"
              value={form.position_code}
              onChange={handleChange}
              className="border rounded px-2 py-1 w-full"
              required
            >
              <option value="">-- Chọn vị trí --</option>
              {positions.map(p => (
                <option key={p.s_code} value={p.s_code}>{p.s_name_vi || p.s_name_en || p.s_code}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="block mb-1">Các bước duyệt</label>
            {form.steps.map((step, idx) => (
              <div key={idx} className="flex gap-2 mb-2 items-center">
                <select
                  className="border rounded px-2 py-1 w-64"
                  value={step.approver_department || ""}
                  onChange={e => handleStepChange(idx, "approver_department", e.target.value)}
                  required
                >
                  <option value="">-- Phòng duyệt --</option>
                  {departments.map(d => (
                    <option key={d.code} value={d.code}>{d.name_vi || d.name || d.code}</option>
                  ))}
                </select>
                <select
                  className="border rounded px-2 py-1 w-64"
                  value={step.approver_position || ""}
                  onChange={e => handleStepChange(idx, "approver_position", e.target.value)}
                  required
                >
                  <option value="">-- Vị trí duyệt --</option>
                  {Array.isArray(stepPositions) && Array.isArray(stepPositions[idx])
                    ? stepPositions[idx].map(p => (
                        <option key={p.s_code} value={p.s_code}>{p.s_name_vi || p.s_name_en || p.s_code}</option>
                      ))
                    : null}
                </select>
                <input
                  type="number"
                  min={1}
                  className="border rounded px-2 py-1 w-16"
                  value={step.step_order}
                  onChange={e => handleStepChange(idx, "step_order", Number(e.target.value))}
                  required
                />
                <button type="button" className="text-red-500" onClick={() => handleRemoveStep(idx)} title="Xóa bước">✖</button>
              </div>
            ))}
            <button type="button" className="bg-gray-200 px-2 py-1 rounded mt-1" onClick={handleAddStep}>+ Thêm bước</button>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
            {loading ? "Đang lưu..." : "Lưu"}
          </button>
        </form>
      </div>
    </div>
  );
}
