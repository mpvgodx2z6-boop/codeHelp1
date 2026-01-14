'use client';

import React, {useEffect, useState} from 'react';
import {Card, Space, Typography} from 'antd';
import Layout from '@/components/Layout';
import {db} from '@/db';

/***********仪表盘页面开始************/
export default function DashboardPage() {
  const [stats, setStats] = useState({
    lastChangeAt: undefined as number | undefined,
    lastTestAt: undefined as number | undefined,
    lastBuildAt: undefined as number | undefined,
    lastBackupAt: undefined as number | undefined
  });

  const reload = async () => {
    const [lastChange, lastTest, lastBuild, meta] = await Promise.all([
      db.changes.orderBy('updatedAt').last(),
      db.tests.orderBy('updatedAt').last(),
      db.builds.orderBy('createdAt').last(),
      db.app_meta.get('meta')
    ]);

    setStats({
      lastChangeAt: lastChange?.updatedAt,
      lastTestAt: lastTest?.updatedAt,
      lastBuildAt: lastBuild?.createdAt,
      lastBackupAt: meta?.lastBackupAt
    });
  };

  useEffect(() => {
    reload();
  }, []);

  const fmt = (t?: number) => (t ? new Date(t).toLocaleString() : '（无）');

  return (
    <Layout curActive="/dashboard">
      <Typography.Title level={3} style={{marginTop: 0}}>
        仪表盘
      </Typography.Title>

      <Space direction="vertical" style={{width: '100%'}} size={12}>
        <Card title="最近变更">{fmt(stats.lastChangeAt)}</Card>
        <Card title="最近测试">{fmt(stats.lastTestAt)}</Card>
        <Card title="最近生成">{fmt(stats.lastBuildAt)}</Card>
        <Card title="最近备份">{fmt(stats.lastBackupAt)}</Card>
      </Space>
    </Layout>
  );
}
/***********仪表盘页面结束************/