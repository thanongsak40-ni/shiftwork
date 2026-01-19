import React, { useState } from 'react';
import {
  Card,
  Select,
  Button,
  Space,
  Table,
  DatePicker,
  Tabs,
  Row,
  Col,
  Statistic,
  Tag,
  message,
} from 'antd';
import {
  DownloadOutlined,
  FileExcelOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import * as XLSX from 'xlsx';

dayjs.extend(buddhistEra);
dayjs.locale('th');

const API_URL = 'http://localhost:3001/api';

interface Project {
  id: string;
  name: string;
}

interface StaffAttendance {
  staffId: string;
  staffName: string;
  position: string;
  wagePerDay: number;
  totalWorkDays: number;
  totalAbsent: number;
  totalSickLeave: number;
  totalPersonalLeave: number;
  totalVacation: number;
  totalLate: number;
  deductionAmount: number;
  expectedSalary: number;
  netSalary: number;
}

interface DeductionReport {
  projectId: string;
  projectName: string;
  year: number;
  month: number;
  staff: StaffAttendance[];
  totals: {
    totalWorkDays: number;
    totalAbsent: number;
    totalSickLeave: number;
    totalPersonalLeave: number;
    totalVacation: number;
    totalDeduction: number;
    totalExpectedSalary: number;
    totalNetSalary: number;
  };
}

interface CostSharingCalculation {
  projectId: string;
  projectName: string;
  originalCost: number;
  sharedOut: number;
  sharedIn: number;
  netCost: number;
}

const ReportsPage: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [activeTab, setActiveTab] = useState('deduction');

  const year = selectedDate.year() + 543;
  const month = selectedDate.month() + 1;

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/projects`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return response.data;
    },
  });

  // Fetch deduction report
  const { data: deductionData, isLoading: deductionLoading } = useQuery<{
    report: DeductionReport;
  }>({
    queryKey: ['report-deduction', selectedProjectId, year, month],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/reports/deduction`, {
        params: { projectId: selectedProjectId, year, month },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return response.data;
    },
    enabled: !!selectedProjectId && activeTab === 'deduction',
  });

  // Fetch cost sharing report
  const { data: costSharingData, isLoading: costSharingLoading } = useQuery<{
    report: {
      year: number;
      month: number;
      projects: CostSharingCalculation[];
      grandTotals: {
        originalCost: number;
        sharedOut: number;
        sharedIn: number;
        netCost: number;
      };
    };
  }>({
    queryKey: ['report-cost-sharing', year, month],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/reports/cost-sharing`, {
        params: { year, month },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return response.data;
    },
    enabled: activeTab === 'cost-sharing',
  });

  // Export to CSV
  const handleExportCSV = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/export`, {
        params: { projectId: selectedProjectId, year, month },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${selectedProjectId}_${year}_${month}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      message.success('ดาวน์โหลดรายงานสำเร็จ');
    } catch (error) {
      message.error('เกิดข้อผิดพลาดในการดาวน์โหลด');
    }
  };

  // Export to Excel
  const handleExportExcel = () => {
    if (!deductionData?.report) return;

    const ws = XLSX.utils.json_to_sheet(
      deductionData.report.staff.map((s) => ({
        ชื่อพนักงาน: s.staffName,
        ตำแหน่ง: s.position,
        'ค่าแรง/วัน': s.wagePerDay,
        วันทำงาน: s.totalWorkDays,
        ขาด: s.totalAbsent,
        ลาป่วย: s.totalSickLeave,
        ลากิจ: s.totalPersonalLeave,
        พักร้อน: s.totalVacation,
        เงินเดือนคาดหวัง: s.expectedSalary,
        หักเงิน: s.deductionAmount,
        เงินเดือนสุทธิ: s.netSalary,
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'รายงาน');
    XLSX.writeFile(wb, `report_${selectedProjectId}_${year}_${month}.xlsx`);

    message.success('ดาวน์โหลดรายงานสำเร็จ');
  };

  // Deduction report columns
  const deductionColumns = [
    {
      title: 'ชื่อพนักงาน',
      dataIndex: 'staffName',
      key: 'staffName',
    },
    {
      title: 'ตำแหน่ง',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'ค่าแรง/วัน',
      dataIndex: 'wagePerDay',
      key: 'wagePerDay',
      render: (value: number) => `฿${value.toLocaleString()}`,
    },
    {
      title: 'วันทำงาน',
      dataIndex: 'totalWorkDays',
      key: 'totalWorkDays',
      render: (value: number) => <Tag color="green">{value}</Tag>,
    },
    {
      title: 'ขาด',
      dataIndex: 'totalAbsent',
      key: 'totalAbsent',
      render: (value: number) => value > 0 ? <Tag color="red">{value}</Tag> : '-',
    },
    {
      title: 'ลาป่วย',
      dataIndex: 'totalSickLeave',
      key: 'totalSickLeave',
      render: (value: number) => value > 0 ? <Tag color="orange">{value}</Tag> : '-',
    },
    {
      title: 'ลากิจ',
      dataIndex: 'totalPersonalLeave',
      key: 'totalPersonalLeave',
      render: (value: number) => value > 0 ? <Tag color="orange">{value}</Tag> : '-',
    },
    {
      title: 'พักร้อน',
      dataIndex: 'totalVacation',
      key: 'totalVacation',
      render: (value: number) => value > 0 ? <Tag color="cyan">{value}</Tag> : '-',
    },
    {
      title: 'เงินเดือนคาดหวัง',
      dataIndex: 'expectedSalary',
      key: 'expectedSalary',
      render: (value: number) => `฿${value.toLocaleString()}`,
    },
    {
      title: 'หักเงิน',
      dataIndex: 'deductionAmount',
      key: 'deductionAmount',
      render: (value: number) => (
        <span style={{ color: 'red', fontWeight: 'bold' }}>
          {value > 0 ? `-฿${value.toLocaleString()}` : '-'}
        </span>
      ),
    },
    {
      title: 'เงินเดือนสุทธิ',
      dataIndex: 'netSalary',
      key: 'netSalary',
      render: (value: number) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          ฿{value.toLocaleString()}
        </span>
      ),
    },
  ];

  // Cost sharing columns
  const costSharingColumns = [
    {
      title: 'โครงการ',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: 'ต้นทุนเดิม',
      dataIndex: 'originalCost',
      key: 'originalCost',
      render: (value: number) => `฿${value.toLocaleString()}`,
    },
    {
      title: 'แชร์ออก',
      dataIndex: 'sharedOut',
      key: 'sharedOut',
      render: (value: number) => (
        <span style={{ color: 'red' }}>
          {value > 0 ? `-฿${value.toLocaleString()}` : '-'}
        </span>
      ),
    },
    {
      title: 'รับแชร์',
      dataIndex: 'sharedIn',
      key: 'sharedIn',
      render: (value: number) => (
        <span style={{ color: 'green' }}>
          {value > 0 ? `+฿${value.toLocaleString()}` : '-'}
        </span>
      ),
    },
    {
      title: 'ต้นทุนสุทธิ',
      dataIndex: 'netCost',
      key: 'netCost',
      render: (value: number) => (
        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
          ฿{value.toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
            📊 รายงานและสถิติ
          </span>
        }
        extra={
          <Space>
            {activeTab === 'deduction' && (
              <Select
                placeholder="เลือกโครงการ"
                style={{ width: 250 }}
                onChange={setSelectedProjectId}
                value={selectedProjectId || undefined}
              >
                {projectsData?.projects?.map((p: Project) => (
                  <Select.Option key={p.id} value={p.id}>
                    {p.name}
                  </Select.Option>
                ))}
              </Select>
            )}
            <DatePicker
              picker="month"
              value={selectedDate}
              onChange={(date) => date && setSelectedDate(date)}
              format="MMMM BBBB"
              style={{ width: 200 }}
            />
          </Space>
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'deduction',
              label: '📝 รายงานหักเงิน',
              children: (
                <div>
                  {/* Summary Cards */}
                  {deductionData?.report && (
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                      <Col span={6}>
                        <Card>
                          <Statistic
                            title="จำนวนพนักงาน"
                            value={deductionData.report.staff.length}
                            suffix="คน"
                          />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card>
                          <Statistic
                            title="วันทำงานทั้งหมด"
                            value={deductionData.report.totals.totalWorkDays}
                            suffix="วัน"
                          />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card>
                          <Statistic
                            title="ยอดหักเงินทั้งหมด"
                            value={deductionData.report.totals.totalDeduction}
                            prefix="฿"
                            valueStyle={{ color: '#ff4d4f' }}
                          />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card>
                          <Statistic
                            title="เงินเดือนสุทธิทั้งหมด"
                            value={deductionData.report.totals.totalNetSalary}
                            prefix="฿"
                            valueStyle={{ color: '#52c41a' }}
                          />
                        </Card>
                      </Col>
                    </Row>
                  )}

                  {/* Action Buttons */}
                  <Space style={{ marginBottom: 16 }}>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={handleExportCSV}
                      disabled={!selectedProjectId}
                    >
                      ดาวน์โหลด CSV
                    </Button>
                    <Button
                      icon={<FileExcelOutlined />}
                      onClick={handleExportExcel}
                      disabled={!selectedProjectId}
                    >
                      ดาวน์โหลด Excel
                    </Button>
                  </Space>

                  {/* Report Table */}
                  <Table
                    columns={deductionColumns}
                    dataSource={deductionData?.report?.staff || []}
                    loading={deductionLoading}
                    rowKey="staffId"
                    pagination={{ pageSize: 20 }}
                  />
                </div>
              ),
            },
            {
              key: 'cost-sharing',
              label: '💰 รายงาน Cost Sharing',
              children: (
                <div>
                  {/* Grand Totals */}
                  {costSharingData?.report && (
                    <Row gutter={16} style={{ marginBottom: 24 }}>
                      <Col span={6}>
                        <Card>
                          <Statistic
                            title="ต้นทุนเดิมรวม"
                            value={costSharingData.report.grandTotals.originalCost}
                            prefix="฿"
                          />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card>
                          <Statistic
                            title="แชร์ออกรวม"
                            value={costSharingData.report.grandTotals.sharedOut}
                            prefix="฿"
                            valueStyle={{ color: '#ff4d4f' }}
                          />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card>
                          <Statistic
                            title="รับแชร์รวม"
                            value={costSharingData.report.grandTotals.sharedIn}
                            prefix="฿"
                            valueStyle={{ color: '#52c41a' }}
                          />
                        </Card>
                      </Col>
                      <Col span={6}>
                        <Card>
                          <Statistic
                            title="ต้นทุนสุทธิรวม"
                            value={costSharingData.report.grandTotals.netCost}
                            prefix="฿"
                            valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                          />
                        </Card>
                      </Col>
                    </Row>
                  )}

                  {/* Cost Sharing Table */}
                  <Table
                    columns={costSharingColumns}
                    dataSource={costSharingData?.report?.projects || []}
                    loading={costSharingLoading}
                    rowKey="projectId"
                    pagination={false}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default ReportsPage;
