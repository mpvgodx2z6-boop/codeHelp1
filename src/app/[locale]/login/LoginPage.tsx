'use client';

import React, {useEffect} from 'react';
import {Button, Card, Form, Input, Typography, message} from 'antd';
import {useRouter} from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({username: 'admin', password: 'admin123'});
  }, [form]);

  const onFinish = (values: {username: string; password: string}) => {
    if (values.username === 'admin' && values.password === 'admin123') {
      document.cookie = `auth_token=1; path=/; max-age=${60 * 60 * 24 * 7}`;
      message.success('登录成功');
      router.push('/dashboard');
      return;
    }
    message.error('账号或密码错误');
  };

  return (
    <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24}}>
      <Card style={{width: 420}}>
        <Typography.Title level={3} style={{marginTop: 0}}>
          登录
        </Typography.Title>

        <Form form={form} layout="vertical" onFinish={onFinish} autoComplete="on">
          <Form.Item label="账号" name="username" rules={[{required: true, message: '请输入账号'}]}>
            <Input autoComplete="username" />
          </Form.Item>

          <Form.Item label="密码" name="password" rules={[{required: true, message: '请输入密码'}]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            登录
          </Button>
        </Form>
      </Card>
    </div>
  );
}