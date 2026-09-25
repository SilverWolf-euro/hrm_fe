import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createLeaveRequest } from "../services/leaveRequestService";
import { searchLeaveTypes } from "../services/leaveTypeService";

export default function LeaveRequestForm() {
  const navigate = useNavigate();
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveCategory, setLeaveCategory] = useState("");
  const [form, setForm] = useState({
    leaveType: "", // sẽ là leave_id
    fromDate: "",
    toDate: "",
    // Block cho 1 ngày
    singleDayType: "full",
    singleHalfType: "morning",
    // Block cho nhiều ngày
    firstDayType: "full",
    firstHalfType: "morning",
    lastDayType: "full",
    lastHalfType: "morning",
    reason: "",
    file: null,
  });
  const [error, setError] = useState("");

  // Lấy danh sách loại nghỉ phép
  useEffect(() => {
    async function fetchLeaveTypesByCategory() {
      if (!leaveCategory) {
        setLeaveTypes([]);
        return;
      }
      try {
        const res = await searchLeaveTypes({ leave_type: leaveCategory });
        if (res && Array.isArray(res.data)) {
          setLeaveTypes(res.data.filter(t => t.leave_code !== "TN"));
        } else if (Array.isArray(res)) {
          setLeaveTypes(res.filter(t => t.leave_code !== "TN"));
        } else {
          setLeaveTypes([]);
        }
      } catch {
        setLeaveTypes([]);
      }
    }
    fetchLeaveTypesByCategory();
  }, [leaveCategory]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Logic đặc biệt cho firstDayType và lastDayType
    if (name === "firstDayType" && value === "half") {
      setForm((prev) => ({
        ...prev,
        firstDayType: "half",
        firstHalfType: "afternoon", // Mặc định buổi chiều
      }));
      return;
    }
    if (name === "lastDayType" && value === "half") {
      setForm((prev) => ({
        ...prev,
        lastDayType: "half",
        lastHalfType: "morning", // Mặc định buổi sáng
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // const handleFileChange = (e) => {
  //   setForm((prev) => ({ ...prev, file: e.target.files[0] }));
  // };

  // Tính số ngày nghỉ dựa trên lựa chọn
  const calcDays = () => {
    if (!form.fromDate || !form.toDate) return 0;
    const from = new Date(form.fromDate);
    const to = new Date(form.toDate);
    if (from > to) return 0;
    if (form.fromDate === form.toDate) {
      return form.singleDayType === "full" ? 1 : 0.5;
    } else {
      const diff = Math.round((to - from) / (1000 * 60 * 60 * 24));
      let total = 0;
      // Ngày đầu
      total += form.firstDayType === "full" ? 1 : 0.5;
      // Ngày cuối
      total += form.lastDayType === "full" ? 1 : 0.5;
      // Các ngày giữa
      if (diff > 1) total += diff - 1;
      return total;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.leaveType || !form.fromDate || !form.toDate || !form.reason.trim()) {
      setError("Vui lòng nhập đầy đủ thông tin bắt buộc, bao gồm lý do nghỉ.");
      return;
    }
    setError("");
    // Chuẩn bị FormData
    const formData = new FormData();
    // Map các trường FE sang API
    formData.append("leave_id", form.leaveType);
    formData.append("from_date", form.fromDate);
    formData.append("to_date", form.toDate);
    // Xử lý session (AM/PM) cho từng trường hợp
    if (form.fromDate === form.toDate) {
      // 1 ngày
      if (form.singleDayType === "full") {
        formData.append("start_session", "AM");
        formData.append("end_session", "PM");
      } else {
        formData.append("start_session", form.singleHalfType === "morning" ? "AM" : "PM");
        formData.append("end_session", form.singleHalfType === "morning" ? "AM" : "PM");
      }
    } else {
      // Nhiều ngày
      formData.append("start_session", form.firstDayType === "full" ? "AM" : "PM");
      formData.append("end_session", form.lastDayType === "full" ? "PM" : "AM");
    }
    formData.append("reason", form.reason);
    if (form.file) {
      formData.append("attachments", form.file);
    }
    try {
      await createLeaveRequest(formData);
      alert("Gửi đơn nghỉ thành công!");
      navigate("/leave-requests-sent");
    } catch (err) {
      setError("Gửi đơn thất bại. Vui lòng thử lại!");
    }
  };

  // Xác định hiển thị block nào
  const isSingleDay = form.fromDate && form.toDate && form.fromDate === form.toDate;

  // Lấy thông tin user từ access_token (JWT) - giải mã Unicode chuẩn
  function b64DecodeUnicode(str) {
    return decodeURIComponent(
      atob(str)
        .split('')
        .map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
  }
  let senderName = "";
  let senderDept = "";
  try {
    const userJson = localStorage.getItem("userInfo");
    if (userJson) {
      const user = JSON.parse(userJson);
      senderName = user.FullName || "";
      senderDept = user.Department || "";
      console.log("userInfo:", user);
      console.log("senderDept:", senderDept);
    } else {
      // Nếu không có userInfo, thử lấy từ access_token
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        const payload = JSON.parse(b64DecodeUnicode(accessToken.split(".")[1]));
        senderName = payload.name || payload.FullName || "";
        senderDept = payload.Department || "";
        console.log("accessToken payload:", payload);
        console.log("senderDept:", senderDept);
      }
    }
  } catch (e) { console.log("Error parsing user info", e); }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Tạo đơn nghỉ </h2>
      <div className="mb-2 text-gray-700 text-sm">
        Người gửi: <b>{senderName}</b> &nbsp;|&nbsp; Phòng ban: <b>{senderDept}</b>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Nhóm loại nghỉ <span className="text-red-500">*</span></label>
        <select
          name="leaveCategory"
          value={leaveCategory}
          onChange={e => {
            setLeaveCategory(e.target.value);
            setForm(prev => ({ ...prev, leaveType: "" }));
          }}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">--Chọn nhóm loại nghỉ--</option>
          <option value="PAID">Hưởng lương</option>
          <option value="UNPAID">Không hưởng lương</option>
          <option value="BENEFIT">Nghỉ chế độ</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Loại nghỉ <span className="text-red-500">*</span></label>
        <select name="leaveType" value={form.leaveType} onChange={handleChange} className="w-full border rounded px-3 py-2" disabled={!leaveCategory}>
          <option value="">--Chọn loại nghỉ--</option>
          {leaveTypes.map(type => (
            <option key={type.leave_id} value={type.leave_id}>{type.leave_name}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Từ ngày <span className="text-red-500">*</span></label>
        <input type="date" name="fromDate" value={form.fromDate} onChange={handleChange} className="w-full border rounded px-3 py-2" />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Đến ngày <span className="text-red-500">*</span></label>
        <input type="date" name="toDate" value={form.toDate} onChange={handleChange} className="w-full border rounded px-3 py-2" />
      </div>
      {/* Block chọn hình thức nghỉ */}
      {form.fromDate && form.toDate && (
        isSingleDay ? (
          <div className="mb-4 border rounded p-3">
            <div className="font-medium mb-2">Hình thức nghỉ</div>
            <div className="flex items-center gap-4">
              <label>
                <input type="radio" name="singleDayType" value="full" checked={form.singleDayType === "full"} onChange={handleChange} /> Cả ngày
              </label>
              <label>
                <input type="radio" name="singleDayType" value="half" checked={form.singleDayType === "half"} onChange={handleChange} /> Nửa ngày
              </label>
            </div>
            {form.singleDayType === "half" && (
              <div className="mt-2">
                <label className="mr-2">
                  <input type="radio" name="singleHalfType" value="morning" checked={form.singleHalfType === "morning"} onChange={handleChange} /> Buổi sáng
                </label>
                <label>
                  <input type="radio" name="singleHalfType" value="afternoon" checked={form.singleHalfType === "afternoon"} onChange={handleChange} /> Buổi chiều
                </label>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 border rounded p-3">
              <div className="font-medium mb-2">Ngày đầu ({form.fromDate}):</div>
              <div className="flex items-center gap-4">
                <label>
                  <input type="radio" name="firstDayType" value="full" checked={form.firstDayType === "full"} onChange={handleChange} /> Cả ngày
                </label>
                <label>
                  <input type="radio" name="firstDayType" value="half" checked={form.firstDayType === "half"} onChange={handleChange} /> Nửa ngày (Buổi chiều)
                </label>
              </div>
              {/* Không hiện chọn sáng/chiều cho nhiều ngày, chỉ mặc định */}
            </div>
            <div className="mb-4 border rounded p-3">
              <div className="font-medium mb-2">Ngày cuối ({form.toDate}):</div>
              <div className="flex items-center gap-4">
                <label>
                  <input type="radio" name="lastDayType" value="full" checked={form.lastDayType === "full"} onChange={handleChange} /> Cả ngày
                </label>
                <label>
                  <input type="radio" name="lastDayType" value="half" checked={form.lastDayType === "half"} onChange={handleChange} /> Nửa ngày (Buổi sáng)
                </label>
              </div>
              {/* Không hiện chọn sáng/chiều cho nhiều ngày, chỉ mặc định */}
            </div>
            <div className="mb-2 text-sm text-gray-600">Các ngày giữa sẽ mặc định là cả ngày.</div>
          </>
        )
      )}
      <div className="mb-4">
        <div className="mb-2 text-blue-700 font-semibold">Tổng số ngày nghỉ: {calcDays()}</div>
        <label className="block mb-1 font-medium">Lý do nghỉ<span className="text-red-500">*</span></label>
        <textarea name="reason" value={form.reason} onChange={handleChange} className="w-full border rounded px-3 py-2" />
      </div>
      {/* <div className="mb-4">
        <label className="block mb-1 font-medium">Đính kèm file</label>
        <input type="file" onChange={handleFileChange} className="w-full" />
      </div> */}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="flex justify-between">
        <button
          type="button"
          className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          onClick={() => navigate("/leave-requests-sent")}
        >
          Hủy
        </button>
        <button type="submit" className="px-6 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Gửi đơn</button>
      </div>
    </form>
  );
}
