import type {ProjectRecord} from '@/db/schema';

/***********项目表单转换开始************/
export type ProjectFormValues = {
  name: string;
  category: string;
  status: ProjectRecord['status'];

  frontendStack: string;
  backendStack: string;

  description?: string;
  summary?: string;
  businessValue?: string;

  gitUrl?: string;
  gitAccessToken?: string;
  gitNotes?: string;

  tags: string; // 逗号分隔
  contacts: ProjectRecord['contacts'];

  /***********架构信息（用于匹配规范）开始************/
  frontendFramework?: string;     // 单选（和你的 schema 一致）
  backendFramework?: string;      // 单选
  frontendLanguage?: string;      // 单选
  backendLanguage?: string;       // 单选
  dbType?: string;                // 单选
  apiStyle?: string;              // 单选
  repoLayoutNotes?: string;
  /***********架构信息（用于匹配规范）结束************/
};

export function recordToProjectFormValues(row: ProjectRecord): Partial<ProjectFormValues> {
  return {
    ...row,
    tags: (row.tags || []).join(',')
  } as any;
}
/***********项目表单转换结束************/