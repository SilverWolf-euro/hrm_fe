import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar.jsx";
import TopNavbar from "../components/layouts/Header.jsx";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeModule, setActiveModule] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const routeModuleMap = {
    personnelReport: "personnel-report",
    "human-resource": "human-resource",
    "personnel-change": "personnel-change",
    "work-report": "work-report",
    "operational-report": "operational-report",
    personal: "personnel",
    "profile": "profile",
    "HR-report": "HR-report",
    "work-shift-rules": "work-shift-rules",
    "holiday-config": "holiday-config",
    "leave-config": "leave-config",
  };

  const pageTitles = {
    personnelReport: "personnel-report",
    "human-resource": "human-resource",
    "personnel-change": "personnel-change",
    "work-report": "work-report",
    "operational-report": "operational-report",
    personal: "personnel",
    "profile": "profile",
    "HR-report": "HR-report",
    "work-shift-rules": "Danh sách phân ca làm việc",
    "holiday-config": "Cấu hình ngày nghỉ",
    "leave-config": "Cấu hình loại phép",
  };

  const pageDescriptions = {
    personnelReport: "personnel-report",
    "human-resource": "human-resource",
    "personnel-change": "personnel-change",
    "work-report": "work-report",
    "operational-report": "operational-report",
    personal: "personnel",
    "profile": "profile",
    "HR-report": "HR-report",
    "work-shift-rules": "Quản lý danh sách phân ca làm việc",
    "holiday-config": "Quản lý cấu hình ngày nghỉ",
    "leave-config": "Quản lý cấu hình loại phép",
  };

  const routeName = location.pathname.replace("/", "") || "dashboard";
  const moduleKey = routeModuleMap[routeName] || "dashboard";
  const pageTitle = pageTitles[moduleKey] || "EUROSTARK";
  const pageDescription =
    pageDescriptions[moduleKey] || "Hệ thống quản lý sản xuất";

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };

  const handleModuleChange = (moduleId) => {
    setActiveModule(moduleId);

    const routeMap = {
      "personal-information": "profile",
      "personnel-report": "HR-report",
    };

    const targetRoute = routeMap[moduleId];
    if (targetRoute && location.pathname !== targetRoute) {
      navigate(targetRoute);
    }
  };

  const updateActiveModuleFromRoute = () => {
    const routeName = location.pathname.replace("/", "") || "dashboard";
    const moduleKey = routeModuleMap[routeName];
    if (moduleKey) {
      setActiveModule(moduleKey);
    }
  };

  useEffect(() => {
    checkMobile();
    updateActiveModuleFromRoute();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    updateActiveModuleFromRoute();
  }, [location.pathname]);

  return (
    <div className="app-container">
      <div className="flex h-screen overflow-hidden bg-gray-50">
        <Sidebar
          activeModule={activeModule}
          collapsed={sidebarCollapsed}
          onUpdateActiveModule={handleModuleChange}
          onUpdateCollapsed={setSidebarCollapsed}
        />

        {/* Main content */}
        <div
          className={`flex-1 transition-all duration-300 flex flex-col ${sidebarCollapsed && !isMobile ? "ml-16" : "ml-0 lg:ml-64"
            }`}
          style={{ overflowY: "auto", height: "100vh" }} // Ensure the content area is scrollable
        >
          <TopNavbar pageTitle={pageTitle} pageDescription={pageDescription} />
          <main className="flex-1 px-6 pt-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
