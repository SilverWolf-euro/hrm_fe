
import React, { useState } from "react";
import RecruitmentDetailModal from "../components/RecruitmentDetailModal";
import RecruitmentUpdateModal from "../components/RecruitmentUpdateModal";

const DEPARTMENTS = {
  "Nhà máy": ["Sản xuất", "Bảo trì", "Kho"],
  "Văn phòng": ["Kế toán", "Nhân sự", "IT"]
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - 2 + i);

function emptyPosition() {
  return {
    location: "",
    department: "",
    position: "",
    quantity: ""
  };
}

export default function RecruitmentScreen() {
  const [year, setYear] = useState("");
  const [positions, setPositions] = useState([emptyPosition()]);
  const [showForm, setShowForm] = useState(false);
  const [editIdx, setEditIdx] = useState(null); // {itemIdx, posIdx}
  const [viewIdx, setViewIdx] = useState(null); // {itemIdx, posIdx}
  const [list, setList] = useState([
    {
      year: "2025",
      positions: [
        {
          location: "Văn phòng",
          department: "Phòng kinh doanh",
          position: "Nhân viên KD kim loại",
          quantity: "3",
          soLuongDaTuyen: "3",
          hienTrang: "Đã tuyển đủ"
        }
      ]
    },
    {
      year: "2025",
      positions: [
        {
          location: "Nhà máy",
          department: "Bảo trì",
          position: "Nhân viên bảo trì",
          quantity: "2",
          soLuongDaTuyen: "1",
          hienTrang: "Còn thiếu 1"
        }
      ]
    }
  ]);
  const [filterYear, setFilterYear] = useState("");

  // Lấy danh sách năm có trong list
  const availableYears = Array.from(new Set(list.map(item => item.year)));

  const filteredList = filterYear
    ? list.filter(item => item.year === filterYear)
    : list;

  const handleChange = (idx, field, value) => {
    setPositions(pos => {
      const copy = [...pos];
      copy[idx][field] = value;
      // Reset department if location changes
      if (field === "location") copy[idx].department = "";
      return copy;
    });
  };

  const handleAddPosition = () => {
    setPositions([...positions, emptyPosition()]);
  };

  const handleRemovePosition = idx => {
    setPositions(positions.filter((_, i) => i !== idx));
  };

  const handleSubmit = e => {
    e.preventDefault();
    // Validate
    if (!year) return alert("Vui lòng chọn năm");
    for (const p of positions) {
      if (!p.location || !p.department || !p.position || !p.quantity) {
        return alert("Vui lòng nhập đầy đủ thông tin các vị trí");
      }
      if (p.position.length > 50) {
        return alert("Tên vị trí tối đa 50 ký tự");
      }
      if (!/^[1-9][0-9]*$/.test(p.quantity)) {
        return alert("Số lượng phải là số nguyên dương");
      }
    }
    setList([...list, { year, positions }]);
    setShowForm(false);
    setPositions([emptyPosition()]);
    setYear("");
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Công tác tuyển dụng</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={() => setShowForm(true)}
        >
          + Tuyển dụng
        </button>
      </div>
      {/* Danh sách vị trí đã tuyển/cần tuyển */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Danh sách vị trí tuyển dụng</h3>
        <div className="flex items-center gap-2 mb-2">
          <select
            className="border rounded px-2 py-1"
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
          >
            <option value="">Chọn năm</option>
            {availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <button
            className="px-3 py-1 bg-blue-500 text-white rounded"
            onClick={() => setFilterYear(filterYear)}
            type="button"
          >Lọc</button>
        </div>
        {filteredList.length === 0 ? (
          <div className="text-gray-500">Chưa có dữ liệu</div>
        ) : (
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Năm</th>
                <th className="border px-2 py-1">Địa điểm</th>
                <th className="border px-2 py-1">Phòng ban</th>
                <th className="border px-2 py-1">Vị trí</th>
                <th className="border px-2 py-1">SL cần tuyển</th>
                <th className="border px-2 py-1">SL đã tuyển</th>
                <th className="border px-2 py-1">Hiện trạng</th>
                <th className="border px-2 py-1">Tồn tại/Khó khăn</th>
                <th className="border px-2 py-1">Biện pháp thực hiện</th>
                <th className="border px-2 py-1">Đề xuất</th>
                <th className="border px-2 py-1">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((item, i) =>
                item.positions.map((p, j) => (
                  <tr key={i + "-" + j}>
                    <td className="border px-2 py-1">{item.year}</td>
                    <td className="border px-2 py-1">{p.location}</td>
                    <td className="border px-2 py-1">{p.department}</td>
                    <td className="border px-2 py-1">{p.position}</td>
                    <td className="border px-2 py-1">{p.quantity}</td>
                    <td className="border px-2 py-1">{p.soLuongDaTuyen || ""}</td>
                    <td className="border px-2 py-1">{p.hienTrang || ""}</td>
                    <td className="border px-2 py-1 max-w-[120px] truncate whitespace-pre-line" title={p.khoKhan || ""}>{p.khoKhan ? (p.khoKhan.length > 60 ? p.khoKhan.slice(0, 60) + "..." : p.khoKhan) : ""}</td>
                    <td className="border px-2 py-1 max-w-[120px] truncate whitespace-pre-line" title={p.bienPhap || ""}>{p.bienPhap ? (p.bienPhap.length > 60 ? p.bienPhap.slice(0, 60) + "..." : p.bienPhap) : ""}</td>
                    <td className="border px-2 py-1 max-w-[120px] truncate whitespace-pre-line" title={p.deXuat || ""}>{p.deXuat ? (p.deXuat.length > 60 ? p.deXuat.slice(0, 60) + "..." : p.deXuat) : ""}</td>
                    <td className="border px-2 py-1">
                      <button className="text-blue-600 mr-2" title="Xem chi tiết" onClick={() => setViewIdx({itemIdx: i, posIdx: j})}>👁️</button>
                      <button className="text-green-600" title="Cập nhật" onClick={() => setEditIdx({itemIdx: i, posIdx: j})}>✏️</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
      {/* Form nhập thông tin tuyển dụng */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            className="bg-white p-6 rounded shadow-lg min-w-[500px] relative"
            onSubmit={handleSubmit}
          >
            <button
              type="button"
              className="absolute top-2 right-2 text-gray-400 hover:text-black"
              onClick={() => setShowForm(false)}
            >×</button>
            <h3 className="font-bold mb-4">Tuyển dụng</h3>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Năm *</label>
              <select
                className="border rounded px-2 py-1 w-full"
                value={year}
                onChange={e => setYear(e.target.value)}
                required
              >
                <option value="">Chọn năm</option>
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="mb-2 font-semibold">Vị trí tuyển dụng</div>
            {positions.map((p, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-4 mb-2 items-end">
                <div>
                  <label className="block mb-1">Địa điểm làm việc *</label>
                  <select
                    className="border rounded px-2 py-1 w-full"
                    value={p.location}
                    onChange={e => handleChange(idx, "location", e.target.value)}
                    required
                  >
                    <option value="">Chọn địa điểm</option>
                    {Object.keys(DEPARTMENTS).map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Phòng ban *</label>
                  <select
                    className="border rounded px-2 py-1 w-full"
                    value={p.department}
                    onChange={e => handleChange(idx, "department", e.target.value)}
                    required
                    disabled={!p.location}
                  >
                    <option value="">Chọn phòng ban</option>
                    {p.location && DEPARTMENTS[p.location].map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Vị trí *</label>
                  <input
                    className="border rounded px-2 py-1 w-full"
                    type="text"
                    maxLength={50}
                    value={p.position}
                    onChange={e => handleChange(idx, "position", e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <label className="block mb-1">Số lượng cần tuyển *</label>
                    <input
                      className="border rounded px-2 py-1 w-full"
                      type="number"
                      min={1}
                      value={p.quantity}
                      onChange={e => handleChange(idx, "quantity", e.target.value)}
                      required
                    />
                  </div>
                  {positions.length > 1 && (
                    <button
                      type="button"
                      className="text-red-500 text-lg px-2"
                      onClick={() => handleRemovePosition(idx)}
                      title="Xóa vị trí"
                    >–</button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              className="text-blue-600 text-sm mb-4"
              onClick={handleAddPosition}
            >
              + Thêm vị trí
            </button>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-200"
                onClick={() => setShowForm(false)}
              >Hủy</button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-500 text-white"
              >Thêm</button>
            </div>
          </form>
        </div>
      )}
      {/* Popup xem chi tiết */}
      <RecruitmentDetailModal
        open={!!viewIdx}
        onClose={() => setViewIdx(null)}
        data={viewIdx ? filteredList[viewIdx.itemIdx]?.positions[viewIdx.posIdx] : null}
        year={viewIdx ? filteredList[viewIdx.itemIdx]?.year : ""}
      />

      {/* Popup cập nhật */}
      <RecruitmentUpdateModal
        open={!!editIdx}
        onClose={() => setEditIdx(null)}
        data={editIdx ? filteredList[editIdx.itemIdx]?.positions[editIdx.posIdx] : null}
        year={editIdx ? filteredList[editIdx.itemIdx]?.year : ""}
        onSave={updated => {
          if (!editIdx) return;
          setList(list => {
            const newList = [...list];
            const realItem = newList.find(item => item.year === filteredList[editIdx.itemIdx].year);
            if (!realItem) return list;
            const realPos = realItem.positions[editIdx.posIdx];
            if (!realPos) return list;
            Object.assign(realPos, updated);
            return newList;
          });
        }}
      />
    </div>
  );
}
