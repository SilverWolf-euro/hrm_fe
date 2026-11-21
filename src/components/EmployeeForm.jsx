import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import employeeService from "../services/employeeService";

/* ----------------------------------------------------------------------------
 * Hồ sơ nhân viên (tạo mới + cập nhật) — giao diện theo design HRM.
 * Payload gửi API giữ nguyên như personal-info-form.tsx (form cũ).
 *
 * Props:
 *  - profile: dữ liệu GET /employee/:id (không truyền = tạo mới)
 *  - isNew:   true khi tạo mới
 *  - onSaved: gọi sau khi lưu thành công với id nhân viên
 * ------------------------------------------------------------------------- */

const inputCls =
  "w-full h-[42px] px-3 border border-[#D5DAE1] rounded-lg bg-white text-sm text-gray-900 outline-none " +
  "placeholder:text-[#8A93A0] hover:border-[#B4BCC8] focus:border-blue-600 focus:ring-[3px] focus:ring-blue-600/15 " +
  "disabled:bg-[#F1F3F6] disabled:text-[#5B6472] disabled:border-[#E3E6EB] disabled:cursor-not-allowed transition";
const textareaCls = inputCls.replace("h-[42px]", "min-h-[96px] py-2.5 leading-relaxed resize-y");
const cellInputCls =
  "w-full min-w-[120px] h-9 px-2 border border-[#D5DAE1] rounded-md bg-white text-[13px] outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15";
const btnBase =
  "inline-flex items-center justify-center gap-1.5 h-[42px] px-[18px] rounded-lg text-sm font-semibold whitespace-nowrap transition border disabled:opacity-60 disabled:cursor-not-allowed";
const btnPrimary = `${btnBase} bg-blue-600 text-white border-transparent hover:bg-blue-700`;
const btnSecondary = `${btnBase} bg-white text-gray-800 border-[#D5DAE1] hover:bg-[#F8F9FB]`;

const MAX_TEXT = 500;

// Giá trị giữ nguyên như form cũ
const GENDERS = [
  { value: "M", label: "Nam" },
  { value: "F", label: "Nữ" },
  { value: "O", label: "Khác" },
];
const MARITAL = [
  { value: "Single", label: "Độc thân" },
  { value: "Married", label: "Đã kết hôn" },
  { value: "Divorced", label: "Ly hôn" },
  { value: "Widowed", label: "Góa" },
];
const STATUSES = [
  { value: "Active", label: "Đang làm việc", chip: "bg-[#ECFDF3] text-[#067647]" },
  { value: "Inactive", label: "Đã nghỉ việc", chip: "bg-[#F1F3F6] text-gray-700" },
];
const RESIGNED = "Inactive";
const CURRENCIES = ["VND", "USD", "EUR"];
// TODO: thay bằng danh mục thật nếu backend có
const DEGREES = ["Trung học phổ thông", "Trung cấp", "Cao đẳng", "Đại học", "Thạc sĩ", "Tiến sĩ"];
const BANKS = ["Vietcombank", "VietinBank", "BIDV", "Agribank", "Techcombank", "MB Bank", "ACB", "VPBank", "Sacombank", "TPBank"];
const INSURANCE_STATUS = ["Đang tham gia", "Tạm dừng", "Đã chốt sổ"];
const REVIEW_TYPES = ["Đánh giá định kỳ", "Đánh giá đột xuất"];

const NAV = [
  { id: "s1", label: "Thông tin cá nhân" },
  { id: "s2", label: "Học vấn & chuyên môn" },
  { id: "s3", label: "Thông tin công việc" },
  { id: "s4", label: "Pháp lý, bảo hiểm & thuế" },
  { id: "s5", label: "Lịch sử & đánh giá" },
  { id: "s6", label: "Phát triển & khác" },
];

const initialEmployee = {
  id: "",
  attendance_code: "",
  full_name: "",
  gender: "",
  birth_date: "",
  marital_status: "",
  birth_place: "",
  home_town: "",
  id_number: "",
  citizen_id_number: "",
  issue_date: "",
  issue_place: "",
  permanent_address: "",
  temporary_address: "",
  personal_phone: "",
  personal_email: "",
  company_phone: "",
  company_email: "",
  highest_degree: "",
  major: "",
  school_name: "",
  graduation_year: "",
  special_skills: "",
  position_title: "",
  rank: "",
  department_name: "",
  work_location: "",
  manager_id: "",
  leader: "",
  status: "",
  join_date: "",
  official_date: "",
  employment_type: "",
  social_insurance_no: "",
  insurance_status: "",
  insurance_amount: "",
  insurance_date: "",
  kcb_place: "",
  health_insurance: "",
  health_insur_expire: "",
  tax_id: "",
  bank_account: "",
  bank_name: "",
  job_objective: "",
  development_plan: "",
  health_status: "",
  created_at: "",
};

// Các trường chỉ có trên giao diện — backend chưa có cột nên KHÔNG gửi API (giống form cũ)
const initialUiOnly = {
  ethnicity: "",
  religion: "",
  same_address: false,
  start_date: "",
  resign_date: "",
  contract_term_months: "",
  insurance_months: "",
};

const LIST_KEYS = ["relatives", "emergencyContacts", "certificates", "salaries", "allowances", "dependents", "careers", "rewards", "reviews", "disciplines"];
const emptyLists = Object.fromEntries(LIST_KEYS.map((k) => [k, []]));

/* ---------------------------------- helpers --------------------------------- */

const fmtDate = (d) => (d ? dayjs(d).format("YYYY-MM-DD") : "");
const utcISO = (d) => (d ? new Date(`${d}T00:00:00Z`).toISOString() : null); // như form cũ (bảng employee, phụ cấp)
const localISO = (d) => (d ? dayjs(d).toISOString() : null); // như form cũ (các bảng con)
const digits = (v) => String(v ?? "").replace(/\D/g, "");
const formatMoney = (v) => (digits(v) ? Number(digits(v)).toLocaleString("vi-VN") : "");
const calcAge = (birth) => {
  if (!birth) return null;
  const d = new Date(birth);
  if (isNaN(d)) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age >= 0 ? age : null;
};
const normalize = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
let rowSeq = 0;
const newRowKey = () => `r${Date.now()}-${rowSeq++}`;
const withKey = (row) => ({ ...row, _key: newRowKey() });
const safeGet = (fn, id) => fn(id).then((d) => (Array.isArray(d) ? d : [])).catch((e) => { console.error(e); return []; });

// Ánh xạ dữ liệu API -> dòng trong bảng
const fromApi = {
  relatives: (i) => ({ id: i.id || null, full_name: i.full_name || "", relationship: i.relationship || "", birth_date: fmtDate(i.birth_date), gender: i.gender || "" }),
  emergencyContacts: (i) => ({ id: i.id || null, full_name: i.full_name || "", relationship: i.relationship || "", phone: i.phone || "" }),
  certificates: (i) => ({ id: i.id || null, certificate_name: i.certificate_name || "", classification: i.classification || "", major: i.major || "", issue_date: fmtDate(i.issue_date), expiry_date: fmtDate(i.expiry_date) }),
  salaries: (i) => ({ id: i.id || null, type: i.type || "", amount_old: digits(i.amount_old), amount_new: digits(i.amount_new), start_date: fmtDate(i.start_date) }),
  allowances: (i) => ({ id: i.id || null, type: i.type || "", amount: digits(i.amount_new), currency: i.currency || "VND", date: fmtDate(i.end_date) }),
  careers: (i) => ({ id: i.id || null, position: i.position || "", department: i.department || "", rank: i.rank || "", start_date: fmtDate(i.start_date), end_date: fmtDate(i.end_date) }),
  rewards: (i) => ({ id: i.id || null, type: i.type || "", description: i.description || "", title: i.title || "", decision_form: i.decision_form || "", effective_date: fmtDate(i.effective_date), expiry_date: fmtDate(i.expiry_date) }),
};

