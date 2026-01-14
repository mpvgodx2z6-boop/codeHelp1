/***********Dexie 数据结构定义开始************/
export const DB_NAME = 'prompt_tool';
export const DB_VERSION = 2;

export type Id = string;

export type Contact = {
  name: string;
  role?: string;
  phone?: string;
  wechat?: string;
  email?: string;
  notes?: string;
};

/***********项目架构枚举定义开始************/
export type ApiStyle = 'rest' | 'graphql' | 'rpc' | 'other';
export type DbType = 'mysql' | 'postgres' | 'sqlite' | 'mongodb' | 'other';
export type Lang = 'ts' | 'js' | 'java' | 'py' | 'go' | 'php' | 'csharp' | 'sql' | 'other';
/***********项目架构枚举定义结束************/

export type ProjectRecord = {
  id: Id; // 'global' 为公共库项目，普通项目用 uid('prj')
  name: string;
  category: string; // 项目类别：小程序/官网/管理后台/CRM...
  frontendStack: string; // Next/Vue/React...
  backendStack: string; // Java/Spring/Node/Nest...
  description?: string;
  summary?: string;
  businessValue?: string;

  /***********项目架构选择字段开始************/
  frontendFramework?: string; // nextjs/react/vue/...
  backendFramework?: string; // springboot/nestjs/express/...
  frontendLanguage?: Lang; // ts/js/...
  backendLanguage?: Lang; // java/ts/...
  dbType?: DbType;
  apiStyle?: ApiStyle;
  repoLayoutNotes?: string; // 单仓/多仓/monorepo 等说明
  /***********项目架构选择字段结束************/

  gitUrl?: string;
  gitAccessToken?: string; // v1 明文存（需在安全规范写明风险）
  gitNotes?: string;

  contacts: Contact[];
  status: 'active' | 'paused' | 'done';
  tags: string[];

  createdAt: number;
  updatedAt: number;
};

export type ModuleRecord = {
  id: Id;
  projectId: Id;
  name: string;
  description?: string;
  relatedFiles: string[];
  relatedFields: string[];
  relatedApis: string[];
  createdAt: number;
  updatedAt: number;
};

/***********规范结构化字段定义开始************/
export type StandardScope =
  | 'general'
  | 'code'
  | 'ui'
  | 'naming'
  | 'api'
  | 'db'
  | 'security'
  | 'testing'
  | 'git'
  | 'prompting';

export type StandardLevel = 'must' | 'should' | 'optional';

export type StandardAppliesTo = {
  frontendFrameworks?: string[];
  backendFrameworks?: string[];
  languages?: Lang[];
  dbTypes?: DbType[];
  apiStyles?: ApiStyle[];
  onlyWhen?: Array<
    | 'new_feature'
    | 'bugfix'
    | 'create_table'
    | 'alter_table'
    | 'new_api'
    | 'refactor'
    | 'doc'
    | 'export'
    | 'security_change'
  >;
};
/***********规范结构化字段定义结束************/

export type StandardRecord = {
  id: Id;
  projectId: Id;
  title: string;
  tags: string[];
  summary: string;

  /***********规范结构化字段开始************/
  scope?: StandardScope;
  level?: StandardLevel;
  appliesTo?: StandardAppliesTo;
  checklistItems?: string[];
  /***********规范结构化字段结束************/
  /***********规则参数（按类型存）开始************/
  rules?: Record<string, any>;
  /***********规则参数（按类型存）结束************/
  contentChunks: string[];
  createdAt: number;
  updatedAt: number;
};

export type DbChecklist = {
  hasCreateTime: boolean;
  hasUpdateTime: boolean;
  hasCreateBy: boolean;
  hasUpdateBy: boolean;
  isJunctionTable: boolean;
  notes?: string;
};

export type ChangeRecord = {
  id: Id;
  projectId: Id;
  title: string;
  moduleId?: Id;
  type: 'feature' | 'fix' | 'create_table' | 'alter_table' | 'doc' | 'refactor';
  summaryItems: string[];
  problemsSolvedItems: string[];
  affectedFiles: string[];
  affectedFields: string[];
  affectedApis: string[];
  dbChecklist?: DbChecklist;
  createdAt: number;
  updatedAt: number;
};

export type TestRecord = {
  id: Id;
  projectId: Id;
  title: string;
  moduleId?: Id;
  relatedChangeId?: Id;
  feedbackRaw: string;
  conclusion: 'pass' | 'fail' | 'blocked' | 'unknown';
  followUpActions: string[];
  createdAt: number;
  updatedAt: number;
};

export type PromptRevision = {
  revId: Id;
  content: string;
  reason: string;
  expectedAvoid: string;
  createdAt: number;
};

export type PromptRecord = {
  id: Id;
  projectId: Id;
  title: string;
  tags: string[];
  content: string;
  revisions: PromptRevision[];
  createdAt: number;
  updatedAt: number;
};

export type TemplateBlock = {
  key: string;
  title: string;
  enabled: boolean;
  content: string;
};

export type TemplateRecord = {
  id: Id;
  projectId: Id;
  title: string;
  description?: string;
  blocks: TemplateBlock[];
  createdAt: number;
  updatedAt: number;
};

export type BuildRecord = {
  id: Id;
  projectId: Id;
  title: string;
  moduleId?: Id;
  changeIds: Id[];
  testIds: Id[];
  standardIds: Id[];
  templateId?: Id;
  outputMarkdown: string;
  createdAt: number;
};

export type AppMetaRecord = {
  id: 'meta';
  schemaVersion: number;
  lastBackupAt?: number;
};
/***********Dexie 数据结构定义结束************/