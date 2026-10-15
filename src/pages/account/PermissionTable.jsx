import React, { useMemo, useEffect, useState } from 'react';
import { ShieldCheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { getAllUsersFunction } from '../../services/authManageService';

/**
 * Component hiển thị ma trận phân quyền
 * @param {Array} functions - Danh sách functions từ API getAllUsersFunction
 * @param {Array} selectedIds - Danh sách ID các quyền đang được chọn
 * @param {Function} onChange - Callback khi thay đổi checkbox (nhận vào array IDs mới)
 */
export default function PermissionTable({ functions: propFunctions, selectedIds = [], onChange, loading: propLoading = false }) {
  const [internalFunctions, setInternalFunctions] = useState([]);
  const [internalLoading, setInternalLoading] = useState(false);
  const [openMenus, setOpenMenus] = useState({}); // State để quản lý các menu đang mở/đóng

  // Ưu tiên sử dụng dữ liệu từ props, nếu không có thì dùng dữ liệu nội bộ tự fetch
  const functions = propFunctions || internalFunctions;
  const loading = propLoading || internalLoading;

  // Tự động fetch dữ liệu nếu component được dùng như một trang độc lập (không có props)
  useEffect(() => {
    if (!propFunctions) {
      setInternalLoading(true);
      getAllUsersFunction()
        .then(res => {
          const data = res?.data?.data || res?.data || {};
          setInternalFunctions(data.functions || []);
        })
        .finally(() => setInternalLoading(false));
    }
  }, [propFunctions]);
  
  // 1. Lấy danh sách các Method duy nhất để làm cột ngang
  const methods = useMemo(() => {
    const set = new Set();
    (functions || []).forEach(fn => {
      if (fn.method) set.add(fn.method.toUpperCase());
    });
    // Sắp xếp theo thứ tự quen thuộc
    const order = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    return Array.from(set).sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [functions || []]);
  
  // 2. Nhóm dữ liệu theo Menu và Tên chức năng
  const groupedData = useMemo(() => {
    return (functions || []).reduce((acc, fn) => {
      const menu = fn.menu || 'Khác';
      const name = fn.name || 'Chưa đặt tên';
      
      if (!acc[menu]) acc[menu] = {};
      if (!acc[menu][name]) acc[menu][name] = {};
      
      // Khởi tạo mảng nếu chưa có để tránh ghi đè các quyền bị trùng Method (VD: 2 quyền GET)
      const method = fn.method ? fn.method.toUpperCase() : 'UNKNOWN';
      if (!acc[menu][name][method]) {
        acc[menu][name][method] = [];
      }
      
      acc[menu][name][method].push({
        id: String(fn.id).trim(),
        code: fn.code
      });
      return acc;
    }, {});
  }, [functions]);

  const toggleMenu = (menuName) => {
    setOpenMenus(prev => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const handleCheckboxChange = (id, checked) => {
    if (!onChange) return; // Nếu dùng để xem thì không cần onChange
    if (checked) {
      onChange([...selectedIds, id]);
    } else {
      onChange(selectedIds.filter(item => String(item).trim() !== String(id).trim()));
    }
  };

  const isChecked = (id) => selectedIds.includes(String(id).trim());

  if (loading) {
    return <div className="p-10 text-center text-gray-400">Đang tải cấu trúc quyền...</div>;
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col overflow-hidden">
      <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
        <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
        <span className="font-bold text-gray-800 text-sm uppercase tracking-wider">
          {onChange ? "Thiết lập quyền hạn chi tiết" : "Danh mục chức năng hệ thống"}
        </span>
      </div>
      
      <div className="overflow-auto max-h-[calc(100vh-250px)]">
        <table className="w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 z-20">
            <tr className="bg-gray-100">
              <th className="sticky left-0 z-30 bg-gray-100 px-4 py-3 font-semibold text-gray-700 border-b border-r border-gray-200 w-12 text-center">
                STT
              </th>
              <th className="sticky left-12 z-30 bg-gray-100 px-6 py-3 font-semibold text-gray-700 border-b border-r border-gray-200 min-w-[250px]">
                Chức năng / Phân mục
              </th>
              {methods.map(m => (
                <th key={m} className="bg-gray-100 px-4 py-3 font-bold text-center text-gray-600 border-b border-gray-200 uppercase tracking-tighter">
                  <span className={`px-2 py-0.5 rounded text-[10px] ${getMethodColor(m)}`}>
                    {m}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">            
            {/* Khởi tạo STT counter */}
            {(() => {
              let sttCounter = 0;
              return Object.entries(groupedData).map(([menu, items]) => (
                <React.Fragment key={menu}>
                  {/* Row tiêu đề Menu */}
                  <tr 
                    className="bg-blue-50/30 cursor-pointer hover:bg-blue-100 transition-colors"
                    onClick={() => toggleMenu(menu)}
                  >
                    {/* Ô trống cho cột STT (cố định bên trái) */}
                    <td className="sticky left-0 z-10 border-b border-r border-gray-200 bg-blue-50/20"></td>
                    {/* Ô nội dung Menu bắt đầu từ cột Chức năng */}
                    <td colSpan={methods.length + 1} className="sticky left-12 z-10 px-4 py-2 font-bold text-blue-700 border-b border-r border-gray-200 bg-blue-50/20">
                      <div className="flex items-center justify-between">
                        <span>{menu}</span>
                        <ChevronDownIcon 
                          className={`h-4 w-4 text-blue-600 transition-transform duration-200 ${openMenus[menu] ? 'rotate-180' : ''}`} 
                        />
                      </div>
                    </td>
                  </tr>
                  
                  {/* Danh sách các chức năng bên trong menu */}
                  {openMenus[menu] && Object.entries(items).map(([name, actions]) => {
                    sttCounter++; // Tăng STT chỉ cho các dòng chức năng
                    return (
                      <tr key={name} className="hover:bg-blue-50/10 transition-colors">
                        <td className="sticky left-0 z-10 bg-white px-4 py-2.5 w-12 text-gray-400 text-xs border-b border-r border-gray-100">{sttCounter}</td>
                        <td className="sticky left-12 z-10 bg-white pl-10 pr-4 py-2.5 text-gray-700 font-medium border-b border-r border-gray-100 italic">
                          {name}
                        </td>
                        {methods.map((m, mIdx) => {
                          const funcsInCell = actions[m] || [];
                          return (
                            <td key={m} className={`px-2 py-2.5 align-top text-center border-b border-gray-100 ${mIdx === methods.length - 1 ? '' : 'border-r'}`}>
                              {funcsInCell.length > 0 ? (
                                <div className="flex flex-col items-center gap-3">
                                  {funcsInCell.map(fn => (
                                    <div key={fn.id} className="flex flex-col items-center group relative" title={fn.code}>
                                      <input
                                        type="checkbox"
                                        checked={isChecked(fn.id)}
                                        onChange={(e) => handleCheckboxChange(fn.id, e.target.checked)}
                                        disabled={!onChange}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                                      />
                                      {/* Hiển thị một phần của code nếu 1 ô có nhiều checkbox để người dùng phân biệt */}
                                      {funcsInCell.length > 1 && (
                                        <span className="text-[9px] text-gray-500 mt-1 uppercase max-w-[50px] truncate" title={fn.code}>
                                          {fn.code.split('_').pop()}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-gray-200 text-[10px] select-none">-</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </React.Fragment>
              ));
            })()}
          </tbody>
        </table>
      </div>
      
      {(!functions || functions.length === 0) && !loading && (
        <div className="p-8 text-center text-gray-400 italic">Không có dữ liệu chức năng</div>
      )}
    </div>
  );
}

/**
 * Trả về màu sắc badge cho từng loại method
 */
function getMethodColor(method) {
  switch (method) {
    case 'GET': return 'bg-green-100 text-green-700 border border-green-200';
    case 'POST': return 'bg-blue-100 text-blue-700 border border-blue-200';
    case 'PUT': return 'bg-orange-100 text-orange-700 border border-orange-200';
    case 'DELETE': return 'bg-red-100 text-red-700 border border-red-200';
    default: return 'bg-gray-100 text-gray-600 border border-gray-200';
  }
}