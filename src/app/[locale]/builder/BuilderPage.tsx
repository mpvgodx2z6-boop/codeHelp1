'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Button, Card, Divider, Drawer, Select, Space, Tabs, Typography, message } from 'antd';
import Layout from '@/components/Layout';
import { db } from '@/db';
import type { BuildRecord, ChangeRecord, ModuleRecord, StandardRecord, TemplateRecord, TestRecord } from '@/db/schema';
import { uid } from '@/utils/id';
import { buildMarkdown } from './build';
import { downloadTextFile, splitByLines } from '@/utils/export';
import {dedupeById} from '@/utils/array';
/***********生成器页面开始************/
export default function BuilderPage() {
    const [modules, setModules] = useState<ModuleRecord[]>([]);
    const [changes, setChanges] = useState<ChangeRecord[]>([]);
    const [tests, setTests] = useState<TestRecord[]>([]);
    const [standards, setStandards] = useState<StandardRecord[]>([]);
    const [templates, setTemplates] = useState<TemplateRecord[]>([]);

    const [moduleId, setModuleId] = useState<string | undefined>();
    const [changeIds, setChangeIds] = useState<string[]>([]);
    const [testIds, setTestIds] = useState<string[]>([]);
    const [standardIds, setStandardIds] = useState<string[]>([]);
    const [templateId, setTemplateId] = useState<string | undefined>();

    const [resultMd, setResultMd] = useState('');
    const [openMerged, setOpenMerged] = useState(false);

    const reload = async () => {
        const [mods, chgs, tsts, stds, tpls] = await Promise.all([
            db.modules.orderBy('updatedAt').reverse().toArray(),
            db.changes.orderBy('updatedAt').reverse().toArray(),
            db.tests.orderBy('updatedAt').reverse().toArray(),
            db.standards.orderBy('updatedAt').reverse().toArray(),
            db.templates.orderBy('updatedAt').reverse().toArray()
        ]);

        setModules(mods);
        setChanges(chgs);
        setTests(tsts);
        setStandards(stds);
        setTemplates(tpls);

        if (!templateId && tpls.length) setTemplateId(tpls[0].id);
    };

    useEffect(() => {
        reload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selected = useMemo(() => {
        const mod = modules.find((m) => m.id === moduleId);
        const chgs = changes.filter((c) => changeIds.includes(c.id));
        const tsts = tests.filter((t) => testIds.includes(t.id));
        const stds = standards.filter((s) => standardIds.includes(s.id));
        const tpl = templates.find((t) => t.id === templateId);
        return { mod, chgs, tsts, stds, tpl };
    }, [modules, moduleId, changes, changeIds, tests, testIds, standards, standardIds, templates, templateId]);

    /***********生成开始************/
    const onGenerate = async () => {
        if (!selected.tpl) {
            message.error('请先创建并选择一个模板');
            return;
        }
        // 伪代码：在 onGenerate 里生成 built 前加入
        const globalPromptingMust = await db.standards
            .where('projectId')
            .equals('global')
            .filter((s) => s.scope === 'prompting' && s.level === 'must')
            .toArray();

        const standardsForBuild = dedupeById([...selected.stds, ...globalPromptingMust]);

        const built = buildMarkdown({
            template: selected.tpl,
            module: selected.mod,
            changes: selected.chgs,
            tests: selected.tsts,
            standards: standardsForBuild // ✅ 用这个
        });

        setResultMd(built.mergedMarkdown);

        // 写入 builds 历史（v1 简化：每次覆盖 title）
        const now = Date.now();
        const row: BuildRecord = {
            id: uid('bld'),
            title: `build-${new Date(now).toLocaleString()}`,
            moduleId,
            changeIds,
            testIds,
            standardIds,
            templateId,
            outputMarkdown: built.mergedMarkdown,
            createdAt: now
        };
        await db.builds.add(row);

        message.success('已生成并保存到生成历史（IndexedDB）');
    };
    /***********生成结束************/

    /***********复制/导出开始************/
    const copyText = async (text: string) => {
        await navigator.clipboard.writeText(text);
        message.success('已复制');
    };

    const exportMergedMd = () => {
        const parts = splitByLines(resultMd, 500);
        if (parts.length === 1) {
            downloadTextFile(`build-merged.md`, resultMd, 'text/markdown;charset=utf-8');
            return;
        }
        parts.forEach((p, idx) => {
            downloadTextFile(`build-merged.part-${idx + 1}.md`, p, 'text/markdown;charset=utf-8');
        });
    };
    /***********复制/导出结束************/

    const blocks = useMemo(() => {
        if (!selected.tpl) return [];
        const built = buildMarkdown({
            template: selected.tpl,
            module: selected.mod,
            changes: selected.chgs,
            tests: selected.tsts,
            standards: selected.stds
        });
        return built.blocks.filter((b) => b.enabled);
    }, [selected]);

    return (
        <Layout curActive="/builder">
            <Typography.Title level={3} style={{ marginTop: 0 }}>
                生成器（8 块输出）
            </Typography.Title>

            <Card title="选择器">
                <Space direction="vertical" style={{ width: '100%' }} size={12}>
                    <Space wrap>
                        <span>模板：</span>
                        <Select style={{ width: 320 }} value={templateId} onChange={setTemplateId} options={templates.map((t) => ({ label: t.title, value: t.id }))} />

                        <span>模块：</span>
                        <Select style={{ width: 260 }} allowClear value={moduleId} onChange={setModuleId} options={modules.map((m) => ({ label: m.name, value: m.id }))} />
                    </Space>

                    <Space wrap>
                        <span>变更：</span>
                        <Select mode="multiple" style={{ width: 520 }} value={changeIds} onChange={setChangeIds} options={changes.map((c) => ({ label: c.title, value: c.id }))} />
                    </Space>

                    <Space wrap>
                        <span>测试：</span>
                        <Select mode="multiple" style={{ width: 520 }} value={testIds} onChange={setTestIds} options={tests.map((t) => ({ label: t.title, value: t.id }))} />
                    </Space>

                    <Space wrap>
                        <span>规范：</span>
                        <Select
                            mode="multiple"
                            style={{ width: 520 }}
                            value={standardIds}
                            onChange={setStandardIds}
                            options={standards.map((s) => ({ label: s.title, value: s.id }))}
                        />
                    </Space>

                    <Space>
                        <Button type="primary" onClick={onGenerate}>
                            生成并保存
                        </Button>
                        <Button disabled={!resultMd} onClick={() => setOpenMerged(true)}>
                            查看合并稿
                        </Button>
                    </Space>
                </Space>
            </Card>

            <Divider />

            <Card title="输出块（每块可复制/导出）">
                <Tabs
                    items={blocks.map((b) => ({
                        key: b.key,
                        label: b.title,
                        children: (
                            <div>
                                <Space style={{ marginBottom: 12 }}>
                                    <Button onClick={() => copyText(b.markdown)}>复制本块</Button>
                                    <Button onClick={() => downloadTextFile(`block-${b.key}.md`, b.markdown, 'text/markdown;charset=utf-8')}>导出本块 md</Button>
                                </Space>
                                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{b.markdown}</pre>
                            </div>
                        )
                    }))}
                />
            </Card>

            <Drawer
                title="合并稿（可复制/可导出，自动 500 行拆分）"
                width={980}
                open={openMerged}
                onClose={() => setOpenMerged(false)}
                extra={
                    <Space>
                        <Button onClick={() => copyText(resultMd)} disabled={!resultMd}>
                            一键复制
                        </Button>
                        <Button onClick={exportMergedMd} disabled={!resultMd}>
                            一键导出 md
                        </Button>
                    </Space>
                }
            >
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{resultMd || '（尚未生成）'}</pre>
            </Drawer>
        </Layout>
    );
}
/***********生成器页面结束************/
