// src/constants/menuConfig.js
// id của menu con = path của route; requiredPermission = mã quyền (auth.tb_function.s_code)
// Mục không khai báo requiredPermission => ai đăng nhập cũng thấy.

// Trang mặc định khi không đủ quyền (không yêu cầu quyền để tránh redirect vòng lặp)
export const DEFAULT_ROUTE = "/leave-requests-sent";

export const dropdownModules = [
  {
    id: "personnel",
    name: "Quản lý hồ sơ nhân sự",
    icon: "M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 100-8 4 4 0 000 8z",
    children: [
      { id: "HR-report", name: "Danh sách nhân sự", requiredPermission: "employee_view" },
    ],
  },
  {
    id: "attendance",
    name: "Chấm công",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    children: [
      { id: "attendance", name: "Kết nối máy chấm công", requiredPermission: "attendance_view" },
      { id: "work-shift-summary", name: "Bảng phân ca", requiredPermission: "shift_assignment_view" },
      { id: "attendance-daily-report", name: "Báo cáo chấm công hàng ngày", requiredPermission: "attendance_report_view" },
    ],
  },
  {
    id: "leave",
    name: "Quản lý đơn nghỉ",
    icon: "M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2zm-8-2a3 3 0 016 0v2H9V7zm8 11H7v-7h10v7z",
    children: [
      { id: "leave-requests-sent", name: "Đơn nghỉ đã gửi" },
      { id: "leave-requests-all", name: "Danh sách đơn nghỉ nhân viên", requiredPermission: "leave_request_view" },
      { id: "leave-summary", name: "Báo cáo tổng hợp nghỉ", requiredPermission: "leave_report_view" },
    ],
  },
  {
    id: "system",
    name: "Hệ thống & phân quyền",
    icon: "M12 4a8 8 0 100 16 8 8 0 000-16zm1 13h-2v-2h2v2zm0-4h-2V7h2v6z",
    children: [
      { id: "role-management", name: "Quản lý vai trò", requiredPermission: "roles_view" },
      { id: "user-management", name: "Quản lý tài khoản", requiredPermission: "user_view" },
      { id: "user-permission-management", name: "Phân quyền người dùng", requiredPermission: "permission_view" },
      { id: "departments", name: "Quản lý phòng ban", requiredPermission: "department_view" },
      { id: "positions", name: "Quản lý chức vụ", requiredPermission: "position_view" },
      { id: "work-shifts", name: "Danh sách ca làm việc", requiredPermission: "work_shift_view" },
      { id: "work-shift-rules", name: "Danh sách phân ca", requiredPermission: "work_shift_rule_view" },
      { id: "holiday-config", name: "Cấu hình ngày nghỉ lễ", requiredPermission: "holiday_view" },
      { id: "leave-config", name: "Cấu hình loại nghỉ", requiredPermission: "leave_type_view" },
      { id: "approval-flow-config", name: "Cấu hình quy trình phê duyệt", requiredPermission: "approval_setting_view" },
      { id: "approval-settings", name: "Danh sách quy trình phê duyệt", requiredPermission: "approval_setting_view" },
    ],
  },
];

// path route -> quyền yêu cầu (lấy từ menu + các trang con không nằm trên menu)
export const routePermissions = {
  ...Object.fromEntries(
    dropdownModules.flatMap((module) =>
      module.children.map((child) => [child.id, child.requiredPermission])
    )
  ),
  "employee/new": "employee_view",
  "approval-settings/update/:id": "approval_setting_view",
};
