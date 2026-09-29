
import { PersonalInfoForm } from "../components/personal-info-form.tsx";

import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import employeeService from "../services/employeeService";

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // id đã load gần nhất -> tránh gọi GET /employee/:id nhiều lần (StrictMode chạy effect 2 lần)
  const loadedIdRef = useRef<string | null>(null);

  const loadProfile = useCallback((empId: string, showLoading: boolean) => {
    if (showLoading) setLoading(true);
    setError("");
    return employeeService.getDetail(empId)
      .then(setProfile)
      .catch(() => setError("Không thể tải dữ liệu nhân viên"))
      .finally(() => { if (showLoading) setLoading(false); });
  }, []);

  useEffect(() => {
    if (!id || loadedIdRef.current === id) return;
    loadedIdRef.current = id;
    loadProfile(id, true);
  }, [id, loadProfile]);

  // Sau khi insert/update thành công: load lại chi tiết 1 lần
  const handleSaved = useCallback((savedId?: string) => {
    const empId = id || savedId;
    if (!empId) return;
    if (!id) {
      // Tạo mới -> chuyển sang trang chi tiết, effect ở trên sẽ load 1 lần
      navigate(`/profile/${empId}`, { replace: true });
      return;
    }
    // Load lại không bật loading để form không bị unmount
    loadProfile(empId, false);
  }, [id, navigate, loadProfile]);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="text-center text-gray-500 py-8">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
            <PersonalInfoForm profile={profile} isNew={!id} onSaved={handleSaved} />
        )}
      </div>
    </main>
  );
}
