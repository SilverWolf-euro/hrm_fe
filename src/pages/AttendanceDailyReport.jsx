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

  const exportToExcel = async () => {
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Báo cáo chấm công");
    const border = {
      top: { style: "thin" },
      left: { style: "thin" },
      bottom: { style: "thin" },
      right: { style: "thin" },
    };

    sheet.columns = [
      { width: 6 },
      { width: 40 },
      { width: 14 },
      { width: 14 },
      { width: 16 },
      { width: 26 },
    ];

    sheet.mergeCells("A1:F1");
    sheet.getCell("A1").value = `BÁO CÁO CHẤM CÔNG NGÀY ${date.split("-").reverse().join("/")}`;
    sheet.getCell("A1").font = { bold: true, size: 14 };
    sheet.getCell("A1").alignment = { horizontal: "center" };

    const header = sheet.addRow([
      "STT",
      "Nội dung",
      "Tổng số NS",
      "Số NS có mặt",
      "Số NS vắng mặt",
      "Số NS làm ca chiều + ca đêm",
    ]);
    header.eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
      cell.border = border;
    });

    let rowNo = 1;
    Object.values(groupByLocation(data)).forEach((group) => {
      if (group.items.length === 0) return;
      const total = calcTotal(group.items);

      const groupRow = sheet.addRow([group.name]);
      sheet.mergeCells(groupRow.number, 1, groupRow.number, 6);
      groupRow.getCell(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      groupRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF16A34A" } };

      const totalRow = sheet.addRow([
        "",
        "Tổng cộng",
        total.total_emp,
        total.total_check_in,
        total.total_emp - total.total_check_in,
        total.total_work_night,
      ]);
      totalRow.font = { bold: true };

      group.items.forEach((row) => {
        sheet.addRow([
          rowNo++,
          row.department_name,
          row.total_emp,
          row.total_check_in,
          row.total_emp - row.total_check_in,
          row.total_work_night,
        ]);
      });
    });

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber <= 2) return;
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = border;
        if (colNumber !== 2) cell.alignment = { horizontal: "center" };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `BaoCaoChamCong_${date}.xlsx`);
  };

  // Nhóm dữ liệu theo work_location
  const groupByLocation = (dataArr) => {
    const groups = {
      2: { name: "Văn phòng Công ty", items: [] },
      4: { name: "Nhà máy SX Nhựa gỗ", items: [] },
    };
    dataArr.forEach((item) => {
      const locId = String(item.work_location_id ?? "");
      if (!groups[locId]) {
        groups[locId] = { name: item.work_location || "Khác", items: [] };
      }
      groups[locId].items.push(item);
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
