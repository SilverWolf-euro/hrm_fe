import React, { useEffect, useState } from "react";
import { getLeaveTypeDetail } from "../services/leaveTypeService";

export default function LeaveTypeDetailModal({ open, onClose, leaveTypeId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && leaveTypeId) {
      setLoading(true);
      getLeaveTypeDetail(leaveTypeId)
        .then(res => setData(res.data))
        .catch(() => setError("Không lấy được thông tin chi tiết."))
        .finally(() => setLoading(false));
    } else {
      setData(null);
      setError("");
    }
  }, [open, leaveTypeId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg min-w-[400px] relative">
        <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={onClose}>×</button>
        <h3 className="font-bold mb-4 text-lg">Chi tiết loại nghỉ</h3>
        {loading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : data ? (
          <div className="space-y-2">
            <div><b>Tên loại nghỉ:</b> {data.name}</div>
            <div><b>Ký hiệu:</b> {data.code}</div>
            <div><b>Loại:</b> {data.leave_category === "PAID" ? "Nghỉ hưởng lương" : data.leave_category === "UNPAID" ? "Nghỉ không lương" : "Nghỉ chế độ"}</div>
            <div><b>Số công hưởng:</b> {data.paid_days}</div>
            <div><b>Số ngày nghỉ tối đa:</b> {data.max_days_per_request === 0 ? "Không giới hạn" : data.max_days_per_request}</div>
            <div><b>Đối tượng áp dụng:</b> {data.apply_object === "ALL" ? "Tất cả nhân viên" : "NV chính thức"}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
