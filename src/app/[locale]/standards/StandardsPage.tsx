'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Space, Table, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Layout from '@/components/Layout';
import ProjectScopeBar, { type ProjectScope } from '@/components/ProjectScopeBar';
import StandardsEditorDrawer from './StandardsEditorDrawer';
import { db } from '@/db';
import type { ProjectRecord, StandardRecord } from '@/db/schema';
import { uid } from '@/utils/id';
import { splitByLines } from '@/utils/export';
import { toLines } from '@/utils/line';
import { recordToFormValues, type StandardsFormValues } from './standards.form';

/***********规范中心页面开始************/
export default function StandardsPage() {
    const [list, setList] = useState<StandardRecord[]>([]);
    const [projects, setProjects] = useState<ProjectRecord[]>([]);
    const [scopeBar, setScopeBar] = useState<ProjectScope>({ projectId: '', includeGlobal: true });

    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<StandardRecord | null>(null);
    const [saveToGlobal, setSaveToGlobal] = useState(false);
    const [form] = Form.useForm<StandardsFormValues>();

    /***********加载项目与默认 scope 开始************/
    const loadProjectsAndInitScope = async () => {
        const rows = await db.projects.orderBy('updatedAt').reverse().toArray();
        setProjects(rows);

        const first = rows.find((p) => p.id !== 'global');
        if (first && !scopeBar.projectId) {
            const next = { projectId: first.id, includeGlobal: true };
            setScopeBar(next);
            await reload(next);
        } else {
            // 没项目时默认只看 global
            await reload(scopeBar);
        }
    };
    /***********加载项目与默认 scope 结束************/

    /***********加载列表开始************/
    const reload = async (s = scopeBar) => {
        if (!s.projectId) {
            const rows = await db.standards.where('projectId').equals('global').sortBy('updatedAt');
            setList(rows.reverse());
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

    /***********打开新建开始************/
    const openCreate = () => {
        setEditing(null);
        setSaveToGlobal(!scopeBar.projectId);

        form.resetFields();
        form.setFieldsValue({
            title: '',
            scope: 'code',
            level: 'must',
            applies_frontendFrameworks: [],
            applies_backendFrameworks: [],
            applies_languages: [],
            applies_dbTypes: [],
            applies_apiStyles: [],
            applies_onlyWhen: [],
            checklistItems: '',
            content: '',
            api_auth: 'none',
            api_errorStyle: 'code_msg_data',
            api_pagination: 'page_pagesize',
            api_idempotency: 'none',
            api_responseEnvelope: 'envelope_code_msg_data',

            db_namingStyle: 'snake_case',
            db_timeFieldsPolicy: 'must_4_fields',
            db_softDelete: 'none',
            db_indexPolicy: 'by_query',
            db_sharding: 'none',

            sec_tokenStorage: 'httpOnly_cookie',
            sec_secretPolicy: 'never_commit_secrets',
            sec_permissionModel: 'none',
            sec_sensitiveMasking: 'none',
            ui_formStyle: 'antd_form',
            ui_selectStyle: ['enum_as_select', 'min_width_260', 'use_ui_width_constants'],
            ui_tableStyle: ['table_width_reasonable', 'actions_fixed_width']
        });

        setOpen(true);
    };
    /***********打开新建结束************/

    /***********打开编辑开始************/
    const openEdit = (row: StandardRecord) => {
        setEditing(row);
        setSaveToGlobal(row.projectId === 'global');
        form.resetFields();
        form.setFieldsValue(recordToFormValues(row));
        setOpen(true);
    };
    /***********打开编辑结束************/

    /***********保存开始************/
    const onSubmit = async () => {
        const values = await form.validateFields();
        const now = Date.now();

        const chunks = splitByLines(String(values.content || ''), 500);

        const projectId = editing ? editing.projectId : !scopeBar.projectId ? 'global' : saveToGlobal ? 'global' : scopeBar.projectId;

        const scopeValue = values.scope;
        const rules = {
            api: {
                auth: values.api_auth,
                errorStyle: values.api_errorStyle,
                pagination: values.api_pagination,
                idempotency: values.api_idempotency,
                responseEnvelope: values.api_responseEnvelope
            },
            db: {
                namingStyle: values.db_namingStyle,
                timeFieldsPolicy: values.db_timeFieldsPolicy,
                softDelete: values.db_softDelete,
                indexPolicy: values.db_indexPolicy,
                sharding: values.db_sharding
            },
            security: {
                tokenStorage: values.sec_tokenStorage,
                secretPolicy: values.sec_secretPolicy,
                permissionModel: values.sec_permissionModel,
                sensitiveMasking: values.sec_sensitiveMasking
            },
            ui: {
                formStyle: values.ui_formStyle,
                selectStyle: values.ui_selectStyle,
                tableStyle: values.ui_tableStyle
            }
        };

        const payload: Omit<StandardRecord, 'id' | 'createdAt'> = {
            projectId,
            title: String(values.title || '').trim(),

            // v1：你要去掉标签/摘要 => 固定空
            tags: [],
            summary: '',

            scope: scopeValue as any,
            level: values.level as any,

            appliesTo:
                scopeValue === 'code'
                    ? {
                          frontendFrameworks: values.applies_frontendFrameworks || [],
                          backendFrameworks: values.applies_backendFrameworks || [],
                          languages: (values.applies_languages || []) as any,
                          dbTypes: (values.applies_dbTypes || []) as any,
                          apiStyles: (values.applies_apiStyles || []) as any,
                          onlyWhen: (values.applies_onlyWhen || []) as any
                      }
                    : undefined,

            checklistItems: toLines(values.checklistItems),
            contentChunks: chunks,
            updatedAt: now,
            rules: rules
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
            if (!scopeBar.projectId) message.info('当前未选择项目：已保存到公共库（global）');
        }

        setOpen(false);
        await reload();
    };
    /***********保存结束************/

    /***********删除开始************/
    const onDelete = async (row: StandardRecord) => {
        await db.standards.delete(row.id);
        message.success('已删除规范');
        await reload();
    };
    /***********删除结束************/

    const columns: ColumnsType<StandardRecord> = useMemo(
        () => [
            {
                title: '来源',
                dataIndex: 'projectId',
                key: 'projectId',
                width: 180,
                render: (pid: string) => projectNameMap.get(pid) || (pid === 'global' ? '公共库（global）' : pid)
            },
            { title: '标题', dataIndex: 'title', key: 'title' },
            { title: '类型', dataIndex: 'scope', key: 'scope', width: 120, render: (v?: string) => v || '-' },
            { title: '级别', dataIndex: 'level', key: 'level', width: 120, render: (v?: string) => v || '-' },
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
            <Typography.Title level={3} style={{ marginTop: 0 }}>
                规范中心（公共规范优先）
            </Typography.Title>

            <ProjectScopeBar
                value={scopeBar}
                onChange={(v) => {
                    setScopeBar(v);
                    reload(v);
                }}
                allowGlobalToggle
            />

            <Card
                title="规范列表"
                extra={
                    <Button type="primary" onClick={openCreate}>
                        新建规范
                    </Button>
                }
            >
                <Table rowKey="id" columns={columns} dataSource={list} pagination={{ pageSize: 10 }} />
            </Card>

            <StandardsEditorDrawer
                open={open}
                onClose={() => setOpen(false)}
                onSubmit={onSubmit}
                form={form}
                editing={!!editing}
                saveToGlobal={saveToGlobal}
                setSaveToGlobal={setSaveToGlobal}
                canChooseProject={!!scopeBar.projectId}
                sourceText={`当前条目来源：${editing?.projectId === 'global' ? '公共库（global）' : '当前项目'}`}
            />
        </Layout>
    );
}
/***********规范中心页面结束************/
