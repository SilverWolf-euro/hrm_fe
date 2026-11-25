// src/constants/menuConfig.js
// Nguồn duy nhất cho header (mega-menu), sidebar trái, breadcrumb và phân quyền route (Spec HRM UI v1 §2).
// - path: route của màn hình (giữ route cũ nếu đã có).
// - requiredPermission: mã quyền (auth.tb_function.s_code). Không khai báo => ai đăng nhập cũng thấy.
// - Item user không có quyền sẽ bị ẩn; nhóm/phân hệ không còn item nào cũng ẩn.

// Trang mặc định khi không đủ quyền (không yêu cầu quyền để tránh redirect vòng lặp)
export const DEFAULT_ROUTE = "/leave-requests-sent";

export const MENU = [
  {
    key: "nhan-su",
    label: "Nhân sự",
    groups: [
      {
        label: "Hồ sơ",
        items: [{ label: "Hồ sơ nhân sự", path: "/HR-report", requiredPermission: "employee_view" }],
      },
    ],
  },
  {
    key: "cham-cong",
    label: "Chấm công",
    groups: [
      {
        label: "Chấm công",
        items: [
          { label: "Dữ liệu chấm công", path: "/attendance", requiredPermission: "attendance_view" },
          { label: "Bảng phân ca", path: "/work-shift-summary", requiredPermission: "shift_assignment_view" },
          { label: "Đơn nghỉ của tôi", path: "/leave-requests-sent" },
          { label: "Danh sách đơn nghỉ nhân viên", path: "/leave-requests-all", requiredPermission: "leave_request_view" },
        ],
      },
      {
        label: "Báo cáo",
        items: [
          { label: "Báo cáo ngày", path: "/attendance-daily-report", requiredPermission: "attendance_report_view" },
          { label: "Báo cáo tổng hợp nghỉ phép", path: "/leave-summary", requiredPermission: "leave_report_view" },
        ],
      },
    ],
  },
  {
    key: "quan-tri",
    label: "Quản trị",
    groups: [
      {
        label: "Danh mục chung",
        items: [
          { label: "Chức vụ", path: "/positions", requiredPermission: "position_view" },
          { label: "Phòng ban", path: "/departments", requiredPermission: "department_view" },
        ],
      },
      {
        label: "Chấm công - Tính lương",
        items: [
          { label: "Ca làm việc", path: "/work-shifts", requiredPermission: "work_shift_view" },
          { label: "Loại nghỉ", path: "/leave-config", requiredPermission: "leave_type_view" },
          { label: "Nghỉ lễ", path: "/holiday-config", requiredPermission: "holiday_view" },
          { label: "Phân ca làm việc", path: "/work-shift-rules", requiredPermission: "work_shift_rule_view" },
        ],
      },
      {
        label: "Phân quyền",
        items: [
          { label: "Phân quyền người dùng", path: "/user-permission-management", requiredPermission: "permission_view" },
          { label: "Thiết lập quyền", path: "/role-management", requiredPermission: "roles_view" },
          { label: "Quản lý tài khoản", path: "/user-management", requiredPermission: "user_view" },
        ],
      },
      {
        label: "Quy trình",
        items: [
          { label: "Cấu hình luồng duyệt", path: "/quan-tri/luong-duyet", requiredPermission: "approval_flow_manage" },
        ],
      },
    ],
  },
];

// Các trang con không nằm trên menu nhưng thuộc 1 item menu (để highlight sidebar + breadcrumb + phân quyền)
// inherit: trang con dùng quyền của item cha; false => giữ quyền riêng như trước (xem LEGACY_PERMISSIONS)
const SUB_ROUTES = [
  { path: "/employee/new", parent: "/HR-report", label: "Thêm nhân sự", inherit: true },
  { path: "/profile/:id", parent: "/HR-report", label: "Hồ sơ", inherit: false },
  { path: "/quan-tri/luong-duyet/moi", parent: "/quan-tri/luong-duyet", label: "Thiết lập luồng duyệt mới", inherit: true },
  { path: "/quan-tri/luong-duyet/:id", parent: "/quan-tri/luong-duyet", label: "Cập nhật luồng duyệt", inherit: true },
  { path: "/leave-request-detail/:id", parent: "/leave-requests-sent", label: "Chi tiết đơn", inherit: true },
];

// Màn hình cũ không còn trên menu nhưng vẫn giữ route + quyền như trước
const LEGACY_PERMISSIONS = {
  "approval-flow-config": "approval_setting_view",
  "approval-settings": "approval_setting_view",
  "approval-settings/update/:id": "approval_setting_view",
};

const stripSlash = (p) => p.replace(/^\//, "");

// Lọc menu theo quyền: ẩn item không có quyền, ẩn nhóm/phân hệ rỗng
export const filterMenu = (hasPermission) =>
  MENU.map((m) => ({
    ...m,
    groups: m.groups
      .map((g) => ({ ...g, items: g.items.filter((i) => hasPermission(i.requiredPermission)) }))
      .filter((g) => g.items.length > 0),
  })).filter((m) => m.groups.length > 0);

const matchPath = (pattern, pathname) => {
  const re = new RegExp("^" + pattern.replace(/:[^/]+/g, "[^/]+") + "/?$", "i");
  return re.test(pathname);
};

// Ngữ cảnh menu của 1 pathname: { module, group, item, subLabel }
export const findMenuContext = (pathname) => {
  const sub = SUB_ROUTES.find((s) => matchPath(s.path, pathname));
  const target = sub ? sub.parent : pathname;
  for (const module of MENU) {
    for (const group of module.groups) {
      const item = group.items.find((i) => matchPath(i.path, target));
      if (item) return { module, group, item, subLabel: sub?.label };
    }
  }
  return null;
};

// path route (không có "/" đầu) -> quyền yêu cầu; dùng cho ProtectedRoute
export const routePermissions = (() => {
  const map = { ...LEGACY_PERMISSIONS };
  MENU.forEach((m) =>
    m.groups.forEach((g) =>
      g.items.forEach((i) => {
        map[stripSlash(i.path)] = i.requiredPermission;
      })
    )
  );
  SUB_ROUTES.filter((s) => s.inherit).forEach((s) => {
    const ctx = findMenuContext(s.parent);
    map[stripSlash(s.path)] = ctx?.item.requiredPermission;
  });
  return map;
})();
