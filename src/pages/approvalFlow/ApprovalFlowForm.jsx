// Quản trị › Cấu hình luồng duyệt – trang Thiết lập / Cập nhật (Spec HRM UI v1 §5.3, §5.4)
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import approvalFlowService from "../../services/approvalFlowService";
import positionService from "../../services/positionService";
import { getDepartmentOptions } from "../../services/departmentService";
import MultiSelect from "../../components/ui/MultiSelect";
import { Breadcrumb, Icon, SubmitButton, parseApiError, toast } from "../../components/ui";

const CREATOR = "CREATOR_DEPARTMENT";
const SPECIFIC = "SPECIFIC";
const CREATOR_LABEL = "Phòng ban của người tạo đơn";
const MAX_STEPS = 10;

let stepSeq = 0;
const newStep = (s = {}) => ({
  key: ++stepSeq,
  dept: s.approverDeptType === CREATOR ? "CREATOR" : s.approverDepartmentId ? String(s.approverDepartmentId) : "",
  level: s.approverLevel ? String(s.approverLevel) : "",
  hasMinDays: s.minLeaveDays != null,
  minDays: s.minLeaveDays != null ? String(s.minLeaveDays) : "7",
});

const EMPTY_FORM = () => ({
  name: "",
  isActive: true,
  applicantLevel: "",
  allRequestTypes: true,
  requestTypes: [],
  allDepartments: true,
  departmentIds: [],
  steps: [newStep()],
});

const snapshot = (f) =>
  JSON.stringify({ ...f, steps: f.steps.map(({ key, ...rest }) => rest) });

const isLeaveOnly = (f) => !f.allRequestTypes && f.requestTypes.length === 1 && f.requestTypes[0] === "LEAVE";

// FE validate (V1, V2, V3, V6, V7). V4, V5 do BE kiểm tra.
function validateForm(f, levels) {
  const errors = [];
  if (!f.name.trim()) errors.push({ field: "name", message: "Vui lòng nhập tên luồng duyệt" });
  const minExisting = levels.length ? Math.min(...levels.map((l) => l.level)) : 0;
  const leaveOnly = isLeaveOnly(f);
  const seen = {};
  f.steps.forEach((s, i) => {
    const n = i + 1;
    if (!s.dept || !s.level) {
      errors.push({ stepNo: n, message: `Bước ${n}: Vui lòng chọn phòng ban và cấp người duyệt` });
      return;
    }
    const level = Number(s.level);
    if (s.dept === "CREATOR") {
      const applicant = f.applicantLevel ? Number(f.applicantLevel) : minExisting;
      if (!applicant || level >= applicant) {
        errors.push({
          stepNo: n,
          message: `Bước ${n}: Phòng ban của người tạo đơn, cấp người duyệt phải lớn hơn người tạo đơn. Vui lòng cấu hình lại.`,
        });
      }
    }
    if (leaveOnly && s.hasMinDays && !(Number(s.minDays) > 0)) {
      errors.push({ stepNo: n, message: `Bước ${n}: Số ngày nghỉ phải lớn hơn 0` });
    }
    const key = `${s.dept}|${s.level}`;
    if (seen[key]) errors.push({ stepNo: n, message: `Bước ${n} trùng với Bước ${seen[key]}` });
    else seen[key] = n;
  });
  return errors;
}

function toBody(f) {
  const leaveOnly = isLeaveOnly(f);
  return {
    name: f.name.trim(),
    isActive: f.isActive,
    applicantLevel: f.applicantLevel ? Number(f.applicantLevel) : null,
    allRequestTypes: f.allRequestTypes,
    requestTypes: f.allRequestTypes ? [] : f.requestTypes,
    allDepartments: f.allDepartments,
    departmentIds: f.allDepartments ? [] : f.departmentIds,
    steps: f.steps.map((s, i) => ({
      stepNo: i + 1,
      approverDeptType: s.dept === "CREATOR" ? CREATOR : s.dept ? SPECIFIC : "",
      approverDepartmentId: s.dept && s.dept !== "CREATOR" ? Number(s.dept) : null,
      approverLevel: s.level ? Number(s.level) : null,
      minLeaveDays: leaveOnly && s.hasMinDays ? Number(s.minDays) : null,
    })),
  };
}

function SectionTitle({ no, children }) {
  return (
    <div className="flex items-center gap-2 pb-3 mb-4 border-b" style={{ borderColor: "var(--color-border)" }}>
      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}>
        {no}
      </span>
      <h2 className="text-base font-bold m-0">{children}</h2>
    </div>
  );
}

