'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {Button, Card, Checkbox, Drawer, Form, Input, Space, Table, Typography, message} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import Layout from '@/components/Layout';
import ProjectScopeBar, {type ProjectScope} from '@/components/ProjectScopeBar';
import {db} from '@/db';
import type {ModuleRecord, ProjectRecord} from '@/db/schema';
import {uid} from '@/utils/id';

/***********模块管理页面开始************/
export default function ModulesPage() {
  const [list, setList] = useState<ModuleRecord[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [scope, setScope] = useState<ProjectScope>({projectId: '', includeGlobal: true});

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ModuleRecord | null>(null);
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
      ? await db.modules.where('projectId').anyOf([s.projectId, 'global']).sortBy('updatedAt')
      : await db.modules.where('projectId').equals(s.projectId).sortBy('updatedAt');

    setList(rows.reverse());
  };
  /***********加载列表结束************/

  useEffect(() => {
    loadProjectsAndInitScope();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /***********打开新建/编辑抽屉开始************/
  const openCreate = () => {
    setEditing(null);
    setSaveToGlobal(false);
    form.resetFields();
    form.setFieldsValue({
      name: '',
      description: '',
      relatedFiles: '',
      relatedFields: '',
      relatedApis: ''
    });
    setOpen(true);
  };

  const openEdit = (row: ModuleRecord) => {
    setEditing(row);
    setSaveToGlobal(row.projectId === 'global');
    form.resetFields();
    form.setFieldsValue({
      name: row.name,
      description: row.description ?? '',
      relatedFiles: row.relatedFiles.join('\n'),
      relatedFields: row.relatedFields.join('\n'),
      relatedApis: row.relatedApis.join('\n')
    });
    setOpen(true);
  };
  /***********打开新建/编辑抽屉结束************/

  /***********保存模块开始************/
  const onSubmit = async () => {
    if (!scope.projectId && !editing) {
      message.error('请先选择项目');
      return;
    }

    const values = await form.validateFields();
    const now = Date.now();

    const toLines = (s: string) =>
      String(s || '')
        .split('\n')
        .map((x) => x.trim())
        .filter(Boolean);

    const projectId = editing ? editing.projectId : saveToGlobal ? 'global' : scope.projectId;

    const payload = {
      projectId,
      name: String(values.name || '').trim(),
      description: String(values.description || '').trim(),
      relatedFiles: toLines(values.relatedFiles),
      relatedFields: toLines(values.relatedFields),
      relatedApis: toLines(values.relatedApis),
      updatedAt: now
    };

    if (!payload.name) {
      message.error('模块名不能为空');
      return;
    }

    if (editing) {
      await db.modules.update(editing.id, payload);
      message.success('已更新模块');
    } else {
      const row: ModuleRecord = {
        id: uid('mod'),
        createdAt: now,
        ...payload
      };
      await db.modules.add(row);
      message.success('已创建模块');
    }

    setOpen(false);
    await reload();
  };
  /***********保存模块结束************/

  /***********删除模块开始************/
  const onDelete = async (row: ModuleRecord) => {
    await db.modules.delete(row.id);
    message.success('已删除模块');
    await reload();
  };
  /***********删除模块结束************/

  const projectNameMap = useMemo(() => {
    const m = new Map<string, string>();
    projects.forEach((p) => m.set(p.id, p.name));
    return m;
  }, [projects]);

  const columns: ColumnsType<ModuleRecord> = useMemo(
    () => [
      {
        title: '来源',
        dataIndex: 'projectId',
        key: 'projectId',
        width: 160,
        render: (pid: string) => projectNameMap.get(pid) || pid
      },
      {title: '模块名', dataIndex: 'name', key: 'name'},
      {title: '描述', dataIndex: 'description', key: 'description', ellipsis: true},
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
    <Layout curActive="/modules">
      <Typography.Title level={3} style={{marginTop: 0}}>
        模块管理
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
        title="模块列表"
        extra={
          <Button type="primary" onClick={openCreate} disabled={!scope.projectId}>
            新建模块
          </Button>
        }
      >
        <Table rowKey="id" columns={columns} dataSource={list} pagination={{pageSize: 10}} />
      </Card>

      <Drawer
        title={editing ? '编辑模块' : '新建模块'}
        width={560}
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
          <Form.Item label="模块名" name="name" rules={[{required: true, message: '请输入模块名'}]}>
            <Input />
          </Form.Item>

          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="相关文件（每行一个）" name="relatedFiles">
            <Input.TextArea rows={4} placeholder="例如：src/app/[locale]/modules/ModulesPage.tsx" />
          </Form.Item>

          <Form.Item label="相关字段（每行一个）" name="relatedFields">
            <Input.TextArea rows={4} placeholder="例如：user.create_time" />
          </Form.Item>

          <Form.Item label="相关接口（每行一个）" name="relatedApis">
            <Input.TextArea rows={4} placeholder="例如：GET /api/users" />
          </Form.Item>
        </Form>
      </Drawer>
    </Layout>
  );
}
/***********模块管理页面结束************/