import React from "react";
import LeaveRequestDetail from "./LeaveRequestDetail";

// Trang chi tiết đơn nghỉ phép cho admin/HR/manager, luôn hiển thị nút duyệt và từ chối
export default function LeaveRequestAllDetail(props) {
  // Truyền prop forceShowAction để ép hiện nút duyệt/từ chối
  // Gọi onApproveOrReject sau khi duyệt hoặc từ chối thành công
  return <LeaveRequestDetail {...props} forceShowAction onApprove={props.onApproveOrReject} onReject={props.onApproveOrReject} />;
}
