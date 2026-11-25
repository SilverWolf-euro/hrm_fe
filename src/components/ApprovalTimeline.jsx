// Timeline dọc các bước duyệt của đơn theo engine luồng duyệt mới (Spec HRM UI v1 §8.4)
// Bước đã duyệt ✓ xanh lá, đang chờ màu primary, chưa tới xám, từ chối đỏ.
import React from "react";
import { Icon } from "./ui";

const STYLE = {
  APPROVED: { color: "#16a34a", bg: "#dcfce7", label: "Đã duyệt" },
  PENDING: { color: "var(--color-primary)", bg: "var(--color-primary-soft)", label: "Đang chờ duyệt" },
  WAITING: { color: "#9ca3af", bg: "#f3f4f6", label: "Chưa tới" },
  REJECTED: { color: "#dc2626", bg: "#fee2e2", label: "Từ chối" },
  CANCELLED: { color: "#9ca3af", bg: "#f3f4f6", label: "Đã hủy" },
};

const fmt = (v) => {
  if (!v) return "";
  const d = new Date(v);
  return isNaN(d) ? v : d.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric" });
};

export const FLOW_CONFIG_ERROR = "Lỗi cấu hình luồng duyệt";

export function FlowConfigErrorTag() {
  return <span className="hrm-pill hrm-pill-danger">{FLOW_CONFIG_ERROR}</span>;
}

export default function ApprovalTimeline({ steps = [] }) {
  if (!steps.length) return <div className="text-xs text-gray-400">Chưa có tiến trình duyệt</div>;
  return (
    <ol className="relative m-0 p-0 list-none">
      {steps.map((s, i) => {
        const st = STYLE[s.status] || STYLE.WAITING;
        const last = i === steps.length - 1;
        const noApprover = (s.status === "PENDING" || s.status === "WAITING") && (s.approverNames || []).length === 0;
        return (
          <li key={s.stepNo} className="relative pl-10 pb-4">
            {!last && <span className="absolute left-[13px] top-7 bottom-0 w-0.5" style={{ background: "#e5e7eb" }} />}
            <span
              className="absolute left-0 top-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: st.bg, color: st.color, border: `2px solid ${st.color}` }}
            >
              {s.status === "APPROVED" ? <Icon.Check width="14" height="14" /> : s.status === "REJECTED" ? "✕" : s.stepNo}
            </span>
            <div className="rounded-lg border p-3" style={{ borderColor: "var(--color-border)", borderLeft: `4px solid ${st.color}` }}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">Bước {s.stepNo}: Phê duyệt</span>
                <span className="hrm-pill" style={{ background: st.bg, color: st.color, height: 20 }}>
                  {st.label}
                </span>
              </div>
              <div className="text-sm text-gray-700 mt-1">• {s.departmentName}</div>
              <div className="text-sm" style={{ color: "var(--color-primary)" }}>
                • {s.levelLabel || `Cấp ${s.level}`}
              </div>
              {(s.status === "APPROVED" || s.status === "REJECTED") && (
                <div className="text-xs text-gray-600 mt-1">
                  {s.status === "APPROVED" ? "Người duyệt" : "Người từ chối"}: <b>{s.actedByName || "-"}</b>
                  {s.actedAt && <> · {fmt(s.actedAt)}</>}
                </div>
              )}
              {s.note && <div className="text-xs text-gray-600 mt-1">Nhận xét: {s.note}</div>}
              {s.status === "PENDING" && !noApprover && (
                <div className="text-xs text-gray-500 mt-1">Người có thể duyệt: {(s.approverNames || []).join(", ")}</div>
              )}
              {noApprover && (
                <div className="mt-1">
                  <FlowConfigErrorTag />
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
