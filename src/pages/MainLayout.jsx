// Layout chung (Spec HRM UI v1 §2): header mega-menu + sidebar trái của phân hệ + vùng nội dung.
import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/layouts/Sidebar.jsx";
import Header from "../components/layouts/Header.jsx";
import { Breadcrumb, ToastHost } from "../components/ui";

// Màn đã làm lại theo design system tự render breadcrumb trong PageHeader
const OWN_HEADER = [/^\/positions$/, /^\/departments$/, /^\/HR-report$/i, /^\/quan-tri\/luong-duyet/];

export default function MainLayout() {
  const { pathname } = useLocation();
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const legacyScreen = !OWN_HEADER.some((re) => re.test(pathname));

  useEffect(() => setMobileSidebar(false), [pathname]);

  return (
    <div className="hrm-app min-h-screen">
      <Header onToggleSidebar={() => setMobileSidebar((v) => !v)} />
      <div className="flex pt-[40px]">
        <Sidebar mobileOpen={mobileSidebar} onCloseMobile={() => setMobileSidebar(false)} />
        <main className="flex-1 min-w-0 px-4 lg:px-6 py-5" style={{ minHeight: "calc(100vh - 40px)" }}>
          {legacyScreen ? (
            // §10 / H: màn cũ giữ nguyên nội dung, chỉ bọc vào layout mới
            <div className="hrm-legacy-content">
              <Breadcrumb />
              <Outlet />
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
      <ToastHost />
    </div>
  );
}
