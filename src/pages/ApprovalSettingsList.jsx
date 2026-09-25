import React, { useEffect, useState } from "react";
import ApprovalSettingUpdateModal from "../components/ApprovalSettingUpdateModal";
import { deleteApprovalSetting, getApprovalSettingDetail } from "../services/browsingFlowService";
import { useNavigate } from "react-router-dom";
import { getApprovalSettings, getApprovalRequestTypes } from "../services/browsingFlowService";
import { getDepartments } from "../services/departmentService";

export default function ApprovalSettingsList() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState([]);
  const [requestTypes, setRequestTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedType, setSelectedType] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [loading, setLoading] = useState(false);
  const [editModal, setEditModal] = useState({ open: false, setting: null });
  // Xử lý xóa
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa cấu hình này?")) return;
    setLoading(true);
    try {
      await deleteApprovalSetting(id);
      fetchSettings();
    } finally {
      setLoading(false);
    }
  };

  // Xử lý mở modal sửa (fetch chi tiết)
  const handleEdit = async (setting) => {
    setLoading(true);
    try {
      const res = await getApprovalSettingDetail(setting.id);
      const detail = res.data?.data || {};
      setEditModal({ open: true, setting: { ...detail, id: setting.id } });
    } finally {
      setLoading(false);
    }
  };

  // Khi cập nhật xong
  const handleUpdated = () => {
    fetchSettings();
  };

  useEffect(() => {
    getApprovalRequestTypes().then(res => setRequestTypes(res.data?.data || []));
    getDepartments().then(res => setDepartments(res.data || res || []));
  }, []);

  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line
  }, [selectedType, selectedDept]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedType) params.request_type = selectedType;
      if (selectedDept) params.department_code = selectedDept;
      const res = await getApprovalSettings(params);
      let data = res.data?.data;
      if (!Array.isArray(data)) {
        console.warn("[ApprovalSettingsList] settings không phải mảng:", data);
        data = [];
      }
      setSettings(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex gap-4 mb-4">
        <div className="text-xl font-bold">Danh sách quy trình phê duyệt</div>
        <select
          className="border rounded px-3 py-2 min-w-[180px]"
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
        >
          <option value="">Tất cả loại đơn</option>
          {requestTypes.map(type => (
            <option key={type.code} value={type.code}>{type.name_vi || type.description || type.code}</option>
          ))}
        </select>
        <select
          className="border rounded px-3 py-2 min-w-[180px]"
          value={selectedDept}
          onChange={e => setSelectedDept(e.target.value)}
        >
          <option value="">Tất cả phòng ban</option>
          {departments.map(d => (
            <option key={d.code} value={d.code}>
              {d.name_vi}
            </option>
          ))}
        </select>
        <button
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => navigate("/approval-flow-config")}
        >
          + Thêm mới
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">STT</th>
              <th className="border px-2 py-1">Loại đơn</th>
              <th className="border px-2 py-1">Phòng ban</th>
              <th className="border px-2 py-1">Luồng duyệt</th>
              <th className="border px-2 py-1">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center">Đang tải...</td></tr>
            ) : settings.length === 0 ? (
              <tr><td colSpan={5} className="text-center text-gray-500">Không có dữ liệu.</td></tr>
            ) : (
              Array.isArray(settings) && settings.length > 0 ? (
                settings.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="border px-2 py-1 text-center">{idx + 1}</td>
                    <td className="border px-2 py-1 font-semibold">{item.request_type}</td>
                    <td className="border px-2 py-1">{item.department_name}</td>
                    <td className="border px-2 py-1">{item.approval_path}</td>
                    <td className="border px-2 py-1 text-center">
                      <button className="text-blue-600 hover:text-blue-900 mr-2" title="Chỉnh sửa" onClick={() => handleEdit(item)}>
                        <span role="img" aria-label="edit">✏️</span>
                      </button>
                      <button className="text-red-600 hover:text-red-900" title="Xóa" onClick={() => handleDelete(item.id)}>
                        <span role="img" aria-label="delete">🗑️</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="text-center text-gray-500">Không có dữ liệu.</td></tr>
              )
            )}
          </tbody>
        </table>
      </div>
    {/* Modal cập nhật */}
    <ApprovalSettingUpdateModal
      open={editModal.open}
      setting={editModal.setting}
      onClose={() => setEditModal({ open: false, setting: null })}
      onUpdated={handleUpdated}
    />
    </div>
  );
}
