import React, { useEffect, useState } from "react";
import { getMyLeaveRequests, recallLeaveRequest } from "../services/leaveRequestService";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import LeaveRequestDetailViewOnly from "../components/LeaveRequestDetailViewOnly";
import { getDecodedToken } from "../utils/jwt";

const STATUS_COLORS = {
  "Chờ duyệt": "bg-orange-500 text-white",
  "Đang duyệt": "bg-yellow-400 text-white",
  "Đã duyệt": "bg-green-500 text-white",
  "Từ chối": "bg-red-500 text-white",
};
// Map status code sang tiếng Việt
function getStatusDisplay(status) {
  switch ((status || "").toUpperCase()) {
    case "WAITING":
      return "Chờ duyệt";
    case "SENT":
    case "REVIEWING":
      return "Đang duyệt";
    case "APPROVED":
      return "Đã duyệt";
    case "REJECTED":
      return "Từ chối";
    case "CANCELLED":
      return "Đã thu hồi";
    default:
      return status;
  }
}



export default function LeaveRequestSent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMyLeaveRequests();
      // Sắp xếp mới nhất lên đầu
      setData(
        (res || []).sort((a, b) => new Date(b.create_date) - new Date(a.create_date))
      );
    } catch {
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecall = async (code) => {
    if (window.confirm("Bạn có chắc chắn muốn thu hồi đơn này?")) {
      try {
        await recallLeaveRequest(code);
        alert("Thu hồi đơn thành công!");
        fetchData();
      } catch (error) {
        alert("Có lỗi xảy ra khi thu hồi đơn.");
      }
    }
  };

  const handleCreate = () => {
    navigate("/leave-request-form");
  };


  const [showDetail, setShowDetail] = useState(false);
  const [selectedCode, setSelectedCode] = useState(null);
  const [currentUserCode, setCurrentUserCode] = useState("");

  useEffect(() => {
    const decoded = getDecodedToken();
    setCurrentUserCode(decoded?.employeeCode || decoded?.emp_code || "");
  }, []);

  const handleViewDetail = (item) => {
    setSelectedCode(item.leave_code);
    setShowDetail(true);
  };
  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedCode(null);
  };

  return (
    <div className="p-6">
      <div className="text-xl font-bold mb-4">Đơn xin nghỉ đã gửi</div>
      <div className="flex gap-4 mb-4 items-end justify-between">
        <div></div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition" onClick={handleCreate}>
          Tạo đơn
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-blue-100">
              <th className="border px-2 py-1">STT</th>
              <th className="border px-2 py-1">Mã đơn</th>
              <th className="border px-2 py-1">Ngày tạo đơn</th>
              <th className="border px-2 py-1">Loại nghỉ</th>
              <th className="border px-2 py-1">Từ ngày</th>
              <th className="border px-2 py-1">Đến ngày</th>
              <th className="border px-2 py-1">Số ngày</th>
              <th className="border px-2 py-1">Lý do</th>
              <th className="border px-2 py-1">Trạng thái</th>
              <th className="border px-2 py-1">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={12} className="text-center">Đang tải...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={12} className="text-center text-gray-500">Không có dữ liệu.</td></tr>
            ) : (
              data.map((item, i) => (
                <tr key={item.leave_code}>
                  <td className="border px-2 py-1 text-center">{i + 1}</td>
                  <td className="border px-2 py-1 text-blue-700 font-bold cursor-pointer underline" onClick={() => handleViewDetail(item)}>{item.leave_code}</td>
                  <td className="border px-2 py-1 text-center">{dayjs(item.create_date).format("DD/MM/YYYY")}</td>
                  <td className="border px-2 py-1">{item.leave_type}</td>
                  <td className="border px-2 py-1 text-center">{dayjs(item.from_date).format("DD/MM/YYYY")}</td>
                  <td className="border px-2 py-1 text-center">{dayjs(item.to_date).format("DD/MM/YYYY")}</td>
                  <td className="border px-2 py-1 text-center">{item.total_days}</td>
                  <td className="border px-2 py-1">{item.reason}</td>
                  <td className="border px-2 py-1 text-center">
                    <span className={`inline-block rounded-md px-3 py-1 text-xs font-semibold ${STATUS_COLORS[getStatusDisplay(item.status)] || "bg-gray-200 text-gray-700"}`}>
                      {getStatusDisplay(item.status)}
                    </span>
                  </td>
                  <td className="border px-2 py-1 text-center">
                    {showDetail && (
                      <LeaveRequestDetailViewOnly code={selectedCode} onClose={handleCloseDetail} currentUserCode={currentUserCode} />
                    )}
                    <button className="text-blue-600 hover:text-blue-900" title="Xem chi tiết" onClick={() => handleViewDetail(item)}>
                      👁
                    </button>
                    {((item.status || "").toUpperCase() === "WAITING" || (item.status || "").toUpperCase() === "SENT") && (
                      <button className="text-red-600 hover:text-red-900 ml-3" title="Thu hồi đơn" onClick={() => handleRecall(item.leave_code)}>
                        ↩️
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
