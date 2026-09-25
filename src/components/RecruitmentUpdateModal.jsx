import React, { useMemo } from "react";

export default function RecruitmentUpdateModal({ open, onClose, data, year, onSave }) {
  const [editData, setEditData] = React.useState(data || {});

  React.useEffect(() => {
    setEditData(data || {});
  }, [data]);

  const soLuongCanTuyen = Number(data?.quantity || 0);
  const soLuongDaTuyen = Number(editData.soLuongDaTuyen || data?.soLuongDaTuyen || 0);
  const hienTrang = useMemo(() => {
    if (soLuongDaTuyen >= soLuongCanTuyen) return "Đã tuyển đủ";
    return `Còn thiếu ${soLuongCanTuyen - soLuongDaTuyen}`;
  }, [soLuongCanTuyen, soLuongDaTuyen]);

  if (!open || !data) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form
        className="bg-white p-6 rounded shadow-lg min-w-[500px] relative"
        onSubmit={e => {
          e.preventDefault();
          if ((editData.khoKhan || "").length > 500 || (editData.bienPhap || "").length > 500 || (editData.deXuat || "").length > 500) {
            alert("Tối đa 500 ký tự cho mỗi trường!");
            return;
          }
          onSave({
            ...data,
            ...editData,
            hienTrang,
            soLuongDaTuyen: editData.soLuongDaTuyen || data.soLuongDaTuyen || 0
          });
          onClose();
        }}
      >
        <button
          type="button"
          className="absolute top-2 right-2 text-gray-400 hover:text-black"
          onClick={onClose}
        >×</button>
        <h3 className="font-bold mb-4">Cập nhật tuyển dụng</h3>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <label className="block mb-1">Năm</label>
            <input className="border rounded px-2 py-1 w-full bg-gray-100" value={year} disabled />
          </div>
          <div>
            <label className="block mb-1">Địa điểm</label>
            <input className="border rounded px-2 py-1 w-full bg-gray-100" value={data.location} disabled />
          </div>
          <div>
            <label className="block mb-1">Phòng ban</label>
            <input className="border rounded px-2 py-1 w-full bg-gray-100" value={data.department} disabled />
          </div>
          <div>
            <label className="block mb-1">Vị trí</label>
            <input className="border rounded px-2 py-1 w-full bg-gray-100" value={data.position} disabled />
          </div>
          <div>
            <label className="block mb-1">SL cần tuyển</label>
            <input className="border rounded px-2 py-1 w-full bg-gray-100" value={data.quantity} disabled />
          </div>
          <div>
            <label className="block mb-1">SL đã tuyển</label>
            <input className="border rounded px-2 py-1 w-full" type="number" min={0} value={editData.soLuongDaTuyen || data.soLuongDaTuyen || 0} onChange={e => setEditData(d => ({...d, soLuongDaTuyen: e.target.value}))} />
          </div>
          <div>
            <label className="block mb-1">Hiện trạng</label>
            <input className="border rounded px-2 py-1 w-full bg-gray-100" value={hienTrang} disabled />
          </div>
          <div className="col-span-2">
            <label className="block mb-1">Tồn tại/Khó khăn</label>
            <textarea className="border rounded px-2 py-1 w-full" maxLength={500} value={editData.khoKhan || ""} onChange={e => setEditData(d => ({...d, khoKhan: e.target.value}))} />
          </div>
          <div className="col-span-2">
            <label className="block mb-1">Biện pháp thực hiện</label>
            <textarea className="border rounded px-2 py-1 w-full" maxLength={500} value={editData.bienPhap || ""} onChange={e => setEditData(d => ({...d, bienPhap: e.target.value}))} />
          </div>
          <div className="col-span-2">
            <label className="block mb-1">Đề xuất</label>
            <textarea className="border rounded px-2 py-1 w-full" maxLength={500} value={editData.deXuat || ""} onChange={e => setEditData(d => ({...d, deXuat: e.target.value}))} />
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
