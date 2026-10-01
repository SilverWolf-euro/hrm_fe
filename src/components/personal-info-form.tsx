"use client"

import React, { useState, useEffect, useRef } from "react";
import employeeService from "../services/employeeService";
import dayjs from "dayjs";

type PersonalInfoFormProps = {
  profile?: any;
  isNew?: boolean;
  // Gọi sau khi insert/update thành công (id trả về từ API) để trang cha load lại chi tiết
  onSaved?: (id?: string) => void;
};

// Dữ liệu combobox lấy từ API /employee/filter
type FilterOption = {
  value: string;
  label: string;
  filter: string;
};

// Giá trị đại diện cho lựa chọn "Khác" (cho phép nhập text)
const OTHER_VALUE = "__OTHER__";
const isOtherLabel = (label: string) => (label || "").trim().toLowerCase() === "khác";

// Danh sách option có kèm lựa chọn "Khác" (dùng giá trị OTHER_VALUE, thêm vào cuối nếu API chưa có)
const withOtherOption = (options: FilterOption[], filter: string): FilterOption[] => {
  const normal = options.filter(o => !isOtherLabel(o.label));
  return [...normal, { value: OTHER_VALUE, label: "Khác", filter }];
};

type FilterSelectProps = {
  id?: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  className?: string;
};

