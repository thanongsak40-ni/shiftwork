import React, { useState, useMemo } from 'react';
import {
  Card,
  Select,
  Button,
  Space,
  Statistic,
  Row,
  Col,
  DatePicker,
  Modal,
  Form,
  Tag,
  Divider,
} from 'antd';
import {
  CalendarOutlined,
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
  UserOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import CalendarView from '../components/CalendarView';
import {
  mockProjects,
  mockStaff,
  mockRosterEntries,
  mockShiftTypes,
} from '../data/mockData';

dayjs.extend(buddhistEra);
dayjs.locale('th');

const RosterCalendarPage: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-1');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    staffId: string;
    day: number;
  } | null>(null);
  const [form] = Form.useForm();

  const year = selectedDate.year() + 543; // Convert to Buddhist year
  const month = selectedDate.month() + 1;

  // Get current project
  const currentProject = mockProjects.find((p) => p.id === selectedProjectId);

  // Get staff for selected project
  const projectStaff = useMemo(() => {
    return mockStaff.filter(
      (s) => s.projectId === selectedProjectId && s.isActive
    );
  }, [selectedProjectId]);

  // Get roster entries for selected project
  const rosterEntries = useMemo(() => {
    return mockRosterEntries.filter((entry) => {
      const staff = mockStaff.find((s) => s.id === entry.staffId);
      return staff?.projectId === selectedProjectId;
    });
  }, [selectedProjectId]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const today = 20; // วันที่ 20 มกราคม 2569 (from context)
    let working = 0;
    let off = 0;
    let absent = 0;

    rosterEntries.forEach((entry) => {
      if (entry.day === today) {
        const shiftConfig = mockShiftTypes.find(
          (s) => s.code === entry.shiftCode
        );
        if (shiftConfig?.isWorkShift) {
          working++;
        } else if (entry.shiftCode === 'OFF') {
          off++;
        } else if (['ข', 'ป', 'ก', 'พ'].includes(entry.shiftCode)) {
          absent++;
        }
      }
    });

    return { working, off, absent };
  }, [rosterEntries]);

  // Navigate month
  const handlePrevMonth = () => {
    setSelectedDate(selectedDate.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setSelectedDate(selectedDate.add(1, 'month'));
  };

  // Handle cell click
  const handleCellClick = (staffId: string, day: number) => {
    setEditingCell({ staffId, day });
    const currentEntry = rosterEntries.find(
      (e) => e.staffId === staffId && e.day === day
    );
    form.setFieldsValue({
      shiftCode: currentEntry?.shiftCode || '1',
    });
    setEditModalVisible(true);
  };

  // Handle save
  const handleSave = () => {
    const values = form.getFieldsValue();
    console.log('Save:', editingCell, values);
    setEditModalVisible(false);
    setEditingCell(null);
  };

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
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              size="large"
            >
              Export Excel
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Statistics - วันที่ปัจจุบัน */}
      <Card style={{ marginTop: '16px' }}>
        <Space split={<Divider type="vertical" />} size="large">
          <div>
            <CalendarOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
            <span style={{ marginLeft: '8px', fontSize: '14px' }}>
              <strong>สถานะวันที่:</strong> {selectedDate.format('D MMMM BBBB')}
            </span>
          </div>

          <Statistic
            title="เข้างาน"
            value={statistics.working}
            suffix="คน"
            valueStyle={{ color: '#52c41a', fontSize: '24px' }}
            prefix={<UserOutlined />}
          />

          <Statistic
            title="วันหยุด (OFF)"
            value={statistics.off}
            suffix="คน"
            valueStyle={{ color: '#d9d9d9', fontSize: '24px' }}
            prefix={<ClockCircleOutlined />}
          />

          <Statistic
            title="ลา / ขาด"
            value={statistics.absent}
            suffix="คน"
            valueStyle={{ color: '#ff4d4f', fontSize: '24px' }}
            prefix={<ClockCircleOutlined />}
          />
        </Space>
      </Card>

      {/* Legend */}
      <Card style={{ marginTop: '16px' }} size="small">
        <Space size="small" wrap>
          <strong>รหัสกะ:</strong>
          {mockShiftTypes.map((shift) => (
            <Tag key={shift.id} color={shift.color}>
              {shift.code} {shift.name}
              {shift.startTime && ` (${shift.startTime}-${shift.endTime})`}
            </Tag>
          ))}
        </Space>
      </Card>

      {/* Calendar */}
      <Card
        style={{ marginTop: '16px' }}
        title={
          <Space>
            <CalendarOutlined />
            <span>ตารางเวร - {currentProject?.name}</span>
            <span style={{ color: '#999', fontSize: '14px' }}>
              ({projectStaff.length} คน)
            </span>
          </Space>
        }
      >
        <CalendarView
          year={year}
          month={month}
          staff={projectStaff}
          entries={rosterEntries}
          onCellClick={handleCellClick}
        />
      </Card>

      {/* Edit Modal */}
      <Modal
        title="แก้ไขกะ"
        open={editModalVisible}
        onOk={handleSave}
        onCancel={() => setEditModalVisible(false)}
        okText="บันทึก"
        cancelText="ยกเลิก"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="เลือกกะ" name="shiftCode">
            <Select>
              {mockShiftTypes.map((shift) => (
                <Select.Option key={shift.id} value={shift.code}>
                  <Tag color={shift.color} style={{ marginRight: '8px' }}>
                    {shift.code}
                  </Tag>
                  {shift.name}
                  {shift.startTime && ` (${shift.startTime}-${shift.endTime})`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RosterCalendarPage;
