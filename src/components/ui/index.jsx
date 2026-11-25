// Bộ component dùng chung theo design system HRM UI v1 (Spec §1)
import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocation } from "react-router-dom";
import { findMenuContext } from "../../constants/menuConfig";

// ------------------------------------------------------------------ Toast
let toasts = [];
const toastListeners = new Set();
const emitToasts = () => toastListeners.forEach((l) => l());
let toastSeq = 0;

export const toast = {
  show(message, type = "info", ms = 3500) {
    const id = ++toastSeq;
    toasts = [...toasts, { id, message, type }];
    emitToasts();
    setTimeout(() => {
      toasts = toasts.filter((t) => t.id !== id);
      emitToasts();
    }, ms);
  },
  success(message) {
    this.show(message, "success");
  },
  error(message) {
    this.show(message, "error", 5000);
  },
};

export function ToastHost() {
  const list = useSyncExternalStore(
    (l) => {
      toastListeners.add(l);
      return () => toastListeners.delete(l);
    },
    () => toasts
  );
  return (
    <div className="hrm-toast-host">
      {list.map((t) => (
        <div key={t.id} className={`hrm-toast is-${t.type}`} role="status">
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ------------------------------------------------------------------ API error
// Chuẩn lỗi BE (§8): 422 { code, message, errors: [{field, stepNo, message}] } | 409 { code, message }
export function parseApiError(err, fallback = "Đã có lỗi xảy ra") {
  const data = err?.response?.data;
  const message = data?.message || data?.msg || data?.error || err?.message || fallback;
  return {
    status: err?.response?.status,
    code: data?.code,
    message: typeof message === "string" ? message : fallback,
    errors: Array.isArray(data?.errors) ? data.errors : [],
  };
}

// ------------------------------------------------------------------ Icons
export const Icon = {
  Search: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  Plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Pencil: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" {...p}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  ),
  Close: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" {...p}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  ChevronDown: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" {...p}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  ChevronRight: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" {...p}>
      <path d="m9 6 6 6-6 6" />
    </svg>
  ),
  Trash: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" {...p}>
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  ),
  ArrowLeft: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" {...p}>
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  ),
  User: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  ),
  Users: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" {...p}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 20c0-3.5 3-5.5 7-5.5s7 2 7 5.5" />
      <path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2.4.6 4 2.3 4 5.2" />
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" {...p}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  CheckCircle: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  ),
  ArrowDown: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18" {...p}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  ),
  Menu: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" {...p}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
};

// ------------------------------------------------------------------ Breadcrumb + page header
export function Breadcrumb({ extra }) {
  const { pathname } = useLocation();
  const ctx = findMenuContext(pathname);
  if (!ctx) return null;
  const parts = [ctx.module.label, ctx.group.label, ctx.item.label];
  if (extra || ctx.subLabel) parts.push(extra || ctx.subLabel);
  return <div className="hrm-breadcrumb">{parts.join(" › ")}</div>;
}

export function PageHeader({ title, actions, breadcrumbExtra }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
      <div>
        <Breadcrumb extra={breadcrumbExtra} />
        <h1 className="hrm-page-title">{title}</h1>
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

// ------------------------------------------------------------------ Search (debounce 300ms)
export function SearchInput({ value, onChange, placeholder, delay = 300 }) {
  const [text, setText] = useState(value || "");
  const first = useRef(true);
  useEffect(() => {
    setText(value || "");
  }, [value]);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    const t = setTimeout(() => {
      if (text !== value) onChange(text);
    }, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  return (
    <div className="hrm-search">
      <Icon.Search />
      <input className="hrm-input" value={text} placeholder={placeholder} onChange={(e) => setText(e.target.value)} />
    </div>
  );
}

// ------------------------------------------------------------------ Badges
export function StatusBadge({ active, activeLabel = "Hoạt động", inactiveLabel = "Ngừng hoạt động" }) {
  return <span className={`hrm-pill ${active ? "hrm-pill-success" : "hrm-pill-muted"}`}>{active ? activeLabel : inactiveLabel}</span>;
}

export function LevelPill({ level }) {
  if (!level) return <span className="text-gray-400">-</span>;
  return <span className="hrm-pill hrm-pill-level">Cấp {level}</span>;
}

// ------------------------------------------------------------------ Table helpers
export function TableBodyState({ loading, empty, colSpan, rows = 5 }) {
  if (loading) {
    return Array.from({ length: rows }).map((_, i) => (
      <tr key={`sk-${i}`}>
        {Array.from({ length: colSpan }).map((__, j) => (
          <td key={j}>
            <div className="hrm-skeleton" style={{ width: `${50 + ((i + j) % 4) * 12}%` }} />
          </td>
        ))}
      </tr>
    ));
  }
  if (empty) {
    return (
      <tr>
        <td className="hrm-empty" colSpan={colSpan}>
          Không có dữ liệu
        </td>
      </tr>
    );
  }
  return null;
}

// "Trang x / y [N bản ghi]" + nút trang
export function Pagination({ page, size, total, onChange, unit = "bản ghi" }) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (size || 1)));
  const pages = [];
  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  for (let p = start; p <= Math.min(totalPages, start + 4); p++) pages.push(p);
  return (
    <div className="hrm-pagination">
      <span>
        Trang {page} / {totalPages} <span className="text-gray-500">[{total || 0} {unit}]</span>
      </span>
      <div className="flex gap-1">
        <button className="hrm-page-btn" disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Trang trước">
          ‹
        </button>
        {pages.map((p) => (
          <button key={p} className={`hrm-page-btn ${p === page ? "is-active" : ""}`} onClick={() => onChange(p)}>
            {p}
          </button>
        ))}
        <button className="hrm-page-btn" disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Trang sau">
          ›
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------ Modal
// Đóng bằng X / Hủy / Esc; nếu dirty thì confirm "Bạn có muốn bỏ thay đổi?"
export function Modal({ open, title, width = 520, dirty = false, onClose, footer, children, bodyClassName = "" }) {
  const requestClose = () => {
    if (dirty && !window.confirm("Bạn có muốn bỏ thay đổi?")) return;
    onClose();
  };
  const closeRef = useRef(requestClose);
  closeRef.current = requestClose;
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  if (!open) return null;
  return (
    <div className="hrm-modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && requestClose()}>
      <div className="hrm-modal" style={{ maxWidth: width }} role="dialog" aria-modal="true">
        <div className="hrm-modal-header">
          <h2 className="hrm-modal-title">{title}</h2>
          <button className="hrm-icon-btn" style={{ color: "#6b7280" }} onClick={requestClose} aria-label="Đóng">
            <Icon.Close />
          </button>
        </div>
        <div className={`hrm-modal-body ${bodyClassName}`}>{children}</div>
        {footer !== null && (
          <div className="hrm-modal-footer">
            {footer || (
              <button className="hrm-btn hrm-btn-secondary" onClick={requestClose}>
                Hủy
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Nút submit có spinner + khóa khi đang lưu
export function SubmitButton({ loading, children, className = "hrm-btn hrm-btn-primary", ...rest }) {
  return (
    <button className={className} disabled={loading || rest.disabled} {...rest}>
      {loading && <span className="hrm-spinner" />}
      {children}
    </button>
  );
}

// Lấy data từ BaseResponse {code, message, data} hoặc dữ liệu thô
export const unwrap = (res) => {
  const body = res?.data ?? res;
  if (body && typeof body === "object" && "data" in body && ("code" in body || "message" in body)) return body.data;
  return body;
};
