import React, { useState, useEffect, useMemo } from "react";
import { MagnifyingGlassIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import {
  getUserList,
  getAllUsersRoles,
  getAllUsersFunction,
  getUserPermissionById,
  createUserPermission,
  getRolePermissionById
} from "../../services/authManageService";
import Pagination from "../../components/common/Pagination";
import PermissionTable from "./PermissionTable";

const PAGE_SIZE = 10;

const errorMessage = (err) =>
  err?.response?.data?.msg || err?.response?.data?.message || "Vui lòng thử lại sau.";

// Danh sách user của HRM có thể chưa trả về role → đọc theo nhiều tên field
const getRoleId = (u) => u?.rolesId || u?.roles_id || u?.role_id || "";

export default function UserPermissionManagement() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [allFunctions, setAllFunctions] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingFunctions, setLoadingFunctions] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedPerms, setSelectedPerms] = useState([]); // Lưu ID các quyền của user đang chọn
  const [refreshKey, setRefreshKey] = useState(0);

  // 1. Lấy danh mục vai trò và danh mục functions
  useEffect(() => {
    getAllUsersRoles().then(res => {
      const apiRes = res?.data?.data || res?.data || {};
      setRoles(apiRes.roles || []);
    }).catch(() => {
      setRoles([]);
    });

    setLoadingFunctions(true);
    getAllUsersFunction().then(res => {
      const apiRes = res?.data?.data || res?.data || {};
      setAllFunctions(apiRes.functions || []);
    }).catch(() => {
      setAllFunctions([]);
    }).finally(() => {
      setLoadingFunctions(false);
    });
  }, []);

  // 2. Lấy danh sách người dùng
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    getUserList(controller.signal)
      .then(res => {
        const apiRes = res?.data?.data || res?.data || [];
        const items = Array.isArray(apiRes) ? apiRes : (apiRes.users || apiRes.items || []);
        setData(items || []);
      })
      .catch(err => {
        if (err?.name === "CanceledError") return;
        setData([]);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [refreshKey]);

  // Lọc & phân trang phía client
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return data;
    return data.filter(u =>
      [u.full_name, u.user_name, u.email].some(v => (v || "").toLowerCase().includes(s))
    );
  }, [data, search]);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const roleName = (roleId) => roles.find(r => r.id === roleId)?.name || roleId || "-";

  const handleEdit = async (item) => {
    setLoadingFunctions(true);
    try {
      // Gọi API lấy quyền chi tiết của User (kèm role_id)
      const res = await getUserPermissionById(item.user_id);
      const userPerms = res?.data?.user_permissions || {};
      setSelectedData({ ...item, rolesId: getRoleId(item) || userPerms.role_id || "" });
      // Chuyển đổi ID sang chuỗi để so sánh chính xác trong PermissionTable
      setSelectedPerms((userPerms.function_id || []).map(String));
      setShowForm(true);
    } catch (err) {
      alert("Không thể tải danh sách quyền của người dùng này.");
    } finally {
      setLoadingFunctions(false);
    }
  };

  const handleBack = (shouldReload = false) => {
    setShowForm(false);
    setSelectedData(null);
    setSelectedPerms([]);
    if (shouldReload) setRefreshKey(prev => prev + 1);
  };

  const saveUserPermissions = (functionIds) =>
    createUserPermission({
      user_id: selectedData.user_id,
      full_name: selectedData.full_name || selectedData.user_name,
      role_id: selectedData.rolesId,
      function_id: functionIds.map(Number) // Chuyển về Number theo format API
    });

  const handleRestoreDefault = async () => {
    if (!selectedData?.rolesId) {
      alert("Người dùng này chưa được gán vai trò.");
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn khôi phục quyền mặc định theo vai trò? Mọi thiết lập quyền riêng sẽ bị xóa.")) return;

    setLoadingFunctions(true);
    try {
      // 1. Lấy danh sách quyền mặc định của vai trò
      const res = await getRolePermissionById(selectedData.rolesId);
      const defaultPerms = res?.data?.roles_permissions?.function_id || [];

      // 2. Gán lại quyền cho user bằng danh sách mặc định này
      await saveUserPermissions(defaultPerms);
      alert("Khôi phục quyền mặc định thành công!");
      handleBack(true);
    } catch (err) {
      alert("Lỗi khi khôi phục quyền: " + errorMessage(err));
    } finally {
      setLoadingFunctions(false);
    }
  };

  const handleSavePermissions = async () => {
    try {
      await saveUserPermissions(selectedPerms);
      alert("Cập nhật quyền thành công!");
      handleBack(true);
    } catch (err) {
      alert("Lỗi khi lưu quyền: " + errorMessage(err));
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Cập nhật quyền: <span className="text-blue-600">{selectedData?.full_name || selectedData?.user_name}</span>
            </h2>
            <p className="text-sm text-gray-500 italic mt-1">
              Tài khoản: {selectedData?.email}  -  Vai trò: {roleName(selectedData?.rolesId)}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleRestoreDefault} disabled={loadingFunctions} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50">
              Khôi phục mặc định
            </button>
            <button onClick={() => handleBack()} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
              Hủy
            </button>
            <button onClick={handleSavePermissions} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
              Lưu quyền
            </button>
          </div>
        </div>

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
        <h1 className="text-xl font-bold text-gray-800">Phân quyền người dùng</h1>
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
            placeholder="Tìm kiếm họ tên hoặc email..."
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
                {["STT", "Họ và tên", "Email", "Vai trò", "Thao tác"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">Đang tải...</td></tr>
              ) : pageData.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-400">Không có dữ liệu</td></tr>
              ) : (
                pageData.map((row, idx) => (
                  <tr key={row.user_id || row.email} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-4 py-3 w-12 text-gray-400 text-xs">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="px-4 py-3 font-semibold text-blue-600">{row.full_name || row.user_name}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{row.email}</td>
                    <td className="px-4 py-3 text-gray-600">{roleName(getRoleId(row))}</td>
                    <td className="px-4 py-3 w-[80px]">
                      <button
                        onClick={() => handleEdit(row)}
                        className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-600 hover:text-white transition-all duration-150 shadow-sm"
                        title="Phân quyền"
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
        itemLabel="người dùng"
        loading={loading}
        onPrev={() => setPage(p => p - 1)}
        onNext={() => setPage(p => p + 1)}
        onPageChange={setPage}
      />
    </div>
  );
}