export default function ApprovalFlowForm() {
  const { id } = useParams();
  const isEdit = !!id && id !== "moi";
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [initial, setInitial] = useState(() => snapshot(EMPTY_FORM()));
  const [levels, setLevels] = useState([]);
  const [requestTypes, setRequestTypes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const errorRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [lv, rt, deps, flow] = await Promise.all([
          positionService.levels(),
          approvalFlowService.requestTypes(),
          getDepartmentOptions({ activeOnly: false }),
          isEdit ? approvalFlowService.get(id) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setLevels(lv);
        setRequestTypes(rt);
        setDepartments(deps);
        if (flow) {
          const f = {
            name: flow.name || "",
            isActive: !!flow.isActive,
            applicantLevel: flow.applicantLevel ? String(flow.applicantLevel) : "",
            allRequestTypes: !!flow.allRequestTypes,
            requestTypes: flow.requestTypes || [],
            allDepartments: !!flow.allDepartments,
            departmentIds: flow.departmentIds || [],
            steps: (flow.steps || []).length ? flow.steps.map(newStep) : [newStep()],
          };
          setForm(f);
          setInitial(snapshot(f));
        }
      } catch (err) {
        toast.error(parseApiError(err).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  const dirty = snapshot(form) !== initial;
  const leaveOnly = isLeaveOnly(form);

  // Option & label helpers
  const levelLabel = (lv) => levels.find((l) => String(l.level) === String(lv))?.label || (lv ? `Cấp ${lv}` : "");
  const activeDepartments = useMemo(() => departments.filter((d) => d.isActive), [departments]);
  const deptName = (deptId) => departments.find((d) => String(d.id) === String(deptId))?.name || "";
  const deptOptions = (current) => {
    const list = [...activeDepartments];
    if (current && current !== "CREATOR" && !list.some((d) => String(d.id) === current)) {
      const d = departments.find((x) => String(x.id) === current);
      if (d) list.push(d);
    }
    return list;
  };
  const appliedDeptOptions = useMemo(() => {
    const list = activeDepartments.map((d) => ({ value: d.id, label: d.name }));
    form.departmentIds.forEach((id) => {
      if (!list.some((o) => o.value === id)) {
        const d = departments.find((x) => x.id === id);
        if (d) list.push({ value: d.id, label: `${d.name} (Ngừng hoạt động)` });
      }
    });
    return list;
  }, [activeDepartments, departments, form.departmentIds]);

  // Đối tượng tạo đơn: chỉ cấp có chức vụ hoạt động (giữ giá trị cũ nếu cấp đó không còn)
  const applicantOptions = useMemo(() => {
    const list = levels.map((l) => ({ value: String(l.level), label: l.label }));
    if (form.applicantLevel && !list.some((o) => o.value === form.applicantLevel)) {
      list.push({ value: form.applicantLevel, label: `Cấp ${form.applicantLevel}` });
    }
    return list;
  }, [levels, form.applicantLevel]);

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));
  const updateStep = (key, patch) => setForm((f) => ({ ...f, steps: f.steps.map((s) => (s.key === key ? { ...s, ...patch } : s)) }));

  const setRequestTypesValue = (all, values) => {
    setForm((f) => {
      const next = { ...f, allRequestTypes: all, requestTypes: values };
      // Đổi loại đơn khác "chỉ Đơn xin nghỉ" → ẩn và xóa điều kiện của mọi bước
      if (!isLeaveOnly(next)) next.steps = next.steps.map((s) => ({ ...s, hasMinDays: false, minDays: "7" }));
      return next;
    });
  };

  const errorSteps = useMemo(() => new Set(errors.filter((e) => e.stepNo).map((e) => e.stepNo)), [errors]);

  const goBack = () => {
    if (dirty && !window.confirm("Bạn có muốn bỏ thay đổi?")) return;
    navigate("/quan-tri/luong-duyet");
  };

  const showErrors = (list) => {
    setErrors(list);
    if (list.length) {
      toast.error(list[0].message);
      setTimeout(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
    }
  };

  const save = async () => {
    if (saving) return;
    const feErrors = validateForm(form, levels);
    if (feErrors.length) {
      showErrors(feErrors);
      return;
    }
    setSaving(true);
    try {
      const body = toBody(form);
      if (isEdit) await approvalFlowService.update(id, body);
      else await approvalFlowService.create(body);
      setErrors([]);
      setInitial(snapshot(form));
      toast.success("Lưu thành công");
      navigate("/quan-tri/luong-duyet");
    } catch (err) {
      const pe = parseApiError(err);
      showErrors(pe.errors.length ? pe.errors : [{ message: pe.message }]);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-gray-400">Đang tải...</div>;

  const applicantLabel = form.applicantLevel ? levelLabel(form.applicantLevel) : "Tất cả cấp bậc";

  return (
    <div className="-mx-4 lg:-mx-6 -my-5">
      {/* Top bar dính */}
      <div className="sticky top-[40px] z-20 bg-white border-b flex items-center gap-3 px-4 lg:px-6 py-3" style={{ borderColor: "var(--color-border)" }}>
        <button className="hrm-icon-btn" style={{ color: "#374151" }} onClick={goBack} aria-label="Quay lại">
          <Icon.ArrowLeft />
        </button>
        <div className="min-w-0">
          <Breadcrumb />
          <h1 className="text-lg font-bold m-0 truncate">{isEdit ? "Cập nhật luồng duyệt" : "Thiết lập luồng duyệt mới"}</h1>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="hrm-btn hrm-btn-outline" onClick={goBack}>
            Hủy
          </button>
          <SubmitButton loading={saving} onClick={save}>
            Lưu cấu hình
          </SubmitButton>
        </div>
      </div>

      <div className="grid lg:grid-cols-[58fr_42fr]">
        {/* ---------------- Form ---------------- */}
        <div className="px-4 lg:px-6 py-5 flex flex-col gap-7">
          {errors.length > 0 && (
            <div ref={errorRef} className="hrm-alert-error">
              <div className="font-semibold mb-1">Vui lòng kiểm tra lại cấu hình:</div>
              <ul className="list-disc pl-5 m-0">
                {errors.map((e, i) => (
                  <li key={i}>{e.message}</li>
                ))}
              </ul>
            </div>
          )}

          <section>
            <SectionTitle no={1}>Thông tin chung</SectionTitle>
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <label className="hrm-label">
                  Tên luồng duyệt<span className="hrm-required">*</span>
                </label>
                <input
                  className={`hrm-input ${errors.some((e) => e.field === "name") ? "is-invalid" : ""}`}
                  placeholder="Nhập tên luồng duyệt..."
                  maxLength={255}
                  value={form.name}
                  onChange={(e) => update({ name: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer mt-9">
                <input type="checkbox" className="hrm-checkbox" checked={form.isActive} onChange={(e) => update({ isActive: e.target.checked })} />
                Hoạt động
              </label>
            </div>
          </section>

          <section>
            <SectionTitle no={2}>Phạm vi áp dụng</SectionTitle>
            <div className="rounded-xl p-4 flex flex-col gap-4" style={{ background: "#f8f9fb", border: "1px solid var(--color-border)" }}>
              <div className="grid sm:grid-cols-[160px_1fr] items-center gap-2">
                <label className="text-sm font-semibold">Đối tượng tạo đơn:</label>
                <select className="hrm-select" value={form.applicantLevel} onChange={(e) => update({ applicantLevel: e.target.value })}>
                  <option value="">Tất cả cấp bậc</option>
                  {applicantOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="hrm-label">Loại đơn từ</label>
                  <MultiSelect
                    options={requestTypes.map((t) => ({ value: t.code, label: t.name }))}
                    all={form.allRequestTypes}
                    values={form.requestTypes}
                    onChange={setRequestTypesValue}
                  />
                </div>
                <div>
                  <label className="hrm-label">Phòng ban áp dụng</label>
                  <MultiSelect
                    options={appliedDeptOptions}
                    all={form.allDepartments}
                    values={form.departmentIds}
                    searchable
                    searchPlaceholder="Tìm phòng ban..."
                    onChange={(all, values) => update({ allDepartments: all, departmentIds: values })}
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <SectionTitle no={3}>Quy trình phê duyệt</SectionTitle>
            <div className="flex flex-col gap-3">
              {form.steps.map((s, i) => {
                const n = i + 1;
                const hasError = errorSteps.has(n);
                return (
                  <div
                    key={s.key}
                    className="bg-white rounded-xl p-3"
                    style={{ border: `1px solid ${hasError ? "var(--color-danger)" : "var(--color-border)"}` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "var(--color-muted-bg)" }}>
                        B{n}
                      </span>
                      <select
                        className="hrm-select"
                        value={s.dept}
                        onChange={(e) => updateStep(s.key, { dept: e.target.value })}
                      >
                        <option value="">-- Chọn phòng ban phụ trách --</option>
                        <option value="CREATOR">{CREATOR_LABEL}</option>
                        {deptOptions(s.dept).map((d) => (
                          <option key={d.id} value={String(d.id)}>
                            {d.name}
                            {!d.isActive ? " (Ngừng hoạt động)" : ""}
                          </option>
                        ))}
                      </select>
                      <select className="hrm-select" value={s.level} onChange={(e) => updateStep(s.key, { level: e.target.value })}>
                        <option value="">-- Chọn cấp --</option>
                        {levels.map((l) => (
                          <option key={l.level} value={String(l.level)}>
                            {l.label}
                          </option>
                        ))}
                        {s.level && !levels.some((l) => String(l.level) === s.level) && <option value={s.level}>Cấp {s.level}</option>}
                      </select>
                      <button
                        className="hrm-icon-btn shrink-0"
                        style={{ color: "#6b7280" }}
                        disabled={form.steps.length <= 1}
                        title="Xóa bước"
                        onClick={() => setForm((f) => ({ ...f, steps: f.steps.filter((x) => x.key !== s.key) }))}
                      >
                        <Icon.Trash />
                      </button>
                    </div>
                    {leaveOnly && (
                      <div className="flex items-center gap-2 mt-2 ml-12 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          className="hrm-checkbox"
                          id={`min-${s.key}`}
                          checked={s.hasMinDays}
                          onChange={(e) => updateStep(s.key, { hasMinDays: e.target.checked })}
                        />
                        <label htmlFor={`min-${s.key}`} className="cursor-pointer">
                          Chỉ áp dụng khi số ngày nghỉ ≥
                        </label>
                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          className="hrm-input"
                          style={{ width: 80, height: 32 }}
                          disabled={!s.hasMinDays}
                          value={s.minDays}
                          onChange={(e) => updateStep(s.key, { minDays: e.target.value })}
                        />
                        <span>ngày</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {form.steps.length < MAX_STEPS && (
              <button
                className="mt-3 text-sm font-semibold"
                style={{ color: "var(--color-primary)" }}
                onClick={() => setForm((f) => ({ ...f, steps: [...f.steps, newStep()] }))}
              >
                + Thêm cấp phê duyệt
              </button>
            )}
          </section>
        </div>

        {/* ---------------- Preview (realtime, không gọi API) ---------------- */}
        <div className="border-l" style={{ background: "#f3f4f6", borderColor: "var(--color-border)" }}>
          <div className="sticky top-[104px] px-4 lg:px-8 py-6 flex flex-col items-stretch gap-2 max-h-[calc(100vh-104px)] overflow-y-auto">
            <PreviewCard color="#16a34a" icon={<Icon.User />} title="Đối tượng tạo đơn" titleColor="#15803d">
              <div className="text-sm text-gray-700">{applicantLabel}</div>
            </PreviewCard>
            {form.steps.map((s, i) => {
              const n = i + 1;
              const dept = s.dept === "CREATOR" ? CREATOR_LABEL : s.dept ? deptName(s.dept) : "";
              return (
                <React.Fragment key={s.key}>
                  <Arrow />
                  <PreviewCard
                    color="var(--color-primary)"
                    icon={<Icon.Users />}
                    title={`Bước ${n}: Phê duyệt`}
                    titleColor="var(--color-primary)"
                    error={errorSteps.has(n)}
                  >
                    <div className="text-sm text-gray-800">• {dept || "Chưa chọn"}</div>
                    <div className="text-sm" style={{ color: s.level ? "var(--color-primary)" : "#9ca3af" }}>
                      • {s.level ? levelLabel(s.level) : "Chưa chọn"}
                    </div>
                    {leaveOnly && s.hasMinDays && Number(s.minDays) > 0 && (
                      <div className="text-sm text-gray-500">• Khi nghỉ ≥ {s.minDays} ngày</div>
                    )}
                  </PreviewCard>
                </React.Fragment>
              );
            })}
            <Arrow />
            <div className="rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold text-gray-500" style={{ background: "#e5e7eb" }}>
              <Icon.CheckCircle /> Hoàn tất quy trình
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center text-gray-400">
      <Icon.ArrowDown />
    </div>
  );
}

function PreviewCard({ color, icon, title, titleColor, error, children }) {
  return (
    <div
      className="bg-white rounded-xl p-4 flex gap-3 shadow-sm"
      style={{
        borderLeft: `4px solid ${error ? "var(--color-danger)" : color}`,
        outline: error ? "1px solid var(--color-danger)" : "none",
      }}
    >
      <span className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center" style={{ background: "#f3f4f6", color }}>
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-sm font-bold" style={{ color: titleColor }}>
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}
