'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message
} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import Layout from '@/components/Layout';
import {db} from '@/db';
import type {Contact, ProjectRecord} from '@/db/schema';
import {uid} from '@/utils/id';

/***********项目管理页面开始************/
export default function ProjectsPage() {
  const [list, setList] = useState<ProjectRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProjectRecord | null>(null);
  const [form] = Form.useForm();

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
      frontendStack: '',
      backendStack: '',
      description: '',
      summary: '',
      businessValue: '',
      gitUrl: '',
      gitAccessToken: '',
      gitNotes: '',
      status: 'active',
      tags: '',
      contacts: []
    });
    setOpen(true);
  };

  const openEdit = (row: ProjectRecord) => {
    setEditing(row);
    form.resetFields();
    form.setFieldsValue({
      ...row,
      tags: (row.tags || []).join(',')
    });
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
      frontendStack: String(values.frontendStack || '').trim(),
      backendStack: String(values.backendStack || '').trim(),
      description: String(values.description || '').trim(),
      summary: String(values.summary || '').trim(),
      businessValue: String(values.businessValue || '').trim(),
      gitUrl: String(values.gitUrl || '').trim(),
      gitAccessToken: String(values.gitAccessToken || ''),
      gitNotes: String(values.gitNotes || '').trim(),
      contacts: (values.contacts || []) as Contact[],
      status: values.status,
      tags,
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
        width: 240,
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

      <Drawer
        title={editing ? '编辑项目' : '新建项目'}
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
        <Form layout="vertical" form={form}>
          <Card size="small" title="基础信息" style={{marginBottom: 12}}>
            <Form.Item label="名称" name="name" rules={[{required: true, message: '请输入项目名称'}]}>
              <Input />
            </Form.Item>

            <Space style={{width: '100%'}} size={12} wrap>
              <Form.Item label="项目类别" name="category" style={{flex: 1}}>
                <Input placeholder="例如：管理后台/小程序/官网/CRM" />
              </Form.Item>

              <Form.Item label="状态" name="status" style={{width: 200}} rules={[{required: true}]}>
                <Select
                  options={[
                    {label: 'active', value: 'active'},
                    {label: 'paused', value: 'paused'},
                    {label: 'done', value: 'done'}
                  ]}
                />
              </Form.Item>
            </Space>

            <Space style={{width: '100%'}} size={12} wrap>
              <Form.Item label="前端架构" name="frontendStack" style={{flex: 1}}>
                <Input placeholder="例如：Next.js 14 + antd5" />
              </Form.Item>

              <Form.Item label="后端架构" name="backendStack" style={{flex: 1}}>
                <Input placeholder="例如：Java SpringBoot / Node NestJS" />
              </Form.Item>
            </Space>

            <Form.Item label="说明" name="description">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item label="摘要" name="summary">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item label="商业价值" name="businessValue">
              <Input.TextArea rows={3} />
            </Form.Item>

            <Form.Item label="标签（英文逗号分隔）" name="tags">
              <Input placeholder="例如：外包,长期维护,高风险" />
            </Form.Item>
          </Card>

          <Card size="small" title="Git 信息（v1 明文存储：注意风险）" style={{marginBottom: 12}}>
            <Form.Item label="Git 地址" name="gitUrl">
              <Input placeholder="https://..." />
            </Form.Item>
            <Form.Item label="Git 访问密钥/Token（明文）" name="gitAccessToken">
              <Input.Password placeholder="v1 临时方案：仅本地保存" />
            </Form.Item>
            <Form.Item label="Git 备注" name="gitNotes">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Card>

          <Card size="small" title="项目联系人">
            <Form.List name="contacts">
              {(fields, {add, remove}) => (
                <div>
                  <Button onClick={() => add({name: '', role: '', phone: '', wechat: '', email: '', notes: ''})}>
                    新增联系人
                  </Button>

                  <div style={{marginTop: 12}}>
                    {fields.map((field) => (
                      <Card key={field.key} size="small" style={{marginBottom: 12}}>
                        <Space direction="vertical" style={{width: '100%'}}>
                          <Space style={{width: '100%'}} wrap>
                            <Form.Item
                              label="姓名"
                              name={[field.name, 'name']}
                              rules={[{required: true, message: '请输入姓名'}]}
                              style={{flex: 1}}
                            >
                              <Input />
                            </Form.Item>
                            <Form.Item label="角色" name={[field.name, 'role']} style={{flex: 1}}>
                              <Input placeholder="客户/产品/技术/财务..." />
                            </Form.Item>
                          </Space>

                          <Space style={{width: '100%'}} wrap>
                            <Form.Item label="电话" name={[field.name, 'phone']} style={{flex: 1}}>
                              <Input />
                            </Form.Item>
                            <Form.Item label="微信" name={[field.name, 'wechat']} style={{flex: 1}}>
                              <Input />
                            </Form.Item>
                            <Form.Item label="邮箱" name={[field.name, 'email']} style={{flex: 1}}>
                              <Input />
                            </Form.Item>
                          </Space>

                          <Form.Item label="备注" name={[field.name, 'notes']}>
                            <Input.TextArea rows={2} />
                          </Form.Item>

                          <Button danger onClick={() => remove(field.name)}>
                            删除联系人
                          </Button>
                        </Space>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </Form.List>
          </Card>
        </Form>
      </Drawer>
    </Layout>
  );
}
/***********项目管理页面结束************/