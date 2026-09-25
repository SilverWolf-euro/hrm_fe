import React from "react";

export default function TrainingDetailModal({ open, onClose, data }) {
  if (!open || !data) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg min-w-[500px] relative">
        <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={onClose}>×</button>
        <h3 className="font-bold mb-4">Chi tiết buổi đào tạo</h3>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div><b>Ngày đào tạo:</b> {data.date}</div>
          <div><b>Loại đào tạo:</b> {data.type}</div>
          <div><b>Địa điểm:</b> {data.location}</div>
          <div><b>Bộ phận tham gia:</b> {data.departments && data.departments.join(", ")}</div>
          <div className="col-span-2"><b>Nội dung:</b> {data.content}</div>
          <div><b>Số lượng yêu cầu:</b> {data.required}</div>
          <div><b>Số lượng tham gia:</b> {data.joined}</div>
          <div className="col-span-2"><b>File đính kèm:</b> {data.fileName || ""}</div>
          <div className="col-span-2"><b>Hiện trạng:</b> {data.status}</div>
          <div className="col-span-2"><b>Tồn tại/Khó khăn:</b> {data.issues}</div>
          <div className="col-span-2"><b>Biện pháp thực hiện:</b> {data.solutions}</div>
          <div className="col-span-2"><b>Đề xuất:</b> {data.proposal}</div>
        </div>
        <div className="flex justify-end mt-4">
          <button className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
