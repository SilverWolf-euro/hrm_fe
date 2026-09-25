import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Select,
  Button,
  Pagination,
  Row,
  Col,
  DatePicker,
} from "antd";
import dayjs from "dayjs";
import { getLeaveReportSummary } from "../services/leaveReportService";
import { getDepartments } from "../services/departmentService";

const { Option } = Select;
const currentYear = dayjs().year();
const currentMonth = dayjs().month() + 1;



const columns = [
  { title: "Mã NV", dataIndex: "employee_code", key: "employee_code" },
  { title: "Họ và tên", dataIndex: "full_name", key: "full_name" },
  { title: "Chức danh", dataIndex: "position_name", key: "position_name" },
  { title: "Phòng ban", dataIndex: "department_name", key: "department_name" },
  { title: "Số NP năm nay (1)", dataIndex: "standard_leave", key: "standard_leave" },
  { title: "Số NP năm trước chuyển sang (2)", dataIndex: "transfer_leave", key: "transfer_leave" },
  { title: "Số NP tăng theo thâm niên (3)", dataIndex: "seniority_leave", key: "seniority_leave" },
  { title: "Số NP bị hủy (4)", dataIndex: "expired_leave", key: "expired_leave" },
  { title: "Tổng số NP được dùng cả năm (5)", dataIndex: "total_year_available", key: "total_year_available" },
  { title: "Số NP được sử dụng đến tháng hiện tại (6)", dataIndex: "current_available", key: "current_available" },
  { title: "Số NP đã sử dụng (7)", dataIndex: "used_days", key: "used_days" },
  { title: "Số NP còn lại cả năm (8)", dataIndex: "remain_total", key: "remain_total" },
  //{ title: "Số NP còn lại đến tháng hiện tại (9)", dataIndex: "remain_current", key: "remain_current" },
];

const LeaveSummaryPage = () => {
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [department, setDepartment] = useState("");
  const [departments, setDepartments] = useState([]);
  useEffect(() => {
    getDepartments().then(list => {
      if (Array.isArray(list)) setDepartments(list);
      else if (Array.isArray(list?.data)) setDepartments(list.data);
      else setDepartments([]);
    }).catch(() => setDepartments([]));
  }, []);
  const [keywords, setKeywords] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getLeaveReportSummary({
        year,
        month,
        department_code: department,
        keywords,
        page,
        size,
      });
      setData(Array.isArray(res.data?.items) ? res.data.items : []);
      setTotal(res.data?.total || 0);
    } catch (e) {
      setData([]);
      setTotal(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [year, month, department, page, size]);

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  return (
    <div>
      <h2 className="text-xl font-bold uppercase mb-4">Bảng tổng hợp nghỉ phép năm</h2>
      <div style={{ background: "#fff", padding: 16, marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <span>Tháng </span>
            <Select
              value={month}
              style={{ width: 100 }}
              onChange={setMonth}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <Option key={i + 1} value={i + 1}>
                  Tháng {i + 1}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <span>Năm </span>
            <Select
              value={year}
              style={{ width: 120 }}
              onChange={setYear}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <Option key={currentYear - 2 + i} value={currentYear - 2 + i}>
                  Năm {currentYear - 2 + i}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <span>Phòng ban </span>
            <Select
              value={department}
              style={{ width: 200 }}
              onChange={setDepartment}
              allowClear
              placeholder="Chọn phòng ban"
              showSearch
              optionFilterProp="children"
            >
              <Option value="">Tất cả phòng ban</Option>
              {departments.map(dep => (
                <Option key={dep.code} value={dep.code}>
                  {dep.name_vi || dep.name || dep.code}
                </Option>
              ))}
            </Select>
          </Col>
          <Col flex="auto">
            <Input
              placeholder="Nhập mã hoặc tên nhân viên..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              onPressEnter={handleSearch}
              style={{ width: 260 }}
            />
          </Col>
          <Col>
            <Button type="primary" onClick={handleSearch}>
              Tìm kiếm
            </Button>
          </Col>
        </Row>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        loading={loading}
        rowKey="employee_code"
        pagination={false}
        scroll={{ x: 1200 }}
        bordered
      />
      <div style={{ marginTop: 16, textAlign: "right" }}>
        <Pagination
          current={page}
          pageSize={size}
          total={total}
          showSizeChanger
          onChange={(p, s) => {
            setPage(p);
            setSize(s);
          }}
        />
      </div>
    </div>
  );
};

export default LeaveSummaryPage;
