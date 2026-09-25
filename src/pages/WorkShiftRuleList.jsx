import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import workShiftService from "../services/workShiftService";
import WorkShiftDetailPopup from "../components/WorkShiftDetailPopup";
import employeeService from "../services/employeeService";
import { getDepartments } from "../services/departmentService";

const UNIT_OPTIONS = [
  { label: "Tất cả đơn vị", value: "ALL" },
  { label: "Văn phòng", value: "2" },
  { label: "Nhà máy", value: "4" },
];
const STATUS_OPTIONS = [
  { label: "Tất cả", value: "ALL" },
  { label: "Đang áp dụng", value: "active" },
  { label: "Chưa áp dụng", value: "inactive" },
  { label: "Hết hiệu lực", value: "expired" },
];

function getStatus(rule) {
  const now = new Date();
  const from = new Date(rule.effective_from);
  const to = rule.effective_to ? new Date(rule.effective_to) : null;
  if (to && now > to) return { label: "Hết hiệu lực", color: "gray" };
  if (now < from) return { label: "Chưa áp dụng", color: "blue" };
  return { label: "Đang áp dụng", color: "green" };
}

function getApplyType(rule) {
  if (rule.apply_type === "DEPARTMENT") return "Theo phòng ban";
  if (rule.apply_type === "EMPLOYEE") return "Theo nhân viên";
  if (rule.apply_type === "ALL" || !rule.apply_type) return "Toàn đơn vị";
  return rule.apply_type;
}

function getUnitLabel(scope) {
  if (scope === "ALL") return "Tất cả đơn vị";
  if (scope === "2") return "Văn phòng";
  if (scope === "4") return "Nhà máy";
  return scope || "-";
}


