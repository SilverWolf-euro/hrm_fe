import React, { useState, useEffect, useMemo } from "react";
import { PlusIcon, MagnifyingGlassIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { getAllUsersRoles, getAllUsersFunction, getRolePermissionById, createRolePermission } from "../../services/authManageService";
import PermissionTable from "./PermissionTable";
import Pagination from "../../components/common/Pagination";

const PAGE_SIZE = 10;

/**
 * Badge hiển thị trạng thái của vai trò
 */
function StatusBadge({ active }) {
  const isActive = active === 1 || active === true;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
      ${isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
      {isActive ? "Hoạt động" : "Khóa"}
    </span>
  );
}

const errorMessage = (err) =>
  err?.response?.data?.msg || err?.response?.data?.message || "Vui lòng thử lại sau.";

export default function RoleManagement() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingFunctions, setLoadingFunctions] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [allFunctions, setAllFunctions] = useState([]); // Lưu tất cả functions
  const [selectedPerms, setSelectedPerms] = useState([]); // Lưu ID các quyền của role đang chọn
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState({
    role_code: "",
    role_name: "",
    description: "",
  });

  // 1. Lấy danh mục functions khi component mount
  useEffect(() => {
    setLoadingFunctions(true);
    getAllUsersFunction()
      .then(res => {
        const apiRes = res?.data?.data || res?.data || {};
        setAllFunctions(apiRes.functions || []);
      })
      .catch(err => {
        console.error("Lỗi lấy danh sách functions:", err);
      })
      .finally(() => {
        setLoadingFunctions(false);
      });
  }, []);

  // 2. Lấy danh sách vai trò (roles)
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    getAllUsersRoles(controller.signal)
      .then(res => {
        const apiRes = res?.data?.data || res?.data || {};
        const items = Array.isArray(apiRes) ? apiRes : (apiRes.roles || apiRes.items || []);
        setData(items || []);
      })
      .catch(err => {
        if (err?.name === "CanceledError") return;
        setData([]);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [refreshKey]);

  // Lọc & phân trang phía client (API trả về toàn bộ vai trò)
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return data;
    return data.filter(r =>
      (r.code || "").toLowerCase().includes(s) || (r.name || "").toLowerCase().includes(s)
    );
  }, [data, search]);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleEdit = async (item) => {
    setSelectedData(item);
    setFormData({
      role_code: item.code || "",
      role_name: item.name || "",
      description: item.desc || "",
    });
    setLoadingFunctions(true);
    try {
      // Gọi API lấy quyền chi tiết của Role
      const res = await getRolePermissionById(item.id);
      const perms = res?.data?.roles_permissions?.function_id || [];
      // Chuyển đổi ID sang chuỗi để so sánh chính xác trong PermissionTable
      setSelectedPerms(perms.map(id => String(id).trim()));
      setShowForm(true);
    } catch (err) {
      alert("Không thể tải danh sách quyền của vai trò này.");
    } finally {
      setLoadingFunctions(false);
    }
  };

  const handleBack = (shouldReload = false) => {
    setShowForm(false);
    setSelectedData(null);
    setSelectedPerms([]); // Xóa quyền đã chọn khi đóng form
    if (shouldReload) setRefreshKey(prev => prev + 1);
  };

  const handleSaveRolePermissions = async () => {
    if (!formData.role_code.trim() || !formData.role_name.trim()) {
      alert("Vui lòng nhập mã và tên vai trò.");
      return;
    }
    try {
      const payload = {
        role_id: selectedData ? String(selectedData.id) : "",
        role_code: formData.role_code,
        role_name: formData.role_name,
        description: formData.description,
        function_id: selectedPerms.map(Number) // Chuyển về Number theo format API
      };
      await createRolePermission(payload);
      alert("Cập nhật quyền cho vai trò thành công!");
      handleBack(true);
    } catch (err) {
      alert("Lỗi khi lưu quyền: " + errorMessage(err));
    }
  };

  // Nếu đang mở form (thêm mới hoặc chỉnh sửa)
  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {selectedData ? (
                <>Cập nhật vai trò: <span className="text-blue-600">{selectedData.name}</span></>
              ) : (
                "Thêm mới vai trò"
              )}
            </h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleBack()} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">Hủy</button>
            <button onClick={handleSaveRolePermissions} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">Lưu vai trò</button>
          </div>
        </div>

        {/* Thông tin chung */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="text-base font-semibold text-gray-800">Thông tin chung</h3>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã vai trò <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.role_code}
                onChange={e => setFormData({ ...formData, role_code: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="Nhập mã vai trò"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên vai trò <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.role_name}
                onChange={e => setFormData({ ...formData, role_name: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                placeholder="Nhập tên vai trò"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none"
                placeholder="Nhập mô tả"
              />
            </div>
          </div>
        </div>

        {/* Thiết lập quyền hạn chi tiết */}
        <PermissionTable
          functions={allFunctions}
          selectedIds={selectedPerms}
          onChange={setSelectedPerms}
          loading={loadingFunctions}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Quản lý vai trò</h1>
        <button
          onClick={() => {
            setSelectedData(null);
            setFormData({ role_code: "", role_name: "", description: "" });
            setSelectedPerms([]);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Thêm vai trò
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-3">
          <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
          Bộ lọc & Tìm kiếm
        </div>
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Tìm kiếm mã hoặc tên vai trò..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/60">
                {["STT", "Mã vai trò", "Tên vai trò", "Mô tả", "Trạng thái", "Thao tác"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">Đang tải...</td></tr>
              ) : pageData.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">Không có dữ liệu</td></tr>
              ) : (
                pageData.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 w-12 text-gray-400 text-xs">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-4 py-3 font-semibold text-blue-600">{row.code}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{row.name}</td>
                    <td className="px-4 py-3 text-gray-600">{row.desc}</td>
                    <td className="px-4 py-3">
                      <StatusBadge active={row.status} />
                    </td>
                    <td className="px-4 py-3 w-[80px]">
                      <button
                        onClick={() => handleEdit(row)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-600 hover:text-white transition-all duration-150 shadow-sm"
                        title="Chỉnh sửa"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        count={pageData.length}
        total={filtered.length}
        itemLabel="vai trò"
        loading={loading}
        onPrev={() => setPage(p => p - 1)}
        onNext={() => setPage(p => p + 1)}
        onPageChange={setPage}
      />
    </div>
  );
}
