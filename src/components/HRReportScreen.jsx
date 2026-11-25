// Nhân sự › Hồ sơ › Hồ sơ nhân sự (Spec HRM UI v1 §9)
// Trái: lọc trạng thái (badge số lượng) + cây phòng ban (gồm phòng ban con). Phải: tìm kiếm + bảng nhân sự.
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import employeeService from "../services/employeeService";
import { getDepartmentTree } from "../services/departmentService";
import { Icon, PageHeader, Pagination, SearchInput, TableBodyState, parseApiError, toast } from "./ui";

const PAGE_SIZE = 50;

const STATUS_FILTERS = [
  { value: "ALL", label: "Danh sách nhân sự", countKey: "all" },
  { value: "RESIGNED", label: "Nhân sự nghỉ việc", countKey: "resigned" },
  { value: "PROBATION", label: "Nhân sự thử việc", countKey: "probation" },
  { value: "OFFICIAL", label: "Nhân sự chính thức", countKey: "official" },
];

const STATUS_BADGE = {
  OFFICIAL: { label: "Chính thức", cls: "hrm-pill-success" },
  PROBATION: { label: "Thử việc", cls: "hrm-pill-primary" },
  RESIGNED: { label: "Nghỉ việc", cls: "hrm-pill-muted" },
};

const foldVN = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");

const fmtDate = (d) => (d ? dayjs(d).format("DD/MM/YYYY") : "");
const age = (d) => (d ? dayjs().diff(dayjs(d), "year") : "");
const seniority = (from, to) => {
  if (!from) return "";
  const months = dayjs(to || undefined).diff(dayjs(from), "month");
  if (months < 0) return "";
  const y = Math.floor(months / 12);
  const m = months % 12;
  return y > 0 ? `${y} năm ${m} tháng` : `${m} tháng`;
};
const initials = (name) =>
  (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

// Lọc cây theo từ khóa: giữ node khớp và tổ tiên của nó
function filterTree(nodes, q) {
  if (!q) return nodes;
  return nodes
    .map((n) => {
      const children = filterTree(n.children || [], q);
      if (foldVN(n.name).includes(q) || children.length) return { ...n, children };
      return null;
    })
    .filter(Boolean);
}

function TreeNode({ node, depth, selectedId, onSelect, expanded, onToggle, forceOpen }) {
  const hasChildren = node.children && node.children.length > 0;
  const open = forceOpen || expanded[node.id] !== false; // mặc định mở
  const active = selectedId === node.id;
  return (
    <div>
      <div
        className="flex items-center gap-1 rounded-md pr-2 cursor-pointer text-[13px]"
        style={{
          paddingLeft: 4 + depth * 14,
          background: active ? "var(--color-primary-soft)" : undefined,
          color: active ? "var(--color-primary)" : "#374151",
          fontWeight: active ? 600 : 400,
          minHeight: 30,
        }}
        onClick={() => onSelect(active ? null : node.id)}
      >
        <button
          type="button"
          className="w-4 h-4 flex items-center justify-center text-gray-400 shrink-0"
          style={{ visibility: hasChildren ? "visible" : "hidden" }}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id, !open);
          }}
        >
          <span className={`transition-transform ${open ? "" : "-rotate-90"}`}>
            <Icon.ChevronDown width="12" height="12" />
          </span>
        </button>
        <span className="flex-1 truncate" title={node.name}>
          {node.name}
        </span>
        <span className="text-xs text-gray-400">{node.employeeCount}</span>
      </div>
      {hasChildren &&
        open &&
        node.children.map((c) => (
          <TreeNode
            key={c.id}
            node={c}
            depth={depth + 1}
            selectedId={selectedId}
            onSelect={onSelect}
            expanded={expanded}
            onToggle={onToggle}
            forceOpen={forceOpen}
          />
        ))}
    </div>
  );
}

