'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {Button, Card, Checkbox, Drawer, Form, Input, Space, Table, Tag, Typography, message} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import Layout from '@/components/Layout';
import ProjectScopeBar, {type ProjectScope} from '@/components/ProjectScopeBar';
import {db} from '@/db';
import type {ProjectRecord, PromptRecord} from '@/db/schema';
import {uid} from '@/utils/id';

/***********提示词库页面开始************/
export default function PromptsPage() {
  const [list, setList] = useState<PromptRecord[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [scope, setScope] = useState<ProjectScope>({projectId: '', includeGlobal: true});

  const [open, setOpen] = useState(false);
  const [openRev, setOpenRev] = useState(false);
  const [editing, setEditing] = useState<PromptRecord | null>(null);
  const [revTarget, setRevTarget] = useState<PromptRecord | null>(null);
  const [saveToGlobal, setSaveToGlobal] = useState(false);

  const [form] = Form.useForm();
  const [revForm] = Form.useForm();

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
      ? await db.prompts.where('projectId').anyOf([s.projectId, 'global']).sortBy('updatedAt')
      : await db.prompts.where('projectId').equals(s.projectId).sortBy('updatedAt');

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
      content: ''
    });
    setOpen(true);
  };

  const openEdit = (row: PromptRecord) => {
    setEditing(row);
    setSaveToGlobal(row.projectId === 'global');
    form.resetFields();
    form.setFieldsValue({
      title: row.title,
      tags: row.tags.join(','),
      content: row.content
    });
    setOpen(true);
  };

  const openAddRevision = (row: PromptRecord) => {
    setRevTarget(row);
    revForm.resetFields();
    revForm.setFieldsValue({
      content: row.content,
      reason: '',
      expectedAvoid: ''
    });
    setOpenRev(true);
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

    const projectId = editing ? editing.projectId : saveToGlobal ? 'global' : scope.projectId;

    const payload = {
      projectId,
      title: String(values.title || '').trim(),
      tags,
      content: String(values.content || ''),
      updatedAt: now
    };

    if (!payload.title) {
      message.error('标题不能为空');
      return;
    }

    if (editing) {
      await db.prompts.update(editing.id, payload);
      message.success('已更新提示词（未记录 revision）');
    } else {
      const row: PromptRecord = {
        id: uid('prm'),
        projectId,
        title: payload.title,
        tags: payload.tags,
        content: payload.content,
        revisions: [],
        createdAt: now,
        updatedAt: now
      };
      await db.prompts.add(row);
      message.success('已创建提示词');
    }

    setOpen(false);
    await reload();
  };

  /***********新增 revision 开始************/
  const onAddRevision = async () => {
    const values = await revForm.validateFields();
    if (!revTarget) return;

    const now = Date.now();
    const newRev = {
      revId: uid('rev'),
      content: String(values.content || ''),
      reason: String(values.reason || '').trim(),
      expectedAvoid: String(values.expectedAvoid || '').trim(),
      createdAt: now
    };

    const nextRevisions = [newRev, ...(revTarget.revisions || [])];
    await db.prompts.update(revTarget.id, {
      content: newRev.content,
      revisions: nextRevisions,
      updatedAt: now
    });

    message.success('已新增 revision');
    setOpenRev(false);
    await reload();
  };
  /***********新增 revision 结束************/

  const onDelete = async (row: PromptRecord) => {
    await db.prompts.delete(row.id);
    message.success('已删除提示词');
    await reload();
  };

  const columns: ColumnsType<PromptRecord> = useMemo(
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
      {
        title: 'revision 数',
        key: 'revCount',
        width: 110,
        render: (_, row) => row.revisions?.length || 0
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
        width: 320,
        render: (_, row) => (
          <Space>
            <Button size="small" onClick={() => openEdit(row)}>
              编辑
            </Button>
            <Button size="small" onClick={() => openAddRevision(row)}>
              记录 revision
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
    <Layout curActive="/prompts">
      <Typography.Title level={3} style={{marginTop: 0}}>
        提示词库
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
        title="提示词列表"
        extra={
          <Button type="primary" onClick={openCreate} disabled={!scope.projectId}>
            新建提示词
          </Button>
        }
      >
        <Table rowKey="id" columns={columns} dataSource={list} pagination={{pageSize: 10}} />
      </Card>

      <Drawer
        title={editing ? '编辑提示词' : '新建提示词'}
        width={860}
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
              保存到公共库（global��
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
            <Input />
          </Form.Item>

          <Form.Item label="内容" name="content">
            <Input.TextArea rows={14} />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        title="记录 revision（强化记忆）"
        width={860}
        open={openRev}
        onClose={() => setOpenRev(false)}
        extra={
          <Space>
            <Button onClick={() => setOpenRev(false)}>取消</Button>
            <Button type="primary" onClick={onAddRevision}>
              保存 revision
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={revForm}>
          <Form.Item label="新内容" name="content" rules={[{required: true, message: '请输入内容'}]}>
            <Input.TextArea rows={10} />
          </Form.Item>

          <Form.Item label="修改原因" name="reason" rules={[{required: true, message: '请输入修改原因'}]}>
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="期望避免的错误模式（expectedAvoid）"
            name="expectedAvoid"
            rules={[{required: true, message: '请输入期望避免的错误模式'}]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>

        {revTarget?.revisions?.length ? (
          <Card style={{marginTop: 16}} title="历史 revisions（最新在前）">
            {revTarget.revisions.slice(0, 10).map((r) => (
              <Card key={r.revId} size="small" style={{marginBottom: 12}} title={new Date(r.createdAt).toLocaleString()}>
                <Typography.Paragraph>
                  <strong>原因：</strong>
                  {r.reason}
                </Typography.Paragraph>
                <Typography.Paragraph>
                  <strong>避免：</strong>
                  {r.expectedAvoid}
                </Typography.Paragraph>
              </Card>
            ))}
          </Card>
        ) : null}
      </Drawer>
    </Layout>
  );
}
/***********提示词库页面结束************/