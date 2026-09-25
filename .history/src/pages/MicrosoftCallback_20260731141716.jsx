import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MicrosoftCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);

        const code = params.get("code");
        const state = params.get("state");
        const error = params.get("error");
        const errorDescription = params.get("error_description");

        if (error) {
          setMessage(`Đăng nhập thất bại: ${errorDescription || error}`);
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        if (process.env.NODE_ENV === "development") {
          console.log("[MicrosoftCallback] code, state:", code, state);
        }

        if (!code) {
          setMessage("Không nhận được code từ Microsoft.");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        // 🔐 check state
        const savedState = localStorage.getItem("oauth_state");
        if (savedState && state !== savedState) {
          throw new Error("State không hợp lệ");
        }

        // optional: clear state
        localStorage.removeItem("oauth_state");

        const apiUrl = `${process.env.REACT_APP_BASE_API}/api/v1/authenticate/microsoftCallback`;

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // ⚠️ QUAN TRỌNG: bỏ credentials nếu không dùng cookie
          // credentials: "include",
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "BE xử lý callback thất bại");
        }

        const data = await response.json();

        // Lưu accessToken
        if (data?.accessToken || data?.access_token) {
          localStorage.setItem("accessToken", data.accessToken || data.access_token);
        } else {
          setMessage("Không nhận được accessToken");
          setTimeout(() => navigate("/login"), 2000);
          return;
        }

        // Lưu userInfo nếu backend trả về object user hoặc toàn bộ data là userInfo
        if (data.user) {
          localStorage.setItem("userInfo", JSON.stringify(data.user));
        } else if (data.Department && data.FullName) {
          // Nếu backend trả về trực tiếp object userInfo
          localStorage.setItem("userInfo", JSON.stringify(data));
        }

        // Thành công: chuyển hướng luôn, không hiện thông báo
        navigate("/leave-requests-all");
      } catch (err) {
        console.error(err);
        setMessage("Có lỗi khi xử lý đăng nhập Microsoft.");
        setTimeout(() => navigate("/login"), 2000);
      }
    };

    run();
  }, [navigate]);

  return (
    message ? (
      <div style={{ padding: 24 }}>
        <h2>{message}</h2>
      </div>
    ) : null
  );
}