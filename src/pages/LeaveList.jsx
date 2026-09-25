import React, { useState } from "react";

const leaveList = [
  { id: 1, date: "12-13/03", type: "Phép năm", days: 2, status: "Chờ duyệt" },
  { id: 2, date: "20/03", type: "Nghỉ ốm", days: 1, status: "Đã duyệt" },
];

export default function LeaveList() {
  const [month, setMonth] = useState("");
  const [status, setStatus] = useState("");

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Danh sách đơn nghỉ</h2>
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block mb-1 font-medium">Tháng</label>
          <select value={month} onChange={e => setMonth(e.target.value)} className="border rounded px-3 py-2">
            <option value="">--Chọn tháng--</option>
            <option value="3">Tháng 3</option>
            <option value="4">Tháng 4</option>
            {/* Thêm các tháng khác nếu cần */}
          </select>
        </div>
        <div>
          <label className="block mb-1 font-medium">Trạng thái</label>
          <select value={status} onChange={e => setStatus(e.target.value)} className="border rounded px-3 py-2">
            <option value="">--Chọn trạng thái--</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
            <option value="cancelled">Hủy</option>
          </select>
        </div>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-2">Ngày nghỉ</th>
            <th className="text-left py-2">Loại nghỉ</th>
            <th className="text-left py-2">Số ngày</th>
            <th className="text-left py-2">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {leaveList.map(item => (
            <tr key={item.id}>
              <td>{item.date}</td>
              <td>{item.type}</td>
              <td>{item.days}</td>
              <td className={
                item.status === "Đã duyệt" ? "text-green-600" :
                item.status === "Chờ duyệt" ? "text-yellow-600" :
                item.status === "Từ chối" ? "text-red-600" :
                item.status === "Hủy" ? "text-gray-600" : ""
              }>{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
