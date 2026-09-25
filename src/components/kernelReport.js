"use client"

import React, { useState, useEffect } from "react"

import { fetchHRMovementReport } from "../services/hrMovementReportService"

export default function HRMovementReport() {
    const [startMonth, setStartMonth] = useState("06")
    const [startYear, setStartYear] = useState("2025")
    const [endMonth, setEndMonth] = useState("07")
    const [endYear, setEndYear] = useState("2025")
    const [reportData, setReportData] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"))
    const years = ["2023", "2024", "2025", "2026"]

    const fetchReport = async () => {
        setLoading(true)
        setError("")
        const from_date = `${startYear}-${startMonth}-01`
        const to_date = `${endYear}-${endMonth}-10`
        try {
            const data = await fetchHRMovementReport({ from_date, to_date, type_report: "tháng" })
            // Map lại dữ liệu cho bảng
            const sections = []
            if (data["totals_by_work_location"]) {
                data["totals_by_work_location"].forEach((total, idx) => {
                    const key = total.work_location
                    const items = (data[key] || []).map(item => ({
                        name: item.department_name,
                        dauKy: item.first_period,
                        tang: item.count_join,
                        giam: item.count_leave,
                        cuoiKy: item.end_period,
                        ghiChu: ""
                    }))
                    sections.push({
                        section: key,
                        bgColor: idx % 2 === 0 ? "bg-red-200" : "bg-orange-200",
                        dauKy: total.total_first_period,
                        tang: total.total_join,
                        giam: total.total_leave,
                        cuoiKy: total.total_end_period,
                        ghiChu: "",
                        items
                    })
                })
            }
            sections.sort((a, b) => {
              // Văn phòng Hà Nội lên trên
              if (a.section === "Văn phòng Hà Nội") return -1;
              if (b.section === "Văn phòng Hà Nội") return 1;
              return 0;
            });
            setReportData(sections)
        } catch (err) {
            setError("Không thể tải báo cáo")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchReport()
        // eslint-disable-next-line
    }, [])

    const handleFilter = () => {
        fetchReport()
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-gray-200 p-4 space-y-4">
                <div className="bg-blue-600 text-white p-2 text-center font-semibold">Lọc báo cáo</div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Kỳ báo cáo</label>
                    <div className="flex gap-2">
                        <select className="bg-white border rounded px-2 py-1" value={startMonth} onChange={e => setStartMonth(e.target.value)}>
                            {months.map(month => <option key={month} value={month}>{month}</option>)}
                        </select>
                        <select className="bg-white border rounded px-2 py-1" value={startYear} onChange={e => setStartYear(e.target.value)}>
                            {years.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Cuối kỳ</label>
                    <div className="flex gap-2">
                        <select className="bg-white border rounded px-2 py-1" value={endMonth} onChange={e => setEndMonth(e.target.value)}>
                            {months.map(month => <option key={month} value={month}>{month}</option>)}
                        </select>
                        <select className="bg-white border rounded px-2 py-1" value={endYear} onChange={e => setEndYear(e.target.value)}>
                            {years.map(year => <option key={year} value={year}>{year}</option>)}
                        </select>
                    </div>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded" onClick={handleFilter}>Lọc</button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
                <div className="bg-white rounded-lg shadow-sm">
                    <div className="border-b p-4">
                        <h1 className="text-center text-lg font-bold">BÁO CÁO BIẾN ĐỘNG NHÂN SỰ</h1>
                    </div>
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Đang tải dữ liệu...</div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-500">{error}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border-collapse">
                                <thead>
                                    <tr className="bg-blue-100">
                                        <th className="text-center border">STT</th>
                                        <th className="text-center border">Phòng Ban</th>
                                        <th className="text-center border">Đầu kỳ</th>
                                        <th className="text-center border">Tăng nhân viên</th>
                                        <th className="text-center border">Giảm Nhân viên</th>
                                        <th className="text-center border">Cuối Kỳ</th>
                                        <th className="text-center border">Ghi Chú</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.map((section, sectionIdx) => {
                                        const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"]
                                        return (
                                            <React.Fragment key={sectionIdx}>
                                                <tr className={section.bgColor}>
                                                    <td className="text-center border font-bold">{romanNumerals[sectionIdx]}</td>
                                                    <td className="border px-4 font-bold">{section.section}</td>
                                                    <td className="text-center border">{section.dauKy ?? ""}</td>
                                                    <td className="text-center border">{section.tang ?? ""}</td>
                                                    <td className="text-center border">{section.giam ?? ""}</td>
                                                    <td className="text-center border">{section.cuoiKy ?? ""}</td>
                                                    <td className="text-center border">{section.ghiChu ?? ""}</td>
                                                </tr>
                                                {section.items.map((item, itemIdx) => (
                                                    <tr key={itemIdx}>
                                                        <td className="text-center border"></td>
                                                        <td className="border px-4">{item.name}</td>
                                                        <td className="text-center border">{item.dauKy}</td>
                                                        <td className="text-center border">{item.tang || ""}</td>
                                                        <td className="text-center border">{item.giam || ""}</td>
                                                        <td className="text-center border">{item.cuoiKy}</td>
                                                        <td className="text-center border">{item.ghiChu || ""}</td>
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
