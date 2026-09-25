import React, { useEffect, useState } from "react";
import { getHolidayDetail } from "../services/holidayTypeService";

export default function HolidayDetailModal({ open, onClose, holidayId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open && holidayId) {
      setLoading(true);
      getHolidayDetail(holidayId)
        .then(res => setData(res.data))
        .catch(() => setError("Không lấy được thông tin chi tiết."))
        .finally(() => setLoading(false));
    } else {
      setData(null);
      setError("");
    }
  }, [open, holidayId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg min-w-[400px] relative">
        <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={onClose}>×</button>
        <h3 className="font-bold mb-4 text-lg">Chi tiết ngày nghỉ lễ</h3>
        {loading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : data ? (
          <div className="space-y-2">
            <div><b>Tên ngày nghỉ:</b> {data.name}</div>
            <div><b>Thời gian:</b> {data.from_date} - {data.to_date}</div>
            <div><b>Đơn vị áp dụng:</b> {data.apply_unit === "ALL" ? "Toàn công ty" : data.apply_unit}</div>
            <div><b>Ghi chú:</b> {data.description}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
