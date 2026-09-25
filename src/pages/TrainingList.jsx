import React, { useState } from "react";
import TrainingForm from "../components/TrainingForm";
import TrainingEditForm from "../components/TrainingEditForm";
import TrainingDetailModal from "../components/TrainingDetailModal";

const TRAINING_SAMPLE = [
  {
    date: "10/12/2025",
    type: "Hội nhập",
    content: "Nội dung đào tạo hội nhập cho nhân viên mới, giới thiệu công ty, quy trình làm việc, văn hóa doanh nghiệp.",
    departments: ["Văn phòng"],
    status: "Mỗi buổi 1h",
    issues: "",
    solutions: "",
    proposal: ""
  },
  {
    date: "9/10/2025",
    type: "Kỹ năng",
    content: "Đào tạo kỹ năng mềm, kỹ năng giao tiếp, làm việc nhóm cho nhân viên nhà máy.",
    departments: ["Nhà máy"],
    status: "",
    issues: "",
    solutions: "",
    proposal: ""
  }
];

function getYear(dateStr) {
  const [d, m, y] = dateStr.split("/");
  return y;
}
export default function TrainingList() {
  const [filterYear, setFilterYear] = useState("");
  const [list, setList] = useState(TRAINING_SAMPLE);
  const [viewIdx, setViewIdx] = useState(null);
  const [editIdx, setEditIdx] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const years = Array.from(new Set(list.map(i => getYear(i.date))));
  const filteredList = filterYear ? list.filter(i => getYear(i.date) === filterYear) : list;

  const render2Lines = val => {
    if (!val) return "";
    if (val.length <= 60) return val;
    return val.slice(0, 60) + "...";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Danh sách buổi đào tạo</h2>
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => setShowForm(true)}>+ Đào tạo</button>
      </div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <select
            className="border rounded px-2 py-1"
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
          >
            <option value="">Chọn năm</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button className="px-3 py-1 bg-blue-500 text-white rounded" onClick={() => setFilterYear(filterYear)} type="button">Lọc</button>
        </div>
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">STT</th>
              <th className="border px-2 py-1">Ngày đào tạo</th>
              <th className="border px-2 py-1">Loại đào tạo</th>
              <th className="border px-2 py-1">Nội dung</th>
              <th className="border px-2 py-1">Bộ phận tham gia</th>
              <th className="border px-2 py-1">Hiện trạng</th>
              <th className="border px-2 py-1">Tồn tại/Khó khăn</th>
              <th className="border px-2 py-1">Biện pháp thực hiện</th>
              <th className="border px-2 py-1">Đề xuất</th>
              <th className="border px-2 py-1">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr><td colSpan={10} className="text-center text-gray-500">Chưa có dữ liệu</td></tr>
            ) : (
              filteredList.map((item, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{i + 1}</td>
                  <td className="border px-2 py-1">{item.date}</td>
                  <td className="border px-2 py-1">{item.type}</td>
                  <td className="border px-2 py-1 max-w-[160px] truncate whitespace-pre-line" title={item.content}>{render2Lines(item.content)}</td>
                  <td className="border px-2 py-1">{item.departments.join(", ")}</td>
                  <td className="border px-2 py-1 max-w-[120px] truncate whitespace-pre-line" title={item.status}>{render2Lines(item.status)}</td>
                  <td className="border px-2 py-1 max-w-[120px] truncate whitespace-pre-line" title={item.issues}>{render2Lines(item.issues)}</td>
                  <td className="border px-2 py-1 max-w-[120px] truncate whitespace-pre-line" title={item.solutions}>{render2Lines(item.solutions)}</td>
                  <td className="border px-2 py-1 max-w-[120px] truncate whitespace-pre-line" title={item.proposal}>{render2Lines(item.proposal)}</td>
                  <td className="border px-2 py-1">
                    <button className="text-blue-600 mr-2" title="Xem chi tiết" onClick={() => setViewIdx(i)}>👁️</button>
                    <button className="text-green-600" title="Cập nhật" onClick={() => setEditIdx(i)}>✏️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <TrainingForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={data => {
          setList(list => [
            ...list,
            {
              ...data,
              departments: data.departments || [],
              date: data.date,
              type: data.type,
              content: data.content,
              status: data.status,
              issues: data.issues,
              solutions: data.solutions,
              proposal: data.proposal
            }
          ]);
        }}
      />

      <TrainingEditForm
        open={editIdx !== null}
        onClose={() => setEditIdx(null)}
        data={editIdx !== null ? list[editIdx] : null}
        onSave={data => {
          setList(list => list.map((item, i) => i === editIdx ? { ...item, ...data } : item));
        }}
      />

      <TrainingDetailModal
        open={viewIdx !== null}
        onClose={() => setViewIdx(null)}
        data={viewIdx !== null ? list[viewIdx] : null}
      />
    </div>
  );
}