export default function WorkShiftRuleList() {
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [unit, setUnit] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  // Popup state
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);


  // Debounce fetchEmployees, nhận work_location
  const fetchEmployees = (() => {
    let timeout = null;
    return (search = "", work_location = "") => {
      if (timeout) clearTimeout(timeout);
      return new Promise(resolve => {
        timeout = setTimeout(() => {
          employeeService.getList({ attendance_code: "", full_name: search, work_location })
            .then(data => resolve(data))
            .catch(() => resolve([]));
        }, 400);
      });
    };
  })();

  const fetchDepartments = async (search = "") => {
    // getDepartments không có search, filter phía FE nếu cần
    try {
      const data = await getDepartments();
      if (!search) return data;
      const s = search.toLowerCase();
      return data.filter(d =>
        (d.name_vi && d.name_vi.toLowerCase().includes(s)) ||
        (d.name_en && d.name_en.toLowerCase().includes(s)) ||
        (d.name && d.name.toLowerCase().includes(s))
      );
    } catch {
      return [];
    }
  };

  const handleEditClick = (rule) => {
    setSelectedRule(rule);
    setPopupOpen(true);
  };
  const handlePopupClose = () => {
    setPopupOpen(false);
    setSelectedRule(null);
  };
  const [popupMessage, setPopupMessage] = useState("");
  const [popupLoading, setPopupLoading] = useState(false);
  const handlePopupSubmit = async (data) => {
    setPopupLoading(true);
    setPopupMessage("");
    try {
      await workShiftService.generateWorkShiftDetail(data);
      setPopupMessage("Tạo chi tiết phân ca thành công!");
      setTimeout(() => {
        setPopupOpen(false);
        setSelectedRule(null);
        setPopupMessage("");
      }, 1200);
    } catch (err) {
      setPopupMessage("Có lỗi khi tạo chi tiết phân ca!");
      setPopupLoading(false);
    }
  };

  useEffect(() => {
    workShiftService.getWorkShiftRuleList().then(res => {
      console.log("API data", res);
      setRules(Array.isArray(res.data) ? res.data : []);
    });
  }, []);

  // Filter logic
  const filtered = rules.filter(rule => {
    let ok = true;
    if (unit !== "ALL" && getUnitLabel(rule.apply_scope) !== getUnitLabel(unit)) ok = false;
    if (status !== "ALL") {
      const st = getStatus(rule).label;
      if (status === "active" && st !== "Đang áp dụng") ok = false;
      if (status === "inactive" && st !== "Chưa áp dụng") ok = false;
      if (status === "expired" && st !== "Hết hiệu lực") ok = false;
    }
    if (search) {
      const s = search.toLowerCase();
          if (!rule.id?.toLowerCase().includes(s) && !getUnitLabel(rule.apply_scope).toLowerCase().includes(s)) ok = false;
    }
    return ok;
  });

  // Pagination
  const total = filtered.length;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white p-6 rounded shadow mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Danh sách phân ca làm việc</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => navigate("/shift-assignment")}
        >
          + Phân ca
        </button>
      </div>
      <div className="flex gap-4 mb-4">
        <select className="border rounded px-2 py-1" value={unit} onChange={e => { setUnit(e.target.value); setPage(1); }}>
          {UNIT_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
        </select>
        <select className="border rounded px-2 py-1" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <input className="border rounded px-2 py-1 flex-1" placeholder="Tên ca, đơn vị..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
      </div>
      <table className="w-full border rounded mb-2">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">STT</th>
            <th className="p-2 border">Ca làm việc</th>
            <th className="p-2 border">Đơn vị áp dụng</th>
            <th className="p-2 border">Thời gian áp dụng</th>
            <th className="p-2 border">Đối tượng áp dụng</th>
            <th className="p-2 border">Trạng thái</th>
            <th className="p-2 border">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {paged.length === 0 && <tr><td colSpan={7} className="text-center p-4">Không có dữ liệu</td></tr>}
          {paged.map((rule, idx) => {
            const statusObj = getStatus(rule);
            return (
              <tr key={rule.id}>
                <td className="p-2 border text-center">{(page - 1) * pageSize + idx + 1}</td>
                <td className="p-2 border text-blue-600 underline cursor-pointer">{rule.shift_name || rule.shift_code || rule.shift_id}</td>
                <td className="p-2 border">{getUnitLabel(rule.apply_scope)}</td>
                <td className="p-2 border">{new Date(rule.effective_from).toLocaleDateString()} {rule.effective_to ? ' - ' + new Date(rule.effective_to).toLocaleDateString() : ''}</td>
                <td className="p-2 border">{getApplyType(rule)}</td>
                <td className="p-2 border">
                  <span
                    className="px-2 py-1 rounded text-xs"
                    style={{
                      background: statusObj.color === "green" ? "#bbf7d0" : statusObj.color === "blue" ? "#dbeafe" : "#e5e7eb",
                      color: statusObj.color === "green" ? "#166534" : statusObj.color === "blue" ? "#1e40af" : "#374151"
                    }}
                  >
                    {statusObj.label}
                  </span>
                </td>
                <td className="p-2 border text-center">
                  <button className="text-blue-600 mr-2" onClick={() => handleEditClick(rule)}>✏️</button>
                  <button className="text-red-600" onClick={async () => {
                    if (window.confirm('Bạn có chắc chắn muốn xóa ca này không?')) {
                      try {
                        await workShiftService.deleteWorkShiftRule(rule.id);
                        setRules(rules => rules.filter(r => r.id !== rule.id));
                        alert('Xóa ca thành công!');
                      } catch (err) {
                        alert('Có lỗi khi xóa ca!');
                      }
                    }
                  }}>🗑️</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="flex justify-end items-center mt-2">
        <div className="flex gap-2">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-2 py-1 border rounded disabled:opacity-50">Trang trước</button>
          <span>{page}</span>
          <button disabled={page * pageSize >= total} onClick={() => setPage(page + 1)} className="px-2 py-1 border rounded disabled:opacity-50">Trang sau</button>
        </div>
      </div>
      {/* Popup work shift detail */}
      <WorkShiftDetailPopup
        open={popupOpen}
        onClose={handlePopupClose}
        shiftRuleId={selectedRule?.id || ""}
        onSubmit={handlePopupSubmit}
        fetchEmployees={fetchEmployees}
        fetchDepartments={fetchDepartments}
        loading={popupLoading}
        message={popupMessage}
      />
    </div>
  );
}