export default function HRReportScreen() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("ALL");
  const [departmentId, setDepartmentId] = useState(null);
  const [keyword, setKeyword] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0 });
  const [counts, setCounts] = useState({});
  const [tree, setTree] = useState([]);
  const [treeQuery, setTreeQuery] = useState("");
  const [expanded, setExpanded] = useState({});
  const [selected, setSelected] = useState(() => new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDepartmentTree()
      .then((t) => setTree(t.filter((n) => n.isActive !== false || n.employeeCount > 0)))
      .catch((err) => toast.error(parseApiError(err).message));
  }, []);

  const baseParams = useMemo(
    () => ({ departmentId: departmentId || "", includeChildren: true, keyword, workLocation }),
    [departmentId, keyword, workLocation]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, cnt] = await Promise.all([
        employeeService.searchDirectory({ ...baseParams, status, page, size: PAGE_SIZE }),
        employeeService.countDirectory(baseParams),
      ]);
      setData({ items: list?.items || [], total: list?.total || 0 });
      setCounts(cnt || {});
      setSelected(new Set());
    } catch (err) {
      toast.error(parseApiError(err, "Không thể tải dữ liệu nhân viên").message);
    } finally {
      setLoading(false);
    }
  }, [baseParams, status, page]);

  useEffect(() => {
    load();
  }, [load]);

  const visibleTree = useMemo(() => filterTree(tree, foldVN(treeQuery.trim())), [tree, treeQuery]);
  const allChecked = data.items.length > 0 && data.items.every((e) => selected.has(e.id));

  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(data.items.map((e) => e.id)));
  const toggleOne = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div>
      <PageHeader
        title="Hồ sơ nhân sự"
        actions={
          <button className="hrm-btn hrm-btn-primary" onClick={() => navigate("/profile")}>
            <Icon.Plus /> Thêm nhân sự
          </button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* ------------- Cột trái: bộ lọc ------------- */}
        <aside className="hrm-card w-full lg:w-[260px] shrink-0 lg:sticky lg:top-[60px] lg:max-h-[calc(100vh-80px)] overflow-y-auto">
          <div className="p-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 px-2 mb-2">Trạng thái</div>
            {STATUS_FILTERS.map((f) => {
              const active = status === f.value;
              return (
                <button
                  key={f.value}
                  className="w-full flex items-center justify-between rounded-md px-2 py-2 text-[13px] text-left"
                  style={active ? { background: "var(--color-primary-soft)", color: "var(--color-primary)", fontWeight: 600 } : { color: "#374151" }}
                  onClick={() => {
                    setStatus(f.value);
                    setPage(1);
                  }}
                >
                  {f.label}
                  <span className="hrm-count-badge" style={{ minWidth: 24, height: 22, fontSize: 12 }}>
                    {counts[f.countKey] ?? "-"}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="border-t p-3" style={{ borderColor: "var(--color-border)" }}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-500 px-2 mb-2">Phòng ban</div>
            <input
              className="hrm-input mb-2"
              style={{ height: 34 }}
              placeholder="Tìm phòng ban..."
              value={treeQuery}
              onChange={(e) => setTreeQuery(e.target.value)}
            />
            <div
              className="flex items-center rounded-md px-2 cursor-pointer text-[13px]"
              style={{
                minHeight: 30,
                background: departmentId == null ? "var(--color-primary-soft)" : undefined,
                color: departmentId == null ? "var(--color-primary)" : "#374151",
                fontWeight: departmentId == null ? 600 : 400,
              }}
              onClick={() => {
                setDepartmentId(null);
                setPage(1);
              }}
            >
              Tất cả phòng ban
            </div>
            {visibleTree.map((n) => (
              <TreeNode
                key={n.id}
                node={n}
                depth={0}
                selectedId={departmentId}
                expanded={expanded}
                forceOpen={!!treeQuery.trim()}
                onToggle={(id, open) => setExpanded((e) => ({ ...e, [id]: open }))}
                onSelect={(id) => {
                  setDepartmentId(id);
                  setPage(1);
                }}
              />
            ))}
          </div>
        </aside>

        {/* ------------- Cột phải: danh sách ------------- */}
        <section className="flex-1 min-w-0 w-full">
          <div className="hrm-filterbar">
            <SearchInput
              value={keyword}
              placeholder="Tìm theo mã, họ tên, số điện thoại..."
              onChange={(v) => {
                setKeyword(v);
                setPage(1);
              }}
            />
            <select
              className="hrm-select"
              value={workLocation}
              onChange={(e) => {
                setWorkLocation(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả địa điểm</option>
              <option value="2">Văn phòng</option>
              <option value="4">Nhà máy</option>
            </select>
          </div>

          <div className="hrm-table-wrap" style={{ maxHeight: "calc(100vh - 230px)" }}>
            <table className="hrm-table is-compact" style={{ minWidth: 1500 }}>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input type="checkbox" className="hrm-checkbox" checked={allChecked} onChange={toggleAll} aria-label="Chọn tất cả" />
                  </th>
                  <th style={{ width: 56 }}>STT</th>
                  <th style={{ minWidth: 260 }}>Họ và tên</th>
                  <th>Phòng ban</th>
                  <th>Vị trí công việc</th>
                  <th>Trạng thái</th>
                  <th>Điện thoại</th>
                  <th>Email công ty</th>
                  <th>Ngày sinh</th>
                  <th>Tuổi</th>
                  <th>Ngày vào làm</th>
                  <th>Thâm niên</th>
                  <th>Ngày nghỉ việc</th>
                  <th>CMND/CCCD</th>
                </tr>
              </thead>
              <tbody>
                <TableBodyState loading={loading} empty={!data.items.length} colSpan={14} rows={8} />
                {!loading &&
                  data.items.map((e, i) => {
                    const badge = STATUS_BADGE[e.status] || STATUS_BADGE.OFFICIAL;
                    const position = e.positionName || e.jobTitle;
                    return (
                      <tr key={e.id}>
                        <td>
                          <input type="checkbox" className="hrm-checkbox" checked={selected.has(e.id)} onChange={() => toggleOne(e.id)} />
                        </td>
                        <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
                        <td>
                          <div className="flex items-center gap-2 py-1.5 cursor-pointer" onClick={() => navigate(`/profile/${e.id}`)}>
                            <span
                              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                              style={{ background: "var(--color-primary-soft)", color: "var(--color-primary)" }}
                            >
                              {initials(e.fullName)}
                            </span>
                            <div className="min-w-0">
                              <div className="font-semibold truncate" style={{ color: "var(--color-primary)" }}>
                                {(e.attendanceCode || e.id) + " - " + e.fullName}
                              </div>
                              <div className="text-xs text-gray-500 truncate">{e.jobTitle || position || ""}</div>
                            </div>
                          </div>
                        </td>
                        <td>{e.departmentName || ""}</td>
                        <td>{position || ""}</td>
                        <td>
                          <span className={`hrm-pill ${badge.cls}`}>{badge.label}</span>
                        </td>
                        <td>{e.personalPhone || e.companyPhone || ""}</td>
                        <td>{e.companyEmail || ""}</td>
                        <td>{fmtDate(e.birthDate)}</td>
                        <td>{age(e.birthDate)}</td>
                        <td>{fmtDate(e.joinDate)}</td>
                        <td>{seniority(e.joinDate, e.status === "RESIGNED" ? e.resignDate : null)}</td>
                        <td>{fmtDate(e.resignDate)}</td>
                        <td>{e.citizenIdCard || e.idNumber || ""}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <Pagination page={page} size={PAGE_SIZE} total={data.total} onChange={setPage} unit="Nhân sự" />
        </section>
      </div>
    </div>
  );
}
