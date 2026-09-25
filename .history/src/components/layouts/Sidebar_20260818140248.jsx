import React, { useState, useEffect, useMemo } from "react";
import logo from "../../assets/images/logo.png";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function Sidebar({
  activeModule,
  collapsed,
  onUpdateActiveModule,
  onUpdateCollapsed,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState({});
  const navigate = useNavigate();

  const pages = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("pages") || "[]");
    } catch {
      return [];
    }
  }, []);

  // const singleItems = [
  //   {
  //     id: "dashboard",
  //     name: "Tổng quan",
  //     icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  //   },
  // ];

  const dropdownModules = [
    {
      id: "personnel",
      name: "Quản lý hồ sơ nhân sự",
      icon: "M12 12c2.7 0 8 1.34 8 4v2H4v-2c0-2.66 5.3-4 8-4zm0-2a4 4 0 100-8 4 4 0 000 8z",
      children: [
        //{ id: "profile", name: "Thông tin cá nhân" },
        { id: "HR-report", name: "Danh sách nhân sự" },
        //{ id: "kernel-report", name: "Báo cáo biến động nhân sự" },
        
        // { id: "contract", name: "Hợp đồng lao động" },
        // { id: "work-process", name: "Quá trình công tác" },
        // { id: "education", name: "Trình độ học vấn" },
        // { id: "certificate", name: "Kỹ năng, chứng chỉ" },
        // { id: "attachment", name: "Tài liệu đính kèm" },
      ],
    },
    // {
    //   id: "recruitment",
    //   name: "Tuyển dụng",
    //   icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm3-4H7v-2h8v2zm0-4H7V7h8v2z",
    //   children: [
    //     { id: "job-post", name: "Đăng tin tuyển dụng" },
    //     { id: "candidate", name: "Quản lý ứng viên" },
    //     { id: "interview", name: "Lịch phỏng vấn" },
    //     { id: "evaluation", name: "Đánh giá ứng viên" },
    //     { id: "offer", name: "Thư mời nhận việc" },
    //   ],
    // },
    {
      id: "attendance",
      name: "Chấm công",
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
      children: [
        { id: "attendance", name: "Kết nối máy chấm công" },
        //{ id: "online-attendance", name: "Chấm công online" },
        { id: "work-shift-summary", name: "Bảng phân ca" },
        { id: "attendance-daily-report", name: "Báo cáo chấm công hàng ngày" },
        { id: "shift-assignment", name: "Phân ca chi tiết" },
        //{ id: "overtime", name: "Tăng ca, đi trễ, về sớm" },
        //{ id: "summary", name: "Tổng hợp bảng công" },
      ],
    },
    // {
    //   id: "payroll",
    //   name: "Tính lương",
    //   icon: "M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm1 17.93c-2.83.48-5.68-.3-7.78-2.4C2.37 15.68 1.59 12.83 2.07 10H5v2H3.09c.2 1.38.77 2.68 1.67 3.78C6.32 17.23 8.68 18.1 11 17.93V15h2v2.93z",
    //   children: [
    //     { id: "salary-config", name: "Cấu hình bảng lương" },
    //     { id: "allowance", name: "Phụ cấp, thưởng, phạt" },
    //     { id: "insurance-tax", name: "BHXH, thuế TNCN" },
    //     { id: "auto-payroll", name: "Tính lương tự động" },
    //     { id: "bank-export", name: "Xuất file chuyển khoản" },
    //   ],
    // },
    {
      id: "leave",
      name: "Quản lý đơn nghỉ",
      icon: "M17 9V7a5 5 0 00-10 0v2a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2v-7a2 2 0 00-2-2zm-8-2a3 3 0 016 0v2H9V7zm8 11H7v-7h10v7z",
      children: [
        //{ id: "leave-request", name: "Đăng ký nghỉ online" },
        //{ id: "leave-approval", name: "Duyệt nghỉ theo cấp" },
        //{ id: "leave-request-list", name: "Theo dõi ngày phép" },
        { id: "leave-requests-sent", name: "Đơn nghỉ đã gửi" },
        { id: "leave-requests-all", name: "Danh sách đơn nghỉ nhân viên" },
        { id: "leave-summary", name: "Báo cáo tổng hợp nghỉ" },
        //{ id: "leave-calendar", name: "Lịch nghỉ tổng hợp" },
      ],
    },
    // {
    //   id: "kpi",
    //   name: "Đánh giá & KPI",
    //   icon: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
    //   children: [
    //     { id: "kpi-config", name: "Thiết lập KPI" },
    //     { id: "periodic-evaluation", name: "Đánh giá định kỳ" },
    //     { id: "feedback-360", name: "Phản hồi 360 độ" },
    //     { id: "employee-ranking", name: "Xếp loại nhân viên" },
    //   ],
    // },
    // {
    //   id: "training",
    //   name: "Đào tạo",
    //   icon: "M12 3L2 9l10 6 10-6-10-6zm0 13.09l-8-4.6V17h16v-5.51l-8 4.6z",
    //   children: [
    //     { id: "course", name: "Quản lý khóa học" },
    //     { id: "training-calendar", name: "Lịch đào tạo" },
    //     { id: "learning-result", name: "Kết quả học tập" },
    //     { id: "training-budget", name: "Ngân sách đào tạo" },
    //   ],
    // },
    // {
    //   id: "insurance",
    //   name: "Bảo hiểm & Phúc lợi",
    //   icon: "M12 2a10 10 0 00-10 10v4a2 2 0 002 2h16a2 2 0 002-2v-4A10 10 0 0012 2zm0 2a8 8 0 018 8v4H4v-4a8 8 0 018-8zm0 10a2 2 0 110-4 2 2 0 010 4z",
    //   children: [
    //     { id: "bhxh", name: "Quản lý BHXH, BHYT" },
    //     { id: "maternity", name: "Chế độ thai sản, ốm đau" },
    //     { id: "welfare", name: "Chính sách phúc lợi" },
    //   ],
    // },
    // {
    //   id: "report",
    //   name: "Báo cáo & Phân tích",
    //   icon: "M3 17h2v-7H3v7zm4 0h2v-4H7v4zm4 0h2v-10h-2v10zm4 0h2v-2h-2v2z",
    //   children: [
    //     //{ id: "kernel-report", name: "Báo cáo biến động nhân sự" },
    //     //{ id: "salary-cost", name: "Báo cáo chi phí lương" },
    //     //{ id: "department-stat", name: "Thống kê theo phòng ban" },
    //     //{ id: "dashboard", name: "Dashboard tổng quan" },
    //   ],
    // },
    {
      id: "system",
      name: "Hệ thống & phân quyền",
      icon: "M12 4a8 8 0 100 16 8 8 0 000-16zm1 13h-2v-2h2v2zm0-4h-2V7h2v6z",
      children: [
        //{ id: "user-role", name: "Phân quyền người dùng" },
        //{ id: "role-management", name: "Quản lý vai trò" },
        //{ id: "activity-log", name: "Nhật ký hoạt động" },
        { id: "departments", name: "Quản lý phòng ban" },
        { id: "positions", name: "Quản lý chức vụ" },
        { id: "work-shifts", name: "Danh sách ca làm việc" },
        { id: "work-shift-rules", name: "Danh sách phân ca" },
        { id: "holiday-config", name: "Cấu hình ngày nghỉ lễ" },
        { id: "leave-config", name: "Cấu hình loại nghỉ" },
        { id: "approval-flow-config", name: "Cấu hình quy trình phê duyệt" },
        { id: "approval-settings", name: "Danh sách quy trình phê duyệt" },
      ],
    },
  ];

  // map child id -> parent module id
  const allChildrenIds = useMemo(() => {
    const acc = {};
    dropdownModules.forEach((module) => {
      module.children.forEach((child) => {
        acc[child.id] = module.id;
      });
    });
    return acc;
  }, []);

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
    if (window.innerWidth >= 768) setMobileOpen(false);
  };

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      if (onUpdateCollapsed) onUpdateCollapsed(!collapsed);
    }
  };

  const toggleDropdown = (moduleId) => {
    if (collapsed) return;
    setOpenDropdowns((prev) => {
      const newState = { ...prev, [moduleId]: !prev[moduleId] };
      Object.keys(newState).forEach((key) => {
        if (key !== moduleId) newState[key] = false;
      });
      return newState;
    });
  };

  const selectMenuItem = (moduleId) => {
    if (onUpdateActiveModule) {
      onUpdateActiveModule(moduleId);
    }
    if (isMobile) setMobileOpen(false);
    const parentModule = allChildrenIds[moduleId];
    if (parentModule) {
      setOpenDropdowns((prev) => ({ ...prev, [parentModule]: true }));
    }
    // Điều hướng động theo id menu con, tránh thừa dấu /
    navigate(moduleId.startsWith("/") ? moduleId : "/" + moduleId);
  };

  const isModuleActive = (moduleId, isParent = false) => {
    if (isParent) {
      const module = dropdownModules.find((m) => m.id === moduleId);
      return module?.children.some((child) => child.id === activeModule);
    }
    return activeModule === moduleId;
  };

  const getMenuItemClass = (moduleId, isParent = false) => {
    const base =
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 relative overflow-hidden group";
    const active = "bg-white/20 text-white shadow-lg";
    const inactive =
      "text-white/85 hover:bg-white/10 hover:text-white hover:translate-x-1";
    return `${base} ${isModuleActive(moduleId, isParent) ? active : inactive}`;
  };

  const getSubMenuItemClass = (moduleId) => {
    const base =
      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all duration-200 text-sm";
    const active = "bg-white/15 text-white";
    const inactive = "text-white/75 hover:bg-white/10 hover:text-white";
    return `${base} ${activeModule === moduleId ? active : inactive}`;
  };

  useEffect(() => {
    checkMobile();
    // Mở dropdown tương ứng nếu activeModule là child
    const parentModule = allChildrenIds[activeModule];
    if (parentModule) {
      setOpenDropdowns((prev) => ({ ...prev, [parentModule]: true }));
    }
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [activeModule, allChildrenIds]);

  return (
    <>
      {/* Toggle button nếu cần, bạn có thể bổ sung */}

      <div
        className={`bg-gray-900 text-white fixed top-0 left-0 h-full transition-all duration-300 z-40 
          ${collapsed ? "w-16" : "w-64"} 
          ${isMobile ? (mobileOpen ? "translate-x-0" : "-translate-x-full") : ""}`}
      >
        <div className="flex items-center justify-between h-16 border-b border-gray-700 px-3">
          {!collapsed && <img src={logo} alt="Logo" className="h-10" />}
          <button
            onClick={() => toggleSidebar()}
            className="p-2 text-white hover:bg-gray-700 rounded"
          >
            {collapsed ? (
              <ChevronRightIcon className="h-6 w-6" />
            ) : (
              <ChevronLeftIcon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Menu đơn */}
        {/* <div className="p-2">
          {singleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => selectMenuItem(item.id)}
              className={getMenuItemClass(item.id)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d={item.icon} />
              </svg>
              {!collapsed && <span>{item.name}</span>}
            </button>
          ))}
        </div> */}

        {/* Menu dropdown */}
        <div className="p-2">
          {dropdownModules.map((module) => (
            <div key={module.id}>
              <button
                onClick={() => toggleDropdown(module.id)}
                className={getMenuItemClass(module.id, true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d={module.icon} />
                </svg>
                {!collapsed && <span>{module.name}</span>}
              </button>
              {!collapsed && openDropdowns[module.id] && (
                <div className="ml-6 mt-1 space-y-1">
                  {module.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => selectMenuItem(child.id)}
                      className={getSubMenuItemClass(child.id)}
                    >
                      {child.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
