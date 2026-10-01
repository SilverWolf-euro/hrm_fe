import api from "./api";

// Service tổng hợp cho Employee


// 1. Danh sách nhân viên (search)
function getList({ attendance_code = '', full_name = '', work_location = 2 }) {
  return api.get('/api/v1/employee', {
    params: { attendance_code, full_name, work_location },
  }).then(res => res.data);
}

// 2. Chi tiết nhân viên theo id
function getDetail(id) {
  return api.get(`/api/v1/employee/${id}`).then(res => res.data);
}

// 3. Thành phần gia đình
function getRelatives(employee_id) {
  return api.get(`/api/v1/employee/relatives/${employee_id}`).then(res => res.data);
}

// 4. Người liên hệ khẩn cấp
function getEmergencyContacts(employee_id) {
  return api.get(`/api/v1/employee/emergency_contacts/${employee_id}`).then(res => res.data);
}

// 5. Bằng cấp/chứng nhận
function getCertificates(employee_id) {
  return api.get(`/api/v1/employee/certificates/${employee_id}`).then(res => res.data);
}

// 6. Lịch sử lương, phí, thưởng
function getSalaries(employee_id) {
  return api.get(`/api/v1/employee/salaries/${employee_id}`).then(res => res.data);
}

// 6.1. Lương phụ cấp
function getAllowances(employee_id) {
  return api.get(`/api/v1/employee/allowances/${employee_id}`).then(res => res.data);
}

// 7. Quá trình công tác/thăng tiến
function getCareerHistories(employee_id) {
  return api.get(`/api/v1/employee/career_histories/${employee_id}`).then(res => res.data);
}

// 8. Khen thưởng/kỷ luật
function getRewardDisciplines(employee_id) {
  return api.get(`/api/v1/employee/reward_disciplines/${employee_id}`).then(res => res.data);
}

// Lấy danh sách hợp đồng của nhân viên
function getContractHistories(employee_id) {
  return api.get(`/api/v1/employee/contract_histories/${employee_id}`).then(res => res.data);
}

// Insert/Update Thành phần gia đình
function upsertRelatives(data) {
  return api.put('/api/v1/employee/relatives', data).then(res => res.data);
}

// Insert/Update Người liên hệ khẩn cấp
function upsertEmergencyContacts(data) {
  return api.put('/api/v1/employee/emergency_contacts', data).then(res => res.data);
}

// Insert/Update Bằng cấp/chứng chỉ
function upsertCertificates(data) {
  return api.put('/api/v1/employee/certificates', data).then(res => res.data);
}

// Insert/Update Lịch sử lương, phí, thưởng
function upsertSalaries({ file, salary }) {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  formData.append('salary', JSON.stringify(salary));
  return api.put('/api/v1/employee/salaries', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(res => res.data);
}

// Insert/Update Lương phụ cấp
function upsertAllowances(data) {
  return api.put('/api/v1/employee/allowances', data).then(res => res.data);
}

// Insert/Update Quá trình công tác/thăng tiến
function upsertCareerHistories(data) {
  return api.put('/api/v1/employee/career_histories', data).then(res => res.data);
}

// Insert/Update Khen thưởng/kỷ luật
function upsertRewardDisciplines(data) {
  return api.put('/api/v1/employee/reward_disciplines', data).then(res => res.data);
}

// Insert/Update Quản lý hợp đồng
function upsertContractHistories({ file, contractHistory }) {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  formData.append('contractHistory', JSON.stringify(contractHistory));
  return api.put('/api/v1/employee/contract_histories', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(res => res.data);
}

// Insert/Update nhân viên (có upload file)
function upsertEmployee({ file, employee }) {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  formData.append('employee', JSON.stringify(employee));
  return api.post('/api/v1/employee', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }).then(res => res.data);
}

// Xóa thành phần gia đình
function removeRelative(id) {
  return api.delete(`/api/v1/employee/relatives/${id}`).then(res => res.data);
}

// Xóa người liên hệ khẩn cấp
function removeEmergencyContact(id) {
  return api.delete(`/api/v1/employee/emergency_contacts/${id}`).then(res => res.data);
}

// Xóa lịch sử lương
function removeSalaryHistory(id) {
  return api.delete(`/api/v1/employee/salaries/${id}`).then(res => res.data);
}

// Xóa quá trình công tác/thăng tiến
function removeCareerHistory(id) {
  return api.delete(`/api/v1/employee/career_histories/${id}`).then(res => res.data);
}

// Xóa khen thưởng/kỷ luật
function removeRewardDiscipline(id) {
  return api.delete(`/api/v1/employee/reward_disciplines/${id}`).then(res => res.data);
}

// Xóa hợp đồng
function removeContractHistory(id) {
  return api.delete(`/api/v1/employee/contract_histories/${id}`).then(res => res.data);
}

// Lấy dữ liệu chấm công theo tháng/năm/khu vực
function getAttendanceByMonthYear(month, year, work_location) {
  return api.get('/api/v1/attendance', {
    params: { month, year, work_location },
  }).then(res => res.data);
}

// Download file chấm công theo tháng/năm/khu vực
function downloadAttendanceByMonthYear(month, year, work_location) {
  return api.get('/api/v1/attendance/download', {
    params: { month, year, work_location },
    responseType: 'blob', // To handle binary response
  }).then(res => res.data);
}

// Lấy danh sách giá trị cho các combobox (POSITION, DEPARTMENT, WORK_LOCATION, EMPLOYEE_CONTRACT, SALARY, ALLOWANCE)
// Trả về mảng [{ value, label, filter }]
// Cache promise để chỉ gọi API 1 lần cho mọi component (kể cả khi remount / StrictMode)
let filterPromise = null;
function getFilter({ force = false } = {}) {
  if (!filterPromise || force) {
    filterPromise = api.get('/api/v1/employee/filter')
      .then(res => res.data)
      .catch(err => {
        // Lỗi thì xóa cache để lần sau gọi lại
        filterPromise = null;
        throw err;
      });
  }
  return filterPromise;
}

const employeeService = {
  getList,
  getFilter,
  getDetail,
  getRelatives,
  getEmergencyContacts,
  getCertificates,
  getSalaries,
  getAllowances,
  getCareerHistories,
  getRewardDisciplines,
  upsertRelatives,
  upsertEmergencyContacts,
  upsertCertificates,
  upsertSalaries,
  upsertAllowances,
  upsertCareerHistories,
  upsertRewardDisciplines,
  upsertContractHistories,
  getContractHistories,
  upsertEmployee,
  removeRelative,
  removeEmergencyContact,
  removeSalaryHistory,
  removeCareerHistory,
  removeRewardDiscipline,
  removeContractHistory,
  getAttendanceByMonthYear,
  downloadAttendanceByMonthYear,
};

export default employeeService;

