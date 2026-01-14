import type {ChangeRecord, ModuleRecord, StandardRecord, TemplateRecord, TestRecord} from '@/db/schema';

/***********Builder 输出生成开始************/
export type BuildBlockResult = {
  key: string;
  title: string;
  enabled: boolean;
  markdown: string;
};

export type BuildResult = {
  blocks: BuildBlockResult[];
  mergedMarkdown: string;
};

function mdList(items: string[]) {
  const xs = (items || []).filter(Boolean);
  if (!xs.length) return '-（无）';
  return xs.map((x) => `- ${x}`).join('\n');
}

export function buildMarkdown(params: {
  template: TemplateRecord;
  module?: ModuleRecord;
  changes: ChangeRecord[];
  tests: TestRecord[];
  standards: StandardRecord[];
}) : BuildResult {
  const {template, module, changes, tests, standards} = params;

  const moduleRefs = module
    ? {
        files: module.relatedFiles || [],
        fields: module.relatedFields || [],
        apis: module.relatedApis || []
      }
    : {files: [], fields: [], apis: []};

  const changeRefs = {
    files: Array.from(new Set(changes.flatMap((c) => c.affectedFiles || []))),
    fields: Array.from(new Set(changes.flatMap((c) => c.affectedFields || []))),
    apis: Array.from(new Set(changes.flatMap((c) => c.affectedApis || [])))
  };

  const mergedRefs = {
    files: Array.from(new Set([...moduleRefs.files, ...changeRefs.files])),
    fields: Array.from(new Set([...moduleRefs.fields, ...changeRefs.fields])),
    apis: Array.from(new Set([...moduleRefs.apis, ...changeRefs.apis]))
  };

  const changeSummary = changes.map((c) => `### ${c.title}\n\n**摘要：**\n${mdList(c.summaryItems)}\n\n**解决：**\n${mdList(c.problemsSolvedItems)}`).join('\n\n');

  const testSummary = tests
    .map((t) => `### ${t.title}\n\n- 结论：${t.conclusion}\n- 反馈原文：\n${t.feedbackRaw ? `\n> ${t.feedbackRaw.split('\n').join('\n> ')}` : '-（无）'}\n\n- 后续动作：\n${mdList(t.followUpActions)}`)
    .join('\n\n');

  const standardsSummary = standards.map((s) => `### ${s.title}\n\n**摘要：** ${s.summary || '（无）'}`).join('\n\n');

  const dbChecklist = changes
    .filter((c) => c.type === 'create_table' || c.type === 'alter_table')
    .map((c) => {
      const d = c.dbChecklist;
      return `### ${c.title}\n\n- create_time: ${d?.hasCreateTime ? '✅' : '❌'}\n- update_time: ${d?.hasUpdateTime ? '✅' : '❌'}\n- create_by: ${d?.hasCreateBy ? '✅' : '❌'}\n- update_by: ${d?.hasUpdateBy ? '✅' : '❌'}\n- 中间表: ${d?.isJunctionTable ? '是（放宽）' : '否'}\n- 备注: ${d?.notes || '（无）'}`;
    })
    .join('\n\n');

  const blocks: BuildBlockResult[] = (template.blocks || []).map((b) => {
    if (!b.enabled) {
      return {key: b.key, title: b.title, enabled: false, markdown: ''};
    }

    let body = '';
    switch (b.key) {
      case 'background':
        body = `${b.content || ''}\n\n- 目标：整理并输出一份可复制的开发提示词与变更说明（v1）。`.trim();
        break;
      case 'relatedModules':
        body = module ? `- 当前模块：${module.name}\n- 描述：${module.description || '（无）'}` : '-（未选择模块）';
        break;
      case 'relatedRefs':
        body =
          `${b.content || ''}\n\n` +
          `#### 合并引用（模块级 + 变更级）\n` +
          `**相关文件：**\n${mdList(mergedRefs.files)}\n\n` +
          `**相关字段：**\n${mdList(mergedRefs.fields)}\n\n` +
          `**相关接口：**\n${mdList(mergedRefs.apis)}`;
        break;
      case 'changeSummary':
        body = changeSummary || '-（未选择变更）';
        break;
      case 'dbChecklist':
        body = dbChecklist || '-（未选择 DB 相关变更）';
        break;
      case 'testFeedback':
        body = testSummary || '-（未选择测试记录）';
        break;
      case 'standards':
        body = `${b.content || ''}\n\n${standardsSummary || '-（未选择规范）'}`.trim();
        break;
      case 'requirements':
        body = b.content || '-（未填写输出要求，可在模板中配置）';
        break;
      default:
        body = b.content || '';
    }

    const md = `## ${b.title}\n\n${body}\n`;
    return {key: b.key, title: b.title, enabled: true, markdown: md};
  });

  const mergedMarkdown = blocks.filter((x) => x.enabled).map((x) => x.markdown.trim()).join('\n\n') + '\n';
  return {blocks, mergedMarkdown};
}
/***********Builder 输出生成结束************/