'use client';

import React, {useEffect, useMemo, useState} from 'react';
import {Button, Card, Drawer, Form, Input, Space, Switch, Table, Typography, message} from 'antd';
import type {ColumnsType} from 'antd/es/table';
import Layout from '@/components/Layout';
import {db} from '@/db';
import type {TemplateBlock, TemplateRecord} from '@/db/schema';
import {uid} from '@/utils/id';

/***********模板默认 8 块开始************/
const DEFAULT_BLOCKS: TemplateBlock[] = [
  {key: 'background', title: '1. 背景/目标', enabled: true, content: ''},
  {key: 'relatedModules', title: '2. 相关模块', enabled: true, content: ''},
  {key: 'relatedRefs', title: '3. 相关文件/字段/接口', enabled: true, content: ''},
  {key: 'changeSummary', title: '4. 变更摘要', enabled: true, content: ''},
  {key: 'dbChecklist', title: '5. DB 检查清单', enabled: true, content: ''},
  {key: 'testFeedback', title: '6. 测试反馈', enabled: true, content: ''},
  {key: 'standards', title: '7. 适用规范', enabled: true, content: ''},
  {key: 'requirements', title: '8. 提示词清单/输出要求', enabled: true, content: ''}
];
/***********模板默认 8 块结束************/

/***********模板管理页面开始************/
export default function TemplatesPage() {
  const [list, setList] = useState<TemplateRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TemplateRecord | null>(null);
  const [form] = Form.useForm();

  const reload = async () => {
    const rows = await db.templates.orderBy('updatedAt').reverse().toArray();
    setList(rows);
  };

  useEffect(() => {
    reload();
  }, []);

  /***********新建/编辑开始************/
  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      title: '',
      description: '',
      blocks: DEFAULT_BLOCKS
    });
    setOpen(true);
  };

  const openEdit = (row: TemplateRecord) => {
    setEditing(row);
    form.resetFields();
    form.setFieldsValue({
      title: row.title,
      description: row.description ?? '',
      blocks: row.blocks
    });
    setOpen(true);
  };
  /***********新建/编辑结束************/

  /***********保存开始************/
  const onSubmit = async () => {
    const values = await form.validateFields();
    const now = Date.now();

    const payload = {
      title: String(values.title || '').trim(),
      description: String(values.description || '').trim(),
      blocks: (values.blocks || []) as TemplateBlock[],
      updatedAt: now
    };

    if (!payload.title) {
      message.error('模板标题不能为空');
      return;
    }
    if (!payload.blocks?.length) {
      message.error('模板块不能为空');
      return;
    }

    if (editing) {
      await db.templates.update(editing.id, payload);
      message.success('已更新模板');
    } else {
      const row: TemplateRecord = {
        id: uid('tpl'),
        createdAt: now,
        ...payload
      };
      await db.templates.add(row);
      message.success('已创建模板');
    }

    setOpen(false);
    await reload();
  };
  /***********保存结束************/

  /***********删除开始************/
  const onDelete = async (row: TemplateRecord) => {
    await db.templates.delete(row.id);
    message.success('已删除模板');
    await reload();
  };
  /***********删除结束************/

  const columns: ColumnsType<TemplateRecord> = useMemo(
    () => [
      {title: '模板标题', dataIndex: 'title', key: 'title'},
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
    []
  );

  return (
    <Layout curActive="/templates">
      <Typography.Title level={3} style={{marginTop: 0}}>
        模板管理
      </Typography.Title>

      <Card
        title="模板列表"
        extra={
          <Button type="primary" onClick={openCreate}>
            新建模板
          </Button>
        }
      >
        <Table rowKey="id" columns={columns} dataSource={list} pagination={{pageSize: 10}} />
      </Card>

      <Drawer
        title={editing ? '编辑模板' : '新建模板'}
        width={720}
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
        <Form layout="vertical" form={form} initialValues={{blocks: DEFAULT_BLOCKS}}>
          <Form.Item label="模板标题" name="title" rules={[{required: true, message: '请输入模板标题'}]}>
            <Input />
          </Form.Item>

          <Form.Item label="描述" name="description">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.List name="blocks">
            {(fields) => (
              <div>
                <Typography.Title level={5}>模板块配置（顺序即输出顺序）</Typography.Title>

                {fields.map((field, idx) => (
                  <Card key={field.key} style={{marginBottom: 12}} size="small" title={`块 ${idx + 1}`}>
                    <Space direction="vertical" style={{width: '100%'}}>
                      <Form.Item name={[field.name, 'key']} label="key（固定标识）">
                        <Input disabled />
                      </Form.Item>

                      <Form.Item name={[field.name, 'title']} label="标题">
                        <Input />
                      </Form.Item>

                      <Form.Item name={[field.name, 'enabled']} label="启用" valuePropName="checked">
                        <Switch />
                      </Form.Item>

                      <Form.Item name={[field.name, 'content']} label="块说明（可选）">
                        <Input.TextArea rows={3} placeholder="这里可写该块的写作要求/注意事项/默认提示词。" />
                      </Form.Item>
                    </Space>
                  </Card>
                ))}
              </div>
            )}
          </Form.List>
        </Form>
      </Drawer>
    </Layout>
  );
}
/***********模板管理页面结束************/