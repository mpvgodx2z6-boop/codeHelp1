'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {Button, Card, Checkbox, Drawer, Form, Input, Space, Table, Tag, Typography, message} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import Layout from '@/components/Layout';
import ProjectScopeBar, {type ProjectScope} from '@/components/ProjectScopeBar';
import {db} from '@/db';
import type {ProjectRecord, StandardRecord} from '@/db/schema';
import {uid} from '@/utils/id';
import {splitByLines} from '@/utils/export';

/***********规范中心页面开始************/
export default function StandardsPage() {
  const [list, setList] = useState<StandardRecord[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [scope, setScope] = useState<ProjectScope>({projectId: '', includeGlobal: true});

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StandardRecord | null>(null);
  const [saveToGlobal, setSaveToGlobal] = useState(false);
  const [form] = Form.useForm();

  /***********加载项目与默认 scope 开始************/
  const loadProjectsAndInitScope = async () => {
    const rows = await db.projects.orderBy('updatedAt').reverse().toArray();
    setProjects(rows);

    const first = rows.find((p) => p.id !== 'global');
    if (first && !scope.projectId) {
      const next = {projectId: first.id, includeGlobal: true};
      setScope(next);
      await reload(next);
    }
  };
  /***********加载项目与默认 scope 结束************/

  /***********加载列表开始************/
  const reload = async (s = scope) => {
    if (!s.projectId) {
      setList([]);
      return;
    }

    const rows = s.includeGlobal
      ? await db.standards.where('projectId').anyOf([s.projectId, 'global']).sortBy('updatedAt')
      : await db.standards.where('projectId').equals(s.projectId).sortBy('updatedAt');

    setList(rows.reverse());
  };
  /***********加载列表结束************/

  useEffect(() => {
    loadProjectsAndInitScope();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const projectNameMap = useMemo(() => {
    const m = new Map<string, string>();
    projects.forEach((p) => m.set(p.id, p.name));
    return m;
  }, [projects]);

  const openCreate = () => {
    setEditing(null);
    setSaveToGlobal(false);
    form.resetFields();
    form.setFieldsValue({
      title: '',
      tags: '',
      summary: '',
      content: ''
    });
    setOpen(true);
  };

  const openEdit = (row: StandardRecord) => {
    setEditing(row);
    setSaveToGlobal(row.projectId === 'global');
    form.resetFields();
    form.setFieldsValue({
      title: row.title,
      tags: row.tags.join(','),
      summary: row.summary,
      content: row.contentChunks.join('\n')
    });
    setOpen(true);
  };

  const onSubmit = async () => {
    if (!scope.projectId && !editing) {
      message.error('请先选择项目');
      return;
    }

    const values = await form.validateFields();
    const now = Date.now();

    const tags = String(values.tags || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

    const content = String(values.content || '');
    const chunks = splitByLines(content, 500);

    const projectId = editing ? editing.projectId : saveToGlobal ? 'global' : scope.projectId;

    const payload = {
      projectId,
      title: String(values.title || '').trim(),
      tags,
      summary: String(values.summary || '').trim(),
      contentChunks: chunks,
      updatedAt: now
    };

    if (!payload.title) {
      message.error('标题不能为空');
      return;
    }

    if (editing) {
      await db.standards.update(editing.id, payload);
      message.success('已更新规范');
    } else {
      const row: StandardRecord = {
        id: uid('std'),
        createdAt: now,
        ...payload
      };
      await db.standards.add(row);
      message.success('已创建规范');
    }

    setOpen(false);
    await reload();
  };

  const onDelete = async (row: StandardRecord) => {
    await db.standards.delete(row.id);
    message.success('已删除规范');
    await reload();
  };

  const columns: ColumnsType<StandardRecord> = useMemo(
    () => [
      {
        title: '来源',
        dataIndex: 'projectId',
        key: 'projectId',
        width: 160,
        render: (pid: string) => projectNameMap.get(pid) || pid
      },
      {title: '标题', dataIndex: 'title', key: 'title'},
      {
        title: '标签',
        dataIndex: 'tags',
        key: 'tags',
        width: 220,
        render: (tags: string[]) => (
          <Space wrap>
            {(tags || []).slice(0, 6).map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </Space>
        )
      },
      {title: '摘要', dataIndex: 'summary', key: 'summary', ellipsis: true},
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
    [projectNameMap]
  );

  return (
    <Layout curActive="/standards">
      <Typography.Title level={3} style={{marginTop: 0}}>
        规范中心
      </Typography.Title>

      <ProjectScopeBar
        value={scope}
        onChange={(v) => {
          setScope(v);
          reload(v);
        }}
        allowGlobalToggle
      />

      <Card
        title="规范列表"
        extra={
          <Button type="primary" onClick={openCreate} disabled={!scope.projectId}>
            新建规范
          </Button>
        }
      >
        <Table rowKey="id" columns={columns} dataSource={list} pagination={{pageSize: 10}} />
      </Card>

      <Drawer
        title={editing ? '编辑规范' : '新建规范'}
        width={780}
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
        {!editing ? (
          <Card size="small" style={{marginBottom: 12}}>
            <Checkbox checked={saveToGlobal} onChange={(e) => setSaveToGlobal(e.target.checked)}>
              保存到公共库（global）
            </Checkbox>
          </Card>
        ) : (
          <Card size="small" style={{marginBottom: 12}}>
            <Typography.Text type="secondary">
              当前条目来源：{editing.projectId === 'global' ? '公共库（global）' : '当前项目'}
            </Typography.Text>
          </Card>
        )}

        <Form layout="vertical" form={form}>
          <Form.Item label="标题" name="title" rules={[{required: true, message: '请输入标题'}]}>
            <Input />
          </Form.Item>

          <Form.Item label="标签（英文逗号分隔）" name="tags">
            <Input placeholder="例如：code,security,db" />
          </Form.Item>

          <Form.Item label="摘要（用于 Builder 默认展示摘要）" name="summary">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item label="正文（可多行，导出时会自动按 500 行拆分）" name="content">
            <Input.TextArea rows={14} />
          </Form.Item>
        </Form>
      </Drawer>
    </Layout>
  );
}
/***********规范中心页面结束************/