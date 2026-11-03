import React, { useState, useEffect, useMemo } from "react";
import logo from "../../assets/images/logo.png";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { dropdownModules } from "../../constants/menuConfig";
import { usePermissions } from "../../utils/auth";

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
  // usePermissions re-render Sidebar mỗi khi quyền trong RAM thay đổi
  const { hasPermission } = usePermissions();

  // Ẩn menu con không đủ quyền; ẩn luôn module cha nếu không còn menu con nào
  const visibleModules = dropdownModules
    .map((module) => ({
      ...module,
      children: module.children.filter((child) =>
        hasPermission(child.requiredPermission)
      ),
    }))
    .filter((module) => module.children.length > 0);

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
          {visibleModules.map((module) => (
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
