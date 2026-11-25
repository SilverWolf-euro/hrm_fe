// Modal Thêm / Sửa phòng ban (Spec HRM UI v1 §4.2)
import React, { useEffect, useMemo, useState } from "react";
import {
  AREA_OPTIONS,
  createDepartment,
  getDepartmentById,
  getDepartmentOptions,
  updateDepartment,
} from "../services/departmentService";
import positionService from "../services/positionService";
import { Icon, Modal, SubmitButton, parseApiError, toast } from "./ui";

const EMPTY = { parentId: "", name: "", area: "", isActive: true, positionIds: [] };
const INDENT = 24;

export default function DepartmentModal({ open, departmentId, onClose, onSaved }) {
  const isEdit = !!departmentId;
  const [form, setForm] = useState(EMPTY);
  const [initial, setInitial] = useState(EMPTY);
  const [parents, setParents] = useState([]);
  const [positions, setPositions] = useState([]);
  const [collapsedLevels, setCollapsedLevels] = useState({});
  const [errors, setErrors] = useState({});
  const [formErrors, setFormErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setFormErrors([]);
    setCollapsedLevels({});
    setLoading(true);
    (async () => {
      try {
        let f = EMPTY;
        if (isEdit) {
          const d = await getDepartmentById(departmentId);
          f = {
            parentId: d?.parentId ? String(d.parentId) : "",
            name: d?.name || "",
            area: d?.area || "",
            isActive: !!d?.isActive,
            positionIds: d?.positionIds || [],
          };
        }
        const [opts, pos] = await Promise.all([
          getDepartmentOptions({
            activeOnly: true,
            excludeId: isEdit ? departmentId : undefined,
            includeId: f.parentId || undefined,
          }),
          positionService.options(false),
        ]);
        setForm(f);
        setInitial(f);
        setParents(opts);
        setPositions(pos);
      } catch (err) {
        toast.error(parseApiError(err).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, departmentId, isEdit]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);
  const selected = useMemo(() => new Set(form.positionIds), [form.positionIds]);

  // Chức vụ hoạt động nhóm theo cấp; chức vụ đã gán nhưng ngừng hoạt động hiển thị cuối danh sách
  const { levels, inactiveAssigned } = useMemo(() => {
    const byLevel = {};
    positions
      .filter((p) => p.isActive)
      .forEach((p) => {
        (byLevel[p.level] = byLevel[p.level] || []).push(p);
      });
    Object.values(byLevel).forEach((list) => list.sort((a, b) => a.name.localeCompare(b.name, "vi")));
    return {
      levels: Object.keys(byLevel)
        .map(Number)
        .sort((a, b) => a - b)
        .map((lv) => ({ level: lv, items: byLevel[lv] })),
      inactiveAssigned: positions.filter((p) => !p.isActive && initial.positionIds.includes(p.id)),
    };
  }, [positions, initial.positionIds]);

  const isHidden = (level) => Object.entries(collapsedLevels).some(([lv, c]) => c && Number(lv) < level);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const togglePosition = (id) =>
    set("positionIds", selected.has(id) ? form.positionIds.filter((x) => x !== id) : [...form.positionIds, id]);

  const validate = () => {
    const e = {};
    const name = form.name.trim();
    if (!name) e.name = "Vui lòng nhập tên phòng ban";
    else if (name.length > 50) e.name = "Tên phòng ban tối đa 50 ký tự";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (saving || !validate()) return;
    setSaving(true);
    setFormErrors([]);
    const body = {
      parentId: form.parentId ? Number(form.parentId) : null,
      name: form.name.trim(),
      area: form.area || null,
      isActive: form.isActive,
      positionIds: form.positionIds,
    };
    try {
      if (isEdit) await updateDepartment(departmentId, body);
      else await createDepartment(body);
      toast.success("Lưu thành công");
      onSaved && onSaved();
      onClose();
    } catch (err) {
      const pe = parseApiError(err);
      const fe = {};
      const others = [];
      pe.errors.forEach((x) => {
        if (x.field === "name" || x.field === "parentId" || x.field === "area") fe[x.field] = fe[x.field] || x.message;
        else others.push(x.message);
      });
      setErrors(fe);
      setFormErrors(others);
      toast.error(pe.message);
    } finally {
      setSaving(false);
    }
  };

  const positionRow = (p, depth, inactive = false) => (
    <label
      key={p.id}
      className={`flex items-center gap-2 py-1.5 cursor-pointer ${inactive ? "opacity-60" : ""}`}
      style={{ paddingLeft: depth * INDENT }}
    >
      <input type="checkbox" className="hrm-checkbox" checked={selected.has(p.id)} onChange={() => togglePosition(p.id)} />
      <span className="text-sm text-gray-800">{p.name}</span>
      <span className="text-xs text-gray-400">(Cấp {p.level})</span>
      {inactive && <span className="hrm-pill hrm-pill-muted" style={{ height: 20 }}>Ngừng HĐ</span>}
    </label>
  );

  return (
    <Modal
      open={open}
      title={isEdit ? "Cập nhật phòng ban" : "Thêm phòng ban"}
      width={860}
      dirty={dirty}
      onClose={onClose}
      bodyClassName="!p-0"
      footer={
        <>
          <button className="hrm-btn hrm-btn-secondary" onClick={() => (!dirty || window.confirm("Bạn có muốn bỏ thay đổi?")) && onClose()}>
            Hủy
          </button>
          <SubmitButton loading={saving} disabled={loading} onClick={submit}>
            Lưu
          </SubmitButton>
        </>
      }
    >
      {loading ? (
        <div className="py-16 text-center text-gray-400">Đang tải...</div>
      ) : (
        <div className="grid md:grid-cols-[minmax(0,320px)_1fr] h-full" style={{ minHeight: 420 }}>
          <div className="p-5 flex flex-col gap-4 border-b md:border-b-0 md:border-r" style={{ borderColor: "var(--color-border)" }}>
            {formErrors.length > 0 && (
              <div className="hrm-alert-error">
                {formErrors.map((m, i) => (
                  <div key={i}>{m}</div>
                ))}
              </div>
            )}
            <div>
              <label className="hrm-label">Phòng ban cha</label>
              <select
                className={`hrm-select ${errors.parentId ? "is-invalid" : ""}`}
                value={form.parentId}
                onChange={(e) => set("parentId", e.target.value)}
              >
                <option value="">— Không có —</option>
                {parents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                    {!d.isActive ? " (Ngừng hoạt động)" : ""}
                  </option>
                ))}
              </select>
              {errors.parentId && <div className="hrm-field-error">{errors.parentId}</div>}
            </div>
            <div>
              <label className="hrm-label">
                Tên phòng ban<span className="hrm-required">*</span>
              </label>
              <input
                className={`hrm-input ${errors.name ? "is-invalid" : ""}`}
                placeholder="Nhập tên phòng ban..."
                value={form.name}
                maxLength={60}
                onChange={(e) => set("name", e.target.value)}
              />
              {errors.name && <div className="hrm-field-error">{errors.name}</div>}
            </div>
            <div>
              <label className="hrm-label">Khu vực</label>
              <select className="hrm-select" value={form.area} onChange={(e) => set("area", e.target.value)}>
                <option value="">Chọn khu vực</option>
                {AREA_OPTIONS.map((a) => (
                  <option key={a.value} value={a.value}>
                    {a.label}
                  </option>
                ))}
              </select>
              {errors.area && <div className="hrm-field-error">{errors.area}</div>}
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer w-fit">
              <input type="checkbox" className="hrm-checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
              Hoạt động
            </label>
          </div>

          <div className="flex flex-col min-h-0">
            <div
              className="flex items-center justify-between px-5 py-3 border-b"
              style={{ borderColor: "var(--color-border)", background: "var(--color-table-head)" }}
            >
              <span className="font-semibold text-sm">Chức vụ trong phòng ban</span>
              <span className="hrm-pill hrm-pill-primary">Đã chọn: {form.positionIds.length}</span>
            </div>
            <div className="px-5 py-3 overflow-y-auto" style={{ maxHeight: "60vh" }}>
              {levels.length === 0 && inactiveAssigned.length === 0 && (
                <div className="text-sm text-gray-400 py-6 text-center">Chưa có chức vụ hoạt động</div>
              )}
              {levels.map(({ level, items }) =>
                isHidden(level) ? null : (
                  <div key={level}>
                    {items.map((p, idx) => (
                      <div key={p.id} className="flex items-center" style={{ paddingLeft: (level - 1) * INDENT }}>
                        {idx === 0 ? (
                          <button
                            type="button"
                            className="w-5 h-5 mr-1 flex items-center justify-center text-gray-500"
                            title={collapsedLevels[level] ? "Mở rộng các cấp bên dưới" : "Thu gọn các cấp bên dưới"}
                            onClick={() => setCollapsedLevels((c) => ({ ...c, [level]: !c[level] }))}
                          >
                            <span className={`transition-transform ${collapsedLevels[level] ? "-rotate-90" : ""}`}>
                              <Icon.ChevronDown />
                            </span>
                          </button>
                        ) : (
                          <span className="w-5 h-5 mr-1" />
                        )}
                        {positionRow(p, 0)}
                      </div>
                    ))}
                  </div>
                )
              )}
              {inactiveAssigned.length > 0 && (
                <div className="mt-3 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
                  {inactiveAssigned.map((p) => positionRow(p, 0, true))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
