import React from "react";

// Badge màu trạng thái
const statusBadge = status => {
  let color = "bg-gray-400 text-white";
  if (status === "Đang duyệt") color = "bg-yellow-400 text-white";
  else if (status === "Đã duyệt") color = "bg-green-500 text-white";
  else if (status === "Từ chối") color = "bg-red-500 text-white";
  else if (status === "Chờ duyệt") color = "bg-gray-400 text-white";
  return (
    <span className={`inline-block rounded-md px-3 py-1 text-xs font-semibold ${color}`}>{status}</span>
  );
};

export default function EmployeeTerminationDetail({ data, onClose }) {
  if (!data) return null;
  // Lấy mã quyết định nếu có
  const decisionCode = data.decisionCode;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={onClose}>×</button>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Chi tiết đơn xin nghỉ việc {data.name}</h3>
          {statusBadge(data.applicationStatus)}
        </div>
        <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4 mb-4">
          <div>
            <div className="text-xs text-gray-500">Ngày làm đơn</div>
            <div className="font-semibold">{data.applicationDate}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Mã nhân viên</div>
            <div className="font-semibold">{data.employeeCode}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Họ và tên</div>
            <div className="font-semibold">{data.name}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Chức vụ</div>
            <div className="font-semibold">{data.position}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Bộ phận</div>
            <div className="font-semibold">{data.department}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Ngày dừng làm việc</div>
            <div className="font-semibold">{data.leaveDate}</div>
          </div>
          <div className="col-span-2">
            <div className="text-xs text-gray-500">Lý do nghỉ việc</div>
            <div className="font-semibold">{data.leaveReason}</div>
          </div>
          {decisionCode && (
            <div className="col-span-2">
              <div className="text-xs text-gray-500">Mã quyết định</div>
              <div className="font-semibold">{decisionCode}</div>
            </div>
          )}
        </div>
        <div className="mb-2 font-semibold">Tiến trình duyệt</div>
        <div className="space-y-2 mb-2">
          {data.approval && data.approval.length > 0 ? (
            data.approval.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {/* Icon trạng thái */}
                {step.status === "Đã duyệt" && (
                  <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="9" fill="#22c55e"/><path d="M6 10.5l2.5 2.5 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                )}
                {step.status === "Từ chối" && (
                  <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="9" fill="#ef4444"/><path d="M7 7l6 6m0-6l-6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                )}
                {step.status === "Chờ duyệt" && (
                  <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="9" fill="#a3a3a3"/><path d="M10 5v5l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                )}
                {step.status === "Đang duyệt" && (
                  <svg width="20" height="20" fill="none"><circle cx="10" cy="10" r="9" fill="#facc15"/><path d="M10 5v5l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                )}
                <div className="flex-1">
                  <span className="font-semibold">{step.approverPosition}</span>
                  <span className="ml-2 text-xs text-gray-500">{step.status}</span>
                  {step.status !== "Chờ duyệt" && step.status !== "Đang duyệt" && (
                    <>
                      <span className="ml-2 text-xs text-gray-500">{step.approver}</span>
                      <span className="ml-2 text-xs text-gray-500">{step.date}</span>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-400 italic">Chưa có tiến trình duyệt</div>
          )}
        </div>
        <div className="flex justify-end mt-4">
            <button className="px-4 py-2 rounded bg-green-600 text-white" onClick={() => alert('Duyệt đơn: ' + data.employeeCode)}>Duyệt đơn</button>
            <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={() => alert('Từ chối đơn: ' + data.employeeCode)}>Từ chối</button>
        </div>
      </div>
    </div>
  );
}
