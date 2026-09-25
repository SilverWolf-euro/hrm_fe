import React from "react";

export default function RecruitmentDetailModal({ open, onClose, data, year }) {
  if (!open || !data) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg min-w-[500px] relative">
        <button
          type="button"
          className="absolute top-2 right-2 text-gray-400 hover:text-black"
          onClick={onClose}
        >×</button>
        <h3 className="font-bold mb-4">Chi tiết tuyển dụng</h3>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div><b>Năm:</b> {year}</div>
          <div><b>Địa điểm:</b> {data.location}</div>
          <div><b>Phòng ban:</b> {data.department}</div>
          <div><b>Vị trí:</b> {data.position}</div>
          <div><b>SL cần tuyển:</b> {data.quantity}</div>
          <div><b>SL đã tuyển:</b> {data.soLuongDaTuyen}</div>
          <div><b>Hiện trạng:</b> {data.hienTrang}</div>
          <div className="col-span-2"><b>Tồn tại/Khó khăn:</b> {data.khoKhan || ""}</div>
          <div className="col-span-2"><b>Biện pháp thực hiện:</b> {data.bienPhap || ""}</div>
          <div className="col-span-2"><b>Đề xuất:</b> {data.deXuat || ""}</div>
        </div>
        <div className="flex justify-end mt-4">
          <button className="px-4 py-2 rounded bg-gray-200" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}
