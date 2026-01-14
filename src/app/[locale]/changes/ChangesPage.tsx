'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {Button, Card, Drawer, Form, Input, Select, Space, Switch, Table, Typography, message} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import Layout from '@/components/Layout';
import {db} from '@/db';
import type {ChangeRecord, ModuleRecord} from '@/db/schema';
import {uid} from '@/utils/id';

/***********变更记录页面开始************/
export default function ChangesPage() {
  const [list, setList] = useState<ChangeRecord[]>([]);
  const [modules, setModules] = useState<ModuleRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ChangeRecord | null>(null);
  const [form] = Form.useForm();

  const reload = async () => {
    const [changes, mods] = await Promise.all([
      db.changes.orderBy('updatedAt').reverse().toArray(),
      db.modules.orderBy('updatedAt').reverse().toArray()
    ]);
    setList(changes);
    setModules(mods);
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
      type: 'feature',
      summaryItems: '',
      problemsSolvedItems: '',
      affectedFiles: '',
      affectedFields: '',
      affectedApis: '',
      db_hasCreateTime: true,
      db_hasUpdateTime: true,
      db_hasCreateBy: true,
      db_hasUpdateBy: true,
      db_isJunctionTable: false,
      db_notes: ''
    });
    setOpen(true);
  };

  const openEdit = (row: ChangeRecord) => {
    setEditing(row);
    form.resetFields();
    form.setFieldsValue({
      title: row.title,
      moduleId: row.moduleId,
      type: row.type,
      summaryItems: row.summaryItems.join('\n'),
      problemsSolvedItems: row.problemsSolvedItems.join('\n'),
      affectedFiles: row.affectedFiles.join('\n'),
      affectedFields: row.affectedFields.join('\n'),
      affectedApis: row.affectedApis.join('\n'),
      db_hasCreateTime: row.dbChecklist?.hasCreateTime ?? true,
      db_hasUpdateTime: row.dbChecklist?.hasUpdateTime ?? true,
      db_hasCreateBy: row.dbChecklist?.hasCreateBy ?? true,
      db_hasUpdateBy: row.dbChecklist?.hasUpdateBy ?? true,
      db_isJunctionTable: row.dbChecklist?.isJunctionTable ?? false,
      db_notes: row.dbChecklist?.notes ?? ''
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

    const payload: Omit<ChangeRecord, 'id' | 'createdAt'> = {
      title: String(values.title || '').trim(),
      moduleId: values.moduleId,
      type: values.type,
      summaryItems: toLines(values.summaryItems),
      problemsSolvedItems: toLines(values.problemsSolvedItems),
      affectedFiles: toLines(values.affectedFiles),
      affectedFields: toLines(values.affectedFields),
      affectedApis: toLines(values.affectedApis),
      dbChecklist: {
        hasCreateTime: !!values.db_hasCreateTime,
        hasUpdateTime: !!values.db_hasUpdateTime,
        hasCreateBy: !!values.db_hasCreateBy,
        hasUpdateBy: !!values.db_hasUpdateBy,
        isJunctionTable: !!values.db_isJunctionTable,
        notes: String(values.db_notes || '').trim()
      },
      updatedAt: now
    };

    if (!payload.title) {
      message.error('标题不能为空');
      return;
    }

    if (editing) {
      await db.changes.update(editing.id, payload);
      message.success('已更新变更');
    } else {
      const row: ChangeRecord = {
        id: uid('chg'),
        createdAt: now,
        ...payload
      };
      await db.changes.add(row);
      message.success('已创建变更');
    }

    setOpen(false);
    await reload();
  };

  const onDelete = async (row: ChangeRecord) => {
    await db.changes.delete(row.id);
    message.success('已删除变更');
    await reload();
  };

  const moduleNameMap = useMemo(() => {
    const m = new Map<string, string>();
    modules.forEach((x) => m.set(x.id, x.name));
    return m;
  }, [modules]);

  const columns: ColumnsType<ChangeRecord> = useMemo(
    () => [
      {title: '标题', dataIndex: 'title', key: 'title'},
      {
        title: '类型',
        dataIndex: 'type',
        key: 'type',
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
              删除
            </Button>
          </Space>
        )
      }
    ],
    [moduleNameMap]
  );

  return (
    <Layout curActive="/changes">
      <Typography.Title level={3} style={{marginTop: 0}}>
        变更记录
      </Typography.Title>

      <Card
        title="变更列表"
        extra={
          <Button type="primary" onClick={openCreate}>
            新建变更
          </Button>
        }
      >
        <Table rowKey="id" columns={columns} dataSource={list} pagination={{pageSize: 10}} />
      </Card>

      <Drawer
        title={editing ? '编辑变更' : '新建变更'}
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

          <Form.Item label="所属模块（可选）" name="moduleId">
            <Select
              allowClear
              options={modules.map((m) => ({label: m.name, value: m.id}))}
              placeholder="选择模块"
            />
          </Form.Item>

          <Form.Item label="类型" name="type" rules={[{required: true}]}>
            <Select
              options={[
                {label: 'feature', value: 'feature'},
                {label: 'fix', value: 'fix'},
                {label: 'create_table', value: 'create_table'},
                {label: 'alter_table', value: 'alter_table'},
                {label: 'doc', value: 'doc'},
                {label: 'refactor', value: 'refactor'}
              ]}
            />
          </Form.Item>

          <Form.Item label="变更摘要（每行一条）" name="summaryItems">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item label="解决问题（每行一条）" name="problemsSolvedItems">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Card size="small" title="影响范围（每行一条）" style={{marginBottom: 12}}>
            <Form.Item label="影响文件" name="affectedFiles">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item label="影响字段" name="affectedFields">
              <Input.TextArea rows={3} />
            </Form.Item>
            <Form.Item label="影响接口" name="affectedApis">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Card>

          <Card size="small" title="DB 检查清单（create/alter table 时重点）">
            <Space direction="vertical" style={{width: '100%'}}>
              <Form.Item label="create_time" name="db_hasCreateTime" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item label="update_time" name="db_hasUpdateTime" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item label="create_by" name="db_hasCreateBy" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item label="update_by" name="db_hasUpdateBy" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item label="是否中间表（可放宽）" name="db_isJunctionTable" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item label="补充说明" name="db_notes">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Space>
          </Card>
        </Form>
      </Drawer>
    </Layout>
  );
}
/***********变更记录页面结束************/