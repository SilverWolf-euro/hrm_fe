// Quản trị › Phòng ban (Spec HRM UI v1 §4.1)
import React, { useCallback, useEffect, useState } from "react";
import { AREA_OPTIONS, areaShortLabel, searchDepartments } from "../services/departmentService";
import DepartmentModal from "../components/DepartmentModal";
import { Icon, PageHeader, Pagination, SearchInput, StatusBadge, TableBodyState, parseApiError, toast } from "../components/ui";

const PAGE_SIZE = 20;

export default function DepartmentManagement() {
  const [filters, setFilters] = useState({ keyword: "", area: "", isActive: "" });
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, id: null });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchDepartments({ ...filters, page, size: PAGE_SIZE });
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
        title="Quản lý phòng ban"
        actions={
          <button className="hrm-btn hrm-btn-primary" onClick={() => setModal({ open: true, id: null })}>
            <Icon.Plus /> Thêm phòng ban
          </button>
        }
      />

      <div className="hrm-filterbar">
        <select className="hrm-select" value={filters.area} onChange={(e) => setFilter("area", e.target.value)}>
          <option value="">Tất cả khu vực</option>
          {AREA_OPTIONS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
        <select className="hrm-select" value={filters.isActive} onChange={(e) => setFilter("isActive", e.target.value)}>
          <option value="">Tất cả trạng thái</option>
          <option value="true">Hoạt động</option>
          <option value="false">Ngừng hoạt động</option>
        </select>
        <SearchInput value={filters.keyword} placeholder="Tìm kiếm phòng ban..." onChange={(v) => setFilter("keyword", v)} />
      </div>

      <div className="hrm-table-wrap">
        <table className="hrm-table">
          <thead>
            <tr>
              <th>Tên phòng ban</th>
              <th>Phòng ban cha</th>
              <th style={{ width: 150 }}>Khu vực</th>
              <th style={{ width: 120, textAlign: "center" }}>SL chức vụ</th>
              <th style={{ width: 160 }}>Trạng thái</th>
              <th style={{ width: 90 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <TableBodyState loading={loading} empty={!data.items.length} colSpan={6} />
            {!loading &&
              data.items.map((d) => (
                <tr key={d.id}>
                  <td className="font-semibold">{d.name}</td>
                  <td>{d.parentName || "-"}</td>
                  <td>{areaShortLabel(d.area)}</td>
                  <td style={{ textAlign: "center" }}>
                    <span className="hrm-count-badge">{d.positionCount || 0}</span>
                  </td>
                  <td>
                    <StatusBadge active={d.isActive} />
                  </td>
                  <td>
                    <button className="hrm-icon-btn" title="Sửa" onClick={() => setModal({ open: true, id: d.id })}>
                      <Icon.Pencil />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} size={PAGE_SIZE} total={data.total} onChange={setPage} />

      <DepartmentModal open={modal.open} departmentId={modal.id} onClose={() => setModal({ open: false, id: null })} onSaved={load} />
    </div>
  );
}
