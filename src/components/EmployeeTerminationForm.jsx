import React, { useState } from "react";

const LOCATIONS = ["Nhà máy", "Văn phòng"];
const LEAVE_REASONS = ["Tự nguyện", "Bị chấm dứt", "Hết hạn hợp đồng", "Điều chuyển đi"];

export default function EmployeeTerminationForm({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    code: "",
    name: "",
    department: "",
    location: "Nhà máy",
    applyDate: "",
    leaveDate: "",
    decisionCode: "",
    leaveReason: "",
    leaveDetail: "",
    files: [],
    approver: "",
    approveDate: "",
    approveComment: ""
  });
  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState("");

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleFile = e => {
    const files = Array.from(e.target.files);
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > 10 * 1024 * 1024) {
      setFileError("Tổng dung lượng file tối đa 10MB");
      return;
    }
    for (const f of files) {
      const ext = f.name.split(".").pop().toLowerCase();
      if (!["jpg", "jpeg", "png", "pdf"].includes(ext)) {
        setFileError("Chỉ cho phép file jpg, jpeg, png, pdf");
        return;
      }
    }
    setFileError("");
    setForm(f => ({ ...f, files }));
  };

  const validate = () => {
    const err = {};
    if (!form.code.trim()) err.code = true;
    if (!form.name.trim()) err.name = true;
    if (!form.department.trim()) err.department = true;
    if (!form.location) err.location = true;
    if (!form.leaveDate) err.leaveDate = true;
    if (!form.decisionCode.trim()) err.decisionCode = true;
    if (!form.leaveReason) err.leaveReason = true;
    if (form.code.length > 20) err.code = true;
    if (form.name.length > 50) err.name = true;
    if (form.department.length > 50) err.department = true;
    if (form.decisionCode.length > 20) err.decisionCode = true;
    if (form.leaveDetail.length > 500) err.leaveDetail = true;
    if (form.approver.length > 50) err.approver = true;
    if (form.approveComment.length > 500) err.approveComment = true;
    // Date logic
    if (form.leaveDate && form.applyDate) {
      const [ld, lm, ly] = form.leaveDate.split("-").map(Number);
      const [ad, am, ay] = form.applyDate.split("-").map(Number);
      const leave = new Date(ly, lm - 1, ld);
      const apply = new Date(ay, am - 1, ad);
      if (leave <= apply) err.leaveDate = true;
    }
    if (form.approveDate && form.applyDate) {
      const [ad, am, ay] = form.applyDate.split("-").map(Number);
      const [apd, apm, apy] = form.approveDate.split("-").map(Number);
      const apply = new Date(ay, am - 1, ad);
      const approve = new Date(apy, apm - 1, apd);
      if (approve <= apply) err.approveDate = true;
    }
    setErrors(err);
    return Object.keys(err).length === 0 && !fileError;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <form className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl relative" onSubmit={handleSubmit}>
        <button className="absolute top-2 right-2 text-gray-400 hover:text-black" type="button" onClick={onClose}>×</button>
        <h2 className="text-lg font-bold mb-4">THÔI VIỆC NHÂN SỰ</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Mã nhân viên <span className="text-red-500">*</span></label>
            <input className={`border rounded px-2 py-1 w-full ${errors.code ? 'border-red-500' : ''}`} maxLength={20} value={form.code} onChange={e => handleChange('code', e.target.value)} placeholder="Nhập mã nhân viên" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Họ và tên <span className="text-red-500">*</span></label>
            <input className={`border rounded px-2 py-1 w-full ${errors.name ? 'border-red-500' : ''}`} maxLength={50} value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Nhập họ và tên" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Phòng ban <span className="text-red-500">*</span></label>
            <input className={`border rounded px-2 py-1 w-full ${errors.department ? 'border-red-500' : ''}`} maxLength={50} value={form.department} onChange={e => handleChange('department', e.target.value)} placeholder="Nhập phòng ban" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Địa điểm làm việc <span className="text-red-500">*</span></label>
            <select className={`border rounded px-2 py-1 w-full ${errors.location ? 'border-red-500' : ''}`} value={form.location} onChange={e => handleChange('location', e.target.value)}>
              {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Ngày làm đơn</label>
            <input className="border rounded px-2 py-1 w-full" type="date" value={form.applyDate} onChange={e => handleChange('applyDate', e.target.value)} placeholder="dd/mm/yyyy" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Ngày dừng làm việc <span className="text-red-500">*</span></label>
            <input className={`border rounded px-2 py-1 w-full ${errors.leaveDate ? 'border-red-500' : ''}`} type="date" value={form.leaveDate} onChange={e => handleChange('leaveDate', e.target.value)} placeholder="dd/mm/yyyy" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Mã quyết định nghỉ việc <span className="text-red-500">*</span></label>
            <input className={`border rounded px-2 py-1 w-full ${errors.decisionCode ? 'border-red-500' : ''}`} maxLength={20} value={form.decisionCode} onChange={e => handleChange('decisionCode', e.target.value)} placeholder="Nhập mã quyết định" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Lý do nghỉ <span className="text-red-500">*</span></label>
            <select className={`border rounded px-2 py-1 w-full ${errors.leaveReason ? 'border-red-500' : ''}`} value={form.leaveReason} onChange={e => handleChange('leaveReason', e.target.value)}>
              <option value="">Chọn lý do</option>
              {LEAVE_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Lý do chi tiết</label>
          <textarea className={`border rounded px-2 py-1 w-full ${errors.leaveDetail ? 'border-red-500' : ''}`} maxLength={500} value={form.leaveDetail} onChange={e => handleChange('leaveDetail', e.target.value)} placeholder="Nhập lý do chi tiết..." />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">File đính kèm</label>
          <input className="border rounded px-2 py-1 w-full" type="file" multiple onChange={handleFile} accept=".jpg,.jpeg,.png,.pdf" />
          {fileError && <div className="text-red-500 text-xs mt-1">{fileError}</div>}
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Người duyệt</label>
            <input className={`border rounded px-2 py-1 w-full ${errors.approver ? 'border-red-500' : ''}`} maxLength={50} value={form.approver} onChange={e => handleChange('approver', e.target.value)} placeholder="Tên người duyệt" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Ngày duyệt</label>
            <input className={`border rounded px-2 py-1 w-full ${errors.approveDate ? 'border-red-500' : ''}`} type="date" value={form.approveDate} onChange={e => handleChange('approveDate', e.target.value)} placeholder="dd/mm/yyyy" />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1">Ý kiến người duyệt</label>
          <textarea className={`border rounded px-2 py-1 w-full ${errors.approveComment ? 'border-red-500' : ''}`} maxLength={500} value={form.approveComment} onChange={e => handleChange('approveComment', e.target.value)} placeholder="Nhập ý kiến..." />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>Hủy</button>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Xác nhận</button>
        </div>
      </form>
    </div>
  );
}
