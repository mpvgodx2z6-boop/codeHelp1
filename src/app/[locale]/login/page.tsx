'use client';

import React from 'react';
import {Button, Card, Form, Input, Typography, message} from 'antd';
import {useRouter} from 'next/navigation';

/***********登录页面功能开始************/
export default function LoginPage() {
  const router = useRouter();

  const onFinish = (values: {username: string; password: string}) => {
    // v1：单人本地登录（临时方案，需在安全规范里写明风险）
    if (values.username === 'admin' && values.password === 'admin123') {
      localStorage.setItem('auth_token', '1');
      message.success('登录成功');
      router.push('/dashboard');
      return;
    }
    message.error('账号或密码错误');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24
      }}
    >
      <Card style={{width: 420}}>
        <Typography.Title level={3} style={{marginTop: 0}}>
          登录
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          v1 单人模式：临时本地登录（后续可接入真实鉴权）。
        </Typography.Paragraph>

        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item
            label="账号"
            name="username"
            rules={[{required: true, message: '请输入账号'}]}
          >
            <Input placeholder="admin" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[{required: true, message: '请输入密码'}]}
          >
            <Input.Password placeholder="admin123" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block>
            登录
          </Button>
        </Form>
      </Card>
    </div>
  );
}
/***********登录页面功能结束************/