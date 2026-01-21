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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useStaffStore } from '../stores/staffStore';
import { useProjectStore } from '../stores/projectStore';

interface Staff {
  id: string;
  code: string;
  name: string;
  position: string;
  phone?: string;
  wagePerDay: number;
  availability: string;
  isActive: boolean;
  projectId: string;
}

const StaffPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  // Use global stores
  const { projects } = useProjectStore();
  const { addStaff, updateStaff, setStaffInactive, getStaffByProject } = useStaffStore();
  
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [form] = Form.useForm();

  // Filter staff by selected project
  const filteredStaff = getStaffByProject(selectedProjectId);

  const handleCreate = () => {
    setEditingStaff(null);
    form.resetFields();
    form.setFieldsValue({
      isActive: true,
      wagePerDay: 500,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    form.setFieldsValue({
      code: staff.code,
      name: staff.name,
      position: staff.position,
      phone: staff.phone,
      wagePerDay: staff.wagePerDay,
      isActive: staff.isActive,
      remark: (staff as any).remark,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingStaff) {
        updateStaff(editingStaff.id, {
          code: values.code,
          name: values.name,
          position: values.position,
          phone: values.phone,
          wagePerDay: values.wagePerDay || 500,
          isActive: values.isActive,
          remark: values.remark,
        });
        message.success('แก้ไขพนักงานสำเร็จ');
      } else {
        addStaff({
          code: values.code,
          name: values.name,
          position: values.position,
          phone: values.phone,
          wagePerDay: values.wagePerDay || 500,
          staffType: 'REGULAR',
          availability: 'AVAILABLE',
          isActive: values.isActive ?? true,
          projectId: selectedProjectId,
          remark: values.remark,
        });
        message.success('เพิ่มพนักงานสำเร็จ');
      }
      
      setIsModalOpen(false);
      form.resetFields();
      setEditingStaff(null);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleInactive = (id: string) => {
    setStaffInactive(id);
    message.success('เปลี่ยนสถานะพนักงานเป็น Inactive สำเร็จ');
  };

  const columns = [
    {
      title: 'รหัส',
      dataIndex: 'code',
      key: 'code',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'ชื่อพนักงาน',
      dataIndex: 'name',
      key: 'name',
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
      title: 'สถานะ',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => {
        return (
          <Tag color={isActive ? 'green' : 'red'}>
            {isActive ? 'Active' : 'Inactive'}
          </Tag>
        );
      },
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
            title="ยืนยันการเปลี่ยนสถานะ?"
            description="คุณต้องการเปลี่ยนสถานะพนักงานเป็น Inactive หรือไม่?"
            onConfirm={() => handleInactive(record.id)}
          >
            <Button type="text" danger icon={<StopOutlined />} title="Inactive" />
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
              value={selectedProjectId}
            >
              {projects.map((p) => (
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
          dataSource={filteredStaff}
          rowKey="id"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingStaff ? 'แก้ไขพนักงาน' : 'เพิ่มพนักงานใหม่'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            label="รหัสพนักงาน"
            name="code"
            rules={[{ required: true, message: 'กรุณากรอกรหัสพนักงาน' }]}
          >
            <Input placeholder="เช่น A01" />
          </Form.Item>

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
            label="ค่าแรง/วัน (บาท)"
            name="wagePerDay"
            rules={[{ required: true, message: 'กรุณากรอกค่าแรงต่อวัน' }]}
          >
            <InputNumber
              placeholder="500"
              min={0}
              style={{ width: '100%' }}
              formatter={(value) => `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </Form.Item>

          <Form.Item
            label="สถานะการทำงาน"
            name="isActive"
            rules={[{ required: true, message: 'กรุณาเลือกสถานะการทำงาน' }]}
          >
            <Select placeholder="เลือกสถานะ">
              <Select.Option value={true}>Active</Select.Option>
              <Select.Option value={false}>Inactive</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="หมายเหตุ"
            name="remark"
          >
            <Input.TextArea rows={3} placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffPage;
