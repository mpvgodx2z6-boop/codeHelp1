/***********Dexie 数据结构定义开始************/
export const DB_NAME = 'prompt_tool';
export const DB_VERSION = 2; // ✅ 升级版本，原来是 1

export type Id = string;

export type Contact = {
  name: string;
  role?: string;
  phone?: string;
  wechat?: string;
  email?: string;
  notes?: string;
};

export type ProjectRecord = {
  id: Id; // 'global' 为公共库项目，普通项目用 uid('prj')
  name: string;
  category: string; // 项目类别：小程序/官网/管理后台/CRM...
  frontendStack: string; // Next/Vue/React...
  backendStack: string; // Java/Spring/Node/Nest...
  description?: string;
  summary?: string;
  businessValue?: string;

  gitUrl?: string;
  gitAccessToken?: string; // 你选了 A：明文存（务必在规范里写风险）
  gitNotes?: string;

  contacts: Contact[];
  status: 'active' | 'paused' | 'done';
  tags: string[];

  createdAt: number;
  updatedAt: number;
};

export type ModuleRecord = {
  id: Id;
  projectId: Id; // ✅
  name: string;
  description?: string;
  relatedFiles: string[];
  relatedFields: string[];
  relatedApis: string[];
  createdAt: number;
  updatedAt: number;
};

export type StandardRecord = {
  id: Id;
  projectId: Id; // ✅
  title: string;
  tags: string[];
  summary: string;
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
  projectId: Id; // ✅
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
  projectId: Id; // ✅
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
  projectId: Id; // ✅
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
  projectId: Id; // ✅
  title: string;
  description?: string;
  blocks: TemplateBlock[];
  createdAt: number;
  updatedAt: number;
};

export type BuildRecord = {
  id: Id;
  projectId: Id; // ✅
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