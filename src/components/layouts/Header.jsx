// Header.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";


export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);

  // Lấy tên người dùng từ localStorage key 'userInfo'
  const [fullName, setFullName] = useState("");
  useEffect(() => {
    try {
      const userInfoStr = localStorage.getItem("userInfo");
      if (userInfoStr) {
        const userInfo = JSON.parse(userInfoStr);
        if (userInfo && userInfo.FullName) {
          setFullName(userInfo.FullName);
        }
      }
    } catch {}
  }, []);

  const userMenuItems = [
    { icon: "👤", label: "Hồ sơ", action: "profile" },
    { icon: "⚙️", label: "Cài đặt", action: "settings" },
    { icon: "🔒", label: "Đổi mật khẩu", action: "changePassword" },
  ];

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
    setShowNotifications(false);
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleMenuClick = (action) => {
    console.log(`Menu action: ${action}`);
    setShowUserMenu(false);
    // navigate nếu cần
  };

  const handleLogout = () => {
    console.log("Logout clicked");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");
    setShowUserMenu(false);
    navigate("/login");
  };

  const updateDateTime = () => {
    const now = new Date();
    setCurrentDate(now.toLocaleDateString("vi-VN"));
    setCurrentTime(
      now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    );
  };

  useEffect(() => {
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    const handleClickOutside = (event) => {
      if (!event.target.closest(".relative")) {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <header className="h-[70px] bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 shadow-md sticky top-0 z-10">
      {/* Search */}
      {/* <div className="relative w-48 md:w-60 lg:w-72">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-base pointer-events-none">
          🔍
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="w-full py-2.5 pl-10 pr-3 border border-gray-200 rounded-lg text-sm bg-gray-50 transition-all duration-200 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/15 focus:bg-white"
        />
      </div> */}

      <div className="flex items-center gap-3 md:gap-5 ml-auto">
        {/* Notifications */}
        {/* <div className="relative">
          <button
            onClick={toggleNotifications}
            className="relative w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200 hover:bg-gray-100"
          >
            <span className="text-xl">🔔</span>
            {unreadNotifications > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-bold w-[1.125rem] h-[1.125rem] rounded-full flex items-center justify-center border-2 border-white">
                {unreadNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-12 right-0 md:-right-2 w-72 md:w-80 bg-white rounded-xl shadow-xl z-50 overflow-hidden">
              <div className="px-4 py-3 flex justify-between items-center border-b border-gray-200">
                <h3 className="text-base font-semibold text-gray-800 m-0">
                  Thông báo
                </h3>
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-indigo-500 hover:text-indigo-600 transition-colors"
                >
                  Đánh dấu đã đọc
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`px-4 py-3 border-b border-gray-100 flex items-center justify-between transition-colors duration-200 cursor-pointer hover:bg-gray-50 ${
                      !notification.read
                        ? "bg-blue-50 hover:bg-blue-100"
                        : ""
                    }`}
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800 mb-1 text-sm">
                        {notification.title}
                      </div>
                      <div className="text-gray-600 text-xs mb-1">
                        {notification.message}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {notification.time}
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-indigo-500 rounded-full ml-3"></div>
                    )}
                  </div>
                ))}
              </div>

              <div className="px-3 py-3 text-center border-t border-gray-200">
                <button className="text-sm font-medium text-indigo-500 hover:text-indigo-600 transition-colors">
                  Xem tất cả
                </button>
              </div>
            </div>
          )}
        </div> */}

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={toggleUserMenu}
            className="flex items-center gap-2 md:gap-3 px-2 py-1.5 rounded-2xl transition-colors duration-200 hover:bg-gray-100"
          >
            <div className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-400 bg-white text-gray-700">
              {/* Avatar icon */}
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="8" r="4" strokeWidth="1.5"/><path strokeWidth="1.5" d="M4 20c0-2.5 3.5-4 8-4s8 1.5 8 4"/></svg>
            </div>
            <div className="flex flex-col items-start ml-2">
              <span className="text-xs text-gray-500 leading-none">Xin chào,</span>
              <span className="text-base font-bold text-gray-800 leading-none">{fullName}</span>
            </div>
            <span className="text-xs text-gray-500 ml-2">▼</span>
          </button>

          {showUserMenu && (
            <div className="absolute top-12 right-0 w-60 bg-white rounded-xl shadow-xl z-50 overflow-hidden">
              {/* <div className="py-2">
                {userMenuItems.map((menuItem) => (
                  <button
                    key={menuItem.label}
                    onClick={() => handleMenuClick(menuItem.action)}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-left transition-colors duration-200 hover:bg-gray-100"
                  >
                    <span className="text-base">{menuItem.icon}</span>
                    <span className="text-sm">{menuItem.label}</span>
                  </button>
                ))}
              </div> */}

              <div className="h-px bg-gray-200"></div>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-red-500 transition-colors duration-200 hover:bg-red-50"
              >
                <span className="text-base">🚪</span>
                <span className="text-sm">Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
