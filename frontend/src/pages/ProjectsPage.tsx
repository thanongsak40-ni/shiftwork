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
  ColorPicker,
  message,
  Popconfirm,
  Switch,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

interface Project {
  id: string;
  name: string;
  location?: string;
  themeColor: string;
  description?: string;
  isActive: boolean;
  manager?: {
    id: string;
    name: string;
    email: string;
  };
  costSharingFrom: Array<{
    id: string;
    percentage: number;
    destinationProject: {
      id: string;
      name: string;
    };
  }>;
  _count: {
    staff: number;
  };
}

interface CostSharingEntry {
  destinationProjectId: string;
  percentage: number;
}

const ProjectsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCostSharingModalOpen, setIsCostSharingModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [form] = Form.useForm();
  const [costSharingForm] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch projects
  const { data: projectsData, isLoading } = useQuery({
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

  // Create/Update project mutation
  const projectMutation = useMutation({
    mutationFn: async (values: any) => {
      const token = localStorage.getItem('token');
      if (editingProject) {
        return axios.put(`${API_URL}/projects/${editingProject.id}`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      return axios.post(`${API_URL}/projects`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      message.success(editingProject ? 'แก้ไขโครงการสำเร็จ' : 'สร้างโครงการสำเร็จ');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      setEditingProject(null);
      form.resetFields();
    },
    onError: () => {
      message.error('เกิดข้อผิดพลาด');
    },
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('token');
      return axios.delete(`${API_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      message.success('ลบโครงการสำเร็จ');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  // Update cost sharing mutation
  const costSharingMutation = useMutation({
    mutationFn: async ({ projectId, costSharing }: { projectId: string; costSharing: CostSharingEntry[] }) => {
      const token = localStorage.getItem('token');
      return axios.put(
        `${API_URL}/projects/${projectId}/cost-sharing`,
        { costSharing },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      message.success('บันทึกการแชร์ค่าใช้จ่ายสำเร็จ');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsCostSharingModalOpen(false);
      costSharingForm.resetFields();
    },
  });

  const handleCreate = () => {
    setEditingProject(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.setFieldsValue({
      name: project.name,
      location: project.location,
      description: project.description,
      themeColor: project.themeColor,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      projectMutation.mutate(values);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleCostSharing = (project: Project) => {
    setSelectedProject(project);
    costSharingForm.setFieldsValue({
      costSharing: project.costSharingFrom.map((cs) => ({
        destinationProjectId: cs.destinationProject.id,
        percentage: cs.percentage,
      })),
    });
    setIsCostSharingModalOpen(true);
  };

  const handleCostSharingSubmit = async () => {
    try {
      const values = await costSharingForm.validateFields();
      if (selectedProject) {
        costSharingMutation.mutate({
          projectId: selectedProject.id,
          costSharing: values.costSharing || [],
        });
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const columns = [
    {
      title: 'โครงการ',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Project) => (
        <Space>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: record.themeColor,
            }}
          />
          {text}
        </Space>
      ),
    },
    {
      title: 'สถานที่',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'ผู้จัดการ',
      key: 'manager',
      render: (_: any, record: Project) => record.manager?.name || '-',
    },
    {
      title: 'จำนวนพนักงาน',
      key: 'staffCount',
      render: (_: any, record: Project) => (
        <Tag color="blue">{record._count.staff} คน</Tag>
      ),
    },
    {
      title: 'Cost Sharing',
      key: 'costSharing',
      render: (_: any, record: Project) => {
        if (record.costSharingFrom.length === 0) return '-';
        return (
          <Space direction="vertical" size="small">
            {record.costSharingFrom.map((cs) => (
              <Tag key={cs.id} color="orange">
                {cs.destinationProject.name}: {cs.percentage}%
              </Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'สถานะ',
      key: 'isActive',
      render: (_: any, record: Project) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? 'ใช้งาน' : 'ปิด'}
        </Tag>
      ),
    },
    {
      title: 'จัดการ',
      key: 'action',
      render: (_: any, record: Project) => (
        <Space>
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => handleCostSharing(record)}
          >
            Cost Sharing
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="ยืนยันการลบ?"
            description="คุณแน่ใจหรือไม่ว่าต้องการลบโครงการนี้?"
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const availableProjects = projectsData?.projects?.filter(
    (p: Project) => p.id !== selectedProject?.id
  );

  return (
    <div>
      <Card
        title={<span style={{ fontSize: '20px', fontWeight: 'bold' }}>📁 จัดการโครงการ</span>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            เพิ่มโครงการ
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={projectsData?.projects || []}
          loading={isLoading}
          rowKey="id"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingProject ? 'แก้ไขโครงการ' : 'สร้างโครงการใหม่'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        confirmLoading={projectMutation.isPending}
        width={600}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            label="ชื่อโครงการ"
            name="name"
            rules={[{ required: true, message: 'กรุณากรอกชื่อโครงการ' }]}
          >
            <Input placeholder="เช่น โครงการ Condo A" />
          </Form.Item>

          <Form.Item label="สถานที่" name="location">
            <Input placeholder="เช่น กรุงเทพมหานคร" />
          </Form.Item>

          <Form.Item label="คำอธิบาย" name="description">
            <Input.TextArea rows={3} placeholder="รายละเอียดเพิ่มเติม" />
          </Form.Item>

          <Form.Item label="สีธีม" name="themeColor" initialValue="#3b82f6">
            <ColorPicker showText format="hex" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Cost Sharing Modal */}
      <Modal
        title={`ตั้งค่า Cost Sharing - ${selectedProject?.name}`}
        open={isCostSharingModalOpen}
        onOk={handleCostSharingSubmit}
        onCancel={() => setIsCostSharingModalOpen(false)}
        confirmLoading={costSharingMutation.isPending}
        width={700}
      >
        <div style={{ marginTop: 20 }}>
          <p>
            โครงการนี้จะแชร์ค่าใช้จ่ายไปยังโครงการอื่น (กรอกสัดส่วน %)
          </p>
          <Form form={costSharingForm} layout="vertical">
            <Form.List name="costSharing">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'destinationProjectId']}
                        rules={[{ required: true, message: 'เลือกโครงการ' }]}
                      >
                        <Select
                          placeholder="เลือกโครงการปลายทาง"
                          style={{ width: 300 }}
                        >
                          {availableProjects?.map((p: Project) => (
                            <Select.Option key={p.id} value={p.id}>
                              {p.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'percentage']}
                        rules={[
                          { required: true, message: 'กรอก %' },
                          { type: 'number', min: 0, max: 100, message: '0-100' },
                        ]}
                      >
                        <InputNumber
                          placeholder="สัดส่วน %"
                          min={0}
                          max={100}
                          style={{ width: 150 }}
                          addonAfter="%"
                        />
                      </Form.Item>
                      <Button danger onClick={() => remove(name)}>
                        ลบ
                      </Button>
                    </Space>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      เพิ่มการแชร์ค่าใช้จ่าย
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
