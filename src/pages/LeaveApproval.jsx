import React, { useState } from "react";

export default function LeaveApproval() {
  const [rejectReason, setRejectReason] = useState("");

  // Dummy data
  const leave = {
    employee: "Nguyễn Văn A",
    department: "Kinh doanh",
    type: "Phép năm",
    time: "12/03 - 13/03 (2 ngày)",
    remain: 5,
    reason: "Việc cá nhân",
    overLimit: false,
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Phê duyệt nghỉ phép</h2>
      <div className="mb-2"><b>Nhân viên:</b> {leave.employee}</div>
      <div className="mb-2"><b>Phòng ban:</b> {leave.department}</div>
      <div className="mb-2"><b>Loại nghỉ:</b> {leave.type}</div>
      <div className="mb-2"><b>Thời gian:</b> {leave.time}</div>
      <div className="mb-2"><b>Phép còn lại:</b> <span className={leave.remain <= 0 ? "text-red-600" : "text-blue-600"}>{leave.remain} ngày</span></div>
      <div className="mb-2"><b>Lý do:</b> {leave.reason}</div>
      {leave.remain <= 0 && (
        <div className="text-red-500 mb-2">Cảnh báo: Nghỉ vượt phép!</div>
      )}
      <div className="flex gap-4 mt-4">
        <button className="px-6 py-2 rounded bg-red-600 text-white hover:bg-red-700">Từ chối</button>
        <button className="px-6 py-2 rounded bg-green-600 text-white hover:bg-green-700">Phê duyệt</button>
      </div>
      <div className="mt-4">
        <label className="block mb-1 font-medium">Lý do từ chối</label>
        <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} className="w-full border rounded px-3 py-2" />
      </div>
    </div>
  );
}