// Combobox dùng chung; nếu giá trị hiện tại không có trong danh sách thì vẫn hiển thị để không mất dữ liệu cũ
function FilterSelect({ id, value, options, onChange, className }: FilterSelectProps) {
  const hasValue = !value || options.some(o => String(o.value) === String(value));
  return (
    <select id={id} value={value} onChange={e => onChange(e.target.value)} className={className}>
      <option value="">--Chọn--</option>
      {!hasValue && <option value={value}>{value}</option>}
      {options.map(o => (
        <option key={`${o.filter}-${o.value}`} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function PersonalInfoForm({ profile, isNew = false, onSaved }: PersonalInfoFormProps) {
  // State để ẩn/hiện bảng thành phần gia đình
  const [showFamilyTable, setShowFamilyTable] = useState(false);
  // Thêm state để ẩn/hiện bảng chứng chỉ
  const [showCertTable, setShowCertTable] = useState(false);
  // Thêm state để ẩn/hiện bảng lịch sử lương
  const [showSalaryTable, setShowSalaryTable] = useState(false);
  // Đồng bộ dữ liệu từ profile vào các state khi profile thay đổi (chỉ các trường đơn lẻ)
  const [showCareerTable, setShowCareerTable] = useState(false);

  // Thêm ref cho input file
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Dữ liệu combobox từ API /employee/filter
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  useEffect(() => {
    employeeService.getFilter()
      .then((data: FilterOption[]) => setFilterOptions(Array.isArray(data) ? data : []))
      .catch((err: any) => console.error("Lỗi lấy dữ liệu filter:", err));
  }, []);
  const getOptions = (filter: string) => filterOptions.filter(o => o.filter === filter);
  const salaryOptions = withOtherOption(getOptions("SALARY"), "SALARY");
  const allowanceOptions = withOtherOption(getOptions("ALLOWANCE"), "ALLOWANCE");

  // Loại hợp đồng lao động
  const [contractType, setContractType] = useState("");
  // Trạng thái chọn "Khác" cho Mức lương / Phụ cấp
  const [salaryTypeOther, setSalaryTypeOther] = useState(false);
  const [allowanceContentOther, setAllowanceContentOther] = useState(false);

  // Hàm handle update/insert nhân viên
  const handleUpdateEmployee = async () => {
    setIsUpdating(true);
    try {
      // Lấy file từ input
      const file = fileInputRef.current?.files?.[0] || null;

      // Chuẩn bị object employee đúng với API
      // ...existing code...
      const employee = {
        id: profile?.id || "",
        full_name: fullName,
        gender,
        id_number: idNumber,
        citizen_id_number: citizenIdNumber,
        issue_place: issuePlace,
        birth_place: birthPlace,
        home_town: homeTown,
        permanent_address: permanentAddress,
        temporary_address: temporaryAddress,
        marital_status: maritalStatus,
        personal_phone: personalPhone,
        personal_email: personalEmail,
        company_phone: companyPhone,
        company_email: companyEmail,
        highest_degree: highestDegree,
        major,
        school_name: schoolName,
        special_skills: specialSkills,
        attendance_code: attendanceCode,
        position_title: positionTitle,
        department_name: departmentName,
        rank,
        work_location: workLocation,
        // Loại hợp đồng lao động: value từ combobox EMPLOYEE_CONTRACT
        employment_type: contractType,
        // Mức lương: type = label đã chọn hoặc text nhập khi chọn "Khác"
        salaries: salaries.map(s => ({
          id: s.id ?? null,
          type: s.type,
          amount_old: Number(s.amount_old) || 0,
          amount_new: Number(s.amount_new) || 0,
          start_date: s.start_date ? new Date(s.start_date + 'T00:00:00Z').toISOString() : null,
        })),
        // Nội dung/loại phụ cấp: content = label đã chọn hoặc text nhập khi chọn "Khác"
        allowances: allowances.map(a => ({
          id: a.id ?? null,
          content: a.content,
          amount: Number(a.amount) || 0,
          currency: a.currency,
          date: a.date ? new Date(a.date + 'T00:00:00Z').toISOString() : null,
        })),
        leader,
        manager_id: managerId,
        social_insurance_no: socialInsuranceNo,
        insurance_status: insuranceStatus,
        kcb_place: kcbPlace,
        birth_date: birthDate ? new Date(birthDate + 'T00:00:00Z').toISOString() : null,
        issue_date: issueDate ? new Date(issueDate + 'T00:00:00Z').toISOString() : null,
        join_date: joinDate ? new Date(joinDate + 'T00:00:00Z').toISOString() : null,
        official_date: officialDate ? new Date(officialDate + 'T00:00:00Z').toISOString() : null,
        insurance_date: insuranceDate ? new Date(insuranceDate + 'T00:00:00Z').toISOString() : null,
        health_insur_expire: healthInsurExpire ? new Date(healthInsurExpire + 'T00:00:00Z').toISOString() : null,
        graduation_year: graduationYear ? Number(graduationYear) : null,
        insurance_amount: insuranceAmount ? Number(insuranceAmount) : null,
        health_insurance: healthInsurance,
        tax_id: taxId,
        bank_account: bankAccount,
        bank_name: bankName,
        status,
        development_plan: selfDevelopment,
        job_objective: careerGoal,
        health_status: healthStatus,
        image_path: "",
        image_name: "",
        created_at: profile?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const res = await employeeService.upsertEmployee({ file, employee });
      alert(isNew ? "Tạo nhân viên thành công!" : "Cập nhật thông tin nhân viên thành công!");
      onSaved?.(res?.id || profile?.id);
    } catch (err: any) {
      let message = isNew ? "Có lỗi khi tạo nhân viên!" : "Có lỗi khi cập nhật thông tin nhân viên!";
      if (err?.response) {
        // Nếu có response từ server
        message += "\nStatus: " + err.response.status;
        if (err.response.data) {
          if (typeof err.response.data === "string") {
            message += "\n" + err.response.data;
          } else if (typeof err.response.data === "object") {
            message += "\n" + JSON.stringify(err.response.data);
          }
        }
      } else if (err?.message) {
        message += "\n" + err.message;
      }
      alert(message);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setGender(profile.gender || "");
      setIdNumber(profile.id_number || "");
      setCitizenIdNumber(profile.citizen_id_number || "");
      setContractType(profile.employment_type || "");
      setBirthPlace(profile.birth_place || "");
      setHomeTown(profile.home_town || "");
      setPermanentAddress(profile.permanent_address || "");
      setTemporaryAddress(profile.temporary_address || "");
      setMaritalStatus(profile.marital_status || "");
      setPersonalPhone(profile.personal_phone || "");
      setPersonalEmail(profile.personal_email || "");
      setCompanyPhone(profile.company_phone || "");
      setCompanyEmail(profile.company_email || "");
      setStatus(profile.status || "");
      setJoinDate(profile.join_date ? dayjs(profile.join_date).format('YYYY-MM-DD') : "");
      setOfficialDate(profile.official_date ? dayjs(profile.official_date).format('YYYY-MM-DD') : "");
      setLeader(profile.leader || "");
      setManagerId(profile.manager_id || "");
      setAttendanceCode(profile.attendance_code || "");
      setPositionTitle(profile.position_title || "");
      setDepartmentName(profile.department_name || "");
      setRank(profile.rank || "");
      setWorkLocation(profile.work_location || "");
      setBirthDate(profile.birth_date ? dayjs(profile.birth_date).format('YYYY-MM-DD') : "");
      setIssueDate(profile.issue_date ? dayjs(profile.issue_date).format('YYYY-MM-DD') : "");
      setKcbPlace(profile.kcb_place || "");
      setSocialInsuranceNo(profile.social_insurance_no || "");
      setInsuranceStatus(profile.insurance_status || "");
      setHealthInsurExpire(profile.health_insur_expire ? dayjs(profile.health_insur_expire).format('YYYY-MM-DD') : "");
      setHighestDegree(profile.highest_degree || "");
      setMajor(profile.major || "");
      setSchoolName(profile.school_name || "");
      setGraduationYear(profile.graduation_year || "");
      setSpecialSkills(profile.special_skills || "");
      setTaxId(profile.tax_id || "");
      setBankAccount(profile.bank_account || "");
      setBankName(profile.bank_name || "");
      setHealthInsurance(profile.health_insurance || "");
      setInsuranceAmount(profile.insurance_amount || "");
      setSelfDevelopment(profile.development_plan || "");
      setCareerGoal(profile.job_objective || "");
      setHealthStatus(profile.health_status || "");
    }
  }, [profile]);
  // Đồng bộ dữ liệu từ profile vào các state khi profile thay đổi
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setGender(profile.gender || "");
      setIdNumber(profile.id_number || "");
      setCitizenIdNumber(profile.citizen_id_number || "");
      setContractType(profile.employment_type || "");
      setBirthPlace(profile.birth_place || "");
      setHomeTown(profile.home_town || "");
      setPermanentAddress(profile.permanent_address || "");
      setTemporaryAddress(profile.temporary_address || "");
      setMaritalStatus(profile.marital_status || "");
      setPersonalPhone(profile.personal_phone || "");
      setPersonalEmail(profile.personal_email || "");
      setCompanyPhone(profile.company_phone || "");
      setCompanyEmail(profile.company_email || "");
      setHighestDegree(profile.highest_degree || "");
      setMajor(profile.major || "");
      setSchoolName(profile.school_name || "");
      setSpecialSkills(profile.special_skills || "");
      setAttendanceCode(profile.attendance_code || "");
      setPositionTitle(profile.position_title || "");
      setDepartmentName(profile.department_name || "");
      setRank(profile.rank || "");
      setWorkLocation(profile.work_location || "");
      setLeader(profile.leader || "");
      setManagerId(profile.manager_id || "");
      setSocialInsuranceNo(profile.social_insurance_no || "");
      setInsuranceStatus(profile.insurance_status || "");
      setKcbPlace(profile.kcb_place || "");
      setBirthDate(profile.birth_date ? dayjs(profile.birth_date).format('YYYY-MM-DD') : "");
      setIssueDate(profile.issue_date ? dayjs(profile.issue_date).format('YYYY-MM-DD') : "");
      setJoinDate(profile.join_date ? dayjs(profile.join_date).format('YYYY-MM-DD') : "");
      setOfficialDate(profile.official_date ? dayjs(profile.official_date).format('YYYY-MM-DD') : "");
      setInsuranceDate(profile.insurance_date ? dayjs(profile.insurance_date).format('YYYY-MM-DD') : "");
      setHealthInsurExpire(profile.health_insur_expire ? dayjs(profile.health_insur_expire).format('YYYY-MM-DD') : "");
      setGraduationYear(profile.graduation_year || "");
      setInsuranceAmount(profile.insurance_amount || "");
      setHealthInsurance(profile.health_insurance || "");
      setTaxId(profile.tax_id || "");
      setBankAccount(profile.bank_account || "");
      setBankName(profile.bank_name || "");
      setStatus(profile.status || "");
      setSelfDevelopment(profile.development_plan || "");
      setCareerGoal(profile.job_objective || "");
      setHealthStatus(profile.health_status || "");
    }
  }, [profile]);
  // State cho mục 6: Thông tin khác
  // const [profileImage, setProfileImage] = useState<File|null>(null);
  // const [profileImageError, setProfileImageError] = useState(false);
  const [selfDevelopment, setSelfDevelopment] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [careerGoalTouched, setCareerGoalTouched] = useState(false);
  const [healthStatus, setHealthStatus] = useState("");
  const [birthDate, setBirthDate] = useState("")
  const [issueDate, setIssueDate] = useState("")
  const [joinDate, setJoinDate] = useState("")
  const [leaveDate, setLeaveDate] = useState("")
  const [issuePlace, setIssuePlace] = useState(profile?.issue_place || "");
  const [ethnicity, setEthnicity] = useState(profile?.ethnicity || "");
  const [religion, setReligion] = useState(profile?.religion || "");
  // Các trường chỉ tạo state nếu chưa có

  // Đồng bộ các trường đã có state khi profile thay đổi
  useEffect(() => {
    if (profile) {
      setSelfDevelopment(profile.development_plan || "");
      setCareerGoal(profile.job_objective || "");
      setHealthStatus(profile.health_status || "");
    }
  }, [profile]);

  // Thông tin cá nhân cơ bản
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [gender, setGender] = useState(profile?.gender || "");
  const [idNumber, setIdNumber] = useState(profile?.id_number || "");
  const [citizenIdNumber, setCitizenIdNumber] = useState(profile?.citizen_id_number || "");
  const [birthPlace, setBirthPlace] = useState(profile?.birth_place || "");
  const [homeTown, setHomeTown] = useState(profile?.home_town || "");
  const [permanentAddress, setPermanentAddress] = useState(profile?.permanent_address || "");
  const [temporaryAddress, setTemporaryAddress] = useState(profile?.temporary_address || "");
  const [maritalStatus, setMaritalStatus] = useState(profile?.marital_status || "");
  const [personalPhone, setPersonalPhone] = useState(profile?.personal_phone || "");
  const [personalEmail, setPersonalEmail] = useState(profile?.personal_email || "");
  const [companyPhone, setCompanyPhone] = useState(profile?.company_phone || "");
  const [companyEmail, setCompanyEmail] = useState(profile?.company_email || "");
  const [highestDegree, setHighestDegree] = useState(profile?.highest_degree || "");
  const [major, setMajor] = useState(profile?.major || "");
  const [schoolName, setSchoolName] = useState(profile?.school_name || "");
  const [specialSkills, setSpecialSkills] = useState(profile?.special_skills || "");
  const [attendanceCode, setAttendanceCode] = useState(profile?.attendance_code || "");
  const [positionTitle, setPositionTitle] = useState(profile?.position_title || "");
  const [departmentName, setDepartmentName] = useState(profile?.department_name || "");
  const [rank, setRank] = useState(profile?.rank || "");
  const [workLocation, setWorkLocation] = useState(profile?.work_location || "");
  const [leader, setLeader] = useState(profile?.leader || "");
  const [managerId, setManagerId] = useState(profile?.manager_id || "");
  const [socialInsuranceNo, setSocialInsuranceNo] = useState(profile?.social_insurance_no || "");
  const [insuranceStatus, setInsuranceStatus] = useState(profile?.insurance_status || "");
  const [kcbPlace, setKcbPlace] = useState(profile?.kcb_place || "");
  const [officialDate, setOfficialDate] = useState(profile?.official_date ? dayjs(profile.official_date).format('YYYY-MM-DD') : "");
  const [insuranceDate, setInsuranceDate] = useState(profile?.insurance_date ? dayjs(profile.insurance_date).format('YYYY-MM-DD') : "");
  const [healthInsurExpire, setHealthInsurExpire] = useState(profile?.health_insur_expire ? dayjs(profile.health_insur_expire).format('YYYY-MM-DD') : "");
  const [graduationYear, setGraduationYear] = useState(profile?.graduation_year || "");
  const [insuranceAmount, setInsuranceAmount] = useState(profile?.insurance_amount || "");
  const [healthInsurance, setHealthInsurance] = useState(profile?.health_insurance || "");
  const [taxId, setTaxId] = useState(profile?.tax_id || "");
  const [bankName, setBankName] = useState(profile?.bank_name || "");
  const [bankAccount, setBankAccount] = useState(profile?.bank_account || "");
  const [status, setStatus] = useState(profile?.status || "");
  // 1. Lịch sử công tác/thăng tiến
  type WorkHistory = {
  id?: string | null;
  position: string;
  department: string;
  rank: string;
  start_date: string;
  end_date: string;
};

const [workHistories, setWorkHistories] = useState<WorkHistory[]>([]);
useEffect(() => {
  if (profile && profile.id) {
    employeeService.getCareerHistories(profile.id).then((data) => {
      if (Array.isArray(data)) {
        setWorkHistories(
          data.map((item) => ({
            id: item.id || null,
            position: item.position || "",
            department: item.department || "",
            rank: item.rank || "",
            start_date: item.start_date ? dayjs(item.start_date).format("YYYY-MM-DD") : "",
            end_date: item.end_date ? dayjs(item.end_date).format("YYYY-MM-DD") : "",
          }))
        );
      }
    });
  }
}, [profile]);
const [showWorkModal, setShowWorkModal] = useState(false);
const [editingWorkIndex, setEditingWorkIndex] = useState<number | null>(null);
const [workForm, setWorkForm] = useState<WorkHistory>({
  position: "",
  department: "",
  rank: "",
  start_date: "",
  end_date: "",
});
const [workFormTouched, setWorkFormTouched] = useState<Record<string, boolean>>({});
  const handleWorkInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWorkForm((prev) => ({ ...prev, [name]: value }));
    setWorkFormTouched((prev) => ({ ...prev, [name]: true }));
  };
 const handleAddWork = () => {
  setWorkForm({ position: "", department: "", rank: "", start_date: "", end_date: "" });
  setWorkFormTouched({});
  setEditingWorkIndex(null);
  setShowWorkModal(true);
};

const handleEditWork = (idx: number) => {
  setWorkForm(workHistories[idx]);
  setWorkFormTouched({});
  setEditingWorkIndex(idx);
  setShowWorkModal(true);
};

const handleDeleteWork = async (id: string | null | undefined) => {
  if (!id) return;
  if (window.confirm("Bạn có chắc chắn muốn xóa lịch sử công tác/thăng tiến này?")) {
    await employeeService.removeCareerHistory(id);
    // Cập nhật lại danh sách sau khi xóa
    if (profile && profile.id) {
      const data = await employeeService.getCareerHistories(profile.id);
      if (Array.isArray(data)) {
        setWorkHistories(
          data.map((item) => ({
            id: item.id || null,
            position: item.position || "",
            department: item.department || "",
            rank: item.rank || "",
            start_date: item.start_date ? dayjs(item.start_date).format("YYYY-MM-DD") : "",
            end_date: item.end_date ? dayjs(item.end_date).format("YYYY-MM-DD") : "",
          }))
        );
      }
    }
  }
};

  const handleWorkSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const errors: Record<string, boolean> = {};
  if (!workForm.position) errors.position = true;
  if (!workForm.department) errors.department = true;
  if (!workForm.rank) errors.rank = true;
  if (!workForm.start_date) errors.start_date = true;
  if (!workForm.end_date) errors.end_date = true;
  setWorkFormTouched({ position: true, department: true, rank: true, start_date: true, end_date: true });
  if (Object.keys(errors).length > 0) return;
  console.log("start_date:", workForm.start_date);

  console.log("end_date:", workForm.end_date);

  const apiData = [{
    id: workForm.id ?? null,
    employee_id: profile?.id || "",
    position: workForm.position,
    department: workForm.department,
    rank: workForm.rank,
    start_date: workForm.start_date ? dayjs(workForm.start_date).toISOString() : null,
    end_date: workForm.end_date ? dayjs(workForm.end_date).toISOString() : null,
  }];
  await employeeService.upsertCareerHistories(apiData);

  // Lấy lại danh sách từ API
  if (profile && profile.id) {
    const data = await employeeService.getCareerHistories(profile.id);
    if (Array.isArray(data)) {
      setWorkHistories(
        data.map((item) => ({
          id: item.id || null,
          position: item.position || "",
          department: item.department || "",
          rank: item.rank || "",
          start_date: item.start_date ? dayjs(item.start_date).format("YYYY-MM-DD") : "",
          end_date: item.end_date ? dayjs(item.end_date).format("YYYY-MM-DD") : "",
        }))
      );
    }
  }

  setShowWorkModal(false);
  setEditingWorkIndex(null);
};

  // 2. Lịch sử thay đổi lương
  type SalaryChange = { oldSalary: string; newSalary: string; date: string };
  const [salaryChanges, setSalaryChanges] = useState<SalaryChange[]>([]);
  const [showSalaryChangeModal, setShowSalaryChangeModal] = useState(false);
  const [salaryChangeForm, setSalaryChangeForm] = useState<SalaryChange>({ oldSalary: '', newSalary: '', date: '' });
  const [salaryChangeFormTouched, setSalaryChangeFormTouched] = useState<Record<string, boolean>>({});
  const handleSalaryChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSalaryChangeForm((prev) => ({ ...prev, [name]: value }));
    setSalaryChangeFormTouched((prev) => ({ ...prev, [name]: true }));
  };
  const handleAddSalaryChange = () => {
    setSalaryChangeForm({ oldSalary: '', newSalary: '', date: '' });
    setSalaryChangeFormTouched({});
    setShowSalaryChangeModal(true);
  };
  const handleSalaryChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, boolean> = {};
    if (!salaryChangeForm.oldSalary) errors.oldSalary = true;
    if (!salaryChangeForm.newSalary) errors.newSalary = true;
    if (!salaryChangeForm.date) errors.date = true;
    setSalaryChangeFormTouched({ oldSalary: true, newSalary: true, date: true });
    if (Object.keys(errors).length > 0) return;
    setSalaryChanges((prev) => [...prev, salaryChangeForm]);
    setShowSalaryChangeModal(false);
  };

  // 3. Đánh giá hiệu suất
  type PerformanceReview = { type: string; purpose: string; result: string; date: string };
  const [performanceReviews, setPerformanceReviews] = useState<PerformanceReview[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState<PerformanceReview>({ type: '', purpose: '', result: '', date: '' });
  const [reviewFormTouched, setReviewFormTouched] = useState<Record<string, boolean>>({});
  const handleReviewInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setReviewForm((prev) => ({ ...prev, [name]: value }));
    setReviewFormTouched((prev) => ({ ...prev, [name]: true }));
  };
  const handleAddReview = () => {
    setReviewForm({ type: '', purpose: '', result: '', date: '' });
    setReviewFormTouched({});
    setShowReviewModal(true);
  };
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, boolean> = {};
    if (!reviewForm.type) errors.type = true;
    if (!reviewForm.purpose) errors.purpose = true;
    if (!reviewForm.result) errors.result = true;
    if (!reviewForm.date) errors.date = true;
    setReviewFormTouched({ type: true, purpose: true, result: true, date: true });
    if (Object.keys(errors).length > 0) return;
    setPerformanceReviews((prev) => [...prev, reviewForm]);
    setShowReviewModal(false);
  };

  // 4. Khen thưởng
  type Reward = { 
    id?: string | null;
    type: string; 
    description: string;
    title: string; 
    decision_form: string; 
    effective_date: string;
    expiry_date: string;
   };
  const [rewards, setRewards] = useState<Reward[]>([]);
  useEffect(() => {
  if (profile && profile.id) {
    employeeService.getRewardDisciplines(profile.id).then((data) => {
      if (Array.isArray(data)) {
        setRewards(
          data.map((item) => ({
            id: item.id || null,
            type: item.type || "",
            description: item.description || "",
            title: item.title || "",
            decision_form: item.decision_form || "",
            effective_date: item.effective_date ? dayjs(item.effective_date).format("YYYY-MM-DD") : "",
            expiry_date: item.expiry_date ? dayjs(item.expiry_date).format("YYYY-MM-DD") : "",
          }))
        );
      }
    });
  }
}, [profile]);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardForm, setRewardForm] = useState<Reward>({ type: '', description: '', title: '', decision_form: '', effective_date: '', expiry_date: '' });
  const [rewardFormTouched, setRewardFormTouched] = useState<Record<string, boolean>>({});
  const handleRewardInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRewardForm((prev) => ({ ...prev, [name]: value }));
    setRewardFormTouched((prev) => ({ ...prev, [name]: true }));
  };
  const handleAddReward = () => {
    setRewardForm({ type: '', description: '', title: '', decision_form: '', effective_date: '', expiry_date: '' });
    setRewardFormTouched({});
    setShowRewardModal(true);
  };
  const handleEditReward = (index: number) => {
    const rewardToEdit = rewards[index];
    setRewardForm(rewardToEdit);
    setRewardFormTouched({});
    setShowRewardModal(true);
  };

  const handleDeleteReward= async (id: string | null | undefined) => {
    if (!id) return;
    if (window.confirm("Bạn có chắc chắn muốn xóa khen thưởng này?")) {
      await employeeService.removeRewardDiscipline(id);
      // Cập nhật lại danh sách sau khi xóa
      if (profile && profile.id) {
        const data = await employeeService.getRewardDisciplines(profile.id);
        if (Array.isArray(data)) {
          setRewards(
            data.map((item) => ({
              id: item.id || null,
              type: item.type || "",
              description: item.description || "",
              title: item.title || "",
              decision_form: item.decision_form || "",
              effective_date: item.effective_date ? dayjs(item.effective_date).format("YYYY-MM-DD") : "",
              expiry_date: item.expiry_date ? dayjs(item.expiry_date).format("YYYY-MM-DD") : "",
            }))
          );
        }
      }
    }
  };

  const handleRewardSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const errors: Record<string, boolean> = {};
  if (!rewardForm.type || rewardForm.type.length > 200) errors.type = true;
  if (!rewardForm.title || rewardForm.title.length > 20) errors.title = true;
  if (!rewardForm.decision_form || rewardForm.decision_form.length > 50) errors.decision_form = true;
  if (!rewardForm.effective_date) errors.effective_date = true;
  if (!rewardForm.expiry_date) errors.expiry_date = true;
  setRewardFormTouched({ type: true, description: true, title: true, decision_form: true, effective_date: true, expiry_date: true });
  if (Object.keys(errors).length > 0) return;

  // Chuẩn bị data gửi API
  const apiData = [{
    id: rewardForm.id ?? null,
    employee_id: profile?.id || "",
    type: rewardForm.type,
    description: rewardForm.description,
    title: rewardForm.title,
    decision_form: rewardForm.decision_form,
    effective_date: rewardForm.effective_date ? dayjs(rewardForm.effective_date).toISOString() : null,
    expiry_date: rewardForm.expiry_date ? dayjs(rewardForm.expiry_date).toISOString() : null,
  }];
  await employeeService.upsertRewardDisciplines(apiData);

  // Lấy lại danh sách từ API
  if (profile && profile.id) {
    const data = await employeeService.getRewardDisciplines(profile.id);
    if (Array.isArray(data)) {
      setRewards(
        data.map((item) => ({
          id: item.id || null,
          type: item.type || "",
          description: item.description || "",
          title: item.title || "",
          decision_form: item.decision_form || "",
          effective_date: item.effective_date ? dayjs(item.effective_date).format("YYYY-MM-DD") : "",
          expiry_date: item.expiry_date ? dayjs(item.expiry_date).format("YYYY-MM-DD") : "",
        }))
      );
    }
  }

  setShowRewardModal(false);
};

  // 5. Kỷ luật
  type Discipline = { content: string; level: string; form: string; date: string; endDate: string };
  const [disciplines, setDisciplines] = useState<Discipline[]>([]);
  const [showDisciplineModal, setShowDisciplineModal] = useState(false);
  const [disciplineForm, setDisciplineForm] = useState<Discipline>({ content: '', level: '', form: '', date: '', endDate: '' });
  const [disciplineFormTouched, setDisciplineFormTouched] = useState<Record<string, boolean>>({});
  const handleDisciplineInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDisciplineForm((prev) => ({ ...prev, [name]: value }));
    setDisciplineFormTouched((prev) => ({ ...prev, [name]: true }));
  };
  const handleAddDiscipline = () => {
    setDisciplineForm({ content: '', level: '', form: '', date: '', endDate: '' });
    setDisciplineFormTouched({});
    setShowDisciplineModal(true);
  };
  const handleDisciplineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, boolean> = {};
    if (!disciplineForm.content) errors.content = true;
    if (!disciplineForm.level) errors.level = true;
    if (!disciplineForm.form) errors.form = true;
    if (!disciplineForm.date) errors.date = true;
    if (!disciplineForm.endDate) errors.endDate = true;
    setDisciplineFormTouched({ content: true, level: true, form: true, date: true, endDate: true });
    if (Object.keys(errors).length > 0) return;
    setDisciplines((prev) => [...prev, disciplineForm]);
    setShowDisciplineModal(false);
  };
  // State cho mục 4: Pháp lý & bảo hiểm
  type Dependent = {
    fullName: string;
    birthDate: string;
    idNumber: string;
    relation: string;
    taxCode: string;
  };
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [showDependentModal, setShowDependentModal] = useState(false);
  const [dependentForm, setDependentForm] = useState<Dependent>({fullName:"", birthDate:"", idNumber:"", relation:"", taxCode:""});
  const [dependentFormTouched, setDependentFormTouched] = useState<Record<string, boolean>>({});
  const handleDependentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDependentForm((prev) => ({ ...prev, [name]: value }));
    setDependentFormTouched((prev) => ({ ...prev, [name]: true }));
  };
  const handleAddDependent = () => {
    setDependentForm({fullName:"", birthDate:"", idNumber:"", relation:"", taxCode:""});
    setDependentFormTouched({});
    setShowDependentModal(true);
  };
  const handleDependentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, boolean> = {};
    if (!dependentForm.fullName || dependentForm.fullName.length > 20) errors.fullName = true;
    if (!dependentForm.birthDate) errors.birthDate = true;
    if (!dependentForm.idNumber) errors.idNumber = true;
    if (!dependentForm.relation || dependentForm.relation.length > 10) errors.relation = true;
    if (!dependentForm.taxCode || dependentForm.taxCode.length > 10) errors.taxCode = true;
    setDependentFormTouched({ fullName:true, birthDate:true, idNumber:true, relation:true, taxCode:true });
    if (Object.keys(errors).length > 0) return;
    setDependents((prev) => [...prev, dependentForm]);
    setShowDependentModal(false);
  };
  // Ngân hàng
  // const [bankAccount, setBankAccount] = useState({accountNumber:"", bankName:""});
  // const [bankTouched, setBankTouched] = useState<{accountNumber?:boolean, bankName?:boolean}>({});
  // const handleBankInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   setBankAccount((prev) => ({ ...prev, [name]: value }));
  //   setBankTouched((prev) => ({ ...prev, [name]: true }));
  // };
  // Salary/Allowance types and state
  type Salary = {
  id?: string | null;
  type: string; // đổi từ content -> type
  amount_old: number;
  amount_new: number;
  start_date: string; // đổi từ date -> start_date
};
  type Allowance = {
    id?: string | null;
    content: string;
    amount: number;
    currency: string;
    date: string;
  };
  // Salary state
  const [salaries, setSalaries] = useState<Salary[]>([]);
