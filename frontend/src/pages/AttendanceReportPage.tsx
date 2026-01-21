import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Select,
  Button,
  Space,
  DatePicker,
  Typography,
  Divider,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  DownloadOutlined,
  FileTextOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import {
  mockProjects,
  mockStaff,
  mockRosterEntries,
  mockMonthlyAttendance,
  mockShiftTypes,
} from '../data/mockData';

dayjs.extend(buddhistEra);
dayjs.locale('th');

const { Title, Text } = Typography;

interface AttendanceRecord {
  id: string;
  staffId: string;
  name: string;
  position: string;
  totalWorkDays: number;
  totalAbsent: number;
  totalSickLeave: number;
  totalPersonalLeave: number;
  totalVacation: number;
  totalLate: number;
  deductionAmount: number;
  totalHours: number;
}

const AttendanceReportPage: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-1');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

  const year = selectedDate.year() + 543;
  const month = selectedDate.month() + 1;

  // Get current project
  const currentProject = mockProjects.find((p) => p.id === selectedProjectId);

  // Build attendance report
  const reportData = useMemo(() => {
    return mockMonthlyAttendance.map((att) => ({
      ...att,
      name: att.staff.name,
      position: att.staff.position,
      totalHours: att.totalWorkDays * 8, // สมมติว่า 1 วัน = 8 ชม.
    }));
  }, []);

  // Calculate summary
  const summary = useMemo(() => {
    const total = reportData.reduce(
      (acc, record) => ({
        totalWorkDays: acc.totalWorkDays + record.totalWorkDays,
        totalAbsent: acc.totalAbsent + record.totalAbsent,
        totalSickLeave: acc.totalSickLeave + record.totalSickLeave,
        totalPersonalLeave:
          acc.totalPersonalLeave + record.totalPersonalLeave,
        totalVacation: acc.totalVacation + record.totalVacation,
        totalDeduction: acc.totalDeduction + record.deductionAmount,
      }),
      {
        totalWorkDays: 0,
        totalAbsent: 0,
        totalSickLeave: 0,
        totalPersonalLeave: 0,
        totalVacation: 0,
        totalDeduction: 0,
      }
    );

    return total;
  }, [reportData]);

  // Navigate month
  const handlePrevMonth = () => {
    setSelectedDate(selectedDate.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setSelectedDate(selectedDate.add(1, 'month'));
  };

  // Table columns
  const columns: ColumnsType<AttendanceRecord> = [
    {
      title: 'รายชื่อ',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left',
      width: 180,
      render: (name: string, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.position}
          </div>
        </div>
      ),
    },
    {
      title: 'ตำแหน่ง',
      dataIndex: 'position',
      key: 'position',
      width: 150,
    },
    {
      title: <div style={{ textAlign: 'center' }}>มาทำงาน (วัน)</div>,
      dataIndex: 'totalWorkDays',
      key: 'totalWorkDays',
      width: 120,
      align: 'center',
      render: (value: number) => (
        <span style={{ color: '#52c41a', fontWeight: 500 }}>{value}</span>
      ),
    },
    {
      title: <div style={{ textAlign: 'center' }}>ชาสงาน (วัน)</div>,
      dataIndex: 'totalAbsent',
      key: 'totalAbsent',
      width: 120,
      align: 'center',
      render: (value: number) => (
        <span style={{ color: value > 0 ? '#ff4d4f' : '#999' }}>
          {value || '-'}
        </span>
      ),
    },
    {
      title: <div style={{ textAlign: 'center' }}>ลาป่วย</div>,
      dataIndex: 'totalSickLeave',
      key: 'totalSickLeave',
      width: 100,
      align: 'center',
      render: (value: number) => (
        <span style={{ color: value > 0 ? '#faad14' : '#999' }}>
          {value || '-'}
        </span>
      ),
    },
    {
      title: <div style={{ textAlign: 'center' }}>ลากิจ</div>,
      dataIndex: 'totalPersonalLeave',
      key: 'totalPersonalLeave',
      width: 100,
      align: 'center',
      render: (value: number) => (
        <span style={{ color: value > 0 ? '#fa8c16' : '#999' }}>
          {value || '-'}
        </span>
      ),
    },
    {
      title: <div style={{ textAlign: 'center' }}>พักร้อน</div>,
      dataIndex: 'totalVacation',
      key: 'totalVacation',
      width: 100,
      align: 'center',
      render: (value: number) => (
        <span style={{ color: value > 0 ? '#13c2c2' : '#999' }}>
          {value || '-'}
        </span>
      ),
    },
    {
      title: <div style={{ textAlign: 'center' }}>รวมทั้งสิ้น (ชม.)</div>,
      dataIndex: 'totalHours',
      key: 'totalHours',
      width: 130,
      align: 'center',
      render: (value: number) => (
        <span style={{ color: '#1890ff', fontWeight: 500 }}>{value}</span>
      ),
    },
    {
      title: <div style={{ textAlign: 'center' }}>หักเงิน (บาท)</div>,
      dataIndex: 'deductionAmount',
      key: 'deductionAmount',
      width: 120,
      align: 'center',
      render: (value: number) => (
        <span style={{ color: value > 0 ? '#ff4d4f' : '#52c41a' }}>
          {value > 0 ? value.toLocaleString() : '-'}
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Space size="large">
              <Select
                value={selectedProjectId}
                onChange={setSelectedProjectId}
                style={{ width: 300 }}
                size="large"
              >
                {mockProjects.map((proj) => (
                  <Select.Option key={proj.id} value={proj.id}>
                    {proj.name}
                  </Select.Option>
                ))}
              </Select>

              <Space>
                <Button icon={<LeftOutlined />} onClick={handlePrevMonth} />
                <DatePicker
                  value={selectedDate}
                  onChange={(date) => date && setSelectedDate(date)}
                  picker="month"
                  format="MMMM BBBB"
                  style={{ width: 180 }}
                  size="large"
                  allowClear={false}
                />
                <Button icon={<RightOutlined />} onClick={handleNextMonth} />
              </Space>
            </Space>
          </Col>

          <Col>
            <Button type="primary" icon={<DownloadOutlined />} size="large">
              Export Excel
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Summary Statistics */}
      <Card style={{ marginTop: '16px' }}>
        <Title level={5}>
          <FileTextOutlined /> สรุปยอดการทำงานประจำเดือนและเงินที่ต้องหัก -{' '}
          {selectedDate.format('MMMM BBBB')}
        </Title>
        <Divider />
        <Row gutter={16}>
          <Col span={4}>
            <Statistic
              title="มาทำงาน (วัน)"
              value={summary.totalWorkDays}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="ชาสงาน (วัน)"
              value={summary.totalAbsent}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="ลาป่วย"
              value={summary.totalSickLeave}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="ลากิจ"
              value={summary.totalPersonalLeave}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="พักร้อน"
              value={summary.totalVacation}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Col>
          <Col span={4}>
            <Statistic
              title="ยอดหักทั้งสิ้น (บาท)"
              value={summary.totalDeduction}
              valueStyle={{ color: '#ff4d4f', fontWeight: 'bold' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card style={{ marginTop: '16px' }}>
        <Table
          columns={columns}
          dataSource={reportData}
          rowKey="id"
          pagination={false}
          scroll={{ x: 1200 }}
          bordered
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                <Table.Summary.Cell index={0} colSpan={2}>
                  <strong>ยอดรวมทั้งสิ้น</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align="center">
                  <strong style={{ color: '#52c41a' }}>
                    {summary.totalWorkDays}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="center">
                  <strong style={{ color: '#ff4d4f' }}>
                    {summary.totalAbsent || '-'}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align="center">
                  <strong style={{ color: '#faad14' }}>
                    {summary.totalSickLeave || '-'}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="center">
                  <strong style={{ color: '#fa8c16' }}>
                    {summary.totalPersonalLeave || '-'}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="center">
                  <strong style={{ color: '#13c2c2' }}>
                    {summary.totalVacation || '-'}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={7} align="center">
                  <strong style={{ color: '#1890ff' }}>
                    {reportData.reduce((sum, r) => sum + r.totalHours, 0)}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={8} align="center">
                  <strong style={{ color: '#ff4d4f' }}>
                    {summary.totalDeduction > 0
                      ? summary.totalDeduction.toLocaleString()
                      : '0'}
                  </strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>
    </div>
  );
};

export default AttendanceReportPage;
