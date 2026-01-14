'use client';

import React, {useEffect, useState} from 'react';
import {Button, Card, Space, Typography, Upload, message} from 'antd';
import type {UploadProps} from 'antd';
import Layout from '@/components/Layout';
import {db} from '@/db';
import {downloadJsonFile} from '@/utils/export';

/***********导出中心页面开始************/
export default function ExportPage() {
  const [lastBackupAt, setLastBackupAt] = useState<number | undefined>();

  const reloadMeta = async () => {
    const meta = await db.app_meta.get('meta');
    setLastBackupAt(meta?.lastBackupAt);
  };

  useEffect(() => {
    reloadMeta();
  }, []);

  /***********导出 JSON 开始************/
  const exportJson = async () => {
    const now = new Date();
    const ts =
      `${now.getFullYear()}` +
      `${String(now.getMonth() + 1).padStart(2, '0')}` +
      `${String(now.getDate()).padStart(2, '0')}-` +
      `${String(now.getHours()).padStart(2, '0')}` +
      `${String(now.getMinutes()).padStart(2, '0')}`;

    const data = {
      meta: {
        exportedAt: Date.now(),
        schemaVersion: 1
      },
      modules: await db.modules.toArray(),
      standards: await db.standards.toArray(),
      changes: await db.changes.toArray(),
      tests: await db.tests.toArray(),
      prompts: await db.prompts.toArray(),
      templates: await db.templates.toArray(),
      builds: await db.builds.toArray()
    };

    downloadJsonFile(`prompt-tool-backup-${ts}.json`, data);

    await db.app_meta.put({id: 'meta', schemaVersion: 1, lastBackupAt: Date.now()});
    await reloadMeta();
    message.success('已导出备份');
  };
  /***********导出 JSON 结束************/

  /***********导入 JSON（覆盖）开始************/
  const importJson: UploadProps['beforeUpload'] = async (file) => {
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      await db.transaction('rw', db.modules, db.standards, db.changes, db.tests, db.prompts, db.templates, db.builds, async () => {
        await Promise.all([
          db.modules.clear(),
          db.standards.clear(),
          db.changes.clear(),
          db.tests.clear(),
          db.prompts.clear(),
          db.templates.clear(),
          db.builds.clear()
        ]);

        await Promise.all([
          db.modules.bulkAdd(json.modules || []),
          db.standards.bulkAdd(json.standards || []),
          db.changes.bulkAdd(json.changes || []),
          db.tests.bulkAdd(json.tests || []),
          db.prompts.bulkAdd(json.prompts || []),
          db.templates.bulkAdd(json.templates || []),
          db.builds.bulkAdd(json.builds || [])
        ]);
      });

      await db.app_meta.put({id: 'meta', schemaVersion: 1, lastBackupAt: Date.now()});
      await reloadMeta();
      message.success('导入成功（已覆盖本地数据）');
    } catch (e: any) {
      message.error(`导入失败：${e?.message || 'unknown error'}`);
    }

    return false; // 阻止 Upload 自动上传
  };
  /***********导入 JSON（覆盖）结束************/

  return (
    <Layout curActive="/export">
      <Typography.Title level={3} style={{marginTop: 0}}>
        导出/备份
      </Typography.Title>

      <Card title="JSON 备份（可进 Git）">
        <Space direction="vertical" size={12}>
          <Space>
            <Button type="primary" onClick={exportJson}>
              导出备份（JSON）
            </Button>

            <Upload accept=".json" showUploadList={false} beforeUpload={importJson}>
              <Button>导入备份（覆盖）</Button>
            </Upload>
          </Space>

          <Typography.Text type="secondary">
            最近备份时间：{lastBackupAt ? new Date(lastBackupAt).toLocaleString() : '（无）'}
          </Typography.Text>
        </Space>
      </Card>
    </Layout>
  );
}
/***********导出中心页面结束************/