useEffect(() => {
  if (profile && profile.id) {
    employeeService.getSalaries(profile.id).then((data) => {
      if (Array.isArray(data)) {
        setSalaries(
          data.map((item) => ({
            id: item.id || null,
            type: item.type || "",
            amount_old: item.amount_old || 0,
            amount_new: item.amount_new || 0,
            start_date: item.start_date ? dayjs(item.start_date).format("YYYY-MM-DD") : "",
          }))
        );
      }
    });
  }
}, [profile]);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [editingSalaryIndex, setEditingSalaryIndex] = useState<number | null>(null);
  const [salaryForm, setSalaryForm] = useState({
  id: null as string | null,
  type: "",
  amount_old: "",
  amount_new: "",
  start_date: ""
});
  const [salaryFormTouched, setSalaryFormTouched] = useState<Record<string, boolean>>({});

  const handleSalaryInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setSalaryForm((prev) => ({ ...prev, [name]: value }));
  setSalaryFormTouched((prev) => ({ ...prev, [name]: true }));
};
  // Chọn loại lương từ combobox; chọn "Khác" thì để trống cho người dùng tự nhập
  const handleSalaryTypeSelect = (value: string) => {
    const isOther = value === OTHER_VALUE;
    setSalaryTypeOther(isOther);
    setSalaryForm((prev) => ({ ...prev, type: isOther ? "" : value }));
    setSalaryFormTouched((prev) => ({ ...prev, type: true }));
  };
  const handleAddSalary = () => {
    setSalaryForm({id: null, type:"", amount_old:"", amount_new:"", start_date:""});
    setSalaryTypeOther(false);
    setSalaryFormTouched({});
    setEditingSalaryIndex(null);
    setShowSalaryModal(true);
  };

  const handleDeleteSalary = async (id: string | null | undefined) => {
    if (!id) return;
    if(window.confirm("Bạn có chắc chắn muốn xóa mức lương này?")) {
      await employeeService.removeSalaryHistory(id);
      if (profile && profile.id) {
        const data = await employeeService.getSalaries(profile.id);
        if (Array.isArray(data)) {
          setSalaries(
            data.map((item) => ({
              id: item.id || null,
              type: item.type || "",
              amount_old: item.amount_old || 0,
              amount_new: item.amount_new || 0,
              start_date: item.start_date ? dayjs(item.start_date).format("YYYY-MM-DD") : "",
            }))
          );
        }
      }
    }
  };

  const handleEditSalary = (index: number) => {
  const s = salaries[index];
  setSalaryForm({
    id: s.id ?? null,
    type: s.type,
    amount_old: s.amount_old !== undefined && s.amount_old !== null ? String(s.amount_old) : "",
    amount_new: s.amount_new !== undefined && s.amount_new !== null ? String(s.amount_new) : "",
    start_date: s.start_date || "",
  });
  // Loại lương không có trong danh sách -> hiển thị là "Khác" kèm ô nhập text
  setSalaryTypeOther(!!s.type && !salaryOptions.some(o => o.value !== OTHER_VALUE && o.label === s.type));
  setSalaryFormTouched({});
  setEditingSalaryIndex(index);
  setShowSalaryModal(true);
};
  const handleSalarySubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const errors: Record<string, boolean> = {};
  if (!salaryForm.type) errors.type = true;
  else if (salaryForm.type.length > 50) errors.type = true;
  if (salaryForm.amount_old === "" || isNaN(Number(salaryForm.amount_old))) errors.amount_old = true;
  if (salaryForm.amount_new === "" || isNaN(Number(salaryForm.amount_new))) errors.amount_new = true;
  if (!salaryForm.start_date) errors.start_date = true;
  setSalaryFormTouched({ type:true, amount_old:true, amount_new:true, start_date:true });
  if (Object.keys(errors).length > 0) return;

  await employeeService.upsertSalaries({
    file: null,
    salary: {
      id: salaryForm.id ?? null,
      employee_id: profile?.id || "",
      type: salaryForm.type,
      amount_old: Number(salaryForm.amount_old),
      amount_new: Number(salaryForm.amount_new),
      start_date: salaryForm.start_date ? dayjs(salaryForm.start_date).toISOString() : null,
    }
  });

  // Lấy lại danh sách từ API
  if (profile && profile.id) {
    const data = await employeeService.getSalaries(profile.id);
    if (Array.isArray(data)) {
      setSalaries(
        data.map((item) => ({
          id: item.id || null,
          type: item.type || "",
          amount_old: item.amount_old || 0,
          amount_new: item.amount_new || 0,
          start_date: item.start_date ? dayjs(item.start_date).format("YYYY-MM-DD") : "",
        }))
      );
    }
  }
  setShowSalaryModal(false);
  setEditingSalaryIndex(null);
};

// Allowance state
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  // Lấy danh sách phụ cấp từ API (type -> content, amount_new -> amount, end_date -> date)
  const loadAllowances = async (employeeId: string) => {
    const data = await employeeService.getAllowances(employeeId);
    if (Array.isArray(data)) {
      setAllowances(
        data.map((item: any) => ({
          id: item.id || null,
          content: item.type || "",
          amount: item.amount_new || 0,
          currency: item.currency || "VND",
          date: item.end_date ? dayjs(item.end_date).format("YYYY-MM-DD") : "",
        }))
      );
    }
  };
  useEffect(() => {
    if (profile && profile.id) {
      loadAllowances(profile.id).catch((err: any) => console.error("Lỗi lấy danh sách phụ cấp:", err));
    }
  }, [profile]);
  const [showAllowanceModal, setShowAllowanceModal] = useState(false);
  const [editingAllowanceIndex, setEditingAllowanceIndex] = useState<number | null>(null);
  const [allowanceForm, setAllowanceForm] = useState<Allowance>({id: null, content:"", amount:0, currency:"VND", date:""});
  const [allowanceFormTouched, setAllowanceFormTouched] = useState<Record<string, boolean>>({});
  const handleAllowanceInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAllowanceForm((prev) => ({ ...prev, [name]: value }));
    setAllowanceFormTouched((prev) => ({ ...prev, [name]: true }));
  };
  // Chọn loại phụ cấp từ combobox; chọn "Khác" thì để trống cho người dùng tự nhập
  const handleAllowanceContentSelect = (value: string) => {
    const isOther = value === OTHER_VALUE;
    setAllowanceContentOther(isOther);
    setAllowanceForm((prev) => ({ ...prev, content: isOther ? "" : value }));
    setAllowanceFormTouched((prev) => ({ ...prev, content: true }));
  };
  const handleAddAllowance = () => {
    setAllowanceForm({id: null, content:"", amount:0, currency:"VND", date:""});
    setAllowanceContentOther(false);
    setAllowanceFormTouched({});
    setEditingAllowanceIndex(null);
    setShowAllowanceModal(true);
  };
  const handleEditAllowance = (index: number) => {
    const a = allowances[index];
    setAllowanceForm({ ...a, id: a.id ?? null });
    // Loại phụ cấp không có trong danh sách -> hiển thị là "Khác" kèm ô nhập text
    setAllowanceContentOther(!!a.content && !allowanceOptions.some(o => o.value !== OTHER_VALUE && o.label === a.content));
    setAllowanceFormTouched({});
    setEditingAllowanceIndex(index);
    setShowAllowanceModal(true);
  };
  // Xóa phụ cấp dùng chung API xóa lương /salaries/:id
  const handleDeleteAllowance = async (id: string | null | undefined) => {
    if (!id) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa phụ cấp này?")) return;
    try {
      await employeeService.removeSalaryHistory(id);
      if (profile?.id) await loadAllowances(profile.id);
    } catch (err: any) {
      console.error("Lỗi xóa phụ cấp:", err);
      alert("Có lỗi khi xóa phụ cấp!");
    }
  };
  const handleAllowanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, boolean> = {};
    if (!allowanceForm.content) errors.content = true;
    else if (allowanceForm.content.length > 50) errors.content = true;
    if (!allowanceForm.amount) errors.amount = true;
    if (!allowanceForm.currency) errors.currency = true;
    if (!allowanceForm.date) errors.date = true;
    setAllowanceFormTouched({ content:true, amount:true, currency:true, date:true });
    if (Object.keys(errors).length > 0) return;

    if (!profile?.id) {
      alert("Vui lòng lưu thông tin nhân viên trước khi thêm phụ cấp!");
      return;
    }
    try {
      await employeeService.upsertAllowances({
        id: allowanceForm.id ?? "",
        employee_id: profile.id,
        type: allowanceForm.content,
        amount_new: Number(allowanceForm.amount) || 0,
        currency: allowanceForm.currency,
        end_date: allowanceForm.date ? new Date(allowanceForm.date + 'T00:00:00Z').toISOString() : null,
      });
      await loadAllowances(profile.id);
      setShowAllowanceModal(false);
      setEditingAllowanceIndex(null);
    } catch (err: any) {
      console.error("Lỗi cập nhật phụ cấp:", err);
      alert("Có lỗi khi cập nhật phụ cấp!" + (err?.response?.data ? "\n" + JSON.stringify(err.response.data) : ""));
    }
  };

  // Emergency contacts state
