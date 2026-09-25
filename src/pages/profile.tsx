
import { PersonalInfoForm } from "../components/personal-info-form.tsx";

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import employeeService from "../services/employeeService";

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError("");
    employeeService.getDetail(id)
      .then(setProfile)
      .catch(() => setError("Không thể tải dữ liệu nhân viên"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {loading ? (
          <div className="text-center text-gray-500 py-8">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
            <PersonalInfoForm profile={profile} isNew={!id} />
        )}
      </div>
    </main>
  );
}
