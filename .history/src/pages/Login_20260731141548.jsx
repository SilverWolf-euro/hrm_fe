import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDecodedToken } from "../utils/jwt";
import { login } from "../services/loginService";


const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  React.useEffect(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userInfo");
  }, []);

  // Build Microsoft OAuth2 login URL dynamically with a random state
  const generateState = (bytes = 16) => {
    const arr = new Uint8Array(bytes);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, (b) => ("0" + b.toString(16)).slice(-2)).join("");
  };

  const handleMicrosoftLogin = () => {
    const state = generateState(16);
    // save state to validate on callback
    localStorage.setItem("oauth_state", state);

    const clientId = "a5aa5270-29d9-4df5-b8ee-01303951be01";
    const tenant = "26cc160b-35bf-4025-999d-e9e02e508b44";
    const redirectUri = encodeURIComponent(`${window.location.origin}/callback/microsoft`);
    const scope = encodeURIComponent("openid profile email offline_access");
    const url = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&response_mode=query&scope=${scope}&state=${encodeURIComponent(state)}&sso_reload=true`;

    window.location.href = url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("[Login] Bắt đầu gọi API đăng nhập với username:", username);
    try {
      const res = await login({ user_id: username, password });
      console.log("[Login] Kết quả API trả về:", res);
      const data = res.data;
      if (data && data.access_token) {
        console.log("[Login] Đăng nhập thành công, nhận được token.");
        localStorage.setItem("accessToken", data.access_token);
        if (data.user) {
          console.log("[Login] Thông tin user từ API:", data.user);
          localStorage.setItem("userInfo", JSON.stringify(data.user));
        } else if (data.Department && data.FullName) {
          console.log("[Login] Thông tin user từ API:", data);
          localStorage.setItem("userInfo", JSON.stringify(data));
        }
        // Đảm bảo lấy accessToken mới nhất vừa lưu
        setTimeout(() => {
          const decoded = getDecodedToken();
          console.log("[Login] Thông tin token sau khi giải mã:", decoded);
          // Chuyển hướng giống với đăng nhập qua Microsoft
          navigate("/leave-requests-all");
        }, 0);
      } else {
        console.warn("[Login] API trả về thành công nhưng không có access_token. Data:", data);
        setError("Sai tài khoản hoặc mật khẩu!");
      }
    } catch (err) {
      console.error("[Login] Exception khi gọi API login:", err);
      if (err.response) {
        console.error("[Login] Chi tiết response lỗi từ server:", err.response.status, err.response.data);
      }
      setError("Không thể kết nối máy chủ!");
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6"
        onSubmit={handleSubmit}
      >
        {/* Chèn logo bên trên chữ E-HRM */}
        <div className="flex justify-center mb-2">
          <img src="/Logo.jpg" alt="Logo" className="h-16" />
        </div>
        <h2 className="text-3xl font-bold text-center mb-4 text-red-600">
          E-HRM
        </h2>
        {error && (
          <div className="mb-4 text-red-600 text-sm">{error}</div>
        )}
        <div>
          <label className="block mb-1 font-medium">Tên đăng nhập</label>
          <input
            className="w-full border px-3 py-2 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập tên đăng nhập"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Mật khẩu</label>
          <input
            type="password"
            className="w-full border px-3 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700"
        >
          Đăng nhập
        </button>
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-2 text-gray-400 text-sm">
            Hoặc đăng nhập với
          </span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>
        <button
          type="button"
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
          onClick={handleMicrosoftLogin}
        >
          Đăng nhập với tài khoản Microsoft
        </button>
      </form>
    </div>
  );
};

export default Login;
