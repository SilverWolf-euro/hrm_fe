import React, { useEffect, useState } from "react";
import { fetchAttendanceDailyReport } from "../services/hrMovementReportService";
import { saveAs } from "file-saver";

function formatDate(date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 10);
}

const AttendanceDailyReport = () => {
  const [date, setDate] = useState(formatDate(new Date()));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData(date);
    // eslint-disable-next-line
  }, [date]);

  const loadData = async (date_day) => {
    setLoading(true);
    try {
      const res = await fetchAttendanceDailyReport(date_day);
      setData(res || []);
    } catch (err) {
      setData([]);
    }
    setLoading(false);
  };

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const exportToExcel = () => {
    // Simple CSV export for demo
    let csv = "STT,Phòng ban/Nhà máy,Tổng số NS,Có mặt,Vắng mặt,Làm ca chiều+đêm\n";
    data.forEach((row, idx) => {
      csv += `${idx + 1},${row.department_name} (${row.work_location_id}),${row.total_emp},${row.total_check_in},${row.total_emp - row.total_check_in},${row.total_work_night}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `BaoCaoChamCong_${date}.csv`);
  };

  // Nhóm dữ liệu theo work_location
  const groupByLocation = (dataArr) => {
    const groups = {
      2: { name: "Văn phòng Công ty", items: [] },
      4: { name: "Nhà máy SX Nhựa gỗ", items: [] },
    };
    dataArr.forEach((item) => {
      if (item.work_location === "2" || item.work_location === 2) {
        groups[2].items.push(item);
      } else if (item.work_location === "4" || item.work_location === 4) {
        groups[4].items.push(item);
      }
    });
    return groups;
  };

  const calcTotal = (items) => {
    return {
      total_emp: items.reduce((sum, i) => sum + (i.total_emp || 0), 0),
      total_check_in: items.reduce((sum, i) => sum + (i.total_check_in || 0), 0),
      total_work_night: items.reduce((sum, i) => sum + (i.total_work_night || 0), 0),
    };
  };

  const groups = groupByLocation(data);

  let stt = 1;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Báo cáo chấm công ngày</h2>
      <div className="flex items-center gap-4 mb-4">
        <label>
          Ngày:
          <input
            type="date"
            value={date}
            onChange={handleDateChange}
            className="ml-2 border rounded px-2 py-1"
          />
        </label>
        <button
          onClick={exportToExcel}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Xuất Excel
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">STT</th>
              <th className="border px-2 py-1">Nội dung</th>
              <th className="border px-2 py-1">Tổng số NS</th>
              <th className="border px-2 py-1">Số NS có mặt</th>
              <th className="border px-2 py-1">Số NS vắng mặt</th>
              <th className="border px-2 py-1">Số NS làm ca chiều + ca đêm</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center">Đang tải...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={6} className="text-center">Không có dữ liệu</td></tr>
            ) : (
              Object.entries(groups).map(([loc, group], groupIdx) => {
                if (group.items.length === 0) return null;
                const total = calcTotal(group.items);
                return (
                  <React.Fragment key={loc}>
                    <tr className="bg-green-600 font-semibold text-white">
                      <td className="border px-2 py-1" colSpan={6}>{group.name}</td>
                    </tr>
                    <tr className="bg-gray-50 font-bold">
                      <td className="border px-2 py-1 text-center"></td>
                      <td className="border px-2 py-1">Tổng cộng</td>
                      <td className="border px-2 py-1 text-center">{total.total_emp}</td>
                      <td className="border px-2 py-1 text-center">{total.total_check_in}</td>
                      <td className="border px-2 py-1 text-center">{total.total_emp - total.total_check_in}</td>
                      <td className="border px-2 py-1 text-center">{total.total_work_night}</td>
                    </tr>
                    {group.items.map((row, idx) => (
                      <tr key={row.department_id}>
                        <td className="border px-2 py-1 text-center">{stt++}</td>
                        <td className="border px-2 py-1">{row.department_name}</td>
                        <td className="border px-2 py-1 text-center">{row.total_emp}</td>
                        <td className="border px-2 py-1 text-center">{row.total_check_in}</td>
                        <td className="border px-2 py-1 text-center">{row.total_emp - row.total_check_in}</td>
                        <td className="border px-2 py-1 text-center">{row.total_work_night}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceDailyReport;
