import type { StandardRecord } from '@/db/schema';

/***********规范表单转换开始************/
export type StandardsFormValues = {
  title : string;
  scope : string;
  level : string;

  applies_frontendFrameworks : string[];
  applies_backendFrameworks : string[];
  applies_languages : string[];
  applies_dbTypes : string[];
  applies_apiStyles : string[];
  applies_onlyWhen : string[];
  /***********API 规则字段开始************/
  api_auth : string;
  api_errorStyle : string;
  api_pagination : string;
  api_idempotency : string;
  api_responseEnvelope : string;
  /***********API 规则字段结束************/
  /***********UI 组件规范字段开始************/
  ui_formStyle : string;
  ui_selectStyle : string[];
  ui_tableStyle : string[];
  /***********UI 组件规范字段结束************/
  /***********DB 规则字段开始************/
  db_namingStyle : string;
  db_timeFieldsPolicy : string;
  db_softDelete : string;
  db_indexPolicy : string;
  db_sharding : string;
  /***********DB 规则字段结束************/

  /***********安全规则字段开始************/
  sec_tokenStorage : string;
  sec_secretPolicy : string;
  sec_permissionModel : string;
  sec_sensitiveMasking : string;
  /***********安全规则字段结束************/

  checklistItems : string; // 仍用多行文本（每行一条）
  content : string;
};

export function recordToFormValues(row : StandardRecord) : Partial<StandardsFormValues> {
  const rules = (row.rules || {}) as any;

  return {
    title: row.title,
    scope: row.scope ?? 'code',
    level: row.level ?? 'must',
    applies_frontendFrameworks: row.appliesTo?.frontendFrameworks ?? [],
    applies_backendFrameworks: row.appliesTo?.backendFrameworks ?? [],
    applies_languages: (row.appliesTo?.languages as any) ?? [],
    applies_dbTypes: (row.appliesTo?.dbTypes as any) ?? [],
    applies_apiStyles: (row.appliesTo?.apiStyles as any) ?? [],
    applies_onlyWhen: (row.appliesTo?.onlyWhen as any) ?? [],

    api_auth: rules.api?.auth ?? 'none',
    api_errorStyle: rules.api?.errorStyle ?? 'code_msg_data',
    api_pagination: rules.api?.pagination ?? 'page_pagesize',
    api_idempotency: rules.api?.idempotency ?? 'none',
    api_responseEnvelope: rules.api?.responseEnvelope ?? 'envelope_code_msg_data',

    db_namingStyle: rules.db?.namingStyle ?? 'snake_case',
    db_timeFieldsPolicy: rules.db?.timeFieldsPolicy ?? 'must_4_fields',
    db_softDelete: rules.db?.softDelete ?? 'none',
    db_indexPolicy: rules.db?.indexPolicy ?? 'by_query',
    db_sharding: rules.db?.sharding ?? 'none',

    sec_tokenStorage: rules.security?.tokenStorage ?? 'httpOnly_cookie',
    sec_secretPolicy: rules.security?.secretPolicy ?? 'never_commit_secrets',
    sec_permissionModel: rules.security?.permissionModel ?? 'none',
    sec_sensitiveMasking: rules.security?.sensitiveMasking ?? 'none',

    checklistItems: (row.checklistItems || []).join('\n'),
    content: (row.contentChunks || []).join('\n'),
    ui_formStyle: rules.ui?.formStyle ?? 'antd_form',
    ui_selectStyle: rules.ui?.selectStyle ?? ['enum_as_select', 'min_width_260', 'use_ui_width_constants'],
    ui_tableStyle: rules.ui?.tableStyle ?? ['table_width_reasonable', 'actions_fixed_width'],

  };
}
/***********规范表单转换结束************/