// Modal Thêm / Sửa chức vụ (Spec HRM UI v1 §3.2)
import React, { useEffect, useMemo, useState } from "react";
import positionService from "../services/positionService";
import { Modal, SubmitButton, parseApiError, toast } from "./ui";

const LEVELS = Array.from({ length: 10 }, (_, i) => i + 1);
const EMPTY = { name: "", level: 1, isActive: true };

export default function PositionModal({ open, positionId, onClose, onSaved }) {
  const isEdit = !!positionId;
  const [form, setForm] = useState(EMPTY);
  const [initial, setInitial] = useState(EMPTY);
  const [meta, setMeta] = useState({ code: "", usedInFlows: 0 });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (!isEdit) {
      setForm(EMPTY);
      setInitial(EMPTY);
      setMeta({ code: "", usedInFlows: 0 });
      return;
    }
    setLoading(true);
    positionService
      .getPositionById(positionId)
      .then((p) => {
        const f = { name: p?.name || "", level: p?.level || 1, isActive: !!p?.isActive };
        setForm(f);
        setInitial(f);
        setMeta({ code: p?.code || "", usedInFlows: p?.usedInFlows || 0 });
      })
      .catch((err) => toast.error(parseApiError(err).message))
      .finally(() => setLoading(false));
  }, [open, positionId, isEdit]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);
  const showUsageWarning =
    isEdit && meta.usedInFlows > 0 && (form.level !== initial.level || (initial.isActive && !form.isActive));

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validate = () => {
    const e = {};
    const name = form.name.trim();
    if (!name) e.name = "Vui lòng nhập tên chức vụ";
    else if (name.length > 50) e.name = "Tên chức vụ tối đa 50 ký tự";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (saving || !validate()) return;
    setSaving(true);
    const body = { name: form.name.trim(), level: Number(form.level), isActive: form.isActive };
    try {
      if (isEdit) await positionService.updatePosition(positionId, body);
      else await positionService.createPosition(body);
      toast.success("Lưu thành công");
      onSaved && onSaved();
      onClose();
    } catch (err) {
      const pe = parseApiError(err);
      const fieldErrors = {};
      pe.errors.forEach((x) => {
        if (x.field && !fieldErrors[x.field]) fieldErrors[x.field] = x.message;
      });
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
      toast.error(pe.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Cập nhật chức vụ" : "Thêm chức vụ mới"}
      width={520}
      dirty={dirty}
      onClose={onClose}
      footer={
        <>
          <button className="hrm-btn hrm-btn-secondary" onClick={() => (!dirty || window.confirm("Bạn có muốn bỏ thay đổi?")) && onClose()}>
            Hủy
          </button>
          <SubmitButton loading={saving} disabled={loading} onClick={submit}>
            Lưu chức vụ
          </SubmitButton>
        </>
      }
    >
      {loading ? (
        <div className="py-10 text-center text-gray-400">Đang tải...</div>
      ) : (
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          {isEdit && (
            <div>
              <label className="hrm-label">Mã chức vụ</label>
              <input className="hrm-input" value={meta.code} readOnly />
            </div>
          )}
          <div>
            <label className="hrm-label">
              Tên chức vụ<span className="hrm-required">*</span>
            </label>
            <input
              className={`hrm-input ${errors.name ? "is-invalid" : ""}`}
              placeholder="VD: Trưởng phòng, Tổ trưởng..."
              value={form.name}
              maxLength={60}
              autoFocus
              onChange={(e) => set("name", e.target.value)}
            />
            {errors.name && <div className="hrm-field-error">{errors.name}</div>}
          </div>
          <div>
            <label className="hrm-label">
              Cấp bậc (Level)<span className="hrm-required">*</span>
            </label>
            <select
              className={`hrm-select ${errors.level ? "is-invalid" : ""}`}
              value={form.level}
              onChange={(e) => set("level", Number(e.target.value))}
            >
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  Cấp {l}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">Cấp 1 là cao nhất, số càng lớn cấp càng thấp.</div>
            {errors.level && <div className="hrm-field-error">{errors.level}</div>}
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer w-fit">
            <input type="checkbox" className="hrm-checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} />
            Hoạt động
          </label>
          {showUsageWarning && (
            <div className="hrm-alert-warning">
              Chức vụ đang được dùng trong {meta.usedInFlows} luồng duyệt. Thay đổi cấp bậc có thể ảnh hưởng tới luồng duyệt.
            </div>
          )}
          <button type="submit" hidden />
        </form>
      )}
    </Modal>
  );
}
