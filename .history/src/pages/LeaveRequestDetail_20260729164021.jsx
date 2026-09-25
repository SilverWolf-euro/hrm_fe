import React, { useState, useEffect } from "react";
import { getLeaveRequestDetail, approveOrRejectLeaveRequest } from "../services/leaveRequestService";

const ROLE_FLOW = ["HR", "MANAGER"];
const ROLE_LABELS = { HR: "Nhân sự", MANAGER: "Trưởng phòng" };
const STATUS_COLORS = {
  "Chờ duyệt": "bg-gray-400 text-white",
  "Đang duyệt": "bg-yellow-400 text-white",
  "Đã duyệt": "bg-green-500 text-white",
  "Từ chối": "bg-red-500 text-white",
};


function getCurrentDate() {
  const d = new Date();
  return d.toLocaleDateString("vi-VN");
}

export default function LeaveRequestDetail({ code, userRole = "HR", onClose, onApprove, onReject, forceShowAction, currentUserCode }) {
  const [showActionPopup, setShowActionPopup] = useState(null); // null | 'APPROVED' | 'REJECTED'
  const [actionComment, setActionComment] = useState("");
  const [error, setError] = useState("");
  const [localData, setLocalData] = useState(null);

  // Lấy chi tiết đơn nghỉ phép từ API
  useEffect(() => {
    async function fetchDetail() {
      const apiData = await getLeaveRequestDetail(code);
      // Map dữ liệu API sang localData cho UI cũ
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
        statusDisplay: apiData.status_display || mapStatus(apiData.status),
        approvalHistory: apiData.approval_history?.map(h => ({
          level: h.level,
          status: mapStatus(h.status),
          comment: h.comment || "",
          position: h.position,
          department: h.department,
          approvalDate: h.approval_date ? h.approval_date.slice(0, 10) : "",
          approverName: h.approver_name || "",
          approverEmail: h.approver_email || "",
        })) || [],
      });
    }
    fetchDetail();
    // eslint-disable-next-line
  }, [code]);

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


  // Find current role in flow
  const currentStepIdx = ROLE_FLOW.findIndex(r => r === userRole);
  const isLastStep = currentStepIdx === ROLE_FLOW.length - 1;
  const isFirstStep = currentStepIdx === 0;

  if (!localData) return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[400px] relative">Đang tải...</div>
    </div>
  );

  // Xử lý gửi duyệt hoặc từ chối
  const handleActionSubmit = async () => {
    if (!actionComment.trim() && showActionPopup === 'REJECTED') {
      setError("Vui lòng nhập lý do từ chối.");
      return;
    }
    if (actionComment.length > 300) {
      setError("Nhận xét tối đa 300 ký tự.");
      return;
    }
    try {
      await approveOrRejectLeaveRequest(code, showActionPopup, actionComment);
      // Sau khi thao tác thành công, reload lại chi tiết đơn
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
        statusDisplay: apiData.status_display || mapStatus(apiData.status),
        approvalHistory: apiData.approval_history?.map(h => ({
          level: h.level,
          status: mapStatus(h.status),
          comment: h.comment || "",
          position: h.position,
          department: h.department,
          approvalDate: h.approval_date ? h.approval_date.slice(0, 10) : "",
          approverName: h.approver_name || "",
          approverEmail: h.approver_email || "",
        })) || [],
      });
      setShowActionPopup(null);
      setActionComment("");
      setError("");
      if (showActionPopup === 'APPROVED' && onApprove) onApprove();
      if (showActionPopup === 'REJECTED' && onReject) onReject();
    } catch (e) {
      setError("Có lỗi khi gửi duyệt/từ chối đơn!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 min-w-[600px] max-w-2xl relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>×</button>
        <div className="flex justify-between items-center mb-4">
          <div className="font-bold text-2xl">Chi tiết đơn nghỉ # {localData.applicationCode}</div>
          <span className={`rounded px-3 py-1 text-base font-semibold ${STATUS_COLORS[localData.status]}`}>{localData.statusDisplay}</span>
        </div>
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <div className="flex items-center text-base"><span className="text-gray-500 w-36">Ngày tạo đơn:</span> <span className="font-semibold ml-2">{localData.createdDate}</span></div>
            <div className="flex items-center text-base"><span className="text-gray-500 w-36">Mã nhân viên:</span> <span className="font-semibold ml-2">{localData.employeeCode}</span></div>
            <div className="flex items-center text-base"><span className="text-gray-500 w-36">Họ và tên:</span> <span className="font-semibold ml-2">{localData.name}</span></div>
            <div className="flex items-center text-base"><span className="text-gray-500 w-36">Bộ phận:</span> <span className="font-semibold ml-2">{localData.department}</span></div>
            <div className="flex items-center text-base"><span className="text-gray-500 w-36">Loại nghỉ phép:</span> <span className="font-semibold ml-2">{localData.leaveType}</span></div>
            <div className="flex items-center text-base"><span className="text-gray-500 w-36">Số ngày nghỉ:</span> <span className="font-semibold ml-2">{localData.leaveDays}</span></div>
            <div className="flex items-center text-base"><span className="text-gray-500 w-36">Từ ngày:</span> <span className="font-semibold ml-2">{localData.fromDate || "-"}</span></div>
            <div className="flex items-center text-base"><span className="text-gray-500 w-36">Đến ngày:</span> <span className="font-semibold ml-2">{localData.toDate || "-"}</span></div>
            <div className="flex items-center text-base col-span-2"><span className="text-gray-500 w-36">Lý do nghỉ phép:</span> <span className="font-semibold ml-2">{localData.leaveReason || "-"}</span></div>
          </div>
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-2">Tiến trình duyệt</div>
          <div className="flex flex-col gap-2">
            {localData.approvalHistory && localData.approvalHistory.length > 0 ? (
              localData.approvalHistory.map((step, idx) => (
                <div key={idx} className="flex flex-col gap-0.5 border rounded p-2 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{step.department}</span>
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
        {/* Ẩn nút duyệt/từ chối nếu là đơn của chính mình, trừ khi forceShowAction */}
        {(() => {
          // Kiểm tra nếu vai trò hiện tại đã duyệt hoặc từ chối trong approvalHistory thì không hiện nút
          const hasApprovedOrRejected = localData.approvalHistory && localData.approvalHistory.some(
            step => step.position === ROLE_LABELS[userRole] && (step.status === "Đã duyệt" || step.status === "Từ chối")
          );
          if (localData.status === "Từ chối" || localData.status === "Đã duyệt" || hasApprovedOrRejected) {
            return (
              <div className="flex gap-2 justify-end mt-4">
                <span className={`rounded px-4 py-2 font-semibold ${localData.status === "Đã duyệt" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {localData.status}
                </span>
              </div>
            );
          }

          // Lấy email user hiện tại
          let currentUserEmail = "";
          try {
            const userJson = localStorage.getItem("userInfo");
            if (userJson) {
              const user = JSON.parse(userJson);
              currentUserEmail = user.Email || user.email || "";
            }
          } catch {}

          // Tìm bước duyệt đầu tiên có status PENDING
          const firstPending = localData.approvalHistory && localData.approvalHistory.find(step => step.status === "Chờ duyệt");
          const isMyTurn = firstPending && firstPending.approverEmail === currentUserEmail;

          // Chỉ hiển thị nút duyệt/từ chối nếu là lượt của mình hoặc forceShowAction
          if ((forceShowAction || isMyTurn) && (localData.employeeCode !== undefined && localData.employeeCode !== (currentUserCode || window?.currentUser?.employeeCode))) {
            return (
              <div className="flex gap-2 justify-end mt-4">
                <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => { setShowActionPopup('REJECTED'); setActionComment(""); setError(""); }}>Từ chối đơn</button>
                <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={() => { setShowActionPopup('APPROVED'); setActionComment(""); setError(""); }}>Duyệt đơn</button>
              </div>
            );
          }
          return null;
        })()}
        {showActionPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 min-w-[350px] relative">
              <div className="font-semibold mb-2">
                {showActionPopup === 'REJECTED' ? (
                  <>Lý do từ chối <span className="text-red-500">*</span></>
                ) : (
                  <>Nhận xét khi duyệt đơn</>
                )}
              </div>
              <textarea
                className="border rounded w-full p-2 mb-2"
                rows={3}
                maxLength={300}
                placeholder={showActionPopup === 'REJECTED' ? "Nhập lý do từ chối..." : "Nhập nhận xét khi duyệt (không bắt buộc)..."}
                value={actionComment}
                onChange={e => setActionComment(e.target.value)}
              />
              {error && <div className="text-red-500 text-xs mb-2">{error}</div>}
              <div className="flex gap-2 justify-end">
                <button className="px-4 py-2 rounded border" onClick={() => { setShowActionPopup(null); setError(""); }}>Hủy</button>
                <button className={showActionPopup === 'REJECTED' ? "bg-red-500 text-white px-4 py-2 rounded" : "bg-green-500 text-white px-4 py-2 rounded"} onClick={handleActionSubmit}>Gửi</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
