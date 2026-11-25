// Multi-select có checkbox + option "Tất cả" (Spec HRM UI v1 §5.3 – Section 2)
// - Tick "Tất cả" → bỏ các tick lẻ; tick 1 mục lẻ → bỏ "Tất cả"; bỏ hết → tự về "Tất cả".
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "./index";

const foldVN = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");

export default function MultiSelect({ options, all, values, onChange, searchable = false, searchPlaceholder = "Tìm..." }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selected = useMemo(() => new Set(values), [values]);
  const filtered = useMemo(
    () => (query ? options.filter((o) => foldVN(o.label).includes(foldVN(query))) : options),
    [options, query]
  );

  const display = useMemo(() => {
    if (all || values.length === 0) return "Tất cả";
    const labels = options.filter((o) => selected.has(o.value)).map((o) => o.label);
    const joined = labels.join(", ");
    return joined.length > 32 && labels.length > 1 ? `${labels[0]}, +${labels.length - 1}` : joined;
  }, [all, values, options, selected]);

  const fullText = all ? "Tất cả" : options.filter((o) => selected.has(o.value)).map((o) => o.label).join(", ");

  const toggle = (v) => {
    const next = selected.has(v) ? values.filter((x) => x !== v) : [...values, v];
    if (next.length === 0) onChange(true, []);
    else onChange(false, next);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="hrm-select text-left flex items-center justify-between"
        title={fullText}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="truncate">{display}</span>
        <Icon.ChevronDown className="shrink-0 text-gray-400" />
      </button>
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border rounded-lg shadow-lg" style={{ borderColor: "var(--color-border)" }}>
          {searchable && (
            <div className="p-2 border-b" style={{ borderColor: "var(--color-border)" }}>
              <input className="hrm-input" style={{ height: 34 }} placeholder={searchPlaceholder} value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
            </div>
          )}
          <div className="max-h-64 overflow-y-auto py-1">
            <label className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
              <input type="checkbox" className="hrm-checkbox" checked={all} onChange={() => onChange(true, [])} />
              Tất cả
            </label>
            <div className="h-px mx-2 my-1" style={{ background: "var(--color-border)" }} />
            {filtered.map((o) => (
              <label key={o.value} className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
                <input type="checkbox" className="hrm-checkbox" checked={!all && selected.has(o.value)} onChange={() => toggle(o.value)} />
                {o.label}
              </label>
            ))}
            {filtered.length === 0 && <div className="px-3 py-2 text-sm text-gray-400">Không có dữ liệu</div>}
          </div>
        </div>
      )}
    </div>
  );
}
