import React, { useState } from "react";
import { createHoliday } from "../services/holidayTypeService";

const APPLY_UNIT_OPTIONS = [
  { label: "Tất cả đơn vị", value: "ALL" },
  { label: "Nhà máy", value: "2" },
  { label: "Văn phòng", value: "4" }
];

// Chuyển từ YYYY-MM-DD sang DD/MM/YYYY
function formatDateDMY(dateStr) {
  if (!dateStr) return "";
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}/${mm}/${yyyy}`;
}

export default function HolidayCreate({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    name: "",
    from_date: "",
    to_date: "",
    apply_unit: "ALL",
    description: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Vui lòng nhập tên ngày nghỉ lễ.";
    if (form.name.length > 100) return "Tên ngày nghỉ tối đa 100 ký tự.";
    if (!form.from_date || !form.to_date) return "Vui lòng chọn đủ thời gian áp dụng.";
    if (form.description.length > 500) return "Ghi chú tối đa 500 ký tự.";
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
      await createHoliday({
        name: form.name.trim(),
        from_date: formatDateDMY(form.from_date),
        to_date: formatDateDMY(form.to_date),
        apply_unit: form.apply_unit,
        description: form.description.trim()
      });
      setLoading(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setLoading(false);
      // Nếu có lỗi trả về từ API, ưu tiên hiển thị message chi tiết
      const apiMessage = err?.message || err?.response?.data?.message;
      if (
        apiMessage === "Tên ngày lễ này đã tồn tại" ||
        (err?.code === "INTERNAL_ERROR" && apiMessage === "Tên ngày lễ này đã tồn tại")
      ) {
        setError("Tên ngày lễ này đã tồn tại");
      } else if (
        err?.code === "INTERNAL_ERROR" &&
        apiMessage === "Thời gian ngày lễ bị trùng lặp với dữ liệu đã có"
      ) {
        setError("Thời gian ngày lễ bị trùng lặp với dữ liệu đã có");
      } else if (apiMessage) {
        setError(apiMessage);
      } else {
        setError("Có lỗi xảy ra khi tạo ngày nghỉ lễ.");
      }
    }
  };

  return (
    <form className="max-w-2xl mx-auto p-6 bg-white rounded shadow" onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block mb-1 font-medium">
          Tên ngày nghỉ <span className="text-red-500">*</span>
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
          Thời gian áp dụng <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 items-center">
          <input
            className="border rounded px-3 py-2"
            type="date"
            value={form.from_date}
            onChange={e => handleChange("from_date", e.target.value)}
          />
          <span>đến ngày</span>
          <input
            className="border rounded px-3 py-2"
            type="date"
            value={form.to_date}
            onChange={e => handleChange("to_date", e.target.value)}
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Đơn vị áp dụng</label>
        <select
          className="border rounded px-3 py-2 w-full"
          value={form.apply_unit}
          onChange={e => handleChange("apply_unit", e.target.value)}
        >
          {APPLY_UNIT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Ghi chú</label>
        <textarea
          className="border rounded px-3 py-2 w-full"
          maxLength={500}
          rows={3}
          placeholder="Nhập mô tả chi tiết..."
          value={form.description}
          onChange={e => handleChange("description", e.target.value)}
        />
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          className="px-6 py-2 rounded border"
          onClick={onCancel}
          disabled={loading}
        >Hủy</button>
        <button
          type="submit"
          className="px-6 py-2 rounded bg-black text-white"
          disabled={loading}
        >{loading ? "Đang lưu..." : "Thêm"}</button>
      </div>
    </form>
  );
}
