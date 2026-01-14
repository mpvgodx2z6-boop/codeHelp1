import {db} from '@/db';
import type {StandardRecord} from '@/db/schema';
import {uid} from '@/utils/id';

/***********复制公共规范到项目开始************/
export async function copyGlobalStandardsToProject(params: {
  projectId: string;
  scopes?: Array<'general' | 'code' | 'naming' | 'api' | 'db' | 'security' | 'testing' | 'git' | 'prompting'>;
}) {
  const {projectId, scopes} = params;

  const global = await db.standards.where('projectId').equals('global').toArray();
  const target = await db.standards.where('projectId').equals(projectId).toArray();

  const targetKeySet = new Set(target.map((s) => `${s.scope || ''}__${s.title.trim()}`));

  const selected = scopes?.length ? global.filter((s) => scopes.includes((s.scope || 'general') as any)) : global;

  const now = Date.now();
  const toInsert: StandardRecord[] = [];

  for (const s of selected) {
    const key = `${s.scope || ''}__${s.title.trim()}`;
    if (targetKeySet.has(key)) continue;

    toInsert.push({
      ...s,
      id: uid('std'),
      projectId,
      createdAt: now,
      updatedAt: now
    });
  }

  if (toInsert.length) {
    await db.standards.bulkAdd(toInsert);
  }

  return {inserted: toInsert.length, skipped: selected.length - toInsert.length};
}
/***********复制公共规范到项目结束************/