// Ánh xạ dòng trong bảng -> payload API (giữ nguyên như form cũ)
const toApi = {
  relatives: (r, employee_id, now) => ({ id: r.id ?? null, employee_id, full_name: r.full_name, birth_date: r.birth_date ? dayjs(r.birth_date).toISOString() : "", relationship: r.relationship, gender: r.gender, created_at: now, updated_at: now }),
  emergencyContacts: (r, employee_id) => ({ id: r.id ?? null, employee_id, full_name: r.full_name, relationship: r.relationship, phone: r.phone }),
  certificates: (r, employee_id) => ({ id: r.id ?? null, employee_id, certificate_name: r.certificate_name, classification: r.classification, major: r.major, issue_date: localISO(r.issue_date), expiry_date: localISO(r.expiry_date) }),
  salaries: (r, employee_id) => ({ id: r.id ?? null, employee_id, type: r.type, amount_old: Number(digits(r.amount_old)), amount_new: Number(digits(r.amount_new)), start_date: localISO(r.start_date) }),
  allowances: (r, employee_id) => ({ id: r.id ?? "", employee_id, type: r.type, amount_new: Number(digits(r.amount)) || 0, currency: r.currency, end_date: utcISO(r.date) }),
  careers: (r, employee_id) => ({ id: r.id ?? null, employee_id, position: r.position, department: r.department, rank: r.rank, start_date: localISO(r.start_date), end_date: localISO(r.end_date) }),
  rewards: (r, employee_id) => ({ id: r.id ?? null, employee_id, type: r.type, description: r.description, title: r.title, decision_form: r.decision_form, effective_date: localISO(r.effective_date), expiry_date: localISO(r.expiry_date) }),
};

// API xóa từng loại (chứng chỉ chưa có API xóa)
const removeApi = {
  relatives: employeeService.removeRelative,
  emergencyContacts: employeeService.removeEmergencyContact,
  salaries: employeeService.removeSalaryHistory,
  allowances: employeeService.removeSalaryHistory, // form cũ dùng chung API xóa lương
  careers: employeeService.removeCareerHistory,
  rewards: employeeService.removeRewardDiscipline,
};

/* ------------------------------- cấu hình bảng ------------------------------ */

const relativeCols = [
  { key: "full_name", label: "Họ và tên", required: true, maxLength: 50 },
  { key: "relationship", label: "Quan hệ", required: true, placeholder: "Bố, mẹ, vợ/chồng…" },
  { key: "birth_date", label: "Ngày sinh", type: "date" },
  { key: "gender", label: "Giới tính", type: "select", options: [{ value: "Male", label: "Nam" }, { value: "Female", label: "Nữ" }] },
];
const emergencyCols = [
  { key: "full_name", label: "Họ và tên", required: true, maxLength: 50 },
  { key: "relationship", label: "Mối quan hệ", required: true },
  { key: "phone", label: "Số điện thoại", type: "tel", required: true },
];
const certificateCols = [
  { key: "certificate_name", label: "Tên bằng cấp / chứng chỉ", required: true, maxLength: 100 },
  { key: "classification", label: "Xếp loại / thang điểm", required: true },
  { key: "major", label: "Chuyên ngành", required: true },
  { key: "issue_date", label: "Ngày cấp", type: "date", required: true },
  { key: "expiry_date", label: "Ngày hết hạn", type: "date" },
];
const dependentCols = [
  { key: "full_name", label: "Họ tên", required: true, maxLength: 20 },
  { key: "birth_date", label: "Ngày sinh", type: "date" },
  { key: "id_number", label: "Số CCCD / Mã định danh" },
  { key: "relationship", label: "Mối quan hệ", maxLength: 10 },
  { key: "tax_code", label: "Mã số thuế", maxLength: 10 },
];
const salaryCols = (options) => [
  { key: "type", label: "Loại lương", type: "combo", options, required: true, maxLength: 50 },
  { key: "amount_old", label: "Mức lương cũ", type: "money", align: "right", required: true },
  { key: "amount_new", label: "Mức lương mới", type: "money", align: "right", required: true },
  { key: "start_date", label: "Hiệu lực từ", type: "date", required: true },
];
const allowanceCols = (options) => [
  { key: "type", label: "Nội dung / loại phụ cấp", type: "combo", options, required: true, maxLength: 50 },
  { key: "amount", label: "Số tiền", type: "money", align: "right", required: true },
  { key: "currency", label: "Loại tiền", type: "select", options: CURRENCIES.map((c) => ({ value: c, label: c })), noEmpty: true, required: true },
  { key: "date", label: "Hiệu lực đến", type: "date", required: true },
];
const careerCols = [
  { key: "start_date", label: "Từ ngày", type: "date", required: true },
  { key: "end_date", label: "Đến ngày", type: "date", required: true },
  { key: "position", label: "Chức danh", required: true },
  { key: "department", label: "Phòng ban", required: true },
  { key: "rank", label: "Cấp bậc", required: true },
];
const rewardCols = [
  { key: "type", label: "Thể loại", required: true, maxLength: 200 },
  { key: "description", label: "Nội dung" },
  { key: "title", label: "Tiêu đề", required: true, maxLength: 20 },
  { key: "decision_form", label: "Biểu mẫu", required: true, maxLength: 50 },
  { key: "effective_date", label: "Thời gian áp dụng", type: "date", required: true },
  { key: "expiry_date", label: "Thời gian hết hạn", type: "date", required: true },
];
const reviewCols = [
  { key: "type", label: "Loại đánh giá", type: "select", options: REVIEW_TYPES.map((t) => ({ value: t, label: t })), required: true },
  { key: "purpose", label: "Mục đích", required: true },
  { key: "result", label: "Kết quả", required: true },
  { key: "date", label: "Thời gian", type: "date", required: true },
];
const disciplineCols = [
  { key: "content", label: "Nội dung vi phạm", required: true },
  { key: "level", label: "Mức độ vi phạm", required: true },
  { key: "form", label: "Hình thức kỷ luật", required: true },
  { key: "date", label: "Thời gian áp dụng", type: "date", required: true },
  { key: "end_date", label: "Thời gian hết hiệu lực", type: "date", required: true },
];

/* -------------------------------- sub components ---------------------------- */

const Req = () => <span className="text-[#C2410C] ml-0.5">*</span>;

function Field({ label, htmlFor, required, hint, className = "", children }) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={htmlFor} className="block text-[13px] font-medium text-gray-700 mb-1.5">
          {label}
          {required && <Req />}
        </label>
      )}
      {children}
      {hint && <div className="text-xs text-[#5B6472] mt-1.5">{hint}</div>}
    </div>
  );
}

