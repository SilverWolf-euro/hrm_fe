import React from "react";

// Tổng quan nghỉ phép (Dashboard)
export default function LeaveDashboard() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Tổng quan nghỉ phép</h1>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded shadow text-center">
          <div className="text-lg font-semibold">Phép năm</div>
          <div className="text-2xl font-bold text-blue-600">12</div>
        </div>
        <div className="bg-green-100 p-4 rounded shadow text-center">
          <div className="text-lg font-semibold">Đã dùng</div>
          <div className="text-2xl font-bold text-green-600">5</div>
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow text-center">
          <div className="text-lg font-semibold">Còn lại</div>
          <div className="text-2xl font-bold text-yellow-600">7</div>
        </div>
        <div className="bg-gray-100 p-4 rounded shadow text-center">
          <div className="text-lg font-semibold">Nghỉ không lương</div>
          <div className="text-2xl font-bold text-gray-600">0</div>
        </div>
      </div>
      {/* Mini Calendar */}
      <div className="mb-6">
        <div className="bg-white p-4 rounded shadow">
          <div className="font-semibold mb-2">Lịch tháng</div>
          {/* Calendar component sẽ đặt ở đây */}
          <div className="h-40 flex items-center justify-center text-gray-400">[Calendar Placeholder]</div>
        </div>
      </div>
      {/* Danh sách đơn nghỉ gần đây */}
      <div className="bg-white p-4 rounded shadow">
        <div className="font-semibold mb-2">Đơn nghỉ gần đây</div>
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
            <tr>
              <td>12-13/03</td>
              <td>Phép năm</td>
              <td>2</td>
              <td className="text-yellow-600">Chờ duyệt</td>
            </tr>
            <tr>
              <td>20/03</td>
              <td>Nghỉ ốm</td>
              <td>1</td>
              <td className="text-green-600">Đã duyệt</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
