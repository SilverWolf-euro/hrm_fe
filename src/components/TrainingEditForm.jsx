import React, { useState, useEffect } from "react";

const TRAINING_TYPES = ["Hội nhập", "Kỹ năng"];
const LOCATIONS = ["Nhà máy", "Văn phòng"];
const DEPARTMENTS = ["Phòng kinh doanh", "Nhân sự", "Kỹ thuật", "Sản xuất", "Phòng CNTT"];

export default function TrainingEditForm({ open, onClose, onSave, data }) {
  const [form, setForm] = useState({
    date: "",
    type: "",
    location: "",
    departments: [],
    content: "",
    required: "",
    joined: "",
    file: null,
    status: "",
    issues: "",
    solutions: "",
    proposal: ""
  });
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    if (data) {
      setForm({ ...data, file: null });
      setFileName(data.fileName || "");
    }
  }, [data]);

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleFile = e => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "xls", "xlsx"].includes(ext)) {
      alert("Chỉ cho phép file excel hoặc pdf!");
      return;
    }
    setForm(f => ({ ...f, file }));
    setFileName(file.name);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.date || !form.type || !form.location || !form.departments.length) {
      alert("Vui lòng nhập đầy đủ các trường bắt buộc!");
      return;
    }
    if (form.content.length > 200) {
      alert("Nội dung tối đa 200 ký tự!");
      return;
    }
    if (form.status.length > 500 || form.issues.length > 500 || form.solutions.length > 500 || form.proposal.length > 500) {
      alert("Các trường mô tả tối đa 500 ký tự!");
      return;
    }
    if (form.required && !/^[1-9][0-9]*$/.test(form.required)) {
      alert("Số lượng yêu cầu phải là số nguyên dương!");
      return;
    }
    if (form.joined && !/^[1-9][0-9]*$/.test(form.joined)) {
      alert("Số lượng tham gia phải là số nguyên dương!");
      return;
    }
    onSave(form);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form className="bg-white p-6 rounded shadow-lg min-w-[500px] relative" onSubmit={handleSubmit}>
        <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={onClose}>×</button>
        <h3 className="font-bold mb-4">Cập nhật</h3>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block mb-1">Ngày đào tạo *</label>
            <input className="border rounded px-2 py-1 w-full" type="text" placeholder="dd/mm/yyyy" value={form.date} onChange={e => handleChange("date", e.target.value)} required />
          </div>
          <div>
            <label className="block mb-1">Loại đào tạo *</label>
            <select className="border rounded px-2 py-1 w-full" value={form.type} onChange={e => handleChange("type", e.target.value)} required>
              <option value="">Chọn loại đào tạo</option>
              {TRAINING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1">Địa điểm *</label>
            <select className="border rounded px-2 py-1 w-full" value={form.location} onChange={e => handleChange("location", e.target.value)} required>
              <option value="">Chọn địa điểm</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1">Bộ phận tham gia *</label>
            <select className="border rounded px-2 py-1 w-full" value={form.departments} onChange={e => handleChange("departments", e.target.value)} required>
              <option value="">Chọn bộ phận</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block mb-1">Nội dung</label>
            <textarea className="border rounded px-2 py-1 w-full" maxLength={200} value={form.content} onChange={e => handleChange("content", e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Số lượng yêu cầu</label>
            <input className="border rounded px-2 py-1 w-full" type="number" min={1} value={form.required} onChange={e => handleChange("required", e.target.value)} />
          </div>
          <div>
            <label className="block mb-1">Số lượng tham gia</label>
            <input className="border rounded px-2 py-1 w-full" type="number" min={1} value={form.joined} onChange={e => handleChange("joined", e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="block mb-1">File đính kèm</label>
            <input type="file" accept=".pdf,.xls,.xlsx" onChange={handleFile} />
            {fileName && <div className="text-xs mt-1">{fileName}</div>}
          </div>
          <div className="col-span-2">
            <label className="block mb-1">Hiện trạng</label>
            <textarea className="border rounded px-2 py-1 w-full" maxLength={500} value={form.status} onChange={e => handleChange("status", e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="block mb-1">Tồn tại/Khó khăn</label>
            <textarea className="border rounded px-2 py-1 w-full" maxLength={500} value={form.issues} onChange={e => handleChange("issues", e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="block mb-1">Biện pháp thực hiện</label>
            <textarea className="border rounded px-2 py-1 w-full" maxLength={500} value={form.solutions} onChange={e => handleChange("solutions", e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className="block mb-1">Đề xuất</label>
            <textarea className="border rounded px-2 py-1 w-full" maxLength={500} value={form.proposal} onChange={e => handleChange("proposal", e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>Đóng</button>
          <button type="submit" className="px-4 py-2 rounded bg-blue-500 text-white">Lưu</button>
        </div>
      </form>
    </div>
  );
}