function Suffix({ unit, children }) {
  return (
    <div className="relative">
      {children}
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-medium text-[#5B6472] pointer-events-none">{unit}</span>
    </div>
  );
}

// Combobox lấy dữ liệu từ API /employee/filter; giữ lại giá trị cũ nếu không có trong danh sách
function FilterSelect({ id, name, value, options, onChange }) {
  const hasValue = !value || options.some((o) => String(o.value) === String(value));
  return (
    <select id={id} name={name} value={value} onChange={onChange} className={inputCls}>
      <option value="">— Chọn —</option>
      {!hasValue && <option value={value}>{value}</option>}
      {options.map((o) => (
        <option key={`${o.filter || ""}-${o.value}`} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// Select danh sách tĩnh, giữ lại giá trị cũ nếu không có trong danh sách
function StaticSelect({ id, name, value, items, onChange, placeholder = "— Chọn —" }) {
  return (
    <select id={id} name={name} value={value} onChange={onChange} className={inputCls}>
      <option value="">{placeholder}</option>
      {value && !items.includes(value) && <option value={value}>{value}</option>}
      {items.map((x) => <option key={x} value={x}>{x}</option>)}
    </select>
  );
}

function Group({ title, required, action, note, children }) {
  return (
    <div className="pt-6 border-t border-[#EEF0F3] first:pt-0 first:border-t-0">
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 mb-3.5 flex-wrap">
          {title && (
            <h3 className="m-0 text-xs font-semibold tracking-[.06em] uppercase text-[#5B6472]">
              {title}
              {required && <Req />}
            </h3>
          )}
          {action}
        </div>
      )}
      {note && <p className="-mt-2 mb-3 text-xs text-[#5B6472]">{note}</p>}
      {children}
    </div>
  );
}

function Section({ id, n, title, desc, children, flush }) {
  return (
    <section id={id} className="bg-white border border-[#E3E6EB] rounded-[14px] scroll-mt-6">
      <div className={`flex gap-3.5 items-start px-6 ${flush ? "pt-5" : "py-5 border-b border-[#EEF0F3]"}`}>
        <span className="w-8 h-8 rounded-lg bg-[#EFF4FF] text-blue-700 flex items-center justify-center font-bold text-sm shrink-0">{n}</span>
        <div>
          <h2 className="m-0 text-[17px] font-semibold text-gray-900">{title}</h2>
          <p className="mt-1 mb-0 text-[13px] text-[#5B6472]">{desc}</p>
        </div>
      </div>
      {flush ? children : <div className="p-6 flex flex-col gap-6">{children}</div>}
    </section>
  );
}

function AddButton({ children, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className="inline-flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-sm font-semibold text-blue-700 hover:bg-[#EFF4FF] transition">
      <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
      {children}
    </button>
  );
}

function EmptyState({ title, hint }) {
  return (
    <div className="py-[22px] px-4 flex flex-col items-center gap-1 text-[13px] text-[#5B6472] border-t border-[#EEF0F3] text-center">
      <b className="font-medium text-gray-700">{title}</b>
      <span>{hint}</span>
    </div>
  );
}

const thCls = "font-semibold text-gray-700 bg-[#F8F9FB] px-3.5 py-2.5 border-b border-[#E3E6EB] whitespace-nowrap";

// Bảng nhập liệu: sửa trực tiếp trên dòng; dòng đã lưu xóa qua API ngay (giống form cũ)
function EditableTable({ name, columns, rows, onChange, onRemove, canRemove = () => true, emptyTitle, emptyHint }) {
  const update = (key, field, value) =>
    onChange(rows.map((r) => (r._key === key ? { ...r, [field]: value, _dirty: true } : r)));

  return (
    <div className="border border-[#E3E6EB] rounded-[10px] overflow-x-auto bg-white">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`${thCls} ${c.align === "right" ? "text-right" : "text-left"}`}>
                {c.label}{c.required && <Req />}
              </th>
            ))}
            <th className={`${thCls} w-[1%] text-left`}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._key} className="border-b border-[#EEF0F3] last:border-b-0">
              {columns.map((c) => {
                const v = r[c.key] ?? "";
                const common = { "aria-label": c.label, required: c.required, maxLength: c.maxLength };
                let control;
                if (c.type === "select") {
                  control = (
                    <select value={v} onChange={(e) => update(r._key, c.key, e.target.value)} className={cellInputCls} {...common}>
                      {!c.noEmpty && <option value="">— Chọn —</option>}
                      {v && !c.options.some((o) => String(o.value) === String(v)) && <option value={v}>{v}</option>}
                      {c.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  );
                } else if (c.type === "combo") {
                  // Chọn từ danh mục hoặc tự nhập (thay cho lựa chọn "Khác" ở form cũ)
                  const listId = `${name}-${c.key}-list`;
                  control = (
                    <>
                      <input list={listId} value={v} onChange={(e) => update(r._key, c.key, e.target.value)}
                        placeholder="Chọn hoặc nhập" className={cellInputCls} {...common} />
                      <datalist id={listId}>{c.options.map((o) => <option key={o} value={o} />)}</datalist>
                    </>
                  );
                } else if (c.type === "money") {
                  control = (
                    <input inputMode="numeric" value={formatMoney(v)} placeholder="0"
                      onChange={(e) => update(r._key, c.key, digits(e.target.value))}
                      className={`${cellInputCls} text-right tabular-nums`} {...common} maxLength={undefined} />
                  );
                } else {
                  control = (
                    <input type={c.type || "text"} value={v} placeholder={c.placeholder}
                      onChange={(e) => update(r._key, c.key, e.target.value)} className={cellInputCls} {...common} />
                  );
                }
                return <td key={c.key} className="px-3.5 py-2 align-middle">{control}</td>;
              })}
              <td className="px-3.5 py-2">
                {canRemove(r) ? (
                  <button type="button" onClick={() => onRemove(r)}
                    className="px-1.5 py-1 rounded-md text-[13px] font-medium text-[#B42318] hover:bg-[#F4F6F8]">Xóa</button>
                ) : (
                  <span className="px-1.5 text-[#8A93A0]" title="Chưa hỗ trợ xóa">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <EmptyState title={emptyTitle} hint={emptyHint} />}
    </div>
  );
}

function TextCounter({ id, name, label, value, onChange, placeholder, className, minH }) {
  return (
    <Field label={label} htmlFor={id} className={className}>
      <textarea id={id} name={name} value={value} onChange={onChange} maxLength={MAX_TEXT}
        placeholder={placeholder} className={textareaCls} style={minH ? { minHeight: minH } : undefined} />
      <div className={`text-xs mt-1.5 text-right ${value.length >= MAX_TEXT ? "text-[#B42318]" : "text-[#5B6472]"}`}>
        {value.length}/{MAX_TEXT}
      </div>
    </Field>
  );
}

/* --------------------------------- main form -------------------------------- */

function EmployeeForm({ profile = null, isNew = !profile, onSaved }) {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(initialEmployee);
  const [ui, setUi] = useState(initialUiOnly);
  const [lists, setLists] = useState(emptyLists);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'ok' | 'err', text }
  const [dirty, setDirty] = useState(false);
  const [filterOptions, setFilterOptions] = useState([]);
  const [activeNav, setActiveNav] = useState("s1");
  const [historyTab, setHistoryTab] = useState("careers");

  const employeeId = profile?.id || "";

  useEffect(() => {
    employeeService.getFilter()
      .then((data) => setFilterOptions(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Lỗi lấy dữ liệu filter:", err));
  }, []);

  // Đổ dữ liệu từ profile vào form
  useEffect(() => {
    if (!profile) return;
    const next = { ...initialEmployee };
    Object.keys(initialEmployee).forEach((k) => {
      if (profile[k] !== undefined && profile[k] !== null) next[k] = profile[k];
    });
    ["birth_date", "issue_date", "join_date", "official_date", "insurance_date", "health_insur_expire"].forEach((k) => {
      next[k] = fmtDate(profile[k]);
    });
    next.graduation_year = profile.graduation_year ? String(profile.graduation_year) : "";
    next.insurance_amount = digits(profile.insurance_amount);
    setEmployee(next);
    setUi({
      ...initialUiOnly,
      ethnicity: profile.ethnicity || "",
      religion: profile.religion || "",
      resign_date: fmtDate(profile.resign_date),
      same_address: !!profile.permanent_address && profile.permanent_address === profile.temporary_address,
    });
    setDirty(false);
  }, [profile]);

  // Tải các bảng chi tiết của nhân viên
  const loadLists = useCallback(async (id) => {
    const [relatives, emergencyContacts, certificates, salaries, allowances, careers, rewards] = await Promise.all([
      safeGet(employeeService.getRelatives, id),
      safeGet(employeeService.getEmergencyContacts, id),
      safeGet(employeeService.getCertificates, id),
      safeGet(employeeService.getSalaries, id),
      safeGet(employeeService.getAllowances, id),
      safeGet(employeeService.getCareerHistories, id),
      safeGet(employeeService.getRewardDisciplines, id),
    ]);
    const map = (key, arr) => arr.map((i) => withKey(fromApi[key](i)));
    setLists((prev) => ({
      ...prev,
      relatives: map("relatives", relatives),
      emergencyContacts: map("emergencyContacts", emergencyContacts),
      certificates: map("certificates", certificates),
      salaries: map("salaries", salaries),
      allowances: map("allowances", allowances),
      careers: map("careers", careers),
      rewards: map("rewards", rewards),
    }));
  }, []);

  useEffect(() => {
    if (employeeId) loadLists(employeeId);
  }, [employeeId, loadLists]);

  // Ảnh xem trước
  useEffect(() => {
    if (!file) { setPreview(""); return undefined; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const getOptions = (filter) => filterOptions.filter((o) => o.filter === filter);
  const contractOptions = getOptions("EMPLOYEE_CONTRACT");
  const comboOptions = (filter) => getOptions(filter).map((o) => o.label).filter((l) => normalize(l) !== "khac");
  const salaryTypeOptions = comboOptions("SALARY");
  const allowanceTypeOptions = comboOptions("ALLOWANCE");

  const set = (patch) => { setEmployee((prev) => ({ ...prev, ...patch })); setDirty(true); };
  const setUiField = (patch) => { setUi((prev) => ({ ...prev, ...patch })); setDirty(true); };
  const handleChange = (e) => set({ [e.target.name]: e.target.value });
  const handleUiChange = (e) => {
    const { name, value, type, checked } = e.target;
    setUiField({ [name]: type === "checkbox" ? checked : value });
  };
  const setList = (key) => (rows) => { setLists((prev) => ({ ...prev, [key]: rows })); setDirty(true); };
  const addRow = (key, defaults = {}) => () => setList(key)([...lists[key], { ...withKey({ id: null, ...defaults }), _dirty: true }]);

  // Xóa dòng: dòng đã lưu → gọi API xóa ngay (có xác nhận) như form cũ; dòng mới → bỏ khỏi bảng
  const removeRow = (key) => async (row) => {
    if (!row.id) {
      setLists((prev) => ({ ...prev, [key]: prev[key].filter((r) => r._key !== row._key) }));
      return;
    }
    if (!window.confirm("Bạn có chắc chắn muốn xóa dòng này?")) return;
    try {
      await removeApi[key](row.id);
      setLists((prev) => ({ ...prev, [key]: prev[key].filter((r) => r._key !== row._key) }));
    } catch (err) {
      console.error(err);
      setMessage({ type: "err", text: "Có lỗi khi xóa dữ liệu." });
    }
  };
  const tableProps = (key) => ({
    name: key,
    rows: lists[key],
    onChange: setList(key),
    onRemove: removeRow(key),
    canRemove: (r) => !r.id || !!removeApi[key],
  });

  // Hợp đồng "Không xác định thời hạn" → khóa ô thời hạn
  const contractLabel = useMemo(() => {
    const opt = contractOptions.find((o) => String(o.value) === String(employee.employment_type));
    return opt ? opt.label : employee.employment_type;
  }, [contractOptions, employee.employment_type]);
  const isIndefinite = normalize(contractLabel).includes("khong xac dinh");
  const isResigned = employee.status === RESIGNED;
  const age = calcAge(employee.birth_date);
  const statusInfo = STATUSES.find((s) => s.value === employee.status);
  const positionLabel = getOptions("POSITION").find((o) => String(o.value) === String(employee.position_title))?.label || employee.position_title;
  const departmentLabel = getOptions("DEPARTMENT").find((o) => String(o.value) === String(employee.department_name))?.label || employee.department_name;

  const handleContractChange = (e) => {
    const value = e.target.value;
    const opt = contractOptions.find((o) => String(o.value) === String(value));
    set({ employment_type: value });
    if (normalize(opt ? opt.label : value).includes("khong xac dinh")) setUi((p) => ({ ...p, contract_term_months: "" }));
  };
  const handleStatusChange = (e) => {
    set({ status: e.target.value });
    if (e.target.value !== RESIGNED) setUi((p) => ({ ...p, resign_date: "" }));
  };

  // Chọn mục 1-6 → mở tab tương ứng
  const openTab = (id) => {
    setActiveNav(id);
    document.getElementById("employee-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const navIndex = NAV.findIndex((n) => n.id === activeNav);

  const handleCancel = () => {
    if (dirty && !window.confirm("Bỏ các thay đổi chưa lưu?")) return;
    navigate(-1);
  };

  // [key, cột, tên, tab chứa bảng, tab lịch sử]
  const tables = [
    ["relatives", relativeCols, "Thành phần gia đình", "s1"],
    ["emergencyContacts", emergencyCols, "Người liên hệ khẩn cấp", "s1"],
    ["certificates", certificateCols, "Bằng cấp, chứng chỉ", "s2"],
    ["salaries", salaryCols([]), "Mức lương", "s3"],
    ["allowances", allowanceCols([]), "Phụ cấp", "s3"],
    ["careers", careerCols, "Quá trình công tác", "s5", "careers"],
    ["rewards", rewardCols, "Khen thưởng", "s5", "rewards"],
  ];

  // Trả về { text, tab } để mở đúng tab có lỗi
  const validate = () => {
    if (!employee.full_name.trim()) return { text: "Vui lòng nhập Họ và tên.", tab: "s1" };
    for (const [key, cols, label, tab, subTab] of tables) {
      const bad = lists[key].some((r) => r._dirty && cols.some((c) => c.required && !String(r[c.key] ?? "").trim()));
      if (bad) return { text: `${label}: còn dòng thiếu thông tin bắt buộc (*).`, tab, subTab };
    }
    return null;
  };

  // Lưu các bảng chi tiết (chỉ những dòng thêm mới / đã sửa)
  const saveLists = async (empId) => {
    const now = new Date().toISOString();
    const failed = [];
    const run = async (label, fn) => {
      try { await fn(); } catch (ex) { console.error(label, ex); failed.push(label); }
    };
    const changed = (key) => lists[key].filter((r) => r._dirty);
    const jobs = [];
    const batch = (key, label, api) => {
      const rows = changed(key);
      if (rows.length) jobs.push(run(label, () => api(rows.map((r) => toApi[key](r, empId, now)))));
    };
    batch("relatives", "Thành phần gia đình", employeeService.upsertRelatives);
    batch("emergencyContacts", "Người liên hệ khẩn cấp", employeeService.upsertEmergencyContacts);
    batch("certificates", "Bằng cấp, chứng chỉ", employeeService.upsertCertificates);
    batch("careers", "Quá trình công tác", employeeService.upsertCareerHistories);
    batch("rewards", "Khen thưởng", employeeService.upsertRewardDisciplines);
    const salaries = changed("salaries");
    if (salaries.length)
      jobs.push(run("Mức lương", () => Promise.all(salaries.map((r) => employeeService.upsertSalaries({ file: null, salary: toApi.salaries(r, empId) })))));
    const allowances = changed("allowances");
    if (allowances.length)
      jobs.push(run("Phụ cấp", () => Promise.all(allowances.map((r) => employeeService.upsertAllowances(toApi.allowances(r, empId))))));
    await Promise.all(jobs);
    return failed;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      setMessage({ type: "err", text: err.text });
      setActiveNav(err.tab);
      if (err.subTab) setHistoryTab(err.subTab);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const now = new Date().toISOString();
      // Payload giống form cũ (personal-info-form.tsx)
      const employeeToSend = {
        ...employee,
        id: employeeId,
        temporary_address: ui.same_address ? employee.permanent_address : employee.temporary_address,
        salaries: lists.salaries.map((s) => ({
          id: s.id ?? null, type: s.type,
          amount_old: Number(digits(s.amount_old)) || 0, amount_new: Number(digits(s.amount_new)) || 0,
          start_date: utcISO(s.start_date),
        })),
        allowances: lists.allowances.map((a) => ({
          id: a.id ?? null, content: a.type, amount: Number(digits(a.amount)) || 0, currency: a.currency, date: utcISO(a.date),
        })),
        birth_date: utcISO(employee.birth_date),
        issue_date: utcISO(employee.issue_date),
        join_date: utcISO(employee.join_date),
        official_date: utcISO(employee.official_date),
        insurance_date: utcISO(employee.insurance_date),
        health_insur_expire: utcISO(employee.health_insur_expire),
        graduation_year: employee.graduation_year ? Number(employee.graduation_year) : null,
        insurance_amount: employee.insurance_amount ? Number(digits(employee.insurance_amount)) : null,
        image_path: "",
        image_name: "",
        created_at: profile?.created_at || now,
        updated_at: now,
      };

      const res = await employeeService.upsertEmployee({ file, employee: employeeToSend });
      const savedId = res?.id || employeeId;

      const hasChanges = Object.keys(toApi).some((k) => lists[k].some((r) => r._dirty));
      let failed = [];
      if (savedId) failed = await saveLists(savedId);
      else if (hasChanges) failed = ["các bảng chi tiết (không nhận được mã nhân viên)"];

      const okText = isNew ? "Tạo nhân viên thành công!" : "Cập nhật thông tin nhân viên thành công!";
      if (failed.length) {
        setMessage({ type: "err", text: `${okText} Nhưng chưa lưu được: ${failed.join(", ")}.` });
      } else {
        setMessage({ type: "ok", text: okText });
        setDirty(false);
        setFile(null);
      }
      if (onSaved) {
        // Tạo mới sẽ chuyển trang → báo bằng alert như form cũ
        if (isNew) window.alert(failed.length ? `${okText}\nChưa lưu được: ${failed.join(", ")}.` : okText);
        onSaved(savedId);
      } else if (isNew && !failed.length) {
        setEmployee(initialEmployee);
        setUi(initialUiOnly);
        setLists(emptyLists);
      }
      if (!isNew && savedId) loadLists(savedId);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error(error);
      let text = isNew ? "Có lỗi khi tạo nhân viên!" : "Có lỗi khi cập nhật thông tin nhân viên!";
      if (error?.response) {
        text += ` (Status ${error.response.status})`;
        const d = error.response.data;
        if (d) text += ` ${typeof d === "string" ? d : JSON.stringify(d)}`;
      } else if (error?.message) {
        text += ` ${error.message}`;
      }
      setMessage({ type: "err", text });
    }
    setLoading(false);
  };

  // Tab lịch sử
  const salaryChanges = lists.salaries.filter((s) => s.id);
  const HISTORY_TABS = [
    { id: "careers", label: "Quá trình công tác" },
    { id: "salaryChanges", label: "Thay đổi lương" },
    { id: "reviews", label: "Đánh giá hiệu suất" },
    { id: "rewards", label: "Khen thưởng" },
    { id: "disciplines", label: "Kỷ luật" },
  ];
  const renderHistoryTab = () => {
    switch (historyTab) {
      case "careers":
        return (
          <>
            <div className="flex justify-end"><AddButton onClick={addRow("careers")}>Thêm quá trình</AddButton></div>
            <EditableTable {...tableProps("careers")} columns={careerCols}
              emptyTitle="Chưa có dữ liệu" emptyHint="Ghi nhận các lần bổ nhiệm, điều chuyển, thăng tiến" />
          </>
        );
      case "salaryChanges":
        return (
          <div className="border border-[#E3E6EB] rounded-[10px] overflow-x-auto bg-white">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  <th className={`${thCls} text-left`}>Loại lương</th>
                  <th className={`${thCls} text-right`}>Mức lương cũ</th>
                  <th className={`${thCls} text-right`}>Mức lương mới</th>
                  <th className={`${thCls} text-right`}>Tỉ lệ</th>
                  <th className={`${thCls} text-left`}>Thời gian điều chỉnh</th>
                </tr>
              </thead>
              <tbody>
                {salaryChanges.map((s) => {
                  const o = Number(s.amount_old) || 0;
                  const n = Number(s.amount_new) || 0;
                  const pct = o ? `${(((n - o) / o) * 100).toFixed(1)}%` : "—";
                  return (
                    <tr key={s._key} className="border-b border-[#EEF0F3] last:border-b-0">
                      <td className="px-3.5 py-3">{s.type}</td>
                      <td className="px-3.5 py-3 text-right tabular-nums">{formatMoney(s.amount_old)}</td>
                      <td className="px-3.5 py-3 text-right tabular-nums">{formatMoney(s.amount_new)}</td>
                      <td className="px-3.5 py-3 text-right tabular-nums">{pct}</td>
                      <td className="px-3.5 py-3">{s.start_date ? dayjs(s.start_date).format("DD/MM/YYYY") : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {salaryChanges.length === 0 && (
              <EmptyState title="Chưa có dữ liệu" hint="Lịch sử điều chỉnh lấy từ bảng Mức lương ở mục 3" />
            )}
          </div>
        );
      case "reviews":
        return (
          <>
            <div className="flex justify-between items-center gap-3 flex-wrap">
              <span className="text-xs text-[#5B6472]">Chưa có API lưu — dữ liệu chỉ hiển thị tạm trên màn hình.</span>
              <AddButton onClick={addRow("reviews")}>Thêm đánh giá</AddButton>
            </div>
            <EditableTable name="reviews" rows={lists.reviews} onChange={setList("reviews")} onRemove={removeRow("reviews")}
              columns={reviewCols} emptyTitle="Chưa có dữ liệu" emptyHint="Thêm kết quả đánh giá theo kỳ" />
          </>
        );
      case "rewards":
        return (
          <>
            <div className="flex justify-end"><AddButton onClick={addRow("rewards")}>Thêm khen thưởng</AddButton></div>
            <EditableTable {...tableProps("rewards")} columns={rewardCols}
              emptyTitle="Chưa có dữ liệu" emptyHint="Thêm quyết định khen thưởng" />
          </>
        );
      default:
        return (
          <>
            <div className="flex justify-between items-center gap-3 flex-wrap">
              <span className="text-xs text-[#5B6472]">Chưa có API lưu — dữ liệu chỉ hiển thị tạm trên màn hình.</span>
              <AddButton onClick={addRow("disciplines")}>Thêm kỷ luật</AddButton>
            </div>
            <EditableTable name="disciplines" rows={lists.disciplines} onChange={setList("disciplines")} onRemove={removeRow("disciplines")}
              columns={disciplineCols} emptyTitle="Chưa có dữ liệu" emptyHint="Thêm quyết định kỷ luật" />
          </>
        );
    }
  };

  const grid3 = "grid gap-x-5 gap-y-[18px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  const grid2 = "grid gap-x-5 gap-y-[18px] grid-cols-1 sm:grid-cols-2";
  const displayName = employee.full_name || (isNew ? "Nhân viên mới" : "—");

  return (
    <form onSubmit={handleSubmit} className="min-h-full bg-[#F4F6F8] flex flex-col text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-[#E3E6EB]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-[18px] flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-col gap-1">
            <nav aria-label="Breadcrumb" className="flex gap-2 items-center text-[13px] text-[#5B6472]">
              <span>Nhân sự</span>
              <span aria-hidden="true">/</span>
              <span>Hồ sơ nhân viên</span>
              <span aria-hidden="true">/</span>
              <span className="text-gray-900 font-medium">{displayName}</span>
            </nav>
            <h1 className="m-0 text-[22px] font-bold tracking-tight">{isNew ? "Tạo mới hồ sơ nhân viên" : "Cập nhật hồ sơ nhân viên"}</h1>
          </div>
          <button type="button" className={btnSecondary} onClick={() => window.print()}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
            In hồ sơ
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 md:px-8 pt-6 pb-10 flex flex-col gap-6">
        {message && (
          <div role="status"
            className={`rounded-lg px-4 py-3 text-sm border ${message.type === "ok" ? "bg-[#ECFDF3] border-[#ABEFC6] text-[#067647]" : "bg-[#FEF3F2] border-[#FECDCA] text-[#B42318]"}`}>
            {message.text}
          </div>
        )}

        {/* Thẻ tóm tắt */}
        <section className="bg-white border border-[#E3E6EB] rounded-[14px] p-6 flex flex-wrap gap-6 items-center">
          <div className="flex gap-5 items-center flex-[1_1_420px] min-w-0">
            <div className="w-24 h-32 rounded-[10px] bg-[#EFF4FF] border border-dashed border-[#93B4F5] flex flex-col items-center justify-center gap-1.5 text-blue-700 shrink-0 overflow-hidden">
              {preview ? (
                <img src={preview} alt="Ảnh đại diện" className="w-full h-full object-cover" />
              ) : (
                <>
                  <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
                  <span className="text-[11px] font-semibold">Ảnh 3×4</span>
                </>
              )}
            </div>
            <div className="flex flex-col gap-2.5 min-w-0">
              <div className="flex flex-wrap gap-2.5 items-center">
                <h2 className="m-0 text-2xl font-bold tracking-tight">{displayName}</h2>
                {statusInfo && (
                  <span className={`inline-flex items-center h-[26px] px-2.5 rounded-full text-xs font-semibold ${statusInfo.chip}`}>{statusInfo.label}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-[18px] gap-y-1.5 text-sm text-[#5B6472]">
                <span>Mã NV <b className="text-gray-900 font-semibold">{employee.attendance_code || "—"}</b></span>
                {positionLabel && <span>{positionLabel}</span>}
                {departmentLabel && <span>{departmentLabel}</span>}
              </div>
              <div className="flex gap-2 flex-wrap items-center">
                <label className={`${btnSecondary} h-9 px-3 text-[13px] cursor-pointer`}>
                  <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></svg>
                  {file ? "Đổi ảnh" : "Tải ảnh thẻ"}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={(e) => { setFile(e.target.files?.[0] || null); setDirty(true); }} />
                </label>
                <span className="text-xs text-[#5B6472] truncate max-w-[200px]">{file ? file.name : "JPG hoặc PNG"}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5 flex-[0_1_280px] p-4 rounded-[10px] bg-[#F8F9FB]">
            <span className="text-xs font-semibold tracking-[.06em] uppercase text-[#5B6472]">Lưu ý</span>
            <span className="text-[13px] text-gray-700 leading-normal">
              Trường có dấu <Req /> là bắt buộc. Thông tin được lưu khi bấm <b>{isNew ? "Tạo nhân viên" : "Cập nhật thông tin"}</b> ở cuối trang.
            </span>
          </div>
        </section>

        <div id="employee-tabs" className="flex flex-wrap gap-6 items-start scroll-mt-4">
          {/* Menu tab 1-6 */}
          <div role="tablist" aria-label="Các mục hồ sơ" aria-orientation="vertical"
            className="bg-white border border-[#E3E6EB] rounded-[14px] flex-[1_1_100%] lg:flex-[0_1_248px] p-2.5 flex flex-row lg:flex-col gap-0.5 overflow-x-auto lg:sticky lg:top-4">
            {NAV.map((item, i) => {
              const on = activeNav === item.id;
              return (
                <button key={item.id} type="button" role="tab" id={`tab-${item.id}`} aria-selected={on} aria-controls={item.id}
                  onClick={() => openTab(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left whitespace-nowrap shrink-0 hover:bg-[#F4F6F8] ${on ? "bg-[#EFF4FF] text-blue-700 font-semibold" : "text-gray-700 font-medium"}`}>
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${on ? "bg-blue-600 text-white" : "bg-[#F1F3F6] text-[#5B6472]"}`}>{i + 1}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div role="tabpanel" aria-labelledby={`tab-${activeNav}`} className="flex-[999_1_560px] min-w-0 flex flex-col gap-6">
            {/* 1. Thông tin cá nhân */}
            {activeNav === "s1" && <Section id="s1" n={1} title="Thông tin cá nhân" desc="Lý lịch, giấy tờ tùy thân, địa chỉ và liên hệ">
              <Group title="Thông tin chung">
                <div className={grid3}>
                  <Field label="Họ và tên" htmlFor="full_name" required className="sm:col-span-2">
                    <input id="full_name" name="full_name" value={employee.full_name} onChange={handleChange} required placeholder="VD: Nguyễn Văn A" className={inputCls} />
                  </Field>
                  <div>
                    <span className="block text-[13px] font-medium text-gray-700 mb-1.5">Giới tính</span>
                    <div role="radiogroup" aria-label="Giới tính" className="flex gap-1.5 flex-wrap">
                      {GENDERS.map((g) => {
                        const on = employee.gender === g.value;
                        return (
                          <label key={g.value}
                            className={`flex-1 min-w-[72px] h-[42px] flex items-center justify-center gap-2 border rounded-lg text-sm cursor-pointer ${on ? "border-blue-600 bg-[#EFF4FF] text-blue-700 font-semibold" : "border-[#D5DAE1] bg-white"}`}>
                            <input type="radio" name="gender" value={g.value} checked={on} onChange={handleChange} className="accent-blue-600 m-0" />
                            {g.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <Field label="Ngày sinh" htmlFor="birth_date">
                    <input type="date" id="birth_date" name="birth_date" value={employee.birth_date} onChange={handleChange} className={inputCls} />
                  </Field>
                  <Field label="Tuổi">
                    <div className="h-[42px] px-3 border border-dashed border-[#D5DAE1] rounded-lg bg-[#F8F9FB] text-sm text-gray-700 flex items-center justify-between">
                      <span>{age !== null ? `${age} tuổi` : "—"}</span>
                      <span className="text-xs text-[#5B6472]">Tự động tính</span>
                    </div>
                  </Field>
                  <Field label="Tình trạng hôn nhân" htmlFor="marital_status">
                    <select id="marital_status" name="marital_status" value={employee.marital_status} onChange={handleChange} className={inputCls}>
                      <option value="">— Chọn —</option>
                      {employee.marital_status && !MARITAL.some((m) => m.value === employee.marital_status) && <option value={employee.marital_status}>{employee.marital_status}</option>}
                      {MARITAL.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Dân tộc" htmlFor="ethnicity">
                    <input id="ethnicity" name="ethnicity" value={ui.ethnicity} onChange={handleUiChange} placeholder="VD: Kinh" className={inputCls} />
                  </Field>
                  <Field label="Tôn giáo" htmlFor="religion">
                    <input id="religion" name="religion" value={ui.religion} onChange={handleUiChange} placeholder="VD: Không" className={inputCls} />
                  </Field>
                  <Field label="Nơi sinh" htmlFor="birth_place">
                    <input id="birth_place" name="birth_place" value={employee.birth_place} onChange={handleChange} placeholder="Tỉnh / Thành phố" className={inputCls} />
                  </Field>
                  <Field label="Quê quán" htmlFor="home_town" className="sm:col-span-2">
                    <input id="home_town" name="home_town" value={employee.home_town} onChange={handleChange} placeholder="Xã/Phường, Tỉnh/Thành phố" className={inputCls} />
                  </Field>
                </div>
              </Group>

              <Group title="Giấy tờ tùy thân">
                <div className={grid3}>
                  <Field label="Số CCCD / CMND" htmlFor="citizen_id_number">
                    <input id="citizen_id_number" name="citizen_id_number" inputMode="numeric" value={employee.citizen_id_number} onChange={handleChange} placeholder="12 chữ số" className={inputCls} />
                  </Field>
                  <Field label="Ngày cấp" htmlFor="issue_date">
                    <input type="date" id="issue_date" name="issue_date" value={employee.issue_date} onChange={handleChange} className={inputCls} />
                  </Field>
                  <Field label="Nơi cấp" htmlFor="issue_place">
                    <input id="issue_place" name="issue_place" value={employee.issue_place} onChange={handleChange} placeholder="VD: Cục CS QLHC về TTXH" className={inputCls} />
                  </Field>
                </div>
              </Group>

              <Group title="Địa chỉ">
                <div className="flex flex-col gap-[18px]">
                  <Field label="Địa chỉ thường trú" htmlFor="permanent_address">
                    <input id="permanent_address" name="permanent_address" value={employee.permanent_address} onChange={handleChange} placeholder="Số nhà, đường, phường/xã, tỉnh/thành phố" className={inputCls} />
                  </Field>
                  <div>
                    <div className="flex justify-between items-center gap-3 mb-1.5 flex-wrap">
                      <label htmlFor="temporary_address" className="text-[13px] font-medium text-gray-700">Địa chỉ tạm trú</label>
                      <label className="inline-flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer">
                        <input type="checkbox" name="same_address" checked={ui.same_address} onChange={handleUiChange} className="accent-blue-600 w-4 h-4 m-0" />
                        Giống địa chỉ thường trú
                      </label>
                    </div>
                    <input id="temporary_address" name="temporary_address"
                      value={ui.same_address ? employee.permanent_address : employee.temporary_address}
                      onChange={handleChange} disabled={ui.same_address}
                      placeholder={ui.same_address ? "Giống địa chỉ thường trú" : "Số nhà, đường, phường/xã, tỉnh/thành phố"} className={inputCls} />
                  </div>
                </div>
              </Group>

              <Group title="Liên hệ">
                <div className={grid2}>
                  <Field label="Số điện thoại cá nhân" htmlFor="personal_phone">
                    <input type="tel" id="personal_phone" name="personal_phone" value={employee.personal_phone} onChange={handleChange} placeholder="09xx xxx xxx" className={inputCls} />
                  </Field>
                  <Field label="Email cá nhân" htmlFor="personal_email">
                    <input type="email" id="personal_email" name="personal_email" value={employee.personal_email} onChange={handleChange} placeholder="ten@gmail.com" className={inputCls} />
                  </Field>
                  <Field label="Số điện thoại công ty" htmlFor="company_phone">
                    <input type="tel" id="company_phone" name="company_phone" value={employee.company_phone} onChange={handleChange} placeholder="Số máy lẻ hoặc di động" className={inputCls} />
                  </Field>
                  <Field label="Email công ty" htmlFor="company_email">
                    <input type="email" id="company_email" name="company_email" value={employee.company_email} onChange={handleChange} placeholder="ten@congty.vn" className={inputCls} />
                  </Field>
                </div>
              </Group>

              <Group title="Thành phần gia đình" action={<AddButton onClick={addRow("relatives")}>Thêm thành viên</AddButton>}>
                <EditableTable {...tableProps("relatives")} columns={relativeCols} emptyTitle="Chưa có thành viên nào" emptyHint="Thêm bố, mẹ, vợ/chồng, con…" />
              </Group>

              <Group title="Người liên hệ khẩn cấp" action={<AddButton onClick={addRow("emergencyContacts")}>Thêm liên hệ</AddButton>}>
                <EditableTable {...tableProps("emergencyContacts")} columns={emergencyCols} emptyTitle="Chưa có liên hệ nào" emptyHint="Nên có ít nhất 1 người liên hệ khi khẩn cấp" />
              </Group>
            </Section>}

            {/* 2. Học vấn */}
            {activeNav === "s2" && <Section id="s2" n={2} title="Học vấn & chuyên môn" desc="Trình độ, bằng cấp và kỹ năng">
              <Group>
                <div className={grid2}>
                  <Field label="Trình độ học vấn cao nhất" htmlFor="highest_degree">
                    <StaticSelect id="highest_degree" name="highest_degree" value={employee.highest_degree} items={DEGREES} onChange={handleChange} />
                  </Field>
                  <Field label="Chuyên ngành đào tạo" htmlFor="major">
                    <input id="major" name="major" value={employee.major} onChange={handleChange} placeholder="VD: Quản trị nhân lực" className={inputCls} />
                  </Field>
                  <Field label="Trường" htmlFor="school_name">
                    <input id="school_name" name="school_name" value={employee.school_name} onChange={handleChange} placeholder="Tên trường đào tạo" className={inputCls} />
                  </Field>
                  <Field label="Năm tốt nghiệp" htmlFor="graduation_year">
                    <input type="number" id="graduation_year" name="graduation_year" min="1960" max="2100" value={employee.graduation_year} onChange={handleChange} placeholder="VD: 2020" className={inputCls} />
                  </Field>
                </div>
              </Group>
              <Group title="Bằng cấp, chứng chỉ liên quan" action={<AddButton onClick={addRow("certificates")}>Thêm chứng chỉ</AddButton>}>
                <EditableTable {...tableProps("certificates")} columns={certificateCols} emptyTitle="Chưa có bằng cấp nào" emptyHint="Thêm bằng cấp, chứng chỉ ngoại ngữ, tin học…" />
              </Group>
              <Group>
                <Field label="Kỹ năng đặc biệt" htmlFor="special_skills" hint="Phân tách các kỹ năng bằng dấu phẩy">
                  <input id="special_skills" name="special_skills" value={employee.special_skills} onChange={handleChange} placeholder="VD: Tiếng Anh giao tiếp, Excel nâng cao, lái xe hạng B2" className={inputCls} />
                </Field>
              </Group>
            </Section>}

            {/* 3. Công việc */}
            {activeNav === "s3" && <Section id="s3" n={3} title="Thông tin công việc" desc="Vị trí, trạng thái, hợp đồng và thu nhập">
              <Group title="Vị trí công tác">
                <div className={grid3}>
                  <Field label="Mã nhân viên" htmlFor="attendance_code">
                    <input id="attendance_code" name="attendance_code" value={employee.attendance_code} onChange={handleChange} className={inputCls} />
                  </Field>
                  <Field label="Chức danh / vị trí" htmlFor="position_title">
                    <FilterSelect id="position_title" name="position_title" value={employee.position_title} options={getOptions("POSITION")} onChange={handleChange} />
                  </Field>
                  <Field label="Cấp bậc" htmlFor="rank">
                    <input id="rank" name="rank" value={employee.rank} onChange={handleChange} placeholder="VD: Bậc 2" className={inputCls} />
                  </Field>
                  <Field label="Phòng / Bộ phận" htmlFor="department_name">
                    <FilterSelect id="department_name" name="department_name" value={employee.department_name} options={getOptions("DEPARTMENT")} onChange={handleChange} />
                  </Field>
                  <Field label="Địa điểm làm việc" htmlFor="work_location">
                    <FilterSelect id="work_location" name="work_location" value={employee.work_location} options={getOptions("WORK_LOCATION")} onChange={handleChange} />
                  </Field>
                  <div className="hidden lg:block" />
                  <Field label="Người quản lý trực tiếp" htmlFor="manager_id">
                    <input id="manager_id" name="manager_id" value={employee.manager_id} onChange={handleChange} placeholder="Mã NV người quản lý" className={inputCls} />
                  </Field>
                  <Field label="Trưởng nhóm / Trưởng phòng" htmlFor="leader">
                    <input id="leader" name="leader" value={employee.leader} onChange={handleChange} placeholder="Mã NV hoặc tên" className={inputCls} />
                  </Field>
                </div>
              </Group>

              <Group title="Trạng thái & mốc thời gian">
                <div className={grid3}>
                  <Field label="Trạng thái" htmlFor="status">
                    <select id="status" name="status" value={employee.status} onChange={handleStatusChange} className={inputCls}>
                      <option value="">— Chọn —</option>
                      {employee.status && !STATUSES.some((s) => s.value === employee.status) && <option value={employee.status}>{employee.status}</option>}
                      {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </Field>
                  <Field label="Ngày vào công ty" htmlFor="join_date">
                    <input type="date" id="join_date" name="join_date" value={employee.join_date} onChange={handleChange} className={inputCls} />
                  </Field>
                  <Field label="Ngày bắt đầu làm việc" htmlFor="start_date">
                    <input type="date" id="start_date" name="start_date" value={ui.start_date} onChange={handleUiChange} className={inputCls} />
                  </Field>
                  <Field label="Ngày làm việc chính thức" htmlFor="official_date">
                    <input type="date" id="official_date" name="official_date" value={employee.official_date} onChange={handleChange} className={inputCls} />
                  </Field>
                  <Field label="Ngày nghỉ việc" htmlFor="resign_date" hint={isResigned ? null : "Chỉ nhập khi trạng thái là “Đã nghỉ việc”"}>
                    <input type="date" id="resign_date" name="resign_date" value={ui.resign_date} onChange={handleUiChange} disabled={!isResigned} className={inputCls} />
                  </Field>
                </div>
              </Group>

              <Group title="Hợp đồng lao động">
                <div className={grid3}>
                  <Field label="Loại hợp đồng" htmlFor="employment_type" className="sm:col-span-2">
                    <FilterSelect id="employment_type" name="employment_type" value={employee.employment_type} options={contractOptions} onChange={handleContractChange} />
                  </Field>
                  <Field label="Thời hạn hợp đồng" htmlFor="contract_term_months" hint={isIndefinite ? "Không áp dụng cho HĐ không xác định thời hạn" : null}>
                    <Suffix unit="tháng">
                      <input type="number" min="1" id="contract_term_months" name="contract_term_months" placeholder="0"
                        value={ui.contract_term_months} onChange={handleUiChange} disabled={isIndefinite} className={`${inputCls} pr-14`} />
                    </Suffix>
                  </Field>
                </div>
              </Group>

              <Group title="Mức lương" action={<AddButton onClick={addRow("salaries")}>Thêm mức lương</AddButton>}>
                <EditableTable {...tableProps("salaries")} columns={salaryCols(salaryTypeOptions)}
                  emptyTitle="Chưa có mức lương" emptyHint="Thêm lương cơ bản để tính bảo hiểm và bảng lương" />
              </Group>

              <Group title="Phụ cấp" action={<AddButton onClick={addRow("allowances", { currency: "VND" })}>Thêm phụ cấp</AddButton>}>
                <EditableTable {...tableProps("allowances")} columns={allowanceCols(allowanceTypeOptions)}
                  emptyTitle="Chưa có phụ cấp" emptyHint="Thêm phụ cấp ăn trưa, xăng xe, điện thoại…" />
              </Group>
            </Section>}

            {/* 4. Pháp lý & bảo hiểm */}
            {activeNav === "s4" && <Section id="s4" n={4} title="Pháp lý, bảo hiểm & thuế" desc="BHXH, bảo hiểm sức khỏe, thuế TNCN và tài khoản nhận lương">
              <Group title="Bảo hiểm xã hội">
                <div className={grid3}>
                  <Field label="Số sổ BHXH" htmlFor="social_insurance_no">
                    <input id="social_insurance_no" name="social_insurance_no" inputMode="numeric" value={employee.social_insurance_no} onChange={handleChange} placeholder="10 chữ số" className={inputCls} />
                  </Field>
                  <Field label="Tình trạng bảo hiểm" htmlFor="insurance_status">
                    <StaticSelect id="insurance_status" name="insurance_status" value={employee.insurance_status} items={INSURANCE_STATUS} onChange={handleChange} />
                  </Field>
                  <Field label="Ngày tham gia BH" htmlFor="insurance_date">
                    <input type="date" id="insurance_date" name="insurance_date" value={employee.insurance_date} onChange={handleChange} className={inputCls} />
                  </Field>
                  <Field label="Thời gian đóng BH" htmlFor="insurance_months">
                    <Suffix unit="tháng">
                      <input type="number" min="0" id="insurance_months" name="insurance_months" placeholder="0"
                        value={ui.insurance_months} onChange={handleUiChange} className={`${inputCls} pr-14`} />
                    </Suffix>
                  </Field>
                  <Field label="Mức đóng" htmlFor="insurance_amount">
                    <Suffix unit="VND">
                      <input inputMode="numeric" id="insurance_amount" name="insurance_amount" placeholder="0"
                        value={formatMoney(employee.insurance_amount)} onChange={(e) => set({ insurance_amount: digits(e.target.value) })}
                        className={`${inputCls} pr-14 text-right tabular-nums`} />
                    </Suffix>
                  </Field>
                  <Field label="Nơi đăng ký KCB ban đầu" htmlFor="kcb_place">
                    <input id="kcb_place" name="kcb_place" value={employee.kcb_place} onChange={handleChange} placeholder="Tên bệnh viện / phòng khám" className={inputCls} />
                  </Field>
                </div>
              </Group>

              <Group title="Bảo hiểm sức khỏe">
                <div className={grid3}>
                  <Field label="Gói bảo hiểm sức khỏe" htmlFor="health_insurance" className="sm:col-span-2">
                    <input id="health_insurance" name="health_insurance" value={employee.health_insurance} onChange={handleChange} placeholder="Tên gói / nhà cung cấp" className={inputCls} />
                  </Field>
                  <Field label="Hiệu lực đến" htmlFor="health_insur_expire">
                    <input type="date" id="health_insur_expire" name="health_insur_expire" value={employee.health_insur_expire} onChange={handleChange} className={inputCls} />
                  </Field>
                </div>
              </Group>

              <Group title="Thuế thu nhập cá nhân">
                <div className={`${grid3} mb-[18px]`}>
                  <Field label="Mã số thuế cá nhân" htmlFor="tax_id">
                    <input id="tax_id" name="tax_id" inputMode="numeric" value={employee.tax_id} onChange={handleChange} placeholder="10 chữ số" className={inputCls} />
                  </Field>
                </div>
                <div className="flex justify-between items-center gap-3 mb-3 flex-wrap">
                  <span className="text-sm font-semibold text-gray-900">Người phụ thuộc</span>
                  <AddButton onClick={addRow("dependents")}>Thêm người phụ thuộc</AddButton>
                </div>
                <EditableTable name="dependents" rows={lists.dependents} onChange={setList("dependents")} onRemove={removeRow("dependents")}
                  columns={dependentCols} emptyTitle="Chưa có người phụ thuộc" emptyHint="Dùng để tính giảm trừ gia cảnh" />
              </Group>

              <Group title="Tài khoản nhận lương">
                <div className={grid2}>
                  <Field label="Số tài khoản" htmlFor="bank_account">
                    <input id="bank_account" name="bank_account" inputMode="numeric" value={employee.bank_account} onChange={handleChange} placeholder="Số tài khoản ngân hàng" className={inputCls} />
                  </Field>
                  <Field label="Ngân hàng" htmlFor="bank_name">
                    <StaticSelect id="bank_name" name="bank_name" value={employee.bank_name} items={BANKS} onChange={handleChange} placeholder="— Chọn ngân hàng —" />
                  </Field>
                </div>
              </Group>
            </Section>}

            {/* 5. Lịch sử */}
            {activeNav === "s5" && <Section id="s5" n={5} title="Lịch sử công tác & đánh giá" desc="Thăng tiến, điều chỉnh lương, đánh giá, khen thưởng và kỷ luật" flush>
              <div role="tablist" aria-label="Lịch sử" className="flex gap-1 px-6 pt-4 border-b border-[#E3E6EB] overflow-x-auto">
                {HISTORY_TABS.map((t) => {
                  const on = t.id === historyTab;
                  return (
                    <button key={t.id} type="button" role="tab" aria-selected={on} onClick={() => setHistoryTab(t.id)}
                      className={`h-10 px-3.5 border-b-2 text-sm whitespace-nowrap ${on ? "text-blue-700 border-blue-600 font-semibold" : "text-[#5B6472] border-transparent font-medium hover:text-gray-900"}`}>
                      {t.label}
                    </button>
                  );
                })}
              </div>
              <div className="px-6 pt-5 pb-6 flex flex-col gap-3">{renderHistoryTab()}</div>
            </Section>}

            {/* 6. Khác */}
            {activeNav === "s6" && <Section id="s6" n={6} title="Phát triển & thông tin khác" desc="Định hướng nghề nghiệp và sức khỏe">
              <div className={grid2}>
                <TextCounter id="job_objective" name="job_objective" label="Mục tiêu nghề nghiệp" value={employee.job_objective} onChange={handleChange} placeholder="Mục tiêu ngắn hạn và dài hạn" />
                <TextCounter id="development_plan" name="development_plan" label="Lộ trình phát triển bản thân" value={employee.development_plan} onChange={handleChange} placeholder="Kế hoạch học tập, đào tạo, thăng tiến" />
                <TextCounter id="health_status" name="health_status" label="Tình trạng sức khỏe" value={employee.health_status} onChange={handleChange}
                  placeholder="Ghi chú sức khỏe liên quan đến công việc (nếu có)" className="sm:col-span-2" minH={72} />
              </div>
            </Section>}

            {/* Chuyển tab trước / sau */}
            <div className="flex justify-between gap-3">
              {navIndex > 0 ? (
                <button type="button" className={btnSecondary} onClick={() => openTab(NAV[navIndex - 1].id)}>
                  ← {navIndex}. {NAV[navIndex - 1].label}
                </button>
              ) : <span />}
              {navIndex < NAV.length - 1 && (
                <button type="button" className={btnSecondary} onClick={() => openTab(NAV[navIndex + 1].id)}>
                  {navIndex + 2}. {NAV[navIndex + 1].label} →
                </button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Thanh thao tác cố định */}
      <div className="sticky bottom-0 z-10 bg-white border-t border-[#E3E6EB] shadow-[0_-6px_20px_rgba(17,24,39,.06)]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-3 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2 text-[13px] text-[#5B6472]">
            {dirty ? (
              <>
                <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                <span className="text-[#92400E] font-medium">Có thay đổi chưa lưu</span>
              </>
            ) : (
              <span>Chưa có thay đổi</span>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <button type="button" className={btnSecondary} onClick={handleCancel}>Hủy</button>
            <button type="submit" className={btnPrimary} disabled={loading}>
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
              {loading ? (isNew ? "Đang tạo..." : "Đang cập nhật...") : (isNew ? "Tạo nhân viên" : "Cập nhật thông tin")}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export default EmployeeForm;
