import React, { useState, useMemo } from 'react';
import {
  Card,
  Select,
  Button,
  Space,
  Table,
  Tag,
  Modal,
  DatePicker,
  Statistic,
  Row,
  Col,
  message,
} from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';

dayjs.extend(buddhistEra);
dayjs.locale('th');

const API_URL = 'http://localhost:3001/api';

interface Project {
  id: string;
  name: string;
}

interface Staff {
  id: string;
  name: string;
  position: string;
  staffType: 'REGULAR' | 'SPARE';
  isActive: boolean;
}

interface RosterMatrix {
  [staffId: string]: {
    staff: Staff;
    days: {
      [day: number]: {
        shiftCode: string;
        notes?: string;
        entryId?: string;
      };
    };
  };
}

interface Roster {
  id: string;
  projectId: string;
  year: number;
  month: number;
  daysInMonth: number;
  matrix: RosterMatrix;
}

// Shift configurations with colors
const SHIFT_CONFIGS: Record<string, { color: string; label: string }> = {
  '1': { color: '#52c41a', label: 'กะ 1' },
  '2': { color: '#1890ff', label: 'กะ 2' },
  '3': { color: '#722ed1', label: 'กะ 3' },
  'ดึก': { color: '#eb2f96', label: 'ดึก' },
  'OFF': { color: '#d9d9d9', label: 'OFF' },
  'ข': { color: '#ff4d4f', label: 'ขาด' },
  'ป': { color: '#faad14', label: 'ลาป่วย' },
  'ก': { color: '#fa8c16', label: 'ลากิจ' },
  'พ': { color: '#13c2c2', label: 'พักร้อน' },
};

const SHIFT_OPTIONS = Object.entries(SHIFT_CONFIGS).map(([code, config]) => ({
  value: code,
  label: config.label,
  color: config.color,
}));

