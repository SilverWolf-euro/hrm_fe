import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createLeaveType } from "../services/leaveTypeService";

const LEAVE_TYPE_OPTIONS = [
  { label: "Nghỉ hưởng lương", value: "PAID" },
  { label: "Nghỉ không lương", value: "UNPAID" },
  { label: "Nghỉ chế độ", value: "BENEFIT" }
];

const APPLY_OBJECT_OPTIONS = [
  { label: "Tất cả nhân viên", value: "ALL" },
  { label: "NV chính thức", value: "OFFICIAL" }
];

export default function LeaveTypeCreate({ onSuccess }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    code: "",
    leave_category: "PAID",
    paid_days: "",
    max_days_per_request: "",
    apply_object: "ALL"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Autofill ký hiệu khi chọn Nghỉ chế độ
  const handleChange = (field, value) => {
    let newForm = { ...form, [field]: value };
    if (field === "leave_category" && value === "BENEFIT") {
      newForm.code = "CĐ";
    }
    // Nếu chọn Nghỉ không lương thì paid_days = 0 và không cho sửa
    if (field === "leave_category" && value === "UNPAID") {
      newForm.paid_days = 0;
    }
    setForm(newForm);
  };

  const validate = () => {
    if (!form.name.trim()) return "Vui lòng nhập tên loại nghỉ.";
    if (form.name.length > 100) return "Tên loại nghỉ tối đa 100 ký tự.";
    if (!form.code.trim()) return "Vui lòng nhập ký hiệu.";
    if (form.code.length > 5) return "Ký hiệu tối đa 5 ký tự.";
    if (!form.leave_category) return "Vui lòng chọn loại nghỉ.";
    if (form.paid_days === "" || isNaN(form.paid_days) || Number(form.paid_days) < 0)
      return "Vui lòng nhập số công hưởng hợp lệ.";
    if (form.max_days_per_request !== "" && (isNaN(form.max_days_per_request) || Number(form.max_days_per_request) < 0))
      return "Số ngày nghỉ tối đa phải là số không âm.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    setLoading(true);
    try {
      await createLeaveType({
        name: form.name.trim(),
        code: form.code.trim(),
        leave_category: form.leave_category,
        paid_days: Number(form.paid_days),
        max_days_per_request: form.max_days_per_request === "" ? 0 : Number(form.max_days_per_request),
        apply_object: form.apply_object
      });
      setLoading(false);
      alert("Tạo loại nghỉ thành công!");
    } catch (e) {
      setLoading(false);
      // Kiểm tra lỗi ký hiệu đã tồn tại
      if (
        e?.response?.data?.code === "500" &&
        e?.response?.data?.message === "business error: Leave type code already exists"
      ) {
        setError("Ký hiệu này đã tồn tại.");
      } else {
        setError("Có lỗi xảy ra khi tạo loại nghỉ.");
      }
    }
  };

  return (
    <form className="max-w-2xl mx-auto p-6 bg-white rounded shadow" onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Tên loại nghỉ <span className="text-red-500">*</span>
        </label>
        <input
          className="border rounded px-3 py-2 w-full"
          maxLength={100}
          value={form.name}
          onChange={e => handleChange("name", e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Ký hiệu <span className="text-red-500">*</span>
        </label>
        <input
          className="border rounded px-3 py-2 w-full"
          maxLength={5}
          value={form.code}
          onChange={e => handleChange("code", e.target.value)}
          disabled={form.leave_category === "BENEFIT"}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Loại <span className="text-red-500">*</span>
        </label>
        <select
          className="border rounded px-3 py-2 w-full"
          value={form.leave_category}
          onChange={e => handleChange("leave_category", e.target.value)}
        >
          {LEAVE_TYPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Số công hưởng <span className="text-red-500">*</span>
        </label>
        <input
          className="border rounded px-3 py-2 w-full"
          type="number"
          min={0}
          value={form.paid_days}
          onChange={e => handleChange("paid_days", e.target.value)}
          disabled={form.leave_category === "UNPAID"}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Số ngày nghỉ tối đa
        </label>
        <input
          className="border rounded px-3 py-2 w-full"
          type="number"
          min={0}
          value={form.max_days_per_request}
          onChange={e => handleChange("max_days_per_request", e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Đối tượng áp dụng
        </label>
        <select
          className="border rounded px-3 py-2 w-full"
          value={form.apply_object}
          onChange={e => handleChange("apply_object", e.target.value)}
        >
          {APPLY_OBJECT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          className="bg-gray-300 text-black px-6 py-2 rounded hover:bg-gray-400"
          onClick={() => navigate("/leave-config")}
          disabled={loading}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="bg-slate-800 text-white px-6 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </form>
  );
}