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
  DeleteOutlined,
} from '@ant-design/icons';
import { useProjectStore } from '../stores/projectStore';
import { useStaffStore } from '../stores/staffStore';

interface Project {
  id: string;
  name: string;
  themeColor: string;
  managerId: string;
  responsiblePerson?: string;
  isActive: boolean;
  costSharing?: Array<{
    destinationProjectId: string;
    percentage: number;
  }>;
}

const ProjectsPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();

  // Use global stores
  const { projects, addProject, updateProject, deleteProject } = useProjectStore();
  const { getActiveStaffByProject } = useStaffStore();

  // Count staff per project
  const getStaffCount = (projectId: string) => {
    return getActiveStaffByProject(projectId).length;
  };

  const handleCreate = () => {
    setEditingProject(null);
    form.resetFields();
    form.setFieldsValue({
      themeColor: '#3b82f6',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    form.setFieldsValue({
      name: project.name,
      responsiblePerson: project.responsiblePerson,
      costSharing: project.costSharing || [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Get color value
      const themeColor = typeof values.themeColor === 'string' 
        ? values.themeColor 
        : values.themeColor?.toHexString?.() || '#3b82f6';
      
      if (editingProject) {
        updateProject(editingProject.id, {
          name: values.name,
          responsiblePerson: values.responsiblePerson,
          themeColor,
          isActive: values.isActive ?? true,
          costSharing: values.costSharing || [],
        });
        message.success('แก้ไขโครงการสำเร็จ');
      } else {
        addProject({
          name: values.name,
          responsiblePerson: values.responsiblePerson,
          themeColor,
          managerId: 'admin-1',
          isActive: values.isActive ?? true,
          costSharing: values.costSharing || [],
        });
        message.success('สร้างโครงการสำเร็จ');
      }
      
      setIsModalOpen(false);
      form.resetFields();
      setEditingProject(null);
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    message.success('ลบโครงการสำเร็จ');
  };

  const columns = [
    {
      title: 'โครงการ',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
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
      title: 'ผู้รับผิดชอบ',
      dataIndex: 'responsiblePerson',
      key: 'responsiblePerson',
      render: (text: string) => text || '-',
    },
    {
      title: 'จำนวนพนักงาน',
      key: 'staffCount',
      render: (_: any, record: any) => (
        <Tag color="blue">{getStaffCount(record.id)} คน</Tag>
      ),
    },
    {
      title: 'Cost Sharing',
      key: 'costSharing',
      render: (_: any, record: any) => {
        if (!record.costSharing || record.costSharing.length === 0) return '-';
        return (
          <Space direction="vertical" size="small">
            {record.costSharing.map((cs: any, idx: number) => {
              const destProject = projects.find((p) => p.id === cs.destinationProjectId);
              return (
                <Tag key={idx} color="orange">
                  {destProject?.name || 'N/A'}: {cs.percentage}%
                </Tag>
              );
            })}
          </Space>
        );
      },
    },
    {
      title: 'สถานะ',
      key: 'isActive',
      render: (_: any, record: any) => (
        <Tag color={record.isActive ? 'green' : 'red'}>
          {record.isActive ? 'ใช้งาน' : 'ปิด'}
        </Tag>
      ),
    },
    {
      title: 'จัดการ',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="ยืนยันการลบ?"
            description="คุณแน่ใจหรือไม่ว่าต้องการลบโครงการนี้?"
            onConfirm={() => handleDelete(record.id)}
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
        title={<span style={{ fontSize: '20px', fontWeight: 'bold' }}>📁 จัดการโครงการ</span>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            เพิ่มโครงการ
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={projects}
          rowKey="id"
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingProject ? 'แก้ไขโครงการ' : 'สร้างโครงการใหม่'}
        open={isModalOpen}
        onOk={handleSubmit}
        onCancel={() => setIsModalOpen(false)}
        width={700}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item
            label="ชื่อโครงการ"
            name="name"
            rules={[{ required: true, message: 'กรุณากรอกชื่อโครงการ' }]}
          >
            <Input placeholder="เช่น โครงการ Condo A" />
          </Form.Item>

          <Form.Item label="ผู้รับผิดชอบ" name="responsiblePerson">
            <Input placeholder="เช่น คุณสมชาย" />
          </Form.Item>

          <Form.Item label="Cost Sharing (แบ่งค่าใช้จ่ายให้โครงการอื่น)">
            <p style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
              กำหนดว่าโครงการนี้จะแบ่งค่าใช้จ่าย (เงินเดือนพนักงาน) ให้กับโครงการอื่นกี่ %
            </p>
            <Form.List name="costSharing">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'destinationProjectId']}
                        rules={[{ required: true, message: 'เลือกโครงการ' }]}
                        style={{ marginBottom: 0 }}
                      >
                        <Select
                          placeholder="เลือกโครงการปลายทาง"
                          style={{ width: 280 }}
                        >
                          {projects
                            .filter((p) => p.id !== editingProject?.id)
                            .map((p) => (
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
                        style={{ marginBottom: 0 }}
                      >
                        <InputNumber
                          placeholder="%"
                          min={0}
                          max={100}
                          style={{ width: 100 }}
                          addonAfter="%"
                        />
                      </Form.Item>
                      <Button danger onClick={() => remove(name)}>
                        ลบ
                      </Button>
                    </Space>
                  ))}
                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      เพิ่มการแชร์ค่าใช้จ่าย
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectsPage;
