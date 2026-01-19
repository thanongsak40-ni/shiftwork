import React from 'react';
import { Card, Row, Col, Statistic, Tag, Space } from 'antd';
import {
  ProjectOutlined,
  TeamOutlined,
  DollarOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const DashboardPage: React.FC = () => {
  // Fetch projects summary
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

  const totalProjects = projectsData?.projects?.length || 0;
  const totalStaff =
    projectsData?.projects?.reduce(
      (sum: number, p: any) => sum + (p._count?.staff || 0),
      0
    ) || 0;

  return (
    <div>
      <h1 style={{ marginBottom: 24, fontSize: 28 }}>
        🏢 ยินดีต้อนรับสู่ระบบจัดการเวร SENX Juristic
      </h1>

      {/* Summary Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="จำนวนโครงการ"
              value={totalProjects}
              prefix={<ProjectOutlined />}
              suffix="โครงการ"
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="พนักงานทั้งหมด"
              value={totalStaff}
              prefix={<TeamOutlined />}
              suffix="คน"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ระบบ Cost Sharing"
              value="พร้อมใช้งาน"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#cf1322', fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="ตารางเวรประจำเดือน"
              value="พร้อมใช้งาน"
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Guide */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="🚀 เริ่มต้นใช้งาน" bordered>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Tag color="blue">1</Tag>
                <strong>สร้างโครงการ</strong>: ไปที่เมนู{' '}
                <Tag color="cyan">โครงการ</Tag> และคลิกเพิ่มโครงการใหม่
              </div>
              <div>
                <Tag color="blue">2</Tag>
                <strong>ตั้งค่า Cost Sharing</strong>: กำหนดสัดส่วนการแชร์ค่าใช้จ่ายข้ามโครงการ
              </div>
              <div>
                <Tag color="blue">3</Tag>
                <strong>เพิ่มพนักงาน</strong>: ไปที่เมนู{' '}
                <Tag color="green">พนักงาน</Tag> เพื่อเพิ่มข้อมูลพนักงาน
              </div>
              <div>
                <Tag color="blue">4</Tag>
                <strong>จัดตารางเวร</strong>: ใช้เมนู{' '}
                <Tag color="purple">ตารางเวร</Tag> เพื่อจัดกะทำงาน
              </div>
              <div>
                <Tag color="blue">5</Tag>
                <strong>ดูรายงาน</strong>: เข้าเมนู{' '}
                <Tag color="orange">รายงาน</Tag> เพื่อดูสรุปและ Export ข้อมูล
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="✨ ฟีเจอร์เด่น" bordered>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <div>
                <Tag color="gold">⭐</Tag>
                <strong>Cost Sharing แบบอัตโนมัติ</strong>
                <br />
                <span style={{ fontSize: 13, color: '#666' }}>
                  แชร์ค่าใช้จ่ายข้ามโครงการและคำนวณต้นทุนสุทธิอัตโนมัติ
                </span>
              </div>
              <div>
                <Tag color="gold">⭐</Tag>
                <strong>จัดการพนักงานแบบ Active/Inactive</strong>
                <br />
                <span style={{ fontSize: 13, color: '#666' }}>
                  ไม่ลบข้อมูล เก็บประวัติเพื่อดูรายงานย้อนหลังได้
                </span>
              </div>
              <div>
                <Tag color="gold">⭐</Tag>
                <strong>ตารางเวรแบบ Grid พร้อม Color Coding</strong>
                <br />
                <span style={{ fontSize: 13, color: '#666' }}>
                  มองเห็นภาพรวมได้ง่าย คลิกเพื่อสลับกะได้ทันที
                </span>
              </div>
              <div>
                <Tag color="gold">⭐</Tag>
                <strong>รายงานหักเงินอัตโนมัติ</strong>
                <br />
                <span style={{ fontSize: 13, color: '#666' }}>
                  คำนวณวันทำงาน ขาด ลา และหักเงินอัตโนมัติ Export ได้
                </span>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Projects */}
      {projectsData?.projects && projectsData.projects.length > 0 && (
        <Card
          title="📁 โครงการล่าสุด"
          bordered
          style={{ marginTop: 24 }}
        >
          <Space wrap>
            {projectsData.projects.slice(0, 5).map((project: any) => (
              <Tag
                key={project.id}
                color={project.themeColor}
                style={{ padding: '8px 16px', fontSize: 14 }}
              >
                {project.name} ({project._count.staff} คน)
              </Tag>
            ))}
          </Space>
        </Card>
      )}

      {/* Tips */}
      <Card
        title="💡 เคล็ดลับการใช้งาน"
        bordered
        style={{ marginTop: 24 }}
      >
        <Space direction="vertical" size="small">
          <div>
            • ใช้พนักงาน <Tag color="orange">Spare</Tag> สำหรับพนักงานสำรอง
            จะมี Visual Indicator ให้เห็นชัดเจน
          </div>
          <div>
            • เมื่อพนักงานลาออก ให้ใช้ปุ่ม <Tag>Toggle Status</Tag> แทนการลบ
            เพื่อเก็บประวัติไว้ดูในรายงานเก่า
          </div>
          <div>
            • ในตารางเวร สามารถคลิกที่ช่องเพื่อสลับกะได้เลย (1 → 2 → 3 → OFF)
          </div>
          <div>
            • ตั้งค่า Cost Sharing ที่โครงการต้นทาง ระบบจะคำนวณให้โครงการปลายทางอัตโนมัติ
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default DashboardPage;