const RosterPage: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [editingCell, setEditingCell] = useState<{
    staffId: string;
    day: number;
  } | null>(null);

  const queryClient = useQueryClient();

  const year = selectedDate.year() + 543; // Convert to Buddhist year
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

  // Fetch roster
  const { data: rosterData, isLoading } = useQuery<{ roster: Roster }>({
    queryKey: ['roster', selectedProjectId, year, month],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/rosters`, {
        params: { projectId: selectedProjectId, year, month },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      return response.data;
    },
    enabled: !!selectedProjectId,
  });

  // Update roster entry mutation
  const updateMutation = useMutation({
    mutationFn: async ({
      rosterId,
      staffId,
      day,
      shiftCode,
    }: {
      rosterId: string;
      staffId: string;
      day: number;
      shiftCode: string;
    }) => {
      const token = localStorage.getItem('token');
      return axios.post(
        `${API_URL}/rosters/entry`,
        { rosterId, staffId, day, shiftCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roster'] });
      setEditingCell(null);
    },
    onError: () => {
      message.error('เกิดข้อผิดพลาดในการบันทึก');
    },
  });

  // Handle cell click
  const handleCellClick = (staffId: string, day: number, currentShift: string) => {
    if (!rosterData?.roster?.id) return;

    // Cycle through common shifts: 1 -> 2 -> 3 -> OFF -> 1
    const cycleShifts = ['1', '2', '3', 'OFF'];
    const currentIndex = cycleShifts.indexOf(currentShift);
    const nextShift = cycleShifts[(currentIndex + 1) % cycleShifts.length];

    updateMutation.mutate({
      rosterId: rosterData.roster.id,
      staffId,
      day,
      shiftCode: nextShift,
    });
  };

  // Calculate day statistics
  const calculateDayStats = (day: number) => {
    if (!rosterData?.roster) return null;

    let working = 0;
    let off = 0;
    let absent = 0;
    let leave = 0;

    Object.values(rosterData.roster.matrix).forEach(({ days }) => {
      const shift = days[day]?.shiftCode;
      if (['1', '2', '3', 'ดึก'].includes(shift)) working++;
      else if (shift === 'OFF') off++;
      else if (shift === 'ข') absent++;
      else if (['ป', 'ก', 'พ'].includes(shift)) leave++;
    });

    return { working, off, absent, leave };
  };

  // Build table columns (days)
  const columns = useMemo(() => {
    if (!rosterData?.roster) return [];

    const daysInMonth = rosterData.roster.daysInMonth;
    const baseColumns = [
      {
        title: 'พนักงาน',
        dataIndex: 'staff',
        key: 'staff',
        fixed: 'left' as const,
        width: 200,
        render: (_: any, record: any) => (
          <Space direction="vertical" size="small">
            <span style={{ fontWeight: 500 }}>{record.staff.name}</span>
            <span style={{ fontSize: '12px', color: '#888' }}>
              {record.staff.position}
            </span>
            {record.staff.staffType === 'SPARE' && (
              <Tag color="orange" style={{ fontSize: '10px' }}>
                สแปร์
              </Tag>
            )}
          </Space>
        ),
      },
    ];

    // Add columns for each day
    for (let day = 1; day <= daysInMonth; day++) {
      const stats = calculateDayStats(day);
      baseColumns.push({
        title: (
          <div style={{ textAlign: 'center' }}>
            <div>{day}</div>
            {stats && (
              <div style={{ fontSize: '10px', color: '#888' }}>
                {stats.working}/{stats.off + stats.absent + stats.leave}
              </div>
            )}
          </div>
        ),
        dataIndex: day.toString(),
        key: day.toString(),
        width: 70,
        render: (_: any, record: any) => {
          const dayData = record.days[day];
          const shiftCode = dayData?.shiftCode || 'OFF';
          const config = SHIFT_CONFIGS[shiftCode] || SHIFT_CONFIGS['OFF'];

          return (
            <div
              onClick={() => handleCellClick(record.staff.id, day, shiftCode)}
              style={{
                cursor: 'pointer',
                padding: '4px 8px',
                textAlign: 'center',
                backgroundColor: config.color,
                color: shiftCode === 'OFF' ? '#000' : '#fff',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontSize: '12px',
                userSelect: 'none',
              }}
            >
              {shiftCode}
            </div>
          );
        },
      });
    }

    return baseColumns;
  }, [rosterData]);

  // Prepare table data
  const tableData = useMemo(() => {
    if (!rosterData?.roster) return [];

    return Object.values(rosterData.roster.matrix).map(({ staff, days }) => ({
      key: staff.id,
      staff,
      days,
    }));
  }, [rosterData]);

  return (
    <div>
      <Card
        title={
          <span style={{ fontSize: '20px', fontWeight: 'bold' }}>
            📅 จัดการตารางเวร
          </span>
        }
        extra={
          <Space>
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
        {/* Legend */}
        <div style={{ marginBottom: 16 }}>
          <Space wrap>
            {SHIFT_OPTIONS.map((shift) => (
              <Tag
                key={shift.value}
                color={shift.color}
                style={{
                  color: shift.value === 'OFF' ? '#000' : '#fff',
                  fontWeight: 'bold',
                }}
              >
                {shift.label}
              </Tag>
            ))}
          </Space>
          <div style={{ marginTop: 8, fontSize: '12px', color: '#888' }}>
            💡 คลิกที่ช่องเพื่อสลับกะ (1 → 2 → 3 → OFF → 1)
          </div>
        </div>

        {/* Roster Table */}
        <Table
          columns={columns}
          dataSource={tableData}
          loading={isLoading}
          pagination={false}
          scroll={{ x: 'max-content', y: 500 }}
          bordered
          size="small"
        />

        {/* Summary Statistics */}
        {rosterData?.roster && (
          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="จำนวนพนักงาน"
                  value={Object.keys(rosterData.roster.matrix).length}
                  suffix="คน"
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="วันในเดือน"
                  value={rosterData.roster.daysInMonth}
                  suffix="วัน"
                />
              </Card>
            </Col>
          </Row>
        )}
      </Card>
    </div>
  );
};

export default RosterPage;
