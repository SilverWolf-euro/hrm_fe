import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import positionService from "../services/positionService";
import { getDepartments } from "../services/departmentService";

import { getApprovalRequestTypes, createApprovalSetting } from "../services/browsingFlowService";

function ApprovalFlowConfig() {
  const navigate = useNavigate();
  const [requestTypes, setRequestTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]); // cho creatorPosition
  const [positionsByStep, setPositionsByStep] = useState([[]]); // mảng danh sách chức vụ cho từng bước

  // Form state
  const [form, setForm] = useState({
    requestType: "",
    department: "",
    creatorPosition: "",
    steps: [
      { department: "", position: "" }
    ]
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch request types
  useEffect(() => {
    getApprovalRequestTypes().then(res => {
      setRequestTypes(res.data?.data || []);
    });
    getDepartments().then(list => setDepartments(list || []));
  }, []);

  // Lấy lại positions khi thay đổi phòng ban áp dụng
  useEffect(() => {
    if (form.department) {
      positionService.getPositionsByDepartment(form.department).then(res => setPositions(res.data?.data || []));
    } else {
      setPositions([]);
    }
  }, [form.department]);

  // Validate required fields
  const validate = () => {
    const newErrors = {};
    if (!form.requestType) newErrors.requestType = "Vui lòng nhập Loại đơn.";
    if (!form.department) newErrors.department = "Vui lòng nhập Phòng ban áp dụng.";
    if (!form.creatorPosition) newErrors.creatorPosition = "Vui lòng nhập Chức vụ người tạo đơn.";
    form.steps.forEach((step, idx) => {
      if (!step.department) newErrors[`step_department_${idx}`] = "Vui lòng nhập Phòng ban duyệt.";
      if (!step.position) newErrors[`step_position_${idx}`] = "Vui lòng nhập Chức vụ người duyệt đơn.";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form change
  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };
  const handleStepChange = (idx, field, value) => {
    setForm(f => {
      const steps = [...f.steps];
      steps[idx][field] = value;
      return { ...f, steps };
    });
    setErrors(e => ({ ...e, [`step_${field}_${idx}`]: undefined }));

    // Nếu thay đổi phòng ban duyệt, load lại positions cho bước đó
    if (field === "department") {
      if (value) {
        positionService.getPositionsByDepartment(value).then(res => {
          setPositionsByStep(prev => {
            const newArr = [...prev];
            newArr[idx] = res.data?.data || [];
            return newArr;
          });
        });
      } else {
        setPositionsByStep(prev => {
          const newArr = [...prev];
          newArr[idx] = [];
          return newArr;
        });
      }
      // reset position khi đổi phòng ban
      setForm(f => {
        const steps = [...f.steps];
        steps[idx]["position"] = "";
        return { ...f, steps };
      });
    }
  };
  const addStep = () => {
    setForm(f => ({ ...f, steps: [...f.steps, { department: "", position: "" }] }));
    setPositionsByStep(prev => [...prev, []]);
  };
  const removeStep = idx => {
    setForm(f => {
      const steps = f.steps.filter((_, i) => i !== idx);
      return { ...f, steps };
    });
    setPositionsByStep(prev => prev.filter((_, i) => i !== idx));
  };

  // Handle submit
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Chuẩn bị dữ liệu gửi lên API đúng mẫu backend
      const payload = {
        request_types: [form.requestType],
        department_code: form.department,
        position_code: form.creatorPosition,
        steps: form.steps.map((step, idx) => ({
          approver_department: step.department,
          approver_position: step.position,
          step_order: idx + 1
        }))
      };
      await createApprovalSetting(payload);
      alert("Lưu cấu hình thành công!");
    } catch (err) {
      alert("Lỗi khi lưu cấu hình!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="p-6 bg-white rounded shadow max-w-3xl mx-auto" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block font-semibold mb-1">Loại đơn <span className="text-red-500">*</span></label>
          <select
            className={`border rounded px-2 py-1 w-full ${errors.requestType ? 'border-red-500' : ''}`}
            value={form.requestType}
            onChange={e => handleChange("requestType", e.target.value)}
          >
            <option value="">Chọn loại đơn</option>
            {requestTypes.map(rt => (
              <option key={rt.code} value={rt.code}>{rt.name_vi}</option>
            ))}
          </select>
          {errors.requestType && <div className="text-red-500 text-xs mt-1">{errors.requestType}</div>}
        </div>
        <div>
          <label className="block font-semibold mb-1">Phòng ban áp dụng <span className="text-red-500">*</span></label>
          <select
            className={`border rounded px-2 py-1 w-full ${errors.department ? 'border-red-500' : ''}`}
            value={form.department}
            onChange={e => handleChange("department", e.target.value)}
          >
            <option value="">Chọn phòng ban</option>
            {departments.map(d => (
              <option key={d.code} value={d.code}>{d.name_vi}</option>
            ))}
          </select>
          {errors.department && <div className="text-red-500 text-xs mt-1">{errors.department}</div>}
        </div>
        <div>
          <label className="block font-semibold mb-1">Chức vụ người tạo đơn <span className="text-red-500">*</span></label>
          <select
            className={`border rounded px-2 py-1 w-full ${errors.creatorPosition ? 'border-red-500' : ''}`}
            value={form.creatorPosition}
            onChange={e => handleChange("creatorPosition", e.target.value)}
          >
            <option value="">Chọn chức vụ</option>
            {positions.map(p => (
              <option key={p.s_code} value={p.s_code}>{p.s_name_vi}</option>
            ))}
          </select>
          {errors.creatorPosition && <div className="text-red-500 text-xs mt-1">{errors.creatorPosition}</div>}
        </div>
      </div>
      <div className="mb-4">
        <div className="font-semibold mb-2">Các bước duyệt</div>
        {form.steps.map((step, idx) => (
          <div key={idx} className="border rounded p-3 mb-2 relative">
            <div className="font-bold mb-2">Bước {idx + 1}</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Phòng ban duyệt <span className="text-red-500">*</span></label>
                <select
                  className={`border rounded px-2 py-1 w-full ${errors[`step_department_${idx}`] ? 'border-red-500' : ''}`}
                  value={step.department}
                  onChange={e => handleStepChange(idx, "department", e.target.value)}
                >
                  <option value="">Chọn phòng ban</option>
                  {departments.map(d => (
                    <option key={d.code} value={d.code}>{d.name_vi}</option>
                  ))}
                </select>
                {errors[`step_department_${idx}`] && <div className="text-red-500 text-xs mt-1">{errors[`step_department_${idx}`]}</div>}
              </div>
              <div>
                <label className="block text-sm mb-1">Chức vụ người duyệt đơn <span className="text-red-500">*</span></label>
                <select
                  className={`border rounded px-2 py-1 w-full ${errors[`step_position_${idx}`] ? 'border-red-500' : ''}`}
                  value={step.position}
                  onChange={e => handleStepChange(idx, "position", e.target.value)}
                >
                  <option value="">Chọn chức vụ</option>
                  {(positionsByStep[idx] || []).map(p => (
                    <option key={p.s_code} value={p.s_code}>{p.s_name_vi}</option>
                  ))}
                </select>
                {errors[`step_position_${idx}`] && <div className="text-red-500 text-xs mt-1">{errors[`step_position_${idx}`]}</div>}
              </div>
            </div>
            {form.steps.length > 1 && (
              <button
                type="button"
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                onClick={() => removeStep(idx)}
                title="Xóa bước duyệt"
              >X</button>
            )}
          </div>
        ))}
        <button type="button" className="text-blue-600 underline mt-2" onClick={addStep}>+ Thêm bước duyệt</button>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={() => navigate("/approval-settings")}>Hủy</button>
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>Lưu</button>
      </div>
    </form>
  );
}

export default ApprovalFlowConfig;
