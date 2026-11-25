// Quản trị › Quy trình › Cấu hình luồng duyệt – màn list (Spec HRM UI v1 §5.2)
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import approvalFlowService from "../../services/approvalFlowService";
import { Icon, PageHeader, Pagination, SearchInput, StatusBadge, TableBodyState, parseApiError, toast } from "../../components/ui";

const PAGE_SIZE = 20;

const Clip = ({ text, width = 200 }) => (
  <div className="truncate" style={{ maxWidth: width }} title={text}>
    {text || "-"}
  </div>
);

export default function ApprovalFlowList() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await approvalFlowService.list({ keyword, page, size: PAGE_SIZE });
      setData({ items: res?.items || [], total: res?.total || 0 });
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [keyword, page]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <PageHeader
        title="Cấu hình luồng duyệt đơn từ"
        actions={
          <button className="hrm-btn hrm-btn-primary" onClick={() => navigate("/quan-tri/luong-duyet/moi")}>
            <Icon.Plus /> Thêm luồng duyệt
          </button>
        }
      />
      <div className="hrm-filterbar">
        <SearchInput
          value={keyword}
          placeholder="Tìm kiếm luồng duyệt..."
          onChange={(v) => {
            setKeyword(v);
            setPage(1);
          }}
        />
      </div>
      <div className="hrm-table-wrap">
        <table className="hrm-table">
          <thead>
            <tr>
              <th>Tên luồng duyệt</th>
              <th>Đối tượng tạo đơn</th>
              <th>Loại đơn</th>
              <th>Phòng ban áp dụng</th>
              <th style={{ width: 90, textAlign: "center" }}>Số bước</th>
              <th style={{ width: 160 }}>Trạng thái</th>
              <th style={{ width: 90 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <TableBodyState loading={loading} empty={!data.items.length} colSpan={7} />
            {!loading &&
              data.items.map((f) => (
                <tr key={f.id}>
                  <td className="font-semibold">
                    <Clip text={f.name} width={260} />
                  </td>
                  <td>
                    <Clip text={f.applicantLevelLabel} />
                  </td>
                  <td>
                    <Clip text={f.requestTypesLabel} />
                  </td>
                  <td>
                    <Clip text={f.departmentsLabel} />
                  </td>
                  <td style={{ textAlign: "center" }}>{f.stepCount}</td>
                  <td>
                    <StatusBadge active={f.isActive} />
                  </td>
                  <td>
                    <button className="hrm-icon-btn" title="Sửa" onClick={() => navigate(`/quan-tri/luong-duyet/${f.id}`)}>
                      <Icon.Pencil />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} size={PAGE_SIZE} total={data.total} onChange={setPage} />
    </div>
  );
}
