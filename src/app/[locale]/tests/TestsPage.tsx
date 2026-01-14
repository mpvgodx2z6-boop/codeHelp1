'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {Button, Card, Drawer, Form, Input, Select, Space, Table, Typography, message} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import Layout from '@/components/Layout';
import {db} from '@/db';
import type {ChangeRecord, ModuleRecord, TestRecord} from '@/db/schema';
import {uid} from '@/utils/id';

/***********人工测试页面开始************/
export default function TestsPage() {
  const [list, setList] = useState<TestRecord[]>([]);
  const [modules, setModules] = useState<ModuleRecord[]>([]);
  const [changes, setChanges] = useState<ChangeRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TestRecord | null>(null);
  const [form] = Form.useForm();

  const reload = async () => {
    const [tests, mods, chgs] = await Promise.all([
      db.tests.orderBy('updatedAt').reverse().toArray(),
      db.modules.orderBy('updatedAt').reverse().toArray(),
      db.changes.orderBy('updatedAt').reverse().toArray()
    ]);
    setList(tests);
    setModules(mods);
    setChanges(chgs);
  };

  useEffect(() => {
    reload();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      title: '',
      moduleId: undefined,
      relatedChangeId: undefined,
      feedbackRaw: '',
      conclusion: 'unknown',
      followUpActions: ''
    });
    setOpen(true);
  };

  const openEdit = (row: TestRecord) => {
    setEditing(row);
    form.resetFields();
    form.setFieldsValue({
      title: row.title,
      moduleId: row.moduleId,
      relatedChangeId: row.relatedChangeId,
      feedbackRaw: row.feedbackRaw,
      conclusion: row.conclusion,
      followUpActions: row.followUpActions.join('\n')
    });
    setOpen(true);
  };

  const toLines = (s: string) =>
    String(s || '')
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);

  const onSubmit = async () => {
    const values = await form.validateFields();
    const now = Date.now();

    const payload: Omit<TestRecord, 'id' | 'createdAt'> = {
      title: String(values.title || '').trim(),
      moduleId: values.moduleId,
      relatedChangeId: values.relatedChangeId,
      feedbackRaw: String(values.feedbackRaw || '').trim(),
      conclusion: values.conclusion,
      followUpActions: toLines(values.followUpActions),
      updatedAt: now
    };

    if (!payload.title) {
      message.error('标题不能为空');
      return;
    }

    if (editing) {
      await db.tests.update(editing.id, payload);
      message.success('已更新测试记录');
    } else {
      const row: TestRecord = {
        id: uid('tst'),
        createdAt: now,
        ...payload
      };
      await db.tests.add(row);
      message.success('已创建测试记录');
    }

    setOpen(false);
    await reload();
  };

  const onDelete = async (row: TestRecord) => {
    await db.tests.delete(row.id);
    message.success('已删除测试记录');
    await reload();
  };

  const moduleNameMap = useMemo(() => {
    const m = new Map<string, string>();
    modules.forEach((x) => m.set(x.id, x.name));
    return m;
  }, [modules]);

  const changeTitleMap = useMemo(() => {
    const m = new Map<string, string>();
    changes.forEach((x) => m.set(x.id, x.title));
    return m;
  }, [changes]);

  const columns: ColumnsType<TestRecord> = useMemo(
    () => [
      {title: '标题', dataIndex: 'title', key: 'title'},
      {
        title: '结论',
        dataIndex: 'conclusion',
        key: 'conclusion',
        width: 120
      },
      {
        title: '模块',
        dataIndex: 'moduleId',
        key: 'moduleId',
        width: 160,
        render: (id?: string) => (id ? moduleNameMap.get(id) || id : '-')
      },
      {
        title: '关联变更',
        dataIndex: 'relatedChangeId',
        key: 'relatedChangeId',
        width: 220,
        render: (id?: string) => (id ? changeTitleMap.get(id) || id : '-')
      },
      {
        title: '更新时间',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 180,
        render: (v: number) => new Date(v).toLocaleString()
      },
      {
        title: '操作',
        key: 'actions',
        width: 220,
        render: (_, row) => (
          <Space>
            <Button size="small" onClick={() => openEdit(row)}>
              编辑
            </Button>
            <Button size="small" danger onClick={() => onDelete(row)}>
              ���除
            </Button>
          </Space>
        )
      }
    ],
    [moduleNameMap, changeTitleMap]
  );

  return (
    <Layout curActive="/tests">
      <Typography.Title level={3} style={{marginTop: 0}}>
        人工测试记录
      </Typography.Title>

      <Card
        title="测试记录列表"
        extra={
          <Button type="primary" onClick={openCreate}>
            新建测试记录
          </Button>
        }
      >
        <Table rowKey="id" columns={columns} dataSource={list} pagination={{pageSize: 10}} />
      </Card>

      <Drawer
        title={editing ? '编辑测试记录' : '新建测试记录'}
        width={820}
        open={open}
        onClose={() => setOpen(false)}
        extra={
          <Space>
            <Button onClick={() => setOpen(false)}>取消</Button>
            <Button type="primary" onClick={onSubmit}>
              保存
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="标题" name="title" rules={[{required: true, message: '请输入标题'}]}>
            <Input />
          </Form.Item>

          <Form.Item label="模块（可选）" name="moduleId">
            <Select allowClear options={modules.map((m) => ({label: m.name, value: m.id}))} />
          </Form.Item>

          <Form.Item label="关联变更（建议选择，用于闭环）" name="relatedChangeId">
            <Select allowClear options={changes.map((c) => ({label: c.title, value: c.id}))} />
          </Form.Item>

          <Form.Item label="反馈原文（必须保留原话）" name="feedbackRaw">
            <Input.TextArea rows={6} />
          </Form.Item>

          <Form.Item label="结论" name="conclusion" rules={[{required: true}]}>
            <Select
              options={[
                {label: 'unknown', value: 'unknown'},
                {label: 'pass', value: 'pass'},
                {label: 'fail', value: 'fail'},
                {label: 'blocked', value: 'blocked'}
              ]}
            />
          </Form.Item>

          <Form.Item label="后续动作（每行一条）" name="followUpActions">
            <Input.TextArea rows={5} placeholder="例如：补充提示词；修复 builder 输出；更新规范条目等" />
          </Form.Item>
        </Form>
      </Drawer>
    </Layout>
  );
}
/***********人工测试页面结束************/