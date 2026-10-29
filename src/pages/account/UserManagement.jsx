import React, { useState, useEffect, useMemo } from "react";
import { PlusIcon, MagnifyingGlassIcon, PencilSquareIcon, KeyIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { getUserList, createUser, updateUserPassword, updateUserInfo, getAllUsersRoles } from "../../services/authManageService";
import Pagination from "../../components/common/Pagination";

const PAGE_SIZE = 10;

const errorMessage = (err) =>
  err?.response?.data?.error || err?.response?.data?.msg || err?.response?.data?.message || "Vui lòng thử lại";

/**
 * Badge hiển thị trạng thái của người dùng
 */
const isActiveStatus = (s) => s === "Active" || s === true || s === 1 || s === "1";

function StatusBadge({ active }) {
  const isActive = isActiveStatus(active);
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
      ${isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"}`}>
      {isActive ? "Hoạt động" : "Khóa"}
    </span>
  );
}

/**
 * Ô nhập mật khẩu có nút ẩn/hiện
 */
function PasswordInput({ value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? "text" : "password"} required value={value} onChange={onChange} className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all" />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        {show ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
      </button>
    </div>
  );
}

/**
 * Popup Đổi mật khẩu
 */
function ChangePasswordModal({ isOpen, onClose, onSave, email }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setConfirmPassword("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp!");
      return;
    }
    onSave({ email, password });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">Đổi mật khẩu</h2>
          <button onClick={onClose} type="button" className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-500">Tài khoản: <span className="font-medium text-gray-700">{email}</span></p>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Mật khẩu mới*</label>
            <PasswordInput value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Nhập lại mật khẩu mới*</label>
            <PasswordInput value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-50">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-colors">Hủy</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors">Cập nhật</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * Popup tạo mới / chỉnh sửa tài khoản
 */
function UserFormModal({ isOpen, onClose, onSave, initialData, roles }) {
  const [formData, setFormData] = useState({ user_name: "", email: "", password: "", rolesId: "", status: true });

  useEffect(() => {
    if (!isOpen) return;
    if (initialData) {
      setFormData({
        user_name: initialData.full_name || initialData.user_name || "",
        email: initialData.email || "",
        password: "",
        rolesId: initialData.roles || "",
        status: isActiveStatus(initialData.status),
      });
    } else {
      setFormData({ user_name: "", email: "", password: "", rolesId: "", status: true });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">
            {initialData ? "Chỉnh sửa tài khoản" : "Tạo tài khoản mới"}
          </h2>
          <button onClick={onClose} type="button" className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Email*</label>
            <input type="email" required disabled={!!initialData} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Họ và Tên*</label>
            <input type="text" required disabled={!!initialData} value={formData.user_name} onChange={e => setFormData({ ...formData, user_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500" />
          </div>
          {initialData && (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Vai trò hệ thống*</label>
              <select required value={formData.rolesId} onChange={e => setFormData({ ...formData, rolesId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all">
                <option value="">Chọn vai trò</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
          )}
          {!initialData && (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Mật khẩu*</label>
              <PasswordInput value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
            </div>
          )}
          {initialData && (
            <div className="flex items-center gap-2 py-1">
              <input type="checkbox" id="status" checked={formData.status} onChange={e => setFormData({ ...formData, status: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
              <label htmlFor="status" className="text-sm font-medium text-gray-700 cursor-pointer">Hoạt động</label>
            </div>
          )}
          <div className="flex gap-3 pt-4 border-t border-gray-50">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-bold transition-colors">Hủy</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors">
              {initialData ? "Lưu cập nhật" : "Tạo tài khoản"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [passwordEmail, setPasswordEmail] = useState(null);

  // Danh mục vai trò cho popup chỉnh sửa
  useEffect(() => {
    getAllUsersRoles().then(res => {
      const apiRes = res?.data?.data || res?.data || {};
      setRoles(apiRes.roles || []);
    }).catch(() => {
      setRoles([]);
    });
  }, []);

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

  // Lọc & phân trang phía client (API trả về toàn bộ tài khoản)
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return data;
    return data.filter(u =>
      [u.full_name, u.user_name, u.email].some(v => (v || "").toLowerCase().includes(s))
    );
  }, [data, search]);
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePasswordSave = async (payload) => {
    try {
      await updateUserPassword(payload);
      alert("Đổi mật khẩu thành công!");
      setPasswordEmail(null);
    } catch (error) {
      alert("Đã xảy ra lỗi: " + errorMessage(error));
    }
  };

  const handleEdit = (item) => {
    setSelectedData(item);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedData(null);
  };

  const handleSave = async (formData) => {
    try {
      if (selectedData) {
        await updateUserInfo({
          email: formData.email,
          full_name: formData.user_name,
          roles_id: formData.rolesId,
          status: formData.status ? 1 : 0,
        });
        alert("Cập nhật thành công!");
      } else {
        const { user_name, email, password } = formData;
        await createUser({ user_name, email, password });
        alert("Tạo tài khoản thành công!");
      }
      handleCloseForm();
      setRefreshKey(k => k + 1);
    } catch (error) {
      alert("Đã xảy ra lỗi: " + errorMessage(error));
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Quản lý tài khoản</h1>
        <button
          onClick={() => { setSelectedData(null); setShowForm(true); }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          Tạo tài khoản
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
                {["STT", "Email", "Họ và tên", "Trạng thái", "Thao tác"].map(h => (
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
                    <td className="px-4 py-3 font-semibold text-blue-600">{row.email}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{row.full_name || row.user_name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge active={row.status} />
                    </td>
                    <td className="px-4 py-3 w-[100px]">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPasswordEmail(row.email)}
                          className="p-1.5 rounded-lg bg-orange-50 text-orange-500 hover:bg-orange-600 hover:text-white transition-all duration-150 shadow-sm"
                          title="Đổi mật khẩu"
                        >
                          <KeyIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(row)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-600 hover:text-white transition-all duration-150 shadow-sm"
                          title="Chỉnh sửa"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UserFormModal
        isOpen={showForm}
        onClose={handleCloseForm}
        onSave={handleSave}
        initialData={selectedData}
        roles={roles}
      />

      <ChangePasswordModal
        isOpen={!!passwordEmail}
        onClose={() => setPasswordEmail(null)}
        onSave={handlePasswordSave}
        email={passwordEmail}
      />

      <Pagination
        page={page}
        pageSize={PAGE_SIZE}
        count={pageData.length}
        total={filtered.length}
        itemLabel="tài khoản"
        loading={loading}
        onPrev={() => setPage(p => p - 1)}
        onNext={() => setPage(p => p + 1)}
        onPageChange={setPage}
      />
    </div>
  );
}
