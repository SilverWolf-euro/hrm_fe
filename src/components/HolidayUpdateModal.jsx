import React, { useEffect, useState } from "react";
import { getHolidayDetail, updateHoliday } from "../services/holidayTypeService";

const APPLY_UNIT_OPTIONS = [
  { label: "Tất cả đơn vị", value: "ALL" },
  { label: "Nhà máy", value: "FACTORY" },
  { label: "Văn phòng", value: "OFFICE" }
];


// Chuyển từ YYYY-MM-DD sang DD/MM/YYYY
function formatDateDMY(dateStr) {
  if (!dateStr) return "";
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}/${mm}/${yyyy}`;
}

export default function HolidayUpdateModal({ holidayId, open, onSuccess, onCancel }) {
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && holidayId) {
      getHolidayDetail(holidayId)
        .then(res => {
          const d = res.data;
          // d.from_date, d.to_date có thể là DD/MM/YYYY hoặc YYYY-MM-DD, chuẩn hóa về YYYY-MM-DD cho input type="date"
          function toInputDate(str) {
            if (!str) return "";
            if (str.includes("/")) {
              const [dd, mm, yyyy] = str.split("/");
              return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
            }
            return str;
          }
          setForm({
            name: d.name || "",
            from_date: toInputDate(d.from_date),
            to_date: toInputDate(d.to_date),
            apply_unit: d.apply_unit || "ALL",
            description: d.description || ""
          });
        })
        .catch(() => setError("Không lấy được thông tin."));
    } else {
      setForm(null);
      setError("");
    }
  }, [open, holidayId]);

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
      await updateHoliday(holidayId, {
        name: form.name.trim(),
        from_date: formatDateDMY(form.from_date),
        to_date: formatDateDMY(form.to_date),
        apply_unit: form.apply_unit,
        description: form.description.trim()
      });
      setLoading(false);
      if (onSuccess) onSuccess();
    } catch {
      setLoading(false);
      setError("Có lỗi xảy ra khi cập nhật ngày nghỉ lễ.");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg min-w-[400px] relative">
        <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={onCancel}>×</button>
        <h3 className="font-bold mb-4 text-lg">Cập nhật ngày nghỉ lễ</h3>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {!form ? (
          <div>Đang tải...</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Tên ngày nghỉ <span className="text-red-500">*</span></label>
              <input className="border rounded px-3 py-2 w-full" value={form.name} onChange={e => handleChange("name", e.target.value)} />
            </div>
            <div className="mb-3 flex gap-2">
              <div className="flex-1">
                <label className="block mb-1 font-medium">Từ ngày <span className="text-red-500">*</span></label>
                <input type="date" className="border rounded px-3 py-2 w-full" value={form.from_date} onChange={e => handleChange("from_date", e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-medium">Đến ngày <span className="text-red-500">*</span></label>
                <input type="date" className="border rounded px-3 py-2 w-full" value={form.to_date} onChange={e => handleChange("to_date", e.target.value)} />
              </div>
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Đơn vị áp dụng</label>
              <select className="border rounded px-3 py-2 w-full" value={form.apply_unit} onChange={e => handleChange("apply_unit", e.target.value)}>
                {APPLY_UNIT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="block mb-1 font-medium">Ghi chú</label>
              <textarea className="border rounded px-3 py-2 w-full" value={form.description} onChange={e => handleChange("description", e.target.value)} maxLength={500} />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onCancel}>Hủy</button>
              <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>{loading ? "Đang lưu..." : "Lưu thay đổi"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
