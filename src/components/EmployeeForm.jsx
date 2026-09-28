import React, { useState } from "react";
import employeeService from "../services/employeeService";

const initialEmployee = {
  id: "",
  full_name: "",
  gender: "",
  id_number: "",
  citizen_id_number:"",
  issue_place: "",
  birth_place: "",
  home_town: "",
  permanent_address: "",
  temporary_address: "",
  marital_status: "",
  personal_phone: "",
  personal_email: "",
  company_phone: "",
  company_email: "",
  highest_degree: "",
  major: "",
  school_name: "",
  special_skills: "",
  attendance_code: "",
  position_title: "",
  department_name: "",
  rank: "",
  work_location: "",
  leader: "",
  manager_id: "",
  social_insurance_no: "",
  insurance_status: "",
  kcb_place: "",
  birth_date: "",
  issue_date: "",
  join_date: "",
  official_date: "",
  insurance_date: "",
  health_insur_expire: "",
  graduation_year: "",
  insurance_amount: "",
  health_insurance: "",
  tax_id: "",
  bank_account: "",
  bank_name: "",
  status: "",
  development_plan: "",
  job_objective: "",
  health_status: "",
  image_path: "",
  image_name: "",
  created_at: "",
  updated_at: "",
};

function EmployeeForm() {
  const [employee, setEmployee] = useState(initialEmployee);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");
  try {
    // Hàm chuyển đổi ngày sang ISO string
    const toISO = (dateStr) => dateStr ? new Date(dateStr).toISOString() : "";

    // Tạo object employee đúng chuẩn API
    const employeeToSend = {
      ...employee,
      birth_date: toISO(employee.birth_date),
      issue_date: toISO(employee.issue_date),
      join_date: toISO(employee.join_date),
      official_date: toISO(employee.official_date),
      insurance_date: toISO(employee.insurance_date),
      health_insur_expire: toISO(employee.health_insur_expire),
      created_at: toISO(new Date()),
      updated_at: toISO(new Date()),
      graduation_year: employee.graduation_year ? Number(employee.graduation_year) : null,
      insurance_amount: employee.insurance_amount ? Number(employee.insurance_amount) : null,
    };

    await employeeService.upsertEmployee({ file, employee: employeeToSend });
    setMessage("Tạo mới nhân viên thành công!");
    setEmployee(initialEmployee);
    setFile(null);
  } catch (error) {
    setMessage("Có lỗi xảy ra khi tạo mới nhân viên.");
    console.error(error);
  }
  setLoading(false);
};

  return (
    <form onSubmit={handleSubmit}>
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Section 1: Thông tin cá nhân cơ bản */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">1. Thông tin cá nhân cơ bản</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Mã nhân viên</label>
              <input name="attendance_code" value={employee.attendance_code} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Họ và tên<span className="text-red-500">*</span></label>
              <input name="full_name" value={employee.full_name} onChange={handleChange} required
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Giới tính</label>
              <select name="gender" value={employee.gender} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">--Chọn--</option>
                <option value="Male">Nam</option>
                <option value="Female">Nữ</option>
                <option value="Other">Khác</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Ngày sinh</label>
              <input type="date" name="birth_date" value={employee.birth_date} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Số CMND/CCCD</label>
              <input name="citizen_id_number" value={employee.citizen_id_number} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nơi cấp</label>
              <input name="issue_place" value={employee.issue_place} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Ngày cấp</label>
              <input type="date" name="issue_date" value={employee.issue_date} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nơi sinh</label>
              <input name="birth_place" value={employee.birth_place} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Quê quán</label>
              <input name="home_town" value={employee.home_town} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Địa chỉ thường trú</label>
              <input name="permanent_address" value={employee.permanent_address} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Địa chỉ tạm trú</label>
              <input name="temporary_address" value={employee.temporary_address} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tình trạng hôn nhân</label>
              <select name="marital_status" value={employee.marital_status} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">--Chọn--</option>
                <option value="Single">Độc thân</option>
                <option value="Married">Đã kết hôn</option>
                <option value="Divorced">Ly hôn</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Ảnh đại diện</label>
              <input type="file" accept="image/*" onChange={handleFileChange}
                className="w-full" />
            </div>
          </div>
        </div>

        {/* Section 2: Thông tin liên hệ */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">2. Thông tin liên hệ</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Điện thoại cá nhân</label>
              <input name="personal_phone" value={employee.personal_phone} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email cá nhân</label>
              <input name="personal_email" value={employee.personal_email} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Điện thoại công ty</label>
              <input name="company_phone" value={employee.company_phone} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email công ty</label>
              <input name="company_email" value={employee.company_email} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
        </div>

        {/* Section 3: Thông tin học vấn & kỹ năng */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">3. Học vấn & Kỹ năng</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Trình độ cao nhất</label>
              <input name="highest_degree" value={employee.highest_degree} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Chuyên ngành</label>
              <input name="major" value={employee.major} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Trường</label>
              <input name="school_name" value={employee.school_name} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Kỹ năng đặc biệt</label>
              <input name="special_skills" value={employee.special_skills} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
        </div>

        {/* Section 4: Thông tin công việc */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">4. Thông tin công việc</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Chức danh</label>
              <input name="position_title" value={employee.position_title} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Phòng ban</label>
              <input name="department_name" value={employee.department_name} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Bậc</label>
              <input name="rank" value={employee.rank} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nơi làm việc</label>
              <input name="work_location" value={employee.work_location} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Trưởng nhóm</label>
              <input name="leader" value={employee.leader} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Quản lý</label>
              <input name="manager_id" value={employee.manager_id} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
        </div>

        {/* Section 5: Thông tin bảo hiểm */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">5. Thông tin bảo hiểm</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Số BHXH</label>
              <input name="social_insurance_no" value={employee.social_insurance_no} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Trạng thái BH</label>
              <input name="insurance_status" value={employee.insurance_status} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nơi KCB</label>
              <input name="kcb_place" value={employee.kcb_place} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Ngày vào làm</label>
              <input type="date" name="join_date" value={employee.join_date} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Ngày chính thức</label>
              <input type="date" name="official_date" value={employee.official_date} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Ngày đóng BH</label>
              <input type="date" name="insurance_date" value={employee.insurance_date} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Ngày hết hạn BHYT</label>
              <input type="date" name="health_insur_expire" value={employee.health_insur_expire} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Mức đóng BH</label>
              <input type="number" name="insurance_amount" value={employee.insurance_amount} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Mã BHYT</label>
              <input name="health_insurance" value={employee.health_insurance} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
        </div>

        {/* Section 6: Thông tin tài chính & khác */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">6. Tài chính & Khác</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Mã số thuế</label>
              <input name="tax_id" value={employee.tax_id} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Số tài khoản</label>
              <input name="bank_account" value={employee.bank_account} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tên ngân hàng</label>
              <input name="bank_name" value={employee.bank_name} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
              <input name="status" value={employee.status} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Kế hoạch phát triển</label>
              <input name="development_plan" value={employee.development_plan} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Mục tiêu nghề nghiệp</label>
              <input name="job_objective" value={employee.job_objective} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Tình trạng sức khỏe</label>
              <input name="health_status" value={employee.health_status} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Năm tốt nghiệp</label>
              <input type="number" name="graduation_year" value={employee.graduation_year} onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="p-6 border-t border-gray-200 text-center">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? "Đang lưu..." : "Tạo mới"}
          </button>
          {message && <p className="mt-3">{message}</p>}
        </div>
      </div>
    </form>
  );
}

export default EmployeeForm;