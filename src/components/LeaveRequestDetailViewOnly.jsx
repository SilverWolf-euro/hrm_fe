import React, { useState, useEffect } from "react";
import { getLeaveRequestDetail } from "../services/leaveRequestService";

const STATUS_COLORS = {
  "Chờ duyệt": "bg-gray-400 text-white",
  "Đang duyệt": "bg-yellow-400 text-white",
  "Đã duyệt": "bg-green-500 text-white",
  "Từ chối": "bg-red-500 text-white",
};

function mapStatus(status) {
  switch (status) {
    case "PENDING": return "Chờ duyệt";
    case "SENT": return "Đang duyệt";
    case "REVIEWING": return "Đang duyệt";
    case "APPROVED": return "Đã duyệt";
    case "REJECTED": return "Từ chối";
    default: return status;
  }
}

export default function LeaveRequestDetailViewOnly({ code, onClose, currentUserCode }) {
  const [localData, setLocalData] = useState(null);

  useEffect(() => {
    async function fetchDetail() {
      const apiData = await getLeaveRequestDetail(code);
      setLocalData({
        applicationCode: apiData.leave_code,
        createdDate: apiData.created_date?.slice(0, 10),
        employeeCode: apiData.employee_code,
        name: apiData.employee_name,
        department: apiData.department_name,
        leaveType: apiData.leave_type,
        leaveDays: apiData.total_days,
        fromDate: apiData.from_date?.slice(0, 10),
        toDate: apiData.to_date?.slice(0, 10),
        leaveReason: apiData.reason,
        status: mapStatus(apiData.status),
        approvalHistory: apiData.approval_history?.map(h => ({
          level: h.level,
          status: mapStatus(h.status),
          comment: h.comment || "",
          position: h.position,
          department: h.department,
          approvalDate: h.approval_date ? h.approval_date.slice(0, 10) : "",
          approverName: h.approver_name || "",
        })) || [],
      });
    }
    fetchDetail();
  }, [code]);

  if (!localData) return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[400px] relative">Đang tải...</div>
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[600px] max-w-2xl relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>×</button>
        <div className="flex justify-between items-center mb-4">
          <div className="font-bold text-2xl">Chi tiết đơn nghỉ # {localData.applicationCode}</div>
          <span className={`rounded px-3 py-1 text-base font-semibold ${STATUS_COLORS[localData.status]}`}>{localData.status}</span>
        </div>
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <div className="flex items-center text-base">
              <span className="text-gray-500 w-36 text-left">Ngày tạo đơn:</span>
              <span className="font-semibold ml-2">{localData.createdDate}</span>
            </div>
            <div className="flex items-center text-base">
              <span className="text-gray-500 w-36 text-left">Mã nhân viên:</span>
              <span className="font-semibold ml-2">{localData.employeeCode}</span>
            </div>
            <div className="flex items-center text-base">
              <span className="text-gray-500 w-36 text-left">Họ và tên:</span>
              <span className="font-semibold ml-2">{localData.name}</span>
            </div>
            <div className="flex items-center text-base">
              <span className="text-gray-500 w-36 text-left">Bộ phận:</span>
              <span className="font-semibold ml-2">{localData.department}</span>
            </div>
            <div className="flex items-center text-base">
              <span className="text-gray-500 w-36 text-left">Loại nghỉ phép:</span>
              <span className="font-semibold ml-2">{localData.leaveType}</span>
            </div>
            <div className="flex items-center text-base">
              <span className="text-gray-500 w-36 text-left">Số ngày nghỉ:</span>
              <span className="font-semibold ml-2">{localData.leaveDays}</span>
            </div>
            <div className="flex items-center text-base">
              <span className="text-gray-500 w-36 text-left">Từ ngày:</span>
              <span className="font-semibold ml-2">{localData.fromDate || "-"}</span>
            </div>
            <div className="flex items-center text-base">
              <span className="text-gray-500 w-36 text-left">Đến ngày:</span>
              <span className="font-semibold ml-2">{localData.toDate || "-"}</span>
            </div>
            <div className="flex items-center text-base col-span-2">
              <span className="text-gray-500 w-36 text-left">Lý do nghỉ phép:</span>
              <span className="font-semibold ml-2">{localData.leaveReason || "-"}</span>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-2">Tiến trình duyệt</div>
          <div className="flex flex-col gap-2">
            {localData.approvalHistory && localData.approvalHistory.length > 0 ? (
              localData.approvalHistory.map((step, idx) => (
                <div key={idx} className="flex flex-col gap-0.5 border rounded p-2 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{step.position}</span>
                    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[step.status]}`}>{step.status}</span>
                  </div>
                  <div className="text-xs text-gray-700 ml-2">Người duyệt: <span className="font-semibold">{step.approverName}</span></div>
                  <div className="text-xs text-gray-700 ml-2">Ngày duyệt: <span className="font-semibold">{step.approvalDate}</span></div>
                  {step.comment && (
                    <div className="text-xs text-gray-700 ml-2">Nhận xét: <span className="font-semibold">{step.comment}</span></div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400">Chưa có tiến trình duyệt</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
