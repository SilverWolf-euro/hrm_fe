import React, { useState, useEffect } from 'react';
import workShiftService from '../services/workShiftService';


const initialState = {
  id: '',
  shift_name: '',
  start_time: '',
  end_time: '',
  break_start: '',
  break_end: '',
  is_overnight: false,
};

const WorkShiftForm = ({ onClose, onSuccess, initialData }) => {
  const [form, setForm] = useState(initialData ? { ...initialState, ...initialData, is_overnight: !!initialData.is_overnight } : initialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({ ...initialState, ...initialData, is_overnight: !!initialData.is_overnight });
    }
  }, [initialData]);

  const validate = () => {
    const errs = {};
    if (!form.shift_name || form.shift_name.length > 50) errs.shift_name = 'Bắt buộc, tối đa 50 ký tự';
    if (!form.id || form.id.trim() === "") errs.id = 'Bắt buộc';
    if (!form.start_time) errs.start_time = 'Bắt buộc';
    if (!form.end_time) errs.end_time = 'Bắt buộc';
    return errs;
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      if (initialData) {
        await workShiftService.updateWorkShift(form.id, {
          ...form,
          is_overnight: form.is_overnight ? 1 : 0,
        });
      } else {
        await workShiftService.createWorkShift({
          ...form,
          is_overnight: form.is_overnight ? 1 : 0,
        });
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrors({ submit: 'Có lỗi khi lưu ca làm việc hoặc mã ca đã tồn tại.' });
    }
    setLoading(false);
  };

  return (
    <form className="p-4 bg-white rounded shadow max-w-xl mx-auto" onSubmit={handleSubmit}>
      <h3 className="font-bold text-blue-700 mb-2">Thông tin chung</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block font-medium">Tên ca làm việc <span className="text-red-500">*</span></label>
          <input name="shift_name" maxLength={50} value={form.shift_name} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
          {errors.shift_name && <div className="text-red-500 text-xs">{errors.shift_name}</div>}
        </div>
        <div>
          <label className="block font-medium">Mã ca viết tắt <span className="text-red-500">*</span></label>
          <input name="id" maxLength={20} value={form.id} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
          {errors.id && <div className="text-red-500 text-xs">{errors.id}</div>}
        </div>
        {/* <div>
          <label className="block font-medium">Số công hưởng</label>
          <select name="work_unit" value={form.work_unit} onChange={handleChange} className="border px-2 py-1 rounded w-full">
            <option value={1}>1</option>
            <option value={0.5}>0.5</option>
          </select>
        </div> */}
      </div>
      <h3 className="font-bold text-blue-700 mb-2">Thời gian làm việc</h3>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block font-medium">Giờ bắt đầu ca <span className="text-red-500">*</span></label>
          <input name="start_time" type="time" value={form.start_time} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
          {errors.start_time && <div className="text-red-500 text-xs">{errors.start_time}</div>}
        </div>
        <div>
          <label className="block font-medium">Giờ kết thúc ca <span className="text-red-500">*</span></label>
          <input name="end_time" type="time" value={form.end_time} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
          {errors.end_time && <div className="text-red-500 text-xs">{errors.end_time}</div>}
        </div>
        <div>
          <label className="block font-medium">Giờ bắt đầu nghỉ</label>
          <input name="break_start" type="time" value={form.break_start} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
        </div>
        <div>
          <label className="block font-medium">Giờ kết thúc nghỉ</label>
          <input name="break_end" type="time" value={form.break_end} onChange={handleChange} className="border px-2 py-1 rounded w-full" />
        </div>
      </div>
      
      <div className="flex items-center mb-4">
        <input type="checkbox" name="is_overnight" checked={form.is_overnight} onChange={handleChange} id="overnight" className="mr-2" />
        <label htmlFor="overnight" className="font-medium">Ca qua đêm</label>
      </div>
      {errors.submit && <div className="text-red-500 mb-2">{errors.submit}</div>}
      <div className="flex justify-end gap-2">
        <button type="button" className="px-4 py-2 rounded border" onClick={onClose} disabled={loading}>Hủy</button>
        <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>Thêm</button>
      </div>
    </form>
  );
};

export default WorkShiftForm;
