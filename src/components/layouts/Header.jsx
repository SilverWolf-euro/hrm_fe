// Header + mega-menu (Spec HRM UI v1 §2.1). Render từ MENU dùng chung với Sidebar.
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearPermissions } from "../../utils/permissionStore";
import { usePermissions } from "../../utils/auth";
import { DEFAULT_ROUTE, filterMenu, findMenuContext } from "../../constants/menuConfig";
import { Icon } from "../ui";

function readUserInfo() {
  try {
    return JSON.parse(localStorage.getItem("userInfo") || "{}") || {};
  } catch {
    return {};
  }
}

export default function Header({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { hasPermission } = usePermissions();
  const modules = filterMenu(hasPermission);
  const current = findMenuContext(pathname);

  const [openKey, setOpenKey] = useState(null);
  const [userOpen, setUserOpen] = useState(false);
  const closeTimer = useRef(null);
  const rootRef = useRef(null);
  const user = readUserInfo();
  const fullName = user.FullName || "";
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  useEffect(() => {
    setOpenKey(null);
    setUserOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpenKey(null);
        setUserOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setOpenKey(null);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const openMenu = (key) => {
    clearTimeout(closeTimer.current);
    setOpenKey(key);
    setUserOpen(false);
  };
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenKey(null), 150);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");
    clearPermissions();
    navigate("/login");
  };

  const openModule = modules.find((m) => m.key === openKey);

  return (
    <header
      ref={rootRef}
      className="fixed top-0 left-0 right-0 z-50 flex items-center px-3 lg:px-4"
      style={{ height: 40, background: "var(--color-header-bg)" }}
      onMouseLeave={scheduleClose}
    >
      <button className="lg:hidden text-white mr-2 p-1" onClick={onToggleSidebar} aria-label="Mở menu">
        <Icon.Menu />
      </button>
      <button className="text-white font-extrabold text-lg tracking-wide mr-6" onClick={() => navigate(DEFAULT_ROUTE)}>
        HRM
      </button>

      <nav className="flex h-full items-stretch overflow-x-auto">
        {modules.map((m) => {
          const isCurrent = current?.module.key === m.key;
          const isOpen = openKey === m.key;
          return (
            <button
              key={m.key}
              className="flex items-center gap-1 px-4 text-[13px] font-semibold uppercase whitespace-nowrap transition-colors"
              style={
                isCurrent || isOpen
                  ? { background: "#fff", color: "var(--color-primary)" }
                  : { color: "#fff" }
              }
              onMouseEnter={() => openMenu(m.key)}
              onClick={() => (isOpen ? setOpenKey(null) : openMenu(m.key))}
              aria-expanded={isOpen}
            >
              {m.label}
              <Icon.ChevronDown />
            </button>
          );
        })}
      </nav>

      <div className="ml-auto relative">
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: "#dbe4ff", color: "var(--color-header-bg)" }}
          onClick={() => {
            setUserOpen((v) => !v);
            setOpenKey(null);
          }}
          title={fullName}
        >
          {initials || <Icon.User width="18" height="18" />}
        </button>
        {userOpen && (
          <div className="absolute right-0 top-10 w-64 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="font-semibold text-sm text-gray-900">{fullName || "Tài khoản"}</div>
              {user.Email && <div className="text-xs text-gray-500 truncate">{user.Email}</div>}
              {user.Department && <div className="text-xs text-gray-500 truncate">{user.Department}</div>}
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>

      {openModule && (
        <div
          className="absolute left-3 right-3 lg:left-4 lg:right-4 bg-white rounded-xl shadow-2xl border border-gray-100 p-6"
          style={{ top: 40 }}
          onMouseEnter={() => openMenu(openModule.key)}
        >
          <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(220px, 1fr))` }}>
            {openModule.groups.map((g) => (
              <div key={g.label}>
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3">{g.label}</div>
                <div className="flex flex-col gap-1">
                  {g.items.map((item) => (
                    <button
                      key={item.path}
                      className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-gray-800 hover:bg-[var(--color-primary-soft)] text-left"
                      onClick={() => navigate(item.path)}
                    >
                      <span
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                        style={{ background: "#3b82f6" }}
                      >
                        <span className="w-2.5 h-2.5 rounded-sm border-2 border-white" />
                      </span>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
