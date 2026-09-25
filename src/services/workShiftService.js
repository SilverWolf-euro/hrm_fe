
// Service for attendance work shift management
import api from './api';

const API_BASE = '/api/v1/workshift';

const workShiftService = {
  // GET: Attendance summary by date and worklocation
  getAttendanceSummary: (dateSum, worklocation) =>
    api.get(`${API_BASE}/summary`, {
      params: { dateSum, worklocation },
    }),
  // GET: List all work shifts (with optional text filter)
  getWorkShiftList: (text = '') =>
    api.get(`${API_BASE}/work_shift_list`, { params: { text } }),

  // GET: Get work shift by id (e.g., 'HC')
  getWorkShiftById: (id) =>
    api.get(`${API_BASE}/work_shift_list/${id}`),

  // POST: Create a new work shift
  createWorkShift: (data) =>
    api.post(`${API_BASE}/work_shift_list`, data),

  // PUT: Update a work shift by id
  updateWorkShift: (id, data) =>
    api.put(`${API_BASE}/work_shift_list/${id}`, data),

  // DELETE: Delete a work shift by id
  deleteWorkShift: (id) =>
    api.delete(`${API_BASE}/work_shift_list/${id}`),

  // POST: Generate work shift details
  generateWorkShiftDetail: (data) =>
    api.post(`${API_BASE}/work_shift_detail/generate`, data),

  // POST: Create a work shift rule
  createWorkShiftRule: (data) =>
    api.post(`${API_BASE}/work_shift_rule`, data),

  // GET: List all work shift rules
  getWorkShiftRuleList: () =>
    api.get(`${API_BASE}/work_shift_rule`),

  // GET: Get work shift rule by id
  getWorkShiftRuleById: (id) =>
    api.get(`${API_BASE}/work_shift_rule/${id}`),

  // GET: Get work shift details (with filters)
  getWorkShiftDetail: (params) =>
    api.get(`${API_BASE}/work_shift_detail`, { params }),

  // PUT: Update work shift detail by id
  updateWorkShiftDetail: (id, data) =>
    api.put(`${API_BASE}/work_shift_detail/${id}`, data),

  // DELETE: Delete a work shift detail by id
  deleteWorkShiftDetail: (id) =>
    api.delete(`${API_BASE}/work_shift_detail/${id}`),

  // DELETE: Delete a work shift rule by id (phân ca)
  deleteWorkShiftRule: (id) =>
    api.delete(`${API_BASE}/work_shift_rule/${id}`),
};

export default workShiftService;
