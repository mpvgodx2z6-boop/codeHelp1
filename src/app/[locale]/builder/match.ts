import type {ProjectRecord, StandardRecord} from '@/db/schema';

/***********规范匹配工具开始************/
function includesAny(target: string | undefined, rules?: string[]) {
  if (!rules || rules.length === 0) return true;
  if (!target) return false;
  return rules.map((x) => x.toLowerCase()).includes(String(target).toLowerCase());
}

function includesAnyInList(target: string | undefined, rules?: string[]) {
  // 同 includesAny，语义更清晰
  return includesAny(target, rules);
}

export function standardMatchesProject(std: StandardRecord, project?: ProjectRecord) {
  // global 规范也可能不限制 appliesTo
  const a = std.appliesTo;
  if (!a) return true;
  if (!project) return true;

  const okFrontend = includesAnyInList(project.frontendFramework, a.frontendFrameworks);
  const okBackend = includesAnyInList(project.backendFramework, a.backendFrameworks);
  const okLangFront = !a.languages?.length || includesAny(project.frontendLanguage as any, a.languages as any);
  const okLangBack = !a.languages?.length || includesAny(project.backendLanguage as any, a.languages as any);
  const okDb = !a.dbTypes?.length || includesAny(project.dbType as any, a.dbTypes as any);
  const okApi = !a.apiStyles?.length || includesAny(project.apiStyle as any, a.apiStyles as any);

  return okFrontend && okBackend && okLangFront && okLangBack && okDb && okApi;
}
/***********规范匹配工具结束************/