'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {Button, Card, Form, Space, Table, Tag, Typography, message} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import Layout from '@/components/Layout';
import ProjectsEditorDrawer from './ProjectsEditorDrawer';
import {db} from '@/db';
import type {Contact, ProjectRecord} from '@/db/schema';
import {uid} from '@/utils/id';
import {recordToProjectFormValues, type ProjectFormValues} from './projects.form';

/***********项目管理页面开始************/
export default function ProjectsPage() {
  const [list, setList] = useState<ProjectRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectRecord | null>(null);
  const [form] = Form.useForm<ProjectFormValues>();

  /***********初始化 global 项目开始************/
  const ensureGlobal = async () => {
    const exists = await db.projects.get('global');
    if (exists) return;

    const now = Date.now();
    const row: ProjectRecord = {
      id: 'global',
      name: '公共库（global）',
      category: 'global',
      frontendStack: '',
      backendStack: '',
      description: '用于跨项目复用：公共规范/公共模块/公共提示词',
      summary: '',
      businessValue: '',
      gitUrl: '',
      gitAccessToken: '',
      gitNotes: '',
      contacts: [],
      status: 'active',
      tags: ['global'],
      createdAt: now,
      updatedAt: now
    };

    await db.projects.add(row);
  };
  /***********初始化 global 项目结束************/

  /***********加载列表开始************/
  const reload = async () => {
    const rows = await db.projects.orderBy('updatedAt').reverse().toArray();
    setList(rows);
  };
  /***********加载列表结束************/

  useEffect(() => {
    (async () => {
      await ensureGlobal();
      await reload();
    })();
  }, []);

  /***********新建/编辑开始************/
  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      name: '',
      category: '',
      status: 'active',
      frontendStack: '',
      backendStack: '',
      description: '',
      summary: '',
      businessValue: '',
      gitUrl: '',
      gitAccessToken: '',
      gitNotes: '',
      tags: '',
      contacts: [],

      frontendFramework: undefined,
      backendFramework: undefined,
      frontendLanguage: undefined,
      backendLanguage: undefined,
      dbType: undefined,
      apiStyle: undefined,
      repoLayoutNotes: ''
    });
    setOpen(true);
  };

  const openEdit = (row: ProjectRecord) => {
    setEditing(row);
    form.resetFields();
    form.setFieldsValue(recordToProjectFormValues(row));
    setOpen(true);
  };
  /***********新建/编辑结束************/

  /***********保存开始************/
  const onSubmit = async () => {
    const values = await form.validateFields();
    const now = Date.now();

    const tags = String(values.tags || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean);

    const payload: Omit<ProjectRecord, 'id' | 'createdAt'> = {
      name: String(values.name || '').trim(),
      category: String(values.category || '').trim(),
      status: values.status,

      frontendStack: String(values.frontendStack || '').trim(),
      backendStack: String(values.backendStack || '').trim(),
      description: String(values.description || '').trim(),
      summary: String(values.summary || '').trim(),
      businessValue: String(values.businessValue || '').trim(),

      gitUrl: String(values.gitUrl || '').trim(),
      gitAccessToken: String(values.gitAccessToken || ''),
      gitNotes: String(values.gitNotes || '').trim(),

      contacts: (values.contacts || []) as Contact[],
      tags,

      /***********架构信息保存开始************/
      frontendFramework: values.frontendFramework || undefined,
      backendFramework: values.backendFramework || undefined,
      frontendLanguage: values.frontendLanguage as any,
      backendLanguage: values.backendLanguage as any,
      dbType: values.dbType as any,
      apiStyle: values.apiStyle as any,
      repoLayoutNotes: String(values.repoLayoutNotes || '').trim(),
      /***********架构信息保存结束************/

      updatedAt: now
    };

    if (!payload.name) {
      message.error('项目名称不能为空');
      return;
    }

    if (editing) {
      await db.projects.update(editing.id, payload);
      message.success('已更新项目');
    } else {
      const row: ProjectRecord = {
        id: uid('prj'),
        createdAt: now,
        ...payload
      };
      await db.projects.add(row);
      message.success('已创建项目');
    }

    setOpen(false);
    await reload();
  };
  /***********保存结束************/

  /***********删除开始************/
  const onDelete = async (row: ProjectRecord) => {
    if (row.id === 'global') {
      message.error('global 公共库项目不允许删除');
      return;
    }
    await db.projects.delete(row.id);
    message.success('已删除项目');
    await reload();
  };
  /***********删除结束************/

  const columns: ColumnsType<ProjectRecord> = useMemo(
    () => [
      {title: '名称', dataIndex: 'name', key: 'name'},
      {title: '类别', dataIndex: 'category', key: 'category', width: 120},
      {title: '前端', dataIndex: 'frontendStack', key: 'frontendStack', width: 140, ellipsis: true},
      {title: '后端', dataIndex: 'backendStack', key: 'backendStack', width: 140, ellipsis: true},
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (v: ProjectRecord['status']) => (v === 'active' ? 'active' : v)
      },
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
        title: '更新时间',
        dataIndex: 'updatedAt',
        key: 'updatedAt',
        width: 180,
        render: (v: number) => new Date(v).toLocaleString()
      },
      {
        title: '操作',
        key: 'actions',
        width: 260,
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
    []
  );

  return (
    <Layout curActive="/projects">
      <Typography.Title level={3} style={{marginTop: 0}}>
        项目管理
      </Typography.Title>

      <Card
        title="项目列表"
        extra={
          <Button type="primary" onClick={openCreate}>
            新建项目
          </Button>
        }
      >
        <Table rowKey="id" columns={columns} dataSource={list} pagination={{pageSize: 10}} />
      </Card>

      <ProjectsEditorDrawer open={open} onClose={() => setOpen(false)} onSubmit={onSubmit} form={form} editing={editing} />
    </Layout>
  );
}
/***********项目管理页面结束************/