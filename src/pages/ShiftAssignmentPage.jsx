import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getDepartments } from "../services/departmentService";
import workShiftService from "../services/workShiftService";
import employeeService from "../services/employeeService";

const weekdays = [
  { label: "Thứ 2", value: 1 },
  { label: "Thứ 3", value: 2 },
  { label: "Thứ 4", value: 3 },
  { label: "Thứ 5", value: 4 },
  { label: "Thứ 6", value: 5 },
  { label: "Thứ 7", value: 6 },
  { label: "Chủ nhật", value: 0 },
];

// Dữ liệu mẫu
const sampleUnits = [
  { id: '', name: 'Tất cả đơn vị' },
  { id: '2', name: 'Văn phòng' },
  { id: '4', name: 'Nhà máy' },
];
// sampleDepartments removed, dùng API thật


export default function ShiftAssignmentPage() {
  const navigate = useNavigate();

  // State sử dụng dữ liệu API
  const [shifts, setShifts] = useState([]);
  const [units] = useState(sampleUnits);
  const [departments, setDepartments] = useState([]);
  const [departmentSearch, setDepartmentSearch] = useState("");
  const [employees, setEmployees] = useState([]);
  const [employeeSearch, setEmployeeSearch] = useState("");

  const [selectedShift, setSelectedShift] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedWeekdays, setSelectedWeekdays] = useState([]);
  const [applyType, setApplyType] = useState("unit");
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [message, setMessage] = useState("");

  const searchTimeout = useRef();

  // Lấy danh sách phòng ban từ API khi chọn Theo phòng ban
  useEffect(() => {
    if (applyType === "department") {
      getDepartments()
        .then(data => setDepartments(data))
        .catch(() => setDepartments([]));
    }
    // reset khi chuyển loại áp dụng
    setSelectedDepartments([]);
  }, [applyType]);

  useEffect(() => {
    // Lấy danh sách ca làm việc từ API
    workShiftService.getWorkShiftList()
      .then(res => {
        console.log('API workShiftList result:', res);
        if (Array.isArray(res?.data)) {
          setShifts(res.data);
          // Log chi tiết từng ca làm việc
          res.data.forEach((item, idx) => console.log(`Shift[${idx}]:`, item));
        } else if (Array.isArray(res)) {
          setShifts(res);
          res.forEach((item, idx) => console.log(`Shift[${idx}]:`, item));
        } else if (Array.isArray(res?.items)) {
          setShifts(res.items);
          res.items.forEach((item, idx) => console.log(`Shift[${idx}]:`, item));
        } else setShifts([]);
      })
      .catch(() => setShifts([]));
  }, []);

  useEffect(() => {
    if (applyType === "employee") {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => {
        // Truyền work_location đúng theo selectedUnit
        let work_location = 2;
        if (selectedUnit === "4") work_location = 4;
        else if (selectedUnit === "2") work_location = 2;
        else if (selectedUnit === "") work_location = "";
        employeeService.getList({ attendance_code: "", full_name: employeeSearch, work_location })
          .then(data => {
            console.log('API employee list result:', data);
            setEmployees(data);
          })
          .catch(() => setEmployees([]));
      }, 400); // debounce 400ms
    }
    // Chỉ reset khi đổi loại áp dụng
    // eslint-disable-next-line
  }, [applyType, employeeSearch, selectedUnit]);

  useEffect(() => {
    setSelectedEmployees([]);
  }, [applyType]);



  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!selectedShift) {
      setMessage("Vui lòng chọn ca làm việc.");
      return;
    }
    if (!selectedUnit) {
      setMessage("Vui lòng chọn đơn vị áp dụng.");
      return;
    }
    if (!selectedWeekdays.length) {
      setMessage("Vui lòng chọn ít nhất một ngày trong tuần.");
      return;
    }

    // Xử lý giá trị apply_scope và apply_type
    let apply_scope = "";
    let apply_type = "";
    if (applyType === "unit") {
      // Nếu chọn Toàn đơn vị, giữ đúng giá trị selectedUnit
      if (selectedUnit === "") {
        apply_scope = "ALL";
      } else if (selectedUnit === "2") {
        apply_scope = "2";
      } else if (selectedUnit === "4") {
        apply_scope = "4";
      }
      apply_type = "ALL";
    } else {
      if (selectedUnit === "2") apply_scope = "2";
      else if (selectedUnit === "4") apply_scope = "4";
      if (applyType === "department") apply_type = "DEPARTMENT";
      else if (applyType === "employee") apply_type = "EMPLOYEE";
    }

    // Xử lý các ngày trong tuần
    const weekdayFlags = {
      is_monday: selectedWeekdays.includes(1),
      is_tuesday: selectedWeekdays.includes(2),
      is_wednesday: selectedWeekdays.includes(3),
      is_thursday: selectedWeekdays.includes(4),
      is_friday: selectedWeekdays.includes(5),
      is_saturday: selectedWeekdays.includes(6),
      is_sunday: selectedWeekdays.includes(0),
    };

    // Xử lý ngày effective_from và effective_to
    let effectiveFrom = fromDate ? new Date(fromDate) : new Date();
    let effectiveTo;
    if (toDate) {
      effectiveTo = new Date(toDate);
    } else {
      // Nếu không chọn toDate, lấy ngày hiện tại năm sau
      effectiveTo = new Date(effectiveFrom);
      effectiveTo.setFullYear(effectiveFrom.getFullYear() + 1);
    }

    const payload = {
      id: "",
      shift_id: selectedShift,
      apply_scope,
      effective_from: effectiveFrom.toISOString(),
      effective_to: effectiveTo ? effectiveTo.toISOString() : null,
      ...weekdayFlags,
      apply_type,
      department_id: apply_type === "DEPARTMENT" ? selectedDepartments.map(String) : [],
      employee_id: apply_type === "EMPLOYEE" ? selectedEmployees.map(String) : [],
    };

    try {
      await workShiftService.createWorkShiftRule(payload);
      setMessage("Phân ca thành công!");
      setTimeout(() => {
        navigate("/work-shift-rules");
      }, 800);
    } catch (err) {
      setMessage("Có lỗi khi phân ca!");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow mt-8">
      <h2 className="text-xl font-bold mb-4">Phân ca làm việc chi tiết</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Ca làm việc <span className="text-red-500">*</span></label>
          <select
            className="border rounded px-2 py-1 w-full h-10"
            value={selectedShift}
            onChange={e => setSelectedShift(e.target.value)}
          >
            <option value="">Chọn ca làm việc</option>
            {shifts.map((s, idx) => (
              <option key={s.id || idx} value={s.id}>
                {s.shift_name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Đơn vị áp dụng <span className="text-red-500">*</span></label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={selectedUnit}
            onChange={e => setSelectedUnit(e.target.value)}
          >
            <option value="">Chọn đơn vị</option>
            {units.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <label className="block font-semibold mb-1">Từ ngày</label>
            <input type="date" className="border rounded px-2 py-1 w-full" value={fromDate} onChange={e => setFromDate(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="block font-semibold mb-1">Đến ngày</label>
            <input type="date" className="border rounded px-2 py-1 w-full" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Áp dụng vào các ngày*</label>
          <div className="flex gap-4 flex-wrap">
            {weekdays.map(w => (
              <label key={w.value} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={selectedWeekdays.includes(w.value)}
                  onChange={e => {
                    if (e.target.checked) setSelectedWeekdays([...selectedWeekdays, w.value]);
                    else setSelectedWeekdays(selectedWeekdays.filter(v => v !== w.value));
                  }}
                />
                {w.label}
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-1">Đối tượng áp dụng</label>
          <div className="flex gap-4 mb-2">
            <label>
              <input type="radio" name="applyType" value="unit" checked={applyType === "unit"} onChange={() => setApplyType("unit")} /> Toàn đơn vị
            </label>
            <label>
              <input type="radio" name="applyType" value="department" checked={applyType === "department"} onChange={() => setApplyType("department")} /> Theo phòng ban
            </label>
            <label>
              <input type="radio" name="applyType" value="employee" checked={applyType === "employee"} onChange={() => setApplyType("employee")} /> Theo nhân viên
            </label>
          </div>
          {applyType === "department" && (
            <div className="border rounded bg-gray-50 p-4">
              <input
                type="text"
                className="border rounded px-2 py-1 w-full mb-3"
                placeholder="Tìm kiếm tên phòng ban..."
                value={departmentSearch}
                onChange={e => setDepartmentSearch(e.target.value)}
              />
              <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 bg-white rounded border">
                {departments
                  .filter(d =>
                    d.name_vi?.toLowerCase().includes(departmentSearch.toLowerCase()) ||
                    d.name_en?.toLowerCase().includes(departmentSearch.toLowerCase())
                  )
                  .map(d => (
                    <label key={d.code} className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedDepartments.includes(d.code)}
                        onChange={e => {
                          if (e.target.checked) setSelectedDepartments([...selectedDepartments, d.code]);
                          else setSelectedDepartments(selectedDepartments.filter(code => code !== d.code));
                        }}
                      />
                      <span>{d.name_vi}</span>
                    </label>
                  ))}
                {departments.length === 0 && (
                  <div className="text-gray-400 px-4 py-2">Không có phòng ban</div>
                )}
              </div>
            </div>
          )}
          {applyType === "employee" && (
            <div className="border rounded bg-gray-50 p-4">
              <input
                type="text"
                className="border rounded px-2 py-1 w-full mb-3"
                placeholder="Tìm kiếm tên hoặc mã chấm công..."
                value={employeeSearch}
                onChange={e => setEmployeeSearch(e.target.value)}
              />
              <div className="max-h-56 overflow-y-auto divide-y divide-gray-100 bg-white rounded border">
                {employees.length > 0 ? employees.map(emp => (
                  <label key={emp.id} className="flex items-center px-4 py-2 cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedEmployees.includes(emp.id)}
                      onChange={e => {
                        if (e.target.checked) setSelectedEmployees([...selectedEmployees, emp.id]);
                        else setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id));
                      }}
                    />
                    <span>{emp.full_name} ({emp.attendance_code})</span>
                  </label>
                )) : <div className="text-gray-400 px-4 py-2">Không có nhân viên</div>}
              </div>
            </div>
          )}
        </div>
        {message && <div className="text-red-500 mb-2">{message}</div>}
        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            className="px-4 py-2 rounded bg-gray-400 text-white"
            onClick={() => navigate("/work-shift-rules")}
          >
            Hủy
          </button>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">Thêm</button>
        </div>
      </form>
    </div>
  );
}
