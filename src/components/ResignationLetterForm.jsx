import React, {useState} from "react";

const RESIGNATION_REASONS = ["Tự nguyện", "Bị chấm dứt", "Hết hạn hợp đồng", "Điều chuyển đi"];

export default function ResignationLetterForm({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    applicationDate: "",
    employeeCode: "",
    name: "",
    department: "",
    position: "",
    resignationReason: "Tự nguyện",
    resignationDate: ""
   
  });
  const [errors, setErrors] = useState({});
  const [fileError, setFileError] = useState("");

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  }

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
    if (!form.name.trim()) err.name = true;
    if (!form.department.trim()) err.department = true;
    if (!form.position.trim()) err.position = true;
    if (!form.resignationDate) err.resignationDate = true;
    if (form.resignationReason.length > 500) err.resignationReason = true;
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
    onClose();
  };

  //if (!open) return null;
  return (  
    <div className="max-h-screen flex items-center justify-center bg-gray-100 p-6">
    <form
      className="bg-white p-6 rounded shadow-lg w-[500px]"
      onSubmit={handleSubmit}
    >
      <h3 className="font-bold mb-4 text-lg">Đơn xin nghỉ việc</h3>
        <div className="mb-4">
            <label className="block mb-1">Ngày làm đơn</label>
            <input className={`border rounded px-2 py-1 w-full ${errors.applicationDate ? "border-red-500" : ""}`} type="date" value={form.applicationDate} onChange={e => handleChange("applicationDate", e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Họ tên</label>
            <input className={`border rounded px-2 py-1 w-full ${errors.name ? "border-red-500" : ""}`} value={form.name} onChange={e => handleChange("name", e.target.value)} />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Mã nhân viên</label>
            <input className={`border rounded px-2 py-1 w-full ${errors.employeeCode ? "border-red-500" : ""}`} value={form.employeeCode} onChange={e => handleChange("employeeCode", e.target.value)} />
        </div>
        <div className="mb-4">
            <label className="block mb-1">Phòng ban</label>
            <input className={`border rounded px-2 py-1 w-full ${errors.department ? "border-red-500" : ""}`} value={form.department} onChange={e => handleChange("department", e.target.value)} />
        </div>
        <div className="mb-4">
            <label className="block mb-1">Vị trí</label>
            <input className={`border rounded px-2 py-1 w-full ${errors.position ? "border-red-500" : ""}`} value={form.position} onChange={e => handleChange("position", e.target.value)} />
        </div>
        
        {/* <div className="mb-4">
            <label className="block mb-1">Lý do nghỉ việc</label>
            <select className="border rounded px-2 py-1 w-full" value={form.resignationReason} onChange={e => handleChange("resignationReason", e.target.value)}>
                {RESIGNATION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
        </div> */}
        <div className="mb-4">
            <label className="block mb-1">Ngày nghỉ việc</label>
            <input className={`border rounded px-2 py-1 w-full ${errors.resignationDate ? "border-red-500" : ""}`} type="date" value={form.resignationDate} onChange={e => handleChange("resignationDate", e.target.value)} />
        </div>
        <div className="mb-4">
            <label className="block mb-1">Lý do nghỉ việc</label>
            <textarea className={`border rounded px-2 py-1 w-full ${errors.resignationReason ? "border-red-500" : ""}`} value={form.resignationReason} onChange={e => handleChange("resignationReason", e.target.value)} maxLength={500} rows={4} />
        </div>
        <div className="mb-4">
            <label className="block mb-1">File đính kèm (nếu có)</label>
            <input type="file" multiple onChange={handleFile} />
            {fileError && <p className="text-red-500 text-sm mt-1">{fileError}</p>}
        </div>
        <div className="flex justify-end">
        <button
          className="px-4 py-2 rounded bg-gray-200"
          type="button"
          onClick={onClose}
        >
          Hủy
        </button>
        <button
          className="px-4 py-2 rounded bg-blue-500 text-white"
          type="submit"
        >
          Tạo đơn
        </button>
      </div>
      </form>
    </div>
  );

};
