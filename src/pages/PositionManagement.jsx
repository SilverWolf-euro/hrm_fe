// Quản trị › Chức vụ (Spec HRM UI v1 §3.1)
import React, { useCallback, useEffect, useState } from "react";
import positionService from "../services/positionService";
import PositionModal from "../components/PositionModal";
import {
  Icon,
  LevelPill,
  PageHeader,
  Pagination,
  SearchInput,
  StatusBadge,
  TableBodyState,
  parseApiError,
  toast,
} from "../components/ui";

const PAGE_SIZE = 20;

export default function PositionManagement() {
  const [filters, setFilters] = useState({ keyword: "", level: "", isActive: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, id: null });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await positionService.search({ ...filters, page, size: PAGE_SIZE });
      setData({ items: res?.items || [], total: res?.total || 0 });
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  const setFilter = (k, v) => {
    setFilters((f) => ({ ...f, [k]: v }));
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title="Quản lý chức vụ"
        actions={
          <button className="hrm-btn hrm-btn-primary" onClick={() => setModal({ open: true, id: null })}>
            <Icon.Plus /> Thêm chức vụ
          </button>
        }
      />

      <div className="hrm-filterbar">
        <select className="hrm-select" value={filters.level} onChange={(e) => setFilter("level", e.target.value)}>
          <option value="">Tất cả cấp bậc</option>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((l) => (
            <option key={l} value={l}>
              Cấp {l}
            </option>
          ))}
        </select>
        <select className="hrm-select" value={filters.isActive} onChange={(e) => setFilter("isActive", e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="true">Hoạt động</option>
          <option value="false">Ngừng hoạt động</option>
        </select>
        <SearchInput value={filters.keyword} placeholder="Tìm kiếm chức vụ..." onChange={(v) => setFilter("keyword", v)} />
      </div>

      <div className="hrm-table-wrap">
        <table className="hrm-table">
          <thead>
            <tr>
              <th style={{ width: 64 }}>STT</th>
              <th style={{ width: 140 }}>Mã chức vụ</th>
              <th>Tên chức vụ</th>
              <th style={{ width: 120 }}>Cấp bậc</th>
              <th style={{ width: 160 }}>Trạng thái</th>
              <th style={{ width: 90 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <TableBodyState loading={loading} empty={!data.items.length} colSpan={6} />
            {!loading &&
              data.items.map((p, i) => (
                <tr key={p.id}>
                  <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td>{p.code || "-"}</td>
                  <td className="font-semibold">{p.name}</td>
                  <td>
                    <LevelPill level={p.level} />
                  </td>
                  <td>
                    <StatusBadge active={p.isActive} />
                  </td>
                  <td>
                    <button className="hrm-icon-btn" title="Sửa" onClick={() => setModal({ open: true, id: p.id })}>
                      <Icon.Pencil />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} size={PAGE_SIZE} total={data.total} onChange={setPage} />

      <PositionModal open={modal.open} positionId={modal.id} onClose={() => setModal({ open: false, id: null })} onSaved={load} />
    </div>
  );
}
