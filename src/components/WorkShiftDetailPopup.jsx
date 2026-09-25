import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const applyTypeOptions = [
  { label: 'Toàn đơn vị', value: 'unit' },
  { label: 'Theo phòng ban', value: 'department' },
  { label: 'Theo nhân viên', value: 'employee' },
];

const applyScopeOptions = [
  { label: 'Văn phòng', value: '2' },
  { label: 'Nhà máy', value: '4' },
  { label: 'Tất cả', value: 'ALL' },
];

const WorkShiftDetailPopup = ({
  open,
  onClose,
  shiftRuleId,
  onSubmit,
  fetchEmployees,
  fetchDepartments,
  loading = false,
  message = "",
}) => {
  const [applyType, setApplyType] = useState('unit');
  const [applyScope, setApplyScope] = useState('2');
  const [employeeList, setEmployeeList] = useState([]);
  const [departmentList, setDepartmentList] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [effectiveFrom, setEffectiveFrom] = useState('');
  const [effectiveTo, setEffectiveTo] = useState('');

  const [employeeSearch, setEmployeeSearch] = useState("");
  const [departmentSearch, setDepartmentSearch] = useState("");

  const searchTimeout = useRef();
  useEffect(() => {
    if (applyType === 'employee' && fetchEmployees) {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        let work_location = '';
        if (applyScope === '4') work_location = 4;
        else if (applyScope === '2') work_location = 2;
        else if (applyScope === 'ALL') work_location = '';
        console.log('[WorkShiftDetailPopup] fetchEmployees:', { employeeSearch, work_location, applyScope });
        fetchEmployees(employeeSearch, work_location)
          .then(data => {
            setEmployeeList(data);
            console.log('[WorkShiftDetailPopup] fetchEmployees result:', data);
          })
          .catch(err => {
            setEmployeeList([]);
            console.error('[WorkShiftDetailPopup] fetchEmployees error:', err);
          });
      }, 400); // debounce 400ms
    }
    if (applyType === 'department' && fetchDepartments) {
      fetchDepartments(departmentSearch).then(setDepartmentList);
    }
    // reset selections khi đổi loại
    if (applyType !== 'employee') setSelectedEmployees([]);
    if (applyType !== 'department') setSelectedDepartments([]);
    // eslint-disable-next-line
  }, [applyType, fetchEmployees, fetchDepartments, employeeSearch, departmentSearch, applyScope]);

  const handleSubmit = () => {
    let apply_type = '';
    if (applyType === 'unit') apply_type = 'ALL';
    else if (applyType === 'department') apply_type = 'DEPARTMENT';
    else if (applyType === 'employee') apply_type = 'EMPLOYEE';
    // Format ngày về dạng ISO 00:00:00Z nếu có giá trị
    const formatDate = d => d ? `${d}T00:00:00Z` : null;
    onSubmit({
      shift_rule_code: shiftRuleId,
      effective_from: formatDate(effectiveFrom),
      effective_to: formatDate(effectiveTo),
      apply_scope: applyScope,
      apply_type,
      employee_id: apply_type === 'EMPLOYEE' ? selectedEmployees : [],
      department_code: apply_type === 'DEPARTMENT' ? selectedDepartments : [],
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative animate-fadeIn">
        <h2 className="text-xl font-bold mb-4 text-blue-700">Thiết lập chi tiết phân ca</h2>
        <div className="mb-3">
          <label className="block font-semibold mb-1">Ngày hiệu lực từ</label>
          <input type="date" value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div className="mb-3">
          <label className="block font-semibold mb-1">Ngày hiệu lực đến</label>
          <input type="date" value={effectiveTo} onChange={e => setEffectiveTo(e.target.value)}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
        <div className="mb-3">
          <label className="block font-semibold mb-1">Phạm vi áp dụng</label>
          <select value={applyScope} onChange={e => setApplyScope(e.target.value)}
            className="border rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400">
            {applyScopeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Đối tượng áp dụng</label>
          <div className="flex gap-4 mb-2">
            {applyTypeOptions.map(opt => (
              <label key={opt.value} className="flex items-center gap-2 font-normal">
                <input
                  type="radio"
                  name="applyType"
                  value={opt.value}
                  checked={applyType === opt.value}
                  onChange={() => setApplyType(opt.value)}
                  className="accent-blue-600"
                />
                {opt.label}
              </label>
            ))}
          </div>
          {applyType === 'department' && (
            <div className="border rounded bg-gray-50 p-4">
              <input
                type="text"
                className="border rounded px-2 py-1 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Tìm kiếm tên phòng ban..."
                value={departmentSearch}
                onChange={e => setDepartmentSearch(e.target.value)}
              />
              <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 bg-white rounded border">
                {departmentList.length > 0 ? departmentList.map(dep => (
                  <label key={dep.code || dep.id} className="flex items-center px-4 py-2 cursor-pointer hover:bg-blue-50">
                    <input
                      type="checkbox"
                      className="mr-2 accent-blue-600"
                      checked={selectedDepartments.includes(dep.code || dep.id)}
                      onChange={e => {
                        const val = dep.code || dep.id;
                        if (e.target.checked) setSelectedDepartments([...selectedDepartments, val]);
                        else setSelectedDepartments(selectedDepartments.filter(code => code !== val));
                      }}
                    />
                    <span>{dep.name || dep.name_vi || dep.name_en} {dep.code && `(${dep.code})`}</span>
                  </label>
                )) : <div className="text-gray-400 px-4 py-2">Không có phòng ban</div>}
              </div>
            </div>
          )}
          {applyType === 'employee' && (
            <div className="border rounded bg-gray-50 p-4">
              <input
                type="text"
                className="border rounded px-2 py-1 w-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="Tìm kiếm tên hoặc mã chấm công..."
                value={employeeSearch}
                onChange={e => setEmployeeSearch(e.target.value)}
              />
              <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 bg-white rounded border">
                {employeeList.length > 0 ? employeeList.map(emp => (
                  <label key={emp.id || emp.code} className="flex items-center px-4 py-2 cursor-pointer hover:bg-blue-50">
                    <input
                      type="checkbox"
                      className="mr-2 accent-blue-600"
                      checked={selectedEmployees.includes(emp.id || emp.code)}
                      onChange={e => {
                        const val = emp.id || emp.code;
                        if (e.target.checked) setSelectedEmployees([...selectedEmployees, val]);
                        else setSelectedEmployees(selectedEmployees.filter(id => id !== val));
                      }}
                    />
                    <span>{emp.full_name || emp.name} ({emp.attendance_code || emp.code})</span>
                  </label>
                )) : <div className="text-gray-400 px-4 py-2">Không có nhân viên</div>}
              </div>
            </div>
          )}
        </div>
        {message && <div className={"mb-3 text-center font-semibold " + (message.includes("thành công") ? "text-green-600" : "text-red-600")}>{message}</div>}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={handleSubmit}
            className={"px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition " + (loading ? "opacity-60 cursor-not-allowed" : "")}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Xác nhận"}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition" disabled={loading}>Đóng</button>
        </div>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold" disabled={loading}>×</button>
      </div>
    </div>
  );
};

WorkShiftDetailPopup.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  shiftRuleId: PropTypes.string.isRequired,
  onSubmit: PropTypes.func.isRequired,
  fetchEmployees: PropTypes.func,
  fetchDepartments: PropTypes.func,
  loading: PropTypes.bool,
  message: PropTypes.string,
};

export default WorkShiftDetailPopup;