type EmergencyContact = {
  id?: string | null;
  fullName: string;
  relationship: string;
  phoneNumber: string;
};
const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
useEffect(() => {
    if (profile && profile.id) {
      employeeService.getEmergencyContacts(profile.id).then((data) => {
        if (Array.isArray(data)) {
          setEmergencyContacts(
            data.map((item) => ({
              id: item.id || null,
              fullName: item.full_name || "",
              relationship  : item.relationship || "",
              phoneNumber: item.phone || "",
            }))
          );
        }
      });
    }
  }, [profile]);

const [showContactModal, setShowContactModal] = useState(false);
const [editingContactIndex, setEditingContactIndex] = useState<number | null>(null);
const [contactForm, setContactForm] = useState<EmergencyContact>({
  fullName: "",
  relationship: "",
  phoneNumber: "",

});
const [contactFormTouched, setContactFormTouched] = useState<Partial<Record<keyof EmergencyContact, boolean>>>({});

const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setContactForm((prev) => ({ ...prev, [name]: value }));
  setContactFormTouched((prev) => ({ ...prev, [name]: true }));
};

const handleAddContact = () => {
  setContactForm({ fullName: "", relationship: "", phoneNumber: "" });
  setContactFormTouched({});
  setEditingContactIndex(null);
  setShowContactModal(true);
};

const handleEditEmergencyContact = (index: number) => {
  setContactForm(emergencyContacts[index]);
  setContactFormTouched({});
  setEditingContactIndex(index);
  setShowContactModal(true);
};

const handleDeleteEmergencyContact = async (id: string | null | undefined) => {
  if (!id) return;
  if(window.confirm("Bạn có chắc chắn muốn xóa liên hệ khẩn cấp này?")) {
    await employeeService.removeEmergencyContact(id);
    if (profile && profile.id) {
      const data = await employeeService.getEmergencyContacts(profile.id);
      if (Array.isArray(data)) {
        setEmergencyContacts(
          data.map((item) => ({
            id: item.id || null,
            fullName: item.full_name || "",
            relationship: item.relationship || "",
            phoneNumber: item.phone || "",
          }))
        );
      }
    
    } 
  }
};

const handleContactSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const errors: Partial<EmergencyContact> = {};
  if (!contactForm.fullName) errors.fullName = "Vui lòng nhập họ và tên";
  else if (contactForm.fullName.length > 50) errors.fullName = "Tối đa 50 ký tự";
  if (!contactForm.relationship) errors.relationship = "Vui lòng nhập mối quan hệ";
  if (!contactForm.phoneNumber) errors.phoneNumber = "Vui lòng nhập SĐT";
  setContactFormTouched({ fullName: true, relationship: true, phoneNumber: true });
  if (Object.keys(errors).length > 0) return;

  // Chuẩn bị data gửi API
  const apiData = [{
    id: contactForm.id ?? null,
    employee_id: profile?.id || "",
    full_name: contactForm.fullName,
    relationship: contactForm.relationship,
    phone: contactForm.phoneNumber,
  }];
  await employeeService.upsertEmergencyContacts(apiData);

  // Lấy lại danh sách từ API
  if (profile && profile.id) {
    const data = await employeeService.getEmergencyContacts(profile.id);
    if (Array.isArray(data)) {
      setEmergencyContacts(
        data.map((item) => ({
          id: item.id || null,
          fullName: item.full_name || "",
          relationship: item.relationship || "",
          phoneNumber: item.phone || "",
        }))
      );
    }
  }

  setShowContactModal(false);
  setEditingContactIndex(null);
};

// Certificate state
type Certificate = {
  id?: string | null;
  name: string;
  grade: string;
  specialization: string;
  issueDate: string;
  expiryDate: string;
};
const [certificates, setCertificates] = useState<Certificate[]>([]);
useEffect(() => {
  if (profile && profile.id) {
    employeeService.getCertificates(profile.id).then((data) => {
      if (Array.isArray(data)) {
        setCertificates(
          data.map((item) => ({
            id: item.id || null,
            name: item.certificate_name || "",
            grade: item.classification || "",
            specialization: item.major || "",
            issueDate: item.issue_date ? dayjs(item.issue_date).format("YYYY-MM-DD") : "",
            expiryDate: item.expiry_date ? dayjs(item.expiry_date).format("YYYY-MM-DD") : "",
          }))
        );
      }
    });
  }
}, [profile]);
const [showCertModal, setShowCertModal] = useState(false);
const [editingCertIndex, setEditingCertIndex] = useState<number | null>(null);
const [certForm, setCertForm] = useState<Certificate>({
  name: "",
  grade: "",
  specialization: "",
  issueDate: "",
  expiryDate: "",
});
const [certFormTouched, setCertFormTouched] = useState<Partial<Record<keyof Certificate, boolean>>>({});

const handleCertInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  setCertForm((prev) => ({ ...prev, [name]: value }));
  setCertFormTouched((prev) => ({ ...prev, [name]: true }));
};

const handleAddCert = () => {
  setCertForm({ name: "", grade: "", specialization: "", issueDate: "", expiryDate: "" });
  setCertFormTouched({});
  setEditingCertIndex(null);
  setShowCertModal(true);
};

const handleEditCert = (index: number) => {
  setCertForm(certificates[index]);
  setCertFormTouched({});
  setEditingCertIndex(index);
  setShowCertModal(true);
};



const handleCertSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const errors: Partial<Certificate> = {};
  if (!certForm.name) errors.name = "Vui lòng nhập tên bằng/chứng chỉ";
  else if (certForm.name.length > 100) errors.name = "Tối đa 100 ký tự";
  if (!certForm.grade) errors.grade = "Vui lòng nhập xếp loại/thang điểm";
  if (!certForm.specialization) errors.specialization = "Vui lòng nhập chuyên ngành";
  if (!certForm.issueDate) errors.issueDate = "Vui lòng nhập ngày cấp";
  setCertFormTouched({ name: true, grade: true, specialization: true, issueDate: true, expiryDate: true });
  if (Object.keys(errors).length > 0) return;

  const apiData = [{
    id: certForm.id ?? null,
    employee_id: profile?.id || "",
    certificate_name: certForm.name,
    classification: certForm.grade,
    major: certForm.specialization,
    issue_date: certForm.issueDate ? dayjs(certForm.issueDate).toISOString() : null,
    expiry_date: certForm.expiryDate ? dayjs(certForm.expiryDate).toISOString() : null,
  }];
  await employeeService.upsertCertificates(apiData);

  // Gọi lại API để lấy danh sách mới
  if (profile && profile.id) {
    const data = await employeeService.getCertificates(profile.id);
    if (Array.isArray(data)) {
      setCertificates(
        data.map((item) => ({
          id: item.id || null,
          name: item.certificate_name || "",
          grade: item.classification || "",
          specialization: item.major || "",
          issueDate: item.issue_date ? dayjs(item.issue_date).format("YYYY-MM-DD") : "",
          expiryDate: item.expiry_date ? dayjs(item.expiry_date).format("YYYY-MM-DD") : "",
        }))
      );
    }
  }

  setShowCertModal(false);
  setEditingCertIndex(null);
};

// Family member state
  type FamilyMember = {
    id?: string | null;
    fullName: string;
    birthDate: string;
    relationship: string;
    gender: string;
  }
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  // Fetch relatives from API and map to familyMembers
  useEffect(() => {
    if (profile && profile.id) {
      employeeService.getRelatives(profile.id).then((data) => {
        if (Array.isArray(data)) {
          setFamilyMembers(
            data.map((item) => ({
              id: item.id || null,
              fullName: item.full_name || "",
              birthDate: item.birth_date || "",
              relationship: item.relationship || "",
              gender: item.gender || "",
            }))
          );
        }
      });
    }
  }, [profile]);
  const [showFamilyModal, setShowFamilyModal] = useState(false)
  const [familyForm, setFamilyForm] = useState<FamilyMember>({
  fullName: "",
  birthDate: "",
  relationship: "",
  gender: "",
  })
  const [familyFormTouched, setFamilyFormTouched] = useState<Partial<Record<keyof FamilyMember, boolean>>>({})
  // ...existing code...
  const [editingFamilyIndex, setEditingFamilyIndex] = useState<number | null>(null);
