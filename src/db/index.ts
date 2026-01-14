import Dexie, {Table} from 'dexie';
import {
  DB_NAME,
  DB_VERSION,
  type ProjectRecord,
  type ModuleRecord,
  type StandardRecord,
  type ChangeRecord,
  type TestRecord,
  type PromptRecord,
  type TemplateRecord,
  type BuildRecord,
  type AppMetaRecord
} from './schema';

/***********Dexie 数据库实例开始************/
export class PromptToolDB extends Dexie {
  projects!: Table<ProjectRecord, string>;
  modules!: Table<ModuleRecord, string>;
  standards!: Table<StandardRecord, string>;
  changes!: Table<ChangeRecord, string>;
  tests!: Table<TestRecord, string>;
  prompts!: Table<PromptRecord, string>;
  templates!: Table<TemplateRecord, string>;
  builds!: Table<BuildRecord, string>;
  app_meta!: Table<AppMetaRecord, string>;

  constructor() {
    super(DB_NAME);

    this.version(DB_VERSION).stores({
      projects: 'id, name, status, updatedAt',
      modules: 'id, projectId, [projectId+updatedAt], name, updatedAt',
      standards: 'id, projectId, [projectId+updatedAt], title, updatedAt',
      changes: 'id, projectId, [projectId+updatedAt], type, moduleId, updatedAt',
      tests: 'id, projectId, [projectId+updatedAt], conclusion, moduleId, relatedChangeId, updatedAt',
      prompts: 'id, projectId, [projectId+updatedAt], title, updatedAt',
      templates: 'id, projectId, [projectId+updatedAt], title, updatedAt',
      builds: 'id, projectId, [projectId+createdAt], createdAt',
      app_meta: 'id'
    });
  }
}

export const db = new PromptToolDB();
/***********Dexie 数据库实例结束************/