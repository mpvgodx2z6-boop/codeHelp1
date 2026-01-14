'use client';

import React, { useMemo, useState } from 'react';
import { Button, Card, Drawer, Form, Input, Select, Space, Typography, message } from 'antd';
import type { FormInstance } from 'antd';
import type { ProjectRecord } from '@/db/schema';
import type { ProjectFormValues } from './projects.form';
import {
    PROJECT_STATUS_OPTIONS,
    PROJECT_CATEGORY_OPTIONS,
    UI_WIDTH,
    FRONTEND_FRAMEWORK_OPTIONS,
    BACKEND_FRAMEWORK_OPTIONS,
    LANGUAGE_OPTIONS,
    DB_TYPE_OPTIONS,
    API_STYLE_OPTIONS
} from '@/app/constants/projectOptions';

import { copyGlobalStandardsToProject } from './project-standards.actions';
import ProjectContactsForm from './ProjectContactsForm';

/***********项目编辑抽屉开始************/
export default function ProjectsEditorDrawer(props: {
    open: boolean;
    onClose: () => void;
    onSubmit: () => void;

    form: FormInstance<ProjectFormValues>;
    editing: ProjectRecord | null;
}) {
    const { open, onClose, onSubmit, form, editing } = props;
    const [copying, setCopying] = useState(false);

    const isGlobal = editing?.id === 'global';
    const title = useMemo(() => (editing ? '编辑项目' : '新建项目'), [editing]);

    /***********复制公共规范到项目开始************/
    const onCopyStandards = async () => {
        if (!editing || !editing.id || editing.id === 'global') {
            message.error('请先保存一个非 global 项目，再复制公共规范');
            return;
        }
        setCopying(true);
        try {
            const r = await copyGlobalStandardsToProject({
                projectId: editing.id,
                scopes: ['code', 'api', 'db', 'security', 'prompting', 'git', 'testing', 'naming', 'general']
            });
            message.success(`已复制公共规范到项目：新增 ${r.inserted} 条，跳过 ${r.skipped} 条`);
            message.info('现在可去【规范中心】切换到该项目范围，单独修改项目规范（不影响 global）');
        } finally {
            setCopying(false);
        }
    };
    /***********复制公共规范到项目结束************/

    return (
        <Drawer
            title={title}
            width={920}
            open={open}
            onClose={onClose}
            extra={
                <Space>
                    <Button onClick={onClose}>取消</Button>
                    <Button type="primary" onClick={onSubmit}>
                        保存
                    </Button>
                </Space>
            }
        >
            {editing ? (
                <Card size="small" style={{ marginBottom: 12 }}>
                    <Space wrap>
                        <Typography.Text type="secondary">项目ID：{editing.id}</Typography.Text>
                        {isGlobal ? <Typography.Text type="secondary">（global 公共库项目）</Typography.Text> : null}
                        {!isGlobal ? (
                            <Button loading={copying} onClick={onCopyStandards}>
                                一键复制公共规范到本项目（用于项目内改写）
                            </Button>
                        ) : null}
                    </Space>
                </Card>
            ) : (
                <Card size="small" style={{ marginBottom: 12 }}>
                    <Typography.Text type="secondary">提示：保存项目后，可“一键复制公共规范到本项目”，再在规范中心进行项目级修改（不影响 global）。</Typography.Text>
                </Card>
            )}

            <Form layout="vertical" form={form}>
                <Card size="small" title="基础信息" style={{ marginBottom: 12 }}>
                    <Form.Item label="名称" name="name" rules={[{ required: true, message: '请输入项目名称' }]}>
                        <Input />
                    </Form.Item>

                    <Space style={{ width: '100%' }} size={12} wrap>
                        <Form.Item label="项目类别" name="category" style={{ flex: 1 }} rules={[{ required: true, message: '请选择项目类别' }]}>
                            <Select showSearch optionFilterProp="label" options={[...PROJECT_CATEGORY_OPTIONS]} style={{ width: UI_WIDTH.selectLg }} />
                        </Form.Item>

                        <Form.Item label="状态" name="status" style={{ width: UI_WIDTH.selectMd }} rules={[{ required: true }]}>
                            <Select options={[...PROJECT_STATUS_OPTIONS]} />
                        </Form.Item>
                    </Space>

                    <Space style={{ width: '100%' }} size={12} wrap>
                        <Form.Item label="前端架构（自由描述）" name="frontendStack" style={{ flex: 1 }}>
                            <Input placeholder="例如：Next.js 14 + antd5" />
                        </Form.Item>

                        <Form.Item label="后端架构（自由描述）" name="backendStack" style={{ flex: 1 }}>
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

                <Card size="small" title="架构信息（用于匹配规范；选项与规范中心一致）" style={{ marginBottom: 12 }}>
                    <Space style={{ width: '100%' }} size={12} wrap>
                        <Form.Item label="前端框架" name="frontendFramework" style={{ flex: 1 }}>
                            <Select allowClear options={[...FRONTEND_FRAMEWORK_OPTIONS]} style={{ width: UI_WIDTH.selectXl }} />
                        </Form.Item>

                        <Form.Item label="后端框架" name="backendFramework" style={{ flex: 1 }}>
                            <Select allowClear options={[...BACKEND_FRAMEWORK_OPTIONS]} style={{ width: UI_WIDTH.selectXl }} />
                        </Form.Item>
                    </Space>
                    <Space style={{ width: '100%' }} size={12} wrap>
                        <Form.Item label="前端语言" name="frontendLanguage" style={{ flex: 1 }}>
                            <Select allowClear options={[...LANGUAGE_OPTIONS]} style={{ width: UI_WIDTH.selectLg }} />
                        </Form.Item>

                        <Form.Item label="后端语言" name="backendLanguage" style={{ flex: 1 }}>
                            <Select allowClear options={[...LANGUAGE_OPTIONS]} style={{ width: UI_WIDTH.selectLg }} />
                        </Form.Item>
                    </Space>
                    <Space style={{ width: '100%' }} size={12} wrap>
                        <Form.Item label="DB 类型" name="dbType" style={{ flex: 1 }}>
                            <Select allowClear options={[...DB_TYPE_OPTIONS]} style={{ width: UI_WIDTH.selectLg }} />
                        </Form.Item>

                        <Form.Item label="接口风格" name="apiStyle" style={{ flex: 1 }}>
                            <Select allowClear options={[...API_STYLE_OPTIONS]} style={{ width: UI_WIDTH.selectLg }} />
                        </Form.Item>
                    </Space>
                    <Form.Item label="仓库/代码布局说明" name="repoLayoutNotes">
                        <Input.TextArea rows={2} placeholder="例如：monorepo / 单仓前后端分目录 / 多仓等" />
                    </Form.Item>
                </Card>

                <Card size="small" title="Git 信息（v1 明文存储：注意风险）" style={{ marginBottom: 12 }}>
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

                <ProjectContactsForm />
            </Form>
        </Drawer>
    );
}
/***********项目编辑抽屉结束************/
