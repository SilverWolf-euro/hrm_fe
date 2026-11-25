// Sidebar trái (Spec HRM UI v1 §2.2): hiển thị nhóm + item của phân hệ đang mở, render từ MENU dùng chung.
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { filterMenu, findMenuContext } from "../../constants/menuConfig";
import { usePermissions } from "../../utils/auth";
import { Icon } from "../ui";

const STORAGE_KEY = "hrm.sidebar.collapsedGroups";

function loadCollapsed() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

export default function Sidebar({ mobileOpen, onCloseMobile }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { hasPermission } = usePermissions();
  const [collapsed, setCollapsed] = useState(loadCollapsed);

  const ctx = findMenuContext(pathname);
  const module = ctx ? filterMenu(hasPermission).find((m) => m.key === ctx.module.key) : null;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
    } catch {
      /* bỏ qua khi trình duyệt chặn storage */
    }
  }, [collapsed]);

  if (!module) return null;

  const toggle = (groupKey) => setCollapsed((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={onCloseMobile} />}
      <aside
        className={`bg-white border-r z-40 overflow-y-auto transition-transform
          fixed lg:sticky top-[40px] h-[calc(100vh-40px)] shrink-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ width: 180, borderColor: "var(--color-border)" }}
      >
        <nav className="py-3">
          {module.groups.map((g) => {
            const key = `${module.key}/${g.label}`;
            const isCollapsed = !!collapsed[key];
            return (
              <div key={key} className="mb-1">
                <button
                  className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 hover:text-gray-700"
                  onClick={() => toggle(key)}
                  aria-expanded={!isCollapsed}
                >
                  <span className="text-left">{g.label}</span>
                  <span className={`transition-transform ${isCollapsed ? "-rotate-90" : ""}`}>
                    <Icon.ChevronDown />
                  </span>
                </button>
                {!isCollapsed &&
                  g.items.map((item) => {
                    const active = ctx?.item.path === item.path;
                    return (
                      <button
                        key={item.path}
                        className="w-full text-left text-[13px] px-3 py-2 pl-5"
                        style={
                          active
                            ? { background: "var(--color-primary-soft)", color: "var(--color-primary)", fontWeight: 600 }
                            : { color: "#374151" }
                        }
                        onClick={() => {
                          navigate(item.path);
                          onCloseMobile && onCloseMobile();
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
