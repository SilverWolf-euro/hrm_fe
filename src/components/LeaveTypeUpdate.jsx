import React, { useEffect, useState } from "react";
import { getLeaveTypeDetail, updateLeaveType } from "../services/leaveTypeService";

const LEAVE_TYPE_OPTIONS = [
  { label: "Nghỉ hưởng lương", value: "PAID" },
  { label: "Nghỉ không lương", value: "UNPAID" },
  { label: "Nghỉ chế độ", value: "BENEFIT" }
];

const APPLY_OBJECT_OPTIONS = [
  { label: "Tất cả nhân viên", value: "ALL" },
  { label: "NV chính thức", value: "OFFICIAL" }
];

export default function LeaveTypeUpdate({ leaveTypeId, onSuccess, onCancel }) {
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (leaveTypeId) {
      getLeaveTypeDetail(leaveTypeId)
        .then(res => {
          setForm({
            ...res.data,
            // ✅ GIỮ NGUYÊN 0, KHÔNG convert thành ""
            max_days_per_request: res.data.max_days_per_request ?? "",
            paid_days: res.data.paid_days ?? 0
          });
        })
        .catch(() => setError("Không lấy được thông tin."));
    }
  }, [leaveTypeId]);

  const handleChange = (field, value) => {
    let newForm = { ...form, [field]: value };

    if (field === "leave_category" && value === "BENEFIT") {
      newForm.code = "CĐ";
    }

    setForm(newForm);
  };

  const validate = () => {
    if (!form.name?.trim()) return "Vui lòng nhập tên loại nghỉ.";
    if (form.name.length > 100) return "Tên loại nghỉ tối đa 100 ký tự.";

    if (!form.code?.trim()) return "Vui lòng nhập ký hiệu.";
    if (form.code.length > 5) return "Ký hiệu tối đa 5 ký tự.";

    if (!form.leave_category) return "Vui lòng chọn loại nghỉ.";

    if (form.paid_days === "" || isNaN(form.paid_days) || Number(form.paid_days) < 0)
      return "Vui lòng nhập số công hưởng hợp lệ.";

    if (
      form.max_days_per_request !== "" &&
      (isNaN(form.max_days_per_request) || Number(form.max_days_per_request) < 0)
    )
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
      await updateLeaveType(leaveTypeId, {
        name: form.name.trim(),
        code: form.code.trim(),
        leave_category: form.leave_category,
        paid_days: Number(form.paid_days),
        max_days_per_request:
          form.max_days_per_request === ""
            ? 0
            : Number(form.max_days_per_request),
        apply_object: form.apply_object
      });

      setLoading(false);
      if (onSuccess) onSuccess();
    } catch (e) {
      setLoading(false);
      setError("Có lỗi xảy ra khi cập nhật.");
    }
  };

  if (!form) return <div>Đang tải...</div>;

  return (
    <form
      className="max-w-2xl mx-auto p-6 bg-white rounded shadow"
      onSubmit={handleSubmit}
    >
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
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
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
          placeholder="Nhập 0 nếu không giới hạn"
          onChange={e =>
            handleChange("max_days_per_request", e.target.value)
          }
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
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="text-red-500 mb-2">{error}</div>}

      <div className="flex gap-2">
        <button
          type="button"
          className="bg-gray-200 px-6 py-2 rounded"
          onClick={onCancel}
        >
          Hủy
        </button>

        <button
          type="submit"
          className="bg-slate-800 text-white px-6 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Đang lưu..." : "Cập nhật"}
        </button>
      </div>
    </form>
  );
}