// ...existing code...
  useEffect(() => {
    if (familyForm.birthDate) {
      const [year, month, day] = familyForm.birthDate.split("-")
      const dob = new Date(Number(year), Number(month) - 1, Number(day))
      const today = new Date()
      let age = today.getFullYear() - dob.getFullYear()
      const m = today.getMonth() - dob.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--
      }
      setFamilyForm((prev) => ({ ...prev, age: age > 0 ? String(age) : "" }))
    } else {
      setFamilyForm((prev) => ({ ...prev, age: "" }))
    }
  }, [familyForm.birthDate])

  const handleFamilyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    // Đảm bảo is_emergency là số
    if (name === "is_emergency") {
      setFamilyForm((prev) => ({ ...prev, [name]: value === "True" ? 1 : 0 }));
    } else {
      setFamilyForm((prev) => ({ ...prev, [name]: value }));
    }
    setFamilyFormTouched((prev) => ({ ...prev, [name]: true }))
  }

  const handleAddFamily = () => {
  setFamilyForm({ id: null, fullName: "", birthDate: "", relationship: "", gender: "" })
    setFamilyFormTouched({})
    setEditingFamilyIndex(null);
    setShowFamilyModal(true)
  }

  const handleEditFamily = (idx: number) => {
    setFamilyForm({ ...familyMembers[idx] });
    setFamilyFormTouched({});
    setEditingFamilyIndex(idx);
    setShowFamilyModal(true);
  };

  const handleDeleteFamily = async (id: string | null | undefined) => {
  if (!id) return;
  if (window.confirm("Bạn có chắc chắn muốn xóa thành viên này?")) {
    await employeeService.removeRelative(id);
    // Lấy lại danh sách mới
    if (profile && profile.id) {
      const data = await employeeService.getRelatives(profile.id);
      if (Array.isArray(data)) {
        setFamilyMembers(
          data.map((item) => ({
            id: item.id || null,
            fullName: item.full_name || "",
            birthDate: item.birth_date || "",
            relationship: item.relationship || "",
            gender: item.gender || "",
          }))
        );
      }
    }
  }
};

  const handleFamilySubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const errors: Partial<FamilyMember> = {};
  if (!familyForm.fullName) errors.fullName = "Vui lòng nhập họ và tên";
  else if (familyForm.fullName.length > 50) errors.fullName = "Tối đa 50 ký tự";
  if (!familyForm.relationship) errors.relationship = "Vui lòng chọn mối quan hệ";
  setFamilyFormTouched({ fullName: true, birthDate: true, relationship: true, gender: true });
  if (Object.keys(errors).length > 0) return;

  const birthDateISO = familyForm.birthDate ? dayjs(familyForm.birthDate).toISOString() : "";

  const apiData = [{
    id: familyForm.id ?? null,
    employee_id: profile?.id || "",
    full_name: familyForm.fullName,
    birth_date: birthDateISO,
    relationship: familyForm.relationship,
    gender: familyForm.gender,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }];
  await employeeService.upsertRelatives(apiData);

  // Gọi lại API để lấy danh sách mới
  if (profile && profile.id) {
    const data = await employeeService.getRelatives(profile.id);
    if (Array.isArray(data)) {
      setFamilyMembers(
        data.map((item) => ({
          id: item.id || null,
          fullName: item.full_name || "",
          birthDate: item.birth_date || "",
          relationship: item.relationship || "",
          gender: item.gender || "",
        }))
      );
    }
  }

  setShowFamilyModal(false);
  setEditingFamilyIndex(null);
};

  return (
  
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">1. Thông tin cá nhân cơ bản</h2>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Họ và tên */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Họ và tên<span className="text-red-500">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Ngày sinh */}
          <div className="space-y-2">
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
              Ngày sinh<span className="text-red-500">*</span>
            </label>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Giới tính */}
          <div className="space-y-2">
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
              Giới tính<span className="text-red-500">*</span>
            </label>
            <select
              id="gender"
              value={gender}
              onChange={e => setGender(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Chọn --</option>
              <option value="M">Nam</option>
              <option value="F">Nữ</option>
              <option value="O">Khác</option>
            </select>
          </div>

          {/* Tuổi */}
          <div className="space-y-2">
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">
              Tuổi<span className="text-red-500">*</span>
            </label>
            <input
              id="age"
              type="number"
              value={birthDate ? dayjs().diff(dayjs(birthDate), 'year') : ''}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
            />
          </div>

          {/* Nơi sinh */}
          <div className="space-y-2">
            <label htmlFor="birthPlace" className="block text-sm font-medium text-gray-700">
              Nơi sinh<span className="text-red-500">*</span>
            </label>
            <input
              id="birthPlace"
              type="text"
              value={birthPlace}
              onChange={e => setBirthPlace(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Quê quán */}
          <div className="space-y-2">
            <label htmlFor="hometown" className="block text-sm font-medium text-gray-700">
              Quê quán<span className="text-red-500">*</span>
            </label>
            <input
              id="hometown"
              type="text"
              value={homeTown}
              onChange={e => setHomeTown(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Số CCCD/CMND */}
          <div className="space-y-2">
            <label htmlFor="citizenIdNumber" className="block text-sm font-medium text-gray-700">
              Số CCCD/CMND<span className="text-red-500">*</span>
            </label>
            <input
              id="citizenIdNumber"
              type="text"
              value={citizenIdNumber}
              onChange={e => setCitizenIdNumber(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Ngày cấp */}
          <div className="space-y-2">
            <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700">
              Ngày cấp<span className="text-red-500">*</span>
            </label>
            <input
              id="issueDate"
              type="date"
              value={issueDate}
              onChange={e => setIssueDate(e.target.value)}
              lang="vi"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Nơi cấp - full width */}
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="issuePlace" className="block text-sm font-medium text-gray-700">
              Nơi cấp<span className="text-red-500">*</span>
            </label>
            <input
              id="issuePlace"
              type="text"
              value={issuePlace}
              onChange={e => setIssuePlace(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Dân tộc và Tôn giáo - same row */}
          <div className="space-y-2">
            <label htmlFor="ethnicity" className="block text-sm font-medium text-gray-700">
              Dân tộc<span className="text-red-500">*</span>
            </label>
            <input
              id="ethnicity"
              type="text"
              value={ethnicity}
              onChange={e => setEthnicity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="religion" className="block text-sm font-medium text-gray-700">
              Tôn giáo<span className="text-red-500">*</span>
            </label>
            <input
                id="religion"
                type="text"
                value={religion}
                onChange={e => setReligion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Địa chỉ thường trú và tạm trú */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="permanentAddress" className="block text-sm font-medium text-gray-700">
              Địa chỉ thường trú<span className="text-red-500">*</span>
            </label>
            <input
              id="permanentAddress"
              type="text"
              value={permanentAddress}
              onChange={e => setPermanentAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            
          </div>

          <div className="space-y-2">
            <label htmlFor="temporaryAddress" className="block text-sm font-medium text-gray-700">
              Địa chỉ tạm trú
            </label>
            <input
              id="temporaryAddress"
              type="text"
              value={temporaryAddress}
              onChange={e => setTemporaryAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Tình trạng hôn nhân và Thành phần gia đình */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tình trạng hôn nhân */}
          <div className="space-y-2">
            <label htmlFor="maritalStatus" className="block text-sm font-medium text-gray-700">
              Tình trạng hôn nhân*
            </label>
            <select
              id="maritalStatus"
              value={maritalStatus}
              onChange={e => setMaritalStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Chọn --</option>
              <option value="Single">Độc thân</option>
              <option value="Married">Đã kết hôn</option>
              <option value="Divorced">Ly hôn</option>
              <option value="Widowed">Goá</option>
            </select>
          </div>

          <div className="space-y-2">

            <label className="block text-sm font-medium text-gray-700">
              Thành phần gia đình<span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              className="mb-2 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm font-medium"
              onClick={() => setShowFamilyTable((prev) => !prev)}
            >
              {showFamilyTable ? 'Ẩn chi tiết' : 'Chi tiết'}
            </button>
            {showFamilyTable && (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full border text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border px-2 py-1">Họ và tên</th>
                        <th className="border px-2 py-1">Ngày sinh</th>
                        <th className="border px-2 py-1">Mối quan hệ</th>
                        <th className="border px-2 py-1">Giới tính</th>
                        <th className="border px-2 py-1">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {familyMembers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="border px-2 py-1 text-center text-gray-400">Chưa có thành viên nào</td>
                        </tr>
                      ) : 
                        familyMembers.map((c, idx) => (
                          <tr key={c.id || idx}>
                            <td className="border px-2 py-1">{c.fullName}</td>
                            <td className="border px-2 py-1">{c.birthDate && dayjs(c.birthDate).format('DD/MM/YY')}</td>
                            <td className="border px-2 py-1">{c.relationship}</td>
                            <td className="border px-2 py-1">{c.gender}</td>
                            <td className="border px-2 py-1">
                              <button
                                type="button"
                                className="text-blue-600 underline text-xs"
                                onClick={() => handleEditFamily(idx)}
                              >
                                Sửa
                              </button>
                              <button
                                type="button"
                                className="text-red-600 underline text-xs"
                                onClick={() => handleDeleteFamily(c.id)}
                              >
                                Xóa
                              </button>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
                <button type="button" onClick={handleAddFamily} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  + Thêm thành phần gia đình
                </button>
              </>
            )}

            {/* Modal for adding family member */}
            {showFamilyModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                  <h3 className="text-lg font-semibold mb-4">{editingFamilyIndex !== null ? 'Sửa thành viên gia đình' : 'Thêm thành viên gia đình'}</h3>
                  <form onSubmit={handleFamilySubmit}>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Họ và tên<span className="text-red-500">*</span></label>
                      <input
                        name="fullName"
                        type="text"
                        maxLength={50}
                        value={familyForm.fullName}
                        onChange={handleFamilyInputChange}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                      />
                      {familyFormTouched.fullName && familyForm.fullName.length > 50 && (
                        <div className="text-xs text-red-500">Tối đa 50 ký tự</div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Ngày sinh<span className="text-red-500"></span></label>
                      <input
                        name="birthDate"
                        type="date"
                        value={familyForm.birthDate}
                        onChange={handleFamilyInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${familyFormTouched.birthDate && !familyForm.birthDate ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Mối quan hệ<span className="text-red-500"></span></label>
                      <input
                        name="relationship"
                        type="text"
                        maxLength={50}
                        value={familyForm.relationship}
                        onChange={handleFamilyInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${familyFormTouched.relationship && (!familyForm.relationship || familyForm.relationship.length > 50) ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Giới tính<span className="text-red-500"></span></label>
                      <select
                        name="gender"
                        value={familyForm.gender}
                        onChange={handleFamilyInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        familyFormTouched.gender &&
                        (familyForm.gender === undefined || familyForm.gender === null)
                         ? "border-red-500"
                         : "border-gray-300"
                        }`}
                        >
                         <option value="">-- Chọn --</option>
                        <option value="Male">Nam</option>
                         <option value="Female">Nữ</option>
                     </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button type="button" onClick={() => setShowFamilyModal(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Hủy</button>
                      <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Lưu</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>


        {/* Thông tin liên hệ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="personalPhone" className="block text-sm font-medium text-gray-700">
              Số điện thoại cá nhân*
            </label>
            <input
              id="personalPhone"
              type="text"
              value={personalPhone}
              onChange={e => setPersonalPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Email cá nhân */}
          <div className="space-y-2">
            <label htmlFor="personalEmail" className="block text-sm font-medium text-gray-700">
              Email cá nhân*
            </label>
            <input
              id="personalEmail"
              type="email"
              value={personalEmail}
              onChange={e => setPersonalEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Số điện thoại công ty */}
          <div className="space-y-2">
            <label htmlFor="companyPhone" className="block text-sm font-medium text-gray-700">
              Số điện thoại công ty
            </label>
            <input
              id="companyPhone"
              type="text"
              value={companyPhone}
              onChange={e => setCompanyPhone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Email công ty */}
          <div className="space-y-2">
            <label htmlFor="companyEmail" className="block text-sm font-medium text-gray-700">
              Email công ty
            </label>
            <input
              id="companyEmail"
              type="email"
              value={companyEmail}
              onChange={e => setCompanyEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Trạng thái và các ngày tháng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trạng thái */}
          <div className="space-y-2">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Trạng thái
            </label>
            <select
              id="status"
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Chọn --</option>
              <option value="Active">Đang làm việc</option>
              <option value="Inactive">Nghỉ việc</option>
            </select>
          </div>

          {/* Ngày vào công ty */}
          <div className="space-y-2">
            <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700">
              Ngày vào công ty
            </label>
            <input
              id="joinDate"
              type="date"
              value={joinDate}
              onChange={e => setJoinDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="leaveDate" className="block text-sm font-medium text-gray-700">
              Ngày nghỉ
            </label>
            <input
              id="leaveDate"
              type="date"
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Thông tin người liên hệ khẩn cấp<span className="text-red-500">*</span>
            </label>
            {/* Table of contacts */}
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Họ và tên</th>
                    <th className="border px-2 py-1">Mối quan hệ</th>
                    <th className="border px-2 py-1">SĐT</th>
                
                  </tr>
                </thead>
                <tbody>
                 {emergencyContacts.length === 0 ? (
                 <tr>
                  <td colSpan={4} className="border px-2 py-1 text-center text-gray-400">Chưa có liên hệ nào</td>
                 </tr>
                 ) : (
                emergencyContacts.map((c, idx) => (
                <tr key={idx}>
                 <td className="border px-2 py-1">{c.fullName}</td>
                 <td className="border px-2 py-1">{c.relationship}</td>
                 <td className="border px-2 py-1">{c.phoneNumber}</td>
                 <td className="border px-2 py-1">
                 <button
                  type="button"
                  className="text-blue-600 underline text-xs"
                  onClick={() => handleEditEmergencyContact(idx)}
                 >
                  Sửa
                 </button>
                 <button
                  type="button"
                  className="text-red-600 underline text-xs"
                  onClick={() => handleDeleteEmergencyContact(c.id)}
                 >
                  Xóa
                 </button>
                 </td>
                 </tr>
                 ))
               )}
              </tbody>
              </table>
            </div>
            <button type="button" onClick={handleAddContact} className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              + Thêm liên hệ
            </button>

            {/* Modal for adding contact */}
            {showContactModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                  <h3 className="text-lg font-semibold mb-4">{editingContactIndex !== null ? 'Sửa liên hệ khẩn cấp' : 'Thêm liên hệ khẩn cấp'}</h3>
                  
                  <form onSubmit={handleContactSubmit}>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Họ và tên<span className="text-red-500">*</span></label>
                      <input
                        name="fullName"
                        type="text"
                        maxLength={50}
                        value={contactForm.fullName}
                        onChange={handleContactInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${contactFormTouched.fullName && (!contactForm.fullName || contactForm.fullName.length > 50) ? 'border-red-500' : 'border-gray-300'}`}
                        required
                      />
                      {contactFormTouched.fullName && contactForm.fullName.length > 50 && (
                        <div className="text-xs text-red-500">Tối đa 50 ký tự</div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Mối quan hệ<span className="text-red-500">*</span></label>
                      <input
                        name="relationship"
                        type="text"
                        maxLength={50}
                        value={contactForm.relationship}
                        onChange={handleContactInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${contactFormTouched.relationship && (!contactForm.relationship || contactForm.relationship.length > 50) ? 'border-red-500' : 'border-gray-300'}`}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">SĐT<span className="text-red-500">*</span></label>
                      <input
                        name="phoneNumber"
                        type="text"
                        maxLength={50}
                        value={contactForm.phoneNumber}
                        onChange={handleContactInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${contactFormTouched.phoneNumber && (!contactForm.phoneNumber || contactForm.phoneNumber.length > 50) ? 'border-red-500' : 'border-gray-300'}`}
                        required
                      />
                      {contactFormTouched.phoneNumber && contactForm.phoneNumber.length > 50 && (
                        <div className="text-xs text-red-500">Tối đa 50 ký tự</div>
                      )}
                    </div>
               
                    <div className="flex justify-end gap-2 mt-4">
                      <button type="button" onClick={() => setShowContactModal(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Hủy</button>
                      <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Lưu</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">2. Thông tin học vấn chuyên môn</h2>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Trình độ học vấn cao nhất */}
          <div className="space-y-2">
            <label htmlFor="highestEducation" className="block text-sm font-medium text-gray-700">
              Trình độ học vấn cao nhất<span className="text-red-500">*</span>
            </label>
            <input
              id="highestEducation"
              type="text"
              value={highestDegree}
              onChange={e => setHighestDegree(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Chuyên ngành đào tạo */}
          <div className="space-y-2">
            <label htmlFor="major" className="block text-sm font-medium text-gray-700">
              Chuyên ngành đào tạo<span className="text-red-500">*</span>
            </label>
            <input
              id="major"
              type="text"
              value={major}
              onChange={e => setMajor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Trường học */}
          <div className="space-y-2">
            <label htmlFor="school" className="block text-sm font-medium text-gray-700">
              Trường học<span className="text-red-500">*</span>
            </label>
            <input
              id="school"
              type="text"
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Năm tốt nghiệp */}
          <div className="space-y-2">
            <label htmlFor="graduationYear" className="block text-sm font-medium text-gray-700">
              Năm tốt nghiệp<span className="text-red-500">*</span>
            </label>
            <input
              id="graduationYear"
              type="text"
              value={graduationYear}
              onChange={e => setGraduationYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Bằng cấp/chứng chỉ liên quan khác */}
          <div className="space-y-2 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Các bằng cấp chứng chỉ liên quan khác<span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddCert}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                + Thêm mới
              </button>
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded text-sm font-medium"
                onClick={() => setShowCertTable((prev) => !prev)}
              >
                {showCertTable ? "Ẩn chi tiết" : "Chi tiết"}
              </button>
            </div>
            {/* Bảng danh sách bằng cấp/chứng chỉ */}
            {showCertTable && (
              <div className="overflow-x-auto mt-4">
                <table className="min-w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border px-2 py-1">Tên bằng/chứng chỉ</th>
                      <th className="border px-2 py-1">Xếp loại/Thang điểm</th>
                      <th className="border px-2 py-1">Chuyên ngành</th>
                      <th className="border px-2 py-1">Ngày cấp</th>
                      <th className="border px-2 py-1">Ngày hết hạn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="border px-2 py-1 text-center text-gray-400">
                          Chưa có bằng/chứng chỉ nào
                        </td>
                      </tr>
                    ) : (
                      certificates.map((c, idx) => (
                        <tr key={idx}>
                          <td className="border px-2 py-1">{c.name}</td>
                          <td className="border px-2 py-1">{c.grade}</td>
                          <td className="border px-2 py-1">{c.specialization}</td>
                          <td className="border px-2 py-1">{c.issueDate && dayjs(c.issueDate).format("DD/MM/YY")}</td>
                          <td className="border px-2 py-1">{c.expiryDate && dayjs(c.expiryDate).format("DD/MM/YY")}</td>
                          <td className="border px-2 py-1">
                              <button
                                type="button"
                                className="text-blue-600 underline text-xs"
                                onClick={() => handleEditCert(idx)}
                              >
                                Sửa
                              </button>
                            </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {/* Modal thêm bằng/chứng chỉ */}
            {showCertModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                  <h3 className="text-lg font-semibold mb-4">{editingCertIndex !== null ? 'Sửa bằng/chứng chỉ' : 'Thêm bằng/chứng chỉ'}</h3>
                  <form onSubmit={handleCertSubmit}>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Tên bằng/chứng chỉ<span className="text-red-500">*</span></label>
                      <input
                        name="name"
                        type="text"
                        maxLength={10}
                        value={certForm.name}
                        onChange={handleCertInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${certFormTouched.name && (!certForm.name || certForm.name.length > 10) ? 'border-red-500' : 'border-gray-300'}`}
                        required
                      />
                      {certFormTouched.name && certForm.name.length > 10 && (
                        <div className="text-xs text-red-500">Tối đa 10 ký tự</div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Xếp loại/Thang điểm<span className="text-red-500">*</span></label>
                      <input
                        name="grade"
                        type="text"
                        maxLength={20}
                        value={certForm.grade}
                        onChange={handleCertInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${certFormTouched.grade && (!certForm.grade || certForm.grade.length > 20) ? 'border-red-500' : 'border-gray-300'}`}
                        required
                      />
                      {certFormTouched.grade && certForm.grade.length > 20 && (
                        <div className="text-xs text-red-500">Tối đa 20 ký tự</div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Chuyên ngành<span className="text-red-500">*</span></label>
                      <input
                        name="specialization"
                        type="text"
                        maxLength={100}
                        value={certForm.specialization}
                        onChange={handleCertInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${certFormTouched.specialization && (!certForm.specialization || certForm.specialization.length > 100) ? 'border-red-500' : 'border-gray-300'}`}
                        required
                      />
                      {certFormTouched.specialization && certForm.specialization.length > 100 && (
                        <div className="text-xs text-red-500">Tối đa 100 ký tự</div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Ngày cấp<span className="text-red-500">*</span></label>
                      <input
                        name="issueDate"
                        type="date"
                        value={certForm.issueDate}
                        onChange={handleCertInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${certFormTouched.issueDate && !certForm.issueDate ? 'border-red-500' : 'border-gray-300'}`}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Ngày hết hạn<span className="text-red-500">*</span></label>
                      <input
                        name="expiryDate"
                        type="date"
                        value={certForm.expiryDate}
                        onChange={handleCertInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${certFormTouched.expiryDate && !certForm.expiryDate ? 'border-red-500' : 'border-gray-300'}`}
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button type="button" onClick={() => setShowCertModal(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Hủy</button>
                      <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Lưu</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
          {/* Kỹ năng đặc biệ - full width */}
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="specialSkill" className="block text-sm font-medium text-gray-700">
              Kỹ năng đặc biệt:<span className="text-red-500"></span>
            </label>
            <input
              id="specialSkill"
              type="text"
              value={specialSkills}
              onChange={e => setSpecialSkills(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">3. Thông tin công việc</h2>
      </div>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Mã nhân viên<span className="text-red-500">*</span></label>
            <input 
            id="employeeCode"
            type="text" 
            value={attendanceCode}
            onChange={e => setAttendanceCode(e.target.value)}

            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Chức danh/vị trí công tác<span className="text-red-500">*</span></label>
            <FilterSelect
            id="position"
            value={positionTitle}
            options={getOptions("POSITION")}
            onChange={setPositionTitle}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Phòng/Bộ phận<span className="text-red-500">*</span></label>
            <FilterSelect
            id="department"
            value={departmentName}
            options={getOptions("DEPARTMENT")}
            onChange={setDepartmentName}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Cấp bậc<span className="text-red-500">*</span></label>
            <input 
            id="level"
            type="text" maxLength={20} value={rank}
            onChange={e => setRank(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Địa điểm làm việc<span className="text-red-500">*</span></label>
            <FilterSelect
            id="workLocation"
            value={workLocation}
            options={getOptions("WORK_LOCATION")}
            onChange={setWorkLocation}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu làm việc<span className="text-red-500">*</span></label>
            <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
             {/* Ngày làm việc chính thức */}
          <div className="space-y-2">
            <label htmlFor="officialDate" className="block text-sm font-medium text-gray-700">
              Ngày làm việc chính thức
            </label>
            <input
              id="officialDate"
              type="date"
              value={officialDate}
              onChange={e => setOfficialDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Loại hợp đồng lao động<span className="text-red-500">*</span></label>
            <FilterSelect
            id="contractType"
            value={contractType}
            options={getOptions("EMPLOYEE_CONTRACT")}
            onChange={setContractType}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Thời hạn hợp đồng (tháng)<span className="text-red-500">*</span></label>
            <input type="number" min={1} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>
        </div>
        {/* Mức lương */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Mức lương<span className="text-red-500">*</span></label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={handleAddSalary}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              + Thêm mới
            </button>
            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded text-sm font-medium"
              onClick={() => setShowSalaryTable((prev) => !prev)}
            >
              {showSalaryTable ? "Ẩn chi tiết" : "Chi tiết"}
            </button>
          </div>
          {showSalaryTable && (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1">Nội dung/loại lương</th>
                    <th className="border px-2 py-1">Số tiền(cũ)</th>
                    <th className="border px-2 py-1">Số tiền(mới)</th>
                    <th className="border px-2 py-1">Thời gian</th>

                  </tr>
                </thead>
                <tbody>
                  {salaries.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="border px-2 py-1 text-center text-gray-400">Chưa có mức lương nào</td>
                    </tr>
                  ) : (
                    salaries.map((s, idx) => (
                      <tr key={idx}>
                        <td className="border px-2 py-1">{s.type}</td>
                        <td className="border px-2 py-1">{s.amount_old}</td>
                        <td className="border px-2 py-1">{s.amount_new}</td>
                        <td className="border px-2 py-1">{s.start_date && dayjs(s.start_date).format('DD/MM/YY')}</td>
                        <td className="border px-2 py-1">
                          <button type="button" onClick={() => handleEditSalary(idx)} className="text-blue-600 hover:underline">Sửa</button>
                          <button type="button" onClick={() => handleDeleteSalary(s.id)} className="text-red-600 hover:underline ml-2">Xóa</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
          {showSalaryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                <h3 className="text-lg font-semibold mb-4">{editingSalaryIndex !== null ? 'Sửa mức lương' : 'Thêm mức lương'}</h3>
                <form onSubmit={handleSalarySubmit}>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Nội dung/loại lương<span className="text-red-500">*</span></label>
                    <select
                      value={salaryTypeOther ? OTHER_VALUE : salaryForm.type}
                      onChange={e => handleSalaryTypeSelect(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${salaryFormTouched.type && !salaryTypeOther && !salaryForm.type ? 'border-red-500' : 'border-gray-300'}`}
                      required
                    >
                      <option value="">--Chọn--</option>
                      {salaryOptions.map(o => (
                        <option key={`${o.filter}-${o.value}`} value={o.value === OTHER_VALUE ? OTHER_VALUE : o.label}>{o.label}</option>
                      ))}
                    </select>
                    {salaryTypeOther && (
                      <input name="type" type="text" maxLength={50} value={salaryForm.type} onChange={handleSalaryInputChange} placeholder="Nhập loại lương" className={`w-full mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${salaryFormTouched.type && (!salaryForm.type || salaryForm.type.length > 50) ? 'border-red-500' : 'border-gray-300'}`} required />
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Số tiền(cũ)<span className="text-red-500">*</span></label>
                    <input name="amount_old" type="number" value={salaryForm.amount_old} onChange={handleSalaryInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${salaryFormTouched.amount_old && !salaryForm.amount_old ? 'border-red-500' : 'border-gray-300'}`} required min={0} />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Số tiền(mới)<span className="text-red-500">*</span></label>
                    <input name="amount_new" type="number" value={salaryForm.amount_new} onChange={handleSalaryInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${salaryFormTouched.amount_new && !salaryForm.amount_new ? 'border-red-500' : 'border-gray-300'}`} required min={0} />
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Thời gian<span className="text-red-500">*</span></label>
                    <input name="start_date" type="date" value={salaryForm.start_date} onChange={handleSalaryInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${salaryFormTouched.start_date && !salaryForm.start_date ? 'border-red-500' : 'border-gray-300'}`} required />
                  </div>
                
                  <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={() => setShowSalaryModal(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Hủy</button>
                    <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Lưu</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
        {/* Lương phụ cấp */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Lương phụ cấp<span className="text-red-500">*</span></label>
          <button type="button" onClick={handleAddAllowance} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium mb-2">+ Thêm mới</button>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 py-1">Nội dung/loại phụ cấp</th>
                  <th className="border px-2 py-1">Số tiền</th>
                  <th className="border px-2 py-1">Loại tiền</th>
                  <th className="border px-2 py-1">Thời gian</th>
                  <th className="border px-2 py-1">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {allowances.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="border px-2 py-1 text-center text-gray-400">Chưa có phụ cấp nào</td>
                  </tr>
                ) : (
                  allowances.map((a, idx) => (
                    <tr key={idx}>
                      <td className="border px-2 py-1">{a.content}</td>
                      <td className="border px-2 py-1">{a.amount}</td>
                      <td className="border px-2 py-1">{a.currency}</td>
                      <td className="border px-2 py-1">{a.date && dayjs(a.date).format('DD/MM/YY')}</td>
                      <td className="border px-2 py-1">
                        <button type="button" onClick={() => handleEditAllowance(idx)} className="text-blue-600 hover:underline">Sửa</button>
                        <button type="button" onClick={() => handleDeleteAllowance(a.id)} className="text-red-600 hover:underline ml-2">Xóa</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {showAllowanceModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
                <h3 className="text-lg font-semibold mb-4">{editingAllowanceIndex !== null ? 'Sửa lương phụ cấp' : 'Thêm lương phụ cấp'}</h3>
                <form onSubmit={handleAllowanceSubmit}>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Nội dung/loại phụ cấp<span className="text-red-500">*</span></label>
                    <select
                      value={allowanceContentOther ? OTHER_VALUE : allowanceForm.content}
                      onChange={e => handleAllowanceContentSelect(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${allowanceFormTouched.content && !allowanceContentOther && !allowanceForm.content ? 'border-red-500' : 'border-gray-300'}`}
                      required
                    >
                      <option value="">--Chọn--</option>
                      {allowanceOptions.map(o => (
                        <option key={`${o.filter}-${o.value}`} value={o.value === OTHER_VALUE ? OTHER_VALUE : o.label}>{o.label}</option>
                      ))}
                    </select>
                    {allowanceContentOther && (
                      <input name="content" type="text" maxLength={50} value={allowanceForm.content} onChange={handleAllowanceInputChange} placeholder="Nhập loại phụ cấp" className={`w-full mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${allowanceFormTouched.content && (!allowanceForm.content || allowanceForm.content.length > 50) ? 'border-red-500' : 'border-gray-300'}`} required />
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Số tiền<span className="text-red-500">*</span></label>
                    <input name="amount" type="number" value={allowanceForm.amount} onChange={handleAllowanceInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${allowanceFormTouched.amount && !allowanceForm.amount ? 'border-red-500' : 'border-gray-300'}`} required min={0} />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Loại tiền<span className="text-red-500">*</span></label>
                    <select name="currency" value={allowanceForm.currency} onChange={handleAllowanceInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${allowanceFormTouched.currency && !allowanceForm.currency ? 'border-red-500' : 'border-gray-300'}`} required>
                      <option value="VND">VND</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Thời gian<span className="text-red-500">*</span></label>
                    <input name="date" type="date" value={allowanceForm.date} onChange={handleAllowanceInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${allowanceFormTouched.date && !allowanceForm.date ? 'border-red-500' : 'border-gray-300'}`} required />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={() => setShowAllowanceModal(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Hủy</button>
                    <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Lưu</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
        {/* Người quản lý trực tiếp và trưởng phòng */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
         
          <div className="space-y-2">
            <label htmlFor="leader" className="block text-sm font-medium text-gray-700">
              Người quản lý trực tiếp
            </label>
            <input
              id="leader"
              type="text"
              value={leader}
              onChange={e => setLeader(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Trưởng phòng */}
          <div className="space-y-2">
            <label htmlFor="managerId" className="block text-sm font-medium text-gray-700">
              Trưởng phòng
            </label>
            <input
              id="managerId"
              type="text"
              value={managerId}
              onChange={e => setManagerId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      {/* ...existing code... */}
  {/* ...existing code... */}
  <section className="mt-8">
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800">4. Thông tin pháp lý và bảo hiểm</h2>
    </div>
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
        {/* Số sổ BHXH */}
          <div className="space-y-2">
            <label htmlFor="socialInsuranceNo" className="block text-sm font-medium text-gray-700">
              Số sổ BHXH*
            </label>
            <input
              id="socialInsuranceNo"
              type="text"
              value={socialInsuranceNo}
              onChange={e => setSocialInsuranceNo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        {/* Tình trạng bảo hiểm */}
          <div className="space-y-2">
            <label htmlFor="insuranceStatus" className="block text-sm font-medium text-gray-700">
              Tình trạng bảo hiểm
            </label>
            <input
              id="insuranceStatus"
              type="text"
              value={insuranceStatus}
              onChange={e => setInsuranceStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Thời gian đóng BH (tháng)<span className="text-red-500">*</span></label>
          <input
            id="insuranceDate"
            type="date"
            value={insuranceDate}
            onChange={e => setInsuranceDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Mức đóng<span className="text-red-500">*</span></label>
          <div className="flex items-center">
            <input
              type="number"
              min={0}
              value={insuranceAmount}
              onChange={e => setInsuranceAmount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="ml-2">VND</span>
          </div>
        </div>

        {/* Nơi đăng ký KCB */}
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="kcbPlace" className="block text-sm font-medium text-gray-700">
              Nơi đăng ký KCB
            </label>
            <input
              id="kcbPlace"
              type="text"
              value={kcbPlace}
              onChange={e => setKcbPlace(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        {/* Bảo hiểm sức khỏe */}
          <div className="space-y-2">
            <label htmlFor="healthInsurance" className="block text-sm font-medium text-gray-700">
              Bảo hiểm sức khỏe
            </label>
            <input
              id="healthInsurance"
              type="text"
              value={healthInsurance}
              onChange={e => setHealthInsurance(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Hiệu lực bảo hiểm sức khỏe */}
          <div className="space-y-2">
            <label htmlFor="healthInsurExpire" className="block text-sm font-medium text-gray-700">
              Hiệu lực bảo hiểm sức khỏe
            </label>
            <input
              id="healthInsurExpire"
              type="date"
              value={healthInsurExpire}
              onChange={e => setHealthInsurExpire(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
      
        {/* Mã số thuế thu nhập cá nhân */}
          <div className="space-y-2">
            <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
              Mã số thuế thu nhập cá nhân
            </label>
            <input
              id="taxId"
              type="text"
              value={taxId}
              onChange={e => setTaxId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
      </div>
      {/* Thuế thu nhập của người phụ thuộc */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Thuế thu nhập của người phụ thuộc</label>
        <button type="button" onClick={handleAddDependent} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium mb-2">+ Thêm mới</button>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Họ tên</th>
                <th className="border px-2 py-1">Ngày sinh</th>
                <th className="border px-2 py-1">Số CCCD/Mã định danh</th>
                <th className="border px-2 py-1">Mối quan hệ</th>
                <th className="border px-2 py-1">Mã số thuế</th>
              </tr>
            </thead>
            <tbody>
              {dependents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border px-2 py-1 text-center text-gray-400">Chưa có người phụ thuộc nào</td>
                </tr>
              ) : (
                dependents.map((d, idx) => (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{d.fullName}</td>
                    <td className="border px-2 py-1">{d.birthDate && dayjs(d.birthDate).format('DD/MM/YY')}</td>
                    <td className="border px-2 py-1">{d.idNumber}</td>
                    <td className="border px-2 py-1">{d.relation}</td>
                    <td className="border px-2 py-1">{d.taxCode}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {showDependentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <h3 className="text-lg font-semibold mb-4">Thêm người phụ thuộc</h3>
              <form onSubmit={handleDependentSubmit}>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Họ tên<span className="text-red-500">*</span></label>
                  <input name="fullName" type="text" maxLength={20} value={dependentForm.fullName} onChange={handleDependentInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${dependentFormTouched.fullName && (!dependentForm.fullName || dependentForm.fullName.length > 20) ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Ngày sinh<span className="text-red-500">*</span></label>
                  <input name="birthDate" type="date" value={dependentForm.birthDate} onChange={handleDependentInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${dependentFormTouched.birthDate && !dependentForm.birthDate ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Số CCCD/Mã định danh<span className="text-red-500">*</span></label>
                  <input name="" type="text" value={dependentForm.idNumber} onChange={handleDependentInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${dependentFormTouched.idNumber && !dependentForm.idNumber ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Mối quan hệ<span className="text-red-500">*</span></label>
                  <input name="relation" type="text" maxLength={10} value={dependentForm.relation} onChange={handleDependentInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${dependentFormTouched.relation && (!dependentForm.relation || dependentForm.relation.length > 10) ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Mã số thuế người phụ thuộc<span className="text-red-500">*</span></label>
                  <input name="taxCode" type="text" maxLength={10} value={dependentForm.taxCode} onChange={handleDependentInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${dependentFormTouched.taxCode && (!dependentForm.taxCode || dependentForm.taxCode.length > 10) ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setShowDependentModal(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Hủy</button>
                  <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Lưu</button>
                </div>
              </form>
            </div>
          </div>
          
        )}
      </div>
      {/* Thông tin tài khoản ngân hàng */}
      <label className="block text-sm font-medium text-gray-700 mb-2">Thông tin tài khoản ngân hàng:</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Số tài khoản */}
          <div className="space-y-2">
            <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700">
              Số tài khoản
            </label>
            <input
              id="bankAccount"
              type="text"
              value={bankAccount || ''}
              onChange={e => setBankAccount(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Tên ngân hàng */}
          <div className="space-y-2">
            <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
              Tên ngân hàng
            </label>
            <input
              id="bankName"
              type="text"
              value={bankName || ''}
              onChange={e => setBankName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
      </div>
    </div>
  </section>
  {/* 5. Lịch sử công tác, lương, đánh giá, khen thưởng, kỷ luật */}
  <section className="mt-8">
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800">5. Lịch sử công tác & đánh giá</h2>
    </div>
    <div className="p-6 space-y-10">
      {/* 1. Lịch sử công tác/thăng tiến */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Quá trình công tác/thăng tiến</h3>
          <button type="button" onClick={handleAddWork} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">+ Thêm mới</button>
          <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded text-sm font-medium"
              onClick={() => setShowCareerTable((prev) => !prev)}
            >
              {showCareerTable ? "Ẩn chi tiết" : "Chi tiết"}
            </button>
        </div>
        {showCareerTable && (
          <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Vị trí công tác</th>
                <th className="border px-2 py-1">Phòng ban</th>
                <th className="border px-2 py-1">Thứ hạng</th>
                <th className="border px-2 py-1">Thời gian bắt đầu</th>
                <th className="border px-2 py-1">Thời gian kết thúc</th>
              </tr>
            </thead>
            <tbody>
              {workHistories.length === 0 ? (
                <tr><td colSpan={3} className="border px-2 py-1 text-center text-gray-400">Chưa có dữ liệu</td></tr>
              ) : workHistories.map((w, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{w.position}</td>
                  <td className="border px-2 py-1">{w.department}</td>
                  <td className="border px-2 py-1">{w.rank}</td>
                  <td className="border px-2 py-1">{w.start_date && dayjs(w.start_date).format('DD/MM/YY')}</td>
                  <td className="border px-2 py-1">{w.end_date && dayjs(w.end_date).format('DD/MM/YY')}</td>
                  <td className="border px-2 py-1">
                    <button type="button" onClick={() => handleEditWork(idx)} className="text-blue-600 hover:underline">Sửa</button>
                    <button type="button" onClick={() => handleDeleteWork(w.id)} className="text-red-600 hover:underline ml-2">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
        
        {showWorkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <h3 className="text-lg font-semibold mb-4">{editingWorkIndex !== null ? 'Chỉnh sửa quá trình công tác' : 'Thêm quá trình công tác'}</h3>
              <form onSubmit={handleWorkSubmit}>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Vị trí công tác<span className="text-red-500">*</span></label>
                  <input name="position" type="text" maxLength={20} value={workForm.position} onChange={handleWorkInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${workFormTouched.position && (!workForm.position || workForm.position.length > 20) ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Phòng ban<span className="text-red-500">*</span></label>
                  <input name="department" type="text" maxLength={20} value={workForm.department} onChange={handleWorkInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${workFormTouched.department && (!workForm.department || workForm.department.length > 20) ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Thứ hạng<span className="text-red-500">*</span></label>
                  <input name="rank" type="text" maxLength={20} value={workForm.rank} onChange={handleWorkInputChange} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${workFormTouched.rank && (!workForm.rank || workForm.rank.length > 20) ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="mb-3">
                   <label className="block text-sm font-medium mb-1">Thời gian bắt đầu<span className="text-red-500">*</span></label>
                    <input
                      name="start_date" // Sửa lại từ startDate -> start_date
                      type="date"
                      value={workForm.start_date}
                      onChange={handleWorkInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${workFormTouched.start_date && !workForm.start_date ? 'border-red-500' : 'border-gray-300'}`}
                      required
                    />
                 </div>
             <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Thời gian kết thúc</label>
                <input
                  name="end_date" // Sửa lại từ endDate -> end_date
                  type="date"
                  value={workForm.end_date}
                  onChange={handleWorkInputChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${workFormTouched.end_date && !workForm.end_date ? 'border-red-500' : 'border-gray-300'}`}
                />
              </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setShowWorkModal(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Hủy</button>
                  <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Lưu</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* 2. Lịch sử thay đổi lương */}
      <div>
        <div className="flex items-center justify-between mb-2 mt-8">
          <h3 className="font-semibold">Lịch sử thay đổi lương</h3>
          <button type="button" onClick={handleAddSalaryChange} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">+ Thêm mới</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Mức lương cũ</th>
                <th className="border px-2 py-1">Mức lương mới</th>
                <th className="border px-2 py-1">Tỉ lệ</th>
                <th className="border px-2 py-1">Thời gian điều chỉnh</th>
              </tr>
            </thead>
            <tbody>
              {salaryChanges.length === 0 ? (
                <tr><td colSpan={4} className="border px-2 py-1 text-center text-gray-400">Chưa có dữ liệu</td></tr>
              ) : salaryChanges.map((s, idx) => {
                const oldVal = parseFloat(s.oldSalary);
                const newVal = parseFloat(s.newSalary);
                let percent = '';
                let color = '';
                if (!isNaN(oldVal) && !isNaN(newVal) && oldVal > 0) {
                  const ratio = ((newVal - oldVal) / oldVal) * 100;
                  percent = (ratio > 0 ? '+' : '') + ratio.toFixed(2) + '%';
                  color = ratio > 0 ? 'text-green-600' : (ratio < 0 ? 'text-red-600' : '');
                }
                return (
                  <tr key={idx}>
                    <td className="border px-2 py-1">{s.oldSalary}</td>
                    <td className="border px-2 py-1">{s.newSalary}</td>
                    <td className={`border px-2 py-1 font-semibold ${color}`}>{percent}</td>
                    <td className="border px-2 py-1">{s.date && dayjs(s.date).format('DD/MM/YY')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {showSalaryChangeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <h3 className="text-lg font-semibold mb-4">Thêm lịch sử thay đổi lương</h3>
              <form onSubmit={handleSalaryChangeSubmit}>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Mức lương cũ<span className="text-red-500">*</span></label>
                  <input name="oldSalary" type="number" min={0} value={salaryChangeForm.oldSalary} onChange={handleSalaryChangeInput} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${salaryChangeFormTouched.oldSalary && !salaryChangeForm.oldSalary ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Mức lương mới<span className="text-red-500">*</span></label>
                  <input name="newSalary" type="number" min={0} value={salaryChangeForm.newSalary} onChange={handleSalaryChangeInput} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${salaryChangeFormTouched.newSalary && !salaryChangeForm.newSalary ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Thời gian điều chỉnh<span className="text-red-500">*</span></label>
                  <input name="date" type="date" value={salaryChangeForm.date} onChange={handleSalaryChangeInput} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${salaryChangeFormTouched.date && !salaryChangeForm.date ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setShowSalaryChangeModal(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Hủy</button>
                  <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Lưu</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* 3. Đánh giá hiệu suất */}
      <div>
        <div className="flex items-center justify-between mb-2 mt-8">
          <h3 className="font-semibold">Đánh giá hiệu suất qua các kỳ</h3>
          <button type="button" onClick={handleAddReview} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">+ Thêm mới</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Loại đánh giá</th>
                <th className="border px-2 py-1">Mục đích</th>
                <th className="border px-2 py-1">Kết quả</th>
                <th className="border px-2 py-1">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {performanceReviews.length === 0 ? (
                <tr><td colSpan={4} className="border px-2 py-1 text-center text-gray-400">Chưa có dữ liệu</td></tr>
              ) : performanceReviews.map((r, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{r.type}</td>
                  <td className="border px-2 py-1">{r.purpose}</td>
                  <td className="border px-2 py-1">{r.result}</td>
                  <td className="border px-2 py-1">{r.date && dayjs(r.date).format('DD/MM/YY')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <h3 className="text-lg font-semibold mb-4">Thêm đánh giá hiệu suất</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Loại đánh giá<span className="text-red-500">*</span></label>
                  <select name="type" value={reviewForm.type} onChange={handleReviewInput} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${reviewFormTouched.type && !reviewForm.type ? 'border-red-500' : 'border-gray-300'}`} required>
                    <option value="">-- Chọn --</option>
                    <option value="Đánh giá định kỳ">Đánh giá định kỳ</option>
                    <option value="Đánh giá đột xuất">Đánh giá đột xuất</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Mục đích<span className="text-red-500">*</span></label>
                  <input name="purpose" type="text" value={reviewForm.purpose} onChange={handleReviewInput} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${reviewFormTouched.purpose && !reviewForm.purpose ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Kết quả<span className="text-red-500">*</span></label>
                  <input name="result" type="text" value={reviewForm.result} onChange={handleReviewInput} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${reviewFormTouched.result && !reviewForm.result ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Thời gian<span className="text-red-500">*</span></label>
                  <input name="date" type="date" value={reviewForm.date} onChange={handleReviewInput} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${reviewFormTouched.date && !reviewForm.date ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setShowReviewModal(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Hủy</button>
                  <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Lưu</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* 4. Khen thưởng */}
      <div>
        <div className="flex items-center justify-between mb-2 mt-8">
          <h3 className="font-semibold">Khen thưởng</h3>
          <button type="button" onClick={handleAddReward} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">+ Thêm mới</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Thể loại</th>
                <th className="border px-2 py-1">Nội dung</th>
                <th className="border px-2 py-1">Tiêu đề</th>
                <th className="border px-2 py-1">Biểu mẫu</th>
                <th className="border px-2 py-1">Thời gian áp dụng</th>
                <th className="border px-2 py-1">Thời gian hết hạn</th>
              </tr>
            </thead>
            <tbody>
              {rewards.length === 0 ? (
                <tr><td colSpan={4} className="border px-2 py-1 text-center text-gray-400">Chưa có dữ liệu</td></tr>
              ) : rewards.map((r, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{r.type}</td>
                  <td className="border px-2 py-1">{r.description}</td>
                  <td className="border px-2 py-1">{r.title}</td>
                  <td className="border px-2 py-1">{r.decision_form}</td>
                  <td className="border px-2 py-1">{r.effective_date && dayjs(r.effective_date).format('DD/MM/YY')}</td>
                  <td className="border px-2 py-1">{r.expiry_date && dayjs(r.expiry_date).format('DD/MM/YY')}</td>
                  <td className="border px-2 py-1">
                    <button type="button" onClick={() => handleEditReward(idx)} className="text-blue-600 hover:underline">Sửa</button>
                    <button type="button" onClick={() => handleDeleteReward(r.id)} className="text-red-600 hover:underline ml-2">Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showRewardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <h3 className="text-lg font-semibold mb-4">Thêm khen thưởng</h3>
              <form onSubmit={handleRewardSubmit}>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Thể loại<span className="text-red-500">*</span></label>
                  <input name="content" type="text" maxLength={200} value={rewardForm.type} onChange={handleRewardInput} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${rewardFormTouched.content && (!rewardForm.type || rewardForm.type.length > 200) ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Nội dung khen thưởng<span className="text-red-500">*</span></label>
                  <input name="description" type="text" maxLength={200} value={rewardForm.description} onChange={handleRewardInput} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${rewardFormTouched.description && (!rewardForm.description || rewardForm.description.length > 200) ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Danh hiệu được khen thưởng<span className="text-red-500">*</span></label>
                  <input name="title" type="text" maxLength={20} value={rewardForm.title} onChange={handleRewardInput} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${rewardFormTouched.title && (!rewardForm.title || rewardForm.title.length > 20) ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Biểu mẫu<span className="text-red-500">*</span></label>
                  <input name="decision_form" type="text" maxLength={50} value={rewardForm.decision_form} onChange={handleRewardInput} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${rewardFormTouched.decision_form && (!rewardForm.decision_form || rewardForm.decision_form.length > 50) ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Thời gian áp dụng<span className="text-red-500">*</span></label>
                  <input name="date" type="date" value={rewardForm.effective_date} onChange={handleRewardInput} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${rewardFormTouched.date && !rewardForm.effective_date ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Thời gian hết hạn</label>
                  <input name="endDate" type="date" value={rewardForm.expiry_date} onChange={handleRewardInput} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${rewardFormTouched.endDate && !rewardForm.expiry_date ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setShowRewardModal(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Hủy</button>
                  <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Lưu</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* 5. Kỷ luật */}
      <div>
        <div className="flex items-center justify-between mb-2 mt-8">
          <h3 className="font-semibold">Kỷ luật</h3>
          <button type="button" onClick={handleAddDiscipline} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">+ Thêm mới</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Nội dung vi phạm</th>
                <th className="border px-2 py-1">Mức độ vi phạm</th>
                <th className="border px-2 py-1">Hình thức kỷ luật</th>
                <th className="border px-2 py-1">Thời gian áp dụng</th>
                <th className="border px-2 py-1">Thời gian hết hiệu lực</th>
              </tr>
            </thead>
            <tbody>
              {disciplines.length === 0 ? (
                <tr><td colSpan={5} className="border px-2 py-1 text-center text-gray-400">Chưa có dữ liệu</td></tr>
              ) : disciplines.map((d, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{d.content}</td>
                  <td className="border px-2 py-1">{d.level}</td>
                  <td className="border px-2 py-1">{d.form}</td>
                  <td className="border px-2 py-1">{d.date && dayjs(d.date).format('DD/MM/YY')}</td>
                  <td className="border px-2 py-1">{d.endDate && dayjs(d.endDate).format('DD/MM/YY')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showDisciplineModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <h3 className="text-lg font-semibold mb-4">Thêm kỷ luật</h3>
              <form onSubmit={handleDisciplineSubmit}>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Nội dung vi phạm<span className="text-red-500">*</span></label>
                  <input name="content" type="text" value={disciplineForm.content} onChange={handleDisciplineInput} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${disciplineFormTouched.content && !disciplineForm.content ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Mức độ vi phạm<span className="text-red-500">*</span></label>
                  <input name="level" type="text" value={disciplineForm.level} onChange={handleDisciplineInput} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${disciplineFormTouched.level && !disciplineForm.level ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Hình thức kỷ luật<span className="text-red-500">*</span></label>
                  <input name="form" type="text" value={disciplineForm.form} onChange={handleDisciplineInput} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${disciplineFormTouched.form && !disciplineForm.form ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Thời gian áp dụng<span className="text-red-500">*</span></label>
                  <input name="date" type="date" value={disciplineForm.date} onChange={handleDisciplineInput} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${disciplineFormTouched.date && !disciplineForm.date ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1">Thời gian hết hiệu lực<span className="text-red-500">*</span></label>
                  <input name="endDate" type="date" value={disciplineForm.endDate} onChange={handleDisciplineInput} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${disciplineFormTouched.endDate && !disciplineForm.endDate ? 'border-red-500' : 'border-gray-300'}`} required />
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" onClick={() => setShowDisciplineModal(false)} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Hủy</button>
                  <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Lưu</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  </section>
  

    {/* 6. Thông tin khác */}
    <section className="mt-8">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">6. Thông tin khác</h2>
      </div>
      <div className="p-6 space-y-6">
        {/* Ảnh thẻ */}
        <div>
          <label className="block font-medium mb-1">Ảnh thẻ <span className="text-red-500">*</span></label>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="block w-full border rounded px-3 py-2"
          />
        </div>
        {/* Lộ trình phát triển bản thân */}
        <div>
          <label className="block font-medium mb-1">Lộ trình phát triển bản thân</label>
          <textarea
            maxLength={500}
            value={selfDevelopment}
            onChange={e => setSelfDevelopment(e.target.value)}
            className="w-full border rounded px-3 py-2 min-h-[80px]"
            placeholder="Nhập lộ trình phát triển bản thân (tối đa 500 ký tự)"
          />
          <div className="text-xs text-gray-500 text-right">{selfDevelopment.length}/500</div>
        </div>
        {/* Mục tiêu nghề nghiệp */}
        <div>
          <label className="block font-medium mb-1">Mục tiêu nghề nghiệp <span className="text-red-500">*</span></label>
          <textarea
            maxLength={500}
            value={careerGoal}
            onChange={e => setCareerGoal(e.target.value)}
            required
            className={`w-full border rounded px-3 py-2 min-h-[80px] ${careerGoalTouched && !careerGoal ? 'border-red-500' : ''}`}
            placeholder="Nhập mục tiêu nghề nghiệp (tối đa 500 ký tự)"
            onBlur={() => setCareerGoalTouched(true)}
          />
          <div className="text-xs text-gray-500 text-right">{careerGoal.length}/500</div>
          {careerGoalTouched && !careerGoal && <div className="text-red-500 text-sm mt-1">Vui lòng nhập mục tiêu nghề nghiệp</div>}
        </div>
        {/* Tình trạng sức khỏe */}
        <div>
          <label className="block font-medium mb-1">Tình trạng sức khỏe</label>
          <textarea
            maxLength={500}
            value={healthStatus}
            onChange={e => setHealthStatus(e.target.value)}
            className="w-full border rounded px-3 py-2 min-h-[80px]"
            placeholder="Nhập tình trạng sức khỏe (tối đa 500 ký tự)"
          />
          <div className="text-xs text-gray-500 text-right">{healthStatus.length}/500</div>
        </div>
      </div>
    </section>
    {/* Nút cập nhật */}
    <div className="flex justify-end p-6">
      <button
        type="button"
        onClick={handleUpdateEmployee}
        disabled={isUpdating}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-base font-semibold disabled:opacity-60"
      >
        {isUpdating ? (isNew ? "Đang tạo..." : "Đang cập nhật...") : (isNew ? "Tạo nhân viên" : "Cập nhật thông tin")}
      </button>
    </div>
  </div>
)
}
