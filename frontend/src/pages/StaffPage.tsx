import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Popconfirm,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

interface Staff {
  id: string;
  name: string;
  position: string;
  phone?: string;
  wagePerDay: number;
  staffType: 'REGULAR' | 'SPARE';
  isActive: boolean;
  defaultShift?: string;
  project: {
    id: string;
    name: string;
  };
}

interface Project {
  id: string;
  name: string;
}

const StaffPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch projects for dropdown
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/projects`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    },
  });

  // Fetch staff
  const { data: staffData, isLoading } = useQuery({
    queryKey: ['staff', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return { staff: [] };
      const response = await axios.get(`${API_URL}/staff`, {
        params: { projectId: selectedProjectId, includeInactive: true },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return response.data;
    },
    enabled: !!selectedProjectId,
  });

  // Create/Update staff mutation
  const staffMutation = useMutation({
    mutationFn: async (values: any) => {
      const token = localStorage.getItem('token');
      if (editingStaff) {
        return axios.put(`${API_URL}/staff/${editingStaff.id}`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      return axios.post(`${API_URL}/staff`, { ...values, projectId: selectedProjectId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      message.success(editingStaff ? 'แก้ไขพนักงานสำเร็จ' : 'เพิ่มพนักงานสำเร็จ');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      setIsModalOpen(false);
      setEditingStaff(null);
      form.resetFields();
    },
    onError: () => {
      message.error('เกิดข้อผิดพลาด');
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('token');
      return axios.patch(`${API_URL}/staff/${id}/toggle-status`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      message.success('เปลี่ยนสถานะพนักงานสำเร็จ');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  // Delete staff mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('token');
      return axios.delete(`${API_URL}/staff/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      message.success('ลบพนักงานสำเร็จ');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (error: any) => {
      message.error(error.response?.data?.error || 'เกิดข้อผิดพลาด');
    },
  });

  const handleCreate = () => {
    if (!selectedProjectId) {
      message.warning('กรุณาเลือกโครงการก่อน');
      return;
    }
    setEditingStaff(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    form.setFieldsValue({
      name: staff.name,
      position: staff.position,
      phone: staff.phone,
      wagePerDay: staff.wagePerDay,
      staffType: staff.staffType,
      defaultShift: staff.defaultShift,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      staffMutation.mutate(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns = [
    {
      title: 'ชื่อพนักงาน',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Staff) => (
        <Space>
          {text}
          {record.staffType === 'SPARE' && (
            <Tag color="orange">สแปร์</Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'ตำแหน่ง',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'เบอร์โทร',
      dataIndex: 'phone',
      key: 'phone',
      render: (text: string) => text || '-',
    },
    {
      title: 'ค่าแรง/วัน',
      dataIndex: 'wagePerDay',
      key: 'wagePerDay',
      render: (value: number) => `฿${value.toLocaleString()}`,
    },
    {
      title: 'กะตั้งต้น',
      dataIndex: 'defaultShift',
      key: 'defaultShift',
      render: (text: string) => <Tag>{text || '1'}</Tag>,
    },
    {
      title: 'สถานะ',
      key: 'isActive',
      render: (_: any, record: Staff) => (
        <Switch
          checked={record.isActive}
          onChange={() => toggleStatusMutation.mutate(record.id)}
          checkedChildren="ใช้งาน"
          unCheckedChildren="ปิด"
        />
      ),
    },
    {
      title: 'จัดการ',
      key: 'action',
      render: (_: any, record: Staff) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="ยืนยันการลบ?"
            description="คุณแน่ใจหรือไม่? (ถ้ามีข้อมูลตารางเวรจะลบไม่ได้)"
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={<span style={{ fontSize: '20px', fontWeight: 'bold' }}>👥 จัดการพนักงาน</span>}
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
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              เพิ่มพนักงาน
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={staffData?.staff || []}
          loading={isLoading}
          rowKey="id"
          rowClassName={(record) => (!record.isActive ? 'inactive-row' : '')}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingStaff ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงานใหม่'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={staffMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            label="ชื่อพนักงาน"
            name="name"
            rules={[{ required: true, message: 'กรุณากรอกชื่อพนักงาน' }]}
          >
            <Input placeholder="เช่น สมชาย ใจดี" />
          </Form.Item>

          <Form.Item
            label="ตำแหน่ง"
            name="position"
            rules={[{ required: true, message: 'กรุณากรอกตำแหน่ง' }]}
          >
            <Input placeholder="เช่น เจ้าหน้าที่รักษาความปลอดภัย" />
          </Form.Item>

          <Form.Item label="เบอร์โทร" name="phone">
            <Input placeholder="0812345678" />
          </Form.Item>

          <Form.Item
            label="ค่าแรงต่อวัน (บาท)"
            name="wagePerDay"
            rules={[
              { required: true, message: 'กรุณากรอกค่าแรง' },
              { type: 'number', min: 0, message: 'ค่าแรงต้องมากกว่า 0' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="350"
              min={0}
              formatter={(value) => `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>

          <Form.Item
            label="ประเภทพนักงาน"
            name="staffType"
            initialValue="REGULAR"
          >
            <Select>
              <Select.Option value="REGULAR">พนักงานประจำ</Select.Option>
              <Select.Option value="SPARE">พนักงานสแปร์</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="กะทำงานตั้งต้น"
            name="defaultShift"
            initialValue="1"
          >
            <Select>
              <Select.Option value="1">กะ 1</Select.Option>
              <Select.Option value="2">กะ 2</Select.Option>
              <Select.Option value="3">กะ 3</Select.Option>
              <Select.Option value="ดึก">ดึก</Select.Option>
              <Select.Option value="OFF">OFF</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <style>{`
        .inactive-row {
          background-color: #f5f5f5;
          opacity: 0.6;
        }
      `}</style>
    </div>
  );
};

export default StaffPage;
