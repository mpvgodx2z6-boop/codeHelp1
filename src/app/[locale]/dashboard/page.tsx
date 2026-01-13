'use client';

import React from 'react';
import {Card, Typography} from 'antd';
import Layout from '@/components/Layout';

/***********仪表盘功能开始************/
export default function DashboardPage() {
  return (
    <Layout curActive="/dashboard">
      <main style={{padding: 16}}>
        <Typography.Title level={3} style={{marginTop: 0}}>
          仪表盘
        </Typography.Title>

        <Card>
          <Typography.Text type="secondary">
            开发中：后续展示最近变更、最近测试、最近生成、最近备份时间。
          </Typography.Text>
        </Card>
      </main>
    </Layout>
  );
}
/***********仪表盘功能结束************/