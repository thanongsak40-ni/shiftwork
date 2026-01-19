import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/authStore';

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser, setAccessToken } = useAuthStore();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const data = await authService.login(values);
      setUser(data.user);
      setAccessToken(data.accessToken);
      message.success('เข้าสู่ระบบสำเร็จ');
      navigate('/dashboard');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'เข้าสู่ระบบล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card 
        title="เข้าสู่ระบบ" 
        style={{ width: 400 }}
        headStyle={{ textAlign: 'center', fontSize: '24px', fontWeight: 'bold' }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>
          ระบบจัดการเวรปฏิบัติงาน
        </h2>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            label="อีเมล"
            name="email"
            rules={[
              { required: true, message: 'กรุณากรอกอีเมล' },
              { type: 'email', message: 'รูปแบบอีเมลไม่ถูกต้อง' },
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="admin@senx.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="รหัสผ่าน"
            name="password"
            rules={[{ required: true, message: 'กรุณากรอกรหัสผ่าน' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="รหัสผ่าน"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              size="large"
              loading={loading}
            >
              เข้าสู่ระบบ
            </Button>
          </Form.Item>
        </Form>
        
        <div style={{ textAlign: 'center', color: '#888', marginTop: '16px' }}>
          <small>
            ทดสอบ: admin@senx.com / admin123
          </small